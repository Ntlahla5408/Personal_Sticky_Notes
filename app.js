const KEY = "personal-sticky-notes-v1";
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
let notes = loadNotes();
let timerId = null;
let editingId = null;
let currentNoteId = null;

function loadNotes() {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : SEED_NOTES.map((n, i) => ({...n, id: `seed-${i}`, createdAt: Date.now()+i}));
  } catch {
    return SEED_NOTES.map((n, i) => ({...n, id: `seed-${i}`, createdAt: Date.now()+i}));
  }
}
function persist() { localStorage.setItem(KEY, JSON.stringify(notes)); }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function excerpt(body) {
  const text = body.trim();
  return text.length > 190 ? text.slice(0, 190).trimEnd() + "…" : text;
}
function render() {
  $("noteCount").textContent = `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;
  const list = $("notesList");
  if (!notes.length) {
    list.innerHTML = '<div class="empty">No notes yet. Choose “Write a note” to create your first one.</div>';
    return;
  }
  list.innerHTML = notes.map(n => `<article class="note-card">
    <h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(excerpt(n.body))}</p>
    <div class="card-actions">
      <button data-show="${escapeHtml(n.id)}">Read full note</button>
      <button class="secondary" data-edit="${escapeHtml(n.id)}">Edit</button>
      <button class="secondary" data-delete="${escapeHtml(n.id)}" aria-label="Delete ${escapeHtml(n.title)}">Delete</button>
    </div></article>`).join("");
  list.querySelectorAll("[data-show]").forEach(b => b.addEventListener("click", () => showNote(b.dataset.show)));
  list.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => editNote(b.dataset.edit)));
  list.querySelectorAll("[data-delete]").forEach(b => b.addEventListener("click", () => deleteNote(b.dataset.delete)));
}
function showNote(id) {
  const note = notes.find(n => n.id === id) || pickNote();
  if (!note) return;
  currentNoteId = note.id;
  $("popupTitle").textContent = note.title;
  $("popupBody").textContent = note.body;
  $("popupIndex").textContent = `${notes.findIndex(n => n.id === note.id)+1} of ${notes.length}`;
  $("noteOverlay").classList.remove("hidden");
  $("doneNote").focus();
}
function closeNote() { $("noteOverlay").classList.add("hidden"); }
function pickNote() {
  if (!notes.length) return null;
  const pool = notes.filter(n => n.id !== currentNoteId);
  const choices = pool.length ? pool : notes;
  return choices[Math.floor(Math.random() * choices.length)];
}
function randomDelay() {
  let min = Math.max(1, Number($("minMinutes").value) || 20);
  let max = Math.max(2, Number($("maxMinutes").value) || 90);
  if (max < min) [min, max] = [max, min];
  return (min + Math.random() * (max - min)) * 60 * 1000;
}
function scheduleNext() {
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    if (!document.hidden && notes.length) showNote(pickNote().id);
    scheduleNext();
  }, randomDelay());
}
function startRandom() {
  if (Number($("maxMinutes").value) < Number($("minMinutes").value)) {
    $("status").textContent = "Maximum interval must be greater than or equal to the minimum.";
    return;
  }
  scheduleNext();
  $("status").textContent = "Random notes are on while this app is open. The next appearance time is unpredictable.";
  $("startRandom").textContent = "Restart random notes";
}
function stopRandom() {
  clearTimeout(timerId); timerId = null;
  $("status").textContent = "Random notes are paused.";
}
function openEditor(note = null) {
  editingId = note ? note.id : null;
  $("editorHeading").textContent = note ? "Edit note" : "Write a note";
  $("noteTitle").value = note?.title || "";
  $("noteBody").value = note?.body || "";
  $("editorError").textContent = "";
  $("editorPanel").classList.remove("hidden");
  $("noteTitle").focus();
  $("editorPanel").scrollIntoView({behavior:"smooth", block:"start"});
}
function editNote(id) {
  const note = notes.find(n => n.id === id);
  if (note) openEditor(note);
}
function saveNote() {
  const title = $("noteTitle").value.trim();
  const body = $("noteBody").value.trim();
  if (!title || !body) {
    $("editorError").textContent = "Please enter both a title and the full note.";
    return;
  }
  if (editingId) {
    notes = notes.map(n => n.id === editingId ? {...n, title, body} : n);
  } else {
    notes.unshift({id: `note-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, title, body, createdAt: Date.now()});
  }
  persist(); render(); $("editorPanel").classList.add("hidden"); editingId = null;
}
function deleteNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note || !confirm(`Delete "${note.title}"?`)) return;
  notes = notes.filter(n => n.id !== id);
  persist(); render();
}
$("showNow").addEventListener("click", () => { const n = pickNote(); if (n) showNote(n.id); });
$("settingsToggle").addEventListener("click", () => $("settingsPanel").classList.toggle("hidden"));
$("addToggle").addEventListener("click", () => openEditor());
$("saveNote").addEventListener("click", saveNote);
$("cancelEdit").addEventListener("click", () => $("editorPanel").classList.add("hidden"));
$("startRandom").addEventListener("click", startRandom);
$("stopRandom").addEventListener("click", stopRandom);
$("closeOverlay").addEventListener("click", closeNote);
$("doneNote").addEventListener("click", closeNote);
$("anotherNote").addEventListener("click", () => { const n = pickNote(); if (n) showNote(n.id); });
$("noteOverlay").addEventListener("click", e => { if (e.target === $("noteOverlay")) closeNote(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeNote(); });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (timerId) clearTimeout(timerId);
  } else if ($("status").textContent.startsWith("Random notes are on")) {
    scheduleNext();
  }
});
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
persist();
render();
