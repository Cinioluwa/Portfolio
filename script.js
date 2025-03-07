// ================= Global Functions =================

// Tab functionality – smooth transition version
function opentab(tabname) {
    const tablinks = document.getElementsByClassName("tab-links");
    const tabcontents = document.getElementsByClassName("tab-contents");
    // Remove active classes from all tabs and contents
    for (let tablink of tablinks) {
      tablink.classList.remove("active-link");
    }
    for (let tabcontent of tabcontents) {
      // Instead of instantly hiding, let CSS transition the opacity
      tabcontent.classList.remove("active-tab");
    }
    // Add active class to clicked tab and the corresponding content
    event.currentTarget.classList.add("active-link");
    document.getElementById(tabname).classList.add("active-tab");
  }
  
  // Sidebar menu functions
  function openmenu() {
    document.getElementById("sidemenu").style.right = "0";
  }
  function closemenu() {
    document.getElementById("sidemenu").style.right = "-200px";
  }
  
  // ================= DOMContentLoaded Section =================
  
  document.addEventListener('DOMContentLoaded', () => {
    // ----- Ripple Effect on Buttons -----
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement("span");
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + "px";
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";
        ripple.classList.add("ripple");
        // Remove any existing ripple
        const existingRipple = this.querySelector('.ripple');
        if (existingRipple) {
          existingRipple.remove();
        }
        this.appendChild(ripple);
        ripple.addEventListener("animationend", () => {
          ripple.remove();
        });
      });
      const themeToggle = document.getElementById('themeToggle');
      const mobileThemeToggle = document.getElementById('mobileThemeToggle');
      const aboutImage = document.getElementById('aboutImage');
      
      // Ensure dark mode is active by default
      document.body.classList.remove('light-mode');
      themeToggle.textContent = '☀️';
      mobileThemeToggle.textContent = '☀️';
      
      themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('light-mode')) {
          // Switch to dark mode
          document.body.classList.remove('light-mode');
          themeToggle.textContent = '☀️';
          aboutImage.src = aboutImage.getAttribute('data-dark');
        } else {
          // Switch to light mode
          document.body.classList.add('light-mode');
          themeToggle.textContent = '🌙';
          aboutImage.src = aboutImage.getAttribute('data-light');
        }

        
      });

      mobileThemeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('light-mode')) {
          // Switch back to dark mode
          document.body.classList.remove('light-mode');
          mobileThemeToggle.textContent = '☀️';
        } else {
          // Switch to light mode
          document.body.classList.add('light-mode');
          mobileThemeToggle.textContent = '🌙';
        }
        
        
      });
      
    });
  
    // ----- Form Submission with Confetti -----
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxQyF7BkPQqawi-47Og3ZMM4SnXURxa9d0j3eGDc9PH_d0w5c3PJmRLVwjCV8n16M3y/exec';
    const form = document.forms['submit-to-google-sheet'];
    const msg = document.getElementById("msg");
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        fetch(scriptURL, { method: 'POST', body: new FormData(form) })
          .then(response => {
            msg.innerHTML = "Thanks for reaching out!";
            // Delay the confetti slightly so the message renders first
            setTimeout(() => {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            }, 200);
            setTimeout(() => {
              msg.innerHTML = "";
            }, 5000);
            form.reset();
          })
          .catch(error => console.error('Error!', error.message));
      });
    }
  
    // ----- Typewriter Effect for Elements with Class "typewriter" -----
    const typewriterElements = document.querySelectorAll('.typewriter');
    typewriterElements.forEach(element => {
      const text = element.textContent;
      element.textContent = "";
      text.split("").forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.classList.add('letter');
        element.appendChild(span);
        setTimeout(() => {
          span.style.opacity = "1";
        }, index * 200);
      });
    });
  
    // ----- Fade-In Effect on Scroll -----
    const faders = document.querySelectorAll('.fade-in');
    const options = { threshold: 0.2 };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
      });
    }, options);
    faders.forEach(fader => {
      appearOnScroll.observe(fader);
    });
  
    // ----- Custom Cursor Movement and Scaling -----
    const cursor = document.getElementById('customCursor');
    if (cursor) {
      document.addEventListener('mousemove', e => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      });
      document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        btn.addEventListener('mouseleave', () => {
          cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        });
      });
    }


    // Scroll to Top Btn

    // Show the button when user scrolls down 200px
window.addEventListener('scroll', () => {
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    scrollTopBtn.style.display = "block";
  } else {
    scrollTopBtn.style.display = "none";
  }
});

// Scroll to top smoothly when button is clicked
document.getElementById('scrollTopBtn').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


    // ----- Particles.js Initialization -----
    particlesJS("header", {
      "particles": {
        "number": { "value": 80 },
        "color": { "value": "#ffffff" },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.5 },
        "size": { "value": 3 },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#ffffff",
          "opacity": 0.4,
          "width": 1
        },
        "move": { "enable": true, "speed": 6 }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": { "enable": true, "mode": "repulse" },
          "onclick": { "enable": true, "mode": "push" }
        },
        "modes": {
          "repulse": { "distance": 100 },
          "push": { "particles_nb": 4 }
        }
      },
      "retina_detect": true
    });
  });
  