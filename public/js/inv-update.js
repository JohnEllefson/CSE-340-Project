const form = document.querySelector("#updateForm");
const updateBtn = document.querySelector("button");

updateBtn.setAttribute("disabled", "disabled");

form.addEventListener("change", function () {
  updateBtn.removeAttribute("disabled");
});