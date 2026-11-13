export type MusicMood = 'midnight' | 'mystery' | 'sunrise';

// D Harmonic Minor & eerie gothic progressions (frequencies in Hz)
const MELODY_MIDNIGHT = [
  293.66, // D4
  349.23, // F4
  440.0,  // A4
  466.16, // Bb4
  554.37, // C#5
  440.0,  // A4
  329.63, // E4
  293.66, // D4
  349.23, // F4
  415.3,  // G#4 (eerie augmented step)
  440.0,  // A4
  0,      // breath / rest
  587.33, // D5
  554.37, // C#5
  440.0,  // A4
  349.23, // F4
];

const MELODY_MYSTERY = [
  293.66, // D4
  415.3,  // G#4
  440.0,  // A4
  554.37, // C#5
  0,      // eerie silence
  466.16, // Bb4
  415.3,  // G#4
  349.23, // F4
  277.18, // C#4
  293.66, // D4
  0,
  659.25, // E5 (distant chime)
];

const MELODY_SUNRISE = [
  293.66, // D4
  369.99, // F#4
  440.0,  // A4
  493.88, // B4
  587.33, // D5
  440.0,  // A4
  369.99, // F#4
  329.63, // E4
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled = true;
  private musicEnabled = true;
  private musicPlaying = false;
  private musicMood: MusicMood = 'midnight';

  private masterMusicGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private padOscs: OscillatorNode[] = [];
  private lfoOsc: OscillatorNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private melodyTimer: number | null = null;
  private noteIndex = 0;

  setEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  setMusicMood(mood: MusicMood) {
    if (this.musicMood === mood) return;
    this.musicMood = mood;
    this.noteIndex = 0;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  startMusic() {
    if (!this.musicEnabled || this.musicPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.musicPlaying = true;
    const now = ctx.currentTime;

    // Master music gain with gentle fade-in
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.45, now + 2.2);
    master.connect(ctx.destination);
    this.masterMusicGain = master;

    // Warm low-pass filter for gothic velvet drone pad
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(340, now);
    padFilter.Q.setValueAtTime(0.9, now);

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.085, now);
    padFilter.connect(padGain);
    padGain.connect(master);

    // Slow breathing LFO modulating filter cutoff
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, now);
    lfoGain.gain.setValueAtTime(110, now);
    lfo.connect(lfoGain);
    lfoGain.connect(padFilter.frequency);
    lfo.start(now);
    this.lfoOsc = lfo;

    // Deep D-minor gothic pad voices (D2, A2, F3 slightly detuned)
    const padFreqs = [
      { freq: 73.42, type: 'triangle' as OscillatorType, detune: -4 },
      { freq: 110.0, type: 'sine' as OscillatorType, detune: 5 },
      { freq: 174.61, type: 'sine' as OscillatorType, detune: -3 },
    ];
    this.padOscs = padFreqs.map((cfg) => {
      const osc = ctx.createOscillator();
      osc.type = cfg.type;
      osc.frequency.setValueAtTime(cfg.freq, now);
      osc.detune.setValueAtTime(cfg.detune, now);
      osc.connect(padFilter);
      osc.start(now);
      return osc;
    });

    // Subtle rain & draft ambiance buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.03 * white) / 1.03;
      lastOut = data[i];
    }
    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(650, now);
    rainFilter.Q.setValueAtTime(0.6, now);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.035, now);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(master);
    rainSource.start(now);
    this.rainSource = rainSource;

    // Echo delay network for the haunted celesta / music-box notes
    const delay = ctx.createDelay(1.5);
    delay.delayTime.setValueAtTime(0.55, now);

    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.38, now);

    const echoFilter = ctx.createBiquadFilter();
    echoFilter.type = 'lowpass';
    echoFilter.frequency.setValueAtTime(1400, now);

    delay.connect(echoFilter);
    echoFilter.connect(feedback);
    feedback.connect(delay);
    echoFilter.connect(master);
    this.delayNode = delay;

    // Schedule sparse echoing music-box notes
    const scheduleNextNote = () => {
      if (!this.musicPlaying || !this.musicEnabled) return;
      this.playMusicBoxStep();
      const stepMs =
        this.musicMood === 'mystery' ? 1450 : this.musicMood === 'sunrise' ? 1150 : 1250;
      this.melodyTimer = window.setTimeout(scheduleNextNote, stepMs);
    };

    this.melodyTimer = window.setTimeout(scheduleNextNote, 600);
  }

  private playMusicBoxStep() {
    const ctx = this.ctx;
    const master = this.masterMusicGain;
    const delay = this.delayNode;
    if (!ctx || !master || !delay || !this.musicPlaying) return;

    const pattern =
      this.musicMood === 'mystery'
        ? MELODY_MYSTERY
        : this.musicMood === 'sunrise'
        ? MELODY_SUNRISE
        : MELODY_MIDNIGHT;

    const freq = pattern[this.noteIndex % pattern.length];
    this.noteIndex += 1;

    if (!freq || freq === 0) return;

    const now = ctx.currentTime;

    // Fundamental celesta tone + soft eerie bell overtone
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, now);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.18, now);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(0.085, now + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    osc.connect(env);
    overtone.connect(overtoneGain);
    overtoneGain.connect(env);

    env.connect(master);
    env.connect(delay);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 2.3);
    overtone.stop(now + 2.3);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.melodyTimer !== null) {
      window.clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }

    const ctx = this.ctx;
    const now = ctx ? ctx.currentTime : 0;

    if (this.masterMusicGain && ctx) {
      try {
        this.masterMusicGain.gain.cancelScheduledValues(now);
        this.masterMusicGain.gain.setValueAtTime(this.masterMusicGain.gain.value || 0.2, now);
        this.masterMusicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      } catch {
        // Ignore ramp errors
      }
    }

    const cleanupDelay = 400;
    const oscs = [...this.padOscs];
    const lfo = this.lfoOsc;
    const rain = this.rainSource;

    this.padOscs = [];
    this.lfoOsc = null;
    this.rainSource = null;
    this.masterMusicGain = null;
    this.delayNode = null;

    window.setTimeout(() => {
      oscs.forEach((o) => {
        try {
          o.stop();
          o.disconnect();
        } catch {
          // ignore
        }
      });
      if (lfo) {
        try {
          lfo.stop();
          lfo.disconnect();
        } catch {
          // ignore
        }
      }
      if (rain) {
        try {
          rain.stop();
          rain.disconnect();
        } catch {
          // ignore
        }
      }
    }, cleanupDelay);
  }

  private getSfxContext(): AudioContext | null {
    if (!this.sfxEnabled) return null;
    return this.ensureContext();
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    delay = 0
  ) {
    const ctx = this.getSfxContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playBell() {
    this.playTone(1046.5, 0.5, 'sine', 0.07, 0);
    this.playTone(1567.98, 0.65, 'triangle', 0.04, 0.03);
  }

  playCoin() {
    this.playTone(987.77, 0.14, 'triangle', 0.06, 0);
    this.playTone(1318.51, 0.25, 'sine', 0.07, 0.07);
  }

  playChime() {
    this.playTone(523.25, 0.35, 'sine', 0.05, 0);
    this.playTone(659.25, 0.35, 'sine', 0.05, 0.08);
    this.playTone(783.99, 0.5, 'sine', 0.05, 0.16);
  }

  playClockTick() {
    this.playTone(440, 0.08, 'triangle', 0.04, 0);
  }

  playMystery() {
    this.playTone(329.63, 0.6, 'sine', 0.05, 0);
    this.playTone(392.0, 0.65, 'sine', 0.04, 0.12);
    this.playTone(493.88, 0.85, 'triangle', 0.04, 0.24);
  }

  playError() {
    this.playTone(220, 0.18, 'triangle', 0.05, 0);
    this.playTone(185, 0.24, 'triangle', 0.05, 0.09);
  }
}

export const soundFX = new SoundEngine();
