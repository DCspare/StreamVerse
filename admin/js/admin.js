// admin/js/admin.js - Main SPA Router (Corrected with Absolute Paths)

const routes = {
  dashboard: {
    view: "/admin/views/dashboard.html",
    init: "initializeDashboard",
  },
  content: {
    view: "/admin/views/content.html",
    init: "initializeContentManager",
  },
  media: {
    view: "/admin/views/media.html",
    init: "initializeMediaManager",
  },
  comments: {
    view: "/admin/views/comments.html",
    init: "initializeCommentManager",
  },
  requests: {
    view: "/admin/views/requests.html",
    init: "initializeRequestManager",
  },
};

const mainContent = document.getElementById("admin-main-content");

async function loadPage(page) {
  const route = routes[page];
  if (!route) {
    mainContent.innerHTML = "<h1>404 - Page Not Found</h1>";
    return;
  }
  try {
    const response = await fetch(route.view);
    if (!response.ok) throw new Error(`Page not found: ${route.view}`);
    mainContent.innerHTML = await response.text();

    // Check if the initialization function exists on the window object and call it
    if (typeof window[route.init] === "function") {
      window[route.init]();
    }
  } catch (error) {
    mainContent.innerHTML = "<h1>Error</h1><p>Could not load page content.</p>";
    console.error("Error loading page:", error);
  }
}

function handleNavigation(event) {
  event.preventDefault();
  const link = event.target.closest(".nav-link");
  if (!link) return;
  const page = link.dataset.page;

  const currentPath = window.location.pathname.replace(/^\/admin\/?/, "");
  if (page === (currentPath || "dashboard")) return;

  history.pushState(
    { page },
    `${page} - Admin`,
    `/${page === "dashboard" ? "admin/" : `admin/${page}`}`
  );
  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
  link.classList.add("active");
  loadPage(page);
}

function initialLoad() {
  const path = window.location.pathname.replace(/^\/admin\/?/, "");
  let page = path.split("/")[0] || "dashboard";

  if (!routes[page]) {
    page = "dashboard";
  }

  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));

  const activeLinkKey = page === "media" ? "content" : page;
  const activeLink = document.querySelector(
    `.nav-link[data-page="${activeLinkKey}"]`
  );

  if (activeLink) {
    activeLink.classList.add("active");
  }

  loadPage(page);
}

document
  .querySelector(".admin-nav")
  .addEventListener("click", handleNavigation);
window.addEventListener("popstate", initialLoad);
document.addEventListener("DOMContentLoaded", initialLoad);
