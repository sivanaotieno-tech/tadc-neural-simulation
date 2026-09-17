// Fictional in-game neural character system.
// A normal VR headset cannot read a player's brain. This creates a consent-gated,
// stylized neural profile using a local random seed. No biometric or medical data is collected.

const STORAGE_KEY = 'tadc-player-character';

export class VRPlayerScan {
  constructor({ onProgress = () => {}, onComplete = () => {} } = {}) {
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.character = this.getSavedCharacter();
  }

  async start(session) {
    if (!session) throw new Error('VR session required');

    const saved = this.getSavedCharacter();
    if (saved) {
      this.character = saved;
      this.onComplete(saved);
      window.dispatchEvent(new CustomEvent('tadc-character-loaded', { detail: saved }));
      return saved;
    }

    const accepted = window.confirm(
      'ENTER THE DIGITAL CIRCUS?\n\n' +
      'The game will perform a fictional neural scan and create your in-game character.\n' +
      'The scan remains ACTIVE permanently until the character is abstracted.\n' +
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
      scanStatus: 'ACTIVE',
      abstracted: false,
      permanentUntilAbstraction: true,
      scannedAt: new Date().toISOString()
    };

    for (let i = 0; i <= 100; i += 10) {
      this.onProgress(i);
      await new Promise(r => setTimeout(r, 70));
    }

    this.character = profile;
    this.save(profile);
    this.onComplete(profile);
    window.dispatchEvent(new CustomEvent('tadc-character-created', { detail: profile }));
    return profile;
  }

  save(profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  // The only normal gameplay transition out of ACTIVE is explicit abstraction.
  abstractPlayer(reason = 'IN-GAME ABSTRACTION EVENT') {
    const profile = this.getSavedCharacter();
    if (!profile || profile.abstracted) return profile;
    const updated = {
      ...profile,
      scanStatus: 'ABSTRACTED',
      abstracted: true,
      abstractionReason: reason,
      abstractedAt: new Date().toISOString()
    };
    this.character = updated;
    this.save(updated);
    window.dispatchEvent(new CustomEvent('tadc-character-abstracted', { detail: updated }));
    return updated;
  }

  getSavedCharacter() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
