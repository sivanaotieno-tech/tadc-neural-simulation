import { BrainViewer } from './brain-viewer.js';
import { Soundtrack } from './soundtrack.js';
import { getRibbit } from './ribbit.js';
import { PlayerState } from './player-state.js';

const $ = s => document.querySelector(s);
const status = $('#status');
const assetStatus = $('#assetStatus');
const humanPanel = $('#humanPanel');
const bubblePanel = $('#bubblePanel');
const tabs = [...document.querySelectorAll('.tab')];
const soundtrack = new Soundtrack();
const player = new PlayerState();
const viewer = new BrainViewer($('#brainCanvas'), text => {
  status.textContent = text;
  assetStatus.textContent = text;
});

let pulse = true;
let rotate = false;
let entered = false;

function refreshPlayerUI() {
  const s = player.state;
  $('#playerTitle').textContent = s.scanned ? s.name : 'No character yet';
  $('#scanStatus').textContent = s.abstracted ? 'ABSTRACTED' : (s.scanned ? 'CHARACTER ACTIVE' : 'SCAN READY');
  $('#scanDetail').textContent = s.abstracted
    ? 'This save has been abstracted. Run a new scan to create a new character.'
    : s.scanned
      ? `Persistent since ${new Date(s.scanTime).toLocaleString()} · activity ${Math.round(s.activity * 100)}%`
      : 'No persistent character exists yet.';
  $('#abstract').disabled = !player.isActive();
  $('#scan').textContent = s.scanned && !s.abstracted ? 'Rescan fictional character' : 'Run fictional brain scan';
}

function enterGame() {
  entered = true;
  status.textContent = player.isActive() ? 'CHARACTER RESTORED' : 'DIGITAL CIRCUS READY';
  assetStatus.textContent = player.isActive()
    ? `${player.state.name} // neural identity restored`
    : 'Run the fictional scan to create your character.';
  refreshPlayerUI();
}

$('#enterGame').addEventListener('click', async () => {
  enterGame();
  if (soundtrack.audio?.paused) {
    await soundtrack.play('main');
    $('#music').textContent = 'Soundtrack: ON';
    $('#music').classList.add('on');
  }
});

$('#scan').addEventListener('click', () => {
  if (!entered) enterGame();
  const current = player.state.name || 'PLAYER-01';
  const name = window.prompt('Name your fictional circus character:', current);
  if (name === null) return;
  const s = player.scan(name.trim() || 'PLAYER-01');
  viewer.setPlayerCharacter(true, s.name);
  status.textContent = 'FICTIONAL SCAN COMPLETE';
  assetStatus.textContent = `${s.name} // PERSISTENT CHARACTER ACTIVE`;
  refreshPlayerUI();
});

$('#abstract').addEventListener('click', () => {
  if (!player.isActive()) return;
  const ok = window.confirm('Abstract this fictional character? This ends the persistent active state for this save.');
  if (!ok) return;
  player.abstract();
  viewer.setPlayerCharacter(false);
  status.textContent = 'CHARACTER ABSTRACTED';
  assetStatus.textContent = 'Player character has entered abstraction.';
  refreshPlayerUI();
});

$('#pulse').addEventListener('click', e => {
  pulse = !pulse;
  viewer.setPulse(pulse);
  e.classList.toggle('on', pulse);
  e.textContent = `Neural pulses: ${pulse ? 'ON' : 'OFF'}`;
});

$('#rotate').addEventListener('click', e => {
  rotate = !rotate;
  viewer.setAutoRotate(rotate);
  e.classList.toggle('on', rotate);
  e.textContent = `Auto-rotate: ${rotate ? 'ON' : 'OFF'}`;
});

$('#reset').addEventListener('click', () => viewer.reset());

$('#music').addEventListener('click', async e => {
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

$('#ribbit').addEventListener('click', () => {
  const ribbit = getRibbit();
  status.textContent = `RIBBIT // ${ribbit.scanStatus} // NOT ABSTRACTED`;
  assetStatus.textContent = ribbit.description;
  viewer.showRibbit();
});

tabs.forEach(tab => tab.addEventListener('click', async () => {
  const mode = tab.dataset.mode;
  tabs.forEach(t => t.classList.toggle('active', t === tab));
  humanPanel.hidden = mode !== 'human';
  bubblePanel.hidden = mode !== 'bubble';
  status.textContent = mode === 'human' ? 'LOADING PLAYER' : 'LOADING BUBBLE';
  await viewer.setMode(mode);
  if (mode === 'human') viewer.setPlayerCharacter(player.isActive(), player.state.name);
}));

refreshPlayerUI();
