# TADC Neural Simulation Lab 🧠🎪

A TADC-inspired interactive neural exhibit built around the supplied Circus Lobby environment and brain references.

## Project structure

- `index.html` — main interactive web exhibit.
- `index-github.html` — GitHub-friendly entry page.
- `assets/brain-human.svg` — web human-neural visualization.
- `assets/brain-bubble.svg` — Bubble fruit-fly neural visualization.
- `add_brains_to_blend.py` — Blender automation script for creating emissive hologram planes.
- `Circus Lobby V10.blend` — original Blender source scene.
- `assets/brain-human.webp` — supplied human-brain reference.
- `assets/brain-bubble.jpg` — supplied fruit-fly-brain reference.
- `vercel.json` — Vercel routing configuration.

## Blender setup

Open `Circus Lobby V10.blend` in Blender with the `assets` folder beside it, then run `add_brains_to_blend.py`. The script creates `Neural Archive A` and `Bubble Fruit-Fly Brain` emissive holograms in front of the active camera.

## Web exhibit

Open `index.html` locally or deploy the repository as a static Vercel site. The browser version uses the SVG neural assets so it works without a Blender runtime.

## Binary-source note

The complete source package also contains the original `.blend`, `.webp`, and `.jpg` binary files. This GitHub connection can write UTF-8 repository files, but it cannot transfer the 59 MB Blender binary through the repository contents interface. Those binary source files therefore need to be uploaded through GitHub's normal web/Git client (or Git LFS for the large Blender file). The repository still contains the runnable web/source layer and Blender integration script.

## Credits

TADC-inspired fan project. Use supplied brain imagery/models only where you have the appropriate rights or permission.
