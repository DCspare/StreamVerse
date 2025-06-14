 ---

### **`content-schema.md`**

```markdown
# Content Data Schema

This document describes the structure for the StreamVerse data files. This documentation covers both the manual editing process and the recommended workflow using the Admin Panel.

The three main data files are:

1.  **`content.json`**: Contains core metadata for movies, series, and animes.
2.  **`media.json`**: Contains media assets (trailers, screenshots) for each piece of content.
3.  **`episodes.json`**: Contains season and episode data for series and animes.

---

## `content.json` Schema

Each item in the `content.json` array represents a single piece of content and has the following structure:

```json
{
    "id": "unique-content-id",                  // String: Unique identifier (e.g., "interstellar"). REQUIRED.
    "type": "movie",                            // String: Type of content ("movie", "webseries", "animes"). REQUIRED.
    "title": "Title of the Content",            // String: Main title. REQUIRED.
    "description": "Short summary for sliders.",// String: A brief, one-sentence summary. REQUIRED.
    "fullDescription": "Detailed synopsis.",    // String: Full storyline for content detail pages. REQUIRED.
    "year": "2025",                             // String: Release year or year range (e.g., "2020-2023"). REQUIRED.
    "duration": "2h 43m",                       // String: Runtime (for movies) or total seasons (for series). REQUIRED.
    "genres": ["Sci-Fi", "Adventure"],          // Array of Strings: List of genres. REQUIRED.
    "rating": "9.2",                            // String: Rating value (e.g., "0.0" to "10.0"). REQUIRED.
    "director": "Lena Khan",                    // String: Director's name (for movies).
    "studio": "Studio Name",                    // String: Production studio (for anime/series).
    "cast": ["Elara Vance", "Jaxson Kael"],     // Array of Strings: Main cast members. REQUIRED.
    "releaseDate": "October 26, 2025",          // String: Full release date. REQUIRED.
    "country": "USA",                           // String: Country of origin. REQUIRED.
    "status": "Released",                       // String: Release status (e.g., "Released", "Ongoing"). REQUIRED.
    "posterImage": "url/to/poster.jpg",         // String: URL for the content card image. REQUIRED.
    "heroImage": "url/to/hero.jpg",             // String: URL for the hero banner image. REQUIRED.
    "tags": ["featured-movie", "trending"],     // Array of Strings: Optional tags for categorization.
    "languages": ["English", "Spanish"],        // Array of Strings: Available audio languages.
    "quality": ["4K", "1080p", "HD"]            // Array of Strings: Available video qualities.
}
```

---

## `media.json` Schema

This file is a JSON object where each key is a content `id`.

```json
{
    "interstellar": {
        "trailers": {
            "Official Trailer": "https://www.youtube.com/embed/zSWdZVtFR7U"
        },
        "screenshots": [
            "https://res.cloudinary.com/.../screenshot1.jpg",
            "https://res.cloudinary.com/.../screenshot2.jpg"
        ]
    }
}
```

---

## `episodes.json` Schema

This file is a JSON object where each key is a series/anime `id`. The structure supports seasons, qualities, and episodes.

```json
{
    "arcane-league-of-legends": {
        "seasons": {
            "1": {
                "qualities": {
                    "1080p": [
                        { "episodeNumber": 1, "title": "Welcome to the Playground", "downloadUrl": "..." },
                        { "episodeNumber": 2, "title": "Some Mysteries Are Better Left Unsolved", "downloadUrl": "..." }
                    ],
                    "4K": [
                        { "episodeNumber": 1, "title": "Welcome to the Playground", "downloadUrl": "..." }
                    ]
                }
            }
        },
        "zipFiles": [] // Optional place for season pack zip files
    }
}
```

---

## Adding & Managing Content

### **Method 1: Using the Admin Panel (Recommended)**

The Admin Panel is the safest and easiest way to manage content. It automatically creates related entries in all necessary files.

1.  **Navigate to the Admin Panel** and click on the **"Content"** tab.
2.  Click the **"Add New Content"** button.
3.  **Fill out the form** with the movie's details (Title, Type, Year, Descriptions, etc.).
4.  **Add Images using the Cloudinary Workflow:**
    *   Find a high-quality Poster or Banner on a source like [TMDb](https://www.themoviedb.org/). Right-click and **Copy Image Address**.
    *   Go to your [Cloudinary](https://cloudinary.com/) dashboard, choose **Upload**, and select the **Web Address** option. Paste the URL to upload it.
    *   Copy the URL Cloudinary provides.
    *   **Optimize the URL** by adding `f_auto,q_auto` and a width parameter (e.g., `w_500` for posters, `w_1920` for banners) after `/upload/`.
    *   **Example Optimized URL:** `https://res.cloudinary.com/<YOUR_NAME>/image/upload/f_auto,q_auto,w_500/v123/poster.jpg`
    *   Paste this final optimized URL into the `Poster Image URL` or `Hero Image URL` field in the admin form.
5.  **Save the Content.** The server will create the entry in `content.json` and the corresponding placeholder entries in `media.json` and `episodes.json`.
6.  **Add Media and Episodes:** After saving, go to the `Media` link for that content to add trailers, screenshots, and episodes through the dedicated media manager interface.

### **Method 2: Manual Editing**

This method is for initial setup or bulk changes only. Be careful, as errors in JSON formatting can break the application.

1.  **Add Entry to `content.json`:**
    *   Manually add a new object to the `content.json` array.
    *   Fill in all the required fields.
    *   For `posterImage` and `heroImage`, follow the Cloudinary workflow described in Method 1 and paste the final optimized URL directly into the JSON file.

2.  **Add Entry to `media.json`:**
    *   Create a new key using the same `id` as the content you just added.
    *   Add `trailers` (use YouTube embed links) and `screenshots` (use optimized Cloudinary links).

3.  **Add Entry to `episodes.json` (for Series/Anime):**
    *   Create a new key using the same `id` as the series.
    *   Create the nested structure for `seasons` -> `qualities` -> `episodes` as shown in the schema above.

```