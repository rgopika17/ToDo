// ---------- State ----------
let tasks = [];
let filter = "all";
const COLORS = ["#2dd4bf", "#fbbf24", "#fb7185", "#a78bfa"];

const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");
const barEl = document.getElementById("bar");
const clearBtn = document.getElementById("clearDone");

// ---------- Core functions ----------

// Add a task dynamically
function addTask(text) {
  const clean = text.trim();
  if (!clean) return;
  tasks.push({ id: Date.now() + Math.random(), text: clean, done: false });
  save();
  render();
}

// Update task status (completed / not completed)
function toggleTask(id) {
  const t = tasks.find((task) => task.id === id);
  if (t) t.done = !t.done;
  save();
  render();
}

// Remove a task from the list
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  save();
  render();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.done);
  save();
  render();
}

// ---------- Rendering ----------
function buildItem(task, index) {
  const li = document.createElement("li");
  li.dataset.id = task.id;
  li.style.setProperty("--c", COLORS[index % COLORS.length]);
  if (task.done) li.classList.add("done");

  const tick = document.createElement("button");
  tick.className = "tick";
  tick.dataset.action = "toggle";
  tick.setAttribute("aria-label", task.done ? "Mark as not done" : "Mark as done");
  tick.setAttribute("aria-pressed", String(task.done));
  tick.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const span = document.createElement("span");
  span.className = "text";
  span.textContent = task.text;      // textContent keeps user input safe

  const del = document.createElement("button");
  del.className = "del";
  del.dataset.action = "delete";
  del.setAttribute("aria-label", "Delete task");
  del.textContent = "×";

  li.append(tick, span, del);
  return li;
}

function render() {
  const visible = tasks.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  list.replaceChildren(...visible.map((t) => buildItem(t, tasks.indexOf(t))));

  const doneCount = tasks.filter((t) => t.done).length;
  barEl.style.width = tasks.length ? (doneCount / tasks.length) * 100 + "%" : "0";
  countEl.textContent = tasks.length
    ? doneCount + " of " + tasks.length + " done"
    : "Nothing yet";

  emptyEl.hidden = visible.length > 0;
  emptyEl.textContent = tasks.length === 0
    ? "Your list is empty. Add your first task above."
    : filter === "done" ? "No finished tasks yet." : "Everything here is done.";

  clearBtn.hidden = doneCount === 0;
}

// ---------- Storage (optional, fails safely) ----------
function save() {
  try { localStorage.setItem("todo-tasks", JSON.stringify(tasks)); } catch (e) {}
}
function load() {
  try { tasks = JSON.parse(localStorage.getItem("todo-tasks")) || []; } catch (e) { tasks = []; }
}

// ---------- Events ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(input.value);
  input.value = "";
  input.focus();
});

list.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = Number(btn.closest("li").dataset.id);
  if (btn.dataset.action === "toggle") toggleTask(id);
  else if (btn.dataset.action === "delete") deleteTask(id);
});

document.getElementById("filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  filter = chip.dataset.filter;
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === chip));
  render();
});

clearBtn.addEventListener("click", clearCompleted);

// ---------- Init ----------
document.getElementById("date").textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "long", day: "numeric", month: "long"
});
load();
render();
