// js/webseries.js (Modular Version)

// FIXED: Import necessary functions from other modules
import { getAllContent } from './movieApi.js';
import { createContentCard } from './main.js';
import { ensureTemplatesLoaded } from './templates.js';

document.addEventListener('DOMContentLoaded', async function() {
    // FIXED: Ensure header and footer templates are loaded before doing anything else
    await ensureTemplatesLoaded();
    
    const webseriesCategoryGrid = document.getElementById('webseriesCategoryGrid');
    const preloader = document.getElementById('preloader');

    if (webseriesCategoryGrid) {
        try {
            // Fetch all content - getAllContent is now available via import
            const allContent = await getAllContent();

            // Filter for webseries
            const webseries = allContent.filter(item => item.type.toLowerCase() === 'webseries');

            // Populate the grid
            webseriesCategoryGrid.innerHTML = ''; // Clear existing content
            if (webseries.length > 0) {
                webseries.forEach(item => {
                    // createContentCard is now available via import
                    const card = createContentCard(item);
                    webseriesCategoryGrid.appendChild(card);
                });
            } else {
                webseriesCategoryGrid.innerHTML = '<p>No webseries found.</p>';
            }
        } catch (error) {
            console.error("Error loading webseries content:", error);
            webseriesCategoryGrid.innerHTML = '<p>Could not load content. Please try again later.</p>';
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