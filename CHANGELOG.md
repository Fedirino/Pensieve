# Changelog

## v1.4.0

Rewrote the homescreen icon to match the in-app header icon more closely, with the same basin shape and smooth curved mist ribbons rising above it.

Cover art resolution now has five sources instead of two. After Google Books and Open Library, it tries Amazon's image CDN using an ISBN-10 converted from the ISBN-13, then the Bookcover API at longitood.com. If Open Library finds the book but doesn't have a cover, it still grabs the ISBN for the Amazon fallback. Books like the Linehan DBT textbook that weren't showing up before should resolve now.

## v1.3.0

Regenerated all app icons with a solid midnight background instead of transparent. iOS was showing white corners because it doesn't handle transparent PNGs for home screen icons. Should work properly now when you add to home screen.

Books without cover art now get styled placeholder covers instead of just showing a letter. Each placeholder shows the full title and author on a gradient background that shifts color based on the book's genre. Fantasy books get a purple tone, history gets a warm brown, sci-fi gets a cool blue, and so on. They look like actual book covers rather than broken image cards.

## v1.2.0

Fixed the app icon not showing up. The icon files were in the wrong folder and Vite wasn't copying them into the build output. They're now in the `public/` directory where Vite expects them, so the favicon, apple-touch-icon, and PWA manifest all work properly.

Added a "Find Missing Covers" button to the library toolbar that re-runs cover resolution for any books that don't have cover art yet. There's also a "Find Cover" button on individual book detail pages. This uses a new lightweight Cloud Function that just does the Google Books and Open Library lookup without needing the AI scanner.

## v1.1.0

Focused on making the book scanner actually reliable. The AI prompt now reads all visible text on the cover before identifying the book, so it catches subtitles, series names, and edition info instead of guessing from the main title alone. Photos get resized to a consistent resolution before hitting the API, which helps with both oversized phone camera shots and tiny thumbnails.

Cover art resolution got smarter too. Google Books results are now cross-checked against the title the AI identified, so you won't get a random edition's cover for the wrong book. Added an Open Library title search as a third fallback when ISBN lookups miss.

The app now has a proper icon for the home screen, browser tabs, and "Add to Home Screen" on mobile. It's the basin/book motif from the design system. A full PWA manifest is in place so it looks right when pinned.

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
