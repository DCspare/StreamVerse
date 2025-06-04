document.addEventListener("DOMContentLoaded", function() {
    console.log("auth.js DOMContentLoaded fired."); // Debug log
    const authModal = document.getElementById("authModal");
    const loginTab = document.getElementById("loginTab");
    const signupTab = document.getElementById("signupTab");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const closeAuthBtn = document.getElementById("closeAuth");
    // This is VERY important, otherwise auth ToggleBtn will be null
    let authToggleBtn = null;

    // Login form elements
    const loginEmailInput = document.getElementById("login-email");
    const loginPasswordInput = document.getElementById("login-password");
    const loginSubmitBtn = loginForm ? loginForm.querySelector(".auth-submit-btn") : null;

    // Signup form elements
    const signupUsernameInput = document.getElementById("signup-username");
    const signupEmailInput = document.getElementById("signup-email");
    const signupPasswordInput = document.getElementById("signup-password");
    const signupConfirmPasswordInput = document.getElementById("signup-confirm-password");
    const signupTermsCheckbox = signupForm ? signupForm.querySelector(".terms-checkbox input[type='checkbox']") : null;
    const signupSubmitBtn = signupForm ? signupForm.querySelector(".auth-submit-btn") : null;


    // User profile elements (will be dynamically created/updated)
    let userProfileBtn = null; // Reference to the user icon button
    let userProfileDropdown = null; // Reference to the user dropdown

    // Utility to show/hide modal
    // Modified to accept an optional 'tab' parameter ('login' or 'signup')
    window.showAuthModal = function(tab) {
        console.log("showAuthModal called with tab:", tab); // Debug log
        if (authModal) {
            authModal.classList.remove("hidden");
            document.body.classList.add("no-scroll-modal");

            // Determine which tab to activate based on the 'tab' parameter
            let showLogin = true; // Default to login tab

            if (tab === 'signup') {
                showLogin = false; // Show signup tab instead
            }

            if (loginTab && signupTab && loginForm && signupForm) {
                if (showLogin) {
                    loginTab.classList.add("active");
                    signupTab.classList.remove("active");
                    loginForm.classList.remove("hidden");
                    signupForm.classList.add("hidden");
                    console.log("Activated login tab."); // Debug log
                } else {
                    signupTab.classList.add("active");
                    loginTab.classList.remove("active");
                    signupForm.classList.remove("hidden");
                    loginForm.classList.add("hidden");
                     console.log("Activated signup tab."); // Debug log
                }
            } else {
                 console.warn("Auth modal tab elements not found."); // Debug log
            }
            clearFormErrors(); // Clear errors when opening modal
        } else {
             console.warn("Auth modal element not found."); // Debug log
        }
    };

    window.hideAuthModal = function() {
        console.log("hideAuthModal called."); // Debug log
        if (authModal) {
            authModal.classList.add("hidden");
            document.body.classList.remove("no-scroll-modal");
            clearFormErrors(); // Clear errors when closing modal
        } else {
             console.warn("Auth modal element not found on hide."); // Debug log
        }
    };

    // Event listeners for modal toggle (attached after templates are loaded)
    // We need to wait for the header template to be loaded before attaching this listener
    // This is handled by the DOMContentLoaded listener in main.js calling initializeHeaderFunctionality
    // which in turn relies on templates.js. Let's add the listener here but ensure it's called
    // after the header is guaranteed to be in the DOM.

    // The checkLoginStatus function will now handle attaching the listener to authToggleBtn
    // if the user is not logged in.

    if (closeAuthBtn) {
        closeAuthBtn.addEventListener("click", hideAuthModal);
    }

    // Tab switching logic
    if (loginTab && signupTab && loginForm && signupForm) {
        loginTab.addEventListener("click", () => {
            console.log("Login tab clicked."); // Debug log
            loginTab.classList.add("active");
            signupTab.classList.remove("active");
            loginForm.classList.remove("hidden");
            signupForm.classList.add("hidden");
            clearFormErrors();
        });

        signupTab.addEventListener("click", () => {
            console.log("Signup tab clicked."); // Debug log
            signupTab.classList.add("active");
            loginTab.classList.remove("active");
            signupForm.classList.remove("hidden");
            loginForm.classList.add("hidden");
            clearFormErrors();
        });
    } else {
         console.warn("Auth tab/form elements not found."); // Debug log
    }

    // Form validation functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    // Function to display error message below an input
    function displayError(inputElement, message) {
        console.log("Displaying error for", inputElement.id, ":", message); // Debug log
        // Remove existing error message for this input
        clearError(inputElement);

        let errorElement = document.createElement("p");
        errorElement.classList.add("error-message");
        errorElement.textContent = message;

        // Insert the error message after the input element
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
        inputElement.classList.add("input-error"); // Add error class to input for styling
    }

    // Function to clear error message for an input
    function clearError(inputElement) {
        const errorElement = inputElement.nextElementSibling;
        if (errorElement && errorElement.classList.contains("error-message")) {
            errorElement.remove();
             console.log("Cleared error for", inputElement.id); // Debug log
        }
        inputElement.classList.remove("input-error"); // Remove error class from input
    }

    // Function to clear all error messages in the modal
    function clearFormErrors() {
        console.log("Clearing all form errors."); // Debug log
        document.querySelectorAll(".error-message").forEach(el => el.remove());
        document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
    }

    // Add input event listeners to clear errors as user types
    if (loginEmailInput) loginEmailInput.addEventListener("input", () => clearError(loginEmailInput));
    if (loginPasswordInput) loginPasswordInput.addEventListener("input", () => clearError(loginPasswordInput));
    if (signupUsernameInput) signupUsernameInput.addEventListener("input", () => clearError(signupUsernameInput));
    if (signupEmailInput) signupEmailInput.addEventListener("input", () => clearError(signupEmailInput));
    if (signupPasswordInput) signupPasswordInput.addEventListener("input", () => clearError(signupPasswordInput));
    if (signupConfirmPasswordInput) signupConfirmPasswordInput.addEventListener("input", () => clearError(signupConfirmPasswordInput));
    if (signupTermsCheckbox) signupTermsCheckbox.addEventListener("change", () => {
        // Clear error specifically for the checkbox if it exists
        const termsGroup = signupTermsCheckbox.closest(".form-group");
        if (termsGroup) {
             const checkboxError = termsGroup.querySelector(".error-message");
             if (checkboxError) checkboxError.remove();
        }
    });


    // Login submission
    if (loginSubmitBtn) {
        console.log("Login submit button found, initializing listener."); // Debug log
        loginSubmitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("Login submit button clicked."); // Debug log
            clearFormErrors(); // Clear previous errors

            let isValid = true;

            // Basic validation
            if (!loginEmailInput.value.trim()) {
                displayError(loginEmailInput, "Email or Username is required.");
                isValid = false;
            }
            // Add email format validation if it looks like an email
            if (loginEmailInput.value.includes('@') && !validateEmail(loginEmailInput.value.trim())) {
                 displayError(loginEmailInput, "Please enter a valid email address.");
                 isValid = false;
            }

            if (!loginPasswordInput.value.trim()) {
                displayError(loginPasswordInput, "Password is required.");
                isValid = false;
            }

            if (isValid) {
                console.log("Login form is valid. Simulating login."); // Debug log
                
                // Show loading state
                const originalText = loginSubmitBtn.innerHTML;
                loginSubmitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Logging in...';
                loginSubmitBtn.disabled = true;
                
                // Simulate login with delay to show loading state
                setTimeout(() => {
                    const userEmail = loginEmailInput.value.trim(); // Use trimmed value
                    localStorage.setItem("loggedInUser", userEmail);
                    console.log("localStorage 'loggedInUser' set to:", userEmail); // Debug log
                    updateAuthUI(userEmail);
                    hideAuthModal();
                    showNotification("Login successful!");
                    
                    // Reset button state
                    loginSubmitBtn.innerHTML = originalText;
                    loginSubmitBtn.disabled = false;
                    
                    // Call update functions
                    if (typeof updateWatchlistDropdown === 'function') {
                        updateWatchlistDropdown();
                    }
                    if (typeof updateCommentFormVisibility === 'function') {
                        updateCommentFormVisibility();
                    }
                }, 1500); // Simulate network delay
            } else {
                 console.log("Login form validation failed."); // Debug log
            }
        });
    } else {
         console.warn("Login submit button not found."); // Debug log
    }

    // Signup submission
    if (signupSubmitBtn) { // Ensure the button is found before adding listener
        console.log("Signup submit button found, initializing listener."); // Debug log
        signupSubmitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("Signup submit button clicked."); // Debug log
            clearFormErrors(); // Clear previous errors

            let isValid = true;

            if (!signupUsernameInput.value.trim()) {
                displayError(signupUsernameInput, "Username is required.");
                isValid = false;
            }
            if (!signupEmailInput.value.trim() || !validateEmail(signupEmailInput.value.trim())) {
                displayError(signupEmailInput, "Please enter a valid email address.");
                isValid = false;
            }
            if (!signupPasswordInput.value.trim() || !validatePassword(signupPasswordInput.value.trim())) {
                displayError(signupPasswordInput, "Password must be at least 6 characters.");
                isValid = false;
            }
            if (signupPasswordInput.value.trim() !== signupConfirmPasswordInput.value.trim()) {
                displayError(signupConfirmPasswordInput, "Passwords do not match.");
                isValid = false;
            }
            if (signupTermsCheckbox && !signupTermsCheckbox.checked) {
                // Find the label or a container near the checkbox to place the error
                const termsGroup = signupTermsCheckbox.closest(".form-group");
                if (termsGroup) {
                     // Place error after the custom checkbox span
                    const customCheckboxSpan = termsGroup.querySelector(".custom-checkbox .checkmark");
                    if (customCheckboxSpan) {
                         let errorElement = document.createElement("p");
                         errorElement.classList.add("error-message");
                         errorElement.textContent = "You must agree to the terms.";
                         termsGroup.insertBefore(errorElement, customCheckboxSpan.nextSibling);
                    } else {
                         // Fallback if structure changes
                         displayError(signupTermsCheckbox, "You must agree to the terms.");
                    }
                } else {
                    displayError(signupTermsCheckbox, "You must agree to the terms.");
                }
                isValid = false;
            }

            if (isValid) {
                console.log("Signup form is valid. Simulating signup."); // Debug log
                // Simulate signup
                const userEmail = signupEmailInput.value.trim(); // Use trimmed value
                localStorage.setItem("loggedInUser", userEmail);
                 console.log("localStorage 'loggedInUser' set to:", userEmail); // Debug log
                updateAuthUI(userEmail);
                hideAuthModal();
                showNotification("Signup successful!");
                 // Call updateWatchlistDropdown if it exists (defined in watchlist.js)
                if (typeof updateWatchlistDropdown === 'function') {
                    updateWatchlistDropdown();
                }
                 // Call updateCommentFormVisibility if it exists (defined in movie-details.js)
                if (typeof updateCommentFormVisibility === 'function') {
                    updateCommentFormVisibility();
                }
            } else {
                 console.log("Signup form validation failed."); // Debug log
            }
        });
    } else {
         console.warn("Signup submit button not found."); // Debug log
    }


    // Post-login UI update
    function updateAuthUI(userEmail) {
        console.log("updateAuthUI called with email:", userEmail); // Debug log
        const headerRight = document.querySelector(".site-header .header-right");
        if (!headerRight) {
            console.error("Header right element not found for UI update."); // Error log
            return;
        }
        console.log("Header right element found."); // Debug log


                 // Remove existing auth button if it exists
        const existingAuthToggle = document.getElementById("authToggle");
        if (existingAuthToggle) {
            console.log("Removing existing auth toggle button."); // Debug log
            existingAuthToggle.remove();
        } else {
            console.log("No existing auth toggle button found to remove."); // Debug log
        }

        // Remove existing user profile elements if they exist (in case of re-render or multiple calls)
        const existingUserProfileBtn = document.getElementById("userProfileToggle");
        const existingUserProfileDropdown = document.getElementById("userProfileDropdown");
        if (existingUserProfileBtn) {
            console.log("Removing existing user profile button."); // Debug log
            existingUserProfileBtn.remove();
        }
        if (existingUserProfileDropdown) {
            console.log("Removing existing user profile dropdown."); // Debug log
            existingUserProfileDropdown.remove();
        }

        // Create user profile button
        userProfileBtn = document.createElement("button");
        userProfileBtn.id = "userProfileToggle";
        userProfileBtn.classList.add("icon-btn", "user-profile-btn");
        userProfileBtn.innerHTML = `<i class="ri-user-fill ri-lg"></i>`; // User icon
        console.log("Created user profile button."); // Debug log

        // Find the mobile menu button to insert before it
        const mobileMenuBtn = headerRight.querySelector(".mobile-menu-btn");
        if (mobileMenuBtn) {
             console.log("Inserting user profile button before mobile menu button."); // Debug log
             headerRight.insertBefore(userProfileBtn, mobileMenuBtn);
        } else {
             console.warn("Mobile menu button not found, appending user profile button."); // Debug log
             headerRight.appendChild(userProfileBtn);
        }

        // Create user profile dropdown
        userProfileDropdown = document.createElement("div");
        userProfileDropdown.id = "userProfileDropdown";
        userProfileDropdown.classList.add("user-profile-dropdown", "glass", "hidden");
        userProfileDropdown.innerHTML = `
            <p class="user-email">${userEmail}</p>
            <button id="signOutBtn" class="btn btn-secondary btn-full-width">Sign Out</button>
        `;
        headerRight.appendChild(userProfileDropdown);
        console.log("Created and appended user profile dropdown."); // Debug log

        // Add event listener for user profile button (using click for mobile/desktop consistency)
        if (userProfileBtn) {
            userProfileBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                 console.log("User profile toggle clicked."); // Debug log
                if (userProfileDropdown) {
                    userProfileDropdown.classList.toggle("hidden");
                     // Close other dropdowns if open (like genre or watchlist)
                    document.querySelectorAll('.genre-dropdown, .watchlist-dropdown').forEach(dropdown => {
                        if (dropdown.id !== 'userProfileDropdown') {
                            dropdown.classList.add('hidden');
                        }
                    });
                } else {
                     console.warn("User profile dropdown not found on toggle click."); // Debug log
                }
            });
        } else {
             console.warn("User profile button not found to add listener."); // Debug log
        }

        // Add event listener for sign out button
        const signOutBtn = document.getElementById("signOutBtn");
        if (signOutBtn) {
            signOutBtn.addEventListener("click", signOut);
             console.log("Sign out button listener added."); // Debug log
        } else {
             console.warn("Sign out button not found."); // Debug log
        }

        // Close dropdown on outside click (handled globally in main.js, but adding here for robustness)
        // document.addEventListener("click", function(event) {
        //     if (userProfileDropdown && !userProfileDropdown.classList.contains("hidden") &&
        //         !userProfileDropdown.contains(event.target) && userProfileBtn && !userProfileBtn.contains(event.target)) {
        //         userProfileDropdown.classList.add("hidden");
        //     }
        // });
    }

    // Sign out function
    function signOut() {
        console.log("Signing out."); // Debug log
        localStorage.removeItem("loggedInUser");
        console.log("localStorage 'loggedInUser' removed."); // Debug log

        // Call updateWatchlistDropdown if it exists (defined in watchlist.js)
        if (typeof updateWatchlistDropdown === 'function') {
            updateWatchlistDropdown();
        }
         // Call updateCommentFormVisibility if it exists (defined in movie-details.js)
        if (typeof updateCommentFormVisibility === 'function') {
            updateCommentFormVisibility();
        }

        // Reload the page to reset the UI
        console.log("Reloading page after sign out."); // Debug log
        location.reload();
    }

    // Check login status on page load
    function checkLoginStatus() {
        console.log("checkLoginStatus called."); // Debug log
        const loggedInUser = localStorage.getItem("loggedInUser");
        if (loggedInUser) {
            console.log("User found in localStorage:", loggedInUser, "Updating UI."); // Debug log
            // Ensure header is loaded before updating UI
            // This function is called on DOMContentLoaded, but header might be loaded async
            // We need to wait for the header placeholder to be populated.
            // A simple timeout or checking for a header element might be needed if templates.js is async.
            // Assuming templates.js finishes before this script's DOMContentLoaded handler finishes.
            // Let's add a check for the header element.
            const siteHeader = document.querySelector(".site-header");
            if (siteHeader) {
                 console.log("Site header found, updating auth UI."); // Debug log
                 updateAuthUI(loggedInUser);
            } else {
                 console.warn("Site header not found on checkLoginStatus, retrying after delay."); // Debug log
                 // Retry after a short delay if header isn't immediately available
                 setTimeout(() => {
                     const siteHeaderRetry = document.querySelector(".site-header");
                     if (siteHeaderRetry) {
                         console.log("Site header found on retry, updating auth UI."); // Debug log
                         updateAuthUI(loggedInUser);
                     } else {
                         console.error("Site header still not found after retry. Cannot update auth UI."); // Error log
                     }
                 }, 500); // Increased delay
            }

        } else {
            console.log("No user found in localStorage. Auth button remains 'Sign In'."); // Debug log
        }
    }
    // Initial check and update when page loads
    // Attach the authToggleBtn listener after the templates are loaded
    // This event listener should be attached ONLY ONCE and AFTER the header is loaded.

    // Ensure that this code is only run once templates are loaded.
    const initializeAuthToggle = () => {
       // Re-select the authToggleBtn after templates have loaded
       authToggleBtn = document.getElementById("authToggle");
       if (authToggleBtn) {
           console.log("Auth toggle button found, attaching click listener.");
           authToggleBtn.addEventListener("click", function (event) {
               event.preventDefault();
               console.log("Auth toggle button clicked.");
               // Always open the modal to the login tab by default when clicking the main auth button
               showAuthModal('login'); // Explicitly open login tab
               event.stopPropagation();
           });
       } else {
           console.warn("Auth toggle button NOT found even after templates loaded.");
       }
    };

    // Wait at least some time for template loading and then attempt checkLoginStatus and authToggle initialization
    // Templates load asynchronously, so we must wait before trying to access elements inside them.
     if (typeof ensureTemplatesLoaded === "function") {
         ensureTemplatesLoaded().then(() => {
              checkLoginStatus();
              initializeAuthToggle();
         });
     } else {
          // Fallback: if you don't have ensureTemplatesLoaded function, try setting the visibility after a delay
          setTimeout(() => {
              checkLoginStatus();
              initializeAuthToggle();
          }, 750);
     }

     // Function to display error message specifically for the terms checkbox
     function displayTermsError(checkboxElement, message) {
         console.log("Displaying error for terms checkbox:", message); // Debug log
         // Find the parent form group
         const termsGroup = checkboxElement.closest(".form-group");
         if (!termsGroup) {
             console.warn("Terms checkbox parent form-group not found.");
             return;
         }
         console.log("Terms checkbox parent form-group found."); // Debug log

         // Remove existing error message for the terms group
         let existingError = termsGroup.querySelector(".error-message");
         if (existingError) {
             existingError.remove();
         }

         let errorElement = document.createElement("p");
         errorElement.classList.add("error-message");
         errorElement.textContent = message;

         // Insert the error message before the custom-checkbox element
         const customCheckboxLabel = termsGroup.querySelector(".custom-checkbox");
         if (customCheckboxLabel) {
             console.log("Custom checkbox label found, inserting error before it."); // Debug log
             termsGroup.insertBefore(errorElement, customCheckboxLabel);
         } else {
              console.warn("Custom checkbox label not found, appending error to form-group."); // Debug log
              // Fallback if structure changes
              termsGroup.appendChild(errorElement);
         }
     }

});
