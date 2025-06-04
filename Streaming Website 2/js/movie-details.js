document.addEventListener("DOMContentLoaded", async function() {
    console.log("movie-details.js DOMContentLoaded fired."); // Debug log
    const movieDetailSection = document.getElementById("movieDetailSection");

    // Ensure templates and movieApi data are loaded before proceeding
    if (typeof ensureTemplatesLoaded === "function") {
        console.log("ensureTemplatesLoaded function found, waiting for templates."); // Debug log
        await ensureTemplatesLoaded();
        console.log("Templates loaded."); // Debug log
    } else {
         console.warn("ensureTemplatesLoaded function not found, using fallback timeout.");
         await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit
         console.log("Fallback timeout finished."); // Debug log
    // Helper functions for comments
    function saveCommentToStorage(contentId, comment) {
        const storedComments = JSON.parse(localStorage.getItem(`comments_${contentId}`) || '[]');
        storedComments.push(comment);
        localStorage.setItem(`comments_${contentId}`, JSON.stringify(storedComments));
    }

    function displayComments(contentId) {
        const storedComments = JSON.parse(localStorage.getItem(`comments_${contentId}`) || '[]');
        const commentsList = document.getElementById("commentsList");
        if (commentsList) {
            commentsList.innerHTML = '';
            storedComments.forEach(comment => {
                const commentDiv = document.createElement("div");
                commentDiv.classList.add("submitted-comment");
                commentDiv.innerHTML = `
                    <p><strong>${comment.name}</strong> (${comment.email}) - <em>${comment.date}</em></p>
                    <p>${comment.text}</p>
                `;
                commentsList.appendChild(commentDiv);
            });
        }
    }

    // Display existing comments on page load
    displayComments(contentId);
}
    await getAllContent(); // Ensure data is cached
    console.log("Content data loaded."); // Debug log


    if (movieDetailSection) {
        const urlParams = new URLSearchParams(window.location.search);
        const contentId = urlParams.get('id');
        console.log("Content ID from URL:", contentId); // Debug log

        if (contentId) {
            await displayMovieDetails(contentId);
        } else {
            movieDetailSection.innerHTML = '<p class="empty-message">Content ID not found in URL.</p>';
            console.warn("Content ID not found in URL."); // Debug log
        }
    } else {
         console.warn("movieDetailSection not found."); // Debug log
    }
});

async function displayMovieDetails(contentId) {
    console.log("displayMovieDetails called for ID:", contentId); // Debug log
    const movieDetailSection = document.getElementById("movieDetailSection");
    if (!movieDetailSection) {
        console.warn("movieDetailSection not found inside displayMovieDetails."); // Debug log
        return;
    }

    const item = await getContentById(contentId); // Assuming getContentById is available from movieApi.js
    console.log("Fetched content item:", item); // Debug log

    if (!item) {
        movieDetailSection.innerHTML = '<p class="empty-message">Content not found.</p>';
        console.warn("Content item not found for ID:", contentId); // Debug log
        return;
    }

    // Populate the main movie detail banner section
    // Clear previous content first
    movieDetailSection.innerHTML = '';

    const bannerHtml = `
        <div class="movie-detail-banner" style="background-image: url('${item.heroImage || item.posterImage}')">
            <div class="movie-detail-overlay"></div>
            <div class="container movie-detail-content-wrapper">
                <div class="movie-detail-poster">
                    <img src="${item.posterImage}" alt="${item.title}">
                </div>
                <div class="movie-detail-info">
                    <h1 class="movie-detail-title">${item.title}</h1>
                    <div class="movie-detail-meta">
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
                    <p class="movie-detail-description">${item.description}</p>
                    <div class="movie-detail-attributes">
                        <p><strong>Languages:</strong> ${item.languages && item.languages.length > 0 ? item.languages.join(", ") : 'N/A'}</p>
                        <p><strong>Quality:</strong> ${item.quality && item.quality.length > 0 ? item.quality.join(", ") : 'N/A'}</p>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    movieDetailSection.innerHTML = bannerHtml;

    // Get reference to the new action buttons container
    const movieDetailBottomActions = document.getElementById("movieDetailBottomActions");

    if (movieDetailBottomActions) {
        // Create Play Now button as a link to the stream page
        const playNowLink = document.createElement("a");
        playNowLink.classList.add("btn", "btn-primary", "play-now-btn");
        playNowLink.href = `stream.html?id=${item.id}`;
        playNowLink.innerHTML = `<i class="ri-play-fill"></i><span>Play Now</span>`;
        movieDetailBottomActions.appendChild(playNowLink);

        // Create Add to My List button
        const addListBtn = document.createElement("button");
        addListBtn.classList.add("btn", "btn-secondary", "add-list-btn");
        addListBtn.dataset.contentId = item.id;
        addListBtn.innerHTML = `<i class="ri-add-line"></i><span>Add to My List</span>`;
        movieDetailBottomActions.appendChild(addListBtn);

        // Create Download button
        const downloadBtn = document.createElement("button");
        downloadBtn.classList.add("btn", "btn-secondary", "download-btn");
        downloadBtn.innerHTML = `<i class="ri-download-line"></i><span>Download</span>`;
        movieDetailBottomActions.appendChild(downloadBtn);

        console.log("Action buttons created and appended to movieDetailBottomActions.");

        addListBtn.addEventListener("click", () => {
            console.log("Add to My List button clicked.");
            if (localStorage.getItem("loggedInUser")) {
                console.log("User logged in, attempting to add to watchlist.");
                if (typeof addToWatchlist === 'function') {
                    addToWatchlist(item.id);
                } else {
                    console.warn("addToWatchlist function not found.");
                    showNotification("Add to watchlist functionality not fully loaded yet.");
                }
            } else {
                console.log("User not logged in, showing notification and auth modal.");
                if (typeof showNotification === 'function') {
                    showNotification('Please log in to add to your watchlist', 'info');
                } else {
                    console.warn("showNotification function not found.");
                    alert("Please log in to add to your watchlist");
                }
                if (typeof showAuthModal === 'function') {
                    showAuthModal('login');
                } else {
                     console.warn("showAuthModal function not found.");
                }
            }
        });

downloadBtn.addEventListener("click", () => {
    console.log("Download button clicked.");
    if (localStorage.getItem("loggedInUser")) {
        console.log("User logged in, starting download.");
        showNotification(`Downloading "${item.title}"...`, 'info');
        // Simulate download - in a real app this would initiate a download
        setTimeout(() => {
            showNotification(`"${item.title}" downloaded successfully!`, 'success');
        }, 2000);
    } else {
        console.log("User not logged in, showing notification and auth modal.");
        if (typeof showNotification === 'function') {
            showNotification('Please log in to download content', 'info');
        } else {
            console.warn("showNotification function not found.");
            alert("Please log in to download content");
        }
        if (typeof showAuthModal === 'function') {
            showAuthModal('login');
        } else {
            console.warn("showAuthModal function not found.");
        }
    }
});

        // Update watchlist button state immediately
        if (typeof window.isInWatchlist === 'function') {
            if (window.isInWatchlist(item.id)) {
                addListBtn.innerHTML = `<i class="ri-check-line"></i><span>In My List</span>`;
                addListBtn.classList.add('in-list');
            } else {
                addListBtn.innerHTML = `<i class="ri-add-line"></i><span>Add to My List</span>`;
                addListBtn.classList.remove('in-list');
            }
        } else {
            console.warn("isInWatchlist function not found.");
        }

    } else {
        console.warn("movieDetailBottomActions element not found.");
    }


    // Populate Movie Info Section (assuming elements exist in movie-details.html)
    const movieInfoGrid = document.getElementById("movieInfoGrid");
    if (movieInfoGrid) {
        movieInfoGrid.innerHTML = `
            <div class="info-item"><strong>Director:</strong> ${item.director || 'N/A'}</div>
            <div class="info-item"><strong>Cast:</strong> ${item.cast && item.cast.length > 0 ? item.cast.join(", ") : 'N/A'}</div>
            <div class="info-item"><strong>Release Date:</strong> ${item.releaseDate || 'N/A'}</div>
            <div class="info-item"><strong>Country:</strong> ${item.country || 'N/A'}</div>
        `;
         console.log("Movie info grid populated."); // Debug log
    } else {
         console.warn("Movie info grid element not found."); // Debug log
    }

    // Populate Storyline Section (assuming element exists in movie-details.html)
    const storylineText = document.getElementById("storylineText");
    if (storylineText) {
        storylineText.textContent = item.fullDescription || item.description;
         console.log("Storyline text populated."); // Debug log
    } else {
         console.warn("Storyline text element not found."); // Debug log
    }

    // Populate Screenshots & Trailer Section (assuming elements exist in movie-details.html)
    // Trailer Dropdown Functionality
    const movieTrailerContainer = document.querySelector(".media-section .trailer-container");
    const movieTrailerIframe = document.getElementById("movieTrailer");
    const trailerDropdownBtns = document.querySelectorAll(".trailer-dropdown-btn");

    // Function to show trailer
    function showTrailer(trailerUrl) {
        movieTrailerIframe.src = trailerUrl;
        movieTrailerContainer.style.display = 'block';
        // Use setTimeout to trigger the opacity transition
        setTimeout(() => {
            movieTrailerContainer.classList.add('active');
        }, 50);
    }

    // Function to hide trailer
    function hideTrailer() {
        movieTrailerContainer.classList.remove('active');
        setTimeout(() => {
            movieTrailerContainer.style.display = 'none';
            movieTrailerIframe.src = '';
        }, 300);
    }

    // Set initial state for the original trailer if available
    if (item.trailerUrlOriginal) {
        showTrailer(item.trailerUrlOriginal);
        trailerDropdownBtns[0].classList.add('active');
    }

    // Add click handlers for trailer buttons
    trailerDropdownBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class from all buttons
            trailerDropdownBtns.forEach(b => b.classList.remove('active'));
            
            const trailerType = btn.dataset.trailer;
            let trailerUrl = "";

            if (trailerType === "trailerUrlOriginal" && item.trailerUrlOriginal) {
                trailerUrl = item.trailerUrlOriginal;
                btn.classList.add('active');
            } else if (trailerType === "trailerUrlHindi" && item.trailerUrlHindi) {
                trailerUrl = item.trailerUrlHindi;
                btn.classList.add('active');
            }

            if (trailerUrl) {
                hideTrailer();
                setTimeout(() => {
                    showTrailer(trailerUrl);
                }, 300);
            } else {
                hideTrailer();
                console.log(`No ${trailerType} found, hiding trailer.`);
            }
        });
    });

    const screenshotsGrid = document.getElementById("screenshotsGrid");
    if (screenshotsGrid && item.screenshots && item.screenshots.length > 0) {
        screenshotsGrid.innerHTML = item.screenshots.map(src => `
            <img src="${src}" alt="Screenshot" class="screenshot-item">
        `).join('');
         console.log("Screenshots grid populated:", item.screenshots.length, "items."); // Debug log
    } else if (screenshotsGrid) {
        screenshotsGrid.innerHTML = '<p class="empty-message">No screenshots available.</p>';
         console.log("No screenshots available."); // Debug log
    } else {
         console.warn("Screenshots grid element not found."); // Debug log
    }

    // Populate Related Content Section (placeholder for now, actual logic will be added)
    const relatedContentRow = document.getElementById("relatedContentRow");
    if (relatedContentRow) {
        console.log("Related content row found. Populating..."); // Debug log
        // For now, populate with some random content or a message
        const allContent = await getAllContent();
        // Filter out the current item and find items with at least one common genre
        const relatedItems = allContent.filter(content =>
            content.id !== item.id &&
            item.genres && Array.isArray(item.genres) && // Ensure item.genres is an array
            content.genres && Array.isArray(content.genres) && // Ensure content.genres is an array
            content.genres.some(genre => item.genres.includes(genre))
        ).slice(0, 5); // Get up to 5 related items

        if (relatedItems.length > 0) {
            relatedContentRow.innerHTML = ""; // Clear existing
            relatedItems.forEach(relatedItem => {
                // Use createContentCard from main.js (assuming main.js is loaded before movie-details.js)
                if (typeof createContentCard === 'function') {
                     relatedContentRow.appendChild(createContentCard(relatedItem));
                } else {
                     console.error("createContentCard function not found from main.js.");
                     // Fallback or error message
                }
            });
             console.log("Related content populated:", relatedItems.length, "items."); // Debug log
        } else {
            relatedContentRow.innerHTML = '<p class="empty-message">No related content found.</p>';
             console.log("No related content found."); // Debug log
        }
    } else {
         console.warn("Related content row element not found."); // Debug log
    }

    // Handle Comment/Request Box Section (assuming elements exist in movie-details.html)
    const commentSection = document.querySelector(".comment-section");
    const commentLoginPrompt = document.getElementById("commentLoginPrompt");
    const commentLoginLink = document.getElementById("commentLoginLink");
    const commentForm = document.getElementById("commentForm");
    const commentNameInput = document.getElementById("comment-name");
    const commentEmailInput = document.getElementById("comment-email");
    const commentTextInput = document.getElementById("comment-text");
    const saveCommentInfoCheckbox = document.getElementById("saveCommentInfo");
    const commentSubmitBtn = commentForm ? commentForm.querySelector("button[type='submit']") : null;
    const commentsList = document.getElementById("commentsList");

        if (commentSection) {
            console.log("Comment section elements found."); // Debug log
            // Make updateCommentFormVisibility globally available for auth.js
            window.updateCommentFormVisibility = function() {
                console.log("updateCommentFormVisibility called."); // Debug log
                const loggedInUser = localStorage.getItem("loggedInUser");
                if (loggedInUser) {
                    console.log("User logged in:", loggedInUser); // Debug log
                    if (commentLoginPrompt) commentLoginPrompt.classList.add("hidden");
                    if (commentForm) commentForm.classList.remove("hidden");
                    if (commentEmailInput) commentEmailInput.value = loggedInUser; // Pre-fill email

                    // Load saved info if checkbox was checked previously
                    const savedName = localStorage.getItem("commentUserName");
                    // const savedEmail = localStorage.getItem("commentUserEmail"); // Note: Email is overwritten by loggedInUser
                    if (savedName && commentNameInput) { // Only load name, email comes from login
                        commentNameInput.value = savedName;
                        if (saveCommentInfoCheckbox) saveCommentInfoCheckbox.checked = true;
                         console.log("Loaded saved comment name."); // Debug log
                    } else {
                         if (saveCommentInfoCheckbox) saveCommentInfoCheckbox.checked = false; // Ensure unchecked if no saved name
                    }
                } else {
                    console.log("User not logged in."); // Debug log
                    if (commentLoginPrompt) commentLoginPrompt.classList.remove("hidden");
                    if (commentForm) commentForm.classList.add("hidden");
                     if (commentEmailInput) commentEmailInput.value = ""; // Clear email if logged out
                     if (commentNameInput) commentNameInput.value = ""; // Clear name if logged out
                     if (saveCommentInfoCheckbox) saveCommentInfoCheckbox.checked = false; // Uncheck save info
                }
            }
            
            // Enable textarea when type is selected
            const commentTypeSelect = document.getElementById("comment-type");
            if (commentTypeSelect && commentTextInput) {
                commentTypeSelect.addEventListener("change", function() {
                    commentTextInput.disabled = !this.value;
                });
            }

        if (commentLoginLink) {
            console.log("Comment login link found, initializing listener."); // Debug log
            commentLoginLink.addEventListener("click", (e) => {
                e.preventDefault();
                console.log("Comment login link clicked."); // Debug log
                // Call showAuthModal from auth.js
                if (typeof showAuthModal === 'function') {
                    showAuthModal('login'); // Explicitly open login tab
                } else {
                     console.warn("showAuthModal function not found.");
                }
            });
        } else {
             console.warn("Comment login link element not found."); // Debug log
        }


        if (commentSubmitBtn) {
            console.log("Comment submit button found, initializing listener."); // Debug log
            commentSubmitBtn.addEventListener("click", (e) => {
                e.preventDefault();
                console.log("Comment submit button clicked."); // Debug log
                let isValid = true;
                // Clear previous errors
                commentForm.querySelectorAll('.error-message').forEach(el => el.remove());
                commentForm.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));


                // Basic validation
                if (!commentNameInput.value.trim()) {
                    displayError(commentNameInput, "Please enter your name.");
                    isValid = false;
                }
                 // Email is readonly and pre-filled, no need to validate format here, just presence
                 if (!commentEmailInput.value.trim()) {
                     // This case should ideally not happen if logged in, but good for robustness
                     displayError(commentEmailInput, "Email is required.");
                     isValid = false;
                 }
                if (!commentTextInput.value.trim()) {
                    displayError(commentTextInput, "Please enter your comment or request.");
                    isValid = false;
                }

                if (isValid) {
                    console.log("Comment form is valid. Simulating submission."); // Debug log
                    // Simulate comment submission
                    const comment = {
                        name: commentNameInput.value.trim(),
                        email: commentEmailInput.value.trim(),
                        text: commentTextInput.value.trim(),
                        date: new Date().toLocaleDateString(), // Simple date format
                        type: document.getElementById("comment-type").value
                    };
                    console.log("Submitted Comment:", comment);

                    // Save info if checkbox is checked
                    if (saveCommentInfoCheckbox && saveCommentInfoCheckbox.checked) {
                        localStorage.setItem("commentUserName", comment.name);
                        // localStorage.setItem("commentUserEmail", comment.email); // Don't save email if it's from login
                         console.log("Saved comment name to localStorage."); // Debug log
                    } else {
                        localStorage.removeItem("commentUserName");
                        // localStorage.removeItem("commentUserEmail");
                         console.log("Removed saved comment info from localStorage."); // Debug log
                    }

                    // Clear form (except email which is readonly)
                    commentNameInput.value = "";
                    commentTextInput.value = "";
                    // Reset the type select and disable textarea
                    document.getElementById("comment-type").value = "";
                    commentTextInput.disabled = true;
                    // Keep checkbox state as is

                    // Display submitted comment
                    saveCommentToStorage(item.id, comment);
                    displayComments(item.id);
                    // Show notification based on type
                    if (comment.type === "request") {
                        showNotification("Your request has been submitted successfully!", 'success');
                    } else if (comment.type === "comment") {
                        showNotification("Your comment has been submitted successfully!", 'success');
                    }
                } else {
                     console.log("Comment form validation failed."); // Debug log
                }
            });
        } else {
             console.warn("Comment submit button not found."); // Debug log
        }

         // Helper function to display error messages for comment form
        function displayError(inputElement, message) {
            console.log("Displaying comment form error for", inputElement.id, ":", message); // Debug log
            // Remove existing error message for this input
            let existingError = inputElement.nextElementSibling;
            if (existingError && existingError.classList.contains("error-message")) {
                 existingError.remove();
            }

            let errorElement = document.createElement("p");
            errorElement.classList.add("error-message");
            errorElement.textContent = message;
            inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
            inputElement.classList.add("input-error");
        }


        // Initial check and update when page loads
        updateCommentFormVisibility();
        
        // Load existing comments
        if (contentId) {
            displayComments(contentId);
        }

        // Add tab switching functionality
        const commentTabs = document.querySelectorAll('.comment-tab');
        commentTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                commentTabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all tab contents
                document.querySelectorAll('.comment-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show the corresponding tab content
                const tabName = tab.dataset.tab;
                const tabContent = document.getElementById(`${tabName}List`);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            });
        });
    } else {
         console.warn("Comment section container not found."); // Debug log
    }
}

// Helper functions for comments
function saveCommentToStorage(contentId, comment) {
    const key = `comments_${contentId}`;
    const storedComments = JSON.parse(localStorage.getItem(key) || '[]');
    storedComments.push(comment);
    localStorage.setItem(key, JSON.stringify(storedComments));
}

function displayComments(contentId) {
    const key = `comments_${contentId}`;
    const storedComments = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Get references to both lists
    const commentsList = document.getElementById("commentsList");
    const requestsList = document.getElementById("requestsList");

    if (commentsList) {
        // Filter and display comments
        const commentItems = storedComments.filter(c => c.type === 'comment');
        commentsList.innerHTML = '';
        commentItems.forEach(comment => {
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("submitted-comment");
            commentDiv.innerHTML = `
                <p><strong>${comment.name}</strong> (${comment.email}) - <em>${comment.date}</em></p>
                <p>${comment.text}</p>
            `;
            commentsList.appendChild(commentDiv);
        });
    }

    if (requestsList) {
        // Filter and display requests
        const requestItems = storedComments.filter(c => c.type === 'request');
        requestsList.innerHTML = '';
        requestItems.forEach(comment => {
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("submitted-comment");
            commentDiv.innerHTML = `
                <p><strong>${comment.name}</strong> (${comment.email}) - <em>${comment.date}</em></p>
                <p>${comment.text}</p>
            `;
            requestsList.appendChild(commentDiv);
        });
    }
}
