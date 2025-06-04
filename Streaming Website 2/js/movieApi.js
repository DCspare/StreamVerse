// This file will handle fetching and providing movie/content data
// from the data/content.json file.

const DATA_URL = 'data/content.json'; // Path to your JSON data file

let allContentData = []; // Cache for the content data

/**
 * Fetches all content data from the JSON file.
 * Caches the data after the first fetch.
 * @returns {Promise<Array>} A promise that resolves to an array of content objects.
 */
async function getAllContent() {
    if (allContentData.length > 0) {
        return allContentData;
    }
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching ${DATA_URL}`);
        }
        allContentData = await response.json();
        console.log("Content data fetched and cached successfully."); // Added log
        return allContentData;
    } catch (error) {
        console.error("Could not fetch content data:", error);
        return []; // Return empty array on error
    }
}

/**
 * Gets a specific content item by its ID.
 * @param {string} id - The ID of the content item.
 * @returns {Promise<Object|null>} A promise that resolves to the content item or null if not found.
 */
async function getContentById(id) {
    console.log("Searching for content with ID:", id); // Added log
    const content = await getAllContent();
    const foundItem = content.find(item => item.id === id) || null;
    console.log("Found item for ID", id + ":", foundItem); // Added log
    return foundItem;
}

/**
 * Gets content items by their type (e.g., 'movie', 'anime', 'series').
 * @param {string} type - The type of content to filter by.
 * @returns {Promise<Array>} A promise that resolves to an array of content items of the specified type.
 */
async function getContentByType(type) {
    const content = await getAllContent();
    return content.filter(item => item.type.toLowerCase() === type.toLowerCase());
}

/**
 * Gets content items that include a specific tag.
 * @param {string} tag - The tag to filter by.
 * @returns {Promise<Array>} A promise that resolves to an array of content items with the specified tag.
 */
async function getContentByTag(tag) {
    const content = await getAllContent();
    return content.filter(item => item.tags && item.tags.includes(tag));
}

/**
 * Gets all unique genres from the content data.
 * @returns {Promise<Array>} A promise that resolves to an array of unique genre strings.
 */
async function getAllGenres() {
    const content = await getAllContent();
    const genres = new Set();
    content.forEach(item => {
        if (item.genres && Array.isArray(item.genres)) {
            item.genres.forEach(genre => genres.add(genre));
        }
    });
    return Array.from(genres).sort();
}


// Example of how to use these functions (can be called from main.js or other specific JS files)
/*
getAllContent().then(data => {
    console.log("All Content:", data);
});

getContentById("interstellar-odyssey").then(item => {
    console.log("Specific Item:", item);
});

getContentByType("anime").then(animeItems => {
    console.log("Anime:", animeItems);
});

getContentByTag("trending").then(trendingItems => {
    console.log("Trending:", trendingItems);
});
*/
