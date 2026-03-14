const api = '/tasks';
let currentFilter = 'all';
// Local completion state (server model may not track it)
const completedIds = new Set();

/* ── Fetch & Render ── */
function loadTasks() {
  fetch(api)
    .then(res => res.json())
    .then(data => renderTasks(data));
}

function renderTasks(tasks) {
  const list = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');
  list.innerHTML = '';

  const total     = tasks.length;
  const doneCount = tasks.filter(t => completedIds.has(t.id)).length;
  const pending   = total - doneCount;

  document.getElementById('totalCount').textContent   = `${total} task${total !== 1 ? 's' : ''}`;
  document.getElementById('doneCount').textContent    = `${doneCount} done`;
  document.getElementById('pendingCount').textContent = `${pending} remaining`;

  const filtered = tasks.filter(t => {
    const done = completedIds.has(t.id);
    if (currentFilter === 'active')    return !done;
    if (currentFilter === 'completed') return done;
    return true;
  });

  if (filtered.length === 0) {
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    filtered.forEach((task, i) => {
      const done = completedIds.has(task.id);
      const li   = document.createElement('li');
      li.className = `task-item${done ? ' completed' : ''}`;
      li.style.animationDelay = `${i * 0.04}s`;

      /* Checkbox */
      const cb = document.createElement('input');
      cb.type      = 'checkbox';
      cb.className = 'task-check';
      cb.checked   = done;
      cb.addEventListener('change', () => toggleComplete(task.id, li, label));

      /* Label */
      const label = document.createElement('span');
      label.className = 'task-label';
      label.textContent = task.title;
      label.addEventListener('click', () => {
        cb.checked = !cb.checked;
        toggleComplete(task.id, li, label);
      });

      /* Delete */
      const del = document.createElement('button');
      del.className = 'delete-btn';
      del.innerHTML = '✕';
      del.title = 'Delete task';
      del.addEventListener('click', () => deleteTask(task.id));

      li.append(cb, label, del);
      list.appendChild(li);
    });
  }
}

/* ── Toggle Completion (local state) ── */
function toggleComplete(id, li, label) {
  if (completedIds.has(id)) {
    completedIds.delete(id);
    li.classList.remove('completed');
  } else {
    completedIds.add(id);
    li.classList.add('completed');
  }
  // Re-render stats & filters without a network call
  fetch(api)
    .then(r => r.json())
    .then(renderTasks);
}

/* ── Add Task ── */
function addTask() {
  const input = document.getElementById('taskInput');
  const title = input.value.trim();
  if (!title) { input.focus(); return; }

  fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })
    .then(() => { input.value = ''; loadTasks(); });
}

/* ── Delete Task ── */
function deleteTask(id) {
  completedIds.delete(id);
  fetch(`${api}/${id}`, { method: 'DELETE' })
    .then(() => loadTasks());
}

/* ── Filter ── */
function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  fetch(api).then(r => r.json()).then(renderTasks);
}

/* ── Init ── */
loadTasks();