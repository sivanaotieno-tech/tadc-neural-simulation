// Soundtrack system. Add only audio recordings you are licensed/authorized to use.
const TRACKS = [
  { id: 'main', title: 'Digital Circus Main Theme', src: 'assets/audio/tadc-main-theme.mp3' },
  { id: 'lab', title: 'Neural Lab', src: 'assets/audio/tadc-neural-lab.mp3' },
  { id: 'tension', title: 'Neural Scan / Tension', src: 'assets/audio/tadc-neural-scan.mp3' },
  { id: 'abstracted', title: 'Abstraction', src: 'assets/audio/tadc-abstraction.mp3' }
];

export class Soundtrack {
  constructor() {
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.volume = 0.55;
    this.current = null;
  }

  async play(id = 'main') {
    const track = TRACKS.find(t => t.id === id) || TRACKS[0];
    this.audio.src = track.src;
    this.current = track;
    try { await this.audio.play(); } catch { /* browser autoplay policy */ }
    return track;
  }

  stop() { this.audio.pause(); this.audio.currentTime = 0; }
  setVolume(value) { this.audio.volume = Math.max(0, Math.min(1, value)); }
  getTracks() { return [...TRACKS]; }
}
