let button = document.querySelector("#btn");
let menu = document.querySelector("#menu");
let listMenu = document.querySelector("#list-menu");
let listMenu_links = document.querySelectorAll(".link");

// Scroll down when button is clicked
button.addEventListener("click", function () {
  window.scrollBy({ top: 700, behavior: "smooth" });
});

// Show menu when menu icon is clicked
menu.addEventListener("click", function (e) {
  e.stopPropagation(); // Prevent body click from firing
  listMenu.classList.remove("hidden");
  menu.classList.add("hidden");
});

// Prevent closing when clicking inside the menu
listMenu.addEventListener("click", function (e) {
  e.stopPropagation();
});

// Close menu when clicking outside
document.body.addEventListener("click", function () {
  listMenu.classList.add("hidden");
  menu.classList.remove("hidden");
});

// Hide menu when any link is clicked
listMenu_links.forEach(function(link) {
  link.addEventListener("click", function () {
    listMenu.classList.add("hidden");
    menu.classList.remove("hidden");
  });
});
