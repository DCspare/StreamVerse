/**
 * Displays a custom notification message.
 * @param {string} message - The message to display.
 * @param {'success' | 'info' | 'warning' | 'error'} type - The type of notification (determines color/icon).
 * @param {number} [duration=3000] - How long the notification should be visible in milliseconds.
 */
document.addEventListener("DOMContentLoaded", function() {
    console.log("notifications.js DOMContentLoaded fired."); // Debug log
    // The rest of the code will be triggered by showNotification calls
});

window.showNotification = function(message, type = 'info', duration = 3000) {
    console.log(`showNotification called with message: ${message}, type: ${type}`); // Debug log
    let notificationContainer = document.getElementById("notificationContainer");
    if (!notificationContainer) {
        console.log("Notification container not found. Creating one."); // Debug log
        // Create notification container if it doesn't exist
        notificationContainer = document.createElement("div");
        notificationContainer.id = "notificationContainer";
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement("div");
    notification.classList.add("notification", type);
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    // Trigger reflow to ensure the transition works
    void notification.offsetWidth;

    notification.classList.add("show");

    // Automatically hide and remove the notification
    setTimeout(() => {
        notification.classList.remove("show");
        // After the transition, remove the element from the DOM
        setTimeout(() => {
            if (notificationContainer && notification.parentNode === notificationContainer) {
                notificationContainer.removeChild(notification);
            }
        }, 300); // Same as transition duration
    }, duration);
};
