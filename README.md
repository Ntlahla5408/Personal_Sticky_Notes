# Personal Sticky Notes

Little Notes (currently the Personal Sticky Notes repository) is a lightweight, installable web app for reading full-length learning notes and curated explanations of emerging technology. Its mobile-first interface uses a warm paper aesthetic, card-based browsing, and fixed bottom navigation.

## First-release behaviour

- **Read-only notes:** users can browse and read notes but cannot create, edit, or delete note content in this release.
- **20 bundled notes on a fresh install:** eight original personal-growth/technical-practice notes and twelve curated technology notes.
- **Curated metadata:** technology notes show their category, source publication date, source name, and a separate **Read source** link.
- **Local storage:** notes remain on this device and in this browser. The app does not introduce accounts, analytics, or cloud synchronisation.
- **Daily goal:** users choose a daily target and see progress; progress resets each local calendar day.
- **Random pop-ups:** users can start or pause random note appearances. Delivery and background behaviour will be reviewed separately.
- **Offline use:** the service worker caches the app and bundled note content.

A browser app cannot reliably open a full-screen note at arbitrary times when it is closed or running in the background, especially on Android. Keep the app open for random pop-ups to work.

## Run on Windows

1. Download or clone the repository.
2. Open `index.html` in Edge or Chrome.
3. Open **Settings** and choose a daily note goal.
4. Select **Start random notes** and keep the tab open.
5. Select **Show me a note** to open one immediately.

For a permanent desktop window, use the browser's app-install option after hosting the app securely.

## Install on Android

For PWA installation, serve the files over HTTPS. GitHub Pages is one free option:

1. Open the repository's **Settings → Pages**.
2. Enable deployment from the branch and root folder that contain the app.
3. Open the published HTTPS URL on the phone in Chrome.
4. Use Chrome's menu and choose **Install app** or **Add to Home screen**.
5. Open the app and start random notes in Settings.

## Data safety and migration

The app retains the existing local-storage key `personal-sticky-notes-v1`. Daily-goal preferences and progress use separate keys so note content is not migrated or overwritten. On a fresh install, it stores the eight original notes and adds the twelve bundled curated notes. On an existing install, it preserves existing note records and adds only curated notes whose stable IDs are not already present.

A separate migration record tracks curated-note IDs. If an ID was previously installed but later disappears from the notes array, it is recorded as dismissed so a later content update will not restore it. Stable IDs are internal and are not shown in the interface.

If saved JSON is malformed or the migration record cannot be read, the app does not clear or replace that data. It displays a warning and blocks migration writes. Keep the browser's site data intact if recovery may be needed.

## Limitations

- Notes are stored separately on each device; they do not synchronise between PC and phone.
- Random pop-ups currently require the app to remain open. A background tab may be paused by the browser; browser/mobile delivery options are being evaluated separately.
- The curated collection is manually bundled, not a live news feed. Source availability and research findings can change, so the notes should be reviewed periodically.
