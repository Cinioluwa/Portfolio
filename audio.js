/* =============================================================
   audio.js — WebAudio synthesis
   Paper thud · Glass tap · Ball roll hum
   ============================================================= */
const Audio = (() => {
  let ctx = null, armed = false, muted = false;
  let humNode = null, humGain = null;

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
  };

  document.addEventListener('pointerdown', arm, { once: true });
  document.addEventListener('keydown', arm, { once: true });

  function noise(dur, freq, Q, vol, delayMs = 0) {
    if (!armed || muted || !ctx) return;
    setTimeout(() => {
      const len = Math.ceil(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = Q;
      const g = ctx.createGain();
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
      const g = ctx.createGain();
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
      noise(0.06, 900, 0.8, 0.04, 5);
    },

    /** Glass tap on project card hover */
    glassTap() {
      tone(1100, 0.035, 0.018);
      tone(1800, 0.02, 0.008, 'sine', 8);
    },

    /** Ball rolling — low continuous hum, starts and fades */
    startRoll() {
      if (!armed || muted || !ctx) return;
      if (humNode) { try { humNode.stop(); } catch(e){} }
      ensureCtx();
      humNode = ctx.createOscillator();
      humNode.type = 'sawtooth';
      humNode.frequency.value = 38;
      humGain = ctx.createGain();
      humGain.gain.setValueAtTime(0, ctx.currentTime);
      humGain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.4);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
      humNode.connect(lp); lp.connect(humGain); humGain.connect(ctx.destination);
      humNode.start();
    },

    stopRoll() {
      if (!humGain || !ctx) return;
      humGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      const n = humNode; setTimeout(() => { try { n.stop(); } catch(e){} }, 600);
      humNode = null; humGain = null;
    },

    setMuted(v) { muted = !!v; if (muted) this.stopRoll(); },
    isMuted() { return muted },
    arm,
  };
})();
