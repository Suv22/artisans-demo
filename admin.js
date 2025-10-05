// admin.js
import { supabase } from "./supabaseClient.js";

// DOM Elements
const tableBody = document.getElementById("artisan-table-body");
const modal = document.getElementById("details-modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const closeModalBtn = document.getElementById("modal-close-btn");
const toast = document.getElementById("toast");
const navLinks = document.querySelectorAll(".sidebar-nav a");

let currentArtisans = [];
let currentFilter = "All";

/**
 * Renders the list of artisans into the table.
 * @param {Array} artisans - An array of artisan objects.
 */
// function renderArtisans(artisans) {

//     tableBody.innerHTML = ''; // Clear existing rows
//     if (artisans.length === 0) {
//         tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No artisans found.</td></tr>`;
//         return;
//     }

//     artisans.forEach(artisan => {
//         const row = `
//             <tr data-id="${artisan.artisan_id}">
//                 <td>${artisan.name}</td>
//                 <td>${artisan.craft}</td>
//                 <td>${artisan.place}</td>
//                 <td>${artisan.lineage || '-'}</td>
//                 <td>${artisan.awards || '-'}</td>
//                 <td>${artisan.one_liner || '-'}</td>
//             </tr>
//         `;
//         tableBody.innerHTML += row;
//     });
// }

// Call this after rendering the artisan profile
function attachStatusClick(row, artisanId) {
  const badge = row.querySelector(".status-badge");
  if (!badge) return;

  badge.addEventListener("click", async () => {
    const currentStatus = badge.textContent.toLowerCase();
    const newStatus = currentStatus === "pending" ? "Approved" : "Pending";

    try {
      const { error } = await supabase
        .from("artisans_public")
        .update({ status: newStatus })
        .eq("artisan_id", artisanId);

      if (error) throw error;

      badge.textContent = newStatus;
      // Remove both status classes first
      badge.classList.remove("status-pending", "status-approved");

      // Add the correct class based on new status
      badge.classList.add(`status-${newStatus.toLowerCase()}`);
    } catch (err) {
      console.error("Failed to update status:", err.message);
      alert("Error updating status. Check console.");
    }
  });
}

function renderArtisans(artisans) {
  const tbody = document.getElementById("artisan-table-body");
  tbody.innerHTML = "";

  artisans.forEach((artisan) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${artisan.name}</td>
            <td>${artisan.place || "-"}</td>
            <td>${artisan.phone || "-"}</td>
            <td>${artisan.aadhaar_last4 || "-"}</td>
            <td>
        <span class="status-badge status-${(
          artisan.status || "pending"
        ).toLowerCase()}">
            ${artisan.status || "Pending"}
        </span>
    </td>
            <td>
                <a href="artisan.html?id=${
                  artisan.artisan_id
                }" class="view-btn">
                    View
                </a>
            </td>
        `;

    tbody.appendChild(row);
    // Attach click only to this row’s badge
    attachStatusClick(row, artisan.artisan_id);
  });
}

/**
 * Fetches artisans from Supabase based on the current filter.
 */
async function fetchArtisans() {
  let query = supabase.from("artisans_public").select("*");

  if (currentFilter !== "All") {
    query = query.eq("status", currentFilter);
  }

  const { data, error } = await query;

  if (error) {
    showToast(`Error fetching data: ${error.message}`, "error");
    console.error(error);
    return;
  }
  // 🔑 Attach image URL dynamically using artisan_id
  const enrichedData = data.map((artisan) => {
    const { data: urlData } = supabase.storage
      .from("artisan_files")
      .getPublicUrl(`${artisan.artisan_id}/photo_${artisan.artisan_id}.jpg`);

    return {
      ...artisan,
      photo_url: urlData?.publicUrl || null,
    };
  });

  console.log("Fetched artisans:", enrichedData); // 👈 Check what comes from Supabase

  currentArtisans = enrichedData;
  renderArtisans(currentArtisans);
}

/**
 * Shows the details modal for a specific artisan.
 * @param {string} artisanId - The ID of the artisan.
 */
function showDetailsModal(artisanId) {
  const artisan = currentArtisans.find((a) => a.artisan_id === artisanId); // FIXED
  if (!artisan) return;

  modalTitle.textContent = `${artisan.name}'s Details`;

  const portfolioUrl = `${window.location.origin}/artisan.html?id=${artisan.artisan_id}`; // FIXED
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    portfolioUrl
  )}`;

  modalBody.innerHTML = `
        <div class="info-grid">
            <div class="info-item"><h4>Phone</h4><p>${
              artisan.phone || "-"
            }</p></div>
            <div class="info-item"><h4>Location</h4><p>${
              artisan.place || "-"
            }</p></div>
            <div class="info-item"><h4>Aadhaar (Last 4)</h4><p>${
              artisan.aadhaar_last4 || "-"
            }</p></div>
            <div class="info-item"><h4>Status</h4><p><span class="status-badge status-${(
              artisan.status || "pending"
            ).toLowerCase()}">${artisan.status || "Pending"}</span></p></div>
        </div>
        <div class="image-gallery">
            <h4>Uploaded Files</h4>
            <div class="image-grid">
                ${
                  artisan.aadhaar_front_url
                    ? `<a href="${artisan.aadhaar_front_url}" target="_blank"><img src="${artisan.aadhaar_front_url}" alt="Aadhaar Front"></a>`
                    : ""
                }
                ${
                  artisan.aadhaar_back_url
                    ? `<a href="${artisan.aadhaar_back_url}" target="_blank"><img src="${artisan.aadhaar_back_url}" alt="Aadhaar Back"></a>`
                    : ""
                }
                ${
                  Array.isArray(artisan.craft_photo_urls)
                    ? artisan.craft_photo_urls
                        .map(
                          (url) =>
                            `<a href="${url}" target="_blank"><img src="${url}" alt="Craft Photo"></a>`
                        )
                        .join("")
                    : ""
                }
            </div>
        </div>
        ${
          artisan.status === "Approved"
            ? `
            <div class="qr-code">
                <h4>Portfolio QR Code</h4>
                <img src="${qrCodeUrl}" alt="Portfolio QR Code">
            </div>`
            : ""
        }
    `;
  modal.classList.add("visible");
}

/**
 * Updates the status of an artisan in the database.
 * @param {string} artisanId - The ID of the artisan.
 * @param {string} newStatus - The new status ('Approved' or 'Rejected').
 */
async function updateArtisanStatus(artisanId, newStatus) {
  const { error } = await supabase
    .from("artisans_public") // FIXED
    .update({ status: newStatus })
    .eq("artisan_id", artisanId); // FIXED

  if (error) {
    showToast(`Error updating status: ${error.message}`, "error");
    console.error(error);
  } else {
    showToast(`Artisan successfully ${newStatus.toLowerCase()}.`, "success");
    fetchArtisans(); // Refresh the table
  }
}

/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error'.
 */
function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// --- Event Listeners ---

// Sidebar navigation for filtering
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    currentFilter = link.dataset.filter;
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    fetchArtisans();
  });
});

// Event delegation for action buttons in the table
tableBody.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const row = button.closest("tr");
  const artisanId = row.dataset.id;

  if (button.classList.contains("view-btn")) {
    showDetailsModal(artisanId);
  } else if (button.classList.contains("approve-btn")) {
    updateArtisanStatus(artisanId, "Approved");
  } else if (button.classList.contains("reject-btn")) {
    updateArtisanStatus(artisanId, "Rejected");
  }
});

// Modal close events
closeModalBtn.addEventListener("click", () =>
  modal.classList.remove("visible")
);
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("visible");
  }
});

// Initial data fetch on page load
document.addEventListener("DOMContentLoaded", fetchArtisans);
