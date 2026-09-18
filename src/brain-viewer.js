import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/webxr/VRButton.js';

export class BrainViewer {
  constructor(canvas, onState) {
    this.canvas = canvas;
    this.onState = onState;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x09051a);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.01, 1000);
    this.camera.position.set(0, 2.5, 16);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.xr.enabled = true;

    const vrButton = VRButton.createButton(this.renderer);
    vrButton.id = 'vrButton';
    vrButton.textContent = 'ENTER VR';
    document.body.appendChild(vrButton);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 35;

    this.scene.add(new THREE.HemisphereLight(0xdde8ff, 0x241033, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(7, 12, 10);
    this.scene.add(key);
    const rim = new THREE.PointLight(0x6bdcff, 18, 60);
    rim.position.set(-12, 6, -12);
    this.scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(24, 64),
      new THREE.MeshStandardMaterial({ color: 0x120c26, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -4.2;
    this.scene.add(floor);
    const grid = new THREE.GridHelper(48, 48, 0x4a3768, 0x211832);
    grid.position.y = -4.18;
    this.scene.add(grid);

    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);
    this.pulse = true;
    this.autoRotate = false;
    this.clock = new THREE.Clock();
    this.playerAvatar = null;
    this.ribbitAvatar = null;
    this.controllers = [];
    this.setupControllers();
    this.makeParticles();
    this.resize();
    addEventListener('resize', () => this.resize());
    canvas.addEventListener('dblclick', () => this.reset());
    this.loadAsset('assets/models/bma_mri_brain.glb');
    this.animate();
  }

  makeParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 12;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = -2 + Math.random() * 12;
      positions[i * 3 + 2] = Math.sin(a) * r;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x8fdcff, size: 0.035, transparent: true, opacity: 0.65 }));
    this.particleGroup.add(points);
  }

  setupControllers() {
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.userData.index = i;
      controller.addEventListener('selectstart', () => {
        this.group.userData.grabStart = performance.now();
        this.group.userData.grabRotation = this.group.rotation.y;
      });
      controller.addEventListener('selectend', () => {
        this.group.userData.grabStart = 0;
      });
      this.scene.add(controller);
      this.controllers.push(controller);
    }
  }

  resize() {
    const w = this.canvas.clientWidth || innerWidth;
    const h = this.canvas.clientHeight || innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  async loadAsset(path) {
    this.onState?.(`Loading ${path.includes('bubble') ? 'Bubble' : 'player'} 3D asset…`);
    this.group.clear();
    try {
      const gltf = await new GLTFLoader().loadAsync(path);
      const root = gltf.scene;
      if (!path.includes('bubble')) root.rotation.x = -Math.PI / 2;
      this.group.add(root);
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const max = Math.max(size.x, size.y, size.z) || 1;
      root.scale.setScalar(path.includes('bubble') ? 7 / max : 11 / max);
      const scaledBox = new THREE.Box3().setFromObject(root);
      root.position.sub(scaledBox.getCenter(new THREE.Vector3()));
      root.traverse(o => {
        if (o.isMesh && o.material) {
          o.castShadow = false;
          o.receiveShadow = true;
          o.material.roughness = 0.72;
        }
      });
      this.onState?.(path.includes('bubble') ? 'BUBBLE WORLD ONLINE' : 'PLAYER WORLD ONLINE');
    } catch (error) {
      console.warn('Optional brain asset unavailable; using procedural fallback.', error);
      this.onState?.(`Using procedural ${path.includes('bubble') ? 'Bubble' : 'player'} fallback`);
      this.makeFallback(path.includes('bubble'));
    }
  }

  makeFallback(bubble = false) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: bubble ? 0x66ddff : 0xb77dff,
      roughness: .6,
      emissive: bubble ? 0x003344 : 0x220044,
      emissiveIntensity: .35
    });
    const count = bubble ? 12 : 18;
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2;
      const r = bubble ? 1.9 : 3.2;
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(bubble ? .45 : .9, 2), mat);
      m.position.set(Math.cos(a) * r, Math.sin(i * 1.7) * .9, Math.sin(a) * r * .35);
      m.scale.y = .7;
      g.add(m);
    }
    this.group.add(g);
  }

  setPlayerCharacter(active, name = 'PLAYER-01') {
    if (this.playerAvatar) this.group.remove(this.playerAvatar);
    this.playerAvatar = null;
    if (!active) return;
    const avatar = new THREE.Group();
    avatar.name = 'PersistentPlayerCharacter';
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(2.15, 32, 20),
      new THREE.MeshStandardMaterial({ color: 0x7f5cff, emissive: 0x251044, emissiveIntensity: .45, roughness: .42 })
    );
    shell.scale.set(1.05, 1.2, .9);
    avatar.add(shell);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, .06, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x9cecff })
    );
    ring.rotation.x = Math.PI / 2;
    avatar.add(ring);
    const label = this.makeLabel(name);
    label.position.set(0, 3.05, 0);
    avatar.add(label);
    avatar.position.set(0, .2, 0);
    this.group.add(avatar);
    this.playerAvatar = avatar;
  }

  makeLabel(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0c0614'; ctx.fillRect(0, 0, 512, 96);
    ctx.strokeStyle = '#9cecff'; ctx.strokeRect(2, 2, 508, 92);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(text.slice(0, 20), 256, 59);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(4.5, .84, 1);
    return sprite;
  }

  showRibbit() {
    if (this.ribbitAvatar) this.group.remove(this.ribbitAvatar);
    const avatar = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(.8, 20, 14),
      new THREE.MeshStandardMaterial({ color: 0x72e69a, roughness: .7, emissive: 0x0a3d24, emissiveIntensity: .35 })
    );
    body.scale.y = .8;
    avatar.add(body);
    for (const x of [-.34, .34]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      eye.position.set(x, .6, .35);
      avatar.add(eye);
    }
    avatar.position.set(3.8, -1.8, 1);
    this.group.add(avatar);
    this.ribbitAvatar = avatar;
  }

  setMode(mode) {
    return this.loadAsset(mode === 'bubble' ? 'assets/models/bubble_fruit_fly_brain.glb' : 'assets/models/bma_mri_brain.glb');
  }

  setPulse(value) { this.pulse = value; }
  setAutoRotate(value) { this.autoRotate = value; }

  reset() {
    this.camera.position.set(0, 2.5, 16);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.group.rotation.set(0, 0, 0);
  }

  animate() {
    this.renderer.setAnimationLoop(() => {
      const dt = this.clock.getDelta();
      if (this.autoRotate) this.group.rotation.y += dt * .35;
      if (this.pulse) {
        const scale = 1 + Math.sin(performance.now() * .0025) * .008;
        this.group.scale.setScalar(scale);
      } else {
        this.group.scale.setScalar(1);
      }
      this.particleGroup.rotation.y += dt * .025;
      if (this.playerAvatar) this.playerAvatar.position.y = .2 + Math.sin(performance.now() * .0018) * .12;
      if (this.ribbitAvatar) this.ribbitAvatar.rotation.y += dt * .8;
      if (!this.renderer.xr.isPresenting) this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }
}
