document.addEventListener('DOMContentLoaded', async function() {
    const animesCategoryGrid = document.getElementById('animesCategoryGrid');
    const preloader = document.getElementById('preloader');

    if (animesCategoryGrid) {
        try {
            // Fetch all content
            const allContent = await getAllContent();

            // Filter for animes
            const animes = allContent.filter(item => item.type.toLowerCase() === 'animes');

            // Populate the grid
            animesCategoryGrid.innerHTML = ''; // Clear existing content
            if (animes.length > 0) {
                animes.forEach(item => {
                    const card = createContentCard(item);
                    animesCategoryGrid.appendChild(card);
                });
            } else {
                animesCategoryGrid.innerHTML = '<p>No animes found.</p>';
            }
        } catch (error) {
            console.error("Error loading anime content:", error);
            animesCategoryGrid.innerHTML = '<p>Could not load content. Please try again later.</p>';
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