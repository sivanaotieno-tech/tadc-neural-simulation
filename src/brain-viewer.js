import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

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
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.pulse = true;
    this.autoRotate = false;
    this.clock = new THREE.Clock();
    this.resize();
    addEventListener('resize', () => this.resize());
    canvas.addEventListener('dblclick', () => this.reset());
    this.loadAsset();
    this.animate();
  }

  resize() {
    const w = this.canvas.clientWidth || innerWidth;
    const h = this.canvas.clientHeight || innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  async loadAsset() {
    this.onState?.('Loading MRI-derived 3D asset…');
    try {
      const gltf = await new GLTFLoader().loadAsync('assets/models/bma_mri_brain.glb');
      const root = gltf.scene;
      root.rotation.x = -Math.PI / 2;
      this.group.add(root);
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const max = Math.max(size.x, size.y, size.z) || 1;
      root.scale.setScalar(11 / max);
      const scaledBox = new THREE.Box3().setFromObject(root);
      const center = scaledBox.getCenter(new THREE.Vector3());
      root.position.sub(center);
      root.traverse(o => {
        if (o.isMesh) {
          o.castShadow = false;
          o.receiveShadow = true;
          if (o.material) {
            o.material.roughness = 0.72;
            o.material.metalness = 0.05;
          }
        }
      });
      this.onState?.('MRI 3D ASSET ONLINE');
    } catch (error) {
      console.error(error);
      this.onState?.('3D asset missing — add assets/models/bma_mri_brain.glb');
      this.makeFallback();
    }
  }

  makeFallback() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xb77dff, roughness: .6, metalness: .05, emissive: 0x220044, emissiveIntensity: .35 });
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2;
      const r = 3.2 + Math.sin(i * 2.7) * .35;
      const s = .9 + (i % 4) * .12;
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 2), mat);
      m.position.set(Math.cos(a) * r, Math.sin(i * 1.7) * .9, Math.sin(a) * r * .35);
      m.scale.y = .7;
      g.add(m);
    }
    this.group.add(g);
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
    requestAnimationFrame(() => this.animate());
    const dt = this.clock.getDelta();
    if (this.autoRotate) this.group.rotation.y += dt * .35;
    if (this.pulse) {
      const scale = 1 + Math.sin(performance.now() * .0025) * .008;
      this.group.scale.setScalar(scale);
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
