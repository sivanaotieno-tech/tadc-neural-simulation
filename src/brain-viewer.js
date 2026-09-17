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
    this.group.position.y = 0;
    this.scene.add(this.group);
    this.pulse = true;
    this.autoRotate = false;
    this.clock = new THREE.Clock();
    this.controllers = [];
    this.setupControllers();
    this.resize();
    addEventListener('resize', () => this.resize());
    canvas.addEventListener('dblclick', () => this.reset());
    this.loadAsset('assets/models/bma_mri_brain.glb');
    this.animate();
  }

  setupControllers() {
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.userData.index = i;
      controller.addEventListener('selectstart', () => {
        this.group.userData.grabStart = performance.now();
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
    this.onState?.(`Loading ${path.includes('bubble') ? 'Bubble' : 'MRI'} 3D asset…`);
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
      const center = scaledBox.getCenter(new THREE.Vector3());
      root.position.sub(center);
      root.traverse(o => {
        if (o.isMesh && o.material) {
          o.castShadow = false;
          o.receiveShadow = true;
          o.material.roughness = 0.72;
        }
      });
      this.onState?.(path.includes('bubble') ? 'BUBBLE VR LINK ONLINE' : 'MRI 3D ASSET ONLINE');
    } catch (error) {
      console.error(error);
      this.onState?.(`3D asset missing — ${path}`);
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
      }
      if (!this.renderer.xr.isPresenting) this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }
}
