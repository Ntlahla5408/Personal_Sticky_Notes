# Implementation Plan — Read-only Technology Curiosity Notes

**Branch:** `feature/read-only-tech-curiosity-notes`  
**Status:** Implemented for review; browser push source added but deployment and real-device tests remain; not merged into `main`  
**Scope:** First release only. No live news feed, accounts, analytics, cloud sync, or note editing.

## 1. User experience

- Keep the existing HTML/CSS/JavaScript application and its pop-up experience.
- Fresh installs receive the eight original notes plus twelve bundled technology notes.
- Curated notes show category and source publication date in the pop-up.
- Show a short source attribution and a separate **Read source** link. Links are built through DOM APIs, restricted to HTTP(S), and opened with `noopener noreferrer`.
- Hide create, edit, and delete controls. Note content is read-only; timing settings remain adjustable.
- Keep the app usable offline by caching the curated content file with the app assets.

## 2. Storage and migration rules

The notes key remains `personal-sticky-notes-v1`. The migration uses a separate key, `personal-sticky-notes-curated-tech-v1`, containing a version number, installed curated IDs, and dismissed curated IDs.

1. Read and validate both stored values before attempting migration.
2. If the notes key is absent, treat the installation as fresh and seed the eight original notes.
3. If the notes key already contains a valid array, preserve every existing record. Do not reseed missing original notes on an existing installation.
4. Add curated notes by stable ID only. Never replace a record because its title or body resembles bundled content.
5. Track IDs successfully installed. If a previously installed ID is absent on a later run, record it as dismissed so it is not automatically restored.
6. Write the note array before writing migration metadata. If metadata writing fails, the next run can deduplicate notes by stable ID.
7. If saved notes or migration metadata are malformed, do not reset either value or run migration writes. Show a clear warning and leave stored values intact.
8. The app does not save note changes during ordinary reading. The only writes are initial seeding and the one-time/idempotent content migration.

## 3. Data shape

Each curated note contains:

- `id` — namespaced stable identifier used internally, not shown to readers
- `title`, `body`
- `category`
- `sourceDate` — source publication date in ISO format
- `sourceName`, `sourceUrl`
- `question` — optional reflection question
- `noteType`

Content is bundled in `curated-notes.js`, so it is available offline and does not require a live feed.

## 4. Verification checklist

### Checked with a JavaScript harness and mocked browser storage/DOM

- [x] Fresh install stores 8 starter notes and 12 curated notes.
- [x] Existing install receives missing curated notes without losing existing records.
- [x] Existing personal note title/body values remain unchanged.
- [x] Re-running migration does not duplicate curated IDs.
- [x] A previously installed curated ID that disappears is marked dismissed and is not re-added.
- [x] Missing starter notes are not restored on existing installations.
- [x] Invalid note JSON is left untouched and produces a warning.
- [x] Invalid migration metadata is left untouched, blocks migration writes, and keeps valid notes readable.
- [x] A partial migration adds only missing curated notes.
- [x] Source attribution and a separate HTTP(S) link render with `target="_blank"` and `rel="noopener noreferrer"`.
- [x] Note create/edit/delete controls are absent.
- [x] Manual pop-up, close control, random start/pause, and interval validation work in the mocked DOM.
- [x] The JavaScript files parse successfully.
- [x] All 12 curated notes have unique IDs, complete metadata, valid ISO-style dates, and HTTPS source URLs.
- [x] Service worker cache includes `curated-notes.js` and uses a new cache version.

### Still needs a real browser check

- [ ] Open the app in Chrome/Edge and check layout on desktop and mobile.
- [ ] Verify the service worker installs and the app loads offline after its first successful load.
- [ ] Verify the pop-up, source link, and settings behaviour in a real browser.
- [ ] Test against a copy of real pre-existing localStorage data before merging.

## 5. Implementation files

- `app.js` — read-only UI behaviour, migration, validation, safe source rendering.
- `curated-notes.js` — twelve stable-ID educational notes.
- `index.html` — remove editor controls; add metadata and storage-warning elements.
- `styles.css` — category, source metadata, and warning styles.
- `sw.js` — cache the curated content and refresh the cache version.
- `README.md` and `SPECIFICATION.md` — document the read-only release and data-safety behaviour.

## 6. Known review item

The storage guard is deliberately conservative: if either the notes value or migration metadata is malformed, it blocks writes rather than trying to repair the value automatically. This favours preservation over automatic recovery. A future recovery/export workflow can be designed separately if needed.

## 7. Optional browser push implementation

The browser push extension is isolated from the existing notes and progress keys. It adds a settings UI, client subscription controls, service-worker push/click handlers, a Cloudflare Worker, a D1 schema, and `PUSH_SETUP.md`. The Worker stores only push subscription and scheduling data; it sends a generic notification and the PWA selects the note locally when opened.

- Active window: 08:00–22:00 in the browser-detected time zone.
- Schedule: up to the selected daily goal, spread across the window with randomized slot times; Cron checks run every five minutes.
- Local-only keys remain unchanged: `personal-sticky-notes-v1`, `personal-sticky-notes-curated-tech-v1`, `personal-sticky-notes-preferences-v1`, and `personal-sticky-notes-daily-progress-v1`.
- Separate notification keys: `personal-sticky-notes-push-preferences-v1` and `personal-sticky-notes-push-device-token-v1`.
- Required before live use: create D1, set the Pages origin, generate and configure VAPID keys, deploy the Worker, set `PUSH_API_BASE`, and test on the installed phone.
- No merge to `main` is authorised by this plan.

### Browser push validation still required

- [ ] Validate Worker source with Wrangler and install/build the push dependency.
- [ ] Apply `push-worker/schema.sql` to the remote D1 database.
- [ ] Confirm API CORS and subscription management against the exact GitHub Pages origin.
- [ ] Verify test push delivery and notification-click navigation on the installed phone.
- [ ] Verify pause, resume, unsubscribe, expiry cleanup, daily rollover, active-hour boundaries and delivery while the PWA is closed.
- [ ] Confirm existing notes and reading progress survive app update and service-worker activation.
