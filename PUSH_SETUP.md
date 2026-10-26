# Little Notes browser push setup

This is an optional backend for the GitHub Pages PWA. The app keeps note content in its existing browser storage. The Worker stores push subscription data and scheduling state only.

## Current status

- Frontend controls and service-worker push handlers are implemented on `feature/read-only-tech-curiosity-notes`.
- The Cloudflare Worker source and D1 schema are in `push-worker/`.
- Push is **not live until you create the Cloudflare resources, set secrets, deploy the Worker, and configure `PUSH_API_BASE` in `app.js`**.
- Nothing in this guide requires merging into `main`.

## 1. Create the D1 database

Install a current Node.js LTS release if it is not already installed. Open PowerShell in the repository folder:

```powershell
cd push-worker
npm install
npx wrangler login
npx wrangler d1 create little-notes-push
```

Cloudflare will return a database ID. Replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.toml` with that ID. Then create the tables:

```powershell
npx wrangler d1 execute little-notes-push --remote --file=./schema.sql
```

Do not put note content into D1. The schema is only for push subscriptions, scheduling state and a small request-rate counter.

## 2. Configure the Pages origin

In `wrangler.toml`, set `FRONTEND_ORIGIN` to the origin of the published GitHub Pages site, with no repository path and no trailing slash. For example, a project site might have an origin like `https://your-account.github.io`, while the app URL includes the repository path.

Set `VAPID_SUBJECT` to a contact address you control, in the form `mailto:you@example.com`.

## 3. Generate VAPID keys and store them as secrets

From the `push-worker` directory, generate a fresh key pair:

```powershell
npx web-push generate-vapid-keys
```

Keep the output private. Do not commit the private key or paste it into `app.js`, `wrangler.toml`, or any public file. Store the generated values using Wrangler prompts:

```powershell
npx wrangler secret put VAPID_SERVER_PUBLIC_KEY
npx wrangler secret put VAPID_SERVER_PRIVATE_KEY
```

When prompted, enter the corresponding generated value. The public key is delivered to the browser by the Worker configuration endpoint; the private key remains a Cloudflare secret. The public key and private key must come from the same generated pair.

## 4. Deploy the Worker

After the D1 ID, Pages origin and VAPID subject have been configured:

```powershell
npx wrangler deploy
```

Copy the deployed Worker URL, for example `https://little-notes-push.<your-subdomain>.workers.dev`.

## 5. Connect the GitHub Pages frontend

In the root `app.js`, replace the empty value in this line with your actual Worker URL:

```javascript
const PUSH_API_BASE = "";
```

For example:

```javascript
const PUSH_API_BASE = "https://little-notes-push.<your-subdomain>.workers.dev";
```

Commit this change only to the feature branch. Deploy the feature branch through your chosen GitHub Pages workflow for testing; do not merge it into `main` without reviewing the diff and tests.

## 6. Test on the installed phone

1. Open the deployed feature-branch version of Little Notes while online.
2. Go to **Settings → Browser notifications** and tap **Enable notifications**.
3. Grant permission when the browser asks.
4. Tap **Send test notification** and verify that a system notification appears.
5. Tap the notification and verify that Little Notes opens a randomly selected local note.
6. Close the app and wait for a scheduled notification. The schedule targets randomized times spread between 08:00 and 22:00 in the phone's detected time zone.
7. Test **Pause notifications**, **Resume notifications**, and **Turn off notifications**.
8. Confirm the note list, daily goal and reading progress still exist after refresh and reinstall/update tests.

## Scheduling behaviour and limitations

- The Worker checks due schedules every five minutes. Push timing is approximate, not exact to the second.
- The daily goal controls the maximum number of notification opportunities scheduled per day. Reading progress remains a separate, local count of notes marked as read; it is not uploaded.
- The Worker sends a generic reminder, not the note text. The app chooses a note locally when the notification is tapped.
- If the phone is offline, browser push is disabled, the browser/OS restricts delivery, or a subscription expires, delivery may fail or be delayed.
- The Worker cannot guarantee that the user opens or reads a note.
- This is a personal-use starting point, not a multi-user production service. The API validates the configured origin, limits request volume and restricts push endpoints to known browser push services, but CORS is not user authentication.
- If you change the VAPID key pair later, existing browser subscriptions may need to be recreated.

## Data preservation

The implementation does not clear, replace or migrate `personal-sticky-notes-v1`, `personal-sticky-notes-curated-tech-v1`, `personal-sticky-notes-preferences-v1`, or `personal-sticky-notes-daily-progress-v1`. Notification preferences and the per-device control token use separate keys. The Worker does not receive note bodies or individual read-note IDs.
