# Project Context: StreamVerse Streaming Website

This document provides an overview of the "StreamVerse" project, a client-side streaming website built with vanilla HTML, CSS, and JavaScript. It aims to help an LLM understand the project's purpose, structure, and core functionalities.

## 1. Project Overview

StreamVerse is a modern, responsive web application designed to showcase and stream content (movies, anime, series). It features dynamic content loading, user authentication (mock), a watchlist, search capabilities, detailed content pages, and an upcoming dedicated streaming experience, all rendered client-side using pure web technologies.

## 2. File Structure

The project is organized into logical directories:

*   **`index.html`**: The main landing page of the application.
*   **`category-az.html`**: Page for browsing content alphabetically by category/genre.
*   **`movie-details.html`**: Dedicated page for displaying detailed information about a specific movie or series.
*   **`stream.html`** (Upcoming): Dedicated streaming page for video playback (under development).
*   **`watchlist.html`**: Page where users can view their saved content.
*   **`css/`**: Contains stylesheets for the application.
    *   `style.css`: Main CSS file defining global styles, components, and layout.
    *   `responsive.css`: Contains media queries for responsive design adjustments.
*   **`js/`**: Houses all JavaScript logic, modularized for different functionalities.
    *   `main.js`: The primary script for application initialization, hero slider management, populating content sections (trending, popular, featured), and handling global UI interactions like search and modal toggles.
    *   `auth.js`: Manages user authentication, including the login/signup modal and mock user state (using `localStorage`).
    *   `movieApi.js`: Acts as the data layer, fetching and providing content data from `data/content.json`. It includes functions to get all content, content by ID, type, tag, and unique genres.
    *   `templates.js`: Responsible for dynamically loading reusable HTML components (like header and footer) into the main pages.
    *   `movie-details.js`: Contains the logic for fetching and displaying content details on `movie-details.html` based on URL parameters.
    *   `stream.js` (Upcoming): Will handle logic for the dedicated streaming page (under development).
    *   `watchlist.js`: Manages the client-side watchlist functionality, allowing users to add and remove content from their list (stored in `localStorage`).
    *   `notifications.js`: Provides functions to display transient success, info, or error notifications to the user.
    *   `category.js`: Handles the display and filtering of content on the `category-az.html` page.
*   **`data/`**: Stores the application's content data.
    *   `content.json`: A JSON array containing mock data for movies, anime, and series, including titles, descriptions, images, genres, ratings, etc.
    *   `media.json` (Upcoming): Will store media-specific data (trailers, screenshots).
    *   `episodes.json` (Upcoming): Will store episode data for series content.
    *   `content_schema.md`: Documents the schema for content objects found in `content.json`.
*   **`documentation/`**: Project documentation and guides.
    *   `Streaming_Enhancement_Plan.md`: Comprehensive plan for upcoming streaming features.
*   **`templates/`**: Contains reusable HTML snippets.
    *   `header.html`: The common header navigation bar.
    *   `footer.html`: The common footer section.
*   **`assets/images/`**: Directory for various image assets used across the website, including hero section backgrounds and content posters.

## 3. Key Technologies

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript.
*   **Styling:** Custom CSS with extensive use of CSS variables for a dark theme and "glassmorphism" effects. Integrates Remixicon for vector icons and Google Fonts for typography.
*   **Data Management:** Content data is mocked using local JSON files (`content.json`, upcoming `media.json` and `episodes.json`), accessed via `fetch` requests in `js/movieApi.js`. User authentication and watchlist data are simulated using `localStorage`.
*   **Dynamic Rendering:** JavaScript is heavily utilized to dynamically inject content, manage UI states (e.g., modal visibility, slider animations), and handle user interactions without server-side rendering.
*   **Upcoming Features:** Dedicated streaming page with video player, enhanced media sections, and episode management.

## 4. Core Functionality Highlights

*   **Dynamic Content Display:** Homepage sections like "Trending Now," "Popular Anime," and "Popular Web Series" are populated dynamically from `content.json`.
*   **Interactive Hero Slider:** A rotating banner on the homepage showcasing featured content with dynamic backgrounds and details.
*   **Global Search:** A client-side search bar that filters content in real-time as the user types, displaying results in a dropdown.
*   **User Authentication:** A modal-based login/signup system (mocked) that integrates with `localStorage` for user session persistence.
*   **Personal Watchlist:** Users can add content to a personal watchlist, with the state managed locally.
*   **Detailed Content Pages:** Clicking on any content item navigates to a dedicated page (`movie-details.html`) displaying comprehensive information.
*   **Notifications:** A system for displaying toast-like notifications for user feedback.
*   **Responsive Design:** The layout and components are designed to adapt gracefully to various screen sizes, ensuring a consistent user experience across devices.
*   **Upcoming Streaming Experience:** Dedicated streaming page with video player, trailers, screenshots, and episode management (in development).

## 5. Development Roadmap

### Current Phase: Content Integration & UI Modernization
We are implementing multiple enhancements:

1. **Content Integration**:
   - TMDB API for metadata
   - Wikipedia for descriptions
   - Automated image generation
   - Scheduled content updates

2. **New Dedicated Pages**:
   - `movies.html` - Filterable movie grid
   - `anime.html` - Anime-specific content
   - `series.html` - Web series collection

3. **UI Modernization**:
   - Card redesign with glassmorphism effects
   - Hover animations and 3D tilt
   - Dynamic color borders
   - Integrated watchlist buttons

4. **Navbar Integration**:
   - Direct links to new category pages
   - Responsive mobile navigation
   - Active state indicators

5. **Streaming Experience**:
   - Dedicated streaming page (stream.html)
   - Video player with playback controls
   - Enhanced media sections
   - Episode management

### Upcoming Features:
- User profiles with watch history
- Cross-device synchronization
- Content recommendations engine
- Social sharing capabilities

Refer to `documentation/Streaming_Enhancement_Plan.md` for the comprehensive implementation plan and timelines.
