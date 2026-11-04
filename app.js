(function () {
  "use strict";

  const STORAGE_KEY = "kiro-todo-tasks";

  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const list = document.getElementById("task-list");
  const emptyMessage = document.getElementById("empty-msg");
  const counter = document.getElementById("counter");
  const clearDoneButton = document.getElementById("clear-done");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let tasks = loadTasks();
  let currentFilter = "all";

  // Lee las tareas guardadas en localStorage. Si los datos están dañados, empieza vacío.
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function createId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function visibleTasks() {
    if (currentFilter === "pending") {
      return tasks.filter(function (t) { return !t.done; });
    }
    if (currentFilter === "done") {
      return tasks.filter(function (t) { return t.done; });
    }
    return tasks;
  }

  function updateCounter() {
    const pending = tasks.filter(function (t) { return !t.done; }).length;
    counter.textContent = tasks.length === 0
      ? "Sin tareas"
      : pending + " de " + tasks.length + " pendientes";
  }

  function updateEmptyMessage(shown) {
    if (tasks.length === 0) {
      emptyMessage.textContent = "No hay tareas todavía.";
    } else if (currentFilter === "pending") {
      emptyMessage.textContent = "No tienes tareas pendientes.";
    } else if (currentFilter === "done") {
      emptyMessage.textContent = "Todavía no hay tareas hechas.";
    }
    emptyMessage.hidden = shown.length > 0;
  }

  // Cambia la fila a modo edición. Enter o salir del campo guarda, Escape cancela.
  function startEditing(task, item, label) {
    const editor = document.createElement("input");
    editor.type = "text";
    editor.className = "edit-input";
    editor.value = task.text;
    editor.setAttribute("aria-label", "Editar tarea");

    item.replaceChild(editor, label);
    editor.focus();
    editor.select();

    let finished = false;

    function finish(save) {
      if (finished) {
        return;
      }
      finished = true;
      const value = editor.value.trim();
      if (save && value !== "") {
        task.text = value;
        saveTasks();
      }
      render();
    }

    editor.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        finish(true);
      } else if (event.key === "Escape") {
        finish(false);
      }
    });
    editor.addEventListener("blur", function () {
      finish(true);
    });
  }

  function createRow(task) {
    const item = document.createElement("li");
    if (task.done) {
      item.classList.add("done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Marcar como hecha: " + task.text);
    checkbox.addEventListener("change", function () {
      task.done = checkbox.checked;
      saveTasks();
      render();
    });

    const label = document.createElement("span");
    label.className = "task-label";
    label.textContent = task.text;
    label.title = "Doble clic para editar";
    label.addEventListener("dblclick", function () {
      startEditing(task, item, label);
    });

    const actions = document.createElement("div");
    actions.className = "row-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "small-btn";
    editButton.textContent = "Editar";
    editButton.setAttribute("aria-label", "Editar tarea: " + task.text);
    editButton.addEventListener("click", function () {
      startEditing(task, item, label);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "small-btn danger";
    deleteButton.textContent = "Borrar";
    deleteButton.setAttribute("aria-label", "Borrar tarea: " + task.text);
    deleteButton.addEventListener("click", function () {
      tasks = tasks.filter(function (t) { return t.id !== task.id; });
      saveTasks();
      render();
    });

    actions.append(editButton, deleteButton);
    item.append(checkbox, label, actions);
    return item;
  }

  function render() {
    const shown = visibleTasks();

    list.replaceChildren();
    shown.forEach(function (task) {
      list.appendChild(createRow(task));
    });

    updateCounter();
    updateEmptyMessage(shown);
    clearDoneButton.disabled = !tasks.some(function (t) { return t.done; });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const text = input.value.trim();
    if (text === "") {
      return;
    }

    tasks.push({ id: createId(), text: text, done: false });
    saveTasks();
    input.value = "";
    render();
    input.focus();
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentFilter = button.dataset.filter;
      filterButtons.forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === button));
      });
      render();
    });
  });

  clearDoneButton.addEventListener("click", function () {
    tasks = tasks.filter(function (t) { return !t.done; });
    saveTasks();
    render();
  });

  render();
})();
