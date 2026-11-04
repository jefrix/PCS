"""Import the exported GLB into Blender, save a .blend with the explode animation, render a poster.
   blender -b -P blender_scene.py -- model.glb out.blend poster.png   or   python3 blender_scene.py model.glb out.blend poster.png"""
import bpy,sys,math,mathutils
a=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:]
glb,blend,poster=a[0],a[1],(a[2] if len(a)>2 else None);frame=int(a[3]) if len(a)>3 else None
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
sc=bpy.context.scene;fps=sc.render.fps
meshes=[o for o in sc.objects if o.type=='MESH'];print('meshes',len(meshes),'actions',len(bpy.data.actions))
for ac in bpy.data.actions:ac.use_fake_user=True
sc.frame_start=1;sc.frame_end=4*fps
sc.frame_set(frame or 2*fps+1)
dg=bpy.context.evaluated_depsgraph_get();lo=mathutils.Vector((1e9,)*3);hi=-lo
for o in meshes:
  for c in o.bound_box:
    w=o.matrix_world@mathutils.Vector(c);lo=mathutils.Vector(map(min,lo,w));hi=mathutils.Vector(map(max,hi,w))
ctr=(lo+hi)/2;size=(hi-lo).length
print('bounds',tuple(round(x,2) for x in hi-lo))
w=bpy.data.worlds.new('w');w.use_nodes=True;w.node_tree.nodes['Background'].inputs[0].default_value=(.035,.05,.06,1);w.node_tree.nodes['Background'].inputs[1].default_value=.9;sc.world=w
cam=bpy.data.cameras.new('cam');cam.lens=55;co=bpy.data.objects.new('cam',cam);sc.collection.objects.link(co);sc.camera=co
d=mathutils.Vector((.58,-.72,.36)).normalized();co.location=ctr+d*size*2.0
co.rotation_euler=(ctr-co.location).to_track_quat('-Z','Y').to_euler()
for loc,e,col in [((1,-1,1.4),5.5,(1,.96,.9)),((-1.2,.6,.6),2.6,(.6,.8,1))]:
  l=bpy.data.lights.new('sun','SUN');l.energy=e;l.color=col;ob=bpy.data.objects.new('sun',l);sc.collection.objects.link(ob);ob.rotation_euler=mathutils.Vector(loc).to_track_quat('Z','Y').to_euler()
sc.render.engine='CYCLES';sc.cycles.samples=48;sc.cycles.device='CPU';sc.cycles.use_denoising=False
sc.render.resolution_x=1600;sc.render.resolution_y=1000;sc.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=blend)
if poster:
  sc.render.filepath=poster;bpy.ops.render.render(write_still=True);print('rendered',poster)
