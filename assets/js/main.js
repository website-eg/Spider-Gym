let menu = document.querySelector("#menu");
let listMenu = document.querySelector("#list-menu");
let listMenu_links = document.querySelectorAll(".link");

// Show menu when menu icon is clicked
menu.addEventListener("click", function (e) {
  e.stopPropagation();
  listMenu.classList.add("show");
  menu.classList.add("hidden");
});

// Prevent closing when clicking inside the menu
listMenu.addEventListener("click", function (e) {
  e.stopPropagation();
});

// Close menu when clicking outside
document.body.addEventListener("click", function () {
  listMenu.classList.remove("show");
  menu.classList.remove("hidden");
});

// Hide menu when any link is clicked
listMenu_links.forEach(function (link) {
  link.addEventListener("click", function () {
    listMenu.classList.remove("show");
    menu.classList.remove("hidden");
  });
});
