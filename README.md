# TADC Neural Circus VR 🧠🎪🥽

A WebXR-ready TADC-inspired neural laboratory built around the supplied MRI and fruit-fly brain references.

## VR mode

The browser build now uses Three.js WebXR and provides an **ENTER VR** button. On a compatible headset/browser, launch immersive VR and inspect the neural lab around you.

Desktop mode remains available for testing with mouse orbit and wheel zoom.

### Current VR features

- WebXR immersive-session button
- VR-compatible Three.js renderer
- Human MRI-derived 3D brain
- Bubble fruit-fly brain mode
- Neural pulse animation
- Auto-rotation toggle
- Reset view
- VR-friendly neural-lab floor/grid
- Mode switching between Human MRI and Bubble

## Asset paths

```text
assets/models/bma_mri_brain.glb
assets/models/bubble_fruit_fly_brain.glb
assets/brain-scans/bubble-fruit-fly-brain.jpg
```

The binary GLBs must be uploaded through Git/LFS or another normal Git client; the repository's connector can write the WebXR source code but cannot transfer local binary files directly. `.gitattributes` is configured for GLB/GZIP/Blend LFS tracking.

## MRI source

The human asset was generated from `bma-1-mri.nii.gz` using physical-spacing-aware preprocessing and marching cubes. It is an anatomical MRI-derived surface, not a neuron-by-neuron connectome or medical diagnostic tool.

## Bubble source

Bubble's browser asset uses the supplied `Fruit_Brain.jpg` as its scan/reference source. A single 2D image cannot establish a true volumetric neuron-by-neuron fruit-fly connectome.

## Run locally

```bash
python -m http.server 8080
```

Open `http://localhost:8080/` in a WebXR-capable browser. For immersive VR, use a compatible headset/browser and HTTPS in deployed environments.

## Rebuild the human asset

```bash
pip install nibabel numpy scipy scikit-image trimesh
python tools/nifti_to_glb.py bma-1-mri.nii.gz assets/models/bma_mri_brain.glb
```

## Project structure

```text
.
├── index.html
├── src/
│   ├── app.js
│   ├── brain-viewer.js
│   ├── neural-network.js
│   └── styles.css
├── assets/
│   ├── brain-scans/
│   └── models/
├── tools/
├── blender/
├── add_brains_to_blend.py
├── vercel.json
└── README.md
```

## Vercel

The project is a static WebXR site. Serve it over HTTPS for deployed immersive sessions.

## Credits / rights

TADC-inspired fan project. Use source brain imagery, models, and environment files only where you have the appropriate rights or permission.
