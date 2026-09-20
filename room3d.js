// Apartaestudio tipo hotel (referente: habitación compacta citizenM) — escena 3D conceptual
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 3.2, D = 5.8, H = 2.7;           // ancho, fondo, altura (m)  ≈ 18,5 m²

function canvasTex(w, h, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t;
}
const woodTex = (base, rx, ry) => canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 8; i++) {                       // tablones
    const x = i * w / 8; g.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.08})`; g.fillRect(x, 0, w / 8, h);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, 0, 1.5, h);
    const y = Math.random() * h; g.fillRect(x, y, w / 8, 1.5);
  }
  for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(60,30,10,${Math.random() * 0.12})`; g.beginPath(); const x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); g.lineTo(x + (Math.random() - .5) * 6, y + 40 + Math.random() * 120); g.stroke(); }
}, rx, ry);
const tileTex = (rx, ry) => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#e9e6df'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9c4b8'; g.lineWidth = 3;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); }
}, rx, ry);
const viewTex = () => canvasTex(1024, 512, (g, w, h) => {   // vista: cielo + montañas + ciudad
  const s = g.createLinearGradient(0, 0, 0, h); s.addColorStop(0, '#9fc4e8'); s.addColorStop(.6, '#e6eef5'); s.addColorStop(1, '#f4efe6'); g.fillStyle = s; g.fillRect(0, 0, w, h);
  const hill = (y0, amp, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, y0 + Math.sin(x * .006 + y0) * amp + Math.sin(x * .021) * amp * .4); g.lineTo(w, h); g.fill(); };
  hill(h * .5, 40, '#8fa7b5'); hill(h * .6, 30, '#5f8070'); hill(h * .7, 22, '#3f6650');
  for (let i = 0; i < 60; i++) { const x = Math.random() * w, bw = 14 + Math.random() * 26, bh = 20 + Math.random() * 60; g.fillStyle = ['#d9d2c5', '#c9b8a3', '#b8623f', '#e8e2d6'][i % 4]; g.fillRect(x, h * .82 - bh * .3 + Math.random() * 40, bw, bh); }
});

export function buildRoom(container, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(opts.pixelRatio || Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .92;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene(); scene.background = new THREE.Color('#f3efe8');
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;

  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .8, ...o });
  const mat = {
    wall: M('#f4f1ea'), ceil: M('#faf8f3'), floor: M('#ffffff', { map: woodTex('#9a6a3e', 3, 5), roughness: .55 }),
    beam: M('#4a2f1f', { roughness: .6 }), oak: M('#ffffff', { map: woodTex('#c9a172', 1, 1), roughness: .5 }),
    white: M('#fbfbf9', { roughness: .35 }), black: M('#1b1b1d', { roughness: .4, metalness: .3 }),
    steel: M('#c8cbd0', { roughness: .25, metalness: .9 }), counter: M('#2a2c30', { roughness: .3 }),
    linen: M('#f7f5f0', { roughness: .95 }), red: M('#c8372d', { roughness: .7 }), teal: M('#2f6b5a', { roughness: .8 }),
    tile: M('#ffffff', { map: tileTex(3, 4), roughness: .3 }), plant: M('#3f7a45'), pot: M('#d9d2c5'),
    glass: new THREE.MeshStandardMaterial({ color: '#cfe3e3', roughness: .35, transparent: true, opacity: .32, side: THREE.DoubleSide, depthWrite: false }),
    led: new THREE.MeshBasicMaterial({ color: '#ffb36b' }), ledBlue: new THREE.MeshBasicMaterial({ color: '#ff5fa2' }),
    screen: new THREE.MeshBasicMaterial({ color: '#16324a' }), view: new THREE.MeshBasicMaterial({ map: viewTex() }),
  };
  const box = (w, h, d, m, x, y, z, sh = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; scene.add(o); return o; };
  const plane = (w, h, m, x, y, z, rx = 0, ry = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.receiveShadow = true; scene.add(o); return o; };
  const cyl = (r, h, m, x, y, z, r2 = r) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r2, r, h, 32), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };

  // --- Envolvente (planos hacia adentro: desaparecen al mirar desde afuera = corte automático)
  plane(W, D, mat.floor, W / 2, 0, D / 2, -Math.PI / 2);
  const ceiling = plane(W, D, mat.ceil, W / 2, H, D / 2, Math.PI / 2);
  plane(D, H, mat.wall, 0, H / 2, D / 2, 0, Math.PI / 2);          // izquierda
  plane(D, H, mat.wall, W, H / 2, D / 2, 0, -Math.PI / 2);         // derecha
  plane(W, H, mat.wall, W / 2, H / 2, 0, 0, 0);                    // acceso
  // Muro de ventana: antepecho + dintel, ventana de lado a lado
  plane(W, .55, mat.wall, W / 2, .275, D, 0, Math.PI); plane(W, .3, mat.wall, W / 2, H - .15, D, 0, Math.PI);
  const vista = plane(W * 2.4, 3.2, mat.view, W / 2, 1.5, D + 2.2, 0, Math.PI);  // paisaje
  box(W, .06, .1, mat.black, W / 2, .58, D - .03); box(W, .06, .1, mat.black, W / 2, H - .33, D - .03);
  for (const x of [0.03, W / 3, 2 * W / 3, W - .03]) box(.05, H - .85, .08, mat.black, x, (H - .3 + .55) / 2, D - .03);
  box(W - .1, .5, .03, M('#e9e4d8', { roughness: .9 }), W / 2, H - .58, D - .1);  // blackout a medio recoger
  const beams = []; for (let z = .5; z < D; z += .95) beams.push(box(W, .16, .12, mat.beam, W / 2, H - .08, z)); // vigas: guiño a la casa

  // --- Puerta de acceso
  box(.9, 2.1, .05, mat.oak, .65, 1.05, .03); cyl(.015, .12, mat.steel, .98, 1.0, .08).rotation.x = Math.PI / 2;

  // --- Baño: cápsula de vidrio esmerilado (1,45 × 2,0 m) — ducha + sanitario + lavamanos
  const bx = W - 1.45, bz = 2.0;
  plane(1.45, bz, mat.tile, bx + .725, .005, bz / 2, -Math.PI / 2);
  plane(bz, H, mat.tile, W - .004, H / 2, bz / 2, 0, -Math.PI / 2); plane(1.45, H, mat.tile, bx + .725, H / 2, .004, 0, 0);
  box(.025, 2.25, bz, mat.glass, bx, 1.125, bz / 2, false);                         // vidrio lateral
  box(.75, 2.25, .025, mat.glass, bx + 1.075, 1.125, bz, false);                    // vidrio frontal fijo
  box(.7, 2.25, .025, mat.glass, bx + .30, 1.125, bz + .04, false);                 // puerta corrediza
  box(1.5, .05, .08, mat.black, bx + .725, 2.27, bz); box(.05, .05, bz, mat.black, bx, 2.27, bz / 2);
  box(.035, .4, .035, mat.steel, bx + .6, 1.05, bz + .08);
  cyl(.11, .02, mat.steel, W - .45, 2.2, .45); box(.02, 1.2, .02, mat.steel, W - .1, 1.6, .45);     // ducha lluvia
  box(.9, .02, .02, mat.glass, W - .45, 1.0, .9, false);
  box(.38, .4, .55, mat.white, bx + .35, .2, .45); box(.38, .5, .18, mat.white, bx + .35, .55, .12); // sanitario
  box(.6, .12, .42, mat.white, W - .38, .85, 1.62); box(.6, .5, .4, mat.oak, W - .38, .52, 1.62);    // lavamanos
  cyl(.012, .22, mat.steel, W - .12, 1.02, 1.62);
  const mirror = box(.02, .7, .55, M('#cfd8dc', { metalness: 1, roughness: .05 }), W - .02, 1.5, 1.62, false);
  box(.02, .03, .6, mat.led, W - .03, 1.88, 1.62, false);
  box(1.4, .02, .02, mat.ledBlue, bx + .725, .04, .03, false);                                     // luz ambiente de color

  // --- Cocineta lineal (2,1 m) en muro izquierdo
  const kz0 = 1.15, kl = 2.1, kz = kz0 + kl / 2;
  box(.6, .86, kl, mat.white, .3, .43, kz); box(.63, .04, kl + .02, mat.counter, .315, .88, kz);
  for (let i = 0; i < 4; i++) box(.01, .7, .005, mat.black, .605, .45, kz0 + (i + .5) * kl / 4 + .24, false); // juntas de puertas
  box(.5, .72, .56, mat.steel, .32, .4, kz0 + .3);                                               // nevera bajo mesón
  box(.4, .015, .5, mat.steel, .32, .9, kz0 + .95); cyl(.012, .25, mat.steel, .12, 1.02, kz0 + .95); // poceta + grifo
  box(.36, .012, .52, mat.black, .32, .905, kz0 + 1.65);                                         // inducción 2 puestos
  for (const dz of [-.12, .12]) { const r = new THREE.Mesh(new THREE.RingGeometry(.07, .08, 32), new THREE.MeshBasicMaterial({ color: '#c8372d' })); r.rotation.x = -Math.PI / 2; r.position.set(.32, .913, kz0 + 1.65 + dz); scene.add(r); }
  plane(kl, .55, mat.tile, .006, 1.18, kz, 0, Math.PI / 2);                                       // salpicadero
  box(.32, .04, kl, mat.oak, .16, 1.5, kz); box(.34, .34, kl, mat.white, .17, 2.0, kz);            // repisa + mueble alto
  box(.3, .03, kl - .1, mat.led, .17, 1.475, kz, false);
  box(.3, .26, .45, mat.black, .17, 1.65, kz0 + .3); box(.01, .18, .3, mat.screen, .325, 1.65, kz0 + .27, false); // microondas
  cyl(.06, .2, mat.red, .2, 1.0, kz0 + .55); cyl(.035, .1, mat.white, .17, 1.57, kz0 + 1.2); cyl(.035, .1, mat.white, .17, 1.57, kz0 + 1.32); cyl(.035, .1, mat.teal, .17, 1.57, kz0 + 1.44);

  // --- Mesa de trabajo / comedor abatible + 2 butacos (muro derecho)
  box(.5, .04, 1.1, mat.oak, W - .25, .75, 2.85); box(.04, .72, .04, mat.black, W - .47, .37, 3.35); box(.04, .72, .04, mat.black, W - .47, .37, 2.35);
  for (const z of [2.6, 3.1]) { cyl(.17, .05, mat.red, W - .85, .47, z); cyl(.02, .45, mat.black, W - .85, .23, z); cyl(.15, .02, mat.black, W - .85, .01, z); }
  box(.02, .5, .85, mat.black, W - .015, 1.55, 2.85); box(.005, .45, .8, mat.screen, W - .03, 1.55, 2.85, false); // Smart TV
  cyl(.1, .22, mat.pot, W - .2, .88, 3.3, .08); const pl = new THREE.Mesh(new THREE.IcosahedronGeometry(.17, 1), mat.plant); pl.position.set(W - .2, 1.12, 3.3); pl.castShadow = true; scene.add(pl);

  if (opts.ac) { box(.2, .28, .85, mat.white, W - .1, 2.25, 4.3); box(.02, .02, .8, mat.black, W - .2, 2.13, 4.3, false); }   // minisplit (clima cálido)

  // --- Cama XL de muro a muro contra el ventanal (sello citizenM) con almacenamiento bajo plataforma
  const pz = D - 2.15;
  box(W, .42, 2.15, mat.oak, W / 2, .21, pz + 1.075); box(W - .1, .025, .02, mat.led, W / 2, .05, pz - .012, false);
  for (let i = 0; i < 3; i++) box(.01, .3, .005, mat.black, (i + 1) * W / 4, .22, pz - .003, false);
  box(2.0, .26, 2.0, mat.linen, 1.02, .55, pz + 1.12); box(2.04, .1, 1.3, M('#e7e1d6', { roughness: 1 }), 1.02, .66, pz + .7);  // colchón + duvet
  box(2.04, .04, .45, mat.teal, 1.02, .72, pz + .3);                                                // pie de cama
  for (const x of [.55, 1.5]) box(.75, .16, .42, mat.white, x, .78, D - .4);
  box(.45, .4, .14, mat.red, 1.02, .85, D - .62).rotation.x = -.25;
  box(1.1, .12, 2.0, M('#d8d2c6', { roughness: 1 }), W - .57, .48, pz + 1.12);                       // nicho-sofá junto a la cama
  box(.5, .4, .16, mat.teal, W - .45, .72, D - .35).rotation.x = -.2; box(.4, .4, .14, mat.red, W - .85, .7, D - .33).rotation.x = -.2;
  cyl(.13, .02, mat.black, W - .3, .55, pz + .35); cyl(.04, .09, mat.white, W - .3, .6, pz + .35);   // bandeja + taza
  box(.04, .04, .3, mat.black, .02, 1.35, pz + .5); cyl(.07, .12, mat.led, .1, 1.3, pz + .64, .04);  // lámpara de lectura

  // --- Iluminación
  scene.add(new THREE.HemisphereLight('#ffffff', '#b89a78', .55));
  const sun = new THREE.DirectionalLight('#fff1dc', 3.2); sun.position.set(W / 2 - 1.2, 3.2, D + 3.5); sun.target.position.set(W / 2 + .3, 0, 2.2); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004; sun.shadow.radius = 6;
  Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .5, far: 14 });
  const pt = (c, i, x, y, z, d = 4) => { const l = new THREE.PointLight(c, i, d, 2); l.position.set(x, y, z); scene.add(l); return l; };
  pt('#ffc98a', 2.2, .5, 1.35, kz); pt('#ffd9ae', 2.5, W / 2, 2.3, 2.6, 5); pt('#ff6fae', 1.4, bx + .7, .5, .6, 2.5); pt('#ffe2c0', 1.6, W - .6, 2.1, 1.0, 3); pt('#ffc98a', 1.2, W / 2, .2, pz - .2, 2);

  // --- Cámara / vistas
  const camera = new THREE.PerspectiveCamera(62, 16 / 9, .05, 60);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.maxPolarAngle = Math.PI * .52;
  const views = {
    acceso:  { p: [.75, 1.55, .12], t: [W / 2 + .2, 1.0, D], fov: 78, cut: false },
    cama:    { p: [1.25, 1.6, D - 1.9], t: [W / 2 + .1, 1.0, 0], fov: 84, cut: false },
    cocina:  { p: [W - .25, 1.5, 3.7], t: [.2, 1.05, 1.9], fov: 72, cut: false },
    axo:     { p: [W + 3.3, 4.3, -2.7], t: [W / 2, .6, D / 2 + .2], fov: 38, cut: true },
    planta:  { p: [W / 2, 9.5, D / 2 + .001], t: [W / 2, 0, D / 2], fov: 40, cut: true },
  };
  function setView(name) {
    const v = views[name]; camera.position.set(...v.p); controls.target.set(...v.t); camera.fov = v.fov; camera.updateProjectionMatrix();
    ceiling.visible = !v.cut; vista.visible = !v.cut; beams.forEach(b => b.visible = !v.cut); controls.update();
  }
  function resize() { const w = container.clientWidth, h = container.clientHeight; renderer.setSize(w, h, false); renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'; camera.aspect = w / h; camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize(); setView(opts.view || 'axo');
  let run = true; (function loop() { if (!run) return; controls.update(); renderer.render(scene, camera); requestAnimationFrame(loop); })();

  async function capture(name, w = 1920, h = 1080) {                 // render fijo -> PNG
    setView(name); renderer.setPixelRatio(1); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.render(scene, camera); const blob = await new Promise(r => renderer.domElement.toBlob(r, 'image/png')); resize(); return blob;
  }
  return { setView, capture, views: Object.keys(views), area: (W * D).toFixed(1) };
}
