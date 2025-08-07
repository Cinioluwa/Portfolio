// ================= Global Functions =================

// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const thankYouMessage = document.getElementById('thankYouMessage');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);

            // Submit form to Formspree
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Show thank you message
                    thankYouMessage.style.display = 'block';
                    form.style.display = 'none';

                    // Trigger confetti effect
                    if (typeof confetti === 'function') {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 }
                        });
                    }

                    // Clear form
                    form.reset();

                    // Hide thank you message after 5 seconds and show form again
                    setTimeout(() => {
                        thankYouMessage.style.display = 'none';
                        form.style.display = 'block';
                    }, 5000);
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Oops! There was a problem submitting your form. Please try again.');
            });
        });
    }
});

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
  
  // Mobile menu functions removed - using floating nav instead
  
  // ================= DOMContentLoaded Section =================
  
  document.addEventListener('DOMContentLoaded', () => {
    // ----- Cursor Effect -----
    document.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--cursor-x', e.clientX + 'px');
        document.documentElement.style.setProperty('--cursor-y', e.clientY + 'px');
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
      const floatingThemeToggle = document.getElementById('floatingThemeToggle');
      const aboutImage = document.getElementById('aboutImage');

      // Ensure dark mode is active by default
      document.body.classList.remove('light-mode');
      themeToggle.textContent = '☀️';
      mobileThemeToggle.textContent = '☀️';
      if (floatingThemeToggle) {
        floatingThemeToggle.textContent = '☀️';
      }

      // Function to toggle theme and update image
      window.toggleTheme = function() {
        if (document.body.classList.contains('light-mode')) {
          // Switch to dark mode
          document.body.classList.remove('light-mode');
          themeToggle.textContent = '☀️';
          mobileThemeToggle.textContent = '☀️';
          if (floatingThemeToggle) {
            floatingThemeToggle.textContent = '☀️';
          }
          aboutImage.src = aboutImage.getAttribute('data-dark');
        } else {
          // Switch to light mode
          document.body.classList.add('light-mode');
          themeToggle.textContent = '🌙';
          mobileThemeToggle.textContent = '🌙';
          if (floatingThemeToggle) {
            floatingThemeToggle.textContent = '🌙';
          }
          aboutImage.src = aboutImage.getAttribute('data-light');
        }
      }

      // Add event listeners for all buttons
      themeToggle.addEventListener('click', window.toggleTheme);
      mobileThemeToggle.addEventListener('click', window.toggleTheme);
      if (floatingThemeToggle) {
        floatingThemeToggle.addEventListener('click', window.toggleTheme);
      }

      
    });
  
    // ----- Form Submission with Confetti -----
    // Custom cursor effect
document.addEventListener('mousemove', (e) => {
    document.body.style.setProperty('--cursor-x', e.clientX + 'px');
    document.body.style.setProperty('--cursor-y', e.clientY + 'px');
    
    const cursor = document.body;
    cursor.style.setProperty('--cursor-x', e.clientX + 'px');
    cursor.style.setProperty('--cursor-y', e.clientY + 'px');
});

// Add cursor glow on interactive elements
const interactiveElements = document.querySelectorAll('a, button, .btn, input, textarea, [onclick], .social-icon, .work');
interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        document.body.classList.add('element-hovered');
    });
    
    element.addEventListener('mouseleave', () => {
        document.body.classList.remove('element-hovered');
    });
});

const scriptURL = 'https://script.google.com/macros/s/AKfycbwvBtOz_SDWBo2i2qnW8f9mMxk3vX_R_w2drOxmDj0SpeVk7wz3bTMlYDf6gkmCQVXU/exec';
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
  
    // ----- Find and replace the old Typewriter Effect section in your script.js -----

// ----- Typewriter and Glitch Effect for "typewriter" class -----
const typewriterElements = document.querySelectorAll('.typewriter');
typewriterElements.forEach(element => {
    const originalText = element.getAttribute('data-text') || element.textContent;
    element.textContent = ''; // Clear the element

    let i = 0;
    const interval = setInterval(() => {
        if (i < originalText.length) {
            // Add the next character
            element.innerHTML += originalText.charAt(i);
            i++;

            // Temporary glitch effect
            const glitchChars = '▓▒░█_#?*&';
            const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            element.innerHTML += `<span class="glitch" style="animation-delay: ${Math.random() * 0.1}s">${randomChar}</span>`;

            // Remove the glitch character shortly after
            setTimeout(() => {
                const glitchSpan = element.querySelector('.glitch');
                if (glitchSpan) {
                    glitchSpan.remove();
                }
            }, 50);

        } else {
            clearInterval(interval);
        }
    }, 75); // Adjust typing speed here (milliseconds)
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

// ================= FLOATING NAVIGATION ================= 
// Floating Navigation Functionality
let lastScrollTop = 0;
let ticking = false;

function updateFloatingNav() {
    const floatingNav = document.getElementById('floatingNav');
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : window.innerHeight;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Show floating nav when user scrolls past 80% of header height
    if (scrollPosition > headerHeight * 0.8) {
        floatingNav.classList.add('show');
    } else {
        floatingNav.classList.remove('show');
    }
    
    lastScrollTop = scrollPosition;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateFloatingNav);
        ticking = true;
    }
});

// Smooth scroll for floating nav links with active state highlighting
document.querySelectorAll('.floating-nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop;
            const headerOffset = 80; // Adjust as needed
            
            // Remove active class from all links
            document.querySelectorAll('.floating-nav-links a').forEach(l => {
                l.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            window.scrollTo({
                top: offsetTop - headerOffset,
                behavior: 'smooth'
            });
        }
    });
});

// Highlight active section in floating nav
function highlightActiveSection() {
    const sections = document.querySelectorAll('#header, #about, #services, #portfolio, #contact');
    const navLinks = document.querySelectorAll('.floating-nav-links a');
    const scrollPosition = window.pageYOffset + 100;
    
    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLinks[index]) {
                navLinks[index].classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightActiveSection);


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