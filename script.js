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
    card.addEventListener('mouseenter', function () {});
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
      setTimeout(function () { initGuide(); }, 900);
      setTimeout(function () { initTracer(); }, 1100);
    }
  }

  /* ─────────────────────────────────────────────
     SECTION GUIDE LOADER
  ───────────────────────────────────────────── */
  function initGuide() {
    if (window.innerWidth <= 600) return;
    setupGuide();
  }

  /* ─────────────────────────────────────────────
     SECTION GUIDE ENGINE
  ───────────────────────────────────────────── */
  var guideScene, guideCamera, guideRenderer, guideMesh;
  var targetGuideRotX = 0, targetGuideRotY = 0;
  var guideGeometries = null;

  function init3DGuide() {
    var canvas = document.getElementById('guide-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    guideScene = new THREE.Scene();
    guideCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    guideCamera.position.z = 4.5;

    guideRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    guideRenderer.setSize(60, 60);
    guideRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var light = new THREE.PointLight(0xffffff, 1.5);
    light.position.set(5, 5, 5);
    guideScene.add(light);
    var ambLight = new THREE.AmbientLight(0xffffff, 0.4);
    guideScene.add(ambLight);

    var material = new THREE.MeshStandardMaterial({
      color: 0xf2ece0,
      roughness: 0.2,
      metalness: 0.8
    });

    guideGeometries = {
      'hero': new THREE.SphereGeometry(1.2, 32, 32),
      'work': new THREE.BoxGeometry(1.5, 1.5, 1.5),
      'domain': new THREE.TorusGeometry(0.8, 0.4, 32, 32),
      'timeline': new THREE.ConeGeometry(1.2, 1.8, 4),
      'reveal': new THREE.IcosahedronGeometry(1.2, 0)
    };

    guideMesh = new THREE.Mesh(guideGeometries['hero'], material);
    guideScene.add(guideMesh);

    window.addEventListener('mousemove', function(e) {
      var x = (e.clientX / window.innerWidth) * 2 - 1;
      var y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetGuideRotX = y * 0.8;
      targetGuideRotY = x * 0.8;
    });

    var clock = new THREE.Clock();
    function animateGuide() {
      requestAnimationFrame(animateGuide);
      var dt = clock.getDelta();
      var t = clock.getElapsedTime();
      
      if (guideMesh) {
        guideMesh.rotation.x += (targetGuideRotX + Math.sin(t) * 0.2 - guideMesh.rotation.x) * 5 * dt;
        guideMesh.rotation.y += (targetGuideRotY + t * 0.5 - guideMesh.rotation.y) * 5 * dt;
        guideMesh.scale.lerp(new THREE.Vector3(1, 1, 1), 8 * dt);
      }
      guideRenderer.render(guideScene, guideCamera);
    }
    animateGuide();
  }

  function setupGuide() {
    init3DGuide();
    
    var guideEl = document.getElementById('section-guide');
    var tooltipEl = document.getElementById('guide-tooltip');
    var iconContainerEl = document.getElementById('guide-icon-container');
    var spotlightEl = document.getElementById('spotlight-overlay');
    if (!guideEl || !tooltipEl || !iconContainerEl) return;

    var sections = [
      { id: 'hero',     text: 'Welcome. I rotate. I judge. I am the most consistent thing on this page.' },
      { id: 'work',     text: 'The Work. Shipped. Deployed. Trusted by actual organizations. Geometry approved.' },
      { id: 'domain',   text: 'The Domain. Tools used in production — not just listed on a résumé.' },
      { id: 'timeline', text: 'The Timeline. A documented pattern of showing up and doing things.' },
      { id: 'reveal',   text: 'The Reveal. One developer. Whole product, ground up. No outsourcing. No raccoons.' }
    ];

    var currentSection = '';
    var spotlightTimer = null;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          if (id !== currentSection) {
            currentSection = id;
            var secData = sections.find(function(s) { return s.id === id; });
            if (secData) {
              /* Animate tooltip out */
              tooltipEl.classList.remove('show');
              
              /* Spotlight Effect */
              if (spotlightEl && id !== 'hero') {
                var r = entry.target.getBoundingClientRect();
                var cx = r.left + r.width / 2;
                var cy = r.top + r.height / 2;
                var px = (cx / window.innerWidth) * 100;
                var py = (cy / window.innerHeight) * 100;
                spotlightEl.style.background = 'radial-gradient(circle at ' + px + '% ' + py + '%, transparent 5%, rgba(6, 6, 6, 0.95) 60%)';
                spotlightEl.classList.add('active');
                
                clearTimeout(spotlightTimer);
                spotlightTimer = setTimeout(function() {
                  spotlightEl.classList.remove('active');
                }, 100); // Spotlight duration
              }

              setTimeout(function() {
                /* Update content */
                tooltipEl.textContent = secData.text;
                
                /* Update 3D Geometry */
                if (guideMesh && guideGeometries[id]) {
                  guideMesh.geometry = guideGeometries[id];
                  guideMesh.scale.set(1.4, 1.4, 1.4); // Pop effect
                }
                
                /* Animate container pop */
                iconContainerEl.classList.add('pop');
                setTimeout(function() { iconContainerEl.classList.remove('pop'); }, 400);

                /* Animate tooltip in */
                tooltipEl.classList.add('show');
              }, 400);
            }
          }
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(function(sec) {
      var el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    guideEl.classList.add('visible');
  }

  /* ─────────────────────────────────────────────
     TRACER — electromagnetic orb that seeks the
     nearest DOM element. Never settles: underdamped
     spring + heartbeat nudge + cursor repulsion.
  ───────────────────────────────────────────── */
  function initTracer() {
    if (window.innerWidth <= 600) return;
    setupTracer(tier !== 'mid');
  }

  function setupTracer(fancy) {
    var canvas = document.getElementById('ball-canvas');
    if (!canvas) return;

    var W  = window.innerWidth;
    var VH = window.innerHeight;
    canvas.width  = W;
    canvas.height = VH;
    var ctx = canvas.getContext('2d');

    /* ── Physics constants ── */
    var ORB_R            = 11;
    var ATTRACT_K        = 0.004;
    var MAX_FORCE        = 0.14;
    var MAX_SPEED        = 5.5;
    var DAMPING          = 0.88;
    var CURSOR_REPEL_R   = 120;
    var CURSOR_REPEL_STR = 0.85;
    var EL_REPEL_ZONE    = ORB_R + 22;
    var EL_REPEL_STR     = 0.32;
    var FIELD_R          = 76;
    var HEARTBEAT        = 0.038;
    var TARGET_LERP      = 0.032;

    /* ── State ── */
    var px = W / 2, py = VH * 0.58, vx = 0.4, vy = 0, time = 0;
    var smoothX = px, smoothY = py, targetX = px, targetY = py;

    /* ── Morph state ──
       morphAlpha: 0 = full orb, 1 = full symbol
       morphSym:   string currently displayed
       morphPhase: 'near' | 'hit' | null             */
    var morphAlpha = 0;
    var morphSym   = null;
    var morphPhase = null;

    /* Symbol map — what the orb becomes near each element type */
    var MORPH = {
      'project':    { near: '>_',  hit: '< >' },
      'capability': { near: '?',   hit: '!'   },
      't-entry':    { near: '◦',   hit: '↗'   },
      'h2':         { near: '//',  hit: '#'   },
      'reveal':     { near: '…',   hit: '★'   },
      'tagline':    { near: '~',   hit: '→'   }
    };

    function elType(el) {
      if (!el) return null;
      var cls = (typeof el.className === 'string') ? el.className : '';
      var tag = (el.tagName || '').toLowerCase();
      if (cls.indexOf('project')    >= 0) return 'project';
      if (cls.indexOf('capability') >= 0) return 'capability';
      if (cls.indexOf('t-entry')    >= 0) return 't-entry';
      if (tag === 'h2')                   return 'h2';
      if (cls.indexOf('reveal')     >= 0) return 'reveal';
      if (el.id === 'tagline')            return 'tagline';
      return null;
    }

    /* Cursor */
    var mouseX = -9999, mouseY = -9999;
    window.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });
    window.addEventListener('mouseleave', function () { mouseX = -9999; mouseY = -9999; });

    var SELECTORS = [
      '.project', '.capability', '.t-entry',
      '#work h2', '#domain h2', '#timeline h2',
      '.reveal-text', '#tagline'
    ].join(', ');

    var targetEl = null;

    function findTarget() {
      var vcx = W / 2, vcy = VH / 2;
      var bestScore = Infinity, bestEl = null;
      document.querySelectorAll(SELECTORS).forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > VH || r.right < 0 || r.left > W) return;
        var ecx = r.left + r.width / 2, ecy = r.top + r.height / 2;
        var score = Math.hypot(ecx - vcx, ecy - vcy) * 0.65
                  + Math.hypot(ecx - px,  ecy - py)  * 0.35;
        if (score < bestScore) { bestScore = score; bestEl = el; }
      });
      if (bestEl) targetEl = bestEl;
    }

    findTarget();
    var targetInterval = setInterval(findTarget, 180);
    var lastHitTime = 0;

    (function loop() {
      requestAnimationFrame(loop);
      time += 0.016;
      W = canvas.width; VH = canvas.height;

      /* Real target → smooth target → spring */
      if (targetEl) {
        var tr = targetEl.getBoundingClientRect();
        targetX = tr.left + tr.width  / 2;
        targetY = tr.top  + tr.height / 2;
      }
      smoothX += (targetX - smoothX) * TARGET_LERP;
      smoothY += (targetY - smoothY) * TARGET_LERP;

      var atDx = smoothX - px, atDy = smoothY - py;
      var fRaw = Math.hypot(atDx, atDy) * ATTRACT_K;
      var fLen = Math.hypot(atDx, atDy) || 1;
      var fCap = Math.min(fRaw, MAX_FORCE);
      vx += (atDx / fLen) * fCap;
      vy += (atDy / fLen) * fCap;

      /* Center gravity, cursor repulsion, heartbeat */
      vx += (W / 2 - px) * 0.00035;
      var mDx = px - mouseX, mDy = py - mouseY, mDist = Math.hypot(mDx, mDy);
      if (mDist < CURSOR_REPEL_R && mDist > 5) {
        var repF = CURSOR_REPEL_STR * (1 - mDist / CURSOR_REPEL_R) / mDist;
        vx += mDx * repF; vy += mDy * repF;
      }
      vx += Math.sin(time * 2.1 + 0.7) * HEARTBEAT;
      vy += Math.cos(time * 1.6 + 1.3) * HEARTBEAT;

      vx *= DAMPING; vy *= DAMPING;
      var spd = Math.hypot(vx, vy);
      if (spd > MAX_SPEED) { vx = vx / spd * MAX_SPEED; vy = vy / spd * MAX_SPEED; }
      px += vx; py += vy;

      /* Element repulsion + morph tracking */
      var now = Date.now();
      var nearestEl = null, nearestDist = Infinity, nearestPhase = null;

      document.querySelectorAll(SELECTORS).forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        var cx = Math.max(r.left, Math.min(px, r.right));
        var cy = Math.max(r.top,  Math.min(py, r.bottom));
        var dx = px - cx, dy = py - cy;
        var dist = Math.hypot(dx, dy);

        /* Soft repulsion push */
        if (dist < EL_REPEL_ZONE && dist > 0.5) {
          var str = EL_REPEL_STR * (1 - dist / EL_REPEL_ZONE);
          vx += (dx / dist) * str;
          vy += (dy / dist) * str;
        }

        /* Track nearest for morph */
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestEl   = el;
          nearestPhase = (dist < ORB_R + 8) ? 'hit' : 'near';
        }

        /* Hit flash */
        if (dist < ORB_R + 6 && now - lastHitTime > 120) {
          lastHitTime = now;
          el.classList.add('ball-hit');
          clearTimeout(el._bhTimer);
          el._bhTimer = setTimeout(function () { el.classList.remove('ball-hit'); }, 360);
          if (typeof Audio !== 'undefined') {
            if (el.classList.contains('project')) Audio.glassTap  && Audio.glassTap();
            else                                  Audio.paperThud && Audio.paperThud();
          }
        }
      });

      /* Resolve morph target symbol */
      var type = elType(nearestEl);
      var targetSym   = null;
      var targetAlpha = 0;
      if (type && nearestDist < EL_REPEL_ZONE * 1.5) {
        var entry = MORPH[type];
        if (entry) {
          targetSym   = nearestPhase === 'hit' ? entry.hit : entry.near;
          targetAlpha = nearestPhase === 'hit' ? 1 : 0.72;
        }
      }

      /* Update morph symbol and smooth alpha transition */
      if (targetSym) {
        morphSym = targetSym;
      }
      morphAlpha += (targetAlpha - morphAlpha) * 0.1;

      /* Viewport boundary */
      var MG = ORB_R + 6;
      if (px < MG)      vx += (MG - px) * 0.25;
      if (px > W - MG)  vx -= (px - (W - MG)) * 0.25;
      if (py < MG)      vy += (MG - py) * 0.25;
      if (py > VH - MG) vy -= (py - (VH - MG)) * 0.25;

      /* ── Draw ── */
      ctx.clearRect(0, 0, W, VH);
      var speed    = Math.hypot(vx, vy);
      var toTarget = Math.hypot(smoothX - px, smoothY - py);

      /* Field ring — pulses faster near hit, tints subtly by type */
      if (fancy) {
        var pulse  = 1 + Math.sin(time * (2.8 + morphAlpha * 1.4)) * (0.06 + morphAlpha * 0.04);
        var fR     = FIELD_R * pulse;
        var fieldG = ctx.createRadialGradient(px, py, ORB_R + 2, px, py, fR);
        fieldG.addColorStop(0,   'rgba(242,236,224,' + (0.08 + morphAlpha * 0.05) + ')');
        fieldG.addColorStop(0.5, 'rgba(242,236,224,0.03)');
        fieldG.addColorStop(1,   'rgba(242,236,224,0)');
        ctx.beginPath(); ctx.arc(px, py, fR, 0, Math.PI * 2);
        ctx.fillStyle = fieldG; ctx.fill();

        if (toTarget > 70) {
          var tA = Math.min(0.09, (toTarget - 70) / 280);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + (smoothX - px) * 0.22, py + (smoothY - py) * 0.22);
          ctx.strokeStyle = 'rgba(242,236,224,' + tA + ')';
          ctx.lineWidth = 0.8; ctx.setLineDash([3, 7]); ctx.stroke(); ctx.setLineDash([]);
        }
      }

      /* Motion streak */
      if (speed > 1.2) {
        var sA = Math.min(0.12, speed * 0.009);
        var streak = ctx.createLinearGradient(px - vx * 6, py - vy * 6, px, py);
        streak.addColorStop(0, 'rgba(242,236,224,0)');
        streak.addColorStop(1, 'rgba(242,236,224,' + sA + ')');
        ctx.beginPath();
        ctx.moveTo(px - vx * 6, py - vy * 6); ctx.lineTo(px, py);
        ctx.strokeStyle = streak; ctx.lineWidth = ORB_R * 1.6; ctx.lineCap = 'round'; ctx.stroke();
      }

      /* Orb body — fades out as symbol fades in */
      var orbAlpha = 1 - morphAlpha;
      if (orbAlpha > 0.02) {
        ctx.globalAlpha = orbAlpha;
        var orbG = ctx.createRadialGradient(
          px - ORB_R * 0.3, py - ORB_R * 0.3, ORB_R * 0.05, px, py, ORB_R
        );
        orbG.addColorStop(0,   '#ffffff');
        orbG.addColorStop(0.4, '#f2ece0');
        orbG.addColorStop(1,   'rgba(154,126,98,0.85)');
        ctx.beginPath(); ctx.arc(px, py, ORB_R, 0, Math.PI * 2);
        ctx.fillStyle = orbG; ctx.fill();

        /* Specular — fades with orb */
        ctx.beginPath();
        ctx.arc(px - ORB_R * 0.28, py - ORB_R * 0.28, ORB_R * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fill();
        ctx.globalAlpha = 1;
      }

      /* Symbol — fades in as orb fades out */
      if (morphAlpha > 0.04 && morphSym) {
        ctx.globalAlpha = morphAlpha;
        var fontSize = nearestPhase === 'hit' ? 15 : 12;
        ctx.font      = 'bold ' + fontSize + 'px "JetBrains Mono", monospace';
        ctx.fillStyle = '#f2ece0';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        /* Subtle scale pulse on hit */
        if (nearestPhase === 'hit') {
          var sc = 1 + Math.sin(time * 8) * 0.06;
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(sc, sc);
          ctx.fillText(morphSym, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(morphSym, px, py);
        }
        ctx.globalAlpha = 1;
      }

    })();

    setTimeout(function () { canvas.classList.add('live'); }, 400);
    window.addEventListener('pagehide', function () { clearInterval(targetInterval); });
  }

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