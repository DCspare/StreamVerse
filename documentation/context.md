 ---

--- START OF FILE context.md ---
# Project Context: StreamVerse - Content Downloading Platform

## File Structure

StreamVerse/
├── index.html
├── movies.html
├── animes.html
├── webseries.html
├── contentDetails.html
├── watchlist.html
├── category.html
├── az-page.html
│
├── admin/                     # NEW: Admin Panel
│   ├── index.html             # NEW: The SPA shell for the admin panel
│   ├── css/
│   │   └── admin.css          # NEW: Styles for the admin panel
│   ├── js/
│   │   ├── admin.js           # NEW: The client-side router and main SPA script
│   │   ├── content-manager.js # NEW: Logic for the content management page
│   │   ├── media-manager.js   # NEW: Logic for the media management page
│   │   ├── dashboard.js       # NEW: Logic for the admin dashboard
│   │   ├── comments-manager.js       # NEW: Logic for the comments management page
│   │   └── request-manager.js       # NEW: Logic for the requests management page
│   └── views/                 # NEW: HTML partials loaded by the router
│       ├── content.html       # NEW: View for managing content
│       ├── dashboard.html     # NEW: View for the main dashboard
│       ├── media.html         # NEW: View for managing media
│       ├── comments.html         # NEW: for comments section of admin panel
│       └── requests.html         # NEW: for requests section of admin panel
│
├── server.js                  # UPDATED: Unified Node.js server (serves frontend + API)
├── package.json               # UPDATED: Node.js project configuration
│
├── css/
│   ├── style.css
│   └── responsive.css
│
├── js/
│   ├── main.js
│   ├── movieApi.js
│   ├── templates.js
│   ├── auth.js
│   ├── watchlist.js
│   ├── notifications.js       # UPDATED: Now used by the admin panel
│   ├── contentDetails.js
│   ├── movies.js
│   ├── animes.js
│   ├── webseries.js
│   ├── category.js
│   ├── azContent.js
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

StreamVerse is a feature-rich, responsive web application for browsing and downloading content. It operates on a **unified client-server architecture**.

*   **Frontend (Client):** The user-facing website (HTML, CSS, JS) and the **Admin Panel**. The Admin Panel is a **Single-Page Application (SPA)** that runs in the browser, providing a fast, app-like experience for managing the platform.
*   **Backend (Server):** A **Node.js/Express** server (`server.js`) that acts as the application's brain. It has two primary jobs:
    1.  **Serves all frontend files** (HTML, CSS, JS) to the user's browser, including the main site and the admin panel SPA.
    2.  **Provides a JSON API** for all data operations (reading from and writing to the `.json` files).

This unified approach simplifies deployment and eliminates CORS issues by ensuring the frontend and API are always served from the same origin.

## Admin Panel

The Admin Panel is a secure, SPA-based interface for managing all aspects of the website content.
*   **Routing:** A client-side router (`admin.js`) handles navigation without page reloads.
*   **Views:** Page content is loaded dynamically from HTML partials located in the `/admin/views/` directory.
*   **Functionality:**
    *   **Dashboard:** Shows at-a-glance statistics.
    *   **Content Management:** Full CRUD (Create, Read, Update, Delete) for all content metadata via a modal form.
    *   **Media Management:** A dedicated page to add/delete trailers, screenshots, and download links for each piece of content.
    *   **Comments Management:** A dedicated page to add/delete and reply comments.
    *   **Requests Management:** A dedicated page to add/delete and reply requests.


## Technology Stack

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Backend:** **Node.js** with the **Express.js** framework.
*   **Styling:** Custom CSS (`style.css`, `responsive.css`).
*   **Icons & Fonts:** Remixicon and Google Fonts.
*   **Data Storage:**
    *   **Centralized JSON Files:** Managed by `server.js`.
        *   `content.json`: Core metadata for all content.
        *   `media.json`: Stores trailers, screenshots, and movie download links.
        *   `episodes.json`: Stores season and episode data for series/animes.
        *   `comments.json`: Stores all user comments and admin replies.
    *   **Browser `localStorage`:** Used only for client-side data.
        *   User session (`loggedInUser`, `userCredentials`).
        *   User-specific watchlists (`userWatchlists`).

## Data Flow

1.  A user opens the website (e.g., `index.html`) in their browser.
2.  The frontend JavaScript (e.g., `main.js`) needs data. It uses functions from `js/movieApi.js`.
3.  `movieApi.js` makes an API call (e.g., `fetch('http://localhost:3000/api/content')`) to the local Node.js backend server.
4.  The backend server (`server.js`) receives the request, reads the appropriate `.json` file from the `/data/` folder (e.g., `data/content.json`), and sends the data back to the frontend as a JSON response.
5.  The frontend JavaScript receives the data and uses it to build the HTML and display the content to the user.
6.  When a user posts a comment, the process is reversed: `contentDetails.js` sends the comment data to the backend, which then writes it to `data/comments.json`.

## Specific File Workings

*   **`server.js`**: The backend API server. It reads from and writes to the JSON data files and exposes API endpoints (e.g., `/api/content`, `/api/comments/:id`) for the frontend to use.
*   **`js/movieApi.js`**: **API Client**. All functions now `fetch` data from the `server.js` API endpoints. It is the central point for all frontend-to-backend communication.
*   **`js/main.js`**: Cleaned and updated to fetch data via `movieApi.js` at startup and then distribute that data to the various functions that populate the homepage.
*   **`js/contentDetails.js`**: Fetches all its data (content details, media, episodes, comments) from the API. It contains the logic to dynamically build the download section differently for movies vs. series. The comment form now posts data to the backend API.
*   **`contentDetails.html`**: Updated with new placeholder `div`s (`#movieDownloadSection`, `#seriesDownloadSection`) for the dynamic download logic.
*   **All other files** function as described in the original context, but now rely on the API-driven data provided by the updated core scripts.
*   **/templates/footer.html**: HTML template for the website footer.
*   **/templates/header.html**: HTML template for the website header.
*   **/assets/images/image.png**: Example image asset.
*   **/assets/images/hero/echoes_of_tomorrow_bg.jpg**: Background image for a hero section item.
*   **/assets/images/hero/interstellar_odyssey_bg.jpg**: Background image for a hero section item.
*   **/assets/images/hero/lost_artifact_bg.jpg**: Background image for a hero section item.
*   **/assets/images/hero/mystic_chronicles_bg.jpg**: Background image for a hero section item.
*   **/assets/images/hero/spirit_blade_bg.jpg**: Background image for a hero section item.

 ---