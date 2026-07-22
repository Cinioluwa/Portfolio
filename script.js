/* =============================================================
   main.js — Covenant Adeogo Portfolio
   Expects window.THREE from UMD script loaded in <head>
   Matter.js loaded on demand for the ball
   ============================================================= */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     TIER
  ───────────────────────────────────────────── */
  function detectTier() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'slow';
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      if (conn.saveData) return 'slow';
      var et = conn.effectiveType;
      if (et === 'slow-2g' || et === '2g') return 'slow';
      if (et === '3g' || (conn.deviceMemory && conn.deviceMemory < 2)) return 'mid';
    }
    return 'high';
  }

  var tier;
  try { tier = localStorage.getItem('ca:tier') || detectTier(); }
  catch (e) { tier = detectTier(); }

  /* ─────────────────────────────────────────────
     CURSOR
  ───────────────────────────────────────────── */
  var cursorEl = document.getElementById('cursor');
  if (cursorEl && matchMedia('(pointer: fine)').matches && tier !== 'slow') {
    var cx = -100, cy = -100, tx = -100, ty = -100;
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function moveCursor() {
      cx += (tx - cx) * 0.45;
      cy += (ty - cy) * 0.45;
      cursorEl.style.left = cx + 'px';
      cursorEl.style.top = cy + 'px';
      requestAnimationFrame(moveCursor);
    })();

    document.querySelectorAll('a, button, .project, .capability, .github-more-btn').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursorEl.classList.add('expanded'); });
      el.addEventListener('mouseleave', function () { cursorEl.classList.remove('expanded'); });
    });
  }

  /* ─────────────────────────────────────────────
     SCROLL REVEALS
  ───────────────────────────────────────────── */
  var revealItems = document.querySelectorAll(
    '#work h2, #domain h2, #timeline h2, .project, .capability, .t-entry, .reveal-inner, .github-more-wrap'
  );
  var photoWrap = document.getElementById('profile-photo-wrap');

  if ('IntersectionObserver' in window && tier !== 'slow') {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(function () { el.classList.add('visible'); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

    revealItems.forEach(function (el, i) {
      if (el.classList.contains('project') ||
          el.classList.contains('capability') ||
          el.classList.contains('t-entry')) {
        el.dataset.delay = String((i % 4) * 80);
      }
      io.observe(el);
    });

    // Photo reveal — separate observer with gentler threshold
    if (photoWrap) {
      var photoIo = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          photoWrap.classList.add('visible');
          photoIo.disconnect();
        }
      }, { threshold: 0.15 });
      photoIo.observe(photoWrap);
    }
  } else {
    revealItems.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ─────────────────────────────────────────────
     PROJECT CARD CLICKS
  ───────────────────────────────────────────── */
  document.querySelectorAll('.project[data-href]').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      if (typeof Audio !== 'undefined') Audio.glassTap();
    });
    card.addEventListener('click', function () {
      var href = card.dataset.href;
      if (href) window.open(href, '_blank', 'noopener');
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var href = card.dataset.href;
        if (href) window.open(href, '_blank', 'noopener');
      }
    });
  });

  /* ─────────────────────────────────────────────
     SHOW UI
  ───────────────────────────────────────────── */
  document.getElementById('cta')?.classList.add('visible');

  /* ─────────────────────────────────────────────
     SLOW TIER — done
  ───────────────────────────────────────────── */
  if (tier === 'slow') {
    revealItems.forEach(function (el) { el.classList.add('visible'); });
    finishIntro();
    return;
  }

  /* ─────────────────────────────────────────────
     THREE.JS — Letter drop
     window.THREE is loaded via UMD <script> tag
  ───────────────────────────────────────────── */
  var FONT_CDN = 'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json';

  if (typeof THREE === 'undefined') {
    console.warn('THREE not loaded — showing static hero');
    showStaticHero();
  } else {
    fetch(FONT_CDN)
      .then(function (r) { return r.json(); })
      .then(function (fontData) { initLetterDrop(fontData); })
      .catch(function () { showStaticHero(); });
  }

  /* ─────────────────────────────────────────────
     STATIC HERO FALLBACK
  ───────────────────────────────────────────── */
  function showStaticHero() {
    var hero = document.getElementById('hero');
    if (!hero) { finishIntro(); return; }
    var nameEl = document.createElement('div');
    nameEl.setAttribute('aria-hidden', 'true');
    nameEl.style.cssText = [
      'position:absolute',
      'top:50%',
      'left:50%',
      'transform:translate(-50%,-55%)',
      'font-family:"Big Shoulders Display",sans-serif',
      'font-size:clamp(4rem,13vw,12rem)',
      'font-weight:900',
      'text-transform:uppercase',
      'line-height:0.85',
      'color:#f2ece0',
      'text-align:center',
      'letter-spacing:-0.02em',
      'pointer-events:none'
    ].join(';');
    nameEl.innerHTML = 'COVENANT<br>ADEOGO';
    hero.appendChild(nameEl);
    finishIntro();
  }

  /* ─────────────────────────────────────────────
     LETTER DROP ENGINE
  ───────────────────────────────────────────── */
  function initLetterDrop(fontData) {
    var canvas = document.getElementById('three-canvas');
    if (!canvas) { finishIntro(); return; }

    /* Scene */
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
    
    var getCameraZ = function(w, h) {
      var aspect = w / h;
      return aspect < 1.0 ? 20 / aspect * 0.85 : 20;
    };
    camera.position.set(0, 0, getCameraZ(canvas.offsetWidth, canvas.offsetHeight));

    /* Lights */
    scene.add(new THREE.AmbientLight(0xf2ece0, 0.4));
    var key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(2, 5, 8); scene.add(key);
    var rim = new THREE.DirectionalLight(0xffb27a, 0.7); rim.position.set(-6, 1, -4); scene.add(rim);

    window.addEventListener('resize', function () {
      var w = canvas.offsetWidth, h = canvas.offsetHeight;
      camera.aspect = w / h;
      camera.position.z = getCameraZ(w, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    /* Parse font inline (no FontLoader needed — we do it manually) */
    var fontResolution = fontData.resolution || 1000;
    var fontGlyphs = fontData.glyphs;

    function glyphToShapes(char, size) {
      var scale = size / fontResolution;
      var glyph = fontGlyphs[char] || fontGlyphs['?'];
      if (!glyph || !glyph.o) return [];
      var ops = glyph.o.split(' ');
      var path = new THREE.ShapePath();
      var i = 0;
      while (i < ops.length) {
        var op = ops[i++];
        if (op === 'm') { path.moveTo(+ops[i++] * scale, +ops[i++] * scale); }
        else if (op === 'l') { path.lineTo(+ops[i++] * scale, +ops[i++] * scale); }
        else if (op === 'q') { path.quadraticCurveTo(+ops[i++] * scale, +ops[i++] * scale, +ops[i++] * scale, +ops[i++] * scale); }
        else if (op === 'b') { path.bezierCurveTo(+ops[i++] * scale, +ops[i++] * scale, +ops[i++] * scale, +ops[i++] * scale, +ops[i++] * scale, +ops[i++] * scale); }
      }
      return path.toShapes(true);
    }

    function makeLetterMesh(char, size) {
      size = size || 1.9;
      var shapes = glyphToShapes(char, size);
      var geo = new THREE.ExtrudeGeometry(shapes, {
        depth: 0.22,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.03,
        bevelSegments: 4,
        curveSegments: 8
      });
      geo.computeBoundingBox();
      var bb = geo.boundingBox;
      var w = bb.max.x - bb.min.x;
      var cx2 = (bb.max.x + bb.min.x) / 2;
      var cy2 = (bb.max.y + bb.min.y) / 2;
      geo.translate(-cx2, -cy2, 0);
      var mat = new THREE.MeshStandardMaterial({ color: 0xf2ece0, roughness: 0.5, metalness: 0.05 });
      var mesh = new THREE.Mesh(geo, mat);
      return { mesh: mesh, width: w };
    }

    /* Layout */
    var LETTER_SEP = 1.65;
    var FLOOR0 = 0.5;   /* Row 0 floor Y */
    var FLOOR1 = -1.8;  /* Row 1 Y */
    var ROW0 = 'COVENANT';
    var ROW1 = 'ADEOGO';

    var row0X = -(ROW0.length * LETTER_SEP) / 2 + LETTER_SEP / 2;
    var row1X = -(ROW1.length * LETTER_SEP) / 2 + LETTER_SEP / 2;

    var letters0 = [];
    var letters1 = [];
    var settledCount = 0;
    var totalToSettle = ROW0.length + ROW1.length;
    var row1Triggered = false;

    /* Build Row 0 */
    ROW0.split('').forEach(function (char, i) {
      var res = makeLetterMesh(char);
      var mesh = res.mesh;
      mesh.position.set(row0X + i * LETTER_SEP, 16 + Math.random() * 3, 0);
      mesh.rotation.z = (Math.random() - 0.5) * 0.2;
      scene.add(mesh);
      letters0.push({ mesh: mesh, vy: 0, settled: false, startDelay: i * 0.03, elapsed: 0 });
    });

    /* Build Row 1 (hidden until triggered) */
    ROW1.split('').forEach(function (char, i) {
      var res = makeLetterMesh(char, 1.7);
      var mesh = res.mesh;
      mesh.position.set(-30, FLOOR1, 0);
      mesh.visible = false;
      scene.add(mesh);
      letters1.push({
        mesh: mesh, settled: false,
        targetX: row1X + i * LETTER_SEP,
        startDelay: i * 0.015, elapsed: 0
      });
    });

    /* Animation */
    var clock = new THREE.Clock();
    var GRAVITY = -35;
    var RESTITUTION = 0.22;
    var introDone = false;

    var lastScrollY = window.scrollY;
    var scrollVySmoothed = 0;

    (function animate() {
      requestAnimationFrame(animate);
      var dt = Math.min(clock.getDelta(), 0.05);
      if (dt <= 0.0001) dt = 0.001; // Prevent division by zero NaNs

      /* Row 0 — gravity drop */
      letters0.forEach(function (lt) {
        lt.elapsed += dt;
        if (lt.elapsed < lt.startDelay) return;

        if (!lt.settled) {
          lt.vy += GRAVITY * dt;
          lt.mesh.position.y += lt.vy * dt;
          lt.mesh.rotation.z = Math.sin(lt.elapsed * 7 + letters0.indexOf(lt)) * 0.07;

          if (lt.mesh.position.y <= FLOOR0) {
            lt.mesh.position.y = FLOOR0;
            lt.vy = -lt.vy * RESTITUTION;
            if (typeof Audio !== 'undefined') Audio.paperThud();

            if (Math.abs(lt.vy) < 0.8) {
              lt.settled = true;
              lt.mesh.rotation.z = 0;
              settledCount++;

              if (settledCount === ROW0.length && !row1Triggered) {
                row1Triggered = true;
                letters1.forEach(function (l) { l.mesh.visible = true; });
              }
            }
          }
        } else {
          /* decay wobble */
          var age = lt.elapsed - lt.startDelay;
          var w = Math.max(0, 0.03 - age * 0.005);
          lt.mesh.rotation.z = Math.sin(age * 11 + letters0.indexOf(lt)) * w;
        }
      });

      /* Row 1 — slide from left */
      letters1.forEach(function (lt) {
        if (!lt.mesh.visible) return;
        lt.elapsed += dt;
        if (lt.elapsed < lt.startDelay) return;

        if (!lt.settled) {
          var t = Math.min(1, (lt.elapsed - lt.startDelay) / 0.4);
          var ease = 1 - Math.pow(1 - t, 3);
          lt.mesh.position.x = -30 + (lt.targetX + 30) * ease;
          lt.mesh.position.y = FLOOR1;

          if (t >= 1) {
            lt.settled = true;
            lt.mesh.position.x = lt.targetX;
            settledCount++;
            if (typeof Audio !== 'undefined') Audio.paperThud();
          }
        }
      });

      var currentScroll = window.scrollY;
      var rawVy = (currentScroll - lastScrollY) / dt;
      lastScrollY = currentScroll;
      scrollVySmoothed += (rawVy - scrollVySmoothed) * 15 * dt;

      var baseTip = Math.min(currentScroll / 300, Math.PI / 2);
      var tipExaggeration = Math.min(Math.max(scrollVySmoothed * 0.0006, -0.4), 0.6);
      var targetRotX = -(baseTip + tipExaggeration);
      
      if (targetRotX < -Math.PI / 2) targetRotX = -Math.PI / 2;
      if (targetRotX > 0) targetRotX = 0;

      letters0.concat(letters1).forEach(function(lt) {
        if (lt.settled) {
          lt.mesh.rotation.x += (targetRotX - lt.mesh.rotation.x) * 12 * dt;
        }
      });

      if (!introDone && settledCount >= totalToSettle) {
        introDone = true;
        finishIntro();
      }

      renderer.render(scene, camera);
    })();
  }

  /* ─────────────────────────────────────────────
     FINISH INTRO
  ───────────────────────────────────────────── */
  function finishIntro() {
    var tagline = document.getElementById('tagline');
    var scrollCue = document.getElementById('scroll-cue');
    if (tagline) tagline.classList.add('visible');
    if (scrollCue) scrollCue.classList.add('visible');

    if (tier !== 'slow') {
      setTimeout(function () { initTracer(); }, 900);
    }

    /* Start ambient music — fires after intro, on first user interaction */
    if (typeof Audio !== 'undefined' && tier !== 'slow') {
      if (Audio.isArmed && Audio.isArmed()) {
        Audio.startAmbient();
      }
      /* If not yet armed, arm hook in audio.js will start it automatically */
    }
  }

  /* ─────────────────────────────────────────────
     TRACER LOADER
  ───────────────────────────────────────────── */
  function initTracer() {
    /* Skip tracer physics entirely on mobile to save battery and remove distraction */
    if (window.innerWidth <= 600) return;
    
    /* mid tier gets the tracer but no field ring — lighter render */
    setupTracer(tier !== 'mid');
  }

  /* ─────────────────────────────────────────────
     TRACER ENGINE
  ───────────────────────────────────────────── */
  function setupTracer(fancy) {
    var canvas = document.getElementById('ball-canvas');
    if (!canvas) return;

    var W  = window.innerWidth;
    var VH = window.innerHeight;
    canvas.width  = W;
    canvas.height = VH;
    var ctx = canvas.getContext('2d');

    /* ── Physics constants ── */
    var ORB_R       = 11;    // orb visual radius
    var ATTRACT_K   = 0.006; // spring constant toward target
    var DAMPING     = 0.87;  // underdamped — natural oscillation without settling
    var REPEL_R     = 120;   // cursor repulsion radius
    var REPEL_STR   = 0.9;   // repulsion strength
    var FIELD_R     = 76;    // electromagnetic field ring radius
    var BOUNCE_DAMP = 0.55;  // velocity retained on element bounce
    var HEARTBEAT   = 0.045; // keeps it alive when near the target

    /* ── State ── */
    var px   = W / 2;
    var py   = VH * 0.58;  // starts at hero letter floor level
    var vx   = 0.4;        // tiny nudge so it's not dead on spawn
    var vy   = 0;
    var time = 0;
    var currentHue = 42;   // cream-ivory default
    var targetHue  = 42;

    /* ── Cursor tracking (viewport coords) ── */
    var mouseX = -9999, mouseY = -9999;
    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    window.addEventListener('mouseleave', function () {
      mouseX = -9999;
      mouseY = -9999;
    });

    /* ── Target tracking ──
       Every 180ms find the DOM element whose center is
       closest to the viewport center. Cheap, never per-frame. */
    var SELECTORS = [
      '.project', '.capability', '.t-entry',
      '#work h2', '#domain h2', '#timeline h2',
      '.reveal-text', '#tagline'
    ].join(', ');

    var targetEl = null;
    var targetX  = W / 2;
    var targetY  = VH * 0.58;

    /* Adaptive findTarget interval — faster during scroll */
    var isScrolling = false;
    var scrollEndTimer = null;
    window.addEventListener('scroll', function() {
      isScrolling = true;
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(function() { isScrolling = false; }, 150);
    }, { passive: true });

    function findTarget() {
      var vcx = W / 2, vcy = VH / 2;
      var bestDist = Infinity;
      var bestEl   = null;

      document.querySelectorAll(SELECTORS).forEach(function (el) {
        var r = el.getBoundingClientRect();
        /* Only elements at least partially on screen */
        if (r.bottom < 0 || r.top > VH || r.right < 0 || r.left > W) return;
        var dist = Math.hypot(
          (r.left + r.width  / 2) - vcx,
          (r.top  + r.height / 2) - vcy
        );
        if (dist < bestDist) { bestDist = dist; bestEl = el; }
      });

      if (bestEl) targetEl = bestEl;

      /* Schedule next call — 60ms during scroll, 180ms at idle */
      clearTimeout(findTargetTimer);
      findTargetTimer = setTimeout(findTarget, isScrolling ? 60 : 180);
    }

    var findTargetTimer = null;
    findTarget();

    /* ── Hit throttle ── */
    var lastHitTime = 0;

    /* ─────────────────────────────────────────────
       MAIN LOOP
    ───────────────────────────────────────────── */
    (function loop() {
      requestAnimationFrame(loop);
      time += 0.016;
      W  = canvas.width;
      VH = canvas.height;

      /* Refresh target position each frame (moves with scroll) */
      var atDx = 0, atDy = 0;
      if (targetEl) {
        var tr = targetEl.getBoundingClientRect();
        targetX = tr.left + tr.width  / 2;
        targetY = tr.top  + tr.height / 2;
        atDx = targetX - px;
        atDy = targetY - py;
      }

      /* 1 — Spring pull toward target (boost during active scroll) */
      var scrollBoost = Math.min(Math.abs(scrollVySmoothed) * 0.00008, 1.2);
      var effectiveK  = ATTRACT_K * (1 + scrollBoost);
      vx += atDx * effectiveK;
      vy += atDy * effectiveK;

      /* 2 — Cursor repulsion */
      var mDx   = px - mouseX;
      var mDy   = py - mouseY;
      var mDist = Math.hypot(mDx, mDy);
      if (mDist < REPEL_R && mDist > 5) {
        var repF = REPEL_STR * (1 - mDist / REPEL_R) / mDist;
        vx += mDx * repF;
        vy += mDy * repF;
      }

      /* 3 — Heartbeat: sinusoidal nudge — never fully settles */
      vx += Math.sin(time * 2.1 + 0.7) * HEARTBEAT;
      vy += Math.cos(time * 1.6 + 1.3) * HEARTBEAT;

      /* 4 — Damping */
      vx *= DAMPING;
      vy *= DAMPING;

      /* 5 — Integrate */
      px += vx;
      py += vy;

      /* 6 — Element AABB collisions */
      var now = Date.now();
      document.querySelectorAll(SELECTORS).forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;

        var L = r.left   - ORB_R;
        var R = r.right  + ORB_R;
        var T = r.top    - ORB_R;
        var B = r.bottom + ORB_R;

        if (px < L || px > R || py < T || py > B) return;

        /* Push out via smallest overlap */
        var oL = px - L, oR = R - px, oT = py - T, oB = B - py;
        var min = Math.min(oL, oR, oT, oB);
        if      (min === oL) { vx =  Math.abs(vx) * BOUNCE_DAMP; px = L + 1; }
        else if (min === oR) { vx = -Math.abs(vx) * BOUNCE_DAMP; px = R - 1; }
        else if (min === oT) { 
          vy =  Math.abs(vy) * BOUNCE_DAMP; 
          py = T + 1; 
          /* Slide off the sides instead of resting perfectly on top.
             More aggressive slip if squished near the top of the viewport. */
          var slip = (py < VH * 0.25) ? 1.5 : 0.4;
          if (px < (L + R) / 2) vx -= slip;
          else                  vx += slip;
        }
        else                 { vy = -Math.abs(vy) * BOUNCE_DAMP; py = B - 1; }

        /* Hit flash + sound — throttled to 100ms */
        if (now - lastHitTime > 100) {
          lastHitTime = now;
          targetHue = Math.floor(Math.random() * 360); // Random color on hit
          
          el.classList.add('ball-hit');
          clearTimeout(el._bhTimer);
          el._bhTimer = setTimeout(function () { el.classList.remove('ball-hit'); }, 360);
          if (typeof Audio !== 'undefined') {
            if (el.classList.contains('project')) Audio.glassTap  && Audio.glassTap();
            else                                  Audio.paperThud && Audio.paperThud();
          }
        }
      });

      /* 7 — Soft viewport boundary — wider margin so ball drifts back early */
      var M = ORB_R + Math.round(VH * 0.18);
      if (px < M)      vx += (M - px) * 0.3;
      if (px > W - M)  vx -= (px - (W - M)) * 0.3;
      if (py < M)      vy += (M - py) * 0.3;
      if (py > VH - M) vy -= (py - (VH - M)) * 0.3;

      /* 8 — Ambient music proximity: full volume near elements, dim when floating */
      if (typeof Audio !== 'undefined') {
        var PROX_R = 180;
        var ballNearEl = false;
        document.querySelectorAll(SELECTORS).forEach(function (el) {
          if (ballNearEl) return;
          var r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > VH) return;
          var elCx = r.left + r.width  / 2;
          var elCy = r.top  + r.height / 2;
          if (Math.hypot(px - elCx, py - elCy) < PROX_R) ballNearEl = true;
        });
        Audio.setAmbientLevel(ballNearEl ? 'full' : 'dim');
      }

      /* ─── DRAW ─── */
      ctx.clearRect(0, 0, W, VH);

      /* Update Hue */
      currentHue += (targetHue - currentHue) * 0.08;
      var h = Math.round(currentHue);
      var baseColor = 'hsl(' + h + ', 36%, 91%)';
      var edgeColor = 'hsla(' + (h - 12) + ', 22%, 49%, 0.85)';
      var glowColor = 'hsla(' + h + ', 36%, 91%, '; // Needs alpha appended

      var speed    = Math.hypot(vx, vy);
      var toTarget = Math.hypot(atDx, atDy);

      /* A — Electromagnetic field ring */
      if (fancy) {
        var pulse  = 1 + Math.sin(time * 2.8) * 0.06;
        var fR     = FIELD_R * pulse;
        var fieldG = ctx.createRadialGradient(px, py, ORB_R + 2, px, py, fR);
        fieldG.addColorStop(0,   glowColor + '0.08)');
        fieldG.addColorStop(0.5, glowColor + '0.03)');
        fieldG.addColorStop(1,   glowColor + '0)');
        ctx.beginPath();
        ctx.arc(px, py, fR, 0, Math.PI * 2);
        ctx.fillStyle = fieldG;
        ctx.fill();

        /* B — Faint dashed tether toward target (only when far) */
        if (toTarget > 70) {
          var tAlpha = Math.min(0.09, (toTarget - 70) / 280);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + atDx * 0.22, py + atDy * 0.22);
          ctx.strokeStyle = glowColor + tAlpha + ')';
          ctx.lineWidth   = 0.8;
          ctx.setLineDash([3, 7]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      /* C — Motion streak */
      if (speed > 1.2) {
        var sAlpha = Math.min(0.12, speed * 0.009);
        var streak = ctx.createLinearGradient(
          px - vx * 6, py - vy * 6, px, py
        );
        streak.addColorStop(0, glowColor + '0)');
        streak.addColorStop(1, glowColor + sAlpha + ')');
        ctx.beginPath();
        ctx.moveTo(px - vx * 6, py - vy * 6);
        ctx.lineTo(px, py);
        ctx.strokeStyle = streak;
        ctx.lineWidth   = ORB_R * 1.6;
        ctx.lineCap     = 'round';
        ctx.stroke();
      }

      /* D — Orb body */
      var orbG = ctx.createRadialGradient(
        px - ORB_R * 0.3, py - ORB_R * 0.3, ORB_R * 0.05,
        px, py, ORB_R
      );
      orbG.addColorStop(0,   '#ffffff');
      orbG.addColorStop(0.4, baseColor);
      orbG.addColorStop(1,   edgeColor);
      ctx.beginPath();
      ctx.arc(px, py, ORB_R, 0, Math.PI * 2);
      ctx.fillStyle = orbG;
      ctx.fill();

      /* E — Inner specular highlight */
      ctx.beginPath();
      ctx.arc(px - ORB_R * 0.28, py - ORB_R * 0.28, ORB_R * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fill();

    })();

    setTimeout(function () { canvas.classList.add('live'); }, 400);

    window.addEventListener('pagehide', function () { clearTimeout(findTargetTimer); });
  }

  /* ─────────────────────────────────────────────
     SOUND TOGGLE BUTTON
  ───────────────────────────────────────────── */
  var soundToggleBtn = document.getElementById('sound-toggle');
  if (soundToggleBtn && typeof Audio !== 'undefined') {
    soundToggleBtn.addEventListener('click', function () {
      var nowMuted = !Audio.isMuted();
      Audio.setMuted(nowMuted);
      soundToggleBtn.classList.toggle('muted', nowMuted);
      soundToggleBtn.setAttribute('aria-label', nowMuted ? 'Enable ambient sound' : 'Mute ambient sound');
    });
  }

  /* ─────────────────────────────────────────────
     MOBILE DOT NAV HAMBURGER
  ───────────────────────────────────────────── */
  var siteNav = document.getElementById('site-nav');
  if (siteNav) {
    siteNav.addEventListener('click', function (e) {
      if (window.innerWidth <= 900) {
        if (!siteNav.classList.contains('open')) {
          e.preventDefault();
          siteNav.classList.add('open');
          document.body.classList.add('nav-open');
        } else {
          if (e.target.tagName.toLowerCase() === 'a') {
            siteNav.classList.remove('open');
            document.body.classList.remove('nav-open');
          }
        }
      }
    });

    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 900 && siteNav.classList.contains('open') && !siteNav.contains(e.target)) {
        siteNav.classList.remove('open');
        document.body.classList.remove('nav-open');
      }
    });
  }

})();