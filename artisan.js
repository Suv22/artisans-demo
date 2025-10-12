// artisan.js<script type="module">
  import { supabase } from "./supabaseClient.js";

  // DOM Elements
  const profileContainer = document.getElementById("profile-container");

  // SVG Icons
  const ICONS = {
    mapPin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.223.654-.369.889-.516 1.954-1.23 2.86-2.135C15.8 15.01 16 14.225 16 13.444c0-1.062-.333-2.244-1.25-3.434C13.75 8.81 12.062 7.5 10 7.5S6.25 8.81 5.25 10.01C4.333 11.2 4 12.382 4 13.444c0 .78.197 1.566.792 2.404.905.906 1.97 1.62 2.86 2.135.253.146.467.269.653.369.06.034.118.067.176.098l.028.014.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" /></svg>`,
    award: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M11.657 7.757l-4.95 4.95a3.5 3.5 0 01-4.95-4.95l4.95-4.95 4.95 4.95zm-2.121 2.121l2.121-2.121-1.414-1.414-2.121 2.121 1.414 1.414z" /><path fill-rule="evenodd" d="M15.232 5.232a3.5 3.5 0 013.536 3.536l-1.5 1.5-3.536-3.536 1.5-1.5zM8.343 12.243l-2.475-2.475a3.5 3.5 0 014.95-4.95l2.475 2.475-4.95 4.95z" clip-rule="evenodd" /></svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" /></svg>`,
    externalLink: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" /><path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 005.656 5.656l3-3a4 4 0 00-.225-5.865z" /></svg>`,
  };

  /**
   * Renders the full artisan profile or an error state.
   */
  async function renderProfile(artisan, error) {
    if (error || !artisan) {
      profileContainer.innerHTML = `
        <div class="status-container">
          <div class="card" style="text-align: center;">
            <h1 style="font-size: 1.5rem;">Artisan Not Found</h1>
            <p>The profile you're looking for doesn't exist.</p>
          </div>
        </div>`;
      return;
    }

    // --- Data Parsing ---
    const awards = artisan.awards ? artisan.awards.split(",").map((award) => award.trim()) : [];
    const workshop_photos = artisan.workshop_photo_link || [];

    // --- HTML Template Generation ---
    const html = `
      <header class="profile-header container">
        <div class="header-main">
          <div class="profile-picture-container">
            <img src="${artisan.photo_link || 'placeholder.jpg'}" alt="${artisan.name}">
          </div>
          <div class="header-details">
            <h1>${artisan.name}${artisan.status?.toLowerCase() === "approved" ? `<img src="assets/tick.png" alt="Verified" class="verified-tick" />` : ""}</h1>
            <div class="header-meta">
              <span>Years of Experience: ${artisan.yr_experience || 'N/A'}</span>
              <span>${artisan.craft?.name || ''}</span>
              <span class="location">${ICONS.mapPin} ${artisan.place}</span>
            </div>
            ${artisan.one_liner ? `<p class="one-liner">${artisan.one_liner}</p>` : ""}
          </div>
          <div class="qr-code-container" id="qr-section" style="display:none;">
            <div id="qr-code"></div>
            <span>GI Connect Verified Artisan</span>
          </div>
        </div>
      </header>

      <main class="profile-body container">
        <div class="cv-grid">
          <div class="cv-main-column">
            ${artisan.quote ? `
              <section class="card">
                <h2 class="card-title">Introduction</h2>
                <blockquote class="quote-block"><span class="quote-mark">“</span>${artisan.quote}</blockquote>
              </section>` : ""}

            ${artisan.craft?.description ? `
              <section class="card">
                <div class="card-header">
                  <h2 class="card-title">The Crafting Process</h2>
                  <button class="info-btn" id="know-more-btn" data-craft-id="${artisan.craft_id}">Know More</button>
                </div>
                <p>${artisan.craft.description}</p>
              </section>` : ""}

            ${workshop_photos.length > 0 || artisan.video_link ? `
              <section class="card">
                <h2 class="card-title">Artisan Gallery</h2>
                <div class="gallery-grid" id="gallery-grid">
                  ${workshop_photos.slice(0, 3).map((photo, i) => `<div class="gallery-item"><img src="${photo}" alt="Artwork ${i + 1}"></div>`).join("")}
                </div>
                ${workshop_photos.length > 3 ? `<button id="toggle-gallery-btn" class="view-more-btn">View More</button>` : ""}
                ${artisan.video_link ? `
                  <div class="video-item">
                    <iframe src="${artisan.video_link}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                  </div>` : ""}
              </section>` : ""}
          </div>

          <div class="cv-sidebar-column">
            <section class="card">
              <h2 class="card-title">Credentials</h2>
              <ul class="credentials-list">
                ${artisan.lineage ? `<li><strong>Lineage:</strong> ${artisan.lineage}</li>` : ""}
                ${awards.length > 0 ? `
                  <li>
                    <strong>Awards:</strong>
                    <ul class="awards-sublist">
                      ${awards.map(award => `<li>${ICONS.award} ${award}</li>`).join("")}
                    </ul>
                  </li>` : ""}
              </ul>
            </section>
          </div>
        </div>
      </main>
    `;

    document.title = `${artisan.name} | Artisan Profile`;
    profileContainer.innerHTML = html;

    // --- Post-Render Logic (Event Listeners & QR Code) ---

    // FIX: Attach the click event listener here, after the button is in the DOM
    const knowMoreBtn = document.getElementById("know-more-btn");
    if (knowMoreBtn) {
      knowMoreBtn.addEventListener('click', () => {
        const craftId = knowMoreBtn.dataset.craftId; // Reads from data-craft-id
        if (craftId) {
          window.location.href = `craft_pro.html?id=${craftId}`;
        }
      });
    }

    // QR code generation
    if (artisan.status?.toLowerCase() === "approved") {
      const qrSection = document.getElementById("qr-section");
      qrSection.style.display = "flex";
      const qrCodeContainer = document.getElementById("qr-code");
      new QRCode(qrCodeContainer, {
        text: `${window.location.origin}/artisan.html?id=${artisan.artisan_id}&source=qr`,
        width: 120,
        height: 120,
      });
    }
    
    // Gallery "View More" button logic
    const toggleBtn = document.getElementById("toggle-gallery-btn");
    if (toggleBtn) {
      let isExpanded = false;
      toggleBtn.addEventListener("click", () => {
        const galleryGrid = document.getElementById("gallery-grid");
        const photosToShow = !isExpanded ? workshop_photos : workshop_photos.slice(0, 3);
        
        galleryGrid.innerHTML = photosToShow.map((photo, i) => 
          `<div class="gallery-item"><img src="${photo}" alt="Artwork ${i + 1}"></div>`
        ).join("");

        isExpanded = !isExpanded;
        toggleBtn.textContent = isExpanded ? "View Less" : "View More";
      });
    }
  }

  /**
   * Main function to get ID from URL and fetch data.
   */
  async function main() {
    const params = new URLSearchParams(window.location.search);
    const artisanId = params.get("id");
    const source = params.get("source");

    if (!artisanId) {
      renderProfile(null, new Error("No artisan ID provided in URL."));
      return;
    }

    // Log a scan if the source is 'qr'
    if (source === "qr") {
      console.log(`QR scan detected for artisan: ${artisanId}. Logging scan...`);
      supabase.functions.invoke("increment-scan-count", {
        body: { artisan_id: artisanId },
      });
      // Remove the 'source=qr' from the URL to prevent re-counting on refresh
      params.delete("source");
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      history.replaceState(null, "", newUrl);
    }

    try {
      const { data, error } = await supabase
        .from("artisans_public")
        .select(`*, craft:craft_id (name, description)`)
        .eq("artisan_id", artisanId)
        .maybeSingle();

      if (error) throw error;
      
      renderProfile(data, null);
    } catch (err) {
      console.error("Failed to fetch artisan profile:", err);
      renderProfile(null, err);
    }
  }

  document.addEventListener("DOMContentLoaded", main);
