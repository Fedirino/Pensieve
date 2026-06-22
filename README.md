# Pensieve

A personal book-cataloging app with a magical-literary soul. Pensieve lets you scan book covers with AI to auto-fill your library, track what you're reading, set yearly goals, and get personalized recommendations based on your taste.

The name comes from a memory basin, and the whole design leans into that idea: deep midnight tones, gold accents, mist that rises as your library grows. It's built for one person right now but designed with the possibility of opening up later.

## Tech

React frontend deployed on Firebase Hosting. Firestore for data, Firebase Auth for login (email/password and Google). All AI calls go through Firebase Cloud Functions so the Anthropic API key never touches the client.

## Setup

Clone the repo, then install dependencies for both the frontend and the functions directory.

```
npm install
cd functions && npm install && cd ..
```

You'll need to set your Anthropic API key as a Firebase secret. This is the only secret the app needs.

```
firebase functions:secrets:set ANTHROPIC_API_KEY
```

You'll also need to update `src/firebase.js` with your actual Firebase config values. You can find these in the Firebase console under Project Settings. The project ID is already set to `pensieve-readingmind` but the API key, app ID, and messaging sender ID need to match your project.

## Deploy

Build the frontend and deploy everything in one go.

```
npm run build
firebase deploy
```

That pushes hosting, functions, and Firestore security rules. The app will be live at your Firebase Hosting URL.

## Running locally

```
npm run dev
```

For functions, you can use the Firebase emulator suite if you want local testing.

## License

All rights reserved. This is a personal project with potential commercial use in the future. No part of this codebase may be copied, distributed, or used without explicit permission.
