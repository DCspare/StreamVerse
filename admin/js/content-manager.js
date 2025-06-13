// admin/js/content-manager.js (Polished Version with Undo/Redo History)

let allContentData = []; // Cache for all content to enable searching/filtering
let undoStack = [];
let redoStack = [];

// --- Initialization ---
async function initializeContentManager() {
  document.getElementById("content-modal").classList.remove("visible");
  await loadContentTable();
  setupEventListeners();
  updateUndoRedoButtons();
}

// --- Event Listeners ---
function setupEventListeners() {
  document
    .getElementById("add-content-btn")
    .addEventListener("click", openAddModal);
  document.getElementById("undo-btn").addEventListener("click", handleUndo);
  document.getElementById("redo-btn").addEventListener("click", handleRedo);
  document
    .getElementById("content-form")
    .addEventListener("submit", handleFormSubmit);
  document
    .getElementById("search-input")
    .addEventListener("input", handleSearch);
  document
    .getElementById("content-type")
    .addEventListener("change", toggleSeriesFields);

  document
    .querySelectorAll(".close-modal")
    .forEach((btn) => btn.addEventListener("click", closeModal));

  document
    .getElementById("content-table-body")
    .addEventListener("click", (event) => {
      const button = event.target.closest("button.delete-btn, button.edit-btn");
      if (!button) return;

      if (button.classList.contains("edit-btn")) {
        openEditModal(button.dataset.id);
      } else if (button.classList.contains("delete-btn")) {
        handleDeleteConfirmation(button.dataset.id);
      }
    });
}

// --- Core Table & Search ---
async function loadContentTable() {
  try {
    const response = await fetch("/api/content");
    if (!response.ok) throw new Error("Network response was not ok.");
    allContentData = await response.json();
    renderTable(allContentData);
  } catch (error) {
    console.error("Error loading content:", error);
    const tableBody = document.getElementById("content-table-body");
    if (tableBody)
      tableBody.innerHTML = `<tr><td colspan="6" class="error-message">Error loading content.</td></tr>`;
  }
}

function renderTable(contentArray) {
  const tableBody = document.getElementById("content-table-body");
  tableBody.innerHTML = contentArray
    .map(
      (content) => `
    <tr data-id="${content.id}">
      <td class="table-poster-cell">
        <img src="${
          content.posterImage || "assets/images/placeholder_poster.png"
        }" alt="Poster" class="table-poster" onerror="this.onerror=null;this.src='assets/images/placeholder_poster.png';">
      </td>
      <td class="id-cell">${content.id}</td>
      <td>${content.title}</td>
      <td>${content.type}</td>
      <td>${content.year}</td>
      <td>
        <div class="action-buttons">
          <a href="/admin/media#${
            content.id
          }" class="btn btn-secondary btn-small">Media</a>
          <button class="btn btn-primary btn-small edit-btn" data-id="${
            content.id
          }">Edit</button>
          <button class="btn btn-danger btn-small delete-btn" data-id="${
            content.id
          }">Delete</button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const filteredContent = allContentData.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm) ||
      c.id.toLowerCase().includes(searchTerm)
  );
  renderTable(filteredContent);
}

// --- Form & Modal Logic ---
async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const contentId = form.dataset.id;
  const formData = new FormData(form);

  const data = Object.fromEntries(formData.entries());

  // FIX: Convert all comma-separated string fields to arrays before sending.
  const toArray = (str) =>
    str ? str.split(",").map((item) => item.trim()) : [];
  data.genres = toArray(data.genres);
  data.cast = toArray(data.cast);
  data.tags = toArray(data.tags);
  data.languages = toArray(data.languages);
  data.quality = toArray(data.quality);
  // Director can be a string or an array depending on the API design, but often it's just a string.
  // If your API expects an array for directors, uncomment the next line.
  // data.director = toArray(data.director);

  const isUpdate = !!contentId;
  const url = isUpdate ? `/api/content/${contentId}` : "/api/content";

  let oldContent = null;
  if (isUpdate) {
    oldContent = allContentData.find((c) => c.id === contentId);
  }

  try {
    const response = await fetch(url, {
      method: isUpdate ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const responseText = await response.text();
    if (!response.ok) {
      // Try to parse as JSON, but fall back to text if it fails
      try {
        throw new Error(JSON.parse(responseText).error || responseText);
      } catch (e) {
        throw new Error(responseText);
      }
    }
    const savedContent = JSON.parse(responseText);

    // Record action for undo/redo
    if (isUpdate) {
      recordAction({
        type: "update",
        oldContent: oldContent,
        newContent: savedContent,
      });
    } else {
      recordAction({ type: "create", content: savedContent });
    }

    closeModal();
    await loadContentTable();
    showNotification(
      `Content ${isUpdate ? "updated" : "added"} successfully!`,
      { type: "success" }
    );
  } catch (error) {
    showNotification(`Error: ${error.message}`, { type: "error" });
  }
}

function openModal() {
  document.getElementById("content-modal").classList.add("visible");
}

function closeModal() {
  document.getElementById("content-modal").classList.remove("visible");
}

function openAddModal() {
  const form = document.getElementById("content-form");
  form.reset();
  delete form.dataset.id;
  document.getElementById("modal-title").textContent = "Add New Content";
  document.getElementById("content-id-display").value = "";
  toggleSeriesFields();
  openModal();
}

function openEditModal(contentId) {
  const content = allContentData.find((c) => c.id === contentId);
  if (!content) return;

  const form = document.getElementById("content-form");
  form.reset();
  form.dataset.id = contentId;

  document.getElementById(
    "modal-title"
  ).textContent = `Edit Content: ${content.title}`;

  const safeJoin = (arr) => (Array.isArray(arr) ? arr.join(", ") : arr || "");

  form.querySelector("#content-id-display").value = content.id || "";
  form.querySelector("#content-title").value = content.title || "";
  form.querySelector("#content-type").value = content.type || "movie";
  form.querySelector("#content-description").value = content.description || "";
  form.querySelector("#content-fullDescription").value =
    content.fullDescription || "";
  form.querySelector("#content-year").value = content.year || "";
  form.querySelector("#content-rating").value = content.rating || "";
  form.querySelector("#content-director").value = safeJoin(content.director); // Director can be an array or string
  form.querySelector("#content-studio").value = content.studio || "";
  form.querySelector("#content-duration").value = content.duration || "";
  form.querySelector("#content-duration-series").value = content.duration || "";
  form.querySelector("#content-posterImage").value = content.posterImage || "";
  form.querySelector("#content-heroImage").value = content.heroImage || "";
  form.querySelector("#content-genres").value = safeJoin(content.genres);
  form.querySelector("#content-cast").value = safeJoin(content.cast);
  form.querySelector("#content-tags").value = safeJoin(content.tags);
  form.querySelector("#content-languages").value = safeJoin(content.languages);
  form.querySelector("#content-quality").value = safeJoin(content.quality);

  toggleSeriesFields();
  openModal();
}

function toggleSeriesFields() {
  const type = document.getElementById("content-type").value;
  const form = document.getElementById("content-form");

  form.querySelectorAll("[data-type-specific]").forEach((el) => {
    const types = el.dataset.typeSpecific.split(" ");
    el.style.display = types.includes(type) ? "block" : "none";
  });

  const movieDurationGroup = form.querySelector('[data-type-specific="movie"]');
  const seriesDurationGroup = form.querySelector(
    '[data-type-specific="webseries animes"]'
  );

  if (type === "movie") {
    if (seriesDurationGroup)
      seriesDurationGroup.querySelector("input").value = "";
  } else {
    if (movieDurationGroup)
      movieDurationGroup.querySelector("input").value = "";
  }
}

// --- Undo/Redo & Deletion Logic ---
function recordAction(action) {
  undoStack.push(action);
  redoStack = [];
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  document.getElementById("undo-btn").disabled = undoStack.length === 0;
  document.getElementById("redo-btn").disabled = redoStack.length === 0;
}

function handleDeleteConfirmation(contentId) {
  const content = allContentData.find((c) => c.id === contentId);
  if (!content) return;
  showNotification(`Permanently delete "${content.title}"?`, {
    type: "confirm",
    duration: 0,
    buttons: [
      {
        text: "Delete",
        class: "confirm-btn",
        action: () => performDelete(content),
      },
      { text: "Cancel", action: () => {} },
    ],
  });
}

async function performDelete(content) {
  try {
    const response = await fetch(`/api/content/${content.id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(await response.text());

    recordAction({ type: "delete", content: content });
    await loadContentTable();
    showNotification("Content deleted.", { type: "success" });
  } catch (error) {
    showNotification(`Error: ${error.message}`, { type: "error" });
  }
}

async function handleUndo() {
  if (undoStack.length === 0) return;
  const action = undoStack.pop();
  let promise;

  switch (action.type) {
    case "create":
      promise = fetch(`/api/content/${action.content.id}`, {
        method: "DELETE",
      });
      break;
    case "delete":
      promise = fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action.content),
      });
      break;
    case "update":
      promise = fetch(`/api/content/${action.oldContent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action.oldContent),
      });
      break;
  }

  try {
    const response = await promise;
    if (!response.ok) throw new Error(await response.text());
    redoStack.push(action);
    updateUndoRedoButtons();
    await loadContentTable();
    showNotification("Action undone.", { type: "info" });
  } catch (error) {
    undoStack.push(action);
    showNotification(`Undo failed: ${error.message}`, { type: "error" });
  }
}

async function handleRedo() {
  if (redoStack.length === 0) return;
  const action = redoStack.pop();
  let promise;

  switch (action.type) {
    case "create":
      promise = fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action.content),
      });
      break;
    case "delete":
      promise = fetch(`/api/content/${action.content.id}`, {
        method: "DELETE",
      });
      break;
    case "update":
      promise = fetch(`/api/content/${action.newContent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action.newContent),
      });
      break;
  }

  try {
    const response = await promise;
    if (!response.ok) throw new Error(await response.text());
    undoStack.push(action);
    updateUndoRedoButtons();
    await loadContentTable();
    showNotification("Action redone.", { type: "info" });
  } catch (error) {
    redoStack.push(action);
    showNotification(`Redo failed: ${error.message}`, { type: "error" });
  }
}
