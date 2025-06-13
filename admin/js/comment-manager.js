// admin/js/comment-manager.js

/**
 * Initializes the comment management page by loading comments and setting up event listeners.
 */
function initializeCommentManager() {
  console.log("Comment Manager loaded.");
  loadAllComments();
  setupCommentListeners();
}

/**
 * Fetches all comments from the server and renders them in the table.
 */
async function loadAllComments() {
  try {
    const response = await fetch("/api/comments_all");
    if (!response.ok) throw new Error("Failed to fetch comments.");
    const comments = await response.json();
    renderComments(comments);
  } catch (error) {
    console.error("Error loading comments:", error);
    const tableBody = document.getElementById("comments-table-body");
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="5" class="error-message">Could not load comments.</td></tr>`;
    }
  }
}

/**
 * Renders an array of comment objects into the comments table.
 * @param {Array} comments - The array of comments to render.
 */
function renderComments(comments) {
  const tableBody = document.getElementById("comments-table-body");
  if (!tableBody) return; // Exit if the table isn't on the page

  if (!comments || comments.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="empty-message">No comments found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = comments
    .map(
      (comment) => `
      <tr data-comment-id="${comment.commentId}" data-content-id="${
        comment.contentId
      }">
        <td>${comment.contentTitle || "Unknown"}</td>
        <td>${
          (comment.user && comment.user.name) || comment.user || "Anonymous"
        }</td>
        <td class="text-cell">${comment.text}</td>
        <td>${new Date(comment.date).toLocaleString()}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-primary btn-small reply-btn">Reply</button>
            <button class="btn btn-danger btn-small delete-btn">Delete</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

/**
 * Sets up all necessary event listeners for the comment management page.
 */
function setupCommentListeners() {
  const table = document.getElementById("comments-table");
  if (!table) return;

  // Use event delegation for reply and delete buttons
  table.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    if (!row) return;

    const { commentId, contentId } = row.dataset;

    if (e.target.classList.contains("reply-btn")) {
      const text = row.querySelector(".text-cell").textContent;
      openCommentReplyModal(commentId, contentId, text);
    }

    if (e.target.classList.contains("delete-btn")) {
      handleDeleteComment(commentId, contentId);
    }
  });

  // Listeners for the reply modal
  document
    .getElementById("comment-reply-modal-close-btn")
    ?.addEventListener("click", closeCommentReplyModal);
  document
    .getElementById("comment-reply-modal-cancel-btn")
    ?.addEventListener("click", closeCommentReplyModal);
  document
    .getElementById("comment-reply-form")
    ?.addEventListener("submit", handleReplySubmit);
}

/**
 * Opens the reply modal and populates it with the correct comment data.
 */
function openCommentReplyModal(commentId, contentId, text) {
  document.getElementById("reply-comment-id").value = commentId;
  document.getElementById("reply-content-id").value = contentId;
  document.getElementById("original-comment-text").textContent = text;
  document
    .getElementById("comment-reply-modal-overlay")
    .classList.add("visible");
}

/**
 * Closes the reply modal.
 */
function closeCommentReplyModal() {
  document
    .getElementById("comment-reply-modal-overlay")
    .classList.remove("visible");
}

/**
 * Handles the submission of the reply form.
 */
async function handleReplySubmit(e) {
  e.preventDefault();
  const contentId = document.getElementById("reply-content-id").value;
  const commentId = document.getElementById("reply-comment-id").value;
  const replyText = document.getElementById("comment-reply-text").value;

  try {
    const response = await fetch(`/api/comments/${contentId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, replyText }),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || "Failed to submit reply.");

    showNotification("Reply posted successfully!", "success");
    closeCommentReplyModal();
    loadAllComments(); // Refresh the list
  } catch (error) {
    showNotification(`Error: ${error.message}`, "error");
  }
}

/**
 * Shows a confirmation dialog and handles the deletion of a comment.
 */
function handleDeleteComment(commentId, contentId) {
  showNotification("Are you sure you want to delete this comment?", {
    type: "confirm",
    duration: 0,
    buttons: [
      {
        text: "Delete",
        class: "confirm-btn", // This button will trigger the action
        action: async () => {
          try {
            const response = await fetch(
              `/api/comments/${contentId}/${commentId}`,
              {
                method: "DELETE",
              }
            );
            const result = await response.json();
            if (!response.ok)
              throw new Error(result.error || "Failed to delete comment.");

            showNotification("Comment deleted successfully!", "success");
            loadAllComments(); // Refresh the list to show the comment is gone
          } catch (error) {
            showNotification(`Error: ${error.message}`, "error");
          }
        },
      },
      {
        text: "Cancel", // This button simply closes the notification
        action: () => {},
      },
    ],
  });
}
