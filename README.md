# TADC Neural Simulation 🧠🎪

A browser-based TADC-inspired neural exhibit using the supplied brain references and an **MRI-derived 3D brain asset**.

## What is in the project

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
│   │   └── README.md
│   └── models/
│       └── README.md
├── tools/
│   └── nifti_to_glb.py
├── add_brains_to_blend.py
├── vercel.json
└── README.md
```

## MRI pipeline

The uploaded `bma-1-mri.nii.gz` was converted into `bma_mri_brain.glb`. The generated browser asset is a lightweight anatomical surface produced with physical voxel spacing, connected-component cleanup, physical erosion, marching cubes, and smoothing.

The resulting GLB is approximately 0.55 MB, with about 14k vertices and 29k triangles, making it practical for a browser viewer.

**This is an anatomical MRI-derived surface, not a neuron-by-neuron connectome and not a medical diagnostic tool.**

## Put the binary assets in the repository

The GitHub connection used to build this repository can write UTF-8 source files but cannot directly transfer binary `.glb`, `.nii.gz`, `.blend`, `.jpg`, or `.webp` files through the repository contents API.

For the complete binary project, add:

```text
assets/models/bma_mri_brain.glb
assets/brain-scans/human-brain.webp
assets/brain-scans/bubble-fruit-fly-brain.jpg
blender/Circus Lobby V10.blend
```

The generated GLB is available from this ChatGPT conversation as `bma_mri_brain.glb`. The original Blender scene and supplied scan images are also available as the uploaded source files.

For the 59 MB Blender source, Git LFS is recommended.

## Run locally

Because the app uses ES modules, serve the folder through a local HTTP server rather than opening `index.html` with `file://`.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/`.

## Rebuild the brain asset

```bash
pip install nibabel numpy scipy scikit-image trimesh
python tools/nifti_to_glb.py bma-1-mri.nii.gz assets/models/bma_mri_brain.glb
```

## Blender integration

Open the supplied `Circus Lobby V10.blend` in Blender and run `add_brains_to_blend.py`. The script can import the generated GLB as the anatomical brain object and create a Bubble neural display placeholder.

## Vercel

This is a static site: Vercel can serve `index.html`, `src/`, and `assets/` directly. Once the binary GLB is uploaded to `assets/models/`, the 3D viewer will load it automatically.

## Credits / rights

TADC-inspired fan project. Use source brain imagery, models, and environment files only where you have the appropriate rights or permission.
