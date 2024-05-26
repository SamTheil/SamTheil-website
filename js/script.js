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
  var body = document.body;

  hamburger.addEventListener('click', function() {
    // Toggle menu visibility and fix body position
    if (menu.style.right === "0px") {
      menu.style.right = "-100%"; // Hide menu
      body.style.position = 'relative'; // Allow body to scroll
      body.style.overflow = 'visible'; // Make overflow visible
    } else {
      menu.style.right = "0px"; // Show menu
      body.style.position = 'fixed'; // Fix body position
      body.style.overflow = 'hidden'; // Hide overflow to disable scrolling
      body.style.width = '100%'; // Ensure body width is not affected by position change
    }
  });
});