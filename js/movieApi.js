// js/movieApi.js

const API_BASE_URL = "/api";
let allContentCache = null;

async function getAllContent() {
  if (allContentCache) {
    return allContentCache;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/content`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    allContentCache = data;
    return data;
  } catch (error) {
    console.error("Could not fetch content:", error);
    allContentCache = [];
    return [];
  }
}

async function getContentByType(type) {
  const allContent = await getAllContent();
  return allContent.filter(
    (item) => item.type.toLowerCase() === type.toLowerCase()
  );
}

async function getAllGenres() {
  const allContent = await getAllContent();
  const allGenres = new Set();
  allContent.forEach((item) => {
    if (item.genres && Array.isArray(item.genres)) {
      item.genres.forEach((genre) => allGenres.add(genre));
    }
  });
  return Array.from(allGenres).sort();
}

async function getContentById(id) {
  const allContent = await getAllContent();
  return allContent.find((item) => item.id === id) || null;
}

async function getMediaById(contentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/media/${contentId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Could not fetch media for ${contentId}:`, error);
    return { trailers: {}, screenshots: [], downloadLinks: {} };
  }
}

async function getEpisodesById(contentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/episodes/${contentId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Could not fetch episodes for ${contentId}:`, error);
    return { seasons: {}, zipFiles: [] };
  }
}

async function getCommentsById(contentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${contentId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Could not fetch comments for ${contentId}:`, error);
    return [];
  }
}

async function postComment(contentId, commentData) {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${contentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Could not post comment for ${contentId}:`, error);
    return null;
  }
}

/**
 * [NEW] Posts a new request to the server.
 * @param {Object} requestData - The request object to be sent.
 * @returns {Promise<Object>} A promise that resolves to the newly created request object from the server.
 */
async function postRequest(requestData) {
  try {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Could not post request:`, error);
    return null;
  }
}
