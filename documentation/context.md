 ---

--- START OF FILE context.md ---
# Project Context: StreamVerse - Content Downloading Platform

## File Structure

StreamVerse/
├── index.html                  # UPDATED: Uses ES Modules
├── movies.html                 # UPDATED: Uses ES Modules
├── animes.html                 # UPDATED: Uses ES Modules
├── webseries.html              # UPDATED: Uses ES Modules
├── contentDetails.html         # UPDATED: Uses ES Modules
├── watchlist.html              # UPDATED: Uses ES Modules
├── category.html               # UPDATED: Uses ES Modules
├── az-page.html                # UPDATED: Uses ES Modules
│
├── admin/
│   ├── index.html              # UPDATED: Loads main script as a module
│   ├── css/
│   │   └── admin.css           # UPDATED: Includes styles for bulk actions
│   ├── js/
│   │   ├── admin.js            # UPDATED: Module-based router using dynamic import()
│   │   ├── content-manager.js  # UPDATED: ES Module with bulk action logic
│   │   ├── media-manager.js    # UPDATED: ES Module
│   │   ├── dashboard.js        # UPDATED: ES Module
│   │   ├── comments-manager.js # UPDATED: ES Module
│   │   └── request-manager.js  # UPDATED: ES Module
│   └── views/
│       ├── content.html        # UPDATED: Includes UI for bulk actions
│       ├── dashboard.html
│       ├── media.html
│       ├── comments.html
│       └── requests.html
│
├── server.js                   # UPDATED: Includes bulk action API endpoints
├── package.json
│
├── css/
│   ├── style.css
│   └── responsive.css
│
├── js/
│   ├── main.js                 # UPDATED: ES Module
│   ├── movieApi.js             # UPDATED: ES Module, exports all API functions
│   ├── templates.js            # UPDATED: ES Module
│   ├── auth.js                 # UPDATED: ES Module
│   ├── watchlist.js            # UPDATED: ES Module
│   ├── notifications.js        # UPDATED: ES Module
│   ├── contentDetails.js       # UPDATED: ES Module
│   ├── movies.js               # UPDATED: ES Module
│   ├── animes.js               # UPDATED: ES Module
│   ├── webseries.js            # UPDATED: ES Module
│   ├── category.js             # UPDATED: ES Module
│   ├── azContent.js            # UPDATED: ES Module
│   └── trailers.js
│
├── data/
│   ├── content.json
│   ├── media.json
│   ├── episodes.json
│   ├── comments.json
│   └── content_schema.md
│
└── templates/
    ├── header.html
    └── footer.html

## Project Purpose & Architecture

StreamVerse is a feature-rich, responsive web application for browsing and downloading content. It operates on a **unified client-server architecture** and now uses **ES Modules** for all its client-side JavaScript.

*   **Frontend (Client):** The user-facing website and the Admin Panel. Both are now modular applications.
    *   **Loading:** HTML files (e.g., `index.html`, `admin/index.html`) load a primary JavaScript file using `<script type="module">`.
    *   **Dependencies:** Each JavaScript module uses `import` to load functions from other modules (e.g., `main.js` imports functions from `movieApi.js`). Functions intended for sharing are declared with `export`.
*   **Backend (Server):** A **Node.js/Express** server (`server.js`) that:
    1.  Serves all frontend files.
    2.  Provides a JSON API for all data operations, including new bulk action endpoints.

This unified, modular approach simplifies dependency management, prevents global scope pollution, and improves code organization.

## Admin Panel

The Admin Panel is a secure, SPA-based interface for managing website content.
*   **Routing:** The client-side router (`admin.js`) is the main entry point module. It dynamically `import()`s the necessary JavaScript module for each view (e.g., `content-manager.js` for the content page) and executes its initialization function.
*   **Views:** Page content is loaded dynamically from HTML partials.
*   **Functionality:**
    *   **Dashboard:** Shows at-a-glance statistics.
    *   **Content Management:** Full CRUD, now with **Bulk Add** (via JSON) and **Bulk Delete** functionality.
    *   **Media & Episode Management:** Dedicated pages for managing media.
    *   **Comments & Requests Management:** Dedicated pages for moderation.

## Data Flow & Script Interaction

1.  A user opens an HTML page (e.g., `index.html`).
2.  The browser loads its main script as a module (e.g., `<script type="module" src="js/main.js">`).
3.  The main script (`main.js`) `import`s the `getAllContent` function from `js/movieApi.js`.
4.  `movieApi.js` makes an API call (`fetch('/api/content')`) to the backend `server.js`.
5.  `server.js` reads the corresponding JSON file and returns the data.
6.  `main.js` receives the data and uses it to build the page content.
7.  All shared functions (e.g., `showNotification`, `createContentCard`) are explicitly `export`ed from their respective files and `import`ed where needed. This eliminates "not defined" errors and removes the need for multiple `<script>` tags in the HTML files.

## Specific File Workings

*   **`server.js`**: Backend API server. Now includes `/api/content/bulk` endpoints for deleting and adding multiple content items at once.
*   **`js/movieApi.js`**: **API Client Module**. Exports all functions for frontend-to-backend communication.
*   **All page-specific JS (`main.js`, `movies.js`, `contentDetails.js`, etc.)**: Now operate as ES Modules. They `import` their dependencies and are loaded into their respective HTML pages via `<script type="module">`.
*   **All HTML files (`index.html`, `movies.html`, etc.)**: Now only include `<script type="module">` tags for their primary JS file(s), significantly cleaning up the bottom of the files.

 ---