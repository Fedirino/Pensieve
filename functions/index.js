const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const Anthropic = require("@anthropic-ai/sdk").default;

const anthropicKey = defineSecret("ANTHROPIC_API_KEY");

// ── Cover image resolution ──────────────────────────────────────────
async function resolveCoverUrl(title, author, isbn13) {
  // 1. Google Books API
  try {
    const queries = [];
    if (isbn13) queries.push(`isbn:${isbn13}`);
    queries.push(`intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`);

    for (const q of queries) {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
      const data = await res.json();
      if (data.items?.[0]?.volumeInfo?.imageLinks) {
        const links = data.items[0].volumeInfo.imageLinks;
        const url = links.thumbnail || links.smallThumbnail || "";
        if (url) return url.replace("http://", "https://");
      }
    }
  } catch (e) {
    console.warn("Google Books lookup failed:", e.message);
  }

  // 2. Open Library fallback
  if (isbn13) {
    try {
      const olUrl = `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`;
      const res = await fetch(olUrl, { method: "HEAD", redirect: "follow" });
      if (res.ok && res.headers.get("content-type")?.startsWith("image/")) {
        return olUrl;
      }
    } catch (e) {
      console.warn("Open Library lookup failed:", e.message);
    }
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
              text: 'Identify the book(s) in this image. Respond ONLY with a JSON array (no markdown, no backticks) of objects: {"title", "author", "isbn13", "genre" (Fiction/Non-Fiction/Sci-Fi/Fantasy/Mystery/Romance/History/Science/Philosophy/Biography/Self-Help/Poetry/Art/Other), "pages" (number), "summary" (2 sentences max)}. If none found, return [].',
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
