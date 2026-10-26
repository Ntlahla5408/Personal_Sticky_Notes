# Implementation Plan — Read-only Technology Curiosity Notes

**Branch:** `feature/read-only-tech-curiosity-notes`  
**Status:** Implemented for review; not merged into `main`  
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

- [ ] Fresh install stores 8 starter notes and 12 curated notes.
- [ ] Existing install receives missing curated notes without losing existing records.
- [ ] Existing personal note title/body values remain unchanged.
- [ ] Re-running migration does not duplicate curated IDs.
- [ ] A previously installed curated ID that disappears is marked dismissed and is not re-added.
- [ ] Missing starter notes are not restored on existing installations.
- [ ] Invalid note JSON is left untouched and produces a warning.
- [ ] Invalid migration metadata is left untouched and produces a warning.
- [ ] A partial migration adds only missing curated notes.
- [ ] Source links use safe DOM-created anchors and only HTTP(S) URLs.
- [ ] Note create/edit/delete controls are absent; the app does not expose note-write actions.
- [ ] Manual pop-up, random selection, start/pause, interval validation, keyboard close, and offline loading work.
- [ ] Service worker cache includes `curated-notes.js` and uses a new cache version.

## 5. Implementation files

- `app.js` — read-only UI behaviour, migration, validation, safe source rendering.
- `curated-notes.js` — twelve stable-ID educational notes.
- `index.html` — remove editor controls; add metadata and storage-warning elements.
- `styles.css` — category, source metadata, and warning styles.
- `sw.js` — cache the curated content and refresh the cache version.
- `README.md` and `SPECIFICATION.md` — document the read-only release and data-safety behaviour.

## 6. Known review item

The storage guard is deliberately conservative: if either the notes value or migration metadata is malformed, it blocks writes rather than trying to repair the value automatically. This favours preservation over automatic recovery. A future recovery/export workflow can be designed separately if needed.
