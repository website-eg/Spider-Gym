let button = document.querySelector("#btn");
let menu = document.querySelector("#menu");
let closeMenu = document.querySelector("#close-menu");

button.addEventListener("click", function () {
  window.scrollBy({ top: 700, behavior: "smooth" });
});

closeMenu.addEventListener("click", function () {
  document.querySelector("#list-menu").classList.add("hidden");
  closeMenu.classList.add("hidden");
  menu.classList.remove("hidden");
});

menu.addEventListener("click", function () {
  document.querySelector("#list-menu").classList.remove("hidden");
  closeMenu.classList.remove("hidden");
  menu.classList.add("hidden");
});