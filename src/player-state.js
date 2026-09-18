const KEY = 'tadc-neural-circus-player-v1';

const DEFAULT_STATE = Object.freeze({
  scanned: false,
  abstracted: false,
  name: 'PLAYER-01',
  scanTime: null,
  activity: 0.72
});

export class PlayerState {
  constructor() {
    this.state = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULT_STATE };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch {}
    return this.state;
  }

  scan(name = this.state.name || 'PLAYER-01') {
    this.state.scanned = true;
    this.state.abstracted = false;
    this.state.name = String(name || 'PLAYER-01').slice(0, 24);
    this.state.scanTime = new Date().toISOString();
    this.state.activity = 0.72;
    return this.save();
  }

  abstract() {
    if (!this.state.scanned) return this.state;
    this.state.abstracted = true;
    return this.save();
  }

  reset() {
    this.state = { ...DEFAULT_STATE };
    try { localStorage.removeItem(KEY); } catch {}
    return this.state;
  }

  isActive() {
    return this.state.scanned && !this.state.abstracted;
  }
}
