document.addEventListener("DOMContentLoaded", async function() {
    console.log("category.js DOMContentLoaded fired."); // Debug log
    const categoryContentGrid = document.getElementById("categoryContentGrid"); // Changed ID
    const sectionTitle = document.querySelector(".content-section .section-title");

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


    if (categoryContentGrid) { // Changed ID
        console.log("categoryContentGrid found."); // Debug log
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category'); // Can be 'trending', 'anime', 'series', or a genre
        console.log("Category from URL params:", category); // Debug log

        let contentToDisplay = [];
        let titleText = "Browse by Category"; // Default title for category page

        const allContent = await getAllContent(); // From movieApi.js

        if (category) {
            if (category === "trending") {
                contentToDisplay = allContent.filter(item => item.tags && item.tags.includes("trending"));
                titleText = "Trending Now";
            } else if (category === "anime") {
                contentToDisplay = allContent.filter(item => item.type.toLowerCase() === "anime");
                titleText = "Popular Anime";
            } else if (category === "series") {
                 contentToDisplay = allContent.filter(item => item.type.toLowerCase() === "series");
                titleText = "Popular Web Series";
            } else {
                // Assume it's a genre
                contentToDisplay = allContent.filter(item =>
                    item.genres && Array.isArray(item.genres) && item.genres.some(genre => genre.toLowerCase() === category.toLowerCase())
                );
                titleText = `Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`;
            }
             console.log(`Filtered content for category "${category}":`, contentToDisplay.length, "items."); // Debug log
        } else {
            // Default to all content sorted alphabetically by title if no category specified
            // Or, if this page is meant to show all genres, populate a genre grid here.
            // For now, let's just show all content if no specific category is requested.
            contentToDisplay = [...allContent].sort((a, b) => a.title.localeCompare(b.title));
            console.log("Displaying all content (default for category page):", contentToDisplay.length, "items."); // Debug log
        }

        if (sectionTitle) {
            sectionTitle.textContent = titleText;
             console.log("Section title set to:", titleText); // Debug log
        } else {
             console.warn("Section title element not found."); // Debug log
        }

        if (contentToDisplay.length > 0) {
            categoryContentGrid.innerHTML = ""; // Clear any loading message
            contentToDisplay.forEach(item => {
                // Use the createContentCard function from main.js
                if (typeof createContentCard === 'function') {
                     const card = createContentCard(item);
                     categoryContentGrid.appendChild(card);
                } else {
                     console.error("createContentCard function not found from main.js.");
                     // Fallback or error message
                }
            });
             console.log("Content grid populated."); // Debug log
        } else {
            categoryContentGrid.innerHTML = '<p class="empty-message">No content found for this category.</p>';
             console.log("No content found for this category."); // Debug log
        }
    } else {
         console.warn("categoryContentGrid element not found."); // Debug log
    }

    // This part is for scrolling to genre section on page load, which was in the HTML script block
    document.addEventListener('DOMContentLoaded', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const genre = urlParams.get('genre');

        if (genre) {
            const element = document.getElementById(genre);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});
