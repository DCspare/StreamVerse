 ---
### `content-schema.json`

```json
{
  "projectInfo": "This document describes the data structures and workflows for managing content in the StreamVerse project.",
  "schemaVersion": "2.0",
  "authoringTool": "Admin Panel Recommended"
}
```

# Content Data & Management Guide (v2.0)

This document describes the structure for the content data files and the official workflows for adding and managing content using the Admin Panel and Cloudinary.

---

## 1. Image Sourcing and Optimization Workflow (Highly Recommended)

All images (posters and banners) should be hosted on **Cloudinary** to ensure high performance and automated optimization. This workflow describes how to get high-quality source images and prepare them for use.

### Step 1: Source High-Quality Images from TMDb

**TMDb (The Movie Database)** is the best source for original posters and background art.

1.  Go to [https://www.themoviedb.org/](https://www.themoviedb.org/).
2.  Search for the desired movie, series, or anime.
3.  On the content page, navigate to **Media -> Posters** or **Media -> Backdrops**.
4.  Click the image you want, then right-click on it and select **"Copy Image Address"**. This gives you a direct URL to the high-resolution image.

### Step 2: Upload to Cloudinary via URL

1.  Log in to your **Cloudinary** account.
2.  In the Media Library, click **Upload** and switch to the **Web Address** tab.
3.  Paste the TMDb image URL you copied.
4.  Cloudinary will fetch the image and add it to your library. Copy the new Cloudinary URL it provides.

### Step 3: Construct the Final, Optimized URL

This is the most critical step for performance. We will add transformation parameters to the base Cloudinary URL.

A base Cloudinary URL looks like this:
`https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123456/folder/image.jpg`

The transformations go between `/upload/` and the version (`v123...`). The most important are `f_auto` and `q_auto`.

-   **`f_auto`**: Automatically delivers the best image format (like **WebP** or AVIF) that the user's browser supports.
-   **`q_auto`**: Automatically adjusts the compression to the ideal level, reducing file size without sacrificing visual quality.

**Optimized URL Example:**
`.../image/upload/f_auto,q_auto/v123456/folder/image.jpg`

**Advanced: Adding Resizing**
For even better performance, specify the image width (`w_...`).

-   **For Banners/Hero Images:** A width of 1920px is ideal. The URL becomes:
    `.../image/upload/f_auto,q_auto,w_1920/v123/interstellar-banner.jpg`
-   **For Posters:** A width of 500px is excellent for grids and cards. The URL becomes:
    `.../image/upload/f_auto,q_auto,w_500/v123/interstellar-poster.jpg`

**This final, optimized URL is what you will use in the Admin Panel.**

---

## 2. Content Management Methods

There are two ways to add and manage content. Using the Admin Panel is the standard, recommended method.

### Method 1: Using the Admin Panel (Recommended)

This is the safest and easiest way to manage content.

1.  **Prepare Your Image URLs:** Follow the complete **Image Sourcing and Optimization Workflow** above to get your final, optimized Cloudinary URLs for both the poster and hero image.

2.  **Add New Content:**
    -   Navigate to the **Content** tab in the Admin Panel.
    -   Click the **"Add New Content"** button.
    -   Fill in all the metadata fields (Title, Year, Description, etc.).
    -   In the `Poster Image URL` and `Hero Image URL` fields, paste the **final, optimized Cloudinary URLs** you created.
    -   Click **"Save Content"**. This will add the new entry to `content.json`.

3.  **Add Media & Episodes:**
    -   After saving, find your new content in the table.
    -   Click the **"Media"** button on its row. This will take you to the Media Manager.
    -   In the Media Manager, you can add Trailers, Screenshots, and Episode/Download links. This will automatically update `media.json` and `episodes.json` correctly.

### Method 2: Manual File Editing (Advanced)

This method is for initial bulk setup or developers comfortable with JSON. It is prone to error if not done carefully.

1.  **`content.json`**:
    -   Add a new object to the array. Ensure all required fields are filled.
    -   The `id` must be a unique, URL-friendly string (e.g., "the-grand-budapest-hotel").
    -   For `posterImage` and `heroImage`, use your final, optimized Cloudinary URLs.

2.  **`media.json`**:
    -   Add a new key-value pair. The key must be the **exact same `id`** from `content.json`.
    -   The value should be an object containing `trailers` and `screenshots`.

3.  **`episodes.json`**:
    -   Add a new key-value pair for series/anime. The key must be the **exact same `id`**.
    -   The value should be an object structured with seasons, qualities, and episode lists (see schema below).

---

## 3. Data File Schemas

### `content.json` Schema

An array of content objects. Each object has the following structure:

```json
{
    "id": "unique-content-id",              // String: REQUIRED. URL-friendly unique identifier (e.g., "interstellar").
    "type": "movie",                        // String: REQUIRED. Type of content ("movie", "webseries", "animes").
    "title": "Title of the Content",        // String: REQUIRED.
    "description": "Short summary.",        // String: REQUIRED. Used for cards and sliders.
    "fullDescription": "Detailed synopsis.",// String: REQUIRED. Used for content detail pages.
    "year": "2023",                         // String: REQUIRED. Release year or range (e.g., "2020-2023").
    "duration": "2h 43m",                   // String: REQUIRED. Runtime for movies or season count for series.
    "genres": ["Sci-Fi", "Adventure"],      // Array of Strings: REQUIRED.
    "rating": "9.2",                        // String: REQUIRED.
    "director": "Lena Khan",                // String: REQUIRED for movies.
    "studio": "Studio Name",                // String: REQUIRED for series/animes.
    "cast": ["Actor One", "Actor Two"],     // Array of Strings: REQUIRED.
    "languages": ["English", "Japanese"],   // Array of Strings: REQUIRED.
    "quality": ["HD", "1080p"],             // Array of Strings: REQUIRED.
    "posterImage": "https://res.cloudinary.com/.../f_auto,q_auto,w_500/...", // String: REQUIRED. Optimized Cloudinary URL.
    "heroImage": "https://res.cloudinary.com/.../f_auto,q_auto,w_1920/...",   // String: REQUIRED. Optimized Cloudinary URL.
    "tags": ["featured", "trending"]        // Array of Strings: Optional tags for categorization.
}
```

### `media.json` Schema

An object where each key is a content `id`.

```json
{
    "unique-content-id": {
        "trailers": {
            "Official": "https://youtube.com/embed/...",
            "Hindi Dub": "https://youtube.com/embed/..."
        },
        "screenshots": [
            "https://res.cloudinary.com/.../screenshot1.jpg",
            "https://res.cloudinary.com/.../screenshot2.jpg"
        ]
    }
}
```

### `episodes.json` Schema

An object where each key is a series/anime `id`. **Note the nested structure managed by the admin panel.**

```json
{
    "unique-content-id": {
        "seasons": {
            "1": {
                "qualities": {
                    "1080p": [
                        { "episodeNumber": 1, "title": "The First Step", "downloadUrl": "..." },
                        { "episodeNumber": 2, "title": "The Journey Begins", "downloadUrl": "..." }
                    ],
                    "720p": [
                        { "episodeNumber": 1, "title": "The First Step", "downloadUrl": "..." }
                    ]
                }
            },
            "2": {
                // ... structure repeats for season 2
            }
        },
        "zipFiles": [
            // Zip file links can also be managed here
        ]
    }
}
---