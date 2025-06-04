document.addEventListener("DOMContentLoaded", async function() {
    const watchlistContentGrid = document.getElementById("watchlistContentGrid");

    // Only attempt to display watchlist items on the watchlist page
    if (watchlistContentGrid) {
        // populateWatchlistGrid is called from the script tag in watchlist.html now
        // await displayWatchlistItems(); // This line is no longer needed here
    }
});

// Function to get the current user's watchlist from localStorage
function getWatchlist() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        console.log("getWatchlist: No user logged in, returning empty watchlist."); // Debug log
        return []; // Return empty array if no user is logged in
    }

    const allUserWatchlists = localStorage.getItem("userWatchlists");
    const parsedUserWatchlists = allUserWatchlists ? JSON.parse(allUserWatchlists) : {};

    const userWatchlist = parsedUserWatchlists[loggedInUser] || [];
    console.log(`getWatchlist for user "${loggedInUser}":`, userWatchlist); // Debug log
    return userWatchlist;
}

// Function to save the current user's watchlist to localStorage
function saveWatchlist(watchlist) {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        console.warn("saveWatchlist: No user logged in. Watchlist not saved."); // Debug log
        return; // Cannot save if no user is logged in
    }

    const allUserWatchlists = localStorage.getItem("userWatchlists");
    const parsedUserWatchlists = allUserWatchlists ? JSON.parse(allUserWatchlists) : {};

    parsedUserWatchlists[loggedInUser] = watchlist; // Update the current user's watchlist

    console.log(`saveWatchlist for user "${loggedInUser}":`, watchlist); // Debug log
    localStorage.setItem("userWatchlists", JSON.stringify(parsedUserWatchlists));
}

// Function to add an item to the watchlist
window.addToWatchlist = function(contentId) {
    console.log("addToWatchlist called for ID:", contentId); // Debug log
    const watchlist = getWatchlist();

    // Check if the item is already in the watchlist
    if (watchlist.includes(contentId)) {
        if (typeof showNotification === 'function') {
            showNotification("This item is already in your watchlist!", 'info');
        } else {
             alert("This item is already in your watchlist!"); // Fallback
        }
        console.log("Item already in watchlist."); // Debug log
        return;
    }

    // Add the item ID to the watchlist array
    watchlist.push(contentId);
    saveWatchlist(watchlist);

    if (typeof showNotification === 'function') {
        showNotification("Item added to your watchlist!", 'success');
    } else {
         alert("Item added to your watchlist!"); // Fallback
    }
    console.log("Item added to watchlist."); // Debug log

    // Update the watchlist dropdown in the header
    updateWatchlistDropdown();

    // Find and update the state of ALL buttons for this content ID on the current page
    updateAllButtonsState(contentId);
}

// Function to remove an item from the watchlist
window.removeFromWatchlist = function(contentId) {
    console.log("removeFromWatchlist called for ID:", contentId); // Debug log
    let watchlist = getWatchlist();

    // Filter out the item ID
    const initialLength = watchlist.length;
    watchlist = watchlist.filter(id => id !== contentId);
    const removed = initialLength > watchlist.length;

    if (removed) {
        saveWatchlist(watchlist);
        if (typeof showNotification === 'function') {
            showNotification("Item removed from your watchlist!", 'info');
        } else {
             alert("Item removed from your watchlist!"); // Fallback
        }
        console.log("Item removed from watchlist."); // Debug log
    } else {
        console.warn("Attempted to remove item not in watchlist:", contentId); // Debug log
    }


    // Update the watchlist dropdown and the watchlist page if it's open
    updateWatchlistDropdown();
    // If on the watchlist page, re-render the grid
    if (document.getElementById("watchlistContentGrid")) {
        console.log("On watchlist page, re-populating grid."); // Debug log
        populateWatchlistGrid(); // Assuming this function will be defined for the watchlist page
    }

    // Find and update the state of ALL buttons for this content ID on the current page
    updateAllButtonsState(contentId);
}


// Function to check if an item is in the watchlist
window.isInWatchlist = function(contentId) {
    const watchlist = getWatchlist(); // getWatchlist now handles user context
    const isIn = watchlist.includes(contentId);
    console.log(`isInWatchlist check for ${contentId}: ${isIn}`); // Debug log
    return isIn;
}

// Function to update the watchlist dropdown in the header
window.updateWatchlistDropdown = async function() {
    console.log("updateWatchlistDropdown called."); // Debug log
    const watchlistDropdown = document.getElementById("watchlistDropdown");
    const watchlistDropdownToggle = document.getElementById("watchlistDropdownToggle"); // This is the 'My List' nav link

    if (!watchlistDropdown || !watchlistDropdownToggle) {
        console.warn("Watchlist dropdown elements not found.");
        return;
    }
     console.log("Watchlist dropdown elements found."); // Debug log


    const watchlistIds = getWatchlist(); // getWatchlist now handles user context
    watchlistDropdown.innerHTML = ""; // Clear existing content
    console.log("Watchlist IDs:", watchlistIds); // Debug log

    // Update the badge count
    const watchlistCountBadge = watchlistDropdownToggle.querySelector('.watchlist-count-badge');
    if (watchlistCountBadge) {
        watchlistCountBadge.textContent = watchlistIds.length;
        // Show/hide badge based on count
        if (watchlistIds.length > 0) {
            watchlistCountBadge.classList.remove('hidden');
        } else {
            watchlistCountBadge.classList.add('hidden');
        }
         console.log("Watchlist badge count updated:", watchlistIds.length); // Debug log
    } else {
         console.warn("Watchlist count badge element not found."); // Debug log
    }


    if (watchlistIds.length === 0) {
        watchlistDropdown.innerHTML = '<p class="dropdown-empty-message">Your watchlist is empty.</p>';
        console.log("Watchlist is empty, displayed empty message."); // Debug log
    } else {
        // Fetch details for watchlist items
        const allContent = await getAllContent(); // Assuming getAllContent is available from movieApi.js
        const watchlistItems = allContent.filter(item => watchlistIds.includes(item.id));
        console.log("Watchlist items fetched:", watchlistItems.length, "items."); // Debug log


        if (watchlistItems.length > 0) {
             watchlistItems.forEach(item => {
                const itemElement = document.createElement("a");
                itemElement.href = `movie-details.html?id=${item.id}`;
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
             console.log("Watchlist dropdown items populated."); // Debug log


            // Add "See All" link
            const seeAllLink = document.createElement("a");
            seeAllLink.href = "watchlist.html";
            seeAllLink.classList.add("dropdown-see-all");
            seeAllLink.textContent = "See All";
            seeAllLink.target = "_blank"; // Open in new tab
            watchlistDropdown.appendChild(seeAllLink);
             console.log("Watchlist dropdown 'See All' link added."); // Debug log


        } else {
             watchlistDropdown.innerHTML = '<p class="dropdown-empty-message">No content found in your watchlist.</p>';
             console.log("No watchlist items found after filtering, displayed empty message."); // Debug log
        }
    }

    // Use mouseover/mouseout for hover effect on desktop
    let watchlistDropdownTimeout;

    const showWatchlistDropdown = () => {
        clearTimeout(watchlistDropdownTimeout);
        watchlistDropdown.classList.remove("hidden");
         // Close other dropdowns if open (like genre or user profile)
        document.querySelectorAll('.genre-dropdown, .user-profile-dropdown').forEach(dropdown => {
            if (dropdown.id !== 'watchlistDropdown') {
                dropdown.classList.add('hidden');
            }
        });
         console.log("Watchlist dropdown shown."); // Debug log
    };

    const hideWatchlistDropdown = () => {
        watchlistDropdownTimeout = setTimeout(() => {
            watchlistDropdown.classList.add("hidden");
             console.log("Watchlist dropdown hidden."); // Debug log
        }, 200); // Delay hiding
    };

    // Add event listeners for hover on desktop (min-width 768px)
    // Check if listener is already added to prevent duplicates after template loading
    if (!watchlistDropdownToggle.dataset.hoverListenerAdded) {
        watchlistDropdownToggle.addEventListener("mouseover", () => {
             if (window.innerWidth >= 768) showWatchlistDropdown();
        });
        watchlistDropdownToggle.addEventListener("mouseout", hideWatchlistDropdown);
        watchlistDropdown.addEventListener("mouseover", () => clearTimeout(watchlistDropdownTimeout)); // Keep open when hovering dropdown
        watchlistDropdown.addEventListener("mouseout", hideWatchlistDropdown);
        watchlistDropdownToggle.dataset.hoverListenerAdded = 'true'; // Mark as added
         console.log("Watchlist dropdown hover listeners added."); // Debug log
    }


    // Add click listener for mobile (max-width 767px)
    // Check if listener is already added
    if (!watchlistDropdownToggle.dataset.clickListenerAdded) {
        watchlistDropdownToggle.addEventListener("click", (e) => {
            if (window.innerWidth < 768) {
                e.preventDefault(); // Prevent navigation on mobile click
                e.stopPropagation(); // Prevent document click from closing immediately
                watchlistDropdown.classList.toggle("hidden");
                 console.log("Watchlist dropdown clicked (mobile)."); // Debug log
                 // Close other dropdowns if open (like genre or user profile)
                document.querySelectorAll('.genre-dropdown, .user-profile-dropdown').forEach(dropdown => {
                    if (dropdown.id !== 'watchlistDropdown') {
                        dropdown.classList.add('hidden');
                    }
                });
            }
        });
         watchlistDropdownToggle.dataset.clickListenerAdded = 'true'; // Mark as added
         console.log("Watchlist dropdown click listener added."); // Debug log
    }


    // Close dropdown on outside click (for both desktop and mobile fallback)
    document.addEventListener("click", function(event) {
        if (watchlistDropdown && !watchlistDropdown.classList.contains("hidden") &&
            !watchlistDropdown.contains(event.target) && watchlistDropdownToggle && !watchlistDropdownToggle.contains(event.target)) {
            watchlistDropdown.classList.add("hidden");
        }
    });
};


// Initial update of the watchlist dropdown when templates are loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log("watchlist.js DOMContentLoaded fired."); // Debug log
    // Ensure templates are loaded before trying to update the header dropdown
    if (typeof ensureTemplatesLoaded === "function") {
        console.log("ensureTemplatesLoaded function found, waiting for templates."); // Debug log
        await ensureTemplatesLoaded();
        console.log("Templates loaded."); // Debug log
        updateWatchlistDropdown(); // Update dropdown after header is loaded
    } else {
        console.warn("ensureTemplatesLoaded function not found, using fallback timeout for template loading.");
        // Fallback if templates.js structure is different
        setTimeout(updateWatchlistDropdown, 500); // Wait a bit for header to load
    }
});

// Function to populate the watchlist page grid (will be called from watchlist.html's script)
window.populateWatchlistGrid = async function() {
    console.log("populateWatchlistGrid called."); // Debug log
    const watchlistGrid = document.getElementById("watchlistContentGrid");
    if (!watchlistGrid) {
        console.warn("watchlistContentGrid not found."); // Debug log
        return;
    }
    console.log("watchlistContentGrid found."); // Debug log


    const watchlistIds = getWatchlist(); // getWatchlist now handles user context
    watchlistGrid.innerHTML = ""; // Clear existing content
    console.log("Watchlist IDs for grid:", watchlistIds); // Debug log


    if (watchlistIds.length === 0) {
        watchlistGrid.innerHTML = '<p class="empty-message">Your watchlist is empty.</p>';
        console.log("Watchlist is empty, displayed empty message in grid."); // Debug log
        return;
    }

    const allContent = await getAllContent(); // Assuming getAllContent is available
    const watchlistItems = allContent.filter(item => watchlistIds.includes(item.id));
    console.log("Watchlist items fetched for grid:", watchlistItems.length, "items."); // Debug log


    if (watchlistItems.length > 0) {
        watchlistItems.forEach(item => {
            // Use createContentCard from main.js
            if (typeof createContentCard === 'function') {
                 const card = createContentCard(item);
                 watchlistGrid.appendChild(card);
            } else {
                 console.error("createContentCard function not found from main.js.");
                 // Fallback or error message
            }
        });
         console.log("Watchlist grid populated."); // Debug log
    } else {
         watchlistGrid.innerHTML = '<p class="empty-message">No content found in your watchlist.</p>';
         console.log("No watchlist items found after filtering for grid, displayed empty message."); // Debug log
    }
};

// Helper function to find and update ALL button states for a given content ID on the page
function updateWatchlistButtonState(button, contentId) {
    const isIn = isInWatchlist(contentId);
    if (isIn) {
        button.innerHTML = `<i class="ri-check-line"></i><span>In My List</span>`;
        button.classList.add('in-watchlist');
    } else {
        button.innerHTML = `<i class="ri-add-line"></i><span>Add to My List</span>`;
        button.classList.remove('in-watchlist');
    }
}

function updateAllButtonsState(contentId) {
    console.log("updateAllButtonsState called for ID:", contentId); // Debug log
    const buttons = document.querySelectorAll(`[data-content-id="${contentId}"].add-list-trigger, [data-content-id="${contentId}"].add-list-btn`);

    if (buttons.length > 0) {
        console.log(`Found ${buttons.length} buttons to update for ID: ${contentId}`); // Debug log
        buttons.forEach(button => {
            updateWatchlistButtonState(button, contentId);
        });
    } else {
        console.log(`No buttons found to update for ID: ${contentId}`); // Debug log
    }
}
