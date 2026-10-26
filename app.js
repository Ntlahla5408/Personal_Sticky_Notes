const KEY = "personal-sticky-notes-v1";
const MIGRATION_KEY = "personal-sticky-notes-curated-tech-v1";
const PREFERENCES_KEY = "personal-sticky-notes-preferences-v1";
const DAILY_PROGRESS_KEY = "personal-sticky-notes-daily-progress-v1";
const PUSH_PREFERENCES_KEY = "personal-sticky-notes-push-preferences-v1";
const PUSH_DEVICE_TOKEN_KEY = "personal-sticky-notes-push-device-token-v1";
// Set this to the deployed Worker URL (for example, https://little-notes-push.<account>.workers.dev).
// Keep the VAPID private key only in Cloudflare Worker secrets, never here.
const PUSH_API_BASE = "";
const DEFAULT_DAILY_GOAL = 5;
let dailyGoal = DEFAULT_DAILY_GOAL;
let dailyProgress = { date: "", readIds: [] };
let activeCategory = "All";
const SEED_NOTES = [
  {
    title: "A boundary is not a punishment",
    body: "A boundary is a limit you set around what you will accept, what you will do, and what you will participate in. It describes your own actions; it is not a way to control another person.\n\nA boundary sounds like:\n“I have explained the process twice. Please read the full instructions before continuing. I will review the result when you have checked it.”\n\nThis is not a boundary:\n“I will keep explaining and fixing everything, even if it costs me the whole evening.”\n\nYou can help someone without taking responsibility for their behaviour. A boundary protects your time and energy while still allowing you to treat people respectfully."
  },
  {
    title: "Being calm does not mean accepting everything",
    body: "Calmness is the way you respond; a boundary is the limit you set. You can speak calmly and still say no, pause a conversation, or refuse to repeat a process that is not working.\n\nA calm boundary sounds like:\n“I’m getting frustrated, so I’m going to pause here. We can continue when we’re ready to focus on the task.”\n\nThis is not calmness:\nSaying yes to everything, hiding your frustration, and hoping the other person will notice that you are overwhelmed.\n\nYou do not have to become angry to prove that something is unacceptable. State the limit early, clearly, and respectfully."
  },
  {
    title: "Help is not the same as taking over",
    body: "Helping means giving someone guidance, tools, feedback, or a reasonable chance to learn. Taking over means becoming responsible for their preparation, effort, decisions, and results.\n\nHelpful:\n“I’ll show you the process once. Please try it yourself, read the output, and tell me what you think happened.”\n\nTaking over:\n“I’ll do the thinking, checking, reminding, and repairing every time, because otherwise it might not get done.”\n\nSupport people who are willing to participate in their own improvement. You can contribute without carrying the entire responsibility."
  },
  {
    title: "A promise is not the same as completed work",
    body: "A promise tells you what someone intends to do. Completed work is something you can verify. You can appreciate a person's intention without treating an unfinished task as finished.\n\nA practical response is:\n“Thanks for the update. Please show me the completed result when it is ready. If you cannot finish it, tell me early so we can adjust the plan.”\n\nThis is not accountability:\nAssuming the work is done because someone said they would do it, then discovering the problem at the deadline.\n\nUse clear deadlines, honest updates, and evidence of completion. Verification is a normal part of teamwork, not automatically a sign of distrust."
  },
  {
    title: "Pause before frustration becomes an outburst",
    body: "You are allowed to feel frustrated. The goal is not to never feel anger; it is to notice it early enough to choose what you do next.\n\nA useful response is:\n“I’m too frustrated to explain this well right now. I’m taking a short break, and we can return to the issue later.”\n\nThis is not emotional control:\nKeeping everything inside until you suddenly shout, insult someone, or say something you regret.\n\nA pause is not failure or avoidance if you return to the problem when you are calmer. Take responsibility for your tone without pretending the underlying problem does not matter."
  },
  {
    title: "Do not confuse potential with responsibility",
    body: "Someone may have the potential to improve, but their growth depends on their own choices and effort as well as the support they receive.\n\nA healthy approach is:\n“I can explain the expectation and offer feedback. It is your responsibility to practise, ask questions, and apply it.”\n\nThis is not support:\nBelieving that if you work hard enough, you can make another person become reliable, careful, or motivated.\n\nEncourage growth, but assess what is actually happening. You are responsible for your conduct and your contribution—not for controlling another adult’s development."
  },
  {
    title: "Read, understand, then act",
    body: "In technical work, copying a command is not the same as understanding what it does. Instructions often include conditions, placeholders, or checks that must happen before execution.\n\nA safer process is:\n1. Read the entire instruction.\n2. Identify what must be changed before running it.\n3. Check the current state and whether the action has already been completed.\n4. Run the command.\n5. Read the output and verify the result.\n\nThis is not careful work:\nRushing through the steps, repeating an operation, and assuming an error means the instructions are wrong.\n\nSlowing down is often faster than repairing avoidable mistakes."
  },
  {
    title: "A respectful no is a complete answer",
    body: "You can decline a request without being cruel, and you do not have to provide an endless defence of your decision.\n\nA respectful no sounds like:\n“I can’t take that on today. I can help with the part we agreed on, but I cannot do the additional work.”\n\nThis is not kindness:\nAgreeing because you fear disappointing someone, then becoming resentful or exhausted.\n\nBe clear, kind, and realistic. If you want to offer an alternative, do so because you genuinely can—not because you feel forced to remove every disappointment the other person might feel."
  }
];

const $ = (id) => document.getElementById(id);
let notes = [];
let timerId = null;
let currentNoteId = null;
let storageBlocked = false;
let storageWarningMessage = "";
let pushPreferences = { enabled: false, paused: false };
let serviceWorkerRegistration = null;

function isValidNote(note) {
  return note && typeof note === "object" &&
    typeof note.id === "string" && note.id.length > 0 &&
    typeof note.title === "string" && typeof note.body === "string";
}

function readStorage() {
  let savedNotes = null;
  let metadata = { version: 1, installedIds: [], dismissedIds: [] };
  let rawNotes = null;
  try {
    rawNotes = localStorage.getItem(KEY);
    const rawMetadata = localStorage.getItem(MIGRATION_KEY);

    if (rawNotes !== null) {
      savedNotes = JSON.parse(rawNotes);
      if (!Array.isArray(savedNotes) || !savedNotes.every(isValidNote)) {
        throw new Error("The saved notes do not have the expected structure.");
      }
    }

    if (rawMetadata !== null) {
      const parsedMetadata = JSON.parse(rawMetadata);
      if (!parsedMetadata || parsedMetadata.version !== 1 ||
          !Array.isArray(parsedMetadata.installedIds) ||
          !Array.isArray(parsedMetadata.dismissedIds) ||
          !parsedMetadata.installedIds.every(id => typeof id === "string") ||
          !parsedMetadata.dismissedIds.every(id => typeof id === "string")) {
        throw new Error("The saved migration record is not valid.");
      }
      metadata = parsedMetadata;
    }

    return { savedNotes, metadata, freshInstall: rawNotes === null };
  } catch (error) {
    storageBlocked = true;
    storageWarningMessage = "Some saved app data could not be read. It has been left unchanged, and the app will not write over it. If you need the notes recovered, keep this browser data intact.";
    return { savedNotes, metadata: null, freshInstall: false, error };
  }
}

function initialiseNotes() {
  const stored = readStorage();
  if (storageBlocked) {
    notes = Array.isArray(stored.savedNotes) ? stored.savedNotes : [];
    showStorageWarning();
    return;
  }

  notes = stored.freshInstall
    ? SEED_NOTES.map((note, index) => ({ ...note, id: `seed-${index}`, createdAt: Date.now() + index, category: index === 6 ? "Technical practice" : "Personal growth" }))
    : stored.savedNotes;

  const metadata = {
    version: 1,
    installedIds: [...stored.metadata.installedIds],
    dismissedIds: [...stored.metadata.dismissedIds]
  };
  const existingIds = new Set(notes.map(note => note.id));
  let notesChanged = stored.freshInstall;
  let metadataChanged = false;

  // A previously installed curated note that has disappeared is treated as dismissed.
  // This prevents later app updates from restoring a deliberately removed note.
  for (const id of metadata.installedIds) {
    if (!existingIds.has(id) && !metadata.dismissedIds.includes(id)) {
      metadata.dismissedIds.push(id);
      metadataChanged = true;
    }
  }

  const curatedNotes = Array.isArray(window.CURATED_TECH_NOTES) ? window.CURATED_TECH_NOTES : [];
  for (const curatedNote of curatedNotes) {
    if (existingIds.has(curatedNote.id)) {
      if (!metadata.installedIds.includes(curatedNote.id)) {
        metadata.installedIds.push(curatedNote.id);
        metadataChanged = true;
      }
      continue;
    }
    if (metadata.dismissedIds.includes(curatedNote.id) || metadata.installedIds.includes(curatedNote.id)) {
      continue;
    }
    notes.push({ ...curatedNote, createdAt: Date.parse(curatedNote.sourceDate) || Date.now() });
    existingIds.add(curatedNote.id);
    metadata.installedIds.push(curatedNote.id);
    notesChanged = true;
    metadataChanged = true;
  }

  try {
    // Write notes first. If the metadata write fails, the next launch can safely deduplicate by ID.
    if (notesChanged) localStorage.setItem(KEY, JSON.stringify(notes));
    if (metadataChanged || stored.freshInstall) localStorage.setItem(MIGRATION_KEY, JSON.stringify(metadata));
  } catch (error) {
    storageBlocked = true;
    storageWarningMessage = "The app could not save its initial content update. Your existing stored data has not been deliberately cleared. Check available browser storage before trying again.";
    showStorageWarning();
  }
}

function showStorageWarning() {
  const warning = $("storageWarning");
  warning.textContent = storageWarningMessage;
  warning.classList.remove("hidden");
  $("status").textContent = "Read-only mode is active. Saved data was not changed.";
}

function localDateKey() {
  const now = new Date();
  return String(now.getFullYear()) + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
}

function loadDailyPreferences() {
  dailyProgress = { date: localDateKey(), readIds: [] };
  try {
    const rawPreferences = localStorage.getItem(PREFERENCES_KEY);
    if (rawPreferences) {
      const parsed = JSON.parse(rawPreferences);
      if (parsed && Number.isInteger(parsed.dailyGoal) && [1, 3, 5, 8, 10, 15, 20].includes(parsed.dailyGoal)) dailyGoal = parsed.dailyGoal;
    }
    const rawProgress = localStorage.getItem(DAILY_PROGRESS_KEY);
    if (rawProgress) {
      const parsed = JSON.parse(rawProgress);
      if (parsed && typeof parsed.date === "string" && Array.isArray(parsed.readIds) && parsed.readIds.every(id => typeof id === "string")) dailyProgress = parsed;
    }
  } catch { /* Optional preferences are not allowed to overwrite unreadable stored data. */ }
  if (dailyProgress.date !== localDateKey()) dailyProgress = { date: localDateKey(), readIds: [] };
  $("dailyGoal").value = String(dailyGoal);
  renderDailyProgress();
}

function saveDailyGoal() {
  dailyGoal = Number($("dailyGoal").value);
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ dailyGoal }));
    $("goalSaved").textContent = "Your daily goal is saved on this device.";
  } catch {
    $("goalSaved").textContent = "This browser could not save your goal. It applies until you close the app.";
  }
  renderDailyProgress();
  syncPushSettings();
}

function renderDailyProgress() {
  const count = dailyProgress.readIds.length;
  $("dailyProgressText").textContent = Math.min(count, dailyGoal) + " of " + dailyGoal + (dailyGoal === 1 ? " note" : " notes");
  $("dailyProgressBar").style.width = Math.min(100, (count / dailyGoal) * 100) + "%";
  $("dailyProgressLabel").textContent = count >= dailyGoal ? "Daily goal reached" : "Today's discoveries";
}

function markCurrentNoteRead() {
  if (!currentNoteId) return;
  if (dailyProgress.date !== localDateKey()) dailyProgress = { date: localDateKey(), readIds: [] };
  if (!dailyProgress.readIds.includes(currentNoteId)) {
    dailyProgress.readIds.push(currentNoteId);
    try { localStorage.setItem(DAILY_PROGRESS_KEY, JSON.stringify(dailyProgress)); } catch { /* Keep session progress. */ }
  }
  renderDailyProgress();
}

function switchView(viewName) {
  ["home", "explore", "settings"].forEach(name => $(name + "View").classList.toggle("hidden", name !== viewName));
  document.querySelectorAll("[data-view]").forEach(button => {
    const active = button.dataset.view === viewName;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (viewName === "explore") renderExplore();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderCards(list, collection) {
  if (!collection.length) {
    list.textContent = "";
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No notes match this search yet.";
    list.appendChild(empty);
    return;
  }
  list.innerHTML = collection.map(note => {
    const category = note.category ? '<span class="note-category">' + escapeHtml(note.category) + '</span>' : "";
    return '<article class="note-card"><div class="card-meta">' + category + '</div><h3>' + escapeHtml(note.title) + '</h3><p>' + escapeHtml(excerpt(note.body)) + '</p><div class="card-actions"><button type="button" data-show="' + escapeHtml(note.id) + '">Read note ↗</button></div></article>';
  }).join("");
  list.querySelectorAll("[data-show]").forEach(button => button.addEventListener("click", () => showNote(button.dataset.show)));
}

function renderExplore() {
  const searchTerm = $("noteSearch").value.trim().toLowerCase();
  const categories = ["All", ...new Set(notes.map(note => note.category).filter(Boolean))];
  const filterHost = $("categoryFilters");
  filterHost.textContent = "";
  categories.forEach(categoryName => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "filter-chip" + (activeCategory === categoryName ? " active" : "");
    chip.textContent = categoryName;
    chip.addEventListener("click", () => { activeCategory = categoryName; renderExplore(); });
    filterHost.appendChild(chip);
  });
  const filtered = notes.filter(note => {
    const matchesCategory = activeCategory === "All" || note.category === activeCategory;
    const matchesSearch = !searchTerm || (note.title + " " + note.body + " " + (note.category || "")).toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
  $("exploreCount").textContent = filtered.length + " " + (filtered.length === 1 ? "note" : "notes");
  renderCards($("exploreList"), filtered);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}

function excerpt(body) {
  const text = String(body || "").trim();
  return text.length > 190 ? text.slice(0, 190).trimEnd() + "…" : text;
}

function render() {
  $("noteCount").textContent = notes.length + " " + (notes.length === 1 ? "note" : "notes");
  renderCards($("notesList"), notes.slice(0, 6));
  $("showNow").disabled = notes.length === 0;
  $("headerShowNow").disabled = notes.length === 0;
  if (notes.length > 6) {
    const more = document.createElement("button");
    more.className = "secondary";
    more.textContent = "Explore all notes";
    more.addEventListener("click", () => switchView("explore"));
    $("notesList").appendChild(more);
  }
}

function safeSourceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function showNote(id) {
  const note = notes.find(item => item.id === id) || pickNote();
  if (!note) return;
  currentNoteId = note.id;
  $("popupTitle").textContent = note.title;
  $("popupBody").textContent = note.body;
  $("popupIndex").textContent = `${notes.findIndex(item => item.id === note.id) + 1} of ${notes.length}`;

  const meta = $("popupMeta");
  meta.textContent = "";
  if (note.category) {
    const category = document.createElement("span");
    category.className = "note-category";
    category.textContent = note.category;
    meta.appendChild(category);
  }
  if (note.sourceDate) {
    const date = document.createElement("span");
    date.className = "source-date";
    const parsedDate = new Date(`${note.sourceDate}T00:00:00`);
    date.textContent = `Source published ${Number.isNaN(parsedDate.getTime()) ? note.sourceDate : parsedDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`;
    meta.appendChild(date);
  }

  const sourceLine = $("popupSource");
  sourceLine.textContent = "";
  const sourceUrl = safeSourceUrl(note.sourceUrl);
  if (note.sourceName && sourceUrl) {
    const label = document.createElement("span");
    label.textContent = `Source: ${note.sourceName}`;
    const link = document.createElement("a");
    link.href = sourceUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Read source";
    sourceLine.append(label, link);
    sourceLine.classList.remove("hidden");
  } else {
    sourceLine.classList.add("hidden");
  }

  const question = $("popupQuestion");
  question.textContent = note.question ? `Question to consider: ${note.question}` : "";
  question.classList.toggle("hidden", !note.question);
  $("noteOverlay").classList.remove("hidden");
  $("doneNote").focus();
}

function closeNote() {
  $("noteOverlay").classList.add("hidden");
}

function pickNote() {
  if (!notes.length) return null;
  const pool = notes.filter(note => note.id !== currentNoteId);
  const choices = pool.length ? pool : notes;
  return choices[Math.floor(Math.random() * choices.length)];
}

function randomDelay() {
  // Temporary default timing for this browser prototype; delivery rules will be discussed separately.
  const min = 20;
  const max = 90;
  return (min + Math.random() * (max - min)) * 60 * 1000;
}

function scheduleNext() {
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    if (!document.hidden && notes.length) {
      const note = pickNote();
      if (note) showNote(note.id);
    }
    scheduleNext();
  }, randomDelay());
}


function loadPushPreferences() {
  try {
    const raw = localStorage.getItem(PUSH_PREFERENCES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.enabled === "boolean" && typeof parsed.paused === "boolean") {
        pushPreferences = { enabled: parsed.enabled, paused: parsed.paused };
      }
    }
  } catch {
    // Notification preferences are optional; never modify note storage to repair them.
  }
  renderPushControls();
}

function savePushPreferences() {
  try { localStorage.setItem(PUSH_PREFERENCES_KEY, JSON.stringify(pushPreferences)); }
  catch { /* Push can still work for this session if browser storage is unavailable. */ }
  renderPushControls();
}

function renderPushControls(message) {
  const status = $("pushStatus");
  if (!status) return;
  if (message) status.textContent = message;
  else if (!PUSH_API_BASE) status.textContent = "The push backend is not connected yet. After deploying the Cloudflare Worker, set PUSH_API_BASE in app.js.";
  else if (!("Notification" in window) || !("PushManager" in window) || !("serviceWorker" in navigator)) status.textContent = "This browser does not support the required push notification features.";
  else if (!pushPreferences.enabled) status.textContent = "Notifications are off. Your notes remain stored on this device.";
  else if (pushPreferences.paused) status.textContent = "Notifications are paused. Your notes and daily goal are unchanged.";
  else status.textContent = "Notifications are enabled for 08:00–22:00 local time. Delivery depends on browser and device support.";
  $("enablePush").disabled = Boolean(pushPreferences.enabled);
  $("testPush").disabled = !PUSH_API_BASE || !pushPreferences.enabled || pushPreferences.paused;
  $("pausePush").disabled = !PUSH_API_BASE || !pushPreferences.enabled;
  $("pausePush").textContent = pushPreferences.paused ? "Resume notifications" : "Pause notifications";
  $("disablePush").disabled = !PUSH_API_BASE || !pushPreferences.enabled;
}

function base64UrlToBytes(value) {
  const padded = value + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function getPushDeviceToken() {
  let token = "";
  try { token = localStorage.getItem(PUSH_DEVICE_TOKEN_KEY) || ""; } catch { /* Continue with a session token. */ }
  if (/^[A-Za-z0-9_-]{40,100}$/.test(token)) return token;
  const bytes = new Uint8Array(32);
  if (!crypto || typeof crypto.getRandomValues !== "function") throw new Error("Secure token generation is unavailable in this browser.");
  crypto.getRandomValues(bytes);
  token = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  try { localStorage.setItem(PUSH_DEVICE_TOKEN_KEY, token); } catch { /* Token remains available for this session. */ }
  return token;
}

async function pushApi(path, options = {}, token = "") {
  if (!PUSH_API_BASE) throw new Error("The Cloudflare Worker URL has not been configured in app.js.");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["X-Device-Token"] = token;
  const response = await fetch(PUSH_API_BASE.replace(/\/+$/, "") + path, { ...options, headers });
  let result = {};
  try { result = await response.json(); } catch { /* Report the HTTP status below. */ }
  if (!response.ok) throw new Error(result.error || "Push service returned HTTP " + response.status + ".");
  return result;
}

async function enablePushNotifications() {
  try {
    if (!PUSH_API_BASE) {
      renderPushControls("The Cloudflare Worker has not been deployed/configured yet. No notification permission was requested.");
      return;
    }
    if (!("Notification" in window) || !("PushManager" in window) || !("serviceWorker" in navigator)) {
      renderPushControls("This browser does not support Web Push. Your notes are unaffected.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      renderPushControls(permission === "denied" ? "Notifications were denied. You can change this in your browser or phone settings." : "Notification permission was not granted.");
      return;
    }
    const config = await pushApi("/api/config");
    serviceWorkerRegistration = serviceWorkerRegistration || await navigator.serviceWorker.ready;
    let subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToBytes(config.publicKey)
      });
    }
    const deviceToken = getPushDeviceToken();
    const appUrl = new URL(location.href);
    appUrl.search = "";
    appUrl.hash = "";
    await pushApi("/api/subscribe", {
      method: "POST",
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        dailyGoal,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Johannesburg",
        startHour: 8,
        endHour: 22,
        appUrl: appUrl.href
      })
    }, deviceToken);
    pushPreferences = { enabled: true, paused: false };
    savePushPreferences();
    renderPushControls("Notifications are enabled. A test notification is available, and surprises are scheduled between 08:00 and 22:00 local time.");
  } catch (error) {
    renderPushControls(error instanceof Error ? error.message : "Could not enable notifications. Check your connection and try again.");
  }
}

async function syncPushSettings() {
  if (!PUSH_API_BASE || !pushPreferences.enabled) return;
  try {
    const deviceToken = getPushDeviceToken();
    await pushApi("/api/settings", {
      method: "POST",
      body: JSON.stringify({ dailyGoal, startHour: 8, endHour: 22 })
    }, deviceToken);
  } catch (error) {
    renderPushControls(error instanceof Error ? error.message : "Could not sync notification settings.");
  }
}

async function testPushNotification() {
  try {
    await pushApi("/api/test", { method: "POST", body: "{}" }, getPushDeviceToken());
    renderPushControls("Test notification sent to the push service. Delivery may take a short time.");
  } catch (error) {
    renderPushControls(error instanceof Error ? error.message : "Test notification failed.");
  }
}

async function togglePushPause() {
  try {
    const paused = !pushPreferences.paused;
    await pushApi("/api/pause", { method: "POST", body: JSON.stringify({ paused }) }, getPushDeviceToken());
    pushPreferences.paused = paused;
    savePushPreferences();
  } catch (error) {
    renderPushControls(error instanceof Error ? error.message : "Could not update notification pause state.");
  }
}

async function disablePushNotifications() {
  try {
    const deviceToken = getPushDeviceToken();
    await pushApi("/api/unsubscribe", { method: "POST", body: "{}" }, deviceToken);
    serviceWorkerRegistration = serviceWorkerRegistration || await navigator.serviceWorker.ready;
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription) await subscription.unsubscribe();
    pushPreferences = { enabled: false, paused: false };
    savePushPreferences();
    try {
      localStorage.removeItem(PUSH_PREFERENCES_KEY);
      localStorage.removeItem(PUSH_DEVICE_TOKEN_KEY);
    } catch { /* Local state can be cleared manually if storage is unavailable. */ }
    renderPushControls("Notifications are turned off. Your saved notes and reading progress were not changed.");
  } catch (error) {
    renderPushControls(error instanceof Error ? error.message : "Could not turn off notifications. Try again while online.");
  }
}

function startRandom() {
  scheduleNext();
  $("status").textContent = "Random surprises are on while this app is open. The next appearance time is unpredictable.";
  $("settingsStatus").textContent = "Surprises are active while this app is open and active.";
  $("startRandom").textContent = "Restart surprises";
}

function stopRandom() {
  clearTimeout(timerId);
  timerId = null;
  $("status").textContent = "Random surprises are paused.";
  $("settingsStatus").textContent = "Surprises are paused.";
}

$("showNow").addEventListener("click", () => {
  const note = pickNote();
  if (note) showNote(note.id);
});
document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => switchView(button.dataset.view)));
$("dailyGoal").addEventListener("change", saveDailyGoal);
$("noteSearch").addEventListener("input", renderExplore);
$("headerShowNow").addEventListener("click", () => { const note = pickNote(); if (note) showNote(note.id); });
$("startRandom").addEventListener("click", startRandom);
$("stopRandom").addEventListener("click", stopRandom);
$("enablePush").addEventListener("click", enablePushNotifications);
$("testPush").addEventListener("click", testPushNotification);
$("pausePush").addEventListener("click", togglePushPause);
$("disablePush").addEventListener("click", disablePushNotifications);
$("closeOverlay").addEventListener("click", closeNote);
$("doneNote").addEventListener("click", () => { markCurrentNoteRead(); closeNote(); });
$("anotherNote").addEventListener("click", () => {
  const note = pickNote();
  if (note) showNote(note.id);
});
$("noteOverlay").addEventListener("click", event => {
  if (event.target === $("noteOverlay")) closeNote();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeNote();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearTimeout(timerId);
    timerId = null;
  } else if ($("status").textContent.startsWith("Random surprises are on")) {
    scheduleNext();
  }
});

initialiseNotes();
loadDailyPreferences();
loadPushPreferences();
render();
renderExplore();
if (storageBlocked && storageWarningMessage) showStorageWarning();
if (new URLSearchParams(location.search).get("surprise") === "1" && notes.length) {
  const surpriseUrl = new URL(location.href);
  surpriseUrl.searchParams.delete("surprise");
  history.replaceState({}, "", surpriseUrl);
  const note = pickNote();
  if (note) showNote(note.id);
}

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").then(registration => {
    serviceWorkerRegistration = registration;
    renderPushControls();
  }).catch(() => renderPushControls("The service worker could not be registered. Reload the app and try again.")));
}
