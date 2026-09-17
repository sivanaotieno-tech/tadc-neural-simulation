"""Run inside Blender with Circus Lobby V10.blend open.

Imports the MRI-derived GLB when available and creates a Bubble fruit-fly
brain display from the supplied reference image.
"""
import bpy
import os
from mathutils import Vector

BASE = os.path.dirname(bpy.data.filepath)
GLB = os.path.join(BASE, 'assets', 'models', 'bma_mri_brain.glb')
BUBBLE = os.path.join(BASE, 'assets', 'brain-scans', 'bubble-fruit-fly-brain.jpg')


def import_mri_brain(path, name='Neural Archive A'):
    if not os.path.exists(path):
        print('MRI GLB not found:', path)
        return None
    # Blender 4.x API.
    bpy.ops.import_scene.gltf(filepath=path)
    imported = list(bpy.context.selected_objects)
    root = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(root)
    for obj in imported:
        obj.parent = root
    root.location = (0, 0, 2.2)
    root.scale = (1.5, 1.5, 1.5)
    for obj in imported:
        if obj.type == 'MESH':
            for mat in obj.data.materials:
                if mat:
                    mat.use_nodes = True
                    bsdf = mat.node_tree.nodes.get('Principled BSDF')
                    if bsdf:
                        bsdf.inputs['Metallic'].default_value = 0.05
                        bsdf.inputs['Roughness'].default_value = 0.55
    return root


def make_holo(name, path, loc, scale, tint):
    bpy.ops.mesh.primitive_plane_add(size=2, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    mat = bpy.data.materials.new(name + ' Emission')
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    tex = nt.nodes.new('ShaderNodeTexImage')
    try:
        tex.image = bpy.data.images.load(path, check_existing=True)
    except Exception as exc:
        print('Bubble image not found:', exc)
    em.inputs['Strength'].default_value = 4.0
    em.inputs['Color'].default_value = (*tint, 1)
    nt.links.new(tex.outputs['Color'], em.inputs['Color'])
    nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    obj.data.materials.append(mat)
    return obj


cam = bpy.context.scene.camera
if cam:
    q = cam.matrix_world.to_quaternion()
    forward = q @ Vector((0, 0, -1))
    right = q @ Vector((1, 0, 0))
    center = cam.location + forward * 5.0
else:
    center = Vector((0, 0, 2))
    right = Vector((1, 0, 0))

brain = import_mri_brain(GLB)
if brain:
    brain.location = center - right * 1.6

if os.path.exists(BUBBLE):
    make_holo('Bubble Fruit-Fly Brain', BUBBLE, center + right * 1.6, (1.7, 1.7, 1.7), (1.0, 0.35, 0.85))

print('Neural Archive A and Bubble brain display setup complete.')
