document.addEventListener('DOMContentLoaded', async function() {
    const moviesContentGrid = document.getElementById('moviesCategoryGrid');
    const preloader = document.getElementById('preloader');

    if (moviesContentGrid) {
        try {
            // Fetch all content
            const allContent = await getAllContent();

            // Filter for movies
            const movies = allContent.filter(item => item.type.toLowerCase() === 'movie');

            // Populate the grid
            moviesContentGrid.innerHTML = ''; // Clear existing content
            if (movies.length > 0) {
                movies.forEach(item => {
                    const card = createContentCard(item);
                    moviesContentGrid.appendChild(card);
                });
            } else {
                moviesContentGrid.innerHTML = '<p>No movies found.</p>';
            }
        } catch (error) {
            console.error("Error loading movie content:", error);
            moviesContentGrid.innerHTML = '<p>Could not load content. Please try again later.</p>';
        } finally {
            // Hide the pre-loader
            if (preloader) {
                preloader.classList.add('loaded');
            }
        }
    } else {
        // If the grid doesn't exist for some reason, still hide the preloader
        if (preloader) {
            preloader.classList.add('loaded');
        }
    }
});