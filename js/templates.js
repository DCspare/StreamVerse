// Store promises for template loading
const templatePromises = [];

document.addEventListener('DOMContentLoaded', function() {
    const loadTemplate = (url, placeholderId) => {
        const promise = fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load template: ${url}, Status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    placeholder.innerHTML = html;
                    console.log(`Template ${url} loaded into ${placeholderId}.`); /* Debug log */
                } else {
                    console.warn(`Placeholder element with ID '${placeholderId}' not found for ${url}.`);
                }
            })
            .catch(error => {
                console.error(error);
            });
        templatePromises.push(promise);
    };

    // Load header and footer
    loadTemplate('templates/header.html', 'header-placeholder');
    loadTemplate('templates/footer.html', 'footer-placeholder');
});

// Function to be called from main.js to ensure templates are loaded
async function ensureTemplatesLoaded() {
    return Promise.all(templatePromises);
}

async function loadTemplate(templateName, placeholderId) {
    const response = await fetch(templateName);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const text = await response.text();
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) {
        placeholder.innerHTML = text;
    } else {
        console.warn(`Placeholder with ID ${placeholderId} not found.`);
    }

    if (placeholderId === 'header-placeholder') {
        // Dispatch an event when header is loaded
        document.dispatchEvent(new CustomEvent('headerLoaded'));
    }
}
