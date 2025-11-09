// artisan.js<script type="module">

import { supabase } from "./supabaseClient.js";

// Wait for the HTML document to be fully loaded before running script
document.addEventListener("DOMContentLoaded", () => {
  // --- 2. Get Reference to the List ---
  const craftsListElement = document.getElementById("crafts-list");

  // --- 3. Function to Display Data ---
  function displayCrafts(crafts) {
    // Clear the "Loading..." message
    craftsListElement.innerHTML = "";

    // Loop through each craft in the data
    crafts.forEach((craft) => {
      // Create the <li> element (the card)
      const li = document.createElement("li");
      li.className = "craft-item"; // Add CSS class

      // Create the <img> element
      const img = document.createElement("img");        
      img.src = craft.hero_img;
      img.alt = craft.name; // Important for accessibility

      // Create the <h3> element (for the name)
      const name = document.createElement("h3");
      name.textContent = craft.name;

      // Add the image and name to the list item
      li.appendChild(img);
      li.appendChild(name);

      // Add the new list item to the main list
      craftsListElement.appendChild(li);
    });
  }

  async function fetchCraftsFromDB() {
    try {
      // This is the Supabase query to get ONLY name and hero_image
      const { data, error } = await supabase
        .from("crafts")
        .select("name, hero_img");

      if (error) {
        // If there's an error, show it
        throw error;
      }

      // If data is fetched successfully, display it
      displayCrafts(data);
    } catch (error) {
      console.error("Error fetching crafts:", error.message);
      craftsListElement.innerHTML = `<li id="loading-message">Failed to load crafts.</li>`;
    }
  }

  // 4. Call the real function INSTEAD of the mock data one
  fetchCraftsFromDB();
});
