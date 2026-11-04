// Exports every scene to GLB with a keyframed explode animation. Blender imports these directly.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const NM=process.env.NM,OUT=process.env.GLB_OUT;const page0=path.resolve(__dirname,'..','index.html');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 const p=await b.newPage();await p.route('**/*',r=>{const u=r.request().url();if(u.includes('three@0.147.0/')){return r.fulfill({path:path.join(NM,'three',u.split('three@0.147.0/')[1]),contentType:'text/javascript'});}if(u.startsWith('file:'))return r.continue();return r.abort();});
 await p.goto('file://'+page0);await p.waitForFunction(()=>window.THREE&&window.__viewer);await p.addScriptTag({path:path.join(NM,'three/examples/js/exporters/GLTFExporter.js')});
 const list=[['5355J','machine'],['5355J','pump'],['5355J','burner'],['5355J','unloader'],['5355J','gun'],['8405HNL','machine'],['8405HNL','pump'],['8405HNL','burner'],['8405HNL','unloader']];
 for(const [m,s] of list){const b64=await p.evaluate(async([m,s])=>{const b=BUILDERS[s](m);
   const res=q=>{const[n,x,y,z]=q;return n&&b.nodes[n]?b.nodes[n].home.clone().add(new THREE.Vector3(x,y,z)):new THREE.Vector3(x,y,z);};
   b.links.forEach(l=>{const c=new THREE.CatmullRomCurve3(l.pts.map(res),false,'catmullrom',.35);const me=new THREE.Mesh(new THREE.TubeGeometry(c,24,l.r,7),l.mat);me.name=l.id;b.nodes[l.node].group.add(me);});
   const kill=[];b.root.traverse(o=>{if(o.userData.noExport||o.isInstancedMesh||o.isLine||o.isLight||o.userData.noPick)kill.push(o);});kill.forEach(o=>o.parent&&o.parent.remove(o));
   const tracks=[];Object.values(b.nodes).forEach(n=>{const h=n.home,o=n.off;if(o.lengthSq())tracks.push(new THREE.VectorKeyframeTrack(n.id+'.position',[0,2,4],[h.x,h.y,h.z,h.x+o.x,h.y+o.y,h.z+o.z,h.x,h.y,h.z]));n.subs.forEach((q,i)=>{q.obj.name=n.id+'_part'+i;const a=q.home,c=q.off;tracks.push(new THREE.VectorKeyframeTrack(q.obj.name+'.position',[0,2,4],[a.x,a.y,a.z,a.x+c.x,a.y+c.y,a.z+c.z,a.x,a.y,a.z]));});});
   b.root.name=m+'_'+s;const clip=new THREE.AnimationClip('Explode',4,tracks);
   const scene=new THREE.Scene();b.root.scale.setScalar(.0254);/* inches to metres */scene.add(b.root);
   const ab=await new Promise((ok,no)=>new THREE.GLTFExporter().parse(scene,ok,no,{binary:true,animations:[clip]}));
   let bin='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=8192)bin+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(bin);},[m,s]);
  const name=s==='gun'?'trigger-gun.glb':`${m}-${s}.glb`;const f=path.join(OUT,name);fs.writeFileSync(f,Buffer.from(b64,'base64'));console.log(name,(fs.statSync(f).size/1024|0)+' KB');}
 await b.close();})();
