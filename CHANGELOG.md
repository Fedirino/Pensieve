# Changelog

## v0.1.0

The first working version of Pensieve. Everything is here: the full library view with search, filtering, and sorting, book detail pages with editable fields, star ratings, and notes, and the AI-powered cover scanner that uses Claude Haiku to identify books from a photo and auto-fill all the details.

Reading progress tracking is in, with a page counter and estimated time remaining. The yearly reading goal shows up on the main page with a basin-shaped progress arc that fills with mist as you finish more books. Genre breakdown stats give you a quick picture of what you've been reading.

Personalized recommendations pull from your favorites and highly-rated books to suggest what to read next. Cover images resolve through Google Books first, then Open Library, with a generated placeholder as a fallback.

Auth supports email/password and Google sign-in. All book data lives in Firestore under each user's own path, locked down with security rules. The Anthropic API key is stored as a Cloud Functions secret and never reaches the browser.

The design is built around the Pensieve mark: an open book curving into a basin with mist ribbons rising from the spine. That motif shows up in loading states, progress visualizations, empty states, and section dividers throughout the app.
