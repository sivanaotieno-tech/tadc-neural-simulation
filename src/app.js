import { BrainViewer } from './brain-viewer.js';
import { Soundtrack } from './soundtrack.js';
import { getRibbit } from './ribbit.js';

const status = document.querySelector('#status');
const assetStatus = document.querySelector('#assetStatus');
const humanPanel = document.querySelector('#humanPanel');
const bubblePanel = document.querySelector('#bubblePanel');
const tabs = [...document.querySelectorAll('.tab')];
const soundtrack = new Soundtrack();
const viewer = new BrainViewer(document.querySelector('#brainCanvas'), text => {
  status.textContent = text;
  assetStatus.textContent = text;
});

let pulse = true;
let rotate = false;

document.querySelector('#pulse').addEventListener('click', e => {
  pulse = !pulse;
  viewer.setPulse(pulse);
  e.classList.toggle('on', pulse);
  e.textContent = `Neural pulses: ${pulse ? 'ON' : 'OFF'}`;
});

document.querySelector('#rotate').addEventListener('click', e => {
  rotate = !rotate;
  viewer.setAutoRotate(rotate);
  e.classList.toggle('on', rotate);
  e.textContent = `Auto-rotate: ${rotate ? 'ON' : 'OFF'}`;
});

document.querySelector('#reset').addEventListener('click', () => viewer.reset());

document.querySelector('#music').addEventListener('click', async e => {
  if (soundtrack.audio?.paused) {
    await soundtrack.play('main');
    e.textContent = 'Soundtrack: ON';
    e.classList.add('on');
  } else {
    soundtrack.stop();
    e.textContent = 'Soundtrack: OFF';
    e.classList.remove('on');
  }
});

document.querySelector('#ribbit').addEventListener('click', () => {
  const ribbit = getRibbit();
  status.textContent = `RIBBIT // ${ribbit.scanStatus} // NOT ABSTRACTED`;
  assetStatus.textContent = ribbit.description;
  window.dispatchEvent(new CustomEvent('tadc-ribbit-selected', { detail: ribbit }));
});

tabs.forEach(tab => tab.addEventListener('click', async () => {
  const mode = tab.dataset.mode;
  tabs.forEach(t => t.classList.toggle('active', t === tab));
  humanPanel.hidden = mode !== 'human';
  bubblePanel.hidden = mode !== 'bubble';
  status.textContent = mode === 'human' ? 'LOADING HUMAN MRI' : 'LOADING BUBBLE';
  await viewer.setMode(mode);
}));
