// Modelo 3D de la casa a partir del plano regularizado (JSON de planos.py): muros extruidos + apartaestudios amoblados dentro del perímetro real de cada recinto
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export async function buildCasa(container, url, opts = {}) {
  const P = await (await fetch(url)).json(), H = P.hlibre || 2.5, minArea = opts.minArea || 13;
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  container.querySelector('canvas')?.remove(); container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#f3efe8');
  const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .8, ...o });
  const mat = { wall: M('#f4f1ea'), cap: M('#2b2b29'), floor: M('#d9d2c5'), unit: M('#c9a172'), other: M('#e6e0d4'), white: M('#fbfbf9'), oak: M('#b98a5a'), linen: M('#f7f5f0'), teal: M('#2f6b5a'), red: M('#c8372d'), counter: M('#2a2c30'),
    glass: new THREE.MeshStandardMaterial({ color: '#cfe3e3', transparent: true, opacity: .35, depthWrite: false }) };
  const box = (w, h, d, m, x, y, z, sh = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; scene.add(o); return o; };
  // piso general y muros
  const ws = P.walls, X0 = Math.min(...ws.map(w => Math.min(w.x1, w.x2))), X1 = Math.max(...ws.map(w => Math.max(w.x1, w.x2))), Y0 = Math.min(...ws.map(w => Math.min(w.y1, w.y2))), Y1 = Math.max(...ws.map(w => Math.max(w.y1, w.y2)));
  box(X1 - X0 + 1, .06, Y1 - Y0 + 1, mat.floor, (X0 + X1) / 2, -.03, (Y0 + Y1) / 2, false);
  for (const w of ws) {
    const hor = w.y1 === w.y2, L = Math.abs(hor ? w.x2 - w.x1 : w.y2 - w.y1) + w.t, cx = (w.x1 + w.x2) / 2, cz = (w.y1 + w.y2) / 2;
    box(hor ? L : w.t, H, hor ? w.t : L, mat.wall, cx, H / 2, cz); box(hor ? L : w.t, .03, hor ? w.t : L, mat.cap, cx, H + .015, cz, false);
  }
  // recintos: los que dan el área se amueblan como apartaestudio
  const label = (txt, x, z, big) => { const c = document.createElement('canvas'); c.width = 512; c.height = 160; const g = c.getContext('2d'); g.font = `600 ${big ? 60 : 46}px Inter,Arial`; g.textAlign = 'center'; g.fillStyle = '#1d1d1b'; txt.split('\n').forEach((t, i) => g.fillText(t, 256, 66 + i * 62));
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false })); s.scale.set(2.6, .82, 1); s.position.set(x, H + .7, z); scene.add(s); };
  let n = 0; const max = opts.unidades || 99;
  for (const r of [...P.rooms].sort((a, b) => b.area - a.area)) {
    const isUnit = r.area >= minArea && Math.min(r.w, r.h) >= 2.7 && n < max, t = .12;
    box(r.w - t, .02, r.h - t, isUnit ? mat.unit : mat.other, r.x + r.w / 2, .012, r.y + r.h / 2, false);
    if (!isUnit) { label(`${r.id}\n${String(r.area).replace('.', ',')} m²`, r.x + r.w / 2, r.y + r.h / 2); continue; }
    n++; label(`Apto ${n}\n${String(r.area).replace('.', ',')} m²`, r.x + r.w / 2, r.y + r.h / 2, true);
    const alongX = r.w >= r.h, L = (alongX ? r.w : r.h) - 2 * t, S = (alongX ? r.h : r.w) - 2 * t;
    const put = (u, v, du, dv, h, m, y0 = 0, sh = true) => { const cu = u + du / 2, cv = v + dv / 2; return alongX ? box(du, h, dv, m, r.x + t + cu, y0 + h / 2, r.y + t + cv, sh) : box(dv, h, du, m, r.x + t + cv, y0 + h / 2, r.y + t + cu, sh); };
    const pod = Math.min(1.45, S * .45), podL = Math.min(2.0, L * .33);
    put(0, S - pod, podL, pod, 2.2, mat.glass, 0, false); put(.15, S - pod + .15, .4, .55, .42, mat.white); put(podL - .55, S - .5, .45, .4, .85, mat.white);      // baño en cápsula
    const kl = Math.min(2.1, L * .36); put(.95, 0, kl, .6, .9, mat.white); put(.95, 0, kl, .62, .04, mat.counter, .9); put(.95, 0, kl, .32, .32, mat.white, 1.85);   // cocineta + mueble alto
    const bl = Math.min(2.1, L * .36), bw = Math.min(2.0, S - .1); put(L - bl, 0, bl, S, .4, mat.oak); put(L - bl + .05, (S - bw) / 2 * 0 + .05, bl - .1, bw, .24, mat.linen, .4); put(L - bl + .05, .05, .45, bw, .05, mat.teal, .64);
    if (L > 5.4) { put(podL + .5, S - .5, 1.1, .5, .04, mat.oak, .73); put(podL + .7, S - .95, .34, .34, .46, mat.red); put(podL + 1.15, S - .95, .34, .34, .46, mat.red); }   // mesa + butacos
  }
  scene.add(new THREE.HemisphereLight('#ffffff', '#d8c8b0', 2.4));
  const sun = new THREE.DirectionalLight('#fff1dc', 2.6); sun.position.set(X0 - 6, 14, Y0 - 8); sun.target.position.set((X0 + X1) / 2, 0, (Y0 + Y1) / 2); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const d = Math.max(X1 - X0, Y1 - Y0); Object.assign(sun.shadow.camera, { left: -d, right: d, top: d, bottom: -d, near: 1, far: 60 }); sun.shadow.bias = -.0005;
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 200), controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set((X0 + X1) / 2, 0, (Y0 + Y1) / 2); camera.position.set((X0 + X1) / 2 + d * .5, d * 1.15, (Y0 + Y1) / 2 + d * 1.15); controls.maxPolarAngle = Math.PI * .49; controls.enableDamping = true;
  const resize = () => { const w = container.clientWidth, h = container.clientHeight; renderer.setSize(w, h, false); renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'; camera.aspect = w / h; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize(); let alive = true; (function loop() { if (!alive) return; controls.update(); renderer.render(scene, camera); requestAnimationFrame(loop); })();
  return { unidades: n, dispose() { alive = false; renderer.dispose(); } };
}
