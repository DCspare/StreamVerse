// admin/js/dashboard.js

function initializeDashboard() {
    console.log("Dashboard view loaded.");
    loadDashboardStats();
}

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/content');
        if (!response.ok) throw new Error(`API request failed`);
        const content = await response.json();

        const total = content.length;
        const movies = content.filter(c => c.type === 'Movie').length;
        const series = content.filter(c => c.type === 'Web Series').length;
        const animes = content.filter(c => c.type === 'Anime').length;

        document.getElementById('total-content-count').textContent = total;
        document.getElementById('movie-count').textContent = movies;
        document.getElementById('series-count').textContent = series;
        document.getElementById('anime-count').textContent = animes;

    } catch (error) {
        console.error("Error loading dashboard stats:", error);
        const statElements = document.querySelectorAll('.stat-card-number');
        statElements.forEach(el => el.textContent = 'Error');
    }
}