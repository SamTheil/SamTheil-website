document.addEventListener("DOMContentLoaded", function() {
  var header = document.getElementById("header");

  if (header) {
      header.innerHTML = `
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Dosis:wght@400&display=swap" rel="stylesheet">
      </head>    
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