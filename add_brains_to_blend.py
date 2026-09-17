# Run inside Blender with Circus Lobby V10.blend open.
# Adds two emissive hologram planes in front of the active camera.
import bpy, os
from mathutils import Vector
BASE = os.path.dirname(bpy.data.filepath)
HUMAN = os.path.join(BASE, 'assets', 'brain-human.webp')
BUBBLE = os.path.join(BASE, 'assets', 'brain-bubble.jpg')

def make_holo(name, path, loc, scale, tint):
    bpy.ops.mesh.primitive_plane_add(size=2, location=loc)
    obj=bpy.context.object; obj.name=name; obj.scale=scale
    mat=bpy.data.materials.new(name+' Emission'); mat.use_nodes=True
    nt=mat.node_tree; nt.nodes.clear()
    out=nt.nodes.new('ShaderNodeOutputMaterial'); em=nt.nodes.new('ShaderNodeEmission'); tex=nt.nodes.new('ShaderNodeTexImage')
    try: tex.image=bpy.data.images.load(path, check_existing=True)
    except: pass
    em.inputs['Strength'].default_value=4.0
    em.inputs['Color'].default_value=(*tint,1)
    nt.links.new(tex.outputs['Color'], em.inputs['Color']); nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    obj.data.materials.append(mat)
    return obj

cam=bpy.context.scene.camera
if cam:
    forward = cam.matrix_world.to_quaternion() @ Vector((0,0,-1))
    right = cam.matrix_world.to_quaternion() @ Vector((1,0,0))
    up = cam.matrix_world.to_quaternion() @ Vector((0,1,0))
    center = cam.location + forward*5.0
else:
    center=Vector((0,0,2)); right=Vector((1,0,0)); up=Vector((0,1,0))

make_holo('Neural Archive A', HUMAN, center-right*1.6, (1.7,1.7,1.7), (0.55,0.7,1.0))
make_holo('Bubble Fruit-Fly Brain', BUBBLE, center+right*1.6, (1.7,1.7,1.7), (1.0,0.35,0.85))
print('Added Neural Archive A and Bubble Fruit-Fly Brain holograms.')
