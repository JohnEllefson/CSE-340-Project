document.addEventListener("DOMContentLoaded", () => {
  const heartIcons = document.querySelectorAll(".heart-icon");

  heartIcons.forEach((icon) => {
    icon.addEventListener("click", async (event) => {
      event.preventDefault();

      const invId = icon.dataset.id;
      const isFavorited = icon.src.includes("heart_solid"); 
      const url = `/account/favorites/${invId}`;
      const method = isFavorited ? "DELETE" : "POST";

      try {
        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invId: invId }),
        });

        if (!response.ok) {
          throw new Error("Failed to update favorite status");
        }

        const result = await response.json();
        console.log(result.message);

        // Toggle the heart icon based on the response
        icon.src = isFavorited
          ? "/images/site/heart_border.png"
          : "/images/site/heart_solid.png";
        icon.alt = isFavorited ? "Add to favorites" : "Remove from favorites";
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    });
  });
});