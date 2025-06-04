// Declare searchResultsContainer globally
let searchResultsContainer = null;

document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOMContentLoaded fired in main.js."); // Debug log
  // Declare searchResultsContainer globally
  // let searchResultsContainer = null; // Ensure this is declared here

  // Ensure templates are loaded before initializing header and other components
  if (typeof ensureTemplatesLoaded === "function") {
    console.log("ensureTemplatesLoaded function found, waiting for templates."); // Debug log
    await ensureTemplatesLoaded();
    console.log("Templates loaded."); // Debug log
  } else {
    console.warn(
      "ensureTemplatesLoaded function not found, using fallback timeout for template loading."
    );
    await new Promise((resolve) => setTimeout(resolve, 500)); // Increased fallback time
    console.log("Fallback timeout finished."); // Debug log
  }

  // After templates are loaded, find the search results container
  searchResultsContainer = document.getElementById("searchResultsContainer");
  if (searchResultsContainer) {
    console.log("searchResultsContainer found after templates loaded."); // Debug log
  } else {
    console.error("searchResultsContainer NOT found after templates loaded!"); // Error log
  }

  // Ensure movieApi data is loaded and cached early
  await getAllContent();
  console.log("Content data loaded."); // Debug log

  initializeHeaderFunctionality();
  initializeModals();
  initializeHeroSlider();
  populateContentSections();
  populateGenreGrid();
  populateGenreDropdown(); // Now uses hover on desktop, click on mobile

  // Directly call populateAZDropdown after a delay to ensure header is rendered
  setTimeout(populateAZDropdown, 500); // Increased delay for robustness

  // Global click listener to close dropdowns/modals when clicking outside
  window.addEventListener("click", function (event) {
    const authModal = document.getElementById("authModal");
    const videoModal = document.getElementById("videoModal");
    const mainNav = document.getElementById("mainNav");
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const searchBar = document.getElementById("searchBar");
    const searchToggle = document.getElementById("searchToggle");
    const genreDropdown = document.getElementById("genreDropdown");
    const genreDropdownToggle = document.getElementById("genreDropdownToggle");
    const watchlistDropdown = document.getElementById("watchlistDropdown");
    //const watchlistDropdownToggle = document.getElementById("watchlistDropdownToggle");
    const userProfileDropdown = document.getElementById("userProfileDropdown");
    const userProfileToggle = document.getElementById("userProfileToggle");
    const azDropdown = document.getElementById("azDropdown"); /* Added */
    const azDropdownToggle = document.getElementById("azDropdownToggle"); /* Added */

    // Close Modals
    if (authModal && event.target === authModal) hideAuthModal();
    if (videoModal && event.target === videoModal) hideVideoModal();

    // Close Mobile Menu
    if (
      mainNav &&
      mainNav.classList.contains("active") &&
      mobileMenuToggle && // Ensure toggle exists
      !mainNav.contains(event.target) &&
      !mobileMenuToggle.contains(event.target)
    ) {
      mainNav.classList.remove("active");
      document.body.classList.remove("no-scroll");
    }

    // Close Desktop Search on outside click
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      if (
        searchBar &&
        !searchBar.classList.contains("hidden") &&
        searchToggle && // Ensure toggle exists
        !searchBar.contains(event.target) &&
        !searchToggle.contains(event.target)
      ) {
        searchBar.classList.add("hidden");
      }
    }

    // Close Dropdowns on outside click (handled by specific JS functions now, but keeping this global listener for robustness)
    // The specific dropdown JS files now handle closing other dropdowns when one is opened.
    // This global listener acts as a final fallback to close if clicking anywhere else.
    if (
      genreDropdown &&
      !genreDropdown.classList.contains("hidden") &&
      genreDropdownToggle &&
      !genreDropdown.contains(event.target) &&
      !genreDropdownToggle.contains(event.target)
    ) {
      genreDropdown.classList.add("hidden");
    }
    if (
      watchlistDropdown &&
      !watchlistDropdown.classList.contains("hidden") &&
      watchlistDropdownToggle &&
      !watchlistDropdown.contains(event.target) &&
      !watchlistDropdownToggle.contains(event.target)
    ) {
      watchlistDropdown.classList.add("hidden");
    }
    if (
      userProfileDropdown &&
      !userProfileDropdown.classList.contains("hidden") &&
      userProfileToggle &&
      !userProfileDropdown.contains(event.target) &&
      !userProfileToggle.contains(event.target)
    ) {
      userProfileDropdown.classList.add("hidden");
    }
    /* Added A-Z dropdown close logic */
    if (
      azDropdown &&
      !azDropdown.classList.contains("hidden") &&
      azDropdownToggle &&
      !azDropdown.contains(event.target) &&
      !azDropdownToggle.contains(event.target)
    ) {
      azDropdown.classList.add("hidden");
    }
  });

  // Close mobile menu on window resize if open
  window.addEventListener("resize", function () {
    const mainNav = document.getElementById("mainNav");
    if (
      window.innerWidth >= 768 &&
      mainNav &&
      mainNav.classList.contains("active")
    ) {
      mainNav.classList.remove("active");
      document.body.classList.remove("no-scroll");
    }
    // Ensure search bar is hidden on resize if it was open in mobile fullscreen mode
    const searchBar = document.getElementById("searchBar");
    const searchToggle = document.getElementById("searchToggle");
    if (
      window.innerWidth >= 768 &&
      searchBar &&
      !searchBar.classList.contains("hidden")
    ) {
      searchBar.classList.add("hidden");
      document.body.classList.remove("no-scroll"); // Ensure scroll is re-enabled
      if (searchToggle) searchToggle.classList.remove("search-active");
    }
  });
});

function initializeHeaderFunctionality() {
  const searchToggle = document.getElementById("searchToggle");
  const searchBar = document.getElementById("searchBar");
  const closeSearchBtn = document.getElementById("closeSearchBtn");
  const searchInputField = document.getElementById("极searchInputField");
  const searchClearBtn = document.getElementById("searchClearBtn");
  const searchInputWrapper = searchInputField
    ? searchInputField.closest(".search-input-wrapper")
    : null;

  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const main极Nav = document.getElementById("mainNav");
  const closeMobileMenuBtn = document.getElementById("closeMobileMenuBtn");

  // Ensure search bar is hidden on initial load
  if (searchBar) {
    searchBar.classList.add("hidden");
  }

  // Search Toggle (handles both mobile fullscreen and desktop dropdown)
  if (searchToggle && searchBar && searchInputField) {
    console.log("Search elements found, initializing listeners."); // Debug log
    searchToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      const isMobile = window.innerWidth < 768;
      console.log("Search toggle clicked. isMobile:", isMobile); // Debug log

      if (searchBar.classList.contains("hidden")) {
        // To open search
        console.log("Opening search bar."); // Debug log
        searchBar.classList.remove("hidden");
        searchInputField.focus();
        if (isMobile) {
          document.body.classList.add("no-scroll");
          searchToggle.classList.add("search-active"); // For changing icon via CSS
        }
        // Close other dropdowns if open
        document
        .querySelectorAll(
          ".genre-dropdown, .watchlist-dropdown, .user-profile-dropdown, .az-dropdown" /* Added .az-dropdown */
          )
          .forEach((dropdown) => {
            dropdown.classList.add("hidden");
          });
      } else {
        // To close search
        console.log("Closing search bar."); // Debug log
        searchBar.classList.add("hidden");
        if (isMobile) {
          document.body.classList.remove("no-scroll");
          searchToggle.classList.remove("search-active"); // Revert icon via CSS
        }
        clearSearchResults(); // Clear results when closing
        searchInputField.value = ""; // Clear input field
        searchClearBtn.classList.add("hidden"); // Hide clear button
        if (searchInputWrapper)
          searchInputWrapper.classList.remove("has-clear"); // Remove has-clear class
      }
    });

    if (closeSearchBtn) {
      console.log("Close search button found."); // Debug log
      closeSearchBtn.addEventListener("click", function () {
        console.log("Close search button clicked."); // Debug log
        searchBar.classList.add("hidden");
        document.body.classList.remove("no-scroll"); // Ensure scroll is re-enabled on mobile
        searchToggle.classList.remove("search-active"); // Revert icon via CSS
        clearSearchResults(); // Clear results when closing
        searchInputField.value = ""; // Clear input field
        searchClearBtn.classList.add("hidden"); // Hide clear button
        if (searchInputWrapper)
          searchInputWrapper.classList.remove("has-clear"); // Remove has-clear class
      });
    }

    // Search Input functionality
    searchInputField.addEventListener("input", async function () {
      const query = this.value.trim();
      console.log("Search input changed:", query); // Debug log
      if (query.length > 0) {
        searchClearBtn.classList.remove("hidden");
        if (searchInputWrapper) searchInputWrapper.classList.add("has-clear");
        // Check if searchResultsContainer is available before calling displaySearchResults
        if (searchResultsContainer) {
          await displaySearchResults(query);
        } else {
          console.warn(
            "Search results container not available, cannot display results."
          ); // Debug log
        }
      } else {
        searchClearBtn.classList.add("hidden");
        if (searchInputWrapper)
          searchInputWrapper.classList.remove("has-clear");
        clearSearchResults();
      }
    });

    if (searchClearBtn) {
      console.log("Search clear button found."); // Debug log
      searchClearBtn.addEventListener("click", function () {
        console.log("Search clear button clicked."); // Debug log
        searchInputField.value = "";
        searchClearBtn.classList.add("hidden");
        if (searchInputWrapper)
          searchInputWrapper.classList.remove("has-clear");
        searchInputField.focus();
        clearSearchResults(); // Clear results when clearing input
      });
    }

    // Desktop search close on outside click is handled by the global listener now
  } else {
    console.warn("Search elements not found.");
  }

  // Mobile Menu Toggle
  if (mobileMenuToggle && mainNav) {
    console.log("Mobile menu elements found."); // Debug log
    mobileMenuToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      console.log("Mobile menu toggle clicked."); // Debug log
      mainNav.classList.add("active"); // Always add active to slide in
      document.body.classList.add("no-scroll"); // Lock scroll
      // Close other dropdowns if open
      document
        .querySelectorAll(
          ".search-bar-dropdown, .genre-dropdown, .watchlist-dropdown, .user-profile-dropdown, .az-dropdown" /* Added .az-dropdown */
        )
        .forEach((dropdown) => {
          dropdown.classList.add("极hidden");
        });
      if (searchToggle) searchToggle.classList.remove("search-active"); // Ensure search icon is not 'close'
    });
  } else {
    console.warn("Mobile menu elements not found.");
  }

  if (closeMobileMenuBtn && mainNav) {
    console.log("Close mobile menu button found."); // Debug log
    closeMobileMenuBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      console.log("Close mobile menu button clicked."); // Debug log
      mainNav.classList.remove("active"); // Remove active to slide out
      document.body.classList.remove("no-scroll"); // Unlock scroll
    });
  }
}

// searchResultsContainer is now declared globally

async function displaySearchResults(query) {
  console.log("displaySearchResults called with query:", query); // Debug log
  // Use the globally available searchResultsContainer
  if (!searchResultsContainer) {
    console.warn("searchResultsContainer not found (global check)."); // Debug log
    return;
  }

  searchResultsContainer.innerHTML = ""; // Clear previous results

  // Optional: require minimum query length
  if (query.length < 2) {
    searchResultsContainer.innerHTML =
      '<p class="no-results-message">Type at least 2 characters to search.</p>';
    console.log("Query too short.");
    return;
  }

  try {
    const allContent = await getAllContent();
    console.log("All content fetched for search:", allContent.length, "items"); // Debug log

    const filteredContent = allContent.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(query.toLowerCase());
      // Ensure item.genres exists and is an array before using some()
      const genreMatch =
        item.genres &&
        Array.isArray(item.genres) &&
        item.genres.some((genre) =>
          genre.toLowerCase().includes(query.toLowerCase())
        );
      return titleMatch || genreMatch;
    });

    console.log("Filtered content count:", filteredContent.length); // Debug log

    if (filteredContent.length === 0) {
      searchResultsContainer.innerHTML =
        '<p class="no-results-message">No results found.</p>';
      console.log("No search results found."); // Debug log
      return;
    }

    // Limit to 10 results for the dropdown
    filteredContent.slice(0, 10).forEach((item) => {
      console.log("Appending search result item:", item.title); // Debug log before append
      const resultItem = document.createElement("a");
      resultItem.href = `movie-details.html?id=${item.id}`;
      resultItem.classList.add("search-result-item");
      resultItem.innerHTML = `
                <img src="${item.posterImage}" alt="${item.title}">
                <span>${item.title}</span>
            `;
      searchResultsContainer.appendChild(resultItem);
    });
    console.log("Finished appending search results."); // Debug log
  } catch (error) {
    console.error("Error displaying search results:", error);
    searchResultsContainer.innerHTML =
      '<p class="no-results-message">Error loading search results.</p>';
  }
}

function clearSearchResults() {
  console.log("clearSearchResults called."); // Debug log
  // Use the globally available searchResultsContainer
  if (searchResultsContainer) {
    searchResultsContainer.innerHTML = "";
  }
}

function initializeModals() {
  const closeAuthBtn = document.getElementById("closeAuth");
  if (closeAuthBtn) closeAuthBtn.addEventListener("click", hideAuthModal);

  const closeVideoBtn = document.getElementById("closeVideo");
  if (closeVideoBtn) closeVideoBtn.addEventListener("click", hideVideoModal);

  // Add listener to the large play button on the video placeholder
  const videoPlayLargeBtn = document.getElementById("videoPlayLargeBtn");
  if (videoPlayLargeBtn) {
    videoPlayLargeBtn.addEventListener("click", showVideoModal);
  }
}

// showAuthModal and hideAuthModal are defined in auth.js and made global

function showVideoModal() {
  const videoModal = document.getElementById("videoModal");
  if (videoModal) {
    videoModal.classList.remove("hidden");
    document.body.classList.add("no-scroll-modal");
    // Note: We are not loading a specific video here, just showing the placeholder.
    // Full video player implementation is outside the scope of the current request.
  }
}

function hideVideoModal() {
  const videoModal = document.getElementById("videoModal");
  if (videoModal) {
    videoModal.classList.add("hidden");
    document.body.classList.remove("no-scroll-modal");
    // If there was a video playing, you would stop it here.
  }
}

async function initializeHeroSlider() {
  const heroSliderElement = document.getElementById("heroSlider");
  const heroContentContainer = document.querySelector(
    "#heroContentContainer .hero-content-main"
  );
  const dotsContainer = document.querySelector(".hero-slider-dots");

  if (!heroSliderElement || !heroContentContainer || !dotsContainer) {
    console.warn("Hero slider elements not found.");
    return;
  }

  const allContent = await getAllContent();
  const heroData = allContent
    .filter((item) => item.heroImage && item.heroImage !== "")
    .slice(0, 5);

  if (heroData.length === 0) {
    heroContentContainer.innerHTML =
      '<p style="text-align:center; padding: 20px 0;">No hero content available.</p>';
    dotsContainer.innerHTML = "";
    const existingGradient = heroSliderElement.querySelector(
      ".hero-gradient-overlay"
    );
    heroSliderElement.innerHTML = "";
    if (existingGradient) heroSliderElement.appendChild(existingGradient);
    return;
  }

  const existingGradient = heroSliderElement.querySelector(
    ".hero-gradient-overlay"
  );
  heroSliderElement.innerHTML = "";
  if (existingGradient) heroSliderElement.appendChild(existingGradient);

  heroContentContainer.innerHTML = "";
  dotsContainer.innerHTML = "";

  heroData.forEach((item, index) => {
    const slideDiv = document.createElement("div");
    slideDiv.style.backgroundImage = `url('${item.heroImage}')`;
    slideDiv.dataset.slideIndex = index;
    if (index === 0) slideDiv.classList.add("active-slide");
    heroSliderElement.insertBefore(slideDiv, existingGradient);

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("slide-content");
    contentDiv.dataset.slide = index;
    if (index !== 0) content极Div.classList.add("hidden");
    contentDiv.innerHTML = `
            <span class="hero-featured-tag">${
              item.type === "movie"
                ? "Featured Movie"
                : item.type === "series"
                ? "Featured Series"
                : "Featured Anime"
            }</span>
            <h1 class="hero-title">${item.title}</h1>
            <div class="hero-meta">
                <span>${item.year}</span>
                <span class="separator-dot">•</span>
                <span>${item.duration}</span>
                <span class="separator-dot">•</span>
                <span>${item.genres.join(", ")}</span>
                <span class="rating">
                    <i class="ri-star-fill"></i>
                    <span>${item.rating}</span>
                </span>
            </div>
            <p class="hero-description">${item.description}</p>
            <div class="hero-actions">
                <button class="btn btn-primary play-now-btn" data-content-id="${
                  item.id
                }">
                    <i class="ri-play-fill"></i>
                    <span>Play Now</span>
                </button>
                <button class="btn btn-secondary add-list-btn" data-content-id="${
                  item.id
                }">
                    <i class="ri-add-line"></i>
                    <span>Add to My List</span>
                </button>
            </div>
        `;
    heroContentContainer.appendChild(contentDiv);

    // Create dot
    const dotButton = document.createElement("button");
    dotButton.dataset.slide = index;
    if (index === 0) dotButton.classList.add("active");
    dotsContainer.appendChild(dotButton);
  });

  const bgSlides = heroSliderElement.querySelectorAll("div[data-slide-index]");
  const contentSlides = heroContentContainer.querySelectorAll(".slide-content");
  const dots = dotsContainer.querySelectorAll("button");
  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    bgSlides.forEach((slide) => slide.classList.remove("active-slide"));
    contentSlides.forEach((content) => content.classList.add("hidden"));
    dots.forEach((dot) => dot.classList.remove("active"));

    if (bgSlides[index]) bgSlides[index].classList.add("active-slide");
    if (contentSlides[index]) contentSlides[index].classList.remove("hidden");
    if (dots[index]) dots[index].classList.add("active");
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % bgSlides.length;
    showSlide(currentSlide);
  }
  function startSlideshow() {
    if (bgSlides.length > 0) {
      showSlide(0);
      if (slideInterval) clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 5000);
    }
  }
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      clearInterval(slideInterval);
      currentSlide = parseInt(dot.dataset.slide);
      showSlide(currentSlide);
      slideInterval = setInterval(nextSlide, 5000);
    });
  });
  heroContentContainer.querySelectorAll(".play-now-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const contentId = button.dataset.contentId;
      window.open(`stream.html?id=${contentId}`, "_blank");
    });
  });
  heroContentContainer.querySelectorAll(".add-list-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const contentId = button.dataset.contentId;
      if (localStorage.getItem("loggedInUser")) {
        // Call the watchlist function if logged in
        if (typeof addToWatchlist === "function") {
          addToWatchlist(contentId);
        } else {
          console.warn("addToWatchlist function not found.");
          alert("Add to watchlist functionality not fully loaded yet.");
        }
      } else {
        // Show auth modal if not logged in
        showAuthModal();
      }
    });
  });
  startSlideshow();
}

// Make createContentCard globally available for other scripts (category.js, movie-details.js, watchlist.js)
window.createContentCard = function (item) {
  const card = document.createElement("div");
  card.classList.add("content-card");
  card.innerHTML = `
        <div class="content-card-image-wrapper group">
            <img src="${item.posterImage}" alt="${
    item.title
  }" class="content-card-image">
            <div class="card-overlay">
                <h3 class="card-title">${item.title}</h3>
                <div class="card-meta">
                    <span class="rating">
                        <i class="ri-star-fill"></极i>
                        <span>${item.rating}</span>
                    </span>
                    <span class="separator">•</span>
                    <span>${
                      item.duration.length > 10
                        ? item.duration.substring(0, 7) + "..."
                        : item.duration
                    }</span>
                    <span class="separator">•</span>
                    <span>${item.genres[0]}</span>
                </div>
                <div class="card-actions">
                    <button class="card-action-btn play video-play-trigger" data-content-id="${
                      item.id
                    }">
                        <i class="ri-play-fill text-white"></i>
                    </button>
                    <button class="card-action-btn add add-list-trigger" data-content-id="${
                      item.id
                    }">
                        <i class="ri-add-line text-white"></i>
                    </button>
                </div>
            </div>
        </div>
        ${
          item.quality && item.quality.includes("4K")
            ? '<span class="card-tag">4K</span>'
            : item.quality && item.quality.includes("HD")
            ? '<span class="card-tag">HD</span>'
            : ""
        }
    `;

  const addListBtn = card.querySelector(".add-list-trigger");

  // Update the button state immediately after creating the card
  updateWatchlistButtonState(addListBtn, item.id);

  card.querySelector(".video-play-trigger").addEventListener("click", (e) => {
    e.stopPropagation();
    const contentId = e.currentTarget.dataset.contentId;
    console.log("Play video for:", contentId);
    showVideoModal(); // This will show the placeholder modal for now
  });

  if (addListBtn) {
    addListBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const contentId = e.currentTarget.dataset.contentId;
      if (localStorage.getItem("loggedInUser")) {
        // Call the watchlist function if logged in
        if (typeof addToWatchlist === "function") {
          // addToWatchlist will now handle updating the button state
          addToWatchlist(contentId);
        } else {
          console.warn("addToWatchlist function not found.");
          showNotification(
            "Add to watchlist functionality not fully loaded yet.",
            "error"
          );
        }
      } else {
        // Show auth modal if not logged in
        showAuthModal();
      }
    });
  }

  card.addEventListener("click", () => {
    console.log("Card clicked for:", item.id);
    // Open streaming page in a new tab
    window.open(`stream.html?id=${item.id}`, "_blank");
  });
  return card;
};

// Helper function to update the visual state of a watchlist button
window.updateWatchlistButtonState = function (buttonElement, contentId) {
  if (!buttonElement) {
    console.warn("updateWatchlistButtonState called with null buttonElement.");
    return;
  }
  // Ensure isInWatchlist is available (from watchlist.js)
  if (typeof isInWatchlist !== "function") {
    console.warn(
      "isInWatchlist function not found. Cannot update watchlist button state."
    );
    return;
  }

  const iconElement = buttonElement.querySelector("i");
  const textElement = buttonElement.querySelector("span"); // Assuming some buttons might have text

  if (isInWatchlist(contentId)) {
    buttonElement.classList.add("added-to-watchlist");
    if (iconElement) iconElement.className = "ri-check-line text-white";
    buttonElement.removeAttribute("title");
  } else {
    buttonElement.classList.remove("added-to-watchlist");
    if (iconElement) iconElement.className = "ri-add-line text-white";
    buttonElement.removeAttribute("title");
  }
  console.log(
    `Updated watchlist button state for ${contentId}. Is in watchlist: ${isInWatchlist(
      contentId
    )}`
  ); // Debug log
};

async function populateContentSections() {
  const trendingNowRow = document.getElementById("trendingNowRow");
  const popularAnimeRow = document.getElementById("popularAnimeRow");
  const popularSeriesRow = document.getElementById("popularSeriesRow");
  const featuredMovieSection = document.getElementById("featuredMovieSection");

  const trendingItems = await getContentByTag("trending");
  const animeItems = await getContentByType("anime");
  const seriesItems = await getContentByType("series");

  // Only try to populate featured movie if the section exists and is visible (not hidden by CSS on mobile)
  if (
    featuredMovieSection &&
    getComputedStyle(featuredMovieSection).display !== "none"
  ) {
    const featuredMovieData = await getContentByTag("featured-movie");
    const movieData = await getContentByType("movie");
    const featuredMovie = featuredMovieData[0] || movieData[0];

    if (featuredMovie) {
      featuredMovieSection.style.backgroundImage = `url('${
        featuredMovie.heroImage || featuredMovie.posterImage
      }')`;
      featuredMovieSection.innerHTML = `
                <div class="featured-movie-overlay"></div>
                <div class="featured-movie-content-wrapper">
                    <div class="featured-movie-content">
                        <span class="hero-featured-tag">${
                          featuredMovie.type === "movie"
                            ? "Featured Movie"
                            : featuredMovie.type === "series"
                            ? "Featured Series"
                            : "Featured Anime"
                        }</span>
                        <h2 class="hero-title">${featuredMovie.title}</h2>
                        <div class="hero-meta">
                            <span>${featuredMovie.year}</span>
                            <span class="separator-dot">•</span>
                            <span>${featuredMovie.duration}</span>
                            <span class="separator-dot">•</span>
                            <span>${featuredMovie.genres.join(", ")}</span>
                            <span class="rating">
                                <i class="ri-star-fill"></i>
                                <span>${featuredMovie.rating}</span>
                            </span>
                        </div>
                        <p class="hero-description">${
                          featuredMovie.description
                        }</p>
                        <div class="hero-actions">
                            <button class="btn btn-primary video-play-trigger" data-content-id="${
                              featuredMovie.id
                            }">
                                <i class="ri-play-fill"></i>
                                <span>Watch Now</span>
                            </button>
                            <button class="btn btn-secondary info-btn" data-content-id="${
                              featuredMovie.id
                            }">
                                <i class="ri-information-line"></i>
                                <span>More Info</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
      // Add event listeners for featured movie buttons
      featuredMovieSection
        .querySelector(".video-play-trigger")
        .addEventListener("click", showVideoModal); // Show placeholder modal
      featuredMovieSection
        .querySelector(".info-btn")
        .addEventListener("click", function () {
          const contentId = this.dataset.contentId;
          console.log("More info for:", contentId);
          // Open movie details page in a new tab
          window.open(`movie-details.html?id=${contentId}`, "_blank");
        });
    } else {
      featuredMovieSection.innerHTML =
        '<p style="text-align:center; padding: 20px 0; color: var(--text-muted-color);">No featured movie available.</p>';
    }
  } else if (featuredMovieSection) {
    // If section exists but is hidden (mobile)
    // featuredMovieSection.innerHTML = ''; // Clear it just in case
  }

  if (trendingNowRow) {
    trendingNowRow.innerHTML = "";
    trendingItems
      .slice(0, 10)
      .forEach((item) => trendingNowRow.appendChild(createContentCard(item)));
  }
  if (popularAnimeRow) {
    popularAnimeRow.innerHTML = "";
    animeItems
      .slice(0, 10)
      .forEach((item) => popularAnimeRow.appendChild(createContentCard(item)));
  }
  if (popularSeriesRow) {
    popularSeriesRow.innerHTML = "";
    seriesItems
      .slice(0, 10)
      .forEach((item) => popularSeriesRow.appendChild(createContentCard(item)));
  }
}

async function populateGenreDropdown() {
  const genreDropdownToggle = document.getElementById("genreDropdownToggle");
  const genreDropdown = document.getElementById("genreDropdown");
  const azDropdownToggle = document.getElementById("azDropdownToggle"); /* Added */
  const azDropdown = document.getElementById("azDropdown"); /* Added */

  if (!genreDropdownToggle || !genreDropdown) {
    console.warn("Genre dropdown elements not found.");
    return;
  }
  /* Added A-Z dropdown check */
  if (!azDropdownToggle || !azDropdown) {
    console.warn("A-Z dropdown elements not found.");
    return;
  }

  const genres = await getAllGenres(); // From movieApi.js

  genreDropdown.innerHTML = ""; // Clear existing content

  genres.forEach((genreName) => {
    const genreLink = document.createElement("a");
    genreLink.href = `category.html?category=${encodeURIComponent( /* Changed to category.html */
      genreName.toLowerCase()
    )}`;
    genreLink.classList.add("dropdown-item");
    genreLink.textContent = genreName;
    genreLink.target = "_blank"; // Open in new tab
    genreDropdown.appendChild(genreLink);
  });

  // Use mouseover/mouseout for hover effect on desktop
  let genreDropdownTimeout;
  let azDropdownTimeout; /* Added */

  const showGenreDropdown = () => {
    clearTimeout(genreDropdownTimeout);
    genreDropdown.classList.remove("hidden");
    // Close other dropdowns if open (like user profile, watchlist, or A-Z)
    document
      .querySelectorAll(".user-profile-dropdown, .watchlist-dropdown, .az-dropdown") /* Added .az-dropdown */
      .forEach((dropdown) => {
        if (dropdown.id !== "genreDropdown") {
          dropdown.classList.add("hidden");
        }
      });
  };

  const hideGenreDropdown = () => {
    genreDropdownTimeout = setTimeout(() => {
      genreDropdown.classList.add("hidden");
    }, 200); // Delay hiding
  };

  /* Added A-Z dropdown show/hide functions */
  const showAZDropdown = () => {
    clearTimeout(azDropdownTimeout);
    azDropdown.classList.remove("hidden");
    console.log('showAZDropdown called, hidden class removed from azDropdown.'); /* Debug log */
    // Close other dropdowns if open
    document
      .querySelectorAll(".user-profile-dropdown, .watchlist-dropdown, .genre-dropdown")
      .forEach((dropdown) => {
        if (dropdown.id !== "azDropdown") {
          dropdown.classList.add("hidden");
        }
      });
  };

  const hideAZDropdown = () => {
    azDropdownTimeout = setTimeout(() => {
      azDropdown.classList.add("hidden");
    }, 200);
  };


  // Add event listeners for hover on desktop (min-width 768px)
  genreDropdownToggle.addEventListener("mouseover", () => {
    if (window.innerWidth >= 768) showGenreDropdown();
  });
  genreDropdownToggle.addEventListener("mouseout", hideGenreDropdown);
  genreDropdown.addEventListener("mouseover", () =>
    clearTimeout(genreDropdownTimeout)
  ); // Keep open when hovering dropdown
  genreDropdown.addEventListener("mouseout", hideGenreDropdown);

  /* Added A-Z dropdown hover listeners */
  azDropdownToggle.addEventListener("mouseover", () => {
    if (window.innerWidth >= 768) showAZDropdown();
  });
  azDropdownToggle.addEventListener("mouseout", hideAZDropdown);
  azDropdown.addEventListener("mouseover", () =>
    clearTimeout(azDropdownTimeout)
  );
  azDropdown.addEventListener("mouseout", hideAZDropdown);


  // Add click listener for mobile (max-width 767px)
  genreDropdownToggle.addEventListener("click", (e) => {
    if (window.innerWidth < 768) {
      e.preventDefault(); // Prevent navigation on mobile click
      e.stopPropagation(); // Prevent document click from closing immediately
      genreDropdown.classList.toggle("hidden");
      // Close other dropdowns if open (like user profile or watchlist)
      document
        .querySelectorAll(".user-profile-dropdown, .watchlist-dropdown, .az-dropdown") /* Added .az-dropdown */
        .forEach((dropdown) => {
          if (dropdown.id !== "genreDropdown") {
            dropdown.classList.add("hidden");
          }
        });
    }
  });

  /* Added A-Z dropdown click listener for mobile */
  azDropdownToggle.addEventListener("click", (e) => {
    if (window.innerWidth < 768) {
      e.preventDefault();
      e.stopPropagation();
      azDropdown.classList.toggle("hidden");
      document
        .querySelectorAll(".user-profile-dropdown, .watchlist-dropdown, .genre-dropdown")
        .forEach((dropdown) => {
          if (dropdown.id !== "azDropdown") {
            dropdown.classList.add("hidden");
          }
        });
    }
  });


  // Close dropdown on outside click (for both desktop and mobile fallback)
  document.addEventListener("click", function (event) {
    if (
      genreDropdown &&
      !genreDropdown.classList.contains("hidden") &&
      genreDropdownToggle &&
      !genreDropdown.contains(event.target) &&
      !genreDropdownToggle.contains(event.target)
    ) {
      genreDropdown.classList.add("hidden");
    }
    /* Added A-Z dropdown close on outside click */
    if (
      azDropdown &&
      !azDropdown.classList.contains("hidden") &&
      azDropdownToggle &&
      !azDropdown.contains(event.target) &&
      !azDropdownToggle.contains(event.target)
    ) {
      azDropdown.classList.add("hidden");
    }
  });
}

async function populateAZDropdown() {
    const azDropdown = document.getElementById('azDropdown');
    if (!azDropdown) {
        console.warn('A-Z dropdown element not found in populateAZDropdown (main.js).');
        return;
    }
    console.log('A-Z dropdown element found in main.js, populating...');

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    // const numbers = ['0-9']; /* Removed numbers array */

    // Clear existing content
    azDropdown.innerHTML = '';

    // Add alphabet links
    alphabet.forEach(letter => {
        const link = document.createElement('a');
        link.href = `az-page.html?letter=${letter}`;
        link.classList.add('dropdown-item');
        link.textContent = letter;
        azDropdown.appendChild(link);
    });

    // Removed number link population
    // numbers.forEach(range => {
    //     const link = document.createElement('a');
    //     link.href = `az-page.html?letter=${range}`;
    //     link.classList.add('dropdown-item');
    //     link.textContent = range;
    //     azDropdown.appendChild(link);
    // });
    console.log(`A-Z dropdown populated with ${azDropdown.children.length} items in main.js.`);
}

async function populateGenreGrid() {
  const genreGrid = document.getElementById("genreGrid");
  if (!genreGrid) {
      console.warn("Genre grid element not found."); // Debug log
      return;
  }
   console.log("Genre grid element found."); // Debug log


  const genres = await getAllGenres();
  // Use a single, reliable placeholder for all genres for testing
  // Format: https://placehold.co/600x400/transparent/F00
  // const genericPlaceholderUrl = "https://placehold.co/400x225/transparent/F00?text=Genre"; // Dark background, light text

  // Reverting to original image placeholders
  const genreImagePlaceholders = {
    Action:
      "https://assets.vogue.in/photos/5f16b3bc9ffca08d184…60%2Cc_limit/must-watch%2520action%2520movies.jpg",
    Comedy:
      "https://readdy.ai/api/search-image?query=comedy%20movie%20scene%20laughing%2C%20cinematic&width=400&height=225&seq=21&orientation=landscape",
    Horror:
      "https://readdy.ai/api/search-image?query=horror%20movie%20scene%20dark%2C%20cinematic&width=400&height=225&seq=22&orientation=landscape",
    "Sci-Fi":
      "https://readdy.ai/api/search-image?query=sci-fi%20movie%20scene%20futuristic%20technology%2C%20cinematic&width=400&height=225&seq=23&orientation=landscape",
    Romance:
      "https://readdy.ai/api/search-image?query=romance%20movie%20scene%20couple%20emotional%2C%20cinematic&width=400&height=225&seq=24&orientation=landscape",
    Anime:
      "https://readdy.ai/api/search-image?query=anime%20scene%20vibrant%20colors%2C%20action&width=400&height=225&seq=25&orientation=landscape",
    Fantasy:
      "https://readdy.ai/api/search-image?query=fantasy%20world%20landscape%20cinematic&width=400&height=225&seq=26&orientation=landscape",
    Drama:
      "https://readdy.ai/api/search-image?query=dramatic%20actor%20portrait%20cinematic&width=400&height=225&seq=27&orientation=landscape",
    Adventure:
      "https://readdy.ai/api/search-image?query=adventure%20jungle%20explorer%2C%20cinematic&width=400%20height=225&seq=28&orientation=landscape",
    Thriller:
      "https://readdy.ai/api/search-image?query=thriller%20suspense%20detective%2C%20cinematic&width=400&height=225&seq=29&orientation=landscape",
    Animation:
      "https://readdy.ai/api/search-image?query=animated%20movie%20scene%20colorful%20characters&width=400&height=225&seq=30&orientation=landscape",
    Family:
      "https://readdy.ai/api/search-image?query=family%20movie%20scene%20happy%20kids&width=400&height=225&seq=31&orientation=landscape",
    Mystery:
      "https://readdy.ai/api/search-image?query=mystery%20detective%20clues%2C%20cinematic&width=400&height=225&seq=32&orientation=landscape",
    Crime:
      "https://readdy.ai/api/search-image?query=crime%20scene%20investigation%2C%20cinematic&width=400&height=225&seq=33&orientation=landscape",
    Documentary:
      "https://readdy.ai/api/search-image?query=documentary%20nature%20wildlife&width=400&height=225&seq=34&orientation=landscape",
    History:
      "https://readdy.ai/api/search-image?query=historical%20movie%20scene%20ancient%20city&width=400&height=225&seq=35&orientation=landscape",
    Music:
      "https://readdy.ai/api/search-image?query=music%20concert%20stage%20lights&width=400&height=225&seq=36&orientation=landscape",
    Musical:
      "https://readdy.ai/api/search-image?query=musical%20theater%20stage%20performance&width=400&height=225&seq=37&orientation=landscape",
    Sport:
      "https://readdy.ai/api/search-image?query=sport%20event%20stadium%20action&width=400&height=225&seq=38&orientation=landscape",
    War:
      "https://readdy.ai/api/search-image?query=war%20movie%20scene%20battlefield&width=400&height=225&seq=39&orientation=landscape",
    Western:
      "https://readdy.ai/api/search-image?query=western%20movie%20scene%20cowboy%20desert&width=400&height=225&seq=40&orientation=landscape"
  };


  genreGrid.innerHTML = "";
  // Display all genres, not just the first 6
  genres.forEach((genreName) => {
    const genreCard = document.createElement("a");
    // Link to category-az page filtered by genre
    genreCard.href = `category.html?category=${encodeURIComponent(genreName.toLowerCase())}`; /* Changed to category.html */
    genreCard.classList.add("genre-card");

    const imageUrl = genreImagePlaceholders[genreName] || genreImagePlaceholders["Action"];
    console.log(`Setting background image for genre "${genreName}": ${imageUrl}`); // Debug log for image URL
    genreCard.style.backgroundImage = `url('${imageUrl}')`;

    genreCard.innerHTML = `
            <div class="genre-card-overlay">
                <span class="genre-card-name">${genreName}</span>
            </div>
        `;
    genreGrid.appendChild(genreCard);

    // Log dimensions after appending (may not be fully rendered yet, but gives an idea)
    // Use a small timeout to allow rendering if needed, or check in browser dev tools
    setTimeout(() => {
        console.log(`Genre card "${genreName}" dimensions: ${genreCard.offsetWidth}x${genreCard.offsetHeight}`);
    }, 0);
  });
   console.log("Finished populating genre grid."); // Debug log
}
