document.addEventListener("DOMContentLoaded", function() {
  var header = document.getElementById("header");
  if (header) {
      header.innerHTML = `
      <button class="hamburger" aria-label="Open navigation menu">&#9776;</button>
      <nav>
          <ul class="menu">
              <li><a href="index.html">Home</a></li>
              <li><a href="about.html">About Me</a></li>
              <li><a href="projects.html">Projects</a></li>
              <li><a href="contact.html">Contact</a></li>
          </ul>
      </nav>`;
  }
});

document.addEventListener("DOMContentLoaded", function() {
  var hamburger = document.querySelector('.hamburger');
  var menu = document.querySelector('nav ul');

  hamburger.addEventListener('click', function() {
    // Toggle menu visibility
    if (menu.style.right === "0px") {
      menu.style.right = "-100%"; // Hide menu
    } else {
      menu.style.right = "0px"; // Show menu
    }
  });
});