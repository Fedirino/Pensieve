const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const Anthropic = require("@anthropic-ai/sdk").default;

const anthropicKey = defineSecret("ANTHROPIC_API_KEY");

// ── Fuzzy title match ───────────────────────────────────────────────
function titlesMatch(a, b) {
  const normalize = (s) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  const na = normalize(a);
  const nb = normalize(b);
  // Either one contains the other, or they share enough words
  if (na.includes(nb) || nb.includes(na)) return true;
  const wordsA = new Set(na.split(" ").filter((w) => w.length > 2));
  const wordsB = new Set(nb.split(" ").filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return false;
  let overlap = 0;
  for (const w of wordsA) if (wordsB.has(w)) overlap++;
  return overlap / Math.min(wordsA.size, wordsB.size) >= 0.5;
}

// ── Cover image resolution ──────────────────────────────────────────
async function resolveCoverUrl(title, author, isbn13) {
  // 1. Google Books API — try ISBN first, then title+author
  try {
    const queries = [];
    if (isbn13) queries.push(`isbn:${isbn13}`);
    queries.push(`intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`);

    for (const q of queries) {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=3`);
      const data = await res.json();
      if (!data.items) continue;

      // Find best matching result — verify the title actually matches
      for (const item of data.items) {
        const info = item.volumeInfo || {};
        const resultTitle = info.title || "";
        if (!titlesMatch(resultTitle, title)) continue;
        const links = info.imageLinks;
        if (links) {
          const url = links.thumbnail || links.smallThumbnail || "";
          if (url) return url.replace("http://", "https://");
        }
      }
    }
  } catch (e) {
    console.warn("Google Books lookup failed:", e.message);
  }

  // 2. Open Library fallback — try ISBN, then title search
  if (isbn13) {
    try {
      const olUrl = `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`;
      const res = await fetch(olUrl, { method: "HEAD", redirect: "follow" });
      if (res.ok && res.headers.get("content-type")?.startsWith("image/")) {
        return olUrl;
      }
    } catch (e) {
      console.warn("Open Library ISBN lookup failed:", e.message);
    }
  }

  // 3. Open Library search by title+author
  try {
    const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=3`;
    const res = await fetch(searchUrl);
    const data = await res.json();
    if (data.docs?.length) {
      for (const doc of data.docs) {
        if (!titlesMatch(doc.title || "", title)) continue;
        if (doc.cover_i) {
          return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        }
      }
    }
  } catch (e) {
    console.warn("Open Library search failed:", e.message);
  }

  return "";
}

// ── Strip markdown fences from AI response ──────────────────────────
function cleanJsonResponse(text) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  return cleaned.trim();
}

// ── scanBookCover ───────────────────────────────────────────────────
exports.scanBookCover = onCall(
  { secrets: [anthropicKey], timeoutSeconds: 60, memory: "512MiB" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in.");
    }

    const { imageBase64, mediaType } = request.data;
    if (!imageBase64) {
      throw new HttpsError("invalid-argument", "imageBase64 is required.");
    }

    const client = new Anthropic({ apiKey: anthropicKey.value() });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `You are looking at a photo of a physical book cover. Your job is to identify the EXACT book shown.

STEP 1: Read ALL visible text on the cover carefully — title, subtitle, author name, edition info, series name, publisher logo/name.
STEP 2: Use every detail to identify the SPECIFIC edition. Pay close attention to:
  - Subtitles (e.g. "The Original Screenplay" makes it a screenplay, not a novel)
  - Series labels (e.g. "a Blue Bloods novel" means it's book N of that series)
  - Author name spelling (read each letter carefully)
STEP 3: If text is partially obscured or blurry, note what you CAN read and make your best identification. Do NOT guess a different book.

Respond ONLY with a JSON array (no markdown, no backticks) of objects with these fields:
- "title": full title including subtitle exactly as on the cover
- "author": full author name exactly as printed
- "isbn13": the ISBN-13 for this specific edition (must match the exact edition/format shown, not a different edition)
- "genre": one of Fiction, Non-Fiction, Sci-Fi, Fantasy, Mystery, Romance, History, Science, Philosophy, Biography, Self-Help, Poetry, Art, Other
- "pages": estimated page count (number)
- "summary": 2 sentences max describing the book

If you cannot identify any book, return [].`,
            },
          ],
        },
      ],
    });

    const raw = message.content[0]?.text || "[]";
    let books;
    try {
      books = JSON.parse(cleanJsonResponse(raw));
    } catch {
      console.error("Failed to parse AI response:", raw);
      throw new HttpsError("internal", "Failed to parse book data from image.");
    }

    if (!Array.isArray(books)) books = [books];

    // Resolve cover URLs server-side
    const enriched = await Promise.all(
      books.map(async (book) => {
        const cover = await resolveCoverUrl(
          book.title || "",
          book.author || "",
          book.isbn13 || ""
        );
        return { ...book, cover };
      })
    );

    return { books: enriched };
  }
);

// ── resolveCover ────────────────────────────────────────────────────
exports.resolveCover = onCall(
  { timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in.");
    }

    const { title, author, isbn13 } = request.data;
    if (!title) {
      throw new HttpsError("invalid-argument", "title is required.");
    }

    const cover = await resolveCoverUrl(title || "", author || "", isbn13 || "");
    return { cover };
  }
);

// ── getRecommendations ──────────────────────────────────────────────
exports.getRecommendations = onCall(
  { secrets: [anthropicKey], timeoutSeconds: 60, memory: "512MiB" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in.");
    }

    const { favoriteBooks } = request.data;
    if (!favoriteBooks || !Array.isArray(favoriteBooks) || favoriteBooks.length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "Provide at least one favorite book."
      );
    }

    const bookList = favoriteBooks
      .map((b) => `"${b.title}" by ${b.author} (${b.genre})`)
      .join(", ");

    const client = new Anthropic({ apiKey: anthropicKey.value() });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Based on these favorite books: ${bookList}, recommend exactly 5 books the reader would enjoy. Respond ONLY with a JSON array (no markdown, no backticks) of objects: {"title", "author", "isbn13", "genre", "reason" (one sentence why they'd like it)}. Do not recommend books already in the list.`,
        },
      ],
    });

    const raw = message.content[0]?.text || "[]";
    let recs;
    try {
      recs = JSON.parse(cleanJsonResponse(raw));
    } catch {
      console.error("Failed to parse recommendation response:", raw);
      throw new HttpsError("internal", "Failed to parse recommendations.");
    }

    if (!Array.isArray(recs)) recs = [recs];

    const enriched = await Promise.all(
      recs.map(async (book) => {
        const cover = await resolveCoverUrl(
          book.title || "",
          book.author || "",
          book.isbn13 || ""
        );
        return { ...book, cover };
      })
    );

    return { recommendations: enriched };
  }
);
