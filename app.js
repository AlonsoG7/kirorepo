(function () {
  "use strict";

  const STORAGE_KEY = "kiro-todo-tasks";

  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const list = document.getElementById("task-list");
  const emptyMessage = document.getElementById("empty-message");

  let tasks = loadTasks();

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

  function render() {
    list.replaceChildren();

    tasks.forEach(function (task) {
      const item = document.createElement("li");
      if (task.done) {
        item.classList.add("done");
      }

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.id = "task-" + task.id;
      checkbox.setAttribute("aria-label", "Marcar como hecha: " + task.text);
      checkbox.addEventListener("change", function () {
        task.done = checkbox.checked;
        saveTasks();
        render();
      });

      const label = document.createElement("span");
      label.textContent = task.text;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-btn";
      deleteButton.textContent = "Borrar";
      deleteButton.setAttribute("aria-label", "Borrar tarea: " + task.text);
      deleteButton.addEventListener("click", function () {
        tasks = tasks.filter(function (t) {
          return t.id !== task.id;
        });
        saveTasks();
        render();
      });

      item.append(checkbox, label, deleteButton);
      list.appendChild(item);
    });

    emptyMessage.hidden = tasks.length > 0;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const text = input.value.trim();
    if (text === "") {
      return;
    }

    tasks.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      text: text,
      done: false
    });

    saveTasks();
    input.value = "";
    render();
    input.focus();
  });

  render();
})();
