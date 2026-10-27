import Phaser from 'phaser';
import './style.css';

type Kind = 'residential' | 'commercial' | 'park' | 'transit' | 'landmark';
type Building = { kind: Kind; x: number; y: number };

const GRID = 9;
const TILE_W = 72;
const TILE_H = 36;
const BOARD_ORIGIN_Y = 260;
const ROUND_SECONDS = 300;
const COLORS: Record<Kind, number> = { residential: 0x58b9ff, commercial: 0xffc857, park: 0x58d68d, transit: 0xb58cff, landmark: 0xff6b8a };
const BUILDINGS: Record<Kind, { label: string; cost: number; icon: string; effect: string }> = {
  residential: { label: 'RESIDENTIAL', cost: 90, icon: '⌂', effect: '+28 pop · +8 tax' },
  commercial: { label: 'COMMERCIAL', cost: 130, icon: '▣', effect: '+18 income · needs homes' },
  park: { label: 'PARK', cost: 70, icon: '♣', effect: '+10 happiness nearby' },
  transit: { label: 'TRANSIT', cost: 110, icon: '↔', effect: '+access · -congestion' },
  landmark: { label: 'WAT ARUN', cost: 600, icon: '✦', effect: '+250 score · +15 happiness' },
};
const PIXEL_PALETTE = { night: 0x172038, sky: 0x293b68, haze: 0x566c86, light: 0xf4f4dc, road: 0x303b4f, gold: 0xf4c95d };

let game: Phaser.Game;
let roundTimer: number | undefined;
let lastEventSecond = -1;
const state: { money: number; score: number; happiness: number; population: number; income: number; seconds: number; selected: Kind; paused: boolean; started: boolean; buildings: Building[]; objectives: boolean[]; lastRain: boolean } = { money: 900, score: 0, happiness: 62, population: 0, income: 0, seconds: ROUND_SECONDS, selected: 'residential', paused: false, started: false, buildings: [], objectives: [false, false, false], lastRain: false };
let sceneRef: CityScene;

class CityScene extends Phaser.Scene {
  private board!: Phaser.GameObjects.Graphics;
  private labels: Phaser.GameObjects.Text[] = [];
  private hover?: { x: number; y: number };
  private flash?: Phaser.GameObjects.Text;
  private lastEvent = -1;

  constructor() { super('city'); }
  create() {
    sceneRef = this;
    this.cameras.main.setBackgroundColor('#0b2330');
    this.board = this.add.graphics();
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { this.hover = this.worldToGrid(p.worldX, p.worldY); this.draw(); });
    this.draw();
  }
  worldToGrid(px: number, py: number) { const ox = this.scale.width / 2; const dx = px - ox; const dy = py - BOARD_ORIGIN_Y; return { x: Math.round((dx / (TILE_W / 2) + dy / (TILE_H / 2)) / 2), y: Math.round((dy / (TILE_H / 2) - dx / (TILE_W / 2)) / 2) }; }
  gridToWorld(x: number, y: number) { return { x: this.scale.width / 2 + (x - y) * TILE_W / 2, y: BOARD_ORIGIN_Y + (x + y) * TILE_H / 2 }; }
  place(pos: { x: number; y: number }) {
    if (pos.x < 0 || pos.y < 0 || pos.x >= GRID || pos.y >= GRID) return this.notify('OUTSIDE CITY GRID');
    if (state.buildings.some(b => b.x === pos.x && b.y === pos.y)) return this.notify('TILE ALREADY OCCUPIED');
    const item = BUILDINGS[state.selected]; const cost = state.lastRain && state.selected !== 'park' ? Math.ceil(item.cost * 1.2) : item.cost;
    if (state.money < cost) return this.notify(`NEED $${cost} TO BUILD`);
    const nearby = state.buildings.filter(b => Math.abs(b.x - pos.x) + Math.abs(b.y - pos.y) <= 2);
    const synergy = state.selected === 'commercial' && nearby.some(b => b.kind === 'residential') ? ' · +LOCAL CUSTOMER BONUS' : state.selected === 'park' && nearby.some(b => b.kind === 'residential') ? ' · +HAPPINESS BONUS' : state.selected === 'transit' && nearby.some(b => b.kind === 'commercial') ? ' · +ACCESS BONUS' : '';
    state.money -= cost; state.buildings.push({ kind: state.selected, ...pos }); this.recalculate(); this.draw(); updateHud(); this.notify(`${item.label} BUILT${synergy}`);
  }
  recalculate() { const homes = state.buildings.filter(b => b.kind === 'residential').length; const parks = state.buildings.filter(b => b.kind === 'park').length; const transit = state.buildings.filter(b => b.kind === 'transit').length; const shops = state.buildings.filter(b => b.kind === 'commercial').length; state.population = homes * 28; state.income = homes * 8 + shops * (18 + Math.min(homes, 4) * 4); state.happiness = Math.min(100, 55 + parks * 10 + (transit ? 8 : 0) + (state.buildings.some(b => b.kind === 'landmark') ? 15 : 0) - Math.max(0, shops - homes) * 5); state.score = state.population * 2 + state.income * 3 + state.happiness * 4; state.objectives = [homes >= 5, shops >= 3, parks >= 2 && transit >= 1]; }
  draw() {
    this.board.clear(); this.labels.forEach(l => l.destroy()); this.labels = [];
    this.board.fillStyle(PIXEL_PALETTE.night, 1); this.board.fillRect(0, 0, this.scale.width, this.scale.height);
    this.board.fillGradientStyle(PIXEL_PALETTE.sky, PIXEL_PALETTE.sky, PIXEL_PALETTE.night, PIXEL_PALETTE.night, 1);
    this.board.fillRect(0, 0, this.scale.width, BOARD_ORIGIN_Y + 180);
    this.board.fillStyle(0x123b46, 1); this.board.fillCircle(this.scale.width / 2, BOARD_ORIGIN_Y + 150, 285);
    this.drawCityBackdrop();
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) { const p = this.gridToWorld(x, y); const active = this.hover?.x === x && this.hover?.y === y; this.board.fillStyle(active ? 0x3a7890 : (x + y) % 2 ? 0x245064 : 0x1d4054, active ? 1 : 1); this.board.beginPath(); this.board.moveTo(p.x, p.y - TILE_H / 2); this.board.lineTo(p.x + TILE_W / 2, p.y); this.board.lineTo(p.x, p.y + TILE_H / 2); this.board.lineTo(p.x - TILE_W / 2, p.y); this.board.closePath(); this.board.fillPath(); this.board.lineStyle(active ? 3 : 2, active ? 0xffcf72 : 0x4f91a2, 0.95); this.board.strokePath(); }
    state.buildings.forEach(b => { const p = this.gridToWorld(b.x, b.y); this.board.fillStyle(0x07141b, 0.45); this.board.fillEllipse(p.x, p.y + 5, 50, 16); this.drawPixelBuilding(p.x, p.y, b.kind); });
    if (this.hover && this.hover.x >= 0 && this.hover.y >= 0 && this.hover.x < GRID && this.hover.y < GRID) { const p = this.gridToWorld(this.hover.x, this.hover.y); const t = this.add.text(p.x, p.y - 48, `${BUILDINGS[state.selected].label}  $${BUILDINGS[state.selected].cost}`, { fontFamily: 'monospace', fontSize: '11px', color: '#d7f4ff', backgroundColor: '#0b1727', padding: { x: 6, y: 4 } }).setOrigin(0.5); this.labels.push(t); }
  }
  drawCityBackdrop() {
    const baseY = BOARD_ORIGIN_Y + 212;
    this.board.fillStyle(0x0e3540, 1); this.board.fillRect(0, baseY, this.scale.width, 112);
    this.board.fillStyle(0x2c6870, 0.8); this.board.fillRect(0, baseY + 42, this.scale.width, 3);
    for (let x = -20; x < this.scale.width + 80; x += 92) {
      const height = 22 + ((x * 7) % 46 + 46) % 46;
      this.board.fillStyle(0x164957, 1); this.board.fillRect(x, baseY - height, 42, height);
      this.board.fillStyle(0x58a6a1, 0.8); this.board.fillRect(x + 8, baseY - height + 10, 5, 5); this.board.fillRect(x + 24, baseY - height + 22, 5, 5);
    }
    this.board.fillStyle(0xffc857, 0.9); this.board.fillRect(28, baseY + 64, this.scale.width - 56, 4);
    for (let x = 38; x < this.scale.width - 32; x += 54) { this.board.fillStyle(0x07141b, 1); this.board.fillRect(x, baseY + 60, 20, 12); this.board.fillStyle(0xffefab, 1); this.board.fillRect(x + 4, baseY + 63, 4, 3); this.board.fillRect(x + 12, baseY + 63, 4, 3); }
  }
  drawPixelBuilding(x: number, y: number, kind: Kind) {
    const color = COLORS[kind];
    this.board.fillStyle(0x081321, 0.95); this.board.fillRect(x - 23, y - 8, 46, 16);
    this.board.fillStyle(color, 1); this.board.fillRect(x - 18, y - 25, 36, 17); this.board.fillRect(x - 14, y - 34, 28, 9);
    this.board.fillStyle(0xf7df9a, 1);
    if (kind === 'residential') { this.board.fillRect(x - 10, y - 20, 6, 6); this.board.fillRect(x + 4, y - 20, 6, 6); }
    if (kind === 'commercial') { this.board.fillRect(x - 12, y - 18, 24, 4); this.board.fillRect(x - 3, y - 12, 6, 8); }
    if (kind === 'park') { this.board.fillStyle(0x6ee7a2, 1); this.board.fillRect(x - 10, y - 26, 8, 8); this.board.fillRect(x + 3, y - 22, 8, 8); this.board.fillStyle(0x8e603d, 1); this.board.fillRect(x - 2, y - 15, 4, 9); }
    if (kind === 'transit') { this.board.fillStyle(0xf4d35e, 1); this.board.fillRect(x - 15, y - 17, 30, 5); this.board.fillStyle(0xe9f7ff, 1); this.board.fillRect(x - 9, y - 27, 18, 7); }
    if (kind === 'landmark') { this.board.fillStyle(0xff7898, 1); this.board.fillTriangle(x, y - 45, x + 15, y - 25, x - 15, y - 25); this.board.fillStyle(0xffe6a8, 1); this.board.fillRect(x - 3, y - 39, 6, 10); }
    const t = this.add.text(x, y - 8, BUILDINGS[kind].icon, { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5); this.labels.push(t);
  }
  notify(message: string) { this.flash?.destroy(); this.flash = this.add.text(this.scale.width / 2, 120, message, { fontFamily: 'monospace', fontSize: '14px', color: '#ffcf72', backgroundColor: '#172337', padding: { x: 12, y: 8 } }).setOrigin(0.5); this.flash.setAlpha(0); this.tweens.add({ targets: this.flash, alpha: 1, y: 112, duration: 180, ease: 'Quad.easeOut' }); this.time.delayedCall(1600, () => this.flash?.destroy()); }
  update() { if (state.started && !state.paused) updateHud(); }
}

Object.defineProperty(state, 'lastRain', { get: () => Math.floor(state.seconds / 60) % 4 === 1 });
function updateHud() { document.querySelector('#money')!.textContent = `$${Math.floor(state.money)}`; document.querySelector('#timer')!.textContent = formatTime(state.seconds); document.querySelector('#stats')!.textContent = `${state.population} POP  ·  ${state.happiness}% HAPPY  ·  +$${state.income}/min`; document.querySelector('#score')!.textContent = `${Math.floor(state.score).toLocaleString()} SCORE`; document.querySelector('#objectives')!.innerHTML = [`${state.objectives[0] ? '✓' : '○'} House 5 neighborhoods`, `${state.objectives[1] ? '✓' : '○'} Build 3 businesses`, `${state.objectives[2] ? '✓' : '○'} Green transit loop`].map(x => `<div>${x}</div>`).join(''); }
function formatTime(value: number) { const m = Math.floor(value / 60).toString().padStart(2, '0'); const s = Math.floor(value % 60).toString().padStart(2, '0'); return `${m}:${s}`; }
function select(kind: Kind) { state.selected = kind; document.querySelectorAll('.build-btn').forEach(b => b.classList.toggle('selected', (b as HTMLElement).dataset.kind === kind)); document.querySelector('#selected-building')!.textContent = `${BUILDINGS[kind].label} SELECTED — CLICK A TILE`; sceneRef?.draw(); }
function advanceRoundSecond() {
  if (!state.started || state.paused || state.seconds <= 0) return;
  const previousMinute = Math.floor(state.seconds / 60);
  state.seconds = Math.max(0, state.seconds - 1);
  const currentMinute = Math.floor(state.seconds / 60);
  if (currentMinute !== previousMinute) { state.money += state.income; sceneRef?.recalculate(); sceneRef?.notify(`CITY INCOME +$${state.income}`); }
  if (state.seconds !== lastEventSecond && state.seconds % 60 === 0 && state.seconds < 295) {
    lastEventSecond = state.seconds;
    const events = ['HEAVY RAIN · BUILD COSTS +20%', 'TOURIST SURGE · COMMERCIAL +$12', 'TRAFFIC ALERT · TRANSIT IS CRITICAL', 'HAPPINESS CHECK · PARKS MATTER'];
    sceneRef?.notify(events[Math.floor(state.seconds / 60) % events.length]);
  }
  updateHud();
  if (state.seconds === 0) endRound();
}
function startRound() {
  state.started = true;
  document.querySelector('#start-screen')?.classList.add('hidden');
  document.querySelector('#game-ui')?.classList.remove('hidden');
  // Phaser was created while the game panel was hidden, so force a real canvas
  // measurement before accepting clicks. Without this, the canvas can remain 0px wide.
  requestAnimationFrame(() => {
    const host = document.querySelector<HTMLElement>('#scene');
    if (host && game) game.scale.resize(host.clientWidth, host.clientHeight);
    sceneRef?.draw();
  });
  window.clearInterval(roundTimer);
  roundTimer = window.setInterval(advanceRoundSecond, 1000);
  updateHud();
}
function togglePause() { state.paused = !state.paused; document.querySelector('#pause')!.textContent = state.paused ? 'RESUME' : 'PAUSE'; document.querySelector('#pause-card')?.classList.toggle('hidden', !state.paused); }
function endRound() { state.started = false; window.clearInterval(roundTimer); document.querySelector('#result')?.classList.remove('hidden'); document.querySelector('#final-score')!.textContent = Math.floor(state.score).toLocaleString(); document.querySelector('#final-stats')!.textContent = `${state.population} population · ${state.happiness}% happiness · ${state.buildings.length} districts`; }
function restart() { location.reload(); }

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<div id="shell"><div id="start-screen" class="screen"><div class="eyebrow">ARCADE CITY BUILDER · 05:00</div><h1>BANGKOK<br><span>SUPER METROPOLIS</span></h1><p>Build smart. Beat the clock. Make the city hum.</p><button id="start">START CHALLENGE</button><small>9 × 9 isometric grid · $900 starting capital · every choice counts</small></div><div id="game-ui" class="hidden"><header><div class="brand">BKK<span>/27</span></div><div class="stat"><b id="money">$900</b><small>TREASURY</small></div><div class="stat"><b id="timer">05:00</b><small>TIME LEFT</small></div><div class="stat wide"><b id="stats">0 POP · 62% HAPPY · +$0/min</b><small>CITY PULSE</small></div><button id="pause">PAUSE</button></header><main><section id="scene"></section><aside><div class="panel"><div class="panel-title">BUILD MENU <span id="score">0 SCORE</span></div><div id="selected-building" class="selected-building">RESIDENTIAL SELECTED — CLICK A TILE</div><div id="build-menu"></div></div><div class="panel"><div class="panel-title">MISSION BOARD</div><div id="objectives"></div></div><div class="tip">TIP: Parks beside homes create a happiness chain. Shops need residents. Transit keeps congestion down.</div></aside></main></div><div id="pause-card" class="modal hidden"><div class="modal-box"><div class="eyebrow">CITY SIMULATION PAUSED</div><h2>Take a breath.</h2><button id="resume">RESUME CITY</button></div></div><div id="result" class="modal hidden"><div class="modal-box"><div class="eyebrow">ROUND COMPLETE · 05:00</div><h2>CITY REPORT</h2><div id="final-score" class="big-score">0</div><div id="final-stats"></div><p>Every block tells a story. Your next city can tell an even better one.</p><button id="replay">PLAY AGAIN</button></div></div></div>`;
const menu = document.querySelector('#build-menu')!; (Object.keys(BUILDINGS) as Kind[]).forEach(kind => { const b = BUILDINGS[kind]; menu.innerHTML += `<button class="build-btn ${kind === 'residential' ? 'selected' : ''}" data-kind="${kind}"><i style="background:#${COLORS[kind].toString(16)}">${b.icon}</i><span><b>${b.label}</b><small>${b.effect}</small></span><strong>$${b.cost}</strong></button>`; });
document.querySelectorAll<HTMLButtonElement>('.build-btn').forEach(b => b.onclick = () => select(b.dataset.kind as Kind)); document.querySelector('#start')!.addEventListener('click', startRound); document.querySelector('#pause')!.addEventListener('click', togglePause); document.querySelector('#resume')!.addEventListener('click', togglePause); document.querySelector('#replay')!.addEventListener('click', restart);
document.querySelector('#scene')!.addEventListener('pointerdown', (event) => { if (!state.started || state.paused || !sceneRef) return; const pointer = event as PointerEvent; const canvas = document.querySelector<HTMLCanvasElement>('#scene canvas'); if (!canvas) return; const bounds = canvas.getBoundingClientRect(); const scaleX = sceneRef.scale.width / bounds.width; const scaleY = sceneRef.scale.height / bounds.height; sceneRef.place(sceneRef.worldToGrid((pointer.clientX - bounds.left) * scaleX, (pointer.clientY - bounds.top) * scaleY)); });
game = new Phaser.Game({ type: Phaser.AUTO, parent: 'scene', width: 920, height: 650, backgroundColor: '#07111f', scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: CityScene });
