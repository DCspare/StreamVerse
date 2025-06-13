### Public Site
# Mobile & Tablet: 
1. screenshot lightbox is not responsive for smaller devices, user have to pinch-in to resize the image to view it properly. What i want that it should be in the viewport perfectly by leaving little bit of space from all sides.

2. Navbar Redesign.

# Desktop:

# Mobile, Tablet & Desktop:
<!-- 1. In Movies, Anime, and Webseries sections there are two rows which contains 10 cards each total 20 cards per section and have a horizontal scrolling. but both rows scrolls together, what i want that structure will be the same just the scrolling should be individual for all rows in every sections. --> MAYBE

1. A separate page linked in footer for comment/request (NOt Important)

2. Playstore/App store button disabling.

3. Fallback image option in JSON files. If main image for poster,banner,heroImage or screenshots fail to load those placeholder images from placehold.co will appear.


### Admin Panel
# Mobile & Tablet:
1. Write the responsive code for everything in separate file

# Desktop:

# Mobile, Tablet & Desktop:
1. Add Dropdown menu styles
2. Dashboard only showing the total number of content and not others like Movies, Webseries and Animes
3. Protect the admin Panel with auth
4. Add an option for adding more admins with all permissions or Selected Permissions

---

# global instructions: 
1. always ask for the files and confirmation of your plan before proceeding.
2. always provide complete files with the changes user will ask for.
3. at the of your response always give the small summary of what you have done and what is your next plan or question or suggestion
4. always try to use less tokens
5. always give those complete sets of files only in which changes are happened, to save the tokens
6. most important thing always remember that if changes are very small or straight forward then don't generate complete file just give that code and instructions to add
7. If files are too long then, split them in parts.

---

---

### **How to Integrate Supabase into StreamVerse**

This guide will walk you through setting up a Supabase backend for user authentication (Login/Signup) and managing wishlists.

**Step 1: Create a Supabase Project**

1.  Go to [supabase.com](https://supabase.com/) and sign up for a free account.
2.  Click on "**New project**".
3.  Give your project a name (e.g., "StreamVerse") and generate a secure database password (save this somewhere safe!).
4.  Choose a region closest to your users.
5.  Click "**Create new project**". Wait a few minutes for your backend to be set up.

**Step 2: Get Your API Keys**

1.  Once your project is ready, navigate to the **Project Settings** (the gear icon in the left sidebar).
2.  Go to the **API** section.
3.  You will find your **Project URL** and your `anon` **public** API Key. You will need these two values. **Never share the `service_role` key in your frontend code.**

**Step 3: Create the necessary Database Tables**

Supabase uses a real PostgreSQL database. We need to create tables to store our data.

1.  Go to the **Table Editor** (the table icon in the left sidebar).
2.  The `users` table is automatically created by Supabase Auth. We don't need to create it.
3.  **Create a `profiles` Table:** This table will store public data like usernames.
    *   Click "**New table**".
    *   Name it `profiles`.
    *   **Untick** "Enable Row Level Security (RLS)" for now. We will enable it later.
    *   Add the following columns:
        *   `id` (uuid): This is the primary key. Make it a **foreign key** that references `auth.users.id`.
        *   `username` (text): To store the user's public username.
        *   `updated_at` (timestamptz): Supabase can auto-update this.
    *   Click **Save**.
4.  **Create a `wishlists` Table:** This table will link users to the content they've wishlisted.
    *   Click "**New table**".
    *   Name it `wishlists`.
    *   **Untick** RLS for now.
    *   Add the following columns:
        *   `id` (bigint): The auto-generated primary key.
        *   `user_id` (uuid): A **foreign key** that references `auth.users.id`.
        *   `content_id` (text): To store the ID of the movie/anime (e.g., "mov001").
        *   `created_at` (timestamptz): Supabase will auto-fill this.
    *   Click **Save**.

**Step 4: Connect Your Frontend Project to Supabase**

1.  You need the Supabase client library. Add this script tag to the `<head>` of all your HTML files, before your other scripts:
    ```html
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    ```
2.  Create a new file in your `js` folder called `supabaseClient.js`.
3.  In `js/supabaseClient.js`, add the following code, replacing the placeholders with your actual API URL and key from Step 2:

    ```javascript
    // js/supabaseClient.js
    const SUPABASE_URL = 'YOUR_SUPABASE_URL';
    const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

    const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    ```
4.  Include this new script in all your HTML files **before** `auth.js` and any other script that needs to talk to the database.
    ```html
    <script src="js/supabaseClient.js"></script>
    <script src="js/auth.js"></script>
    <!-- etc. -->
    ```

**Step 5: Modify `js/auth.js` to Use Supabase**

This is where you replace `localStorage` logic with Supabase functions.

*   **For Signup:**
    ```javascript
    // Replace the signup logic inside the event listener
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { 
                username: sanitizeInput(username) // Pass username to be stored in profiles table later
            }
        }
    });

    if (error) {
        showNotification(error.message, 'error');
    } else {
        showNotification('Signup successful! Check your email for verification.', 'success');
        // etc.
    }
    ```

*   **For Login:**
    ```javascript
    // Replace the login logic
    const { data, error } = await supabase.auth.signInWithPassword({
        email: identity,
        password: password,
    });

    if (error) {
        showNotification(error.message, 'error');
    } else {
        showNotification('Login successful!', 'success');
        // etc.
    }
    ```

*   **For Sign Out:**
    ```javascript
    // Replace the sign out logic
    const { error } = await supabase.auth.signOut();
    if (error) {
        showNotification(error.message, 'error');
    } else {
        // reload page
    }
    ```

**Step 6: Enable Row Level Security (RLS)**

This is the most critical step for security. It ensures users can only see and edit their own data.

1.  Go to **Authentication** -> **Policies** in Supabase.
2.  Find your `profiles` table and click "**New Policy**". Create policies that allow users to view all profiles but only update their own.
3.  Find your `wishlists` table. Create policies that allow a user to view, insert, and delete **only their own** wishlist items (where `user_id` matches their authenticated ID).

This is a high-level overview, but it covers the fundamental steps. The Supabase documentation has excellent guides for each of these points. This setup gives you a powerful, secure, and scalable foundation for your project.

---



---

    *   Create a "Media Uploader" tab in the admin panel.
    *   Build a secure backend service to handle API keys and the file upload process to external platforms.
    *   Connect the admin UI so that it can trigger the upload and receive the resulting download link and embed link.


---




Of course. That's a great idea to keep the documentation in sync with our progress. You are correct, the recent fixes represent a significant milestone in completing Step 3.

I have updated the `Project Plan & Status` section within `context.md` to reflect the completed work on the Content Management page and to outline the next steps for the Media Management page. The rest of the `context.md` file, which describes the overall architecture, remains accurate and does not need changes.

Here is the complete, updated `context.md` file.

---
---
### **Project Plan & Status (Revised and Finalized)**

**Step 1: Foundational Data Structure & Backend Setup [DONE]**
*   **Objective:** Redefine data structures and set up a server to manage the data.
*   **Actions Completed:**
    *   **[DONE]** Revised data schemas and created all data files.
    *   **[DONE]** Created the Node.js/Express backend server (`server.js`).
    *   **[DONE]** Configured the server to be unified, serving both the API and frontend files.

**Step 2: Implementing the Dynamic Frontend [DONE]**
*   **Objective:** Build the user-facing UI on `contentDetails.html` to handle different content types.
*   **Actions Completed:**
    *   **[DONE]** Modified `contentDetails.html` with separate containers.
    *   **[DONE]** Enhanced `contentDetails.js` to build the page dynamically from API data.
    *   **[DONE]** Updated the comment system to be fully API-driven.

**Step 3: Building the Admin Panel (Content & Media Management) [IN PROGRESS]**
*   **Objective:** Create the tools for an administrator to easily manage content.
*   **Feature Development:**
    *   **[DONE]** Created the `/admin` section as a Single-Page Application (SPA).
    *   **[DONE]** Built a **Dashboard** view with dynamic statistics.
    *   **[DONE]** Built a **Content Management** view with a full-featured table and modal form.
    *   **[DONE]** Implemented full **CRUD** (Create, Read, Update, Delete) for all core content metadata.
    *   **[DONE]** Built the initial **Media Management** view.
    *   **[DONE]** Made the Add/Edit content form **UI fully dynamic** to show fields relevant to the content type.
*   **Key Improvements & Bug Fixes:**
    *   **[IMPROVED]** Replaced timestamp-based IDs with user-friendly, **slug-based IDs**.
    *   **[IMPROVED]** Replaced all `alert()`/`confirm()` calls with a professional **notification system**.
    *   **[FIXED]** **Server & SPA Stability:** Resolved all critical routing and race condition errors, including the "Cannot GET /admin/content" bug and "Could not load page content" errors, by implementing a canonical server and client-side loading pattern.
    *   **[FIXED]** **Content Page Polish:** Corrected all identified data binding and layout issues, including the misaligned table, non-functional buttons, and incomplete form-filling.
    *   **[IMPROVED]** **Undo/Redo System:** Implemented a robust, history-based Undo/Redo system for all content management actions (create, update, delete) controlled by dedicated toolbar buttons.
*   **Next Actions:**
    1.  **[DONE]** Implement full functionality for adding, editing, and deleting **Seasons and Episodes** for series/animes within the Media Management page. This will include:
        *   A clean, user-friendly accordion UI for seasons.
        *   Forms for adding/editing seasons and individual episodes.
        *   Dedicated backend API endpoints to support these CRUD operations.
    2.  **[DONE]** Build the **Comment Management** system.

**Step 4: Advanced Admin Panel (Uploader Integration) [FUTURE STEP]**
*   **Objective:** Integrate with ~15 video hosting platforms via their APIs.
*   **Actions To Be Taken:**
    *   Create a "Media Uploader" tab in the admin panel.
    *   Build a secure backend service to handle API keys and the file upload process to external platforms.
    *   Connect the admin UI so that it can trigger the upload and receive the resulting download link and embed link.

---



