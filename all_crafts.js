import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {
  const craftsListElement = document.getElementById("crafts-list");
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const mobileNav = document.getElementById("mobile-nav");
  const searchInput = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let allCrafts = []; // store fetched data globally

  // --- Show Loading Message Initially ---
  craftsListElement.innerHTML = `<li id="loading-message">Loading crafts...</li>`;

  // --- Function to Display Crafts ---
  function displayCrafts(crafts) {
    craftsListElement.innerHTML = "";

    if (!crafts || crafts.length === 0) {
      craftsListElement.innerHTML = `<li id="loading-message">No crafts found.</li>`;
      return;
    }

    crafts.forEach((craft) => {
      const li = document.createElement("li");
      li.className = "craft-item";

      const img = document.createElement("img");
      img.src = craft.hero_img || "placeholder.jpg";
      img.alt = craft.name || "Craft Image";

      const name = document.createElement("h3");
      name.textContent = craft.name || "Unnamed Craft";

      li.appendChild(img);
      li.appendChild(name);
      craftsListElement.appendChild(li);
    });
  }

  // --- Fetch Crafts from Supabase ---
  async function fetchCraftsFromDB() {
    try {
      const { data, error } = await supabase
        .from("crafts")
        .select("name, hero_img");

      if (error) throw error;
      allCrafts = data || [];
      displayCrafts(allCrafts);
    } catch (error) {
      console.error("Error fetching crafts:", error.message);
      craftsListElement.innerHTML = `<li id="loading-message">Failed to load crafts.</li>`;
    }
  }

  // --- Filter Logic ---
  function applyFilters() {
    let filtered = [...allCrafts];
    const searchTerm = searchInput.value.toLowerCase().trim();

    // 1️⃣ Search filter
    if (searchTerm) {
      filtered = filtered.filter((craft) =>
        (craft.name?.toLowerCase().includes(searchTerm)) ||
        (craft.region?.toLowerCase().includes(searchTerm))
      );
    }

    // 2️⃣ Button filter
    const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;
    if (activeFilter === "regions") {
      // Example: only show items that have region info
      filtered = filtered.filter((craft) => craft.region && craft.region.trim() !== "");
    }

    displayCrafts(filtered);
  }

  // --- Event Listeners ---
  searchInput.addEventListener("input", applyFilters);

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // remove 'active' from all buttons
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
    });
  });

  hamburgerMenu.addEventListener("click", () => {
    mobileNav.classList.toggle("is-open");
  });

  // --- Initialize Page ---
  fetchCraftsFromDB();
});