(function (window) {
  'use strict';

  let ctx = null;
  let isMuted = localStorage.getItem('veritai-sound') === 'muted';

  function getAudioContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.12, decay = 0.12) {
    if (isMuted) return;
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  const SoundFX = {
    isMuted: () => isMuted,

    toggleMute: () => {
      isMuted = !isMuted;
      localStorage.setItem('veritai-sound', isMuted ? 'muted' : 'enabled');
      if (!isMuted) {
        SoundFX.playClick();
      }
      return isMuted;
    },

    playClick: () => {
      if (isMuted) return;
      playTone(720, 'sine', 0.05, 0.08);
    },

    playScan: () => {
      if (isMuted) return;
      try {
        const audioCtx = getAudioContext();
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, audioCtx.currentTime + 0.45);

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {}
    },

    playResult: (score) => {
      if (isMuted) return;
      try {
        const audioCtx = getAudioContext();
        if (!audioCtx) return;

        if (score < 35) {
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, idx) => {
            setTimeout(() => {
              playTone(freq, 'sine', 0.38, 0.10);
            }, idx * 75);
          });
        } else if (score < 60) {
          playTone(440, 'triangle', 0.22, 0.10);
          setTimeout(() => {
            playTone(554.37, 'sine', 0.32, 0.10);
          }, 90);
        } else {
          playTone(493.88, 'sawtooth', 0.18, 0.07);
          setTimeout(() => {
            playTone(392.00, 'sawtooth', 0.25, 0.08);
          }, 110);
          setTimeout(() => {
            playTone(329.63, 'sine', 0.40, 0.10);
          }, 220);
        }
      } catch (e) {}
    },

    playCopy: () => {
      if (isMuted) return;
      playTone(660, 'sine', 0.08, 0.09);
      setTimeout(() => playTone(880, 'sine', 0.14, 0.09), 60);
    },

    playMagic: () => {
      if (isMuted) return;
      const notes = [587.33, 659.25, 880.00, 1174.66, 1318.51];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playTone(freq, 'sine', 0.22, 0.08);
        }, idx * 55);
      });
    }
  };

  window.SoundFX = SoundFX;

})(window);
