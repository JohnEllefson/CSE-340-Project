document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".heart-icon").forEach((icon) => {
    icon.addEventListener("click", async (event) => {
      event.preventDefault();
      const invId = icon.dataset.id;
      if (!invId) {
        console.error("invId is undefined or invalid");
      }

      try {
        const response = await fetch(`/account/favorites/${invId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invId: invId }),
        });
        console.log("Sent invId:", invId);
        if (response.ok) {
          const parentElement = icon.closest("li");
          parentElement.remove(); // Remove the vehicle from the DOM
          if (document.querySelectorAll("#inv-display li").length === 0) {
            document.querySelector("#inv-display").innerHTML = `<p class="notice">No vehicles currently favorited.</p>`;
          }
        } else {
          console.error("Failed to remove favorite");
        }
      } catch (error) {
        console.error("Error removing favorite:", error);
      }
    });
  });
});