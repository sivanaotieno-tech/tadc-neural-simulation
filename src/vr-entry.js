import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/webxr/VRButton.js';
import { VRPlayerScan } from './vr-player-scan.js';

export function installVREntry(scene, renderer, { onStatus = () => {} } = {}) {
  renderer.xr.enabled = true;
  const button = VRButton.createButton(renderer);
  button.id = 'enter-vr';
  button.textContent = 'ENTER THE DIGITAL CIRCUS';
  document.body.appendChild(button);

  let scanned = false;
  renderer.xr.addEventListener('sessionstart', async () => {
    onStatus('VR LINK ESTABLISHED — PREPARING CHARACTER SCAN');
    const scanner = new VRPlayerScan({
      onProgress: p => onStatus(`NEURAL CHARACTER SCAN ${p}%`),
      onComplete: profile => {
        scanned = true;
        onStatus(`CHARACTER CREATED — ${profile.characterClass}`);
        window.dispatchEvent(new CustomEvent('tadc-character-created', { detail: profile }));
      }
    });
    await scanner.start(renderer.xr.getSession());
    if (!scanned) onStatus('VR LINK ACTIVE — SCAN CANCELLED');
  });

  renderer.xr.addEventListener('sessionend', () => {
    onStatus('VR LINK OFFLINE');
  });

  return button;
}
