document.addEventListener("DOMContentLoaded", () => {
  const favoriteButton = document.getElementById("favorite-button");

  if (favoriteButton) {
    favoriteButton.addEventListener("click", async () => {
      const invId = favoriteButton.dataset.id;
      const isFavorited = favoriteButton.classList.contains("favorited");
      const url = `/account/favorites/${isFavorited ? "delete" : "add"}`;
      const method = isFavorited ? "DELETE" : "POST";

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invId }),
        });

        if (response.ok) {
          // Toggle the button's state and appearance
          favoriteButton.textContent = isFavorited ? "Not Favorited" : "Favorited!";
          favoriteButton.classList.toggle("favorited");
          favoriteButton.classList.toggle("not-favorited");
        } else {
          console.error("Failed to update favorites.");
        }
      } catch (error) {
        console.error("Error updating favorites:", error);
      }
    });
  }
});