# Changelog

## v0.2.0

Cloud Functions and Firestore security rules now deploy automatically alongside the frontend. The GitHub Actions pipeline handles the full stack on every push to main: build the Vite app, deploy hosting, then deploy functions and firestore rules in one go.

The Anthropic API key is set up in Google Cloud Secret Manager, so the book scanner and recommendation engine are live. The Secret Manager API was enabled on the project and the key stored as ANTHROPIC_API_KEY, which the Cloud Functions pick up at runtime.

Also added HTTP referrer restrictions to the Firebase API key (locked to the web.app and firebaseapp.com domains plus localhost for dev).

## v0.1.0

The first working version of Pensieve. Everything is here: the full library view with search, filtering, and sorting, book detail pages with editable fields, star ratings, and notes, and the AI-powered cover scanner that uses Claude Haiku to identify books from a photo and auto-fill all the details.

Reading progress tracking is in, with a page counter and estimated time remaining. The yearly reading goal shows up on the main page with a basin-shaped progress arc that fills with mist as you finish more books. Genre breakdown stats give you a quick picture of what you've been reading.

Personalized recommendations pull from your favorites and highly-rated books to suggest what to read next. Cover images resolve through Google Books first, then Open Library, with a generated placeholder as a fallback.

Auth supports email/password and Google sign-in. All book data lives in Firestore under each user's own path, locked down with security rules. The Anthropic API key is stored as a Cloud Functions secret and never reaches the browser.

The design is built around the Pensieve mark: an open book curving into a basin with mist ribbons rising from the spine. That motif shows up in loading states, progress visualizations, empty states, and section dividers throughout the app.
