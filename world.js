/* FT 90 world flow: city select -> fly-over -> house -> bike -> stadium.
   Loaded after game.js/visuals.js. If anything fails it falls back to the old start screen. */
(function () {
'use strict';
const CITIES = {
  england: { name: 'ENGLAND', flag: '\uD83C\uDDEC\uD83C\uDDE7', file: 'city_england.glb', nav: 'nav_england.json', sky: 0xa9b7c6, sun: 0xdfe6ee, hemi: 0.95, gnd: 0x58634f, ll: [51.5074, -0.1278] },
  spain:   { name: 'SPAIN',   flag: '\uD83C\uDDEA\uD83C\uDDF8', file: 'city_spain.glb',   nav: 'nav_spain.json',   sky: 0x8fc4f2, sun: 0xfff0cf, hemi: 0.9,  gnd: 0x8a7f6a, ll: [40.4168, -3.7038] },
  italy:   { name: 'ITALY',   flag: '\uD83C\uDDEE\uD83C\uDDF9', file: 'city_italy.glb',   nav: 'nav_italy.json',   sky: 0xf0c995, sun: 0xffd9a0, hemi: 0.85, gnd: 0x8c8266, ll: [41.9028, 12.4964] },
  germany: { name: 'GERMANY', flag: '\uD83C\uDDE9\uD83C\uDDEA', file: 'city_germany.glb', nav: 'nav_germany.json', sky: 0x9cb8d8, sun: 0xf4f7ff, hemi: 0.9,  gnd: 0x59654f, ll: [52.52, 13.405] }
};
const STADIUM_NAME = 'FT 90 STADIUM';
const IDLE_T = 10.0;                 // standing frame inside Ronaldo's clip
const HOUSE = { x0: -2.2, x1: 3.4, z0: -1.6, z1: 2.0, y: 0.25, spawn: [0.6, 0.8], exitZ: 1.35, door: [-0.1, 2.2] };
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
  bindInput();
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
#wl #whud,#wl #wfly{pointer-events:none}
#wl #wskip,#wl #wact,#wl #wview{pointer-events:auto}
#wview{position:absolute;left:5vw;top:max(14px,env(safe-area-inset-top));border:1px solid #fff6;background:#000a;color:#fff;border-radius:18px;padding:7px 14px;font:inherit;font-size:11px;letter-spacing:.12em;display:none;touch-action:manipulation}
#wcrest{position:absolute;left:0;top:0;transform:translate(-50%,-100%);text-align:center;opacity:0;transition:opacity .8s;text-shadow:0 2px 14px #000;pointer-events:none;white-space:nowrap}
#wcrest .cr{width:64px;height:64px;margin:0 auto 6px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#cfd8e6 60%,#8a97ab);display:flex;align-items:center;justify-content:center;font-size:34px;box-shadow:0 6px 26px #0009}
#wcrest b{display:block;font-size:clamp(18px,5vw,30px);letter-spacing:.2em}
#wcrest i{font-style:normal;font-size:11px;letter-spacing:.3em;opacity:.85}
`;
  document.head.appendChild(css);
  const d = document.createElement('div'); d.id = 'wl';
  d.innerHTML = `
<div class="scr" id="wsel"><h1>CHOOSE YOUR CITY</h1><p>Where does your story begin?</p><div id="wgrid"></div><button id="wcred">Credits</button></div>
<div class="scr" id="wload"><h1 id="wlt" style="margin:0;letter-spacing:.12em">LOADING</h1><div id="wbar"><div id="wbf"></div></div><p id="wlp" style="margin:0;opacity:.7;font-size:13px"></p><button class="wc" id="wretry" style="display:none;padding:12px 26px">RETRY</button></div>
<div class="scr" id="wfly"><div class="bar tp"></div><div class="bar bt"></div><div id="wcrest"><div class="cr" id="wcrf"></div><b id="wcrn"></b><i id="wcrc"></i></div><div id="wtitle"><b id="wct"></b><i id="wcs"></i></div><div id="whud2"></div><button id="wskip">SKIP</button></div>
<div class="scr" id="whud"><button id="wview">VIEW: 3RD PERSON</button><div id="whint"></div><div id="warr"><div id="warrg">\u27A4</div><span id="wdist"></span></div><button id="wact"></button></div>
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
  $$('wview').addEventListener('click', () => { W.fp = !W.fp; $$('wview').textContent = W.fp ? 'VIEW: 1ST PERSON' : 'VIEW: 3RD PERSON'; });
}
function show(id) { document.querySelectorAll('#wl .scr').forEach(e => e.classList.toggle('on', e.id === id)); }
function hint(t) { const h = $$('whint'); h.textContent = t; h.style.display = t ? '' : 'none'; }
function fade(on) { $$('wfade').style.opacity = on ? 1 : 0; }
function hideGameHud(on) {
  const sc = $$('sc'); if (sc && sc.parentNode) sc.parentNode.style.display = on ? 'none' : '';
  const pad = $$('pad'); if (pad) pad.style.display = 'none';
}
function padOn(on) { const p = $$('pad'); if (p) p.style.display = on ? 'block' : 'none'; }
function stick() { const I = W.in; if (I && (I.id !== null || I.m)) return [I.x, I.y]; return [typeof jx === 'number' ? jx : 0, typeof jy === 'number' ? jy : 0]; }

/* ---------------- loading ---------------- */
function glb(url, prog) {
  return new Promise((res, rej) => {
    new T.GLTFLoader().load(url, res, e => { if (e && e.total) prog(url, e.loaded / e.total); }, e => rej(new Error('Could not load ' + url)));
  });
}
function b64(s) { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function capTex(root, lim) {
  const seen = new Set();
  root.traverse(o => {
    if (!o.isMesh) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
      ['map', 'emissiveMap', 'alphaMap'].forEach(k => {
        const t = m[k]; if (!t || seen.has(t)) return; seen.add(t);
        const im = t.image; if (!im) return; const w = im.width, h = im.height;
        if (!w || !h || Math.max(w, h) <= lim) return;
        try {
          const sc = lim / Math.max(w, h), cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(w * sc)); cv.height = Math.max(1, Math.round(h * sc));
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); t.image = cv; t.needsUpdate = true;
        } catch (e) {}
      });
    });
  });
}
/* opt: cap = max texture size, lite = drop normal/rough/metal/ao maps, emi = self-light strength (never black), glass = fix see-through windows */
function prep(root, double, opt) {
  opt = opt || {};
  const lin = R.outputEncoding !== T.sRGBEncoding;
  if (opt.cap) { try { capTex(root, opt.cap); } catch (e) {} }
  root.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = !o.isSkinnedMesh;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
      if (double) m.side = T.DoubleSide;
      if ('metalness' in m) { m.metalness = 0; m.roughness = Math.max(m.roughness || 0, 0.6); }
      if (opt.lite) { m.normalMap = null; m.roughnessMap = null; m.metalnessMap = null; m.aoMap = null; }
      if (opt.glass && m.transparent) {
        if (m.map) { m.alphaTest = Math.max(m.alphaTest || 0, 0.35); m.transparent = false; m.depthWrite = true; }
        else { m.transparent = false; m.opacity = 1; if (m.color) m.color.lerp(new T.Color(0x3a4a5e), 0.6); }
      }
      if (opt.emi && 'emissive' in m) {
        if (m.map) { m.emissive = new T.Color(0xffffff); m.emissiveMap = m.map; m.emissiveIntensity = opt.emi; }
        else if (m.color) { m.emissive = m.color.clone(); m.emissiveIntensity = opt.emi * 0.8; }
      }
      if (lin && m.map) { m.map.encoding = T.LinearEncoding; m.map.needsUpdate = true; }
      if (lin && m.emissiveMap) { m.emissiveMap.encoding = T.LinearEncoding; m.emissiveMap.needsUpdate = true; }
      m.needsUpdate = true;
    });
  });
}

/* ---------------- sky + clouds (fly-over) ---------------- */
function makeSky(C) {
  const base = new T.Color(C.sky), hor = base.clone().lerp(new T.Color(0xffffff), 0.55);
  const mat = new T.MeshBasicMaterial({ color: 0xffffff, side: T.BackSide, fog: false, depthWrite: false });
  new T.TextureLoader().load('assets/sky.jpg', t => { t.wrapS = T.RepeatWrapping; t.repeat.x = -1; t.encoding = R.outputEncoding === T.sRGBEncoding ? T.sRGBEncoding : T.LinearEncoding; mat.map = t; mat.needsUpdate = true; }, undefined, () => { mat.color.copy(hor); });
  mat.color.copy(hor);
  const mesh = new T.Mesh(new T.SphereGeometry(1, 40, 24), mat); mesh.renderOrder = -1; mesh.frustumCulled = false;
  return { mesh, hor };
}
function makeClouds(big, my) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d');
  let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 70; i++) {
    const x = rnd() * 256, y = rnd() * 256, r = 14 + rnd() * 34;
    [-256, 0, 256].forEach(ox => [-256, 0, 256].forEach(oy => {
      const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
    }));
  }
  const base = new T.CanvasTexture(cv), grp = new T.Group();
  [0.62, 0.85, 1.1].forEach((h, k) => {
    const t = base.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3 + k, 3 + k);
    const m = new T.Mesh(new T.PlaneGeometry(big * 5, big * 5), new T.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.95, depthWrite: false, fog: false, side: T.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.y = my + big * h; m.frustumCulled = false; grp.add(m);
  });
  return grp;
}

/* ---------------- house analysis: floor, walls, furniture, spawn (works on any layout) ---------------- */
function analyzeHouse(root) {
  const CELL = 0.2, RAD = 0.2;
  root.updateMatrixWorld(true);
  const bb = new T.Box3().setFromObject(root), sz = new T.Vector3(), ctr = new T.Vector3();
  bb.getSize(sz);
  const foot = Math.max(sz.x, sz.z);
  if (foot > 0.01 && (foot < 4 || foot > 40)) { root.scale.multiplyScalar(10 / foot); root.updateMatrixWorld(true); bb.setFromObject(root); bb.getSize(sz); }
  bb.getCenter(ctr); root.position.x -= ctr.x; root.position.z -= ctr.z; root.updateMatrixWorld(true); bb.setFromObject(root); bb.getSize(sz);
  let total = 0; const meshes = [];
  root.traverse(o => {
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
    const m = Array.isArray(o.material) ? o.material[0] : o.material; if (m && m.transparent && m.opacity < 0.15) return;
    meshes.push(o); const g = o.geometry; total += Math.floor((g.index ? g.index.count : g.attributes.position.count) / 3);
  });
  const tri = new Float32Array(total * 9); let nt = 0;
  const va = new T.Vector3(), vb = new T.Vector3(), vc = new T.Vector3();
  meshes.forEach(o => {
    const g = o.geometry, pos = g.attributes.position, idx = g.index, cnt = idx ? idx.count : pos.count;
    for (let i = 0; i + 2 < cnt; i += 3) {
      const a = idx ? idx.getX(i) : i, b = idx ? idx.getX(i + 1) : i + 1, c = idx ? idx.getX(i + 2) : i + 2;
      va.fromBufferAttribute(pos, a).applyMatrix4(o.matrixWorld); vb.fromBufferAttribute(pos, b).applyMatrix4(o.matrixWorld); vc.fromBufferAttribute(pos, c).applyMatrix4(o.matrixWorld);
      const k = nt * 9; tri[k] = va.x; tri[k + 1] = va.y; tri[k + 2] = va.z; tri[k + 3] = vb.x; tri[k + 4] = vb.y; tri[k + 5] = vb.z; tri[k + 6] = vc.x; tri[k + 7] = vc.y; tri[k + 8] = vc.z; nt++;
    }
  });
  const yMin = bb.min.y, hgt = sz.y, BIN = 0.05, nb = Math.ceil(Math.min(hgt * 0.6, 1.6) / BIN) + 3, hist = new Float32Array(nb);
  const nrm = (k) => {
    const ux = tri[k + 3] - tri[k], uy = tri[k + 4] - tri[k + 1], uz = tri[k + 5] - tri[k + 2], wx = tri[k + 6] - tri[k], wy = tri[k + 7] - tri[k + 1], wz = tri[k + 8] - tri[k + 2];
    const x = uy * wz - uz * wy, y = uz * wx - ux * wz, z = ux * wy - uy * wx, l = Math.sqrt(x * x + y * y + z * z);
    return l < 1e-9 ? null : [x / l, y / l, z / l, l * 0.5];
  };
  for (let t = 0; t < nt; t++) {
    const k = t * 9, n = nrm(k); if (!n || n[1] < 0.9) continue;
    const bi = Math.floor(((tri[k + 1] + tri[k + 4] + tri[k + 7]) / 3 - yMin) / BIN); if (bi >= 0 && bi < nb) hist[bi] += n[3];
  }
  let fk = 0, fv = -1; for (let i = 0; i < nb; i++) { const v = hist[i] + (hist[i - 1] || 0) + (hist[i + 1] || 0); if (v > fv) { fv = v; fk = i; } }
  const floorY = yMin + (fk + 0.5) * BIN;
  const gx0 = bb.min.x - 0.2, gz0 = bb.min.z - 0.2, NX = Math.ceil((sz.x + 0.4) / CELL), NZ = Math.ceil((sz.z + 0.4) / CELL);
  const floor = new Uint8Array(NX * NZ), wall = new Uint8Array(NX * NZ), top = new Uint8Array(NX * NZ);
  const ci = x => Math.floor((x - gx0) / CELL), cj = z => Math.floor((z - gz0) / CELL);
  const markPt = (g, x, z) => { const i = ci(x), j = cj(z); if (i >= 0 && j >= 0 && i < NX && j < NZ) g[i * NZ + j] = 1; };
  const markSeg = (g, x0, z0, x1, z1) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 0.05)); for (let q = 0; q <= n; q++) markPt(g, x0 + (x1 - x0) * q / n, z0 + (z1 - z0) * q / n); };
  const fillTri = (g, ax, az, bx, bz, cx, cz) => {
    const i0 = Math.max(0, ci(Math.min(ax, bx, cx))), i1 = Math.min(NX - 1, ci(Math.max(ax, bx, cx))), j0 = Math.max(0, cj(Math.min(az, bz, cz))), j1 = Math.min(NZ - 1, cj(Math.max(az, bz, cz)));
    const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz); if (Math.abs(d) < 1e-12) return;
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const px = gx0 + (i + 0.5) * CELL, pz = gz0 + (j + 0.5) * CELL;
      const l1 = ((bz - cz) * (px - cx) + (cx - bx) * (pz - cz)) / d, l2 = ((cz - az) * (px - cx) + (ax - cx) * (pz - cz)) / d, l3 = 1 - l1 - l2;
      if (l1 >= -0.02 && l2 >= -0.02 && l3 >= -0.02) g[i * NZ + j] = 1;
    }
  };
  for (let t = 0; t < nt; t++) {
    const k = t * 9, n = nrm(k); if (!n) continue;
    const ax = tri[k], ay = tri[k + 1], az = tri[k + 2], bx = tri[k + 3], by = tri[k + 4], bz = tri[k + 5], cx = tri[k + 6], cy = tri[k + 7], cz = tri[k + 8];
    const ym = (ay + by + cy) / 3, lo = Math.min(ay, by, cy), hi = Math.max(ay, by, cy);
    if (n[1] > 0.85) {
      if (Math.abs(ym - floorY) < 0.15) fillTri(floor, ax, az, bx, bz, cx, cz);
      else if (ym > floorY + 0.25 && ym < floorY + 1.3) fillTri(top, ax, az, bx, bz, cx, cz);
    } else if (Math.abs(n[1]) < 0.6 && hi - lo >= 0.4 && hi > floorY + 0.3 && lo < floorY + 1.3) {
      markSeg(wall, ax, az, bx, bz); markSeg(wall, bx, bz, cx, cz); markSeg(wall, cx, cz, ax, az);
    }
  }
  let fn = 0; for (let i = 0; i < floor.length; i++) fn += floor[i];
  const ok = new Uint8Array(NX * NZ); for (let i = 0; i < ok.length; i++) ok[i] = ((fn < 30 || floor[i]) && !wall[i] && !top[i]) ? 1 : 0;
  const N = NX * NZ, dist = new Int16Array(N).fill(9999), q = new Int32Array(N); let qh = 0, qt = 0;
  for (let i = 0; i < N; i++) if (!ok[i]) { dist[i] = 0; q[qt++] = i; }
  while (qh < qt) { const c = q[qh++], i = (c / NZ) | 0, j = c - i * NZ, d = dist[c] + 1; [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]].forEach(p => { if (p[0] < 0 || p[1] < 0 || p[0] >= NX || p[1] >= NZ) return; const e = p[0] * NZ + p[1]; if (dist[e] > d) { dist[e] = d; q[qt++] = e; } }); }
  const c0i = ci(0), c0j = cj(0); let reg = null, sp = null;
  for (const minC of [4, 3, 2, 1]) {
    let best = -1, bd = 1e18;
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) { const e = i * NZ + j; if (ok[e] && dist[e] >= minC) { const d = (i - c0i) * (i - c0i) + (j - c0j) * (j - c0j); if (d < bd) { bd = d; best = e; } } }
    if (best < 0) continue;
    const r = new Uint8Array(N), st = [best]; r[best] = 1; let cnt = 0;
    while (st.length) { const c = st.pop(); cnt++; const i = (c / NZ) | 0, j = c - i * NZ; [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]].forEach(p => { if (p[0] < 0 || p[1] < 0 || p[0] >= NX || p[1] >= NZ) return; const e = p[0] * NZ + p[1]; if (ok[e] && !r[e]) { r[e] = 1; st.push(e); } }); }
    if (cnt >= 40) { reg = r; sp = [gx0 + ((best / NZ | 0) + 0.5) * CELL, gz0 + ((best % NZ) + 0.5) * CELL]; break; }
  }
  if (!reg) throw new Error('no walkable floor found');
  const st1 = (x, z) => { const i = ci(x), j = cj(z); return i >= 0 && j >= 0 && i < NX && j < NZ && reg[i * NZ + j] === 1; };
  const R7 = RAD * 0.7, stand = (x, z) => st1(x, z) && st1(x + RAD, z) && st1(x - RAD, z) && st1(x, z + RAD) && st1(x, z - RAD) && st1(x + R7, z + R7) && st1(x - R7, z + R7) && st1(x + R7, z - R7) && st1(x - R7, z - R7);
  const isWall = (x, z) => { const i = ci(x), j = cj(z); return i < 0 || j < 0 || i >= NX || j >= NZ || wall[i * NZ + j] === 1; };
  let heading = Math.PI, hb = -1;
  for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; let run = 0; while (run < 12 && st1(sp[0] + Math.sin(a) * (run + 0.1), sp[1] + Math.cos(a) * (run + 0.1))) run += 0.1; if (run > hb) { hb = run; heading = a; } }
  heading = 0;   // face the glass doors at the front of the house
  const ceilY = Math.max(2.0, Math.min(hgt - (floorY - yMin), 3.2)) - 0.12, ly = Math.min(2.1, ceilY - 0.15);
  const cells = []; for (let i = 0; i < NX; i += 2) for (let j = 0; j < NZ; j += 2) if (reg[i * NZ + j]) cells.push([gx0 + (i + 0.5) * CELL, gz0 + (j + 0.5) * CELL]);
  const lights = [[sp[0], ly, sp[1]]];
  for (let n = 0; n < 3 && cells.length; n++) { let bp = null, bdd = -1; cells.forEach(c => { let md = 1e9; lights.forEach(l => { md = Math.min(md, (c[0] - l[0]) * (c[0] - l[0]) + (c[1] - l[2]) * (c[1] - l[2])); }); if (md > bdd) { bdd = md; bp = c; } }); if (bdd < 4) break; lights.push([bp[0], ly, bp[1]]); }
  root.position.y -= floorY; root.updateMatrixWorld(true);
  return { stand, wall: isWall, spawn: sp, heading, ceilY, lights, floorY };
}
/* END analyzeHouse */
function fallbackHouse() {
  const inH = (x, z) => x > HOUSE.x0 && x < HOUSE.x1 && z > HOUSE.z0 && z < HOUSE.z1;
  return { stand: inH, wall: (x, z) => !(x > HOUSE.x0 - 0.5 && x < HOUSE.x1 + 0.5 && z > HOUSE.z0 - 0.5 && z < HOUSE.z1 + 1.2), spawn: HOUSE.spawn.slice(), heading: Math.PI, ceilY: 2.2, lights: [[0, 2.0, 0], [2.4, 2.0, 0.8], [-1.4, 2.0, 0.4], [1.0, 2.0, -1.0]] };
}

/* ---------------- own joystick + drag-to-look (does not depend on game.js) ---------------- */
function bindInput() {
  const pad = $$('pad'), kn = $$('kn'), I = W.in = { x: 0, y: 0, id: null, m: false }; let base = null;
  const knob = (px, py) => { if (!kn) return; if (base === null) { const t = getComputedStyle(kn).transform; base = (t && t !== 'none') ? ' ' + t : ''; } kn.style.transform = 'translate(' + px + 'px,' + py + 'px)' + base; };
  const aim = (cx, cy) => { const r = pad.getBoundingClientRect(), R0 = Math.max(24, r.width / 2), ox = r.left + r.width / 2, oy = r.top + r.height / 2; let dx = (cx - ox) / R0, dy = (cy - oy) / R0; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } I.x = dx; I.y = dy; knob(dx * R0 * 0.55, dy * R0 * 0.55); };
  const end = () => { I.id = null; I.m = false; I.x = 0; I.y = 0; knob(0, 0); };
  if (pad) {
    pad.addEventListener('touchstart', e => { if (!W.on) return; const t = e.changedTouches[0]; I.id = t.identifier; aim(t.clientX, t.clientY); e.preventDefault(); }, { passive: false });
    window.addEventListener('touchmove', e => { if (I.id === null) return; for (const t of e.changedTouches) if (t.identifier === I.id) { aim(t.clientX, t.clientY); e.preventDefault(); } }, { passive: false });
    const te = e => { if (I.id === null) return; for (const t of e.changedTouches) if (t.identifier === I.id) end(); };
    window.addEventListener('touchend', te); window.addEventListener('touchcancel', te);
    pad.addEventListener('mousedown', e => { if (!W.on) return; I.m = true; aim(e.clientX, e.clientY); });
    window.addEventListener('mousemove', e => { if (I.m) aim(e.clientX, e.clientY); });
    window.addEventListener('mouseup', () => { if (I.m) end(); });
  }
  const cv = R.domElement; let lid = null, lx = 0, ly = 0;
  cv.addEventListener('touchstart', e => { if (lid !== null || (W.phase !== 'house' && W.phase !== 'foot')) return; const t = e.changedTouches[0]; lid = t.identifier; lx = t.clientX; ly = t.clientY; }, { passive: true });
  window.addEventListener('touchmove', e => { if (lid === null) return; for (const t of e.changedTouches) if (t.identifier === lid) { W.cy -= (t.clientX - lx) * 0.0065; W.cp = clamp(W.cp + (t.clientY - ly) * 0.004, -0.3, 0.8); lx = t.clientX; ly = t.clientY; } }, { passive: true });
  const le = e => { if (lid === null) return; for (const t of e.changedTouches) if (t.identifier === lid) lid = null; };
  window.addEventListener('touchend', le); window.addEventListener('touchcancel', le);
}
function loadScript(u) { return new Promise((res, rej) => { const el = document.createElement('script'); el.src = u; el.onload = res; el.onerror = () => rej(new Error('script ' + u)); document.head.appendChild(el); }); }
function loadLibs() {
  if (W.libs) return W.libs; const base = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
  W.libs = loadScript(base + 'libs/fflate.min.js').then(() => loadScript(base + 'loaders/FBXLoader.js')).then(() => loadScript(base + 'utils/SkeletonUtils.js')).catch(e => { console.warn('libs', e); });
  return W.libs;
}
function loadPlayerNew(upd) {
  return loadLibs().then(() => {
    if (!T.FBXLoader) throw new Error('FBXLoader missing');
    return Promise.all([new Promise((res, rej) => new T.FBXLoader().load('assets/ronaldo.fbx', res, e => { if (upd && e.total) upd('assets/ronaldo.fbx', e.loaded / e.total); }, rej)), fetch('assets/ronaldo_anims.json').then(r => r.json())]);
  }).then(a => ({ fbx: a[0], anims: a[1] })).catch(e => { console.warn('FBX player failed, falling back', e); return null; });
}
const PROPS = ['bus', 'camry', 'taxi', 'ford', 'gazelle', 'lambo', 'tree', 'crowd', 'sofia'];
function startCity(key) {
  const C = CITIES[key]; W.key = key; W.C = C;
  show('wload'); $$('wlt').textContent = 'LOADING ' + C.name; $$('wretry').style.display = 'none';
  const urls = [C.file, 'assets/anfield.glb', 'house_modern.glb', 'assets/ronaldo.fbx'], p = {};
  const upd = (u, f) => { p[u] = f; const a = urls.reduce((s0, k) => s0 + (p[k] || 0), 0) / urls.length; $$('wbf').style.width = (a * 100).toFixed(0) + '%'; $$('wlp').textContent = u.replace(/^assets\//, '').replace(/\.(glb|fbx)$/, '').replace(/_/g, ' '); };
  const props = {}; const pr = Promise.all(PROPS.map(k => glb('assets/' + k + '.glb', () => {}).then(g => { props[k] = g; }).catch(() => {})));
  Promise.all([glb(C.file, upd), glb('assets/anfield.glb', upd), glb('house_modern.glb', upd), fetch(C.nav).then(r => r.json()), loadPlayerNew(upd).then(r => r || glb('player_ronaldo.glb', upd)), pr])
    .then(a => { try { build(key, a[0], a[1], a[2], a[3], a[4], props); } catch (e) { fail(e, key); } })
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
  n.okFree = (x, z) => { const i = n.idx(x, z); return i < 0 ? Math.abs(x) < 2500 && Math.abs(z) < 2500 : walk[i] > 0; };
  n.ok = (x, z) => {
    if (n.rect && x > n.rect[0] && x < n.rect[1] && z > n.rect[2] && z < n.rect[3]) return false;
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
function build(key, city, stad, house, navj, pl, props) {
  const C = CITIES[key], nav = mkNav(navj); W.nav = nav;
  prepCity(city.scene, key); prepScan(stad.scene); prep(house.scene, true, { cap: 2048, emi: 0.22 });
  const gW = nav.W * nav.c, gH = nav.H * nav.c, cx = nav.ox + gW / 2, cz = nav.oz + gH / 2, big = Math.max(gW, gH), my = nav.mode;
  W.big = big; W.center = new T.Vector3(cx, my, cz);
  const cs = new T.Scene(); const sky = makeSky(C); cs.background = sky.hor.clone(); cs.fog = new T.Fog(sky.hor.clone(), big * 0.6, big * 2.2);
  W.dome = sky.mesh; W.dome.scale.setScalar(Math.max(5000, big * 8) * 0.9); cs.add(W.dome); W.clouds = makeClouds(big, my); cs.add(W.clouds);
  W.cam.far = Math.max(5000, big * 8); W.cam.updateProjectionMatrix();
  cs.add(new T.HemisphereLight(0xffffff, 0x556070, C.hemi * 0.8)); cs.add(new T.AmbientLight(0xffffff, 0.1)); const sun = new T.DirectionalLight(C.sun, 1.0); sun.position.set(200, 400, 150); cs.add(sun);
  // city: merged by material, plus shared copies around it for the opening
  const merged = mergeByMaterial(city.scene); cs.add(merged); W.cityMerged = merged;
  const gm = new T.Mesh(new T.PlaneGeometry(12000, 12000), new T.MeshLambertMaterial({ color: 0xffffff, map: makeGroundTex(C.gnd) })); gm.rotation.x = -Math.PI / 2; gm.position.set(cx, my - 0.6, cz); cs.add(gm);
  const house0 = pickHouse(nav); W.houseXZ = house0;
  // ---- stadium tile beside the city (side + rotation differ per city) ----
  const pc = PLACE[key] || PLACE.england, gap = 60, Rr = tileRectFor(pc.rot), rcx = (Rr.x0 + Rr.x1) / 2, rcz = (Rr.z0 + Rr.z1) / 2;
  const cMinX = nav.ox, cMaxX = nav.ox + gW, cMinZ = nav.oz, cMaxZ = nav.oz + gH; let px, pz, dir, Bp, Lc;
  if (pc.side === 'E') { px = cMaxX + gap - Rr.x0; pz = cz - rcz; dir = [1, 0]; Bp = [cMaxX + gap / 2, cz]; Lc = gH; }
  else if (pc.side === 'W') { px = cMinX - gap - Rr.x1; pz = cz - rcz; dir = [-1, 0]; Bp = [cMinX - gap / 2, cz]; Lc = gH; }
  else if (pc.side === 'S') { pz = cMaxZ + gap - Rr.z0; px = cx - rcx; dir = [0, 1]; Bp = [cx, cMaxZ + gap / 2]; Lc = gW; }
  else { pz = cMinZ - gap - Rr.z1; px = cx - rcx; dir = [0, -1]; Bp = [cx, cMinZ - gap / 2]; Lc = gW; }
  const along = [-dir[1], dir[0]], rect = [px + Rr.x0, px + Rr.x1, pz + Rr.z0, pz + Rr.z1];
  const tg = new T.Group(); tg.position.set(px, my, pz); tg.rotation.y = pc.rot; tg.add(stad.scene); try { const pt0 = makePitch(); pt0.rotation.y = PITCH_YAW; tg.add(pt0); } catch (e) { console.warn('pitch', e); } cs.add(tg); tg.updateMatrixWorld(true);
  nav.rect = rect; nav.stad = null; W.stadXZ = [px, pz]; W.tileRect = rect; W.plaza = [Bp[0] + dir[0] * (gap / 2 - 6), Bp[1] + dir[1] * (gap / 2 - 6)];
  // neighbours (opening only)
  const nbr = new T.Group(), gp = 50; W.nbr = nbr; cs.add(nbr);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
    if (!i && !j) continue; const ncx = cx + i * (gW + gp), ncz = cz + j * (gH + gp);
    if (ncx + gW / 2 > rect[0] - 10 && ncx - gW / 2 < rect[1] + 10 && ncz + gH / 2 > rect[2] - 10 && ncz - gH / 2 < rect[3] + 10) continue;
    const w = new T.Group(), inner = shareGroup(merged); inner.position.set(-cx, 0, -cz); w.add(inner); w.position.set(ncx, 0, ncz); w.rotation.y = ((i + j) & 1) ? Math.PI : 0; nbr.add(w);
  }
  try { W.outskirts = makeOutskirts2(cs, C, [[nav.ox - gW - gp - 30, nav.ox + 2 * gW + gp + 30, nav.oz - gH - gp - 30, nav.oz + 2 * gH + gp + 30], [rect[0] - 40, rect[1] + 40, rect[2] - 40, rect[3] + 40], [Bp[0] - 40, Bp[0] + 40, Bp[1] - 40, Bp[1] + 40]], cx, cz, my, big); } catch (e) { console.warn('outskirts failed', e); }
  // walkable stadium (seeds: pitch centre + the plaza edge of the tile)
  try {
    const seeds = [[px, pz]]; for (let k = -100; k <= 100; k += 25) seeds.push([Bp[0] + dir[0] * (gap / 2 + 6) + along[0] * k, Bp[1] + dir[1] * (gap / 2 + 6) + along[1] * k]);
    W.walk = buildWalk2(stad.scene, 0.75, seeds, my); const py = W.walk.surf(px, pz, my + 0.3); W.walk.pitch = [px, (py === null ? my : py) + 0.09, pz];
  } catch (e) { console.warn('stadium walk grid failed', e); W.walk = null; }
  try { placeProps(cs, props || {}, { B: Bp, dir, along, gap, L: Math.min(Lc, 420), my }); } catch (e) { console.warn('props failed', e); }
  const bk = new T.Mesh(new T.CylinderGeometry(2, 2, 90, 16, 1, true), new T.MeshBasicMaterial({ color: 0x38d27a, transparent: true, opacity: 0.35, side: T.DoubleSide, depthWrite: false })); bk.position.set(W.plaza[0], my + 45, W.plaza[1]); cs.add(bk);
  const hb = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 60, 16, 1, true), new T.MeshBasicMaterial({ color: 0xffc83d, transparent: true, opacity: 0.4, side: T.DoubleSide, depthWrite: false })); hb.position.set(house0[0], nav.y(house0[0], house0[1]) + 30, house0[1]); cs.add(hb);
  W.cityScene = cs;
  // ---- player ----
  if (pl && pl.fbx) { W.pa = makePlayerFBX(pl); W.player = W.pa.pw; W.rig = null; } else { W.pa = null; W.rig = fitPlayer(pl); W.player = W.rig.pw; }
  W.mixer = null; W.act = null;
  W.bike = makeBike(); cs.add(W.bike);
  // ---- house scene ----
  let G; try { G = analyzeHouse(house.scene); } catch (e) { console.error('house analysis failed, using fallback', e); G = fallbackHouse(); }
  W.hg = G;
  const hs = new T.Scene(); hs.background = new T.Color(0x0b0d12); hs.add(new T.HemisphereLight(0xffffff, 0x998877, 0.85)); hs.add(new T.AmbientLight(0xffffff, 0.4));
  const dl = new T.DirectionalLight(0xfff2dd, 0.6); dl.position.set(3, 8, 4); hs.add(dl); hs.add(house.scene);
  G.lights.forEach(p => { const l = new T.PointLight(0xffe8c8, 0.9, 9); l.position.set(p[0], p[1], p[2]); hs.add(l); });
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

/* ---------------- phase 1: fly-over (FC-style: clouds -> city -> low swoop -> stadium hero shot) ---------------- */
function startFly() {
  W.phase = 'fly'; W.scene = W.cityScene; W.bike.visible = false; if (W.nbr) W.nbr.visible = true; if (W.player.parent) W.player.parent.remove(W.player);
  const C = W.C, big = W.big, c = W.center, S = new T.Vector3(W.stadXZ[0], c.y, W.stadXZ[1]);
  show('wfly'); $$('wct').textContent = C.name; $$('wcs').textContent = 'YOUR STORY BEGINS HERE'; $$('wtitle').style.opacity = 1;
  $$('wcrf').textContent = C.flag; $$('wcrn').textContent = STADIUM_NAME; $$('wcrc').textContent = C.name + ' \u00B7 HOME OF FT 90'; $$('wcrest').style.opacity = 0;
  W.cam.near = 3; W.cam.far = Math.max(5000, big * 8); W.cam.updateProjectionMatrix();
  W.cityScene.fog.near = big * 1.1; W.cityScene.fog.far = big * 3.6;
  if (W.clouds) { W.clouds.visible = true; W.clouds.children.forEach(m => { m.material.opacity = 0.95; }); }
  const alt = clamp(big * 0.07, 70, 170), RR = 400, V = (x, y, z) => new T.Vector3(x, y, z), a0 = Math.atan2(c.z - S.z, c.x - S.x);
  const at = a => V(S.x + Math.cos(a) * RR, c.y + alt, S.z + Math.sin(a) * RR), mid = new T.Vector3().lerpVectors(c, S, 0.5), perp = V(-(S.z - c.z), 0, S.x - c.x).normalize();
  const Sl = S.clone(); Sl.y = c.y + 28; const Sc = new T.Vector3().lerpVectors(c, S, 0.3);
  W.fk = [
    { t: 0,    p: V(c.x - perp.x * big * 0.3 - (S.x - c.x) * 0.2, c.y + big * 1.7, c.z - perp.z * big * 0.3 - (S.z - c.z) * 0.2), l: c.clone(), f: 48 },
    { t: 3.4,  p: V(c.x - perp.x * big * 0.42 - (S.x - c.x) * 0.1, c.y + big * 0.5, c.z - perp.z * big * 0.42 - (S.z - c.z) * 0.1), l: Sc, f: 54 },
    { t: 6.8,  p: V(mid.x + perp.x * big * 0.12, c.y + alt * 1.6, mid.z + perp.z * big * 0.12), l: Sl, f: 60 },
    { t: 9.6,  p: at(a0 + 1.35), l: Sl, f: 58 },
    { t: 12.0, p: at(a0 + 2.25), l: Sl, f: 54 },
    { t: 14.4, p: at(a0 + 3.0), l: Sl, f: 50 }
  ];
  W.fdur = 14.4; W.ft = 0;
  W.fpos = new T.CatmullRomCurve3(W.fk.map(k => k.p), false, 'centripetal'); W.flook = new T.CatmullRomCurve3(W.fk.map(k => k.l), false, 'centripetal');
  W.skipped = false; $$('wskip').onclick = () => { if (W.phase === 'fly') endFly(); };
  fade(false);
}
function flyUpdate(dt) {
  W.ft += dt; const K = W.fk, tt = Math.min(W.ft, W.fdur); let i = 0; while (i < K.length - 2 && tt > K[i + 1].t) i++;
  const s = clamp((tt - K[i].t) / (K[i + 1].t - K[i].t), 0, 1), u = (i + s) / (K.length - 1);
  W.cam.position.copy(W.fpos.getPoint(u)); W.cam.lookAt(W.flook.getPoint(u)); W.cam.rotateZ(Math.sin(W.ft * 0.5) * 0.02 * (tt < 6 ? 1 : 0.5));
  const f = K[i].f + (K[i + 1].f - K[i].f) * ease(s); if (Math.abs(W.cam.fov - f) > 0.05) { W.cam.fov = f; W.cam.updateProjectionMatrix(); }
  if (W.clouds) W.clouds.children.forEach((m, k) => { m.material.map.offset.x += dt * 0.004 * (k + 1); m.material.opacity = tt > 4.2 ? Math.max(0.2, m.material.opacity - dt * 0.5) : 0.95; });
  $$('wtitle').style.opacity = clamp(1 - (tt - 3.0), 0, 1);
  const cr = $$('wcrest');
  if (tt > 8.4) {
    const _pv = W.pv || (W.pv = new T.Vector3()); _pv.set(W.stadXZ[0], W.center.y + 95, W.stadXZ[1]).project(W.cam);
    if (_pv.z < 1) { cr.style.left = ((_pv.x * 0.5 + 0.5) * innerWidth) + 'px'; cr.style.top = ((-_pv.y * 0.5 + 0.5) * innerHeight) + 'px'; cr.style.opacity = tt > 8.8 ? 1 : 0; } else cr.style.opacity = 0;
  }
  const ll = W.C.ll;
  $$('whud2').innerHTML = 'LAT ' + Math.abs(ll[0]).toFixed(4) + '\u00B0 ' + (ll[0] >= 0 ? 'N' : 'S') + '<br>LON ' + Math.abs(ll[1]).toFixed(4) + '\u00B0 ' + (ll[1] >= 0 ? 'E' : 'W') + '<br>ALT ' + Math.max(0, Math.round(W.cam.position.y - W.center.y)) + ' M';
  if (W.ft >= W.fdur) endFly();
}
function endFly() { if (W.phase !== 'fly') return; W.phase = 'trans'; $$('wcrest').style.opacity = 0; fade(true); setTimeout(startHouse, 700); }

/* ---------------- phase 2: house ---------------- */
function startHouse() {
  const G = W.hg;
  W.phase = 'house'; W.scene = W.houseScene; W.cam.fov = 58; W.cam.near = 0.08; W.cam.far = 200; W.cam.updateProjectionMatrix();
  if (W.player.parent) W.player.parent.remove(W.player);
  W.houseScene.add(W.player); W.player.visible = true;
  W.hp = { x: G.spawn[0], z: G.spawn[1], h: G.heading, sp: 0 }; W.cy = G.heading + Math.PI; W.cp = 0.22; W.cam.position.set(W.hp.x, 1.6, W.hp.z);
  W.player.position.set(W.hp.x, 0, W.hp.z); W.player.rotation.set(0, W.hp.h, 0);
  show('whud'); $$('wview').style.display = 'block'; padOn(true);
  setAct(null); W.exitShown = false; fade(false);
  hint('Left stick: walk. Drag the screen: look around. Walk to the glass doors at the front of the living room to go outside.');
  setTimeout(() => { if (W.phase === 'house') hint(''); }, 10000);
}
function setAct(label, fn) { const b = $$('wact'); if (!label) { b.style.display = 'none'; b.onclick = null; return; } b.textContent = label; b.style.display = 'block'; b.onclick = fn; }
function moveFace(o, vx, vz, dt) {
  const want = Math.atan2(vx, vz); let d = want - o.h; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; o.h += d * Math.min(1, dt * 10);
}
function houseUpdate(dt) {
  const G = W.hg, s = stick(), mag = Math.min(1, Math.hypot(s[0], s[1])), hp = W.hp;
  const run = mag > 0.95, spd = mag > 0.12 ? (run ? 3.2 : 1.7) * mag : 0;
  if (spd > 0) {
    const cy = W.cy, fx = -Math.sin(cy), fz = -Math.cos(cy), rx = Math.cos(cy), rz = -Math.sin(cy);
    let vx = fx * -s[1] + rx * s[0], vz = fz * -s[1] + rz * s[0]; const l = Math.hypot(vx, vz) || 1; vx /= l; vz /= l;
    const nx = hp.x + vx * spd * dt, nz = hp.z + vz * spd * dt;
    if (G.stand(nx, nz)) { hp.x = nx; hp.z = nz; } else if (G.stand(nx, hp.z)) hp.x = nx; else if (G.stand(hp.x, nz)) hp.z = nz;
    moveFace(hp, vx, vz, dt);
  }
  W.player.position.set(hp.x, 0, hp.z); W.player.rotation.y = hp.h;
  animPlayer(dt, spd, false);
  const dd = Math.hypot(hp.x - HOUSE.door[0], hp.z - HOUSE.door[1]), near = dd < 1.1;
  if (near && !W.exitShown) { W.exitShown = true; setAct('GO OUTSIDE', leaveHouse); } else if (!near && W.exitShown) { W.exitShown = false; setAct(null); }
  const k = Math.min(1, dt * 14);
  if (W.fp) {
    W.player.visible = false; const cy = W.cy, pit = W.cp - 0.22;
    W.cam.position.set(hp.x, 1.6, hp.z); W.cam.lookAt(hp.x - Math.sin(cy) * 3, 1.6 - Math.sin(pit) * 3, hp.z - Math.cos(cy) * 3);
  } else {
    const cp = clamp(W.cp, -0.3, 0.8), ch = Math.cos(cp), sh = Math.sin(cp), DIST = 2.4;
    let d = DIST; for (let q = 0.2; q <= DIST; q += 0.1) { if (G.wall(hp.x + Math.sin(W.cy) * ch * q, hp.z + Math.cos(W.cy) * ch * q)) { d = Math.max(0.25, q - 0.3); break; } }
    const ty = clamp(1.38 + sh * d, 0.3, G.ceilY);
    W.cam.position.x += (hp.x + Math.sin(W.cy) * ch * d - W.cam.position.x) * k; W.cam.position.z += (hp.z + Math.cos(W.cy) * ch * d - W.cam.position.z) * k; W.cam.position.y += (ty - W.cam.position.y) * k;
    W.player.visible = d > 0.9; W.cam.lookAt(hp.x, 1.25, hp.z);
  }
}
function leaveHouse() { if (W.phase !== 'house') return; W.phase = 'trans'; setAct(null); padOn(false); fade(true); setTimeout(startBike, 700); }

/* ---------------- phase 3: bike ---------------- */
function startBike() {
  const n = W.nav, hx = W.houseXZ[0], hz = W.houseXZ[1];
  W.phase = 'bike'; W.scene = W.cityScene; W.cam.fov = 62; W.cam.near = 0.4; W.cam.far = Math.max(5000, W.big * 8); W.cam.updateProjectionMatrix(); if (W.nbr) W.nbr.visible = false;
  W.cityScene.fog.near = W.big * 0.6; W.cityScene.fog.far = W.big * 2.2; if (W.clouds) W.clouds.visible = false; W.player.visible = true; $$('wview').style.display = 'block';
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
  animPlayer(dt, b.v, true);
  const gy = n.y(b.x, b.z); b.y += (gy - b.y) * Math.min(1, dt * 10);
  b.lean += (-steer * clamp(b.v / maxV, 0, 1) * 0.35 - b.lean) * Math.min(1, dt * 6);
  W.bike.position.set(b.x, b.y, b.z); W.bike.rotation.set(0, b.h, b.lean, 'YXZ');
  W.bike.fw.rotation.x += b.v * dt / 0.34; W.bike.rw.rotation.x += b.v * dt / 0.34;
  if (W.fp) {
    W.player.visible = false; W.cam.position.set(b.x + fx * 0.25, b.y + 1.55, b.z + fz * 0.25); W.cam.lookAt(b.x + fx * 8, b.y + 1.35, b.z + fz * 8);
  } else {
    W.player.visible = true;
    const cx = b.x - fx * 7, cz = b.z - fz * 7, cy = b.y + 3.3, k = Math.min(1, dt * 4);
    W.cam.position.x += (cx - W.cam.position.x) * k; W.cam.position.z += (cz - W.cam.position.z) * k; W.cam.position.y += (cy - W.cam.position.y) * k;
    W.cam.lookAt(b.x + fx * 4, b.y + 1.2, b.z + fz * 4);
  }
  const dx = W.plaza[0] - b.x, dz = W.plaza[1] - b.z, dist = Math.hypot(dx, dz);
  const rel = Math.atan2(dx, dz) - b.h; $$('warrg').style.transform = 'rotate(' + (-90 - rel * 180 / Math.PI) + 'deg)';
  $$('wdist').textContent = 'STADIUM ' + Math.round(dist) + ' M';
  const near = dist < 28;
  if (near && !W.enterShown) { W.enterShown = true; setAct('PARK & WALK IN', startFoot); } else if (!near && W.enterShown) { W.enterShown = false; setAct(null); }
}



/* ---------------- city materials (rules from inspecting the four city files) ---------------- */
function prepCity(root, key) {
  const lin = R.outputEncoding !== T.sRGBEncoding;
  const fix = t => { if (t && lin) { t.encoding = T.LinearEncoding; t.needsUpdate = true; } };
  const seen = new Set();
  root.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = true; o.matrixAutoUpdate = false; o.updateMatrix();
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    // England ships every building twice (albedo + baked "Lightmap" overlay) and invisible collision volumes: hide the overlays and helpers
    if (mats.some(m => /collision|lightmap/i.test(m.name || ''))) { o.visible = false; return; }
    // Spain's vertex colours are almost black (mean 0.13): drop them when they are dark
    const ca = o.geometry && o.geometry.attributes.color;
    if (ca) {
      let sum = 0, n = 0; for (let i = 0; i < ca.count; i += 7) { sum += ca.getX(i) + ca.getY(i) + ca.getZ(i); n += 3; }
      if (n && sum / n < 0.55) { o.geometry.deleteAttribute('color'); mats.forEach(m => { m.vertexColors = false; m.needsUpdate = true; }); }
    }
    mats.forEach(m => {
      if (seen.has(m)) return; seen.add(m);
      m.side = T.DoubleSide;
      if ('metalness' in m) { m.metalness = 0; m.roughness = Math.max(m.roughness || 0, 0.7); }
      m.normalMap = null; m.roughnessMap = null; m.metalnessMap = null; m.aoMap = null;
      if (m.transparent) {
        if (/cross|decal|parking/i.test(m.name || '')) { m.depthWrite = false; m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; }
        else if (m.map) { m.alphaTest = Math.max(m.alphaTest || 0, 0.3); m.transparent = false; m.depthWrite = true; }
        else { m.transparent = false; m.opacity = 1; }
      }
      if ('emissive' in m && m.map) { m.emissive = new T.Color(0xffffff); m.emissiveMap = m.map; m.emissiveIntensity = 0.1; }
      fix(m.map); fix(m.emissiveMap); m.needsUpdate = true;
    });
  });
}

/* ---------------- outskirts: buildings around the city, along the avenue and the stadium so it is not floating on a flat plane ---------------- */
function makeOutskirts(cs, C, nav, gW, gH, sx, sz, my, big) {
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 128; const g = cv.getContext('2d');
  g.fillStyle = '#d9dde2'; g.fillRect(0, 0, 64, 128);
  for (let r = 0; r < 8; r++) for (let q = 0; q < 4; q++) { g.fillStyle = ((r * 7 + q * 3) % 5) === 0 ? '#f2d98a' : '#4b5b70'; g.fillRect(q * 16 + 3, r * 16 + 4, 10, 9); }
  const tex = new T.CanvasTexture(cv); tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.anisotropy = 4; tex.encoding = R.outputEncoding === T.sRGBEncoding ? T.sRGBEncoding : T.LinearEncoding;
  const P = [], N = [], UV = [], COL = [];
  let sd = 21; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const tint = new T.Color(C.sky).lerp(new T.Color(0xffffff), 0.75);
  const quad = (c4, nx, ny, nz, u, v, col) => {
    const uv = [[0, 0], [u, 0], [u, v], [0, v]];
    [0, 1, 2, 0, 2, 3].forEach(i => { P.push(c4[i][0], c4[i][1], c4[i][2]); N.push(nx, ny, nz); UV.push(uv[i][0], uv[i][1]); COL.push(col.r, col.g, col.b); });
  };
  const box = (cx, cz, w, d, h, col) => {
    const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2, y0 = my - 0.5, y1 = my + h, uw = w / 10, ud = d / 10, vh = h / 25.6;
    quad([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], 0, 0, 1, uw, vh, col);
    quad([[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], 0, 0, -1, uw, vh, col);
    quad([[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], 1, 0, 0, ud, vh, col);
    quad([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], -1, 0, 0, ud, vh, col);
    quad([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], 0, 1, 0, 0.001, 0.001, col);
  };
  const cx0 = nav.ox + gW / 2, cz0 = nav.oz + gH / 2, span = big * 2.4, step = 55; let count = 0;
  for (let x = cx0 - span; x <= cx0 + span && count < 2500; x += step) for (let z = cz0 - span; z <= cz0 + span && count < 2500; z += step) {
    const px = x + (rnd() - 0.5) * 28, pz = z + (rnd() - 0.5) * 28;
    if (px > nav.ox - 25 && px < nav.ox + gW + 25 && pz > nav.oz - 25 && pz < nav.oz + gH + 25) continue;
    if (Math.abs(px - sx) < 250 && Math.abs(pz - sz) < 130) continue;
    const d = Math.hypot(px - cx0, pz - cz0), prob = clamp(0.92 - d / (span * 1.2), 0.12, 0.9); if (rnd() > prob) continue;
    const k = 0.78 + rnd() * 0.27, h = (14 + rnd() * 40) * clamp(1.5 - d / span, 0.45, 1.3);
    box(px, pz, 22 + rnd() * 26, 22 + rnd() * 26, h, new T.Color(tint.r * k, tint.g * k, tint.b * k)); count++;
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(N, 3));
  geo.setAttribute('uv', new T.Float32BufferAttribute(UV, 2)); geo.setAttribute('color', new T.Float32BufferAttribute(COL, 3));
  const mesh = new T.Mesh(geo, new T.MeshLambertMaterial({ map: tex, vertexColors: true, side: T.DoubleSide }));
  mesh.frustumCulled = false; cs.add(mesh); return mesh;
}


/* =====================================================================================================
   v5: Anfield scan stadium placed beside each city, merged city + duplicated neighbours for the opening,
   FBX Ronaldo with 23 animations, props, walkable stadium
   ===================================================================================================== */
const TILE = { x0: -228, x1: 186, z0: -206, z1: 143 };   // local bounds of assets/anfield.glb (pitch centre = origin, pitch long axis at -50 deg, ground = y 0, west edge is the flat one)
const PITCH_YAW = 50 * Math.PI / 180;
const PLACE = { england: { side: 'E', rot: 0 }, spain: { side: 'N', rot: Math.PI / 2 }, italy: { side: 'W', rot: Math.PI }, germany: { side: 'S', rot: -Math.PI / 2 } };
function tileRectFor(rot) {
  const cs = Math.cos(rot), sn = Math.sin(rot), pts = [[TILE.x0, TILE.z0], [TILE.x1, TILE.z0], [TILE.x1, TILE.z1], [TILE.x0, TILE.z1]].map(p => [p[0] * cs + p[1] * sn, -p[0] * sn + p[1] * cs]);
  return { x0: Math.min(...pts.map(p => p[0])), x1: Math.max(...pts.map(p => p[0])), z0: Math.min(...pts.map(p => p[1])), z1: Math.max(...pts.map(p => p[1])) };
}
function texEnc(t) { t.encoding = R.outputEncoding === T.sRGBEncoding ? T.sRGBEncoding : T.LinearEncoding; return t; }
function prepScan(root) {
  const lin = R.outputEncoding !== T.sRGBEncoding;
  root.traverse(o => { if (!o.isMesh) return; o.matrixAutoUpdate = false; o.updateMatrix(); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.side = T.DoubleSide; if (m.map && lin) { m.map.encoding = T.LinearEncoding; m.map.needsUpdate = true; } m.needsUpdate = true; }); });
}
/* merge every mesh that shares a material into one mesh (hundreds of draw calls -> ~100) */
function mergeByMaterial(root) {
  root.updateMatrixWorld(true);
  const groups = new Map(), nm = new T.Matrix3(), v = new T.Vector3();
  root.traverse(o => {
    if (!o.isMesh || !o.visible || !o.geometry || !o.geometry.attributes.position || Array.isArray(o.material)) return;
    let G = groups.get(o.material); if (!G) { G = { m: o.material, list: [] }; groups.set(o.material, G); } G.list.push(o);
  });
  const out = new T.Group();
  groups.forEach(G => {
    let nv = 0, ni = 0, hasN = true, hasU = true, hasC = true;
    G.list.forEach(o => { const g = o.geometry, a = g.attributes; nv += a.position.count; ni += g.index ? g.index.count : a.position.count; hasN = hasN && !!a.normal; hasU = hasU && !!a.uv; hasC = hasC && !!a.color; });
    const needC = !!G.m.vertexColors, P = new Float32Array(nv * 3), N = hasN ? new Float32Array(nv * 3) : null, U = hasU ? new Float32Array(nv * 2) : null, Cc = needC ? new Float32Array(nv * 3) : null, I = new Uint32Array(ni);
    let vo = 0, io = 0;
    G.list.forEach(o => {
      const g = o.geometry, a = g.attributes, mw = o.matrixWorld; nm.getNormalMatrix(mw);
      for (let i = 0; i < a.position.count; i++) {
        const k = vo + i; v.fromBufferAttribute(a.position, i).applyMatrix4(mw); P[k * 3] = v.x; P[k * 3 + 1] = v.y; P[k * 3 + 2] = v.z;
        if (N) { v.fromBufferAttribute(a.normal, i).applyMatrix3(nm).normalize(); N[k * 3] = v.x; N[k * 3 + 1] = v.y; N[k * 3 + 2] = v.z; }
        if (U) { U[k * 2] = a.uv.getX(i); U[k * 2 + 1] = a.uv.getY(i); }
        if (Cc) { if (a.color) { Cc[k * 3] = a.color.getX(i); Cc[k * 3 + 1] = a.color.getY(i); Cc[k * 3 + 2] = a.color.getZ(i); } else { Cc[k * 3] = Cc[k * 3 + 1] = Cc[k * 3 + 2] = 1; } }
      }
      if (g.index) for (let i = 0; i < g.index.count; i++) I[io++] = g.index.getX(i) + vo; else for (let i = 0; i < a.position.count; i++) I[io++] = vo + i;
      vo += a.position.count;
    });
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(P, 3)); if (N) geo.setAttribute('normal', new T.BufferAttribute(N, 3)); if (U) geo.setAttribute('uv', new T.BufferAttribute(U, 2)); if (Cc) geo.setAttribute('color', new T.BufferAttribute(Cc, 3));
    geo.setIndex(new T.BufferAttribute(I, 1)); geo.computeBoundingSphere();
    const mesh = new T.Mesh(geo, G.m); mesh.matrixAutoUpdate = false; out.add(mesh);
  });
  return out;
}
function shareGroup(merged) { const g = new T.Group(); merged.children.forEach(m => { const c = new T.Mesh(m.geometry, m.material); c.matrixAutoUpdate = false; g.add(c); }); return g; }

/* ---------------- pitch (markings, stripes, goals) ---------------- */
function makePitch() {
  const g = new T.Group(), S = 12, Wm = 105, Hm = 68, cv = document.createElement('canvas'); cv.width = Wm * S; cv.height = Hm * S; const c = cv.getContext('2d');
  for (let i = 0; i < 15; i++) { c.fillStyle = i % 2 ? '#2e7a31' : '#3b8d3f'; c.fillRect(i * cv.width / 15, 0, cv.width / 15 + 1, cv.height); }
  let sd = 3; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 6000; i++) { c.fillStyle = 'rgba(' + (20 + rnd() * 40 | 0) + ',' + (70 + rnd() * 60 | 0) + ',30,.08)'; c.fillRect(rnd() * cv.width, rnd() * cv.height, 4, 4); }
  const X = x => (x + Wm / 2) * S, Y = y => (y + Hm / 2) * S; c.strokeStyle = '#f4f4f0'; c.lineWidth = 0.14 * S; c.fillStyle = '#f4f4f0';
  c.strokeRect(X(-52.5), Y(-34), Wm * S, Hm * S); c.beginPath(); c.moveTo(X(0), Y(-34)); c.lineTo(X(0), Y(34)); c.stroke();
  c.beginPath(); c.arc(X(0), Y(0), 9.15 * S, 0, 6.3); c.stroke(); c.beginPath(); c.arc(X(0), Y(0), 0.3 * S, 0, 6.3); c.fill();
  [-1, 1].forEach(sg => {
    c.strokeRect(sg > 0 ? X(52.5 - 16.5) : X(-52.5), Y(-20.16), 16.5 * S, 40.32 * S); c.strokeRect(sg > 0 ? X(52.5 - 5.5) : X(-52.5), Y(-9.16), 5.5 * S, 18.32 * S);
    c.beginPath(); c.arc(X(sg * 41.5), Y(0), 0.3 * S, 0, 6.3); c.fill(); c.beginPath(); c.arc(X(sg * 41.5), Y(0), 9.15 * S, sg > 0 ? 2.2 : -0.94, sg > 0 ? 4.08 : 0.94); c.stroke();
  });
  const tex = texEnc(new T.CanvasTexture(cv)); tex.anisotropy = 8;
  const pl = new T.Mesh(new T.PlaneGeometry(Wm, Hm), new T.MeshLambertMaterial({ map: tex })); pl.rotation.x = -Math.PI / 2; pl.position.y = 0.09; g.add(pl);
  const wm = new T.MeshLambertMaterial({ color: 0xf2f2f2 }), ng = document.createElement('canvas'); ng.width = ng.height = 64; const nc = ng.getContext('2d'); nc.strokeStyle = 'rgba(255,255,255,.9)'; nc.lineWidth = 2; for (let i = 0; i <= 64; i += 8) { nc.beginPath(); nc.moveTo(i, 0); nc.lineTo(i, 64); nc.moveTo(0, i); nc.lineTo(64, i); nc.stroke(); }
  const nt = new T.CanvasTexture(ng); nt.wrapS = nt.wrapT = T.RepeatWrapping; nt.repeat.set(8, 3);
  [-1, 1].forEach(sg => {
    const x = sg * 52.5, post = z => { const m = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 2.44, 8), wm); m.position.set(x, 1.22, z); g.add(m); };
    post(-3.66); post(3.66); const bar = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 7.44, 8), wm); bar.rotation.x = Math.PI / 2; bar.position.set(x, 2.44, 0); g.add(bar);
    const back = new T.Mesh(new T.PlaneGeometry(7.32, 2.44), new T.MeshBasicMaterial({ map: nt, transparent: true, opacity: 0.75, side: T.DoubleSide, depthWrite: false })); back.rotation.y = Math.PI / 2; back.position.set(x + sg * 2, 1.22, 0); g.add(back);
    [-1, 1].forEach(sz => { const sd2 = new T.Mesh(new T.PlaneGeometry(2, 2.44), new T.MeshBasicMaterial({ map: nt, transparent: true, opacity: 0.6, side: T.DoubleSide, depthWrite: false })); sd2.position.set(x + sg, 1.22, sz * 3.66); g.add(sd2); });
  });
  return g;
}

/* ---------------- stadium walk grid: step-limited flood fill over the scan (no walls to guess) ---------------- */
function buildWalk2(root, CELL, seeds, yRef) {
  root.updateMatrixWorld(true);
  const bb = new T.Box3().setFromObject(root), sz = new T.Vector3(); bb.getSize(sz);
  const gx0 = bb.min.x, gz0 = bb.min.z, NX = Math.ceil(sz.x / CELL) + 1, NZ = Math.ceil(sz.z / CELL) + 1, N = NX * NZ;
  if (!(N > 0) || N > 3e6) throw new Error('walk grid size ' + N);
  const surf = new Array(N), ci = x => Math.floor((x - gx0) / CELL), cj = z => Math.floor((z - gz0) / CELL);
  const va = new T.Vector3(), vb = new T.Vector3(), vc = new T.Vector3();
  const addS = (c, y) => { const a = surf[c]; if (!a) { surf[c] = [y]; return; } for (let q = 0; q < a.length; q++) if (Math.abs(a[q] - y) < 0.12) return; if (a.length < 15) a.push(y); };
  root.traverse(o => {
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
    const g = o.geometry, pos = g.attributes.position, idx = g.index, cnt = idx ? idx.count : pos.count;
    for (let t = 0; t + 2 < cnt; t += 3) {
      const a = idx ? idx.getX(t) : t, b = idx ? idx.getX(t + 1) : t + 1, c = idx ? idx.getX(t + 2) : t + 2;
      va.fromBufferAttribute(pos, a).applyMatrix4(o.matrixWorld); vb.fromBufferAttribute(pos, b).applyMatrix4(o.matrixWorld); vc.fromBufferAttribute(pos, c).applyMatrix4(o.matrixWorld);
      const ux = vb.x - va.x, uy = vb.y - va.y, uz = vb.z - va.z, wx = vc.x - va.x, wy = vc.y - va.y, wz = vc.z - va.z;
      const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx, l = Math.sqrt(nx * nx + ny * ny + nz * nz); if (l < 1e-9 || ny / l < 0.8) continue;
      const d = (vb.z - vc.z) * (va.x - vc.x) + (vc.x - vb.x) * (va.z - vc.z); if (Math.abs(d) < 1e-12) continue;
      const i0 = Math.max(0, ci(Math.min(va.x, vb.x, vc.x))), i1 = Math.min(NX - 1, ci(Math.max(va.x, vb.x, vc.x))), j0 = Math.max(0, cj(Math.min(va.z, vb.z, vc.z))), j1 = Math.min(NZ - 1, cj(Math.max(va.z, vb.z, vc.z)));
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
        const px = gx0 + (i + 0.5) * CELL, pz = gz0 + (j + 0.5) * CELL, l1 = ((vb.z - vc.z) * (px - vc.x) + (vc.x - vb.x) * (pz - vc.z)) / d, l2 = ((vc.z - va.z) * (px - vc.x) + (va.x - vc.x) * (pz - vc.z)) / d, l3 = 1 - l1 - l2;
        if (l1 >= -0.02 && l2 >= -0.02 && l3 >= -0.02) addS(i * NZ + j, l1 * va.y + l2 * vb.y + l3 * vc.y);
      }
    }
  });
  const cell = (x, z) => { const i = ci(x), j = cj(z); return (i < 0 || j < 0 || i >= NX || j >= NZ) ? -1 : i * NZ + j; };
  const rch = new Array(N), st = []; let reached = 0;
  const mark = (c, k) => { let r = rch[c]; if (!r) r = rch[c] = new Uint8Array(surf[c].length); if (!r[k]) { r[k] = 1; st.push(c * 16 + k); reached++; } };
  seeds.forEach(sd => { const c = cell(sd[0], sd[1]); if (c < 0 || !surf[c]) return; let bk = -1, bd = 1.6; surf[c].forEach((y, k) => { const d = Math.abs(y - yRef); if (d < bd) { bd = d; bk = k; } }); if (bk >= 0) mark(c, bk); });
  const nbr = [NZ, -NZ, 1, -1];
  while (st.length) {
    const e = st.pop(), c = (e / 16) | 0, k = e - c * 16, y = surf[c][k], i = (c / NZ) | 0, j = c - i * NZ;
    for (let q = 0; q < 4; q++) {
      const ii = i + (q === 0 ? 1 : q === 1 ? -1 : 0), jj = j + (q === 2 ? 1 : q === 3 ? -1 : 0); if (ii < 0 || jj < 0 || ii >= NX || jj >= NZ) continue;
      const c2 = ii * NZ + jj, a2 = surf[c2]; if (!a2) continue; for (let k2 = 0; k2 < a2.length; k2++) if (Math.abs(a2[k2] - y) <= 0.6) mark(c2, k2);
    }
  }
  const surfAt = (x, z, y) => { const c = cell(x, z); if (c < 0) return null; const a = surf[c], r = rch[c]; if (!a || !r) return null; let best = null; for (let q = 0; q < a.length; q++) if (r[q] && a[q] <= y + 0.6 && a[q] >= y - 1.5 && (best === null || a[q] > best)) best = a[q]; return best; };
  const stand = (x, z, y) => { const c = surfAt(x, z, y); if (c === null) return false; const R0 = 0.45; return surfAt(x + R0, z, c) !== null && surfAt(x - R0, z, c) !== null && surfAt(x, z + R0, c) !== null && surfAt(x, z - R0, c) !== null; };
  const inB = (x, z) => x >= bb.min.x && x <= bb.max.x && z >= bb.min.z && z <= bb.max.z;
  return { inB, surf: surfAt, hit: () => false, blocked: () => false, stand, bb, pitch: null, reached };
}


/* ---------------- Ronaldo (FBX) with 23 Mixamo animations + locomotion state machine ---------------- */
const nrm2 = s0 => s0.toLowerCase().replace(/[^a-z0-9]/g, '');
function b64buf(str) { const bin = atob(str), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
function makePlayerFBX(pl) {
  const fbx = pl.fbx, pw = new T.Group(); pw.add(fbx);
  const lin = R.outputEncoding !== T.sRGBEncoding, bones = {};
  fbx.traverse(o => {
    if (o.isBone) bones[nrm2(o.name)] = o;
    if (o.isMesh) { o.frustumCulled = false; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map) { m.map.encoding = lin ? T.LinearEncoding : T.sRGBEncoding; m.map.needsUpdate = true; } if ('shininess' in m) m.shininess = 6; if (m.specular) m.specular.setScalar(0.04); m.side = T.DoubleSide; m.needsUpdate = true; }); }
  });
  const A = pl.anims, B = A.bones, names = B.map(n => { const b = bones[nrm2(n)]; return b ? b.name : null; }), hi0 = B.findIndex(n => /Hips$/.test(n)), hipsName = hi0 >= 0 ? names[hi0] : null;
  const clips = {}, sp = {};
  Object.keys(A.clips).forEach(cn => {
    const c = A.clips[cn], q = new Int16Array(b64buf(c.q)), h = new Float32Array(b64buf(c.hips)), n = c.n, times = new Float32Array(n); for (let i = 0; i < n; i++) times[i] = c.dur * i / (n - 1);
    const tracks = [];
    for (let bi = 0; bi < B.length; bi++) {
      if (!names[bi]) continue; const vals = new Float32Array(n * 4);
      for (let k = 0; k < n; k++) { const o = (k * B.length + bi) * 4; let x = q[o] / 32767, y = q[o + 1] / 32767, z = q[o + 2] / 32767, w = q[o + 3] / 32767; const l = Math.sqrt(x * x + y * y + z * z + w * w) || 1; vals[k * 4] = x / l; vals[k * 4 + 1] = y / l; vals[k * 4 + 2] = z / l; vals[k * 4 + 3] = w / l; }
      tracks.push(new T.QuaternionKeyframeTrack(names[bi] + '.quaternion', times, vals));
    }
    if (hipsName) tracks.push(new T.VectorKeyframeTrack(hipsName + '.position', times, h));
    clips[cn] = new T.AnimationClip(cn, c.dur, tracks); sp[cn] = c.speed * 100;
  });
  const mixer = new T.AnimationMixer(fbx), actions = {}; Object.keys(clips).forEach(k => { actions[k] = mixer.clipAction(clips[k]); });
  const first = actions['Breathing Idle'] || actions['Idle']; if (first) first.play(); mixer.update(0); fbx.updateMatrixWorld(true);
  const tmp = new T.Vector3(); let lo = 1e9, hi = -1e9; fbx.traverse(o => { if (o.isBone) { o.getWorldPosition(tmp); lo = Math.min(lo, tmp.y); hi = Math.max(hi, tmp.y); } });
  const k = (hi - lo) > 1e-4 ? 1.82 / (hi - lo) : 1; fbx.scale.multiplyScalar(k); fbx.position.y = -lo * k; fbx.updateMatrixWorld(true);
  const spw = {}; Object.keys(sp).forEach(n => { spw[n] = Math.max(0.3, sp[n] * fbx.scale.x); });
  return { pw, fbx, mixer, actions, cur: first || null, sp: spw, idleT: 0, y0: fbx.position.y };
}
function paPlay(pa, name, fade, ts) {
  const a = pa.actions[name]; if (!a) return;
  if (pa.cur === a) { a.setEffectiveTimeScale(ts); return; }
  a.reset(); a.setEffectiveWeight(1); a.setEffectiveTimeScale(ts); a.fadeIn(fade).play(); if (pa.cur) pa.cur.fadeOut(fade); pa.cur = a;
}
function animPlayer(dt, spd, seated) {
  const pa = W.pa; if (!pa) return animOld(dt, spd, seated);
  const sp = Math.abs(spd); let name = 'Breathing Idle', ts = 1;
  if (seated) { name = 'Driving'; ts = 0; }
  else if (sp < 0.25) { pa.idleT += dt; name = (pa.idleT > 9 && pa.idleT < 15.4) ? 'Looking Around' : 'Breathing Idle'; if (pa.idleT >= 15.4) pa.idleT = 0; }
  else {
    pa.idleT = 0;
    if (sp < 2.3) { name = 'Walking'; ts = sp / pa.sp['Walking']; } else if (sp < 4.3) { name = 'Jog Forward'; ts = sp / pa.sp['Jog Forward']; } else if (sp < 5.7) { name = 'Running'; ts = sp / pa.sp['Running']; } else { name = 'Sprint'; ts = sp / pa.sp['Sprint']; }
    ts = clamp(ts, 0.6, 1.6);
  }
  paPlay(pa, name, 0.25, ts); pa.fbx.position.y = pa.y0 + (seated ? 0.16 : 0); pa.mixer.update(dt);
}
function normSkinned(obj, targetH) {
  const w = new T.Group(); w.add(obj); obj.updateMatrixWorld(true); const tmp = new T.Vector3(); let lo = 1e9, hi = -1e9;
  obj.traverse(o => { if (o.isBone) { o.getWorldPosition(tmp); lo = Math.min(lo, tmp.y); hi = Math.max(hi, tmp.y); } });
  if (hi - lo > 1e-4) { const k = targetH / ((hi - lo) * 1.07); obj.position.y -= lo; w.scale.setScalar(k); } return w;
}

/* ---------------- boulevard between city and stadium: road, plaza, lamps, trees, cars, buses, fans ---------------- */
function placeProps(cs, props, g0) {
  const B = g0.B, dir = g0.dir, along = g0.along, gap = g0.gap, L = g0.L, my = g0.my, grp = new T.Group(); cs.add(grp); W.props = grp; W.mixers = [];
  const pt = (s0, t0) => [B[0] + along[0] * s0 + dir[0] * t0, B[1] + along[1] * s0 + dir[1] * t0], yaw = Math.atan2(along[0], along[1]);
  let sd = 77; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const conc = new T.TextureLoader().load('assets/concrete.jpg', t => { texEnc(t); t.needsUpdate = true; }); conc.wrapS = conc.wrapT = T.RepeatWrapping;
  const quad = (s0, s1, t0, t1, y, mat, ru, rv) => {
    const a = pt(s0, t0), b = pt(s1, t0), c = pt(s1, t1), d = pt(s0, t1), ge = new T.BufferGeometry();
    ge.setAttribute('position', new T.Float32BufferAttribute([a[0], y, a[1], b[0], y, b[1], c[0], y, c[1], a[0], y, a[1], c[0], y, c[1], d[0], y, d[1]], 3));
    ge.setAttribute('uv', new T.Float32BufferAttribute([0, 0, ru, 0, ru, rv, 0, 0, ru, rv, 0, rv], 2)); ge.setAttribute('normal', new T.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
    const m = new T.Mesh(ge, mat); m.frustumCulled = false; grp.add(m); return m;
  };
  const asphalt = new T.MeshLambertMaterial({ color: 0x55585e, map: conc, side: T.DoubleSide }), walkM = new T.MeshLambertMaterial({ color: 0xd8d8d4, map: conc, side: T.DoubleSide }), white = new T.MeshBasicMaterial({ color: 0xf2f2ee, side: T.DoubleSide });
  quad(-L / 2, L / 2, -7, 7, my + 0.05, asphalt, L / 8, 14 / 8);
  quad(-L / 2, L / 2, -13, -7, my + 0.1, walkM, L / 6, 1); quad(-L / 2, L / 2, 7, 13, my + 0.1, walkM, L / 6, 1);
  quad(-70, 70, 13, gap / 2 + 2, my + 0.08, walkM, 140 / 6, (gap / 2 - 11) / 6);
  for (let s0 = -L / 2 + 4; s0 < L / 2 - 4; s0 += 9) quad(s0, s0 + 4, -0.12, 0.12, my + 0.06, white, 1, 1);
  // lamps
  const lampN = 2 * Math.ceil(L / 34), pole = new T.InstancedMesh(new T.CylinderGeometry(0.11, 0.16, 9, 8).translate(0, 4.5, 0), new T.MeshLambertMaterial({ color: 0x2a2d33 }), lampN), head = new T.InstancedMesh(new T.BoxGeometry(1.7, 0.22, 0.5).translate(0, 9.1, 0), new T.MeshBasicMaterial({ color: 0xfff1c9 }), lampN);
  const mt = new T.Matrix4(), q4 = new T.Quaternion(), vs = new T.Vector3(1, 1, 1), vp = new T.Vector3(); let li = 0;
  for (let s0 = -L / 2 + 10; s0 < L / 2 && li < lampN; s0 += 34) [-1, 1].forEach(sd0 => { if (li >= lampN) return; const p = pt(s0, sd0 * 9.6); q4.setFromAxisAngle(new T.Vector3(0, 1, 0), yaw); vp.set(p[0], my + 0.1, p[1]); mt.compose(vp, q4, vs); pole.setMatrixAt(li, mt); head.setMatrixAt(li, mt); li++; });
  pole.count = li; head.count = li; pole.frustumCulled = false; head.frustumCulled = false; grp.add(pole, head);
  // trees
  if (props.tree) for (let s0 = -L / 2 + 14; s0 < L / 2 - 8; s0 += 40) [-1, 1].forEach(sd0 => { const p = pt(s0 + (rnd() - 0.5) * 10, sd0 * (17 + rnd() * 3)), tr = props.tree.scene.clone(); tr.position.set(p[0], my, p[1]); tr.rotation.y = rnd() * 6.28; tr.scale.setScalar(0.85 + rnd() * 0.35); grp.add(tr); });
  // parked cars
  const kinds = ['camry', 'taxi', 'ford', 'gazelle', 'lambo', 'camry', 'taxi', 'ford'].filter(k => props[k]); let cars = 0;
  if (kinds.length) [-1, 1].forEach(sd0 => { for (let s0 = -L / 2 + 14; s0 < L / 2 - 10 && cars < 16; s0 += 14 + rnd() * 9) { if (rnd() < 0.3) continue; const k = kinds[(rnd() * kinds.length) | 0], c = props[k].scene.clone(), p = pt(s0, sd0 * 4.4); c.position.set(p[0], my + 0.05, p[1]); c.rotation.y = yaw + (sd0 > 0 ? 0 : Math.PI) + (rnd() - 0.5) * 0.05; if (k === 'lambo') c.scale.setScalar(1.75); grp.add(c); cars++; } });
  if (props.bus) [-1, 1].forEach((sd0, i) => { const b = props.bus.scene.clone(), p = pt(i ? 52 : -46, sd0 * 2.2); b.position.set(p[0], my + 0.05, p[1]); b.rotation.y = Math.atan2(-along[1], along[0]) + (sd0 > 0 ? 0 : Math.PI); grp.add(b); });
  // fans + people on the plaza in front of the stadium
  if (T.SkeletonUtils) {
    const faceYaw = Math.atan2(dir[0], dir[1]);
    if (props.crowd) [-26, 0, 26].forEach((s0, i) => { try { const cl = T.SkeletonUtils.clone(props.crowd.scene), w = normSkinned(cl, 1.78), p = pt(s0, 20 + i * 2); w.position.set(p[0], my + 0.1, p[1]); w.rotation.y = faceYaw + (i - 1) * 0.5; grp.add(w); const mx = new T.AnimationMixer(cl); if (props.crowd.animations[0]) mx.clipAction(props.crowd.animations[0]).play(); W.mixers.push(mx); } catch (e) { console.warn('crowd', e); } });
    if (props.sofia) [-7, 8].forEach((s0, i) => { try { const cl = T.SkeletonUtils.clone(props.sofia.scene), w = normSkinned(cl, 1.7), p = pt(s0, 11); w.position.set(p[0], my + 0.1, p[1]); w.rotation.y = faceYaw + (i ? 2.6 : 3.6); grp.add(w); const mx = new T.AnimationMixer(cl); if (props.sofia.animations[0]) mx.clipAction(props.sofia.animations[0]).play(); W.mixers.push(mx); } catch (e) { console.warn('sofia', e); } });
  }
}
function facadeMat(src, tint) {
  const m = new T.MeshLambertMaterial({ color: tint, vertexColors: true, side: T.DoubleSide }), img = new Image();
  img.onload = () => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'); g.drawImage(img, 0, 0, 256, 256);
    for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) { g.fillStyle = ((r * 5 + q * 3) % 7) === 0 ? 'rgba(255,224,150,.92)' : 'rgba(38,56,80,.9)'; g.fillRect(q * 64 + 14, r * 64 + 14, 36, 38); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(q * 64 + 14, r * 64 + 14, 36, 4); }
    const t = texEnc(new T.CanvasTexture(cv)); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; m.map = t; m.needsUpdate = true; };
  img.src = src; return m;
}
function makeOutskirts2(cs, C, excl, cx0, cz0, my, big) {
  const A = [{ P: [], N: [], U: [], C: [] }, { P: [], N: [], U: [], C: [] }];
  let sd = 21; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647, tint = new T.Color(C.sky).lerp(new T.Color(0xffffff), 0.8);
  const quad = (G, c4, nx, ny, nz, u, v, col) => { const uv = [[0, 0], [u, 0], [u, v], [0, v]]; [0, 1, 2, 0, 2, 3].forEach(i => { G.P.push(c4[i][0], c4[i][1], c4[i][2]); G.N.push(nx, ny, nz); G.U.push(uv[i][0], uv[i][1]); G.C.push(col.r, col.g, col.b); }); };
  const box = (G, cx, cz, w, d, h, col) => {
    const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2, y0 = my - 0.5, y1 = my + h, uw = w / 10, ud = d / 10, vh = h / 12.8;
    quad(G, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], 0, 0, 1, uw, vh, col); quad(G, [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], 0, 0, -1, uw, vh, col);
    quad(G, [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], 1, 0, 0, ud, vh, col); quad(G, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], -1, 0, 0, ud, vh, col);
    quad(G, [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], 0, 1, 0, 0.002, 0.002, col);
  };
  const span = big * 2.6, step = 52; let count = 0;
  for (let x = cx0 - span; x <= cx0 + span && count < 2600; x += step) for (let z = cz0 - span; z <= cz0 + span && count < 2600; z += step) {
    const px = x + (rnd() - 0.5) * 26, pz = z + (rnd() - 0.5) * 26;
    if (excl.some(r => px > r[0] && px < r[1] && pz > r[2] && pz < r[3])) continue;
    const d = Math.hypot(px - cx0, pz - cz0), prob = clamp(0.95 - d / (span * 1.25), 0.15, 0.92); if (rnd() > prob) continue;
    const k = 0.8 + rnd() * 0.25, h = (14 + rnd() * 42) * clamp(1.5 - d / span, 0.45, 1.3);
    box(A[rnd() < 0.55 ? 0 : 1], px, pz, 22 + rnd() * 26, 22 + rnd() * 26, h, new T.Color(tint.r * k, tint.g * k, tint.b * k)); count++;
  }
  const out = new T.Group(); [facadeMat('assets/brick.jpg', 0xffffff), facadeMat('assets/stone.jpg', 0xffffff)].forEach((m, i) => {
    const G = A[i]; if (!G.P.length) return; const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(G.P, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(G.N, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(G.U, 2)); geo.setAttribute('color', new T.Float32BufferAttribute(G.C, 3));
    const me = new T.Mesh(geo, m); me.frustumCulled = false; out.add(me);
  });
  cs.add(out); return out;
}

/* ---------------- ground texture ---------------- */
function makeGroundTex(hex) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'), c = new T.Color(hex);
  g.fillStyle = '#' + c.getHexString(); g.fillRect(0, 0, 256, 256);
  let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 700; i++) {
    const k = 0.82 + rnd() * 0.36, cc = new T.Color(c.r * k, c.g * (0.9 + rnd() * 0.25), c.b * k), x = rnd() * 256, y = rnd() * 256, r = 3 + rnd() * 16;
    g.fillStyle = 'rgba(' + Math.round(cc.r * 255) + ',' + Math.round(cc.g * 255) + ',' + Math.round(cc.b * 255) + ',.35)';
    [-256, 0, 256].forEach(ox => [-256, 0, 256].forEach(oy => { g.beginPath(); g.arc(x + ox, y + oy, r, 0, 6.3); g.fill(); }));
  }
  const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(240, 240); t.anisotropy = 4;
  t.encoding = R.outputEncoding === T.sRGBEncoding ? T.sRGBEncoding : T.LinearEncoding; return t;
}

/* ---------------- player: correct size from the skeleton + procedural walk/run/idle/ride ---------------- */
const BONE_KEYS = {
  hips: ['hips', 'pelvis'], spine: ['spine'], spine1: ['spine1'], spine2: ['spine2', 'chest'], head: ['head'],
  lthigh: ['leftupleg', 'thighl', 'lthigh', 'leftthigh'], rthigh: ['rightupleg', 'thighr', 'rthigh', 'rightthigh'],
  lcalf: ['leftleg', 'calfl', 'lcalf', 'leftcalf', 'leftshin'], rcalf: ['rightleg', 'calfr', 'rcalf', 'rightcalf', 'rightshin'],
  larm: ['leftarm', 'upperarml', 'lupperarm', 'leftupperarm'], rarm: ['rightarm', 'upperarmr', 'rupperarm', 'rightupperarm'],
  lfore: ['lforearm', 'leftforearm', 'lowerarml', 'llowerarm', 'leftlowerarm'], rfore: ['rforearm', 'rightforearm', 'lowerarmr', 'rlowerarm', 'rightlowerarm'],
  lfoot: ['leftfoot', 'footl', 'lfoot'], rfoot: ['rightfoot', 'footr', 'rfoot']
};
function fitPlayer(player) {
  const pm = player.scene, pw = new T.Group(); pw.add(pm);
  pm.traverse(o => { if (/ball/i.test(o.name)) o.visible = false; });
  let mixer = null, act = null;
  if (player.animations && player.animations.length) {
    const clip = player.animations[0]; mixer = new T.AnimationMixer(pm); act = mixer.clipAction(clip); act.play(); act.paused = true; act.time = Math.min(IDLE_T, Math.max(0, clip.duration - 0.05)); mixer.update(0);
  }
  pm.updateMatrixWorld(true);
  const bones = []; pm.traverse(o => { if (o.isBone) bones.push(o); });
  const tmp = new T.Vector3(); let lo = 1e9, hi = -1e9, topBone = false;
  bones.forEach(b => { b.getWorldPosition(tmp); lo = Math.min(lo, tmp.y); hi = Math.max(hi, tmp.y); if (/headtop|head_end|headnub/i.test(b.name)) topBone = true; });
  let ph, useBones = bones.length >= 10 && hi - lo > 1e-4;
  if (useBones) ph = (hi - lo) * (topBone ? 1.0 : 1.07); else { const bb = new T.Box3().setFromObject(pm); ph = bb.max.y - bb.min.y; }
  let ps = ph > 1e-6 ? 1.8 / ph : 1; if (!isFinite(ps) || ps <= 0) ps = 1;
  pm.scale.multiplyScalar(ps); pm.updateMatrixWorld(true);
  let foot = 0;
  if (useBones) { lo = 1e9; bones.forEach(b => { b.getWorldPosition(tmp); lo = Math.min(lo, tmp.y); }); foot = lo - 0.02; } else { foot = new T.Box3().setFromObject(pm).min.y; }
  pm.position.y -= isFinite(foot) ? foot : 0; pm.updateMatrixWorld(true);
  // bone lookup
  const b = {}; const norm = s => s.replace(/(_\d+)+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^(mixamorig|bip001|bip01)/, '');
  bones.forEach(o => { const n = norm(o.name); Object.keys(BONE_KEYS).forEach(k => { if (!b[k] && BONE_KEYS[k].indexOf(n) >= 0) b[k] = o; }); });
  const ok = !!(b.lthigh && b.rthigh && b.lcalf && b.rcalf && b.larm && b.rarm);
  // facing: toes should point to +Z
  if (ok && b.lfoot) {
    let toe = null; b.lfoot.traverse(o => { if (!toe && o !== b.lfoot && /toe/i.test(o.name)) toe = o; });
    if (toe) { const p1 = new T.Vector3(), p2 = new T.Vector3(); toe.getWorldPosition(p1); b.lfoot.getWorldPosition(p2); if (p1.z - p2.z < -0.005) { pm.rotation.y += Math.PI; pm.updateMatrixWorld(true); } }
  }
  const rest = {}; Object.keys(b).forEach(k => { rest[k] = b[k].quaternion.clone(); });
  return { pm, pw, mixer, act, b, rest, ok, y0: pm.position.y, ph: 0, pd: 0, mv: 0, t: 0 };
}
const _qa = new T.Quaternion(), _qp = new T.Quaternion(), _qw = new T.Quaternion(), _qr = new T.Quaternion(), _AX = new T.Vector3(1, 0, 0);
function swingBone(r, key, ang) {
  const bn = r.b[key]; if (!bn || !bn.parent) return;
  bn.parent.getWorldQuaternion(_qp); r.pw.getWorldQuaternion(_qw); _qp.premultiply(_qw.invert());   // parent orientation in player space
  _qa.setFromAxisAngle(_AX, ang); _qr.copy(_qp).invert().multiply(_qa).multiply(_qp).multiply(r.rest[key]); bn.quaternion.copy(_qr);
}
function animOld(dt, spd, seated) {
  const r = W.rig; if (!r) return; const sp = Math.abs(spd);
  if (!r.ok) {   // unknown skeleton: fall back to the baked clip
    if (r.mixer && r.act) { if (sp > 0.15 && !seated) { r.act.paused = false; r.act.timeScale = clamp(sp / 1.7, 0.4, 1.6); r.mixer.update(dt); } else if (!r.act.paused) { r.act.paused = true; r.act.time = IDLE_T; r.mixer.update(0); } }
    return;
  }
  r.t += dt; r.mv += ((sp > 0.15 ? 1 : 0) - r.mv) * Math.min(1, dt * 8);
  if (seated) r.pd += dt * Math.max(0, spd) * 0.9; else r.ph += dt * (3.0 + sp * 1.6);
  const a = clamp(sp / 1.7, 0, 1.6) * 0.5 * r.mv, s = Math.sin(r.ph), c = Math.cos(r.ph);
  if (seated) {
    const p = Math.sin(r.pd * 3), pa = 0.3 * clamp(spd / 6, 0, 1);
    swingBone(r, 'spine', 0.22); swingBone(r, 'head', -0.18);
    swingBone(r, 'lthigh', -0.95 + pa * p); swingBone(r, 'rthigh', -0.95 - pa * p);
    swingBone(r, 'lcalf', 1.15 - pa * 1.2 * p); swingBone(r, 'rcalf', 1.15 + pa * 1.2 * p);
    swingBone(r, 'larm', -0.8); swingBone(r, 'rarm', -0.8); swingBone(r, 'lfore', -0.55); swingBone(r, 'rfore', -0.55);
    r.pm.position.y = r.y0;
  } else {
    const lean = 0.03 + 0.1 * clamp((sp - 1.7) / 1.5, 0, 1) * r.mv, br = Math.sin(r.t * 1.7) * 0.012 * (1 - r.mv);
    swingBone(r, 'spine', lean * 0.5 + br); swingBone(r, 'spine1', lean * 0.5); swingBone(r, 'head', -lean * 0.6);
    swingBone(r, 'lthigh', -s * a); swingBone(r, 'rthigh', s * a);
    swingBone(r, 'lcalf', Math.max(0, c) * a * 1.6); swingBone(r, 'rcalf', Math.max(0, -c) * a * 1.6);
    swingBone(r, 'larm', s * a * 0.9); swingBone(r, 'rarm', -s * a * 0.9);
    const fb = -(0.22 + a * 0.5); swingBone(r, 'lfore', fb); swingBone(r, 'rfore', fb);
    r.pm.position.y = r.y0 + Math.abs(s) * 0.035 * r.mv;
  }
}

/* ---------------- stadium walk grid (multi-level: plaza, concourse, stairs, pitch) ---------------- */
function buildWalk(root, CELL) {
  root.updateMatrixWorld(true);
  const bb = new T.Box3().setFromObject(root), sz = new T.Vector3(); bb.getSize(sz);
  const gx0 = bb.min.x - 1, gz0 = bb.min.z - 1, NX = Math.ceil((sz.x + 2) / CELL), NZ = Math.ceil((sz.z + 2) / CELL), N = NX * NZ;
  if (!(N > 0) || N > 1.5e6) throw new Error('walk grid size ' + N);
  const surf = new Array(N), wal = new Array(N);
  const ci = x => Math.floor((x - gx0) / CELL), cj = z => Math.floor((z - gz0) / CELL);
  const va = new T.Vector3(), vb = new T.Vector3(), vc = new T.Vector3();
  const addS = (c, y) => { let a = surf[c]; if (!a) { surf[c] = [y]; return; } for (let q = 0; q < a.length; q++) if (Math.abs(a[q] - y) < 0.1) return; if (a.length < 12) a.push(y); };
  const addW = (c, lo, hi) => { let a = wal[c]; if (!a) a = wal[c] = []; if (a.length < 24) a.push(lo, hi); };
  const seg = (x0, z0, x1, z1, lo, hi) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / (CELL * 0.5))); for (let q = 0; q <= n; q++) { const i = ci(x0 + (x1 - x0) * q / n), j = cj(z0 + (z1 - z0) * q / n); if (i >= 0 && j >= 0 && i < NX && j < NZ) addW(i * NZ + j, lo, hi); } };
  root.traverse(o => {
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
    const m = Array.isArray(o.material) ? o.material[0] : o.material; if (m && m.transparent && m.opacity < 0.15) return;
    const g = o.geometry, pos = g.attributes.position, idx = g.index, cnt = idx ? idx.count : pos.count;
    for (let t = 0; t + 2 < cnt; t += 3) {
      const a = idx ? idx.getX(t) : t, b = idx ? idx.getX(t + 1) : t + 1, c = idx ? idx.getX(t + 2) : t + 2;
      va.fromBufferAttribute(pos, a).applyMatrix4(o.matrixWorld); vb.fromBufferAttribute(pos, b).applyMatrix4(o.matrixWorld); vc.fromBufferAttribute(pos, c).applyMatrix4(o.matrixWorld);
      const ux = vb.x - va.x, uy = vb.y - va.y, uz = vb.z - va.z, wx = vc.x - va.x, wy = vc.y - va.y, wz = vc.z - va.z;
      const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx, l = Math.sqrt(nx * nx + ny * ny + nz * nz); if (l < 1e-9) continue;
      const yn = ny / l;
      if (yn > 0.7) {
        const d = (vb.z - vc.z) * (va.x - vc.x) + (vc.x - vb.x) * (va.z - vc.z); if (Math.abs(d) < 1e-12) continue;
        const i0 = Math.max(0, ci(Math.min(va.x, vb.x, vc.x))), i1 = Math.min(NX - 1, ci(Math.max(va.x, vb.x, vc.x))), j0 = Math.max(0, cj(Math.min(va.z, vb.z, vc.z))), j1 = Math.min(NZ - 1, cj(Math.max(va.z, vb.z, vc.z)));
        for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
          const px = gx0 + (i + 0.5) * CELL, pz = gz0 + (j + 0.5) * CELL;
          const l1 = ((vb.z - vc.z) * (px - vc.x) + (vc.x - vb.x) * (pz - vc.z)) / d, l2 = ((vc.z - va.z) * (px - vc.x) + (va.x - vc.x) * (pz - vc.z)) / d, l3 = 1 - l1 - l2;
          if (l1 >= -0.02 && l2 >= -0.02 && l3 >= -0.02) addS(i * NZ + j, l1 * va.y + l2 * vb.y + l3 * vc.y);
        }
      } else if (Math.abs(yn) < 0.5) {
        const lo = Math.min(va.y, vb.y, vc.y), hi = Math.max(va.y, vb.y, vc.y);
        if (hi - lo >= 0.45) { seg(va.x, va.z, vb.x, vb.z, lo, hi); seg(vb.x, vb.z, vc.x, vc.z, lo, hi); seg(vc.x, vc.z, va.x, va.z, lo, hi); }
      }
    }
  });
  const cell = (x, z) => { const i = ci(x), j = cj(z); return (i < 0 || j < 0 || i >= NX || j >= NZ) ? -1 : i * NZ + j; };
  const surfAt = (x, z, y) => { const c = cell(x, z); if (c < 0) return null; const a = surf[c]; if (!a) return null; let best = null; for (let q = 0; q < a.length; q++) { const v = a[q]; if (v <= y + 0.6 && v >= y - 1.5 && (best === null || v > best)) best = v; } return best; };
  const hit = (x, z, y0, y1) => { const c = cell(x, z); if (c < 0) return false; const a = wal[c]; if (!a) return false; for (let q = 0; q < a.length; q += 2) if (a[q] < y1 && a[q + 1] > y0) return true; return false; };
  const blocked = (x, z, y) => hit(x, z, y + 0.4, y + 1.5);
  const stand = (x, z, y) => !blocked(x, z, y) && !blocked(x + 0.3, z, y) && !blocked(x - 0.3, z, y) && !blocked(x, z + 0.3, y) && !blocked(x, z - 0.3, y);
  const inB = (x, z) => x >= bb.min.x && x <= bb.max.x && z >= bb.min.z && z <= bb.max.z;
  // pitch spot: dominant floor level near the centre
  const mx = (bb.min.x + bb.max.x) / 2, mz = (bb.min.z + bb.max.z) / 2, hist = new Map(), RR = 35;
  for (let i = Math.max(0, ci(mx - RR)); i <= Math.min(NX - 1, ci(mx + RR)); i++) for (let j = Math.max(0, cj(mz - RR)); j <= Math.min(NZ - 1, cj(mz + RR)); j++) { const a = surf[i * NZ + j]; if (a) a.forEach(y => { const k = Math.round(y / 0.1); hist.set(k, (hist.get(k) || 0) + 1); }); }
  let bk = null, bv = 0; hist.forEach((v, k) => { if (v > bv) { bv = v; bk = k; } });
  let pitch = null;
  if (bk !== null) {
    const yP = bk * 0.1; let bd = 1e18;
    for (let i = Math.max(0, ci(mx - RR)); i <= Math.min(NX - 1, ci(mx + RR)); i++) for (let j = Math.max(0, cj(mz - RR)); j <= Math.min(NZ - 1, cj(mz + RR)); j++) {
      const a = surf[i * NZ + j]; if (!a) continue; const px = gx0 + (i + 0.5) * CELL, pz = gz0 + (j + 0.5) * CELL, d = (px - mx) * (px - mx) + (pz - mz) * (pz - mz);
      if (d < bd && a.some(y => Math.abs(y - yP) < 0.15) && stand(px, pz, yP)) { bd = d; pitch = [px, yP, pz]; }
    }
  }
  return { inB, surf: surfAt, hit, blocked, stand, bb, pitch };
}

/* ---------------- phase 4: on foot - plaza, gates and stadium (same world, same player) ---------------- */
function startFoot() {
  if (W.phase !== 'bike') return; W.phase = 'trans'; setAct(null); padOn(false); fade(true);
  setTimeout(() => {
    const b = W.b, n = W.nav, ang = Math.atan2(W.stadXZ[0] - b.x, W.stadXZ[1] - b.z);
    W.bike.remove(W.player); W.cityScene.add(W.player); W.player.visible = true; W.player.rotation.set(0, ang, 0);
    const x = b.x + Math.cos(b.h) * 1.3, z = b.z - Math.sin(b.h) * 1.3, ok = n.ok(x, z);
    W.foot = { x: ok ? x : b.x, z: ok ? z : b.z, y: b.y, ty: b.y, h: ang, in: null };
    W.cy = ang + Math.PI; W.cp = 0.22; W.phase = 'foot'; W.scene = W.cityScene; W.cam.fov = 60; W.cam.near = 0.12; W.cam.updateProjectionMatrix();
    W.cam.position.set(W.foot.x - Math.sin(ang) * 3, W.foot.y + 2, W.foot.z - Math.cos(ang) * 3);
    $$('warr').style.display = 'none'; show('whud'); $$('wview').style.display = 'block'; padOn(true); W.enterShown = false;
    hint('Bike parked. Walk to the stadium with the left stick, drag the screen to look around.'); setTimeout(() => { if (W.phase === 'foot') hint(''); }, 8000);
    fade(false);
  }, 650);
}
function footTeleport(x, y, z) {
  fade(true); setTimeout(() => { const f = W.foot; f.x = x; f.y = y; f.ty = y; f.z = z; fade(false); }, 450);
}
function toPitch() { const w = W.walk; if (!w || !w.pitch) { hint('The stadium interior is not available yet.'); return; } footTeleport(w.pitch[0], w.pitch[1], w.pitch[2]); }
function toPlaza() { const n = W.nav; footTeleport(W.plaza[0], n.y(W.plaza[0], W.plaza[1]), W.plaza[1]); }
function footUpdate(dt) {
  const n = W.nav, f = W.foot, s = stick(), mag = Math.min(1, Math.hypot(s[0], s[1])), Wk = W.walk;
  const spd = mag > 0.12 ? (mag < 0.55 ? 1.7 * mag / 0.55 : 1.7 + (mag - 0.55) / 0.45 * 4.3) : 0;
  const okAt = (x, z) => {
    if (Wk && Wk.inB(x, z)) { const y = Wk.surf(x, z, f.y); return (y !== null && Wk.stand(x, z, y)) ? y : null; }
    return n.okFree(x, z) ? n.y(x, z) : null;
  };
  if (spd > 0) {
    const cy = W.cy, fx = -Math.sin(cy), fz = -Math.cos(cy), rx = Math.cos(cy), rz = -Math.sin(cy);
    let vx = fx * -s[1] + rx * s[0], vz = fz * -s[1] + rz * s[0]; const l = Math.hypot(vx, vz) || 1; vx /= l; vz /= l;
    const nx = f.x + vx * spd * dt, nz = f.z + vz * spd * dt; let y = okAt(nx, nz);
    if (y !== null) { f.x = nx; f.z = nz; f.ty = y; } else if ((y = okAt(nx, f.z)) !== null) { f.x = nx; f.ty = y; } else if ((y = okAt(f.x, nz)) !== null) { f.z = nz; f.ty = y; }
    moveFace(f, vx, vz, dt);
  }
  f.y += (f.ty - f.y) * Math.min(1, dt * 12);
  W.player.position.set(f.x, f.y, f.z); W.player.rotation.y = f.h; animPlayer(dt, spd, false);
  const inside = !!(Wk && Wk.inB(f.x, f.z));
  if (inside !== f.in) { f.in = inside; setAct(inside ? 'BACK TO PLAZA' : 'ENTER STADIUM', inside ? toPlaza : toPitch); }
  const k = Math.min(1, dt * 9);
  if (W.fp) {
    W.player.visible = false; const cy = W.cy, pit = W.cp - 0.22;
    W.cam.position.set(f.x, f.y + 1.62, f.z); W.cam.lookAt(f.x - Math.sin(cy) * 3, f.y + 1.62 - Math.sin(pit) * 3, f.z - Math.cos(cy) * 3);
  } else {
    const cp = clamp(W.cp, -0.3, 0.8), ch = Math.cos(cp), sh = Math.sin(cp), DIST = 3.4;
    let d = DIST; if (Wk && Wk.inB(f.x, f.z)) for (let q = 0.3; q <= DIST; q += 0.25) { const px = f.x + Math.sin(W.cy) * ch * q, pz = f.z + Math.cos(W.cy) * ch * q, py = f.y + 1.4 + sh * q; if (Wk.hit(px, pz, py - 0.15, py + 0.15)) { d = Math.max(0.3, q - 0.35); break; } }
    W.cam.position.x += (f.x + Math.sin(W.cy) * ch * d - W.cam.position.x) * k; W.cam.position.z += (f.z + Math.cos(W.cy) * ch * d - W.cam.position.z) * k; W.cam.position.y += (f.y + 1.4 + sh * d - W.cam.position.y) * k;
    W.player.visible = d > 0.9; W.cam.lookAt(f.x, f.y + 1.3, f.z);
  }
}

/* ---------------- per-frame ---------------- */
function frame() {
  const now = performance.now(), dt = Math.min(0.05, (now - W.t) / 1000); W.t = now;
  const el = R.domElement, a = el.clientWidth / Math.max(1, el.clientHeight);
  if (Math.abs(W.cam.aspect - a) > 1e-3) { W.cam.aspect = a; W.cam.updateProjectionMatrix(); }
  if (W.dome && W.scene === W.cityScene) W.dome.position.copy(W.cam.position);
  if (W.mixers && W.scene === W.cityScene && W.phase !== 'trans') for (let i = 0; i < W.mixers.length; i++) W.mixers[i].update(dt);
  if (W.phase === 'fly') flyUpdate(dt); else if (W.phase === 'house') houseUpdate(dt); else if (W.phase === 'bike') bikeUpdate(dt); else if (W.phase === 'foot') footUpdate(dt);
}
})();
