// admin/js/media-manager.js (Dynamic UI Version)

let currentContentId = null;
let currentContentType = null;

function initializeMediaManager() {
  console.log("Media Manager view loaded.");
  const hash = window.location.hash.substring(1);
  currentContentId = hash;

  if (!currentContentId) {
    console.error("No content ID provided for media management.");
    document.getElementById(
      "admin-main-content"
    ).innerHTML = `<h2>Error: No Content ID specified.</h2><a href="/admin/content">Return to Content List</a>`;
    return;
  }

  loadMediaAndContentDetails();
  setupMediaFormListeners();
  setupEpisodeListeners(); // New listener setup
}

async function loadMediaAndContentDetails() {
  try {
    // Step 1: Fetch content details to get the title and type
    const contentRes = await fetch("/api/content");
    const allContent = await contentRes.json();
    const currentContent = allContent.find((c) => c.id === currentContentId);

    if (currentContent) {
      document.getElementById(
        "media-page-title"
      ).textContent = `Manage Media for: ${currentContent.title}`;
      currentContentType = currentContent.type; // Store the type
      updateMediaViewByType(currentContentType); // Show/hide sections based on type
    } else {
      document.getElementById(
        "media-page-title"
      ).textContent = `Media for Unknown Content`;
    }
    document.getElementById(
      "media-page-id"
    ).textContent = `ID: ${currentContentId}`;

    // Step 2: Fetch media details for this content ID
    const mediaRes = await fetch(`/api/media/${currentContentId}`);
    if (!mediaRes.ok) throw new Error("Failed to fetch media data.");
    const media = await mediaRes.json();

    renderTrailers(media.trailers || {});
    renderScreenshots(media.screenshots || []);

    if (currentContentType && currentContentType.toLowerCase() === "movie") {
      renderDownloadLinks(media.downloadLinks || {});
    }

    const type = currentContentType.toLowerCase();
    if (type === "webseries" || type === "animes") {
      loadSeasonsAndEpisodes(currentContentId);
    }
  } catch (error) {
    console.error("Error loading media:", error);
    showNotification("Error loading media data.", "error");
  }
}

function updateMediaViewByType(contentType) {
  const movieSection = document.getElementById("movie-downloads-section");
  const seriesSection = document.getElementById("series-episodes-section");

  if (!movieSection || !seriesSection) return;

  movieSection.style.display = "none";
  seriesSection.style.display = "none";

  const type = contentType.toLowerCase();

  if (type === "movie") {
    movieSection.style.display = "block";
  } else if (type === "webseries" || type === "animes") {
    seriesSection.style.display = "block";
  }
}

function setupMediaFormListeners() {
  document
    .getElementById("add-trailer-form")
    .addEventListener("submit", (e) => handleAddMedia(e, "trailers"));
  document
    .getElementById("add-screenshot-form")
    .addEventListener("submit", (e) => handleAddMedia(e, "screenshots"));

  const downloadLinkForm = document.getElementById("add-download-link-form");
  if (downloadLinkForm) {
    downloadLinkForm.addEventListener("submit", (e) =>
      handleAddMedia(e, "downloadLinks")
    );
  }

  document
    .getElementById("admin-main-content")
    .addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-media-btn")) {
        const button = e.target;
        const itemKey = button.dataset.key;
        const mediaType = button.dataset.type;
        handleDeleteMedia(mediaType, itemKey);
      }
    });
}

// Render Functions
function renderTrailers(trailers) {
  const list = document.getElementById("trailers-list");
  list.innerHTML =
    Object.keys(trailers).length === 0 ? "<li>No trailers yet.</li>" : "";
  for (const name in trailers) {
    const url = trailers[name];
    list.innerHTML += `<li><span><strong>${name}:</strong> ${url}</span><button class="delete-media-btn" data-type="trailers" data-key="${name}">×</button></li>`;
  }
}
function renderScreenshots(screenshots) {
  const list = document.getElementById("screenshots-list");
  list.innerHTML =
    screenshots.length === 0 ? "<li>No screenshots yet.</li>" : "";
  screenshots.forEach((url, index) => {
    list.innerHTML += `<li><span>${url}</span><button class="delete-media-btn" data-type="screenshots" data-key="${index}">×</button></li>`;
  });
}
function renderDownloadLinks(links) {
  const list = document.getElementById("download-links-list");
  list.innerHTML =
    Object.keys(links).length === 0 ? "<li>No download links yet.</li>" : "";
  for (const quality in links) {
    const url = links[quality];
    list.innerHTML += `<li><span><strong>${quality}:</strong> ${url}</span><button class="delete-media-btn" data-type="downloadLinks" data-key="${quality}">×</button></li>`;
  }
}

// API Interaction Functions (with Notifications)
async function handleAddMedia(event, mediaType) {
  event.preventDefault();
  let payload;
  if (mediaType === "trailers") {
    payload = {
      name: document.getElementById("trailer-name").value,
      url: document.getElementById("trailer-url").value,
    };
  } else if (mediaType === "screenshots") {
    payload = { url: document.getElementById("screenshot-url").value };
  } else if (mediaType === "downloadLinks") {
    payload = {
      quality: document.getElementById("download-quality").value,
      url: document.getElementById("download-url").value,
    };
  }

  if (!payload) return;

  try {
    const response = await fetch(
      `/api/media/${currentContentId}/${mediaType}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) throw new Error("Server request failed.");
    event.target.reset();
    showNotification("Media item added successfully!", "success");
    loadMediaAndContentDetails();
  } catch (error) {
    showNotification(`Error adding media: ${error.message}`, "error");
  }
}

async function handleDeleteMedia(mediaType, itemKey) {
  showNotification(
    "Are you sure you want to delete this item?",
    "confirm",
    async () => {
      try {
        const response = await fetch(
          `/api/media/${currentContentId}/${mediaType}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: itemKey }),
          }
        );
        if (!response.ok) throw new Error("Server request failed.");
        showNotification("Media item deleted.", "success");
        loadMediaAndContentDetails();
      } catch (error) {
        showNotification(`Error deleting media: ${error.message}`, "error");
      }
    }
  );
}

// --- Seasons & Episodes Logic ---

function setupEpisodeListeners() {
  const seriesSection = document.getElementById("series-episodes-section");
  if (!seriesSection) return;

  document
    .getElementById("add-season-form")
    .addEventListener("submit", handleAddSeason);

  const accordion = document.getElementById("seasons-accordion");
  accordion.addEventListener("click", (e) => {
    const header = e.target.closest(".season-header");
    if (header) {
      header.parentElement.classList.toggle("open");
      return;
    }

    const deleteSeasonBtn = e.target.closest(".delete-season-btn");
    if (deleteSeasonBtn) {
      handleDeleteSeason(deleteSeasonBtn.dataset.season);
      return;
    }

    const addEpisodeBtn = e.target.closest(".add-episode-btn");
    if (addEpisodeBtn) {
      showAddEpisodeForm(addEpisodeBtn.dataset.season);
      return;
    }

    const cancelEpisodeBtn = e.target.closest(".cancel-add-episode");
    if (cancelEpisodeBtn) {
      // Simply reload to cancel, which is cleaner than DOM manipulation
      loadSeasonsAndEpisodes(currentContentId);
      return;
    }

    const editEpisodeBtn = e.target.closest(".edit-episode-btn");
    if (editEpisodeBtn) {
      showEditEpisodeForm(editEpisodeBtn);
      return;
    }

    const deleteEpisodeBtn = e.target.closest(".delete-episode-btn");
    if (deleteEpisodeBtn) {
      const { season, quality, index } = deleteEpisodeBtn.dataset;
      handleDeleteEpisode(season, quality, index);
    }
  });

  accordion.addEventListener("submit", (e) => {
    if (e.target.classList.contains("add-episode-form")) {
      e.preventDefault();
      const form = e.target;
      const seasonNumber = form.dataset.season;
      if (form.dataset.mode === "edit") {
        handleUpdateEpisode(form, seasonNumber);
      } else {
        handleAddEpisode(form, seasonNumber);
      }
    }
  });
}

async function loadSeasonsAndEpisodes(contentId) {
  try {
    const res = await fetch(`/api/episodes/${contentId}`);
    if (!res.ok) throw new Error("Failed to fetch episodes data.");
    const data = await res.json();
    renderSeasonsAndEpisodes(data.seasons || {});
  } catch (error) {
    console.error("Error loading episodes:", error);
    showNotification("Error loading episode data.", "error");
    document.getElementById(
      "seasons-accordion"
    ).innerHTML = `<div class="placeholder-box">Could not load episode data.</div>`;
  }
}

function renderSeasonsAndEpisodes(seasons) {
  const accordion = document.getElementById("seasons-accordion");
  const seasonNumbers = Object.keys(seasons).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  if (seasonNumbers.length === 0) {
    accordion.innerHTML = `<div class="placeholder-box">No seasons yet. Add one above.</div>`;
    return;
  }

  accordion.innerHTML = "";

  for (const seasonNumber of seasonNumbers) {
    const seasonData = seasons[seasonNumber];
    const seasonItem = document.createElement("div");
    seasonItem.className = "season-item";

    let episodesHTML = "";
    const qualities = Object.keys(seasonData.qualities || {}).sort();

    if (qualities.length > 0) {
      for (const quality of qualities) {
        const episodes = seasonData.qualities[quality];
        episodesHTML += `
                    <div class="episodes-by-quality">
                        <h4>${quality}</h4>
                        <ul class="episode-list">
                            ${episodes
                              .map(
                                (ep, index) => `
                                <li>
                                    <div class="episode-info">
                                        <span class="ep-num">Ep ${ep.episodeNumber}</span>
                                        <span class="ep-title">${ep.title}</span>
                                        <span class="ep-url" title="${ep.downloadUrl}">${ep.downloadUrl}</span>
                                    </div>
                                    <div class="episode-actions">
                                        <button class="btn-icon edit-episode-btn"
                                            data-season="${seasonNumber}"
                                            data-quality="${quality}"
                                            data-episode-number="${ep.episodeNumber}"
                                            data-title="${ep.title}"
                                            data-url="${ep.downloadUrl}"
                                            title="Edit Episode">
                                            <i class="ri-pencil-line"></i>
                                        </button>
                                        <button class="btn-icon delete-episode-btn" data-season="${seasonNumber}" data-quality="${quality}" data-index="${index}" title="Delete Episode">
                                            <i class="ri-delete-bin-line"></i>
                                        </button>
                                    </div>
                                </li>
                            `
                              )
                              .join("")}
                        </ul>
                    </div>
                `;
      }
    } else {
      episodesHTML = `<div class="placeholder-box" style="margin-bottom: 1rem;">No episodes for this season.</div>`;
    }

    seasonItem.innerHTML = `
            <div class="season-header">
                <h3>Season ${seasonNumber}</h3>
                <div class="actions">
                    <button class="btn btn-secondary delete-season-btn" data-season="${seasonNumber}">Delete Season</button>
                </div>
            </div>
            <div class="season-content">
                ${episodesHTML}
                <div class="add-episode-btn-container">
                     <button class="btn btn-primary add-episode-btn" data-season="${seasonNumber}">Add Episode</button>
                </div>
            </div>
        `;

    accordion.appendChild(seasonItem);
  }
}

function showAddEpisodeForm(seasonNumber) {
  const existingForm = document.querySelector(".add-episode-form");
  if (existingForm) existingForm.remove();

  const template = document.getElementById("add-episode-form-template");
  const formClone = template.content.cloneNode(true);
  const form = formClone.querySelector("form");
  form.dataset.season = seasonNumber;

  const seasonItem = document
    .querySelector(`.delete-season-btn[data-season="${seasonNumber}"]`)
    .closest(".season-item");
  const content = seasonItem.querySelector(".season-content");
  content.appendChild(form);
  form.querySelector("input").focus();
}

function showEditEpisodeForm(button) {
  const { season, quality, episodeNumber, title, url } = button.dataset;
  const listItem = button.closest("li");

  const template = document.getElementById("add-episode-form-template");
  const formClone = template.content.cloneNode(true);
  const form = formClone.querySelector("form");

  form.dataset.mode = "edit";
  form.dataset.season = season;
  form.dataset.originalQuality = quality;
  form.dataset.originalEpisodeNumber = episodeNumber;

  form.querySelector("h4").textContent = `Edit Episode ${episodeNumber}`;
  form.querySelector('[name="episodeNumber"]').value = episodeNumber;
  form.querySelector('[name="title"]').value = title;
  form.querySelector('[name="quality"]').value = quality;
  form.querySelector('[name="downloadUrl"]').value = url;
  form.querySelector('[type="submit"]').textContent = "Update Episode";

  // Replace the <li> with a container holding the form
  const formContainer = document.createElement("li");
  formContainer.className = "episode-edit-form-container";
  formContainer.appendChild(formClone);
  listItem.replaceWith(formContainer);
  form.querySelector("input").focus();
}

async function handleAddSeason(event) {
  event.preventDefault();
  const input = document.getElementById("season-number-input");
  const seasonNumber = input.value;
  if (!seasonNumber) return;

  try {
    const response = await fetch(`/api/episodes/${currentContentId}/seasons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seasonNumber }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Server request failed.");

    showNotification(`Season ${seasonNumber} added successfully!`, "success");
    input.value = "";
    loadSeasonsAndEpisodes(currentContentId);
  } catch (error) {
    showNotification(`Error adding season: ${error.message}`, "error");
  }
}

async function handleDeleteSeason(seasonNumber) {
  showNotification(
    `Are you sure you want to delete Season ${seasonNumber} and all its episodes?`,
    "confirm",
    async () => {
      try {
        const response = await fetch(
          `/api/episodes/${currentContentId}/seasons/${seasonNumber}`,
          { method: "DELETE" }
        );
        if (!response.ok) throw new Error("Server request failed.");

        showNotification(`Season ${seasonNumber} deleted.`, "success");
        loadSeasonsAndEpisodes(currentContentId);
      } catch (error) {
        showNotification(`Error deleting season: ${error.message}`, "error");
      }
    }
  );
}

async function handleAddEpisode(form, seasonNumber) {
  const formData = new FormData(form);
  const episodeData = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(
      `/api/episodes/${currentContentId}/seasons/${seasonNumber}/episodes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(episodeData),
      }
    );
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Server request failed.");

    showNotification("Episode added successfully!", "success");
    loadSeasonsAndEpisodes(currentContentId);
  } catch (error) {
    showNotification(`Error adding episode: ${error.message}`, "error");
  }
}

async function handleUpdateEpisode(form, seasonNumber) {
  const formData = new FormData(form);
  const updatedEpisode = Object.fromEntries(formData.entries());
  const { originalQuality, originalEpisodeNumber } = form.dataset;

  const payload = {
    originalQuality,
    originalEpisodeNumber,
    updatedEpisode,
  };

  try {
    const response = await fetch(
      `/api/episodes/${currentContentId}/seasons/${seasonNumber}/episodes`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Server request failed.");

    showNotification("Episode updated successfully!", "success");
    loadSeasonsAndEpisodes(currentContentId);
  } catch (error) {
    showNotification(`Error updating episode: ${error.message}`, "error");
  }
}

async function handleDeleteEpisode(seasonNumber, quality, index) {
  const episodeKey = `${quality}:${index}`;
  showNotification(
    `Are you sure you want to delete this episode?`,
    "confirm",
    async () => {
      try {
        const response = await fetch(
          `/api/episodes/${currentContentId}/seasons/${seasonNumber}/episodes`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: episodeKey }),
          }
        );
        if (!response.ok) throw new Error("Server request failed.");
        showNotification("Episode deleted successfully.", "success");
        loadSeasonsAndEpisodes(currentContentId);
      } catch (error) {
        showNotification(`Error deleting episode: ${error.message}`, "error");
      }
    }
  );
}
