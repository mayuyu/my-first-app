const STORAGE_KEY = "task-tide-todos-v1";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const count = document.querySelector("#task-count");
const clearCompletedBtn = document.querySelector("#clear-completed");
const template = document.querySelector("#todo-item-template");
const filterButtons = document.querySelectorAll(".filter-btn");

let todos = loadTodos();
let currentFilter = "all";

render();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    return;
  }

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: Date.now(),
  });

  input.value = "";
  saveTodos();
  render();
});

clearCompletedBtn.addEventListener("click", () => {
  const remaining = todos.filter((todo) => !todo.completed);
  if (remaining.length === todos.length) {
    return;
  }
  todos = remaining;
  saveTodos();
  render();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

function render() {
  const visibleTodos = getVisibleTodos();
  list.innerHTML = "";

  if (visibleTodos.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent =
      currentFilter === "all"
        ? "No tasks yet. Add your first task above."
        : `No ${currentFilter} tasks.`;
    list.appendChild(emptyItem);
  } else {
    visibleTodos.forEach((todo) => {
      const node = template.content.firstElementChild.cloneNode(true);
      const check = node.querySelector(".todo-check");
      const textNode = node.querySelector(".todo-text");
      const editBtn = node.querySelector(".edit-btn");
      const deleteBtn = node.querySelector(".delete-btn");

      check.checked = todo.completed;
      textNode.textContent = todo.text;
      node.classList.toggle("done", todo.completed);

      check.addEventListener("change", () => {
        todo.completed = check.checked;
        saveTodos();
        render();
      });

      editBtn.addEventListener("click", () => {
        const updated = prompt("Edit your task:", todo.text);
        if (updated === null) {
          return;
        }
        const value = updated.trim();
        if (!value) {
          return;
        }
        todo.text = value;
        saveTodos();
        render();
      });

      deleteBtn.addEventListener("click", () => {
        todos = todos.filter((item) => item.id !== todo.id);
        saveTodos();
        render();
      });

      list.appendChild(node);
    });
  }

  updateCount();
}

function updateCount() {
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const doneCount = todos.length - activeCount;

  if (todos.length === 0) {
    count.textContent = "0 tasks";
    return;
  }

  count.textContent = `${activeCount} active, ${doneCount} completed`;
}

function getVisibleTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.text === "string" &&
          typeof item.completed === "boolean"
      )
      .map((item) => ({
        id: item.id,
        text: item.text,
        completed: item.completed,
        createdAt:
          typeof item.createdAt === "number" ? item.createdAt : Date.now(),
      }));
  } catch {
    return [];
  }
}
