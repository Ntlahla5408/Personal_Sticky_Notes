# Personal Sticky Notes — Technology Curiosity App

**Specification version:** 0.3  
**Status:** Implementation underway on a feature branch; read-only first release  
**Repository:** https://github.com/Ntlahla5408/Personal_Sticky_Notes

## 1. Purpose

Evolve Personal Sticky Notes into a lightweight technology-curiosity app inspired by the Emerging Technologies module at Nelson Mandela University. The app should help readers recognise important developments, understand the basic idea, see why it matters, and identify useful questions to ask.

It is not intended to be a complete course, a step-by-step tutorial library, or a feed of headlines with little explanation. Notes should be long enough to explain a development in plain language.

## 2. Product decisions

- Start with **12 curated technology notes**.
- Curate and verify notes manually for the first release; do not automatically publish a news feed.
- Use a mix of primary research, university/research institution material, specialist technology reporting, and reputable broader technology reporting.
- Preserve full-length note pop-ups and random appearances while the app is open.
- Preserve the existing lightweight HTML, CSS, and JavaScript architecture where practical.
- Make note content read-only: users can browse and read notes but cannot create, edit, or delete notes in this release. Preserve local persistence and manual display.
- Use a warm, paper-inspired mobile-first interface with a cream/off-white background, terracotta/chestnut accents, dark brown/charcoal text, and sans-serif typography.
- Provide Home, Explore, and Settings through fixed bottom navigation.
- Provide a card-based note collection, category filtering and search, a dedicated reading pop-up with source attribution, and a daily note goal that resets each local calendar day.
- Treat automatic news ingestion as a later phase, not a requirement for the first release.

## 3. Intended audience and experience

A curious reader who wants to keep up with emerging technology without needing specialist knowledge. Each note should answer, in understandable language:

1. What happened or what has been demonstrated?
2. What is the underlying idea, at a beginner-friendly level?
3. Why could it matter?
4. What are its current limitations, uncertainties, or unanswered questions?
5. Where can the reader verify or explore the original information?

Avoid clickbait, unexplained jargon, inflated claims, and marketing language. Explain technical terms when they are first needed.

## 4. Initial content scope

Possible topic areas include:

- Artificial intelligence and machine learning
- Neural networks and natural-language processing
- Brain–computer interfaces and neural technology
- Quantum computing and quantum technologies
- Augmented and virtual reality
- Robotics and autonomous systems
- Cybersecurity and privacy
- Biomedical engineering, including visual prostheses
- Blockchain and smart contracts

These are candidate areas, not a requirement to give every category an equal number of notes. Choose a balanced variety of developments with credible sources and enough substance to explain.

## 5. Required note structure

Each curated note should contain:

- **Stable ID:** unique identifier for the curated note.
- **Title:** clear and specific, not clickbait.
- **Category:** a concise topic label.
- **Source publication date:** the date the cited source was published. If the date of the development differs, explain that distinction.
- **What happened:** a short account of the development, research, release, or demonstration.
- **Understand the basics:** an accessible explanation of the underlying technology.
- **Why it matters:** plausible implications and potential uses, without presenting speculation as fact.
- **Limitations and uncertainty:** what has not been shown, what remains difficult, and whether the result is a prototype, research demonstration, proposal, or available product.
- **Source name:** publication, institution, journal, or organisation.
- **Direct source URL:** a link to the specific article, paper, report, or official research page.
- **Question to consider (optional):** a useful question that encourages further thought.

The app may display the note as one readable full-length body, but curated metadata must remain structured so the interface can show the source, date, category, and clickable link consistently. User-created notes should remain simple and must not be forced to fill in research metadata.

## 6. Source and fact-checking policy

Preferred sources include:

1. Primary research papers and peer-reviewed journals.
2. Universities, research institutions, and research laboratories.
3. Specialist technology and engineering publications, such as IEEE Spectrum.
4. Reputable broader technology reporting, such as MIT Technology Review.
5. Official company research blogs where useful, clearly identified as company sources.

Before a note is accepted:

- Verify that the cited page exists and supports the claims made.
- Check publication date, attribution, and the direct link.
- Distinguish peer-reviewed findings from preprints, company announcements, demonstrations, proposals, and forecasts.
- Do not imply a prototype is a commercially available product or a laboratory result is proven real-world performance.
- Describe meaningful limitations and uncertainty.
- Corroborate important claims with another credible source where practical.
- Use measured language and do not overstate benefits or readiness.

The first release is a manually curated set. It must not claim to provide live or continuously updated news.

## 7. Functional requirements

### 7.1 Reading and discovery

- The reader can show a note immediately.
- The app can show a full-length note at random intervals while open and active.
- The reader can move to another note from the pop-up.
- The reader can browse the available notes, search titles/body text, filter by category, and open a selected note. Note content is read-only.
- Curated notes display their category, source publication date, source name, and a working direct source link.
- Source links are visibly clickable and open safely without replacing the app unexpectedly.

### 7.2 Scheduling

- The reader can choose a daily note goal (1, 3, 5, 8, 10, 15, or 20 notes).
- Daily progress counts distinct notes marked as read and resets when the local calendar date changes.
- The reader can start/restart or pause random appearances.
- Scheduling continues to be limited by browser and device background restrictions. The app must not promise arbitrary full-screen pop-ups while closed or reliably in the background.

### 7.3 Personal notes

- The reader cannot create, edit, or delete note content in the first release.
- Existing notes remain stored in local browser storage.
- User-created notes are not overwritten by curated content updates.
- User-created notes do not need curated-source metadata.
- Existing app behaviour should be retained unless a change is necessary for the approved specification.

### 7.4 Persistence and content updates

- Curated notes have stable IDs that do not depend on their array position.
- New curated notes can be added without duplicating existing curated notes.
- A curated-content update must not replace a reader's edited note with the original seed text.
- Removed or renamed curated notes must be handled deliberately; they must not cause unrelated personal notes to be deleted.
- The app must handle invalid or unavailable local-storage data without silently erasing recoverable user notes.

## 8. Safe migration strategy

The current application uses the local-storage key `personal-sticky-notes-v1`. On initialisation it loads stored notes when present and otherwise seeds the existing eight notes. Replacing the seed array alone would therefore fail to add new content for users who already have saved data.

The implementation follows these safeguards:

1. Preserve the existing storage key unless testing identifies a compelling reason to version it.
2. Give each of the 12 curated technology notes a stable, namespaced ID, such as `curated-tech-...`.
3. Identify the existing eight starter notes using their current seed IDs or another explicit legacy mapping.
4. Add missing curated notes idempotently: running the migration more than once must not create duplicates.
5. Preserve all user-created notes and any user edits. Never replace an existing record merely because its ID or title resembles curated content.
6. Seed the eight original notes only when the notes key is absent (fresh install). For an existing installation, do not restore a starter note that is missing from stored data.
7. Keep the migration repeatable and test it against fresh storage, existing starter data, existing personal notes, edited records, removed curated records, and partially populated storage.
8. Do not clear local storage as a migration shortcut. If note data or migration metadata is malformed, preserve the original value, display a warning, and block migration writes.

## 9. Non-functional requirements

- **Usability:** readable, straightforward full-length notes without unnecessary promotional copy.
- **Accessibility:** semantic headings, keyboard-operable controls, visible focus, readable contrast, and accessible labels for interactive elements.
- **Responsive layout:** usable on desktop and mobile/Android.
- **Performance:** avoid unnecessary frameworks or services; keep the app lightweight.
- **Reliability:** invalid content or a missing optional metadata field should not break note display.
- **Privacy:** first release keeps notes in local browser storage; it does not introduce accounts, analytics, or a remote content backend.
- **Maintainability:** curated content should be stored separately from rendering and scheduling logic where practical.
- **Cost:** use free hosting and tools where feasible.

## 10. Out of scope for the first release

- Automatically fetching or publishing news.
- Scheduled source ingestion, AI-generated summaries, or an automated editorial pipeline.
- Unreviewed AI-written notes.
- User accounts, a shared backend, or automatic cross-device synchronisation.
- A native mobile application.
- Full courses or detailed step-by-step build tutorials.
- Guaranteed full-screen alerts while the app is closed or backgrounded.

These may be considered in a later phase after the curated experience is working reliably.

## 11. Acceptance criteria

The first release is ready for review when:

- There are 12 curated technology notes with stable unique IDs.
- Each curated note has a clear title, category, source publication date, source name, direct link, plain-language explanation, significance, and relevant caveats.
- Sources are checked and claims accurately distinguish research demonstrations, proposals, company claims, and available products.
- Full-length notes display correctly and source links work.
- Immediate display, random selection, start/pause behaviour, and the existing pop-up controls continue to work. The daily goal and progress indicator reset correctly at local midnight.
- Note content cannot be created, edited, or deleted through the interface.
- Existing personal notes and edits survive the content migration.
- Re-running the migration does not duplicate curated notes.
- The interface remains usable on desktop and mobile.
- The README accurately describes the curated content and limitations and does not claim that an automatic live news feed exists.
- Fresh-install and upgrade tests both pass.

## 12. Implementation and change control

The implementation is authorised on the dedicated feature branch. Review the implementation plan and test results before merging to the default branch.

Implementation is staged on a dedicated feature branch. Do not make destructive storage changes or remove existing notes without explicit approval.
