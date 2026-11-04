// Lista de tareas con almacenamiento en localStorage.
// Cada tarea tiene la forma { id, text, done }.

const STORAGE_KEY = 'tareas';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const emptyMsg = document.getElementById('empty-msg');

let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    // Si el dato guardado está corrupto, empezamos con una lista vacía.
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  list.textContent = '';

  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'task-item' + (task.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.id = 'task-' + task.id;
    checkbox.setAttribute('aria-label', 'Marcar como hecha: ' + task.text);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.className = 'task-text';
    label.textContent = task.text; // textContent evita inyectar HTML

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Borrar';
    deleteBtn.setAttribute('aria-label', 'Borrar tarea: ' + task.text);
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    item.append(checkbox, label, deleteBtn);
    list.appendChild(item);
  });

  emptyMsg.hidden = tasks.length > 0;
}

function addTask(text) {
  tasks.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), text, done: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = '';
  input.focus();
});

render();
