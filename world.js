/* FT 90 world flow: city select -> fly-over -> house -> bike -> stadium.
   Loaded after game.js/visuals.js. If anything fails it falls back to the old start screen. */
(function () {
'use strict';
const CITIES = {
  england: { name: 'ENGLAND', flag: '\uD83C\uDDEC\uD83C\uDDE7', file: 'city_england.glb', nav: 'nav_england.json', sky: 0xa9b7c6, sun: 0xdfe6ee, hemi: 0.95 },
  spain:   { name: 'SPAIN',   flag: '\uD83C\uDDEA\uD83C\uDDF8', file: 'city_spain.glb',   nav: 'nav_spain.json',   sky: 0x8fc4f2, sun: 0xfff0cf, hemi: 0.9 },
  italy:   { name: 'ITALY',   flag: '\uD83C\uDDEE\uD83C\uDDF9', file: 'city_italy.glb',   nav: 'nav_italy.json',   sky: 0xf0c995, sun: 0xffd9a0, hemi: 0.85 },
  germany: { name: 'GERMANY', flag: '\uD83C\uDDE9\uD83C\uDDEA', file: 'city_germany.glb', nav: 'nav_germany.json', sky: 0x9cb8d8, sun: 0xf4f7ff, hemi: 0.9 }
};
const IDLE_T = 13.375;                 // standing frame inside Ronaldo's clip
const HOUSE = { x0: -2.2, x1: 3.4, z0: -1.6, z1: 2.0, y: 0.25, spawn: [0.6, 0.8], exitZ: 1.35 };
const STAD = { hx0: 130, hx1: 125, hz0: 105, hz1: 98 };   // blocked rectangle around the stadium (from its centre)
const T = THREE, $$ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = u => u * u * (3 - 2 * u);
let W = { on: false, phase: 'select', scene: null, cam: null, t: performance.now() };
try { globalThis.__ft90w = W; } catch (e) {}

try { init(); } catch (e) {
  console.error('FT90 world failed, using old start screen', e);
  const s = $$('st'); if (s) s.classList.add('on');
  const w = $$('wl'); if (w) w.remove();
}

function init() {
  if (!T.GLTFLoader) throw new Error('GLTFLoader missing');
  injectUI();
  if (typeof ui === 'function') ui(false);
  $$('st').classList.remove('on');
  hideGameHud(true);
  W.cam = new T.PerspectiveCamera(55, 1, 0.1, 5000);
  W.scene = new T.Scene();
  W.on = true;
  const _r = R.render.bind(R);
  R.render = function (s, c) { if (W.on && W.scene) { frame(); return _r(W.scene, W.cam); } return _r(s, c); };
  show('wsel');
}

/* ---------------- UI ---------------- */
function injectUI() {
  const css = document.createElement('style');
  css.textContent = `
#wl{position:fixed;inset:0;z-index:50;color:#fff;pointer-events:none;font-family:inherit;-webkit-user-select:none;user-select:none}
#wl .scr{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:14px;pointer-events:auto;padding:16px;text-align:center}
#wl .scr.on{display:flex}
#wsel{background:radial-gradient(120% 90% at 50% 0%,#16386a,#050a14 72%)}
#wsel h1{margin:0;font-size:clamp(26px,7vw,44px);letter-spacing:.14em;font-weight:800}
#wsel p{margin:0;opacity:.7;font-size:14px}
#wgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:min(92vw,520px)}
.wc{border:1px solid #ffffff33;border-radius:16px;padding:18px 8px;background:linear-gradient(160deg,#ffffff1c,#ffffff06);color:#fff;font:inherit;font-weight:800;letter-spacing:.1em;font-size:clamp(15px,4.4vw,22px);touch-action:manipulation}
.wc span{display:block;font-size:clamp(34px,10vw,56px);margin-bottom:6px}
.wc:active{transform:scale(.97);background:#ffffff30}
#wcred{background:none;border:0;color:#ffffffaa;text-decoration:underline;font:inherit;font-size:13px}
#wload{background:#050a14}#wbar{width:min(70vw,360px);height:8px;border-radius:4px;background:#ffffff22;overflow:hidden}#wbf{height:100%;width:0;background:#38d27a;transition:width .2s}
#wfly{background:transparent;pointer-events:none;justify-content:space-between}
#wfly .bar{position:absolute;left:0;right:0;height:11vh;background:#000}#wfly .tp{top:0}#wfly .bt{bottom:0}
#wtitle{position:absolute;left:6vw;bottom:15vh;text-align:left;text-shadow:0 2px 12px #000}
#wtitle b{display:block;font-size:clamp(30px,9vw,60px);letter-spacing:.14em}#wtitle i{font-style:normal;opacity:.8;letter-spacing:.2em;font-size:13px}
#whud2{position:absolute;right:5vw;top:13vh;text-align:right;font-size:11px;letter-spacing:.15em;opacity:.8;font-variant-numeric:tabular-nums;text-shadow:0 1px 6px #000}
#wskip{position:absolute;right:5vw;bottom:13vh;pointer-events:auto;border:1px solid #fff8;background:#0008;color:#fff;border-radius:20px;padding:8px 18px;font:inherit;letter-spacing:.12em;font-size:12px}
#whud{background:transparent;pointer-events:none;justify-content:flex-start;align-items:center}
#whint{margin-top:max(14px,env(safe-area-inset-top));background:#000a;border-radius:12px;padding:8px 14px;font-size:13px;letter-spacing:.06em;max-width:86vw}
#wact{position:absolute;right:5vw;bottom:24vh;pointer-events:auto;border:0;border-radius:14px;padding:14px 20px;background:#38d27a;color:#04210f;font:inherit;font-weight:800;letter-spacing:.08em;font-size:15px;display:none;touch-action:manipulation}
#warr{position:absolute;top:max(64px,calc(env(safe-area-inset-top) + 56px));right:5vw;width:64px;text-align:center;font-size:11px;display:none;text-shadow:0 1px 6px #000}
#warr div{width:44px;height:44px;margin:0 auto 4px;border-radius:50%;background:#000a;display:flex;align-items:center;justify-content:center;font-size:26px;color:#38d27a}
#wfade{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .6s;pointer-events:none}
#wcreds{background:#050a14ee}#wcreds pre{white-space:pre-wrap;text-align:left;max-height:70vh;overflow:auto;font-size:11px;width:min(92vw,560px)}
`;
  document.head.appendChild(css);
  const d = document.createElement('div'); d.id = 'wl';
  d.innerHTML = `
<div class="scr" id="wsel"><h1>CHOOSE YOUR CITY</h1><p>Where does your story begin?</p><div id="wgrid"></div><button id="wcred">Credits</button></div>
<div class="scr" id="wload"><h1 id="wlt" style="margin:0;letter-spacing:.12em">LOADING</h1><div id="wbar"><div id="wbf"></div></div><p id="wlp" style="margin:0;opacity:.7;font-size:13px"></p><button class="wc" id="wretry" style="display:none;padding:12px 26px">RETRY</button></div>
<div class="scr" id="wfly"><div class="bar tp"></div><div class="bar bt"></div><div id="wtitle"><b id="wct"></b><i id="wcs"></i></div><div id="whud2"></div><button id="wskip">SKIP</button></div>
<div class="scr" id="whud"><div id="whint"></div><div id="warr"><div id="warrg">\u27A4</div><span id="wdist"></span></div><button id="wact"></button></div>
<div class="scr" id="wcreds"><pre id="wcp"></pre><button class="wc" id="wcc" style="padding:12px 26px">CLOSE</button></div>
<div id="wfade"></div>`;
  document.body.appendChild(d);
  const g = $$('wgrid');
  Object.keys(CITIES).forEach(k => {
    const b = document.createElement('button'); b.className = 'wc'; b.innerHTML = '<span>' + CITIES[k].flag + '</span>' + CITIES[k].name;
    b.addEventListener('click', () => startCity(k)); g.appendChild(b);
  });
  $$('wcred').addEventListener('click', () => {
    fetch('CREDITS.txt').then(r => r.text()).then(t => { $$('wcp').textContent = t; show('wcreds'); }).catch(() => { $$('wcp').textContent = 'Credits file not found.'; show('wcreds'); });
  });
  $$('wcc').addEventListener('click', () => show('wsel'));
}
function show(id) { document.querySelectorAll('#wl .scr').forEach(e => e.classList.toggle('on', e.id === id)); }
function hint(t) { $$('whint').textContent = t; }
function fade(on) { $$('wfade').style.opacity = on ? 1 : 0; }
function hideGameHud(on) {
  const sc = $$('sc'); if (sc && sc.parentNode) sc.parentNode.style.display = on ? 'none' : '';
  const pad = $$('pad'); if (pad) pad.style.display = 'none';
}
function padOn(on) { const p = $$('pad'); if (p) p.style.display = on ? 'block' : 'none'; }
function stick() { return [typeof jx === 'number' ? jx : 0, typeof jy === 'number' ? jy : 0]; }

/* ---------------- loading ---------------- */
function glb(url, prog) {
  return new Promise((res, rej) => {
    new T.GLTFLoader().load(url, res, e => { if (e && e.total) prog(url, e.loaded / e.total); }, e => rej(new Error('Could not load ' + url)));
  });
}
function b64(s) { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function prep(root, double) {
  const lin = R.outputEncoding !== T.sRGBEncoding;
  root.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = !o.isSkinnedMesh;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
      if (double) m.side = T.DoubleSide;
      if ('metalness' in m) { m.metalness = 0; m.roughness = Math.max(m.roughness || 0, 0.6); }
      if (lin && m.map) { m.map.encoding = T.LinearEncoding; m.map.needsUpdate = true; }
      if (lin && m.emissiveMap) { m.emissiveMap.encoding = T.LinearEncoding; m.emissiveMap.needsUpdate = true; }
      m.needsUpdate = true;
    });
  });
}
function startCity(key) {
  const C = CITIES[key]; W.key = key; W.C = C;
  show('wload'); $$('wlt').textContent = 'LOADING ' + C.name; $$('wretry').style.display = 'none';
  const urls = [C.file, 'stadium_spatial.glb', 'player_ronaldo.glb', 'house_modern.glb'], p = {};
  const upd = (u, f) => { p[u] = f; const a = urls.reduce((s, k) => s + (p[k] || 0), 0) / urls.length; $$('wbf').style.width = (a * 100).toFixed(0) + '%'; $$('wlp').textContent = u.replace('.glb', '').replace(/_/g, ' '); };
  Promise.all([glb(C.file, upd), glb('stadium_spatial.glb', upd), glb('player_ronaldo.glb', upd), glb('house_modern.glb', upd), fetch(C.nav).then(r => r.json())])
    .then(a => { try { build(key, a[0], a[1], a[2], a[3], a[4]); } catch (e) { fail(e, key); } })
    .catch(e => fail(e, key));
}
function fail(e, key) {
  console.error(e); $$('wlt').textContent = 'LOAD FAILED'; $$('wlp').textContent = String(e.message || e);
  const b = $$('wretry'); b.style.display = 'block'; b.onclick = () => startCity(key);
}

/* ---------------- build scenes ---------------- */
function mkNav(j) {
  const walk = b64(j.walk), gy = new Int16Array(b64(j.gy).buffer);
  const n = { W: j.W, H: j.H, c: j.cell, ox: j.ox, oz: j.oz, mode: j.mode, walk, gy, stad: null };
  n.idx = (x, z) => { const ix = Math.floor((x - n.ox) / n.c), iz = Math.floor((z - n.oz) / n.c); return (ix < 0 || iz < 0 || ix >= n.W || iz >= n.H) ? -1 : ix * n.H + iz; };
  n.ok = (x, z) => {
    if (n.stad && x > n.stad[0] - STAD.hx0 && x < n.stad[0] + STAD.hx1 && z > n.stad[1] - STAD.hz0 && z < n.stad[1] + STAD.hz1) return false;
    const i = n.idx(x, z); return i < 0 ? Math.abs(x) < 2500 && Math.abs(z) < 2500 : walk[i] > 0;
  };
  n.y = (x, z) => { const i = n.idx(x, z); return i < 0 ? n.mode : gy[i] / 20; };
  return n;
}
function pickHouse(n) {
  // "free" cells keep a margin around the bike; the house must connect to the outside world through free cells
  const N = n.W * n.H, fr = new Uint8Array(N), outer = new Uint8Array(N), q = new Int32Array(N); let h = 0, t = 0;
  const wk = (ix, iz) => (ix < 0 || iz < 0 || ix >= n.W || iz >= n.H) ? 1 : n.walk[ix * n.H + iz] > 0;
  for (let ix = 0; ix < n.W; ix++) for (let iz = 0; iz < n.H; iz++) fr[ix * n.H + iz] = (wk(ix, iz) && wk(ix + 1, iz) && wk(ix - 1, iz) && wk(ix, iz + 1) && wk(ix, iz - 1) && wk(ix + 1, iz + 1) && wk(ix - 1, iz - 1) && wk(ix + 1, iz - 1) && wk(ix - 1, iz + 1)) ? 1 : 0;
  const push = (ix, iz) => { if (ix < 0 || iz < 0 || ix >= n.W || iz >= n.H) return; const i = ix * n.H + iz; if (outer[i] || !fr[i]) return; outer[i] = 1; q[t++] = i; };
  for (let ix = 0; ix < n.W; ix++) { push(ix, 0); push(ix, n.H - 1); }
  for (let iz = 0; iz < n.H; iz++) { push(0, iz); push(n.W - 1, iz); }
  while (h < t) { const i = q[h++], ix = (i / n.H) | 0, iz = i - ix * n.H; push(ix + 1, iz); push(ix - 1, iz); push(ix, iz + 1); push(ix, iz - 1); }
  const tx = n.W * 0.55, tz = n.H * 0.5, R0 = 3;
  const clear = (ix, iz) => { for (let a = -R0; a <= R0; a++) for (let b = -R0; b <= R0; b++) { const x = ix + a, z = iz + b; if (x < 0 || z < 0 || x >= n.W || z >= n.H) return false; const i = x * n.H + z; if (n.walk[i] !== 1 || !outer[i]) return false; } return true; };
  let best = null, bd = 1e18;
  for (let ix = R0; ix < n.W - R0; ix++) for (let iz = R0; iz < n.H - R0; iz++) {
    const d = (ix - tx) * (ix - tx) + (iz - tz) * (iz - tz); if (d >= bd) continue;
    if (n.walk[ix * n.H + iz] === 1 && outer[ix * n.H + iz] && clear(ix, iz)) { bd = d; best = [ix, iz]; }
  }
  if (!best) { // relax: any street cell connected to the outside
    for (let ix = 1; ix < n.W - 1; ix++) for (let iz = 1; iz < n.H - 1; iz++) {
      const d = (ix - tx) * (ix - tx) + (iz - tz) * (iz - tz); if (d < bd && n.walk[ix * n.H + iz] === 1 && outer[ix * n.H + iz]) { bd = d; best = [ix, iz]; }
    }
  }
  if (!best) best = [Math.floor(n.W / 2), Math.floor(n.H / 2)];
  return [n.ox + (best[0] + 0.5) * n.c, n.oz + (best[1] + 0.5) * n.c];
}
function build(key, city, stad, player, house, navj) {
  const C = CITIES[key], nav = mkNav(navj); W.nav = nav;
  prep(city.scene, true); prep(stad.scene, true); prep(player.scene, false); prep(house.scene, true);
  city.scene.traverse(o => { if (o.isMesh) { o.updateMatrix(); o.matrixAutoUpdate = false; } });
  const gW = nav.W * nav.c, gH = nav.H * nav.c, cx = nav.ox + gW / 2, cz = nav.oz + gH / 2, big = Math.max(gW, gH), my = nav.mode;
  W.big = big; W.center = new T.Vector3(cx, my, cz);
  // ---- city scene ----
  const cs = new T.Scene(); cs.background = new T.Color(C.sky); cs.fog = new T.Fog(C.sky, big * 0.6, big * 2.2);
  cs.add(new T.HemisphereLight(0xffffff, 0x556070, C.hemi)); const sun = new T.DirectionalLight(C.sun, 1.0); sun.position.set(200, 400, 150); cs.add(sun);
  cs.add(city.scene);
  const gm = new T.Mesh(new T.PlaneGeometry(6000, 6000), new T.MeshLambertMaterial({ color: 0x3b3f46 })); gm.rotation.x = -Math.PI / 2; gm.position.set(cx, my - 0.08, cz); cs.add(gm);
  const house0 = pickHouse(nav); W.houseXZ = house0;
  const sx = nav.ox + gW + 210, sz = house0[1]; nav.stad = [sx, sz]; W.stadXZ = [sx, sz];
  stad.scene.position.set(sx, my, sz); cs.add(stad.scene);
  const plaza = new T.Mesh(new T.PlaneGeometry(90, 150), new T.MeshLambertMaterial({ color: 0xb9bcc2 })); plaza.rotation.x = -Math.PI / 2; plaza.position.set(sx - 178, my + 0.02, sz); cs.add(plaza);
  const road = new T.Mesh(new T.PlaneGeometry(Math.max(10, sx - 178 - (nav.ox + gW)), 16), new T.MeshLambertMaterial({ color: 0x24272c })); road.rotation.x = -Math.PI / 2; road.position.set((sx - 178 + nav.ox + gW) / 2, my + 0.03, sz); cs.add(road);
  W.plaza = [sx - 170, sz];
  const bk = new T.Mesh(new T.CylinderGeometry(2, 2, 90, 16, 1, true), new T.MeshBasicMaterial({ color: 0x38d27a, transparent: true, opacity: 0.35, side: T.DoubleSide, depthWrite: false })); bk.position.set(W.plaza[0], my + 45, W.plaza[1]); cs.add(bk);
  const hb = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 60, 16, 1, true), new T.MeshBasicMaterial({ color: 0xffc83d, transparent: true, opacity: 0.4, side: T.DoubleSide, depthWrite: false })); hb.position.set(house0[0], nav.y(house0[0], house0[1]) + 30, house0[1]); cs.add(hb);
  W.cityScene = cs;
  // ---- player ----
  const pm = player.scene; pm.updateMatrixWorld(true);
  const bb = new T.Box3().setFromObject(pm), ph = bb.max.y - bb.min.y; let ps = ph > 0.01 ? 1.85 / ph : 1; if (!isFinite(ps) || ps * ph < 0.5 || ps * ph > 5) ps = 1;
  pm.scale.setScalar(ps); pm.updateMatrixWorld(true); const b2 = new T.Box3().setFromObject(pm); pm.position.y -= isFinite(b2.min.y) ? b2.min.y : 0;
  const pw = new T.Group(); pw.add(pm); W.player = pw;
  if (player.animations && player.animations.length) {
    W.mixer = new T.AnimationMixer(pm); W.act = W.mixer.clipAction(player.animations[0]); W.act.play(); W.act.paused = true; W.act.time = IDLE_T; W.mixer.update(0);
  }
  // ---- bike ----
  W.bike = makeBike(); cs.add(W.bike);
  // ---- house scene ----
  const hs = new T.Scene(); hs.background = new T.Color(0x0b0d12); hs.add(new T.HemisphereLight(0xffffff, 0x887766, 0.9)); hs.add(house.scene);
  [[0, 2.1, 0], [2.4, 2.1, 0.8], [-1.4, 2.1, 0.4], [1.0, 2.1, -1.0]].forEach(p => { const l = new T.PointLight(0xffe8c8, 0.9, 7); l.position.set(p[0], p[1], p[2]); hs.add(l); });
  W.houseScene = hs;
  startFly();
}
function makeBike() {
  const g = new T.Group(), dark = new T.MeshLambertMaterial({ color: 0x15181d }), red = new T.MeshLambertMaterial({ color: 0xd8322b });
  const wheel = () => { const w = new T.Mesh(new T.TorusGeometry(0.34, 0.04, 8, 20), dark); w.rotation.y = Math.PI / 2; return w; };
  const fw = wheel(), rw = wheel(); fw.position.set(0, 0.38, 0.55); rw.position.set(0, 0.38, -0.55); g.add(fw, rw); g.fw = fw; g.rw = rw;
  const bar = (a, b, r) => { const m = new T.Mesh(new T.CylinderGeometry(r, r, 1, 6), red); const A = new T.Vector3(...a), B = new T.Vector3(...b); m.position.copy(A).add(B).multiplyScalar(0.5); m.scale.y = A.distanceTo(B); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return m; };
  g.add(bar([0, 0.38, -0.55], [0, 0.78, -0.15], 0.025), bar([0, 0.78, -0.15], [0, 0.82, 0.4], 0.025), bar([0, 0.82, 0.4], [0, 0.38, 0.55], 0.025), bar([0, 0.38, -0.55], [0, 0.4, 0.05], 0.025), bar([0, 0.4, 0.05], [0, 0.78, -0.15], 0.025));
  const hb = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.6, 6), dark); hb.rotation.z = Math.PI / 2; hb.position.set(0, 0.95, 0.42); g.add(hb);
  const seat = new T.Mesh(new T.BoxGeometry(0.12, 0.05, 0.25), dark); seat.position.set(0, 0.84, -0.18); g.add(seat);
  g.visible = false; return g;
}
function setClip(moving, speed) {
  if (!W.act) return;
  if (moving) { W.act.paused = false; W.act.timeScale = clamp(speed, 0.4, 1.6); }
  else if (!W.act.paused) { W.act.paused = true; W.act.time = IDLE_T; W.mixer.update(0); }
}

/* ---------------- phase 1: fly-over ---------------- */
function startFly() {
  W.phase = 'fly'; W.scene = W.cityScene; W.bike.visible = false; if (W.player.parent) W.player.parent.remove(W.player);
  show('wfly'); $$('wct').textContent = W.C.name; $$('wcs').textContent = 'YOUR STORY BEGINS HERE'; W.ft = 0; W.fdur = 11;
  const c = W.center, big = W.big, hx = W.houseXZ[0], hz = W.houseXZ[1], hy = W.nav.y(hx, hz), a0 = -0.7;
  const P = (r, h, a) => new T.Vector3(c.x + Math.cos(a) * big * r, c.y + big * h, c.z + Math.sin(a) * big * r);
  W.flyCurve = new T.CatmullRomCurve3([P(0.85, 0.6, a0), P(0.6, 0.38, a0 + 1.3), P(0.35, 0.2, a0 + 2.4), new T.Vector3(hx - 22, hy + 9, hz + 26)]);
  W.flyLook = new T.Vector3(hx, hy + 2, hz); W.skipped = false;
  $$('wskip').onclick = () => { if (W.phase === 'fly') endFly(); };
  fade(false);
}
function flyUpdate(dt) {
  W.ft += dt; const u = clamp(W.ft / W.fdur, 0, 1), e = ease(u);
  W.cam.position.copy(W.flyCurve.getPoint(e));
  const look = new T.Vector3().lerpVectors(W.center, W.flyLook, Math.pow(e, 1.6)); look.y += 4 * (1 - e);
  W.cam.lookAt(look); const f = 62 - 12 * e; if (Math.abs(W.cam.fov - f) > 0.05) { W.cam.fov = f; W.cam.updateProjectionMatrix(); }
  $$('whud2').innerHTML = 'LAT ' + (51.5 + e * 0.01).toFixed(4) + '<br>ALT ' + Math.round(W.cam.position.y - W.center.y) + ' M<br>SCAN ' + Math.round(e * 100) + '%';
  if (u >= 1) endFly();
}
function endFly() { if (W.phase !== 'fly') return; W.phase = 'trans'; fade(true); setTimeout(startHouse, 700); }

/* ---------------- phase 2: house ---------------- */
function startHouse() {
  W.phase = 'house'; W.scene = W.houseScene; W.cam.fov = 58; W.cam.updateProjectionMatrix();
  W.houseScene.add(W.player); W.hp = { x: HOUSE.spawn[0], z: HOUSE.spawn[1], h: Math.PI, sp: 0 };
  W.player.position.set(W.hp.x, HOUSE.y, W.hp.z); W.player.rotation.y = W.hp.h;
  show('whud'); hint('Use the left stick to walk. Go to the front glass door to leave.'); padOn(true); setAct(null);
  W.cam.position.set(W.hp.x, 1.75, W.hp.z + 2.3); W.cam.lookAt(W.hp.x, 1.1, W.hp.z); fade(false);
}
function setAct(label, fn) { const b = $$('wact'); if (!label) { b.style.display = 'none'; b.onclick = null; return; } b.textContent = label; b.style.display = 'block'; b.onclick = fn; }
function moveFace(o, vx, vz, dt) {
  const want = Math.atan2(vx, vz); let d = want - o.h; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; o.h += d * Math.min(1, dt * 10);
}
function houseUpdate(dt) {
  const s = stick(), mag = Math.min(1, Math.hypot(s[0], s[1])), hp = W.hp;
  const run = mag > 0.95, spd = mag > 0.12 ? (run ? 3.2 : 1.7) * mag : 0;
  if (spd > 0) {
    const l = Math.hypot(s[0], s[1]), vx = s[0] / l, vz = s[1] / l;
    const nx = clamp(hp.x + vx * spd * dt, HOUSE.x0, HOUSE.x1), nz = clamp(hp.z + vz * spd * dt, HOUSE.z0, HOUSE.z1);
    hp.x = nx; hp.z = nz; moveFace(hp, vx, vz, dt);
  }
  W.player.position.set(hp.x, HOUSE.y, hp.z); W.player.rotation.y = hp.h;
  setClip(spd > 0, spd / 1.7 * 0.9); if (W.mixer) W.mixer.update(dt);
  const tx = hp.x * 0.75 + 0.3, tz = Math.min(hp.z + 2.3, 3.3);
  W.cam.position.x += (tx - W.cam.position.x) * Math.min(1, dt * 4); W.cam.position.z += (tz - W.cam.position.z) * Math.min(1, dt * 4); W.cam.position.y = 1.75;
  W.cam.lookAt(hp.x, 1.15, hp.z - 0.4);
  const near = hp.z > HOUSE.exitZ;
  if (near && !W.exitShown) { W.exitShown = true; setAct('GO OUTSIDE', leaveHouse); } else if (!near && W.exitShown) { W.exitShown = false; setAct(null); }
}
function leaveHouse() { if (W.phase !== 'house') return; W.phase = 'trans'; setAct(null); padOn(false); fade(true); setTimeout(startBike, 700); }

/* ---------------- phase 3: bike ---------------- */
function startBike() {
  const n = W.nav, hx = W.houseXZ[0], hz = W.houseXZ[1];
  W.phase = 'bike'; W.scene = W.cityScene; W.cam.fov = 62; W.cam.updateProjectionMatrix();
  // face the most open direction (ties broken towards the stadium)
  let bh = Math.PI / 2, bs = -1;
  for (let k = 0; k < 24; k++) {
    const a = k * Math.PI / 12; let run = 0;
    while (run < 60 && n.ok(hx + Math.sin(a) * (run + 1.5), hz + Math.cos(a) * (run + 1.5))) run += 1.5;
    const sc = run + 8 * Math.cos(a - Math.PI / 2); if (sc > bs) { bs = sc; bh = a; }
  }
  W.b = { x: hx, z: hz, h: bh, v: 0, lean: 0, y: n.y(hx, hz) };
  W.bike.visible = true; W.bike.add(W.player); W.player.position.set(0, 0.0, -0.1); W.player.rotation.set(0, 0, 0);
  if (W.act) { W.act.paused = true; W.act.time = IDLE_T; W.mixer.update(0); }
  W.bike.position.set(hx, W.b.y, hz); W.bike.rotation.y = W.b.h;
  show('whud'); hint('Ride to the stadium: follow the green beam. Left stick: up = pedal, left/right = steer.'); padOn(true); setAct(null);
  $$('warr').style.display = 'block'; W.cam.position.set(hx - 7, W.b.y + 3.4, hz); fade(false);
  setTimeout(() => { if (W.phase === 'bike') hint('Follow the arrow to the stadium.'); }, 7000);
}
function bikeUpdate(dt) {
  const n = W.nav, b = W.b, s = stick(), thr = clamp(-s[1], -0.4, 1), steer = s[0];
  const maxV = 15, acc = 9;
  const target = thr > 0.05 ? maxV * thr : (thr < -0.05 ? maxV * thr * 0.2 : 0);
  b.v += clamp(target - b.v, -12 * dt, acc * dt);
  b.v = clamp(b.v, -3, maxV);
  const turn = steer * 1.9 * clamp(Math.abs(b.v) / 4, 0.4, 1) * (b.v < -0.2 ? -1 : 1);
  b.h -= turn * dt;
  const fx = Math.sin(b.h), fz = Math.cos(b.h), step = b.v * dt;
  const sg = step >= 0 ? 1 : -1, free = (x, z) => n.ok(x, z) && n.ok(x + fx * 0.5 * sg, z + fz * 0.5 * sg) && n.ok(x - fz * 0.3, z + fx * 0.3) && n.ok(x + fz * 0.3, z - fx * 0.3);
  let nx = b.x + fx * step, nz = b.z + fz * step;
  if (free(nx, nz)) { b.x = nx; b.z = nz; }
  else if (free(nx, b.z)) { b.x = nx; b.v *= 0.7; }
  else if (free(b.x, nz)) { b.z = nz; b.v *= 0.7; }
  else if ([0.4, -0.4, 0.8, -0.8, 1.2, -1.2].some(da => { const ax = Math.sin(b.h + da) * step, az = Math.cos(b.h + da) * step; if (free(b.x + ax, b.z + az)) { b.x += ax; b.z += az; b.v *= 0.85; return true; } return false; })) { /* slid along the obstacle */ }
  else { b.v = -b.v * 0.25; if (thr < -0.05 || Math.abs(b.v) < 0.3) { const rx = b.x - fx * 0.6 * dt * 4, rz = b.z - fz * 0.6 * dt * 4; if (n.ok(rx, rz)) { b.x = rx; b.z = rz; } } }
  const gy = n.y(b.x, b.z); b.y += (gy - b.y) * Math.min(1, dt * 10);
  b.lean += (-steer * clamp(b.v / maxV, 0, 1) * 0.35 - b.lean) * Math.min(1, dt * 6);
  W.bike.position.set(b.x, b.y, b.z); W.bike.rotation.set(0, b.h, b.lean, 'YXZ');
  W.bike.fw.rotation.x += b.v * dt / 0.34; W.bike.rw.rotation.x += b.v * dt / 0.34;
  const cx = b.x - fx * 7, cz = b.z - fz * 7, cy = b.y + 3.3;
  const k = Math.min(1, dt * 4); W.cam.position.x += (cx - W.cam.position.x) * k; W.cam.position.z += (cz - W.cam.position.z) * k; W.cam.position.y += (cy - W.cam.position.y) * k;
  W.cam.lookAt(b.x + fx * 4, b.y + 1.2, b.z + fz * 4);
  const dx = W.plaza[0] - b.x, dz = W.plaza[1] - b.z, dist = Math.hypot(dx, dz);
  const rel = Math.atan2(dx, dz) - b.h; $$('warrg').style.transform = 'rotate(' + (-90 - rel * 180 / Math.PI) + 'deg)';
  $$('wdist').textContent = 'STADIUM ' + Math.round(dist) + ' M';
  const near = dist < 28;
  if (near && !W.enterShown) { W.enterShown = true; setAct('ENTER STADIUM', enterStadium); } else if (!near && W.enterShown) { W.enterShown = false; setAct(null); }
}
function enterStadium() {
  if (W.phase !== 'bike') return; W.phase = 'trans'; setAct(null); padOn(false); fade(true);
  setTimeout(() => {
    W.on = false; W.scene = null; $$('wl').style.display = 'none'; hideGameHud(false);
    try { begin(); } catch (e) { console.error(e); const s = $$('st'); if (s) s.classList.add('on'); }
  }, 750);
}

/* ---------------- per-frame ---------------- */
function frame() {
  const now = performance.now(), dt = Math.min(0.05, (now - W.t) / 1000); W.t = now;
  const el = R.domElement, a = el.clientWidth / Math.max(1, el.clientHeight);
  if (Math.abs(W.cam.aspect - a) > 1e-3) { W.cam.aspect = a; W.cam.updateProjectionMatrix(); }
  if (W.phase === 'fly') flyUpdate(dt); else if (W.phase === 'house') houseUpdate(dt); else if (W.phase === 'bike') bikeUpdate(dt);
}
})();
