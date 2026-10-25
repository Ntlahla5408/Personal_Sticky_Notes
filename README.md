# Personal Sticky Notes (free starter app)

This is a small installable web app for Windows and Android. It includes full-length learning notes, note editing, and unpredictable pop-ups while the app is open.

## Important limitation

A browser app cannot reliably open a full-screen note at arbitrary times when it is closed or running in the background, especially on Android. Android and browser power-management rules limit background activity. This version intentionally shows full notes in-app rather than sending truncated reminder notifications. Keep the app open for random pop-ups to work.

## Try it on Windows

1. Extract the ZIP to a folder.
2. Open `index.html` in Edge or Chrome.
3. Select **Settings** → set the minimum to `1` and maximum to `2` for a quick test.
4. Select **Start random notes** and keep the tab open.
5. Use **Write a note** to add or edit your own lessons.

For a permanent desktop window, open the app in Edge/Chrome and use the browser's app-install option if available after hosting it securely.

## Install on Android and sync by hosting

To install as a PWA, the files need to be served over HTTPS. One free route is GitHub Pages:

1. Create a new GitHub repository (for example, `personal-sticky-notes`).
2. Upload all five app files from this folder to the repository root.
3. In the repository, open **Settings → Pages** and enable deployment from the `main` branch and `/ (root)`.
4. Wait for GitHub Pages to publish the site. Open the published HTTPS URL on your Android phone in Chrome.
5. Open Chrome's menu and choose **Install app** or **Add to Home screen**.
6. Open the installed app and start random notes in Settings.

## Data and device differences

- Notes are saved in local browser storage on each device. This starter version does **not** synchronize notes between PC and phone automatically.
- If you edit notes on one device, you must add them on the other device too. Cross-device sync would require a backend or a deliberate export/import feature.
- Do not close the app if you want random pop-ups. A background tab may be paused by the browser.
- For a production Android app with dependable background scheduling, a native Android implementation would be needed, and even Android would not guarantee an arbitrary full-screen takeover at any random moment.

## Included starter lessons

The initial notes cover boundaries, calmness, helping without taking over, accountability, emotional regulation, potential versus responsibility, careful technical work, and respectful refusal.
