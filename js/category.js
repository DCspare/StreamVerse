document.addEventListener("DOMContentLoaded", async function() {
    console.log("category.js DOMContentLoaded fired."); // Debug log
    const categoryContentGrid = document.getElementById("categoryContentGrid");
    const sectionTitle = document.querySelector(".content-section .section-title");
    const preloader = document.getElementById('preloader');

    // Ensure templates are loaded before proceeding
    if (typeof ensureTemplatesLoaded === "function") {
        await ensureTemplatesLoaded();
    } else {
         await new Promise(resolve => setTimeout(resolve, 500));
    }
    await getAllContent(); // Ensure data is cached

    if (categoryContentGrid) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            console.log("Category from URL params:", category);

            let contentToDisplay = [];
            let titleText = "Browse by Category";

            const allContent = await getAllContent();

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
            } else {
                contentToDisplay = [...allContent].sort((a, b) => a.title.localeCompare(b.title));
            }

            if (sectionTitle) {
                sectionTitle.textContent = titleText;
            }

            categoryContentGrid.innerHTML = ""; // Clear any loading message
            if (contentToDisplay.length > 0) {
                contentToDisplay.forEach(item => {
                    if (typeof createContentCard === 'function') {
                        const card = createContentCard(item);
                        categoryContentGrid.appendChild(card);
                    } else {
                        console.error("createContentCard function not found from main.js.");
                    }
                });
            } else {
                categoryContentGrid.innerHTML = '<p class="empty-message">No content found for this category.</p>';
            }
        } catch (error) {
            console.error("Error loading category content:", error);
            categoryContentGrid.innerHTML = '<p>Could not load content. Please try again later.</p>';
        } finally {
            // Hide the pre-loader
            if (preloader) {
                preloader.classList.add('loaded');
            }
        }
    } else {
        console.warn("categoryContentGrid element not found.");
        // If the grid doesn't exist, still hide the preloader
        if (preloader) {
            preloader.classList.add('loaded');
        }
    }

    // This part is for scrolling to genre section on page load
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