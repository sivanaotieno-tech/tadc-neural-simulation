# Browser 3D brain assets

Place the generated MRI-derived model here:

`bma_mri_brain.glb`

The web app loads that file from `/assets/models/bma_mri_brain.glb` with Three.js/GLTFLoader.

## Generated asset

The source volume was `bma-1-mri.nii.gz`. The browser asset is a lightweight marching-cubes surface generated from the volume after physical-spacing-aware preprocessing.

The repository's GitHub contents integration can create text files but cannot directly upload binary `.glb`, `.nii.gz`, `.blend`, `.jpg`, or `.webp` files. Therefore the binary asset must be added through a normal Git/Git LFS upload or GitHub's web upload before the deployed viewer can load it.

Do not replace the GLB with a procedural SVG if the goal is to use the real MRI-derived geometry.
