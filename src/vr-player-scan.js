// Fictional in-game brain-scan character system.
// A normal VR headset cannot read a player's brain. This module therefore
// creates a consent-gated, stylized neural "scan" using headset/session data
// and a local random seed. No biometric or medical data is collected.

export class VRPlayerScan {
  constructor({ onProgress = () => {}, onComplete = () => {} } = {}) {
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.character = null;
  }

  async start(session) {
    if (!session) throw new Error('VR session required');

    const accepted = window.confirm(
      'ENTER THE DIGITAL CIRCUS?\n\n' +
      'The game will perform a fictional neural scan and create your in-game character.\n' +
      'No real brain-reading or medical data is performed or collected.\n\n' +
      'Continue?'
    );
    if (!accepted) return null;

    const seed = crypto.getRandomValues(new Uint32Array(4));
    const profile = {
      id: `player-${Date.now().toString(36)}`,
      seed: [...seed],
      neuralSignature: seed.map(n => (n % 1000) / 1000),
      characterClass: 'DIGITAL HUMAN',
      scanStatus: 'FICTIONAL SIMULATION COMPLETE'
    };

    for (let i = 0; i <= 100; i += 10) {
      this.onProgress(i);
      await new Promise(r => setTimeout(r, 70));
    }

    this.character = profile;
    localStorage.setItem('tadc-player-character', JSON.stringify(profile));
    this.onComplete(profile);
    return profile;
  }

  getSavedCharacter() {
    try {
      const raw = localStorage.getItem('tadc-player-character');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
