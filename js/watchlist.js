document.addEventListener("DOMContentLoaded", async function() {
    console.log("watchlist.js: DOMContentLoaded fired. Starting initialization...");

    // 1. Ensure core dependencies are loaded
    if (typeof ensureTemplatesLoaded === "function") {
        await ensureTemplatesLoaded();
    } else {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    await getAllContent();

    updateWatchlistDropdown();
    console.log("watchlist.js: Initial update of header watchlist dropdown complete.");

    // 2. Populate the watchlist grid on the watchlist.html page
    const watchlistContentGrid = document.getElementById("watchlistContentGrid");
    const preloader = document.getElementById('preloader');

    if (watchlistContentGrid) {
        console.log("watchlist.js: 'watchlistContentGrid' element found. Populating grid...");
        try {
            await populateWatchlistGrid(); // Await the population
            console.log("watchlist.js: Populating watchlist grid complete.");
        } catch (error) {
            console.error("Error populating watchlist grid:", error);
            watchlistContentGrid.innerHTML = '<p class="empty-message">Could not load your watchlist. Please try again later.</p>';
        } finally {
            // Hide the preloader after content is loaded or an error occurs
            if (preloader) {
                preloader.classList.add('loaded');
            }
        }
    } else {
        console.log("watchlist.js: Not on the watchlist page, skipping grid population.");
        // If not on the watchlist page for some reason, still hide the preloader
        if (preloader) {
            preloader.classList.add('loaded');
        }
    }
    console.log("watchlist.js: Initialization complete.");
});

/**
 * Retrieves the current user's watchlist from localStorage.
 * Returns an empty array if no user is logged in or watchlist is empty.
 * @returns {Array<string>} An array of content IDs in the user's watchlist.
 */
function getWatchlist() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        console.log("getWatchlist: No user logged in, returning empty watchlist.");
        return [];
    }

    const allUserWatchlists = localStorage.getItem("userWatchlists");
    const parsedUserWatchlists = allUserWatchlists ? JSON.parse(allUserWatchlists) : {};

    const userWatchlist = parsedUserWatchlists[loggedInUser] || [];
    console.log(`getWatchlist for user "${loggedInUser}":`, userWatchlist);
    return userWatchlist;
}

/**
 * Saves the given watchlist array to localStorage for the current logged-in user.
 * @param {Array<string>} watchlist - The array of content IDs to save.
 */
function saveWatchlist(watchlist) {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        console.warn("saveWatchlist: No user logged in. Watchlist not saved.");
        return;
    }

    const allUserWatchlists = localStorage.getItem("userWatchlists");
    const parsedUserWatchlists = allUserWatchlists ? JSON.parse(allUserWatchlists) : {};

    parsedUserWatchlists[loggedInUser] = watchlist;
    console.log(`saveWatchlist for user "${loggedInUser}":`, watchlist);
    localStorage.setItem("userWatchlists", JSON.stringify(parsedUserWatchlists));
}

/**
 * Adds a content item to the current user's watchlist.
 * If the item is already in the watchlist, it removes it instead.
 * Dispatches a 'watchlistUpdated' event upon successful addition or removal.
 * @param {string} contentId - The ID of the content to add or remove.
 */
window.addToWatchlist = function(contentId) {
    console.log("addToWatchlist called for ID:", contentId);
    const watchlist = getWatchlist();

    if (watchlist.includes(contentId)) {
        // If already in watchlist, remove it and show removal notification
        removeFromWatchlist(contentId); 
        return; // Exit, as removeFromWatchlist handles its own notification and dispatch
    }

    // If not in watchlist, add it
    watchlist.push(contentId);
    saveWatchlist(watchlist);

    if (typeof showNotification === 'function') {
        showNotification("Item added to your watchlist!", 'success');
    } else {
         alert("Item added to your watchlist!");
    }
    console.log("Item added to watchlist.");

    // Update the watchlist dropdown in the header
    updateWatchlistDropdown();

    // Notify other parts of the application that the watchlist has been updated
    window.dispatchEvent(new CustomEvent('watchlistUpdated', { detail: { contentId: contentId } }));
}

/**
 * Removes a content item from the current user's watchlist.
 * Dispatches a 'watchlistUpdated' event upon successful removal.
 * @param {string} contentId - The ID of the content to remove.
 */
window.removeFromWatchlist = function(contentId) {
    console.log("removeFromWatchlist called for ID:", contentId);
    let watchlist = getWatchlist();

    const initialLength = watchlist.length;
    watchlist = watchlist.filter(id => id !== contentId);
    const removed = initialLength > watchlist.length;

    if (removed) {
        saveWatchlist(watchlist);
        if (typeof showNotification === 'function') {
            showNotification("Item removed from your watchlist!", 'info'); // Only show this notification
        } else {
             alert("Item removed from your watchlist!");
        }
        console.log("Item removed from watchlist.");
    } else {
        console.warn("Attempted to remove item not in watchlist:", contentId);
    }

    // Update the watchlist dropdown and the watchlist page if it's open
    updateWatchlistDropdown();
    // If on the watchlist page, re-render the grid
    if (document.getElementById("watchlistContentGrid")) {
        console.log("On watchlist page, re-populating grid.");
        populateWatchlistGrid();
    }

    // Notify other parts of the application that the watchlist has been updated
    window.dispatchEvent(new CustomEvent('watchlistUpdated', { detail: { contentId: contentId } }));
}

/**
 * Checks if a content item is currently in the user's watchlist.
 * @param {string} contentId - The ID of the content to check.
 * @returns {boolean} True if the item is in the watchlist, false otherwise.
 */
window.isInWatchlist = function(contentId) {
    const watchlist = getWatchlist();
    const isIn = watchlist.includes(contentId);
    console.log(`isInWatchlist check for ${contentId}: ${isIn}`);
    return isIn;
}

/**
 * Updates the content and badge count of the watchlist dropdown in the header.
 * Fetches content details for items in the watchlist.
 */
window.updateWatchlistDropdown = async function() {
    console.log("updateWatchlistDropdown called.");
    const watchlistDropdown = document.getElementById("watchlistDropdown");
    const watchlistDropdownToggle = document.getElementById("watchlistDropdownToggle");

    if (!watchlistDropdown || !watchlistDropdownToggle) {
        console.warn("Watchlist dropdown elements (header) not found. Cannot update dropdown.");
        return;
    }
    console.log("Watchlist dropdown elements (header) found.");

    const watchlistIds = getWatchlist();
    watchlistDropdown.innerHTML = ""; // Clear existing content
    console.log("Watchlist IDs for dropdown:", watchlistIds);

    // Update the badge count
    const watchlistCountBadge = watchlistDropdownToggle.querySelector('.watchlist-count-badge');
    if (watchlistCountBadge) {
        watchlistCountBadge.textContent = watchlistIds.length;
        watchlistCountBadge.classList.toggle('hidden', watchlistIds.length === 0);
        console.log("Watchlist badge count updated:", watchlistIds.length);
    } else {
         console.warn("Watchlist count badge element not found in header toggle.");
    }

    if (watchlistIds.length === 0) {
        watchlistDropdown.innerHTML = '<p class="dropdown-empty-message">Your watchlist is empty.</p>';
        console.log("Watchlist is empty, displayed empty message in dropdown.");
    } else {
        // Ensure getAllContent is available globally before calling
        if (typeof getAllContent !== 'function') {
            console.error("getAllContent function not found. Cannot populate watchlist dropdown content.");
            watchlistDropdown.innerHTML = '<p class="dropdown-empty-message">Error loading watchlist content.</p>';
            return;
        }
        const allContent = await getAllContent();
        const watchlistItems = allContent.filter(item => watchlistIds.includes(item.id));
        console.log("Watchlist items fetched for dropdown:", watchlistItems.length, "items.");

        if (watchlistItems.length > 0) {
             watchlistItems.forEach(item => {
                const itemElement = document.createElement("a");
                itemElement.href = `contentDetails.html?id=${item.id}`; // Link to contentDetails.html
                itemElement.classList.add("watchlist-dropdown-item");
                itemElement.target = "_blank"; // Open in new tab
                itemElement.innerHTML = `
                    <img src="${item.posterImage}" alt="${item.title}">
                    <span>${item.title}</span>
                    <button class="remove-from-watchlist-btn" data-id="${item.id}" title="Remove from Watchlist">
                        <i class="ri-close-line"></i>
                    </button>
                `;
                watchlistDropdown.appendChild(itemElement);

                // Add event listener to the remove button
                itemElement.querySelector(".remove-from-watchlist-btn").addEventListener("click", (e) => {
                    e.preventDefault(); // Prevent navigating
                    e.stopPropagation(); // Prevent the link click
                    const idToRemove = e.currentTarget.dataset.id;
                    removeFromWatchlist(idToRemove);
                });
            });
             console.log("Watchlist dropdown items populated.");

            // Add "See All" link at the end of the dropdown
            const seeAllLink = document.createElement("a");
            seeAllLink.href = "watchlist.html";
            seeAllLink.classList.add("dropdown-see-all");
            seeAllLink.textContent = "See All";
            seeAllLink.target = "_blank"; // Open in new tab
            watchlistDropdown.appendChild(seeAllLink);
            console.log("Watchlist dropdown 'See All' link added.");

        } else {
             watchlistDropdown.innerHTML = '<p class="dropdown-empty-message">No content found in your watchlist.</p>';
             console.log("No watchlist items found after filtering for dropdown, displayed empty message.");
        }
    }

    // Handle dropdown show/hide on hover (desktop)
    let watchlistDropdownTimeout;

    const showWatchlistDropdown = () => {
        clearTimeout(watchlistDropdownTimeout);
        watchlistDropdown.classList.remove("hidden");
        // Close other dropdowns if open (like genre or user profile)
        document.querySelectorAll('.genre-dropdown, .user-profile-dropdown, .az-dropdown').forEach(dropdown => {
            if (dropdown.id !== 'watchlistDropdown') {
                dropdown.classList.add('hidden');
            }
        });
        console.log("Watchlist dropdown shown.");
    };

    const hideWatchlistDropdown = (event) => {
        const isRelatedTargetInside = (event && (watchlistDropdown.contains(event.relatedTarget) || watchlistDropdownToggle.contains(event.relatedTarget)));
        if (!isRelatedTargetInside) {
             watchlistDropdownTimeout = setTimeout(() => {
                watchlistDropdown.classList.add("hidden");
                 console.log("Watchlist dropdown hidden.");
            }, 200); // Delay hiding
        }
    };

    if (!watchlistDropdownToggle.dataset.hoverListenerAdded) {
        watchlistDropdownToggle.addEventListener("mouseover", showWatchlistDropdown);
        watchlistDropdownToggle.addEventListener("mouseout", hideWatchlistDropdown);
        watchlistDropdown.addEventListener("mouseover", () => clearTimeout(watchlistDropdownTimeout));
        watchlistDropdown.addEventListener("mouseout", hideWatchlistDropdown);
        watchlistDropdownToggle.dataset.hoverListenerAdded = 'true';
        console.log("Watchlist dropdown hover listeners added.");
    }

    // Handle dropdown show/hide on click (mobile)
    if (!watchlistDropdownToggle.dataset.clickListenerAdded) {
        watchlistDropdownToggle.addEventListener("click", (e) => {
            if (window.innerWidth < 768) {
                e.preventDefault();
                e.stopPropagation();
                watchlistDropdown.classList.toggle("hidden");
                console.log("Watchlist dropdown clicked (mobile).");
                document.querySelectorAll('.genre-dropdown, .user-profile-dropdown, .az-dropdown').forEach(dropdown => {
                    if (dropdown.id !== 'watchlistDropdown') {
                        dropdown.classList.add('hidden');
                    }
                });
            }
        });
        watchlistDropdownToggle.dataset.clickListenerAdded = 'true';
        console.log("Watchlist dropdown click listener added.");
    }

    // Close dropdown on outside click (fallback for both desktop and mobile)
    document.addEventListener("click", function(event) {
        if (watchlistDropdown && !watchlistDropdown.classList.contains("hidden") &&
            !watchlistDropdown.contains(event.target) && watchlistDropdownToggle && !watchlistDropdownToggle.contains(event.target)) {
            watchlistDropdown.classList.add("hidden");
        }
    });
};


/**
 * Populates the main watchlist content grid on watchlist.html.
 * This function is called by the DOMContentLoaded listener on this page.
 */
window.populateWatchlistGrid = async function() {
    console.log("populateWatchlistGrid called.");
    const watchlistGrid = document.getElementById("watchlistContentGrid");
    if (!watchlistGrid) {
        console.error("watchlistContentGrid not found. Cannot populate grid.");
        return;
    }
    console.log("watchlistContentGrid found. Proceeding to fetch watchlist items.");

    const watchlistIds = getWatchlist();
    watchlistGrid.innerHTML = ""; // Clear existing content
    console.log("Watchlist IDs for grid population:", watchlistIds);

    if (watchlistIds.length === 0) {
        watchlistGrid.innerHTML = '<p class="empty-message">Your watchlist is empty.</p>';
        console.log("Watchlist is empty, displayed empty message in grid.");
        return;
    }

    // Ensure getAllContent is available globally before calling
    if (typeof getAllContent !== 'function') {
        console.error("getAllContent function not found. Cannot populate watchlist grid content.");
        watchlistGrid.innerHTML = '<p class="empty-message">Error loading watchlist content.</p>';
        return;
    }
    const allContent = await getAllContent();
    const watchlistItems = allContent.filter(item => watchlistIds.includes(item.id));
    console.log("Watchlist items fetched for grid:", watchlistItems.length, "items.");

    if (watchlistItems.length > 0) {
        if (typeof createContentCard !== 'function') {
            console.error("createContentCard function not found. Ensure main.js is loaded before watchlist.js.");
            watchlistGrid.innerHTML = '<p class="empty-message">Error rendering watchlist items.</p>';
            return;
        }
        watchlistItems.forEach(item => {
            // Use createContentCard from main.js to create the content card
            const card = createContentCard(item);
            watchlistGrid.appendChild(card);
        });
        console.log("Watchlist grid populated with cards.");
        // After all cards are added, ensure their watchlist state is correctly reflected
        // This is handled by main.js's initWatchlistCardStates via a setTimeout on DOMContentLoaded,
        // and also by the custom 'watchlistUpdated' event listener for real-time updates.
        // No explicit loop needed here.
    } else {
         watchlistGrid.innerHTML = '<p class="empty-message">No content found in your watchlist.</p>';
         console.log("No watchlist items found after filtering for grid, displayed empty message.");
    }
};

/**
 * Updates the visual state of a single watchlist button (+ or tick).
 * This function should only update the icon class and button title.
 * It does NOT modify the button's innerHTML to add/remove text.
 * This function is meant to be called by `main.js` and `contentDetails.js` for their respective buttons.
 * @param {HTMLButtonElement} buttonElement - The button element to update.
 * @param {string} contentId - The ID of the content associated with the button.
 */
// This function is defined as `window.updateWatchlistButtonState` in main.js.
// This local definition here might be causing confusion or redundancy.
// To ensure one source of truth and avoid potential conflicts, I will
// keep this function here for conceptual clarity but ensure that the global
// one from `main.js` is the one primarily called by `contentDetails.js` and `main.js` itself.
// The `updateAllButtonsState` function below ensures all relevant buttons are updated.
function updateWatchlistButtonState(buttonElement, contentId) {
    const iconElement = buttonElement.querySelector('i');
    // Ensure isInWatchlist is available globally (it is, as window.isInWatchlist)
    if (typeof isInWatchlist !== 'function') {
        console.warn("isInWatchlist function not found in updateWatchlistButtonState. Cannot update icon state.");
        return;
    }

    const isIn = isInWatchlist(contentId);

    if (isIn) {
        if (iconElement) iconElement.className = 'ri-check-line text-white'; // Tick mark
        buttonElement.classList.add('added-to-watchlist'); // Keep this class for styling
        buttonElement.title = "Remove from My List"; // Update tooltip
    } else {
        if (iconElement) iconElement.className = 'ri-add-line text-white'; // Plus icon
        buttonElement.classList.remove('added-to-watchlist'); // Remove class
        buttonElement.title = "Add to My List"; // Update tooltip
    }
    console.log(`Watchlist button state updated for ${contentId}: ${isIn ? 'In Watchlist' : 'Not in Watchlist'}`);
}

/**
 * Updates the state of all watchlist buttons associated with a specific content ID on the page.
 * This is primarily used in response to the 'watchlistUpdated' custom event from main.js.
 * (This function is not directly used in this watchlist.js file, but is kept for context if called externally).
 * @param {string} contentId - The ID of the content whose buttons need updating.
 */
function updateAllButtonsState(contentId) {
    console.log("updateAllButtonsState called for ID:", contentId);
    // Find all buttons on the page with the relevant data-content-id and classes
    const buttons = document.querySelectorAll(`[data-content-id="${contentId}"].add-list-trigger, [data-content-id="${contentId}"].add-list-btn, [data-content-id="${contentId}"].watchlist-icon-btn`);

    if (buttons.length > 0) {
        console.log(`Found ${buttons.length} buttons to update for ID: ${contentId}`);
        buttons.forEach(button => {
            // Call the local updateWatchlistButtonState function
            updateWatchlistButtonState(button, contentId);
        });
    } else {
        console.log(`No buttons found to update for ID: ${contentId}`);
    }
}