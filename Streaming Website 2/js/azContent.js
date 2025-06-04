document.addEventListener("DOMContentLoaded", async function() {
    console.log("azContent.js DOMContentLoaded fired."); // Debug log
    const azContentGrid = document.getElementById("azContentGrid");
    const sectionTitle = document.querySelector(".content-section .section-title");
    const azFilterButtonsContainer = document.querySelector(".az-filter-buttons"); // New element for filter buttons

    // Ensure templates and movieApi data are loaded before proceeding
    if (typeof ensureTemplatesLoaded === "function") {
        console.log("ensureTemplatesLoaded function found, waiting for templates."); // Debug log
        await ensureTemplatesLoaded();
        console.log("Templates loaded."); // Debug log
    } else {
         console.warn("ensureTemplatesLoaded function not found, using fallback timeout.");
         await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit
         console.log("Fallback timeout finished."); // Debug log
    }
    await getAllContent(); // Ensure data is cached
    console.log("Content data loaded."); // Debug log

    // Populate A-Z filter buttons
    if (azFilterButtonsContainer) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const numbers = ['0-9'];

        alphabet.forEach(letter => {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-secondary');
            button.textContent = letter;
            button.dataset.letter = letter;
            azFilterButtonsContainer.appendChild(button);
        });

        const numButton = document.createElement('button');
        numButton.classList.add('btn', 'btn-secondary');
        numButton.textContent = '0-9';
        numButton.dataset.letter = '0-9';
        azFilterButtonsContainer.appendChild(numButton);

        // Add event listeners to filter buttons
        azFilterButtonsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn')) {
                const selectedLetter = event.target.dataset.letter;
                filterAndDisplayContent(selectedLetter);

                // Update active state
                azFilterButtonsContainer.querySelectorAll('.btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                event.target.classList.add('active');
            }
        });
    }


    if (azContentGrid) {
        console.log("azContentGrid found."); // Debug log
        const urlParams = new URLSearchParams(window.location.search);
        const letter = urlParams.get('letter'); // Changed from 'category' to 'letter'
        console.log("Letter from URL params:", letter); // Debug log

        // Initial display based on URL parameter or default
        filterAndDisplayContent(letter);

        // Set active class on initial load
        if (letter && azFilterButtonsContainer) {
            const activeButton = azFilterButtonsContainer.querySelector(`.btn[data-letter="${letter.toUpperCase()}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
        }

    } else {
         console.warn("azContentGrid element not found."); // Debug log
    }

    async function filterAndDisplayContent(selectedLetter) {
        let contentToDisplay = [];
        let titleText = "Browse Titles (A-Z)";

        const allContent = await getAllContent(); // From movieApi.js

        if (selectedLetter) {
            if (selectedLetter === '0-9') {
                contentToDisplay = allContent.filter(item => /^[0-9]/.test(item.title));
                titleText = "Titles starting with 0-9";
            } else {
                const regex = new RegExp(`^${selectedLetter}`, 'i');
                contentToDisplay = allContent.filter(item => regex.test(item.title));
                titleText = `Titles starting with ${selectedLetter.toUpperCase()}`;
            }
            console.log(`Filtered content for letter "${selectedLetter}":`, contentToDisplay.length, "items."); // Debug log
        } else {
            // Default to all content sorted alphabetically by title
            contentToDisplay = [...allContent].sort((a, b) => a.title.localeCompare(b.title));
            console.log("Displaying all content (A-Z):", contentToDisplay.length, "items."); // Debug log
        }

        if (sectionTitle) {
            sectionTitle.textContent = titleText;
            console.log("Section title set to:", titleText); // Debug log
        } else {
            console.warn("Section title element not found."); // Debug log
        }

        if (azContentGrid) {
            azContentGrid.innerHTML = ""; // Clear any loading message
            if (contentToDisplay.length > 0) {
                contentToDisplay.forEach(item => {
                    // Use the createContentCard function from main.js
                    if (typeof createContentCard === 'function') {
                        const card = createContentCard(item);
                        azContentGrid.appendChild(card);
                    } else {
                        console.error("createContentCard function not found from main.js.");
                        // Fallback or error message
                    }
                });
                console.log("Content grid populated."); // Debug log
            } else {
                azContentGrid.innerHTML = '<p class="empty-message">No content found for this letter.</p>';
                console.log("No content found for this letter."); // Debug log
            }
        }
    }
});
