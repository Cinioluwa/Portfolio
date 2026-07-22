/* =============================================================
   audio.js — WebAudio synthesis
   Ambient drone · Paper thud · Glass tap
   ============================================================= */
const Audio = (() => {
  let ctx = null, armed = false, muted = false;

  /* ── Ambient drone nodes ── */
  let masterGain  = null;  // master fader for all ambient
  let droneNodes  = [];    // oscillators + noise source
  let lfoNode     = null;  // slow volume LFO
  let ambientLive = false;
  let lastLevel   = null;  // 'full' | 'dim' — avoids rescheduling every frame

  /* Volume levels */
  const VOL_FULL  = 1.0;   // ball near elements
  const VOL_DIM   = 0.25;  // ball floating freely
  const RAMP_UP   = 1.5;   // seconds to fade to FULL
  const RAMP_DOWN = 2.5;   // seconds to fade to DIM
  const BASE_GAIN = 0.014; // master ceiling — keep it whisper quiet

  function ensureCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const arm = () => {
    if (armed) return;
    ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    armed = true;
    document.removeEventListener('pointerdown', arm);
    document.removeEventListener('keydown', arm);
    /* Auto-start ambient on first interaction */
    startAmbient();
  };

  document.addEventListener('pointerdown', arm, { once: true });
  document.addEventListener('keydown',     arm, { once: true });

  /* ── Utility: filtered noise ── */
  function makeNoiseSource() {
    const bufLen = ctx.sampleRate * 3; // 3s loop
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const src    = ctx.createBufferSource();
    src.buffer   = buf;
    src.loop     = true;
    return src;
  }

  /* ── Ambient drone ── */
  function startAmbient() {
    if (!armed || muted || !ctx || ambientLive) return;

    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);

    /* Layer 1: sub-bass drone, sine, 55Hz */
    const drone1  = ctx.createOscillator();
    drone1.type   = 'sine';
    drone1.frequency.value = 55;
    const g1      = ctx.createGain(); g1.gain.value = 0.55;
    drone1.connect(g1); g1.connect(masterGain);
    drone1.start();

    /* Layer 2: soft mid drone, triangle, 110Hz */
    const drone2  = ctx.createOscillator();
    drone2.type   = 'triangle';
    drone2.frequency.value = 110;
    const g2      = ctx.createGain(); g2.gain.value = 0.28;
    drone2.connect(g2); g2.connect(masterGain);
    drone2.start();

    /* Layer 3: narrow bandpass noise "breath", centred at ~420Hz */
    const noise   = makeNoiseSource();
    const bp      = ctx.createBiquadFilter();
    bp.type       = 'bandpass';
    bp.frequency.value = 420;
    bp.Q.value    = 2.8;
    const g3      = ctx.createGain(); g3.gain.value = 0.18;
    noise.connect(bp); bp.connect(g3); g3.connect(masterGain);
    noise.start();

    /* LFO: 0.075Hz — one breathe every ~13s, ±25% of master */
    lfoNode       = ctx.createOscillator();
    lfoNode.type  = 'sine';
    lfoNode.frequency.value = 0.075;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = BASE_GAIN * 0.25;
    lfoNode.connect(lfoGain); lfoGain.connect(masterGain.gain);
    lfoNode.start();

    droneNodes = [drone1, drone2, noise, lfoNode];
    ambientLive = true;

    /* Fade in gently over 2s */
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(BASE_GAIN * VOL_FULL, ctx.currentTime + 2.0);
    lastLevel = 'full';
  }

  function stopAmbient() {
    if (!masterGain || !ctx) return;
    const fadeTime = 1.2;
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeTime);
    setTimeout(() => {
      droneNodes.forEach(n => { try { n.stop(); } catch(e){} });
      droneNodes  = [];
      lfoNode     = null;
      masterGain  = null;
      ambientLive = false;
    }, (fadeTime + 0.15) * 1000);
  }

  /**
   * setAmbientLevel — called every frame from script.js
   * level: 'full' | 'dim'
   */
  function setAmbientLevel(level) {
    if (!masterGain || !ctx || muted) return;
    if (level === lastLevel) return; // no change — don't reschedule
    lastLevel = level;
    try {
      const target  = level === 'full' ? BASE_GAIN * VOL_FULL : BASE_GAIN * VOL_DIM;
      const rampSec = level === 'full' ? RAMP_UP : RAMP_DOWN;
      /* cancelScheduledValues is universally supported; snapshot current value first */
      const now = ctx.currentTime;
      const current = masterGain.gain.value;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(current, now);
      masterGain.gain.linearRampToValueAtTime(target, now + rampSec);
    } catch (e) { /* never let audio errors kill the RAF loop */ }
  }

  /* ── One-shot SFX ── */
  function noise_sfx(dur, freq, Q, vol, delayMs = 0) {
    if (!armed || muted || !ctx) return;
    setTimeout(() => {
      const len = Math.ceil(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const bp  = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = Q;
      const g   = ctx.createGain();
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      src.connect(bp); bp.connect(g); g.connect(ctx.destination);
      src.start();
    }, delayMs);
  }

  function tone(freq, dur, vol, type = 'sine', delayMs = 0) {
    if (!armed || muted || !ctx) return;
    setTimeout(() => {
      const osc = ctx.createOscillator(); osc.type = type; osc.frequency.value = freq;
      const g   = ctx.createGain();
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + dur);
    }, delayMs);
  }

  return {
    /** Soft paper thud when letter hits the floor */
    paperThud() {
      tone(55, 0.18, 0.09);
      noise_sfx(0.06, 900, 0.8, 0.04, 5);
    },

    /** Glass tap on project card hover */
    glassTap() {
      tone(1100, 0.035, 0.018);
      tone(1800, 0.02, 0.008, 'sine', 8);
    },

    /** Ambient drone control */
    startAmbient,
    stopAmbient,
    setAmbientLevel,

    setMuted(v) {
      muted = !!v;
      if (muted) {
        stopAmbient();
      } else if (armed) {
        startAmbient();
      }
    },
    isMuted() { return muted; },
    isArmed()  { return armed; },
    arm,
  };
})();
