import { BrainViewer } from './brain-viewer.js';

const status = document.querySelector('#status');
const assetStatus = document.querySelector('#assetStatus');
const humanPanel = document.querySelector('#humanPanel');
const bubblePanel = document.querySelector('#bubblePanel');
const tabs = [...document.querySelectorAll('.tab')];
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

tabs.forEach(tab => tab.addEventListener('click', () => {
  const mode = tab.dataset.mode;
  tabs.forEach(t => t.classList.toggle('active', t === tab));
  humanPanel.hidden = mode !== 'human';
  bubblePanel.hidden = mode !== 'bubble';
  status.textContent = mode === 'human' ? 'MRI 3D ASSET ONLINE' : 'BUBBLE NEURAL LINK';
}));
