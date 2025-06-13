// admin/js/request-manager.js

function initializeRequestManager() {
  console.log("Request Manager loaded.");
  loadAllRequests();
  setupRequestListeners();
}

async function loadAllRequests() {
  try {
    const response = await fetch("/api/requests");
    if (!response.ok) throw new Error("Failed to fetch requests.");
    const requests = await response.json();
    renderRequests(requests);
  } catch (error) {
    console.error("Error loading requests:", error);
    showNotification("Could not load requests.", "error");
    // Also try to render an error message in the table
    const tableBody = document.getElementById("requests-table-body");
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="6" class="error-message">Could not load requests. See console for details.</td></tr>`;
    }
  }
}

function renderRequests(requests) {
  const tableBody = document.getElementById("requests-table-body");

  // [FIX] Add a null check for the table body to prevent the crash
  if (!tableBody) {
    console.error(
      "Fatal Error: The element with ID 'requests-table-body' was not found in the HTML view."
    );
    return;
  }

  if (!Array.isArray(requests)) {
    console.error("Data received for requests is not an array:", requests);
    tableBody.innerHTML = `<tr><td colspan="6" class="error-message">Error: Invalid data format received from server.</td></tr>`;
    return;
  }

  if (requests.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="empty-message">No pending requests found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = requests
    .map(
      (req) => `
    <tr data-id="${req.id}">
      <td>${req.id}</td>
      <td>${req.contentId || "N/A"}</td>
      <td>${(req.user && req.user.name) || "Anonymous"}</td>
      <td class="text-cell">${req.text}</td>
      <td>${new Date(req.date).toLocaleString()}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-primary btn-small reply-btn" data-id="${
            req.id
          }" data-text="${escape(req.text)}">Reply</button>
          <button class="btn btn-danger btn-small delete-btn" data-id="${
            req.id
          }">Delete</button>
        </div>
      </td>
    </tr>`
    )
    .join("");
}

function setupRequestListeners() {
  const table = document.getElementById("requests-table");
  const modalOverlay = document.getElementById("request-reply-modal-overlay");
  const replyForm = document.getElementById("request-reply-form");

  if (!table || !modalOverlay || !replyForm) {
    console.error(
      "One or more listener targets (table, modal, form) are missing from the DOM."
    );
    return;
  }

  table.addEventListener("click", (e) => {
    const replyButton = e.target.closest(".reply-btn");
    const deleteButton = e.target.closest(".delete-btn");

    if (replyButton) {
      const { id, text } = replyButton.dataset;
      openReplyModal(id, unescape(text));
    }
    if (deleteButton) {
      const { id } = deleteButton.dataset;
      handleDeleteRequest(id);
    }
  });

  document
    .getElementById("request-reply-modal-close-btn")
    .addEventListener("click", closeReplyModal);
  document
    .getElementById("request-reply-modal-cancel-btn")
    .addEventListener("click", closeReplyModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeReplyModal();
  });

  replyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const requestId = document.getElementById("reply-request-id").value;
    const replyText = document.getElementById("request-reply-text").value;

    try {
      const response = await fetch(`/api/requests/${requestId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to post reply.");

      showNotification("Reply posted successfully!", "success");
      closeReplyModal();
      loadAllRequests();
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
    }
  });
}

function openReplyModal(requestId, requestText) {
  document.getElementById("reply-request-id").value = requestId;
  document.getElementById("original-request-text").textContent = requestText;
  document.getElementById("request-reply-text").value = "";
  document
    .getElementById("request-reply-modal-overlay")
    .classList.add("visible");
  document.getElementById("request-reply-text").focus();
}

function closeReplyModal() {
  document
    .getElementById("request-reply-modal-overlay")
    .classList.remove("visible");
}

function handleDeleteRequest(requestId) {
  showNotification("Are you sure you want to delete this request?", {
    type: "confirm",
    duration: 0,
    buttons: [
      {
        text: "Delete",
        class: "confirm-btn",
        action: async () => {
          try {
            const response = await fetch(`/api/requests/${requestId}`, {
              method: "DELETE",
            });
            const result = await response.json();
            if (!response.ok)
              throw new Error(result.error || "Failed to delete request.");

            showNotification("Request deleted successfully!", "success");
            loadAllRequests();
          } catch (error) {
            showNotification(`Error: ${error.message}`, "error");
          }
        },
      },
      {
        text: "Cancel",
        action: () => {},
      },
    ],
  });
}
