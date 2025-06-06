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
    // ----- Custom Cursors ------
    const cubeCursor = document.querySelector('.custom-cursor');
  const pointerCursor = document.querySelector('.custom-pointer');

  document.addEventListener('mousemove', (e) => {
    // Update both cursor positions
    cubeCursor.style.left = `${e.clientX}px`;
    cubeCursor.style.top  = `${e.clientY}px`;
    pointerCursor.style.left = `${e.clientX}px`;
    pointerCursor.style.top  = `${e.clientY}px`;

    // Check if the mouse is over a link (or any interactive element)
    if (e.target.closest('a')) {
      cubeCursor.style.display = 'none';
      pointerCursor.style.display = 'block';
    } else {
      cubeCursor.style.display = 'block';
      pointerCursor.style.display = 'none';
    }
  });
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

      // Function to toggle theme and update image
      function toggleTheme() {
        if (document.body.classList.contains('light-mode')) {
          // Switch to dark mode
          document.body.classList.remove('light-mode');
          themeToggle.textContent = '☀️';
          mobileThemeToggle.textContent = '☀️';
          aboutImage.src = aboutImage.getAttribute('data-dark');
        } else {
          // Switch to light mode
          document.body.classList.add('light-mode');
          themeToggle.textContent = '🌙';
          mobileThemeToggle.textContent = '🌙';
          aboutImage.src = aboutImage.getAttribute('data-light');
        }
      }

      // Add event listeners for both buttons
      themeToggle.addEventListener('click', toggleTheme);
      mobileThemeToggle.addEventListener('click', toggleTheme);

      
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

let loadingComplete = false;
const LOADING_DURATION = 8000; // 8 seconds - increase this for longer display

// Auto-hide loading screen after specified duration
setTimeout(() => {
    hideLoadingScreen();
}, LOADING_DURATION);

// Function to hide loading screen
function hideLoadingScreen() {
    if (!loadingComplete) {
        loadingComplete = true;
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            
            // Remove from DOM after fade completes
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
}

// Skip button functionality
function skipLoading() {
    hideLoadingScreen();
}

// Keyboard shortcut to skip (ESC key)
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        hideLoadingScreen();
    }
});

// Hide when page is fully loaded (but respect minimum display time)
window.addEventListener('load', function() {
    // Only hide early if we've displayed for at least 3 seconds
    const minDisplayTime = 3000;
    setTimeout(() => {
        if (!loadingComplete) {
            console.log("Page loaded, but respecting minimum display time");
            // Don't hide early - let the main timer handle it
        }
    }, minDisplayTime);
});

// Optional: Real progress tracking
function updateLoadingProgress() {
    const images = document.querySelectorAll('img');
    const scripts = document.querySelectorAll('script[src]');
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    
    let totalAssets = images.length + scripts.length + stylesheets.length;
    let loadedAssets = 0;
    
    function checkComplete() {
        loadedAssets++;
        if (loadedAssets >= totalAssets) {
            // All assets loaded, but enforce minimum display time
            const elapsedTime = performance.now();
            const remainingTime = Math.max(0, LOADING_DURATION - elapsedTime);
            setTimeout(hideLoadingScreen, remainingTime);
        }
    }
    
    // Track image loading
    images.forEach(img => {
        if (img.complete) {
            checkComplete();
        } else {
            img.addEventListener('load', checkComplete);
            img.addEventListener('error', checkComplete);
        }
    });
    
    // Track script loading
    scripts.forEach(script => {
        script.addEventListener('load', checkComplete);
        script.addEventListener('error', checkComplete);
    });
    
    // Track stylesheet loading
    stylesheets.forEach(link => {
        link.addEventListener('load', checkComplete);
        link.addEventListener('error', checkComplete);
    });
}

// Uncomment the line below if you want real progress tracking
// updateLoadingProgress();