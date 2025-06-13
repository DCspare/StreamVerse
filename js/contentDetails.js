// js/contentDetails.js (Corrected - Final for Watchlist)

// --- GLOBAL HELPER ---
function createCustomDropdown(placeholderId, label, options, onSelectCallback) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  placeholder.innerHTML = `
        <div class="custom-select-wrapper">
            <button type="button" class="custom-select-trigger" data-value="">${label}</button>
            <div class="custom-select-options"></div>
        </div>
    `;

  const wrapper = placeholder.querySelector(".custom-select-wrapper");
  const trigger = wrapper.querySelector(".custom-select-trigger");
  const optionsContainer = wrapper.querySelector(".custom-select-options");

  options.forEach((opt) => {
    const optionEl = document.createElement("div");
    optionEl.className = "custom-select-option";
    optionEl.dataset.value = opt.value;
    optionEl.textContent = opt.text;
    optionEl.addEventListener("click", () => {
      trigger.textContent = opt.text;
      trigger.dataset.value = opt.value;
      trigger.classList.remove("active");
      optionsContainer.classList.remove("active");
      optionsContainer
        .querySelectorAll(".custom-select-option")
        .forEach((o) => o.classList.remove("selected"));
      optionEl.classList.add("selected");
      if (onSelectCallback) onSelectCallback(opt.value);
    });
    optionsContainer.appendChild(optionEl);
  });

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isActive = optionsContainer.classList.contains("active");
    document
      .querySelectorAll(".custom-select-options.active")
      .forEach((d) => d.classList.remove("active"));
    document
      .querySelectorAll(".custom-select-trigger.active")
      .forEach((t) => t.classList.remove("active"));
    if (!isActive) {
      optionsContainer.classList.add("active");
      trigger.classList.add("active");
    }
  });
}

document.addEventListener("click", () => {
  document
    .querySelectorAll(".custom-select-options.active")
    .forEach((d) => d.classList.remove("active"));
  document
    .querySelectorAll(".custom-select-trigger.active")
    .forEach((t) => t.classList.remove("active"));
});

// --- MAIN EXECUTION ---
document.addEventListener("DOMContentLoaded", async function () {
  const contentDetailSection = document.getElementById("contentDetailSection");
  const preloader = document.getElementById("preloader");
  if (typeof ensureTemplatesLoaded === "function") {
    await ensureTemplatesLoaded();
  }
  await getAllContent();

  if (contentDetailSection) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const contentId = urlParams.get("id");
      if (contentId) {
        await displayContentDetails(contentId);
      } else {
        contentDetailSection.innerHTML =
          '<p class="empty-message">Content ID not found in URL.</p>';
      }
    } catch (error) {
      console.error("Error displaying content details:", error);
      contentDetailSection.innerHTML =
        '<p class="empty-message">Could not load content details.</p>';
    } finally {
      if (preloader) preloader.classList.add("loaded");
    }
  } else {
    if (preloader) preloader.classList.add("loaded");
  }

  window.addEventListener("userLoggedIn", updateCommentFormState);
  
  initializePageEventListeners();
});

function initializePageEventListeners() {
    const contentDetailSection = document.getElementById("contentDetailSection");
    const lightbox = document.getElementById("screenshotLightbox");
    const closeLightboxBtn = document.getElementById("closeLightboxBtn");

    if (contentDetailSection) {
        contentDetailSection.addEventListener('click', (e) => {
            const watchlistBtn = e.target.closest('.watchlist-icon-btn');
            if (watchlistBtn) {
                e.preventDefault();
                const contentId = watchlistBtn.dataset.contentId;
                // [THE FIX] Called the correct function from watchlist.js: addToWatchlist
                if (contentId && typeof window.addToWatchlist === 'function') {
                    window.addToWatchlist(contentId);
                } else {
                    console.error("Watchlist function not available or contentId missing.");
                    showNotification("Could not update watchlist.", "error");
                }
            }
        });
    }

    if (lightbox && closeLightboxBtn) {
        closeLightboxBtn.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (e) => {
            if (e.target.id === "screenshotLightbox") {
                closeLightbox();
            }
        });
    }
}


async function displayContentDetails(contentId) {
    const [item, mediaData, episodeData, allSubmissions] = await Promise.all([
        getContentById(contentId),
        getMediaById(contentId),
        getEpisodesById(contentId),
        getCommentsById(contentId),
    ]);
    if (!item) {
        document.getElementById("contentDetailSection").innerHTML =
            '<p class="empty-message">Content not found.</p>';
        return;
    }
    populateBannerAndInfo(item);
    displayMedia(mediaData, item.title);
    if (item.type.toLowerCase() === "movie") {
        displayMovieDownloads(mediaData.downloadLinks, item.title);
    } else {
        displaySeriesDownloads(episodeData, item.title);
    }
    displayCommentsAndForm(contentId, allSubmissions);
    displayRelatedContent(item);
}


function populateBannerAndInfo(item) {
  document.title = `StreamVerse - ${item.title}`;

  const banner = document.getElementById("movieDetailBanner");
  if (banner && item.heroImage) {
    banner.style.backgroundImage = `url('${item.heroImage}')`;
  }

  const poster = document.getElementById("moviePoster");
  if (poster) {
    poster.src = item.posterImage || "assets/images/placeholder_poster.png";
    poster.alt = item.title;
    poster.onerror = () => {
      poster.src = "assets/images/placeholder_poster.png";
    };
  }

  document.getElementById("contentTitleText").textContent = item.title;

  const watchlistBtn = document.querySelector(".watchlist-icon-btn");
  if (watchlistBtn) {
    watchlistBtn.dataset.contentId = item.id;
    if (typeof window.updateWatchlistButtonState === "function") {
      window.updateWatchlistButtonState(watchlistBtn, item.id);
    }
  }

  document.getElementById("contentYear").textContent = item.year || "N/A";
  document.getElementById("contentDuration").textContent =
    item.duration || "N/A";
  document.getElementById("contentGenres").textContent = Array.isArray(
    item.genres
  )
    ? item.genres.join(", ")
    : "N/A";

  document.getElementById("contentDescription").textContent =
    item.description || "No description available.";

  document.getElementById("contentLanguages").textContent = Array.isArray(
    item.languages
  )
    ? item.languages.join(", ")
    : "N/A";
  document.getElementById("contentQuality").textContent = Array.isArray(
    item.quality
  )
    ? item.quality.join(", ")
    : "N/A";

  document.getElementById("infoDirectorStudio").textContent =
    item.director || item.studio || "N/A";
  document.getElementById("infoCast").textContent = Array.isArray(item.cast)
    ? item.cast.join(", ")
    : "N/A";
  document.getElementById("infoReleaseDate").textContent = item.year || "N/A";
  document.getElementById("infoCountry").textContent = "N/A";

  document.getElementById("storylineText").textContent =
    item.fullDescription ||
    item.description ||
    "No detailed storyline available.";
}

function displayMedia(mediaData, title) {
  const mediaContainer = document.getElementById("mediaContainer");
  if (!mediaContainer) return;
  mediaContainer.innerHTML = "";
  let mediaHTML = "";
  if (mediaData.trailers && Object.keys(mediaData.trailers).length > 0) {
    mediaHTML += `<div class="trailer-container"><iframe id="contentTrailer" src="${
      Object.values(mediaData.trailers)[0]
    }" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  if (mediaData.screenshots && mediaData.screenshots.length > 0) {
    mediaHTML += '<div class="screenshots-grid" id="screenshotsGrid">';
    mediaData.screenshots.forEach((url) => {
      mediaHTML += `<img src="${url}" alt="Screenshot of ${title}" class="screenshot-item">`;
    });
    mediaHTML += "</div>";
  }
  if (!mediaHTML) {
    mediaHTML += '<p class="empty-message">No media available.</p>';
  }
  mediaContainer.innerHTML = mediaHTML;
  mediaContainer.querySelectorAll(".screenshot-item").forEach((img) => {
    img.addEventListener("click", () => openLightbox(img.src));
  });
}

function openLightbox(src) {
  const lightbox = document.getElementById("screenshotLightbox");
  const lightboxImg = document.getElementById("lightboxImage");
  if (lightbox && lightboxImg) {
    lightboxImg.src = src;
    lightbox.classList.remove("hidden");
    document.body.classList.add("lightbox-open");
  }
}

function closeLightbox() {
  const lightbox = document.getElementById("screenshotLightbox");
  if (lightbox) {
    lightbox.classList.add("hidden");
    document.body.classList.remove("lightbox-open");
  }
}

function displayMovieDownloads(downloadLinks, title) {
  const movieSection = document.getElementById("movieDownloadSection");
  const seriesSection = document.getElementById("seriesDownloadSection");
  movieSection.classList.remove("hidden");
  seriesSection.classList.add("hidden");

  if (!downloadLinks || Object.keys(downloadLinks).length === 0) {
    movieSection.innerHTML =
      '<p class="empty-message">No download links available for this movie.</p>';
    return;
  }

  // [MODIFIED] Create a separate section for each download quality
  let linksHTML = '<div class="download-quality-options">';

  for (const quality in downloadLinks) {
    linksHTML += `
      <div class="download-subsection">
        <h3>Download in ${quality}</h3>
        <div class="download-links">
          <a href="${downloadLinks[quality]}" class="btn btn-secondary download-btn-link" target="_blank">Download Link</a>
        </div>
      </div>
    `;
  }

  linksHTML += '</div>';
  movieSection.innerHTML = linksHTML;
}

function displaySeriesDownloads(episodeData, title) {
  const movieSection = document.getElementById("movieDownloadSection");
  const seriesSection = document.getElementById("seriesDownloadSection");
  const controlsContainer = document.getElementById("series-download-controls");
  const zipContainer = document.getElementById("series-zip-container");

  movieSection.classList.add("hidden");
  seriesSection.classList.remove("hidden");
  controlsContainer.innerHTML = "";
  zipContainer.innerHTML = "";

  const { seasons, zipFiles } = episodeData;

  if (!seasons || Object.keys(seasons).length === 0) {
    controlsContainer.innerHTML =
      '<p class="empty-message">No episodes have been added for this series yet.</p>';
    return;
  }

  controlsContainer.innerHTML = `
        <div class="series-selectors-wrapper">
            <div id="season-dropdown-placeholder"></div>
            <div id="quality-dropdown-placeholder"></div>
        </div>
        <div class="episode-list-container hidden"></div>
    `;

  const seasonOptions = Object.keys(seasons).map((num) => ({
    value: num,
    text: `Season ${num}`,
  }));

  createCustomDropdown(
    "season-dropdown-placeholder",
    "Select Season",
    seasonOptions,
    (selectedSeason) => {
      const qualityPlaceholder = document.getElementById(
        "quality-dropdown-placeholder"
      );
      const episodeContainer = controlsContainer.querySelector(
        ".episode-list-container"
      );
      qualityPlaceholder.innerHTML = "";
      episodeContainer.innerHTML = "";
      episodeContainer.classList.add("hidden");

      if (!selectedSeason) return;

      const qualityOptions = Object.keys(seasons[selectedSeason].qualities).map(
        (q) => ({ value: q, text: q.toUpperCase() })
      );

      createCustomDropdown(
        "quality-dropdown-placeholder",
        "Select Quality",
        qualityOptions,
        (selectedQuality) => {
          episodeContainer.innerHTML = "";
          episodeContainer.classList.add("hidden");
          if (!selectedQuality) return;

          const episodes = seasons[selectedSeason].qualities[selectedQuality];
          const episodeList = document.createElement("ul");
          episodeList.className = "download-episode-list";

          episodes.forEach((ep) => {
            const episodeItem = document.createElement("li");
            episodeItem.innerHTML = `<a href="${
              ep.downloadUrl
            }" target="_blank">S${String(selectedSeason).padStart(
              2,
              "0"
            )}-E${String(ep.episodeNumber).padStart(2, "0")}: "${
              ep.title
            }"</a>`;
            episodeList.appendChild(episodeItem);
          });

          episodeContainer.appendChild(episodeList);
          episodeContainer.classList.remove("hidden");
        }
      );
    }
  );

  if (zipFiles && zipFiles.length > 0) {
    let zipHTML = `<div class="download-subsection"><h3>${title} - ZIP Files</h3><div class="download-links">`;
    zipFiles.forEach((zip) => {
      zipHTML += `<a href="${zip.url}" class="btn btn-primary download-btn-link" target="_blank">${zip.label}</a>`;
    });
    zipHTML += `</div></div>`;
    zipContainer.innerHTML = zipHTML;
  }
}

function updateCommentFormState() {
  const prompt = document.getElementById("commentLoginPrompt");
  const form = document.getElementById("commentForm");
  const emailGroup = document.getElementById("comment-email-group"); 
  const emailInput = document.getElementById("comment-email");
  const usernameInput = document.getElementById("comment-username");

  const loggedInUserEmail = localStorage.getItem("loggedInUser");

  if (!prompt || !form || !emailGroup || !emailInput || !usernameInput) {
    return;
  }

  if (loggedInUserEmail) {
    const users = JSON.parse(localStorage.getItem("streamVerseUsers") || "[]");
    const currentUser = users.find((u) => u.email === loggedInUserEmail);

    if (currentUser) {
      prompt.classList.add("hidden");
      form.classList.remove("hidden");
      emailGroup.classList.remove("hidden"); 
      usernameInput.value = currentUser.username;
      emailInput.value = currentUser.email;
    } else {
      prompt.classList.remove("hidden");
      form.classList.add("hidden");
      emailGroup.classList.add("hidden");
    }
  } else {
    prompt.classList.remove("hidden");
    form.classList.add("hidden");
    emailGroup.classList.add("hidden");
  }
}

function displayCommentsAndForm(contentId, allSubmissions = []) {
    const commentsList = document.getElementById("commentsList");
    const requestsList = document.getElementById("requestsList");
    const commentsTab = document.querySelector('[data-tab="comments"] .tab-count');
    const requestsTab = document.querySelector('[data-tab="requests"] .tab-count');
    
    commentsList.innerHTML = '';
    requestsList.innerHTML = '';

    const comments = allSubmissions.filter(s => s.type === 'comment');
    const requests = allSubmissions.filter(s => s.type === 'request');

    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="empty-message">No comments yet. Be the first to comment!</p>';
    } else {
        comments.forEach(c => commentsList.appendChild(createCommentElement(c)));
    }

    if (requests.length === 0) {
        requestsList.innerHTML = '<p class="empty-message">No requests have been made for this content yet.</p>';
    } else {
        requests.forEach(r => requestsList.appendChild(createCommentElement(r)));
    }

    if (commentsTab) commentsTab.textContent = comments.length;
    if (requestsTab) requestsTab.textContent = requests.length;

    updateCommentFormState();

    const commentForm = document.getElementById("commentForm");
    const submitBtn = document.getElementById("commentSubmitBtn");
    const commentText = document.getElementById("comment-text");
    const typeDropdownPlaceholder = document.getElementById("comment-type-dropdown-placeholder");

    const updateFormUI = (type) => {
        if (type === 'request') {
            submitBtn.textContent = "Submit Request";
            commentText.placeholder = 'e.g., "Request for 1080p version" or "Request for subtitles"';
        } else {
            submitBtn.textContent = "Submit Comment";
            commentText.placeholder = 'Write a public comment...';
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        
        const typeTrigger = typeDropdownPlaceholder.querySelector(".custom-select-trigger");
        const type = typeTrigger ? typeTrigger.dataset.value : "";
        const text = commentText.value.trim();
        const loggedInUserEmail = localStorage.getItem("loggedInUser");

        if (!loggedInUserEmail) return showNotification("You must be logged in to post.", "error");
        if (!type) return showNotification("Please select a submission type (Comment or Request).", "error");
        if (!text) return showNotification("Please enter a message.", "error");

        const users = JSON.parse(localStorage.getItem("streamVerseUsers") || "[]");
        const currentUser = users.find((u) => u.email === loggedInUserEmail);

        if (!currentUser) return showNotification("Could not verify user. Please log in again.", "error");
        
        const submissionData = {
            text: text,
            user: { name: currentUser.username, email: currentUser.email },
        };

        try {
            let savedPost;
            if (type === "comment") {
                savedPost = await postComment(contentId, submissionData);
                if (commentsList.querySelector('.empty-message')) commentsList.innerHTML = '';
                commentsList.prepend(createCommentElement(savedPost));
                if (commentsTab) commentsTab.textContent = parseInt(commentsTab.textContent, 10) + 1;
            } else { // type === 'request'
                submissionData.contentId = contentId;
                savedPost = await postRequest(submissionData);
                if (requestsList.querySelector('.empty-message')) requestsList.innerHTML = '';
                requestsList.prepend(createCommentElement(savedPost));
                if (requestsTab) requestsTab.textContent = parseInt(requestsTab.textContent, 10) + 1;
            }

            if (!savedPost) {
                 throw new Error("API did not return the saved post.");
            }

            showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} submitted successfully!`, 'success');
            commentForm.reset();
            
            const trigger = typeDropdownPlaceholder.querySelector(".custom-select-trigger");
            if(trigger) {
                trigger.textContent = 'Comment';
                trigger.dataset.value = 'comment';
            }
            updateFormUI('comment');

        } catch (error) {
            console.error('Failed to submit post:', error);
            showNotification('Failed to submit. Please try again.', 'error');
        }
    };
    
    commentForm.onsubmit = null; 
    commentForm.addEventListener('submit', handleFormSubmit);

    const commentTypeOptions = [
        { value: "comment", text: "Comment" },
        { value: "request", text: "Request" },
    ];
    createCustomDropdown("comment-type-dropdown-placeholder", "Comment", commentTypeOptions, updateFormUI);
    updateFormUI('comment');

    document.getElementById("commentLoginLink").addEventListener("click", (e) => {
        e.preventDefault();
        if (typeof showAuthModal === "function") showAuthModal("login");
    });

    const commentTabs = document.querySelectorAll(".comment-tab");
    commentTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            commentTabs.forEach((t) => t.classList.remove("active"));
            document.querySelectorAll(".comment-tab-content").forEach((c) => c.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(`${tab.dataset.tab}List`).classList.add("active");
        });
    });
}

function createCommentElement(commentData) {
  const element = document.createElement("div");
  element.classList.add("submitted-comment");

  const userName =
    typeof commentData.user === "object" && commentData.user.name
      ? commentData.user.name
      : commentData.user || "Anonymous";
      
  const postDate = commentData.date ? new Date(commentData.date).toLocaleDateString() : 'Some time ago';

  let repliesHtml = "";
  if (commentData.replies && commentData.replies.length > 0) {
    repliesHtml = commentData.replies
      .map(
        (reply) => `
            <div class="admin-reply">
                <p><strong>Reply from ${reply.user}:</strong> <em>${new Date(
          reply.date
        ).toLocaleDateString()}</em></p>
                <p>${reply.text}</p>
            </div>
        `
      )
      .join("");
  }

  element.innerHTML = `
        <p><strong>${userName}</strong> - <em>${postDate}</em></p>
        <p>${commentData.text}</p>
        ${repliesHtml}
    `;
  return element;
}

async function displayRelatedContent(item) {
  const relatedRow = document.getElementById("relatedContentRow");
  if (!relatedRow) return;
  const allContent = await getAllContent();
  const related = allContent
    .filter(
      (content) =>
        content.id !== item.id &&
        content.genres.some((g) => item.genres.includes(g))
    )
    .slice(0, 10);

  if (related.length > 0) {
    relatedRow.innerHTML = "";
    related.forEach((content) => {
      if (typeof createContentCard === "function") {
        relatedRow.appendChild(createContentCard(content));
      }
    });
  } else {
    relatedRow.innerHTML =
      '<p class="empty-message">No related content found.</p>';
  }
}