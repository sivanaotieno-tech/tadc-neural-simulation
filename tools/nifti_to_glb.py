"""Convert a NIfTI MRI volume into a lightweight browser GLB.

Usage:
  pip install nibabel numpy scipy scikit-image trimesh
  python tools/nifti_to_glb.py bma-1-mri.nii.gz assets/models/bma_mri_brain.glb

This produces an anatomical surface approximation. It is not a neuron-by-neuron
connectome and is not intended for medical diagnosis.
"""
from __future__ import annotations
import argparse
import nibabel as nib
import numpy as np
from scipy import ndimage
from skimage.measure import marching_cubes
import trimesh


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('source')
    ap.add_argument('output')
    ap.add_argument('--threshold', type=float, default=30)
    ap.add_argument('--erosion-mm', type=float, default=2.0)
    ap.add_argument('--step-size', type=int, default=5)
    args = ap.parse_args()

    img = nib.load(args.source)
    vol = np.asarray(img.dataobj)
    zooms = np.asarray(img.header.get_zooms()[:3], dtype=float)

    # Work in canonical RAS orientation before segmentation.
    img = nib.as_closest_canonical(img)
    vol = np.asarray(img.dataobj, dtype=np.float32)
    zooms = np.asarray(img.header.get_zooms()[:3], dtype=float)

    # Reduce only extremely high in-plane resolution while retaining slice detail.
    vol = vol[::2, ::2, :]
    spacing = np.array([zooms[0] * 2, zooms[1] * 2, zooms[2]])

    mask = vol > args.threshold
    labels, n = ndimage.label(mask, structure=np.ones((3, 3, 3), np.uint8))
    if n == 0:
        raise RuntimeError('No foreground component found. Adjust --threshold.')
    counts = np.bincount(labels.ravel())
    mask = labels == np.argmax(counts[1:]) + 1
    mask = ndimage.binary_closing(mask, iterations=1)
    mask = ndimage.binary_fill_holes(mask)

    distance = ndimage.distance_transform_edt(mask, sampling=spacing)
    mask = distance > args.erosion_mm
    labels, n = ndimage.label(mask, structure=np.ones((3, 3, 3), np.uint8))
    counts = np.bincount(labels.ravel())
    mask = labels == np.argmax(counts[1:]) + 1

    verts, faces, normals, values = marching_cubes(
        mask.astype(np.float32), 0.5, spacing=spacing,
        step_size=args.step_size, allow_degenerate=False
    )
    mesh = trimesh.Trimesh(verts, faces, process=True)
    mesh.remove_unreferenced_vertices()
    mesh.fix_normals()
    trimesh.smoothing.filter_taubin(mesh, lamb=.35, nu=.33, iterations=3)
    mesh.remove_unreferenced_vertices()
    mesh.fix_normals()
    mesh.apply_translation(-mesh.bounds.mean(axis=0))
    mesh.export(args.output)
    print(f'Wrote {args.output}: {len(mesh.vertices)} vertices, {len(mesh.faces)} triangles')


if __name__ == '__main__':
    main()
