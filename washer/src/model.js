/* Procedural models. Units are inches. Layout follows the manuals' assembly drawings and printed dimensions;
   this is schematic geometry, not manufacturer CAD. */
if(THREE.ColorManagement)THREE.ColorManagement.legacyMode=false;
const Mats=(()=>{
 const std=(c,m=.2,r=.6,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,metalness:m,roughness:r},o));
 return {
  frame:std(0x2c3238,.35,.5), panel:std(0x3a4149,.3,.55), cover:std(0x8d2f24,.25,.42), wrap:std(0xa8aeb2,.75,.38),
  steel:std(0x9aa3a9,.85,.32), dark:std(0x42484e,.6,.5), black:std(0x17191b,.2,.62), rubber:std(0x101112,.0,.85),
  brass:std(0xc49a3d,.9,.3), copper:std(0xc0703d,.9,.32), alum:std(0xaeb6ba,.7,.45), engine:std(0x25282b,.3,.5),
  red:std(0xb4231c,.2,.42), tank:std(0x4c5560,.2,.45), fuelTank:std(0x6f4d24,.25,.45), gasTank:std(0x7c2019,.25,.45), amber:std(0xd99a2b,.1,.25,{transparent:true,opacity:.62}),
  ceramic:std(0xe8e4d8,0,.7), water:std(0x1d7fa6,.1,.5), fuelHose:std(0x9a6412,.1,.6), hose:std(0x20262b,.05,.7),
  blue:std(0x1f5f9a,.3,.5), yellow:std(0xd8a80f,.2,.5), glass:std(0xaad0dc,.1,.1,{transparent:true,opacity:.42}), white:std(0xdcdfe0,.1,.6),
  flame:new THREE.MeshBasicMaterial({color:0xffa23c,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}),
  spark:new THREE.MeshBasicMaterial({color:0xbfe6ff,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false})
 };
})();
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
function cyl(r,h,mat,axis='y',seg=32,r2){const g=new THREE.CylinderGeometry(r2===undefined?r:r2,r,h,seg);if(axis==='x')g.rotateZ(-Math.PI/2);if(axis==='z')g.rotateX(Math.PI/2);return new THREE.Mesh(g,mat);}
function rbox(w,h,d,mat,r=.25){const s=new THREE.Shape(),x=-w/2+r,y=-h/2+r,W=w-2*r,H=h-2*r;s.moveTo(x,y-r);s.lineTo(x+W,y-r);s.quadraticCurveTo(x+W+r,y-r,x+W+r,y);s.lineTo(x+W+r,y+H);s.quadraticCurveTo(x+W+r,y+H+r,x+W,y+H+r);s.lineTo(x,y+H+r);s.quadraticCurveTo(x-r,y+H+r,x-r,y+H);s.lineTo(x-r,y);s.quadraticCurveTo(x-r,y-r,x,y-r);
 const b=Math.min(r*.5,.15),g=new THREE.ExtrudeGeometry(s,{depth:Math.max(d-2*b,.01),bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:2,curveSegments:5});g.translate(0,0,-(d-2*b)/2);return new THREE.Mesh(g,mat);}
function tube(pts,r,mat,tension=.5,closed=false,seg){const c=new THREE.CatmullRomCurve3(pts.map(p=>p.isVector3?p:V(...p)),closed,'catmullrom',tension);return new THREE.Mesh(new THREE.TubeGeometry(c,seg||Math.max(20,pts.length*12),r,10,closed),mat);}
function lathe(prof,mat,axis='y',seg=40){const g=new THREE.LatheGeometry(prof.map(p=>new THREE.Vector2(p[0],p[1])),seg);if(axis==='x')g.rotateZ(-Math.PI/2);if(axis==='z')g.rotateX(Math.PI/2);return new THREE.Mesh(g,mat);}
function hex(r,h,mat,axis='y'){return cyl(r,h,mat,axis,6);}
function at(m,x=0,y=0,z=0){m.position.set(x,y,z);return m;}

class SceneBuilder{
 constructor(){this.root=new THREE.Group();this.nodes={};this.links=[];this.flows=[];this.tick=[];this.fx=[];}
 node(id,label,home,off,children=[]){const g=new THREE.Group();g.name=id;g.position.set(...home);const n={id,label,group:g,home:V(...home),off:V(...(off||[0,0,0])),subs:[],anchor:V(0,0,0)};children.forEach(c=>c&&g.add(c));this.root.add(g);this.nodes[id]=n;return n;}
 sub(n,obj,off){const h=obj.position.clone();n.group.add(obj);n.subs.push({obj,home:h,off:V(...off)});return obj;}
 /* points: [nodeId|null,x,y,z] local to node */
 link(id,node,sys,r,mat,pts,opts={}){this.links.push(Object.assign({id,node,sys,r,mat,pts},opts));}
 flow(sys,pts,opts={}){this.flows.push(Object.assign({sys,pts,color:null},opts));}
}

/* ---------- whole machine ---------- */
function buildMachine(cfg){
 const b=new SceneBuilder(),{L,W,H}=cfg, hx=L/2-1.5, hz=W/2-.5, top=cfg.frameTop;
 // frame
 const f=[];const hoop=(a)=>{const r=4,loop=cfg.hoop==='end'?[[a,3,-hz+r],[a,3,hz-r],[a,3+r*.3,hz],[a,top-r*.3,hz],[a,top,hz-r],[a,top,-hz+r],[a,top-r*.3,-hz],[a,3+r*.3,-hz]]:null;return loop&&tube(loop,.75,Mats.frame,.5,true,80);};
 if(cfg.hoop==='end'){f.push(hoop(-hx),hoop(hx));[[3,hz-.6],[3,-hz+.6],[top,hz-.6],[top,-hz+.6]].forEach(([y,z])=>f.push(at(cyl(.75,2*hx,Mats.frame,'x'),0,y,z)));}
 else{[-hz,hz].forEach(z=>{const r=6,l=[[-hx+r,3,z],[hx-r,3,z],[hx,3+r,z],[hx,top-r,z],[hx-r,top,z],[-hx+r,top,z],[-hx,top-r,z],[-hx,3+r,z]];f.push(tube(l,.75,Mats.frame,.5,true,90));});
  [[-hx,3],[hx,3],[-hx+3,top],[hx-3,top]].forEach(([x,y])=>f.push(at(cyl(.75,2*hz,Mats.frame,'z'),x,y,0)));}
 f.push(at(rbox(2*hx-1,.35,2*hz-1,Mats.panel,.1),0,3.6,0));
 f[f.length-1].rotation.set(0,0,0);
 b.node('frame','Frame',[0,0,0],[0,0,0],f);
 const ex=cfg.engineX, ez=cfg.engineZ;
 // mount
 b.node('mount','Motor mount',[ex,4.2,ez],[0,-3.5,0],[rbox(19,.5,cfg.engineD+3,Mats.dark,.1)].concat([-7,7].flatMap(x=>[-5,5].map(z=>at(cyl(.8,1,Mats.rubber),x,.7,z)))));
 // engine
 const ew=cfg.engineW,eh=cfg.engineH,ed=cfg.engineD,ec=[];
 ec.push(at(rbox(ew,eh*.6,ed,Mats.engine,.8),0,eh*.32,0));
 ec.push(at(rbox(ew*.85,eh*.3,ed*.8,Mats.black,1),0,eh*.78,-1));
 const shroud=cyl(ew*.36,1.5,Mats.dark,'z',48);ec.push(at(shroud,0,eh*.42,ed/2+.5));
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r1=ew*.09,r2=ew*.33,g=rbox(.28,r2-r1,.2,Mats.steel,.05);g.position.set(Math.cos(a)*(r1+r2)/2,eh*.42+Math.sin(a)*(r1+r2)/2,ed/2+1.3);g.rotation.z=a-Math.PI/2;ec.push(g);}
 ec.push(at(rbox(ew*.5,eh*.14,ed*.3,Mats.black,.4),-ew*.18,eh*.98,-ed*.15));
 const cap=cyl(1,.7,Mats.red);ec.push(at(cap,ew*.25,eh*.95,ed*.1));
 [-1,1].forEach(s=>ec.push(at(rbox(1.4,eh*.42,ed*.68,Mats.alum,.3),s*(ew/2+.5),eh*.5,0)));
 const shaftE=at(cyl(.56,ed*.5,Mats.steel,'z'),0,eh*.42,-ed/2-1.5);ec.push(shaftE);
 const eng=b.node('engine',cfg.engineLabel,[ex,5,ez],[0,0,0],ec);
 const fan=new THREE.Group();ec.slice(1).filter(m=>m.geometry&&m.position.z===ed/2+1.3).forEach(m=>{fan.add(m);});fan.position.set(0,eh*.42,0);fan.children.forEach(m=>{m.position.y-=eh*.42;});eng.group.add(fan);
 b.tick.push((dt,s)=>{fan.rotation.z-=s.rate*dt*3.6;});
 // muffler
 b.node('muffler','Muffler',[ex-ew/2-1.2,12,ez+1],[-7,0,0],[cyl(1.8,7,Mats.steel,'z'),at(cyl(.6,3,Mats.dark,'x'),-2.4,0,3)]);
 // pulleys + belt
 const py=5+eh*.42, zb=cfg.beltZ, r1=cfg.r1, r2=cfg.r2, px=cfg.pumpX, pcy=cfg.pumpY;
 const pulley=(r,mat)=>{const g=new THREE.Group();[-.45,.45].forEach(z=>g.add(at(lathe([[.1,-.42],[r,-.42],[r*.92,-.0],[r,.42],[.1,.42]],mat,'z'),0,0,z)));g.add(cyl(.9,2,Mats.dark,'z',24));if(r>3)for(let i=0;i<5;i++){const a=i*Math.PI*2/5,sp=rbox(.8,r*.8,.4,mat,.1);sp.position.set(Math.cos(a)*r*.5,Math.sin(a)*r*.5,0);sp.rotation.z=a-Math.PI/2;g.add(sp);}return g;};
 const pe=pulley(r1,Mats.dark),pp=pulley(r2,Mats.dark);
 b.node('engPulley','Engine pulley',[ex,py,zb],[0,0,-9],[pe]);
 b.node('pumpPulley','Pump pulley',[px,pcy,zb],[0,0,-9],[pp]);
 b.tick.push((dt,s)=>{const w=s.rate*dt*3.6;pe.rotation.z-=w;pp.rotation.z-=w*r1/r2;});
 const beltPts=beltPath(V(0,0,0),r1+.05,V(px-ex,pcy-py,0),r2+.05);
 const beltG=new THREE.Group();const lugs=[];
 [-.45,.45].forEach(z=>{const c=new THREE.CatmullRomCurve3(beltPts.map(p=>V(p.x,p.y,z)),true,'catmullrom',.05);const m=new THREE.Mesh(new THREE.TubeGeometry(c,160,.22,6,true),Mats.rubber);beltG.add(m);
  const n=38,im=new THREE.InstancedMesh(new THREE.BoxGeometry(.3,.5,.55),Mats.steel,n);im.userData.noExport=true;im.userData.curve=c;beltG.add(im);lugs.push(im);});
 b.node('belt','Pump belt'+(cfg.beltCount>1?'s':''),[ex,py,zb],[0,0,-15],[beltG]);
 let lt=0;const dm=new THREE.Object3D();const setLugs=()=>{lugs.forEach(im=>{const n=im.count;for(let i=0;i<n;i++){const u=(i/n+lt)%1,p=im.userData.curve.getPointAt(u);dm.position.copy(p);const tg=im.userData.curve.getTangentAt(u);dm.rotation.z=Math.atan2(tg.y,tg.x);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);}im.instanceMatrix.needsUpdate=true;});};setLugs();
 b.tick.push((dt,s)=>{if(!s.rate)return;lt=(lt+s.rate*dt*.11)%1;setLugs();});
 // shield
 const midx=(ex+px)/2, sw=px-ex+r2+r1+3.5;
 b.node('shield','Pulley shield',[midx,pcy+.8,zb-1.7],[0,3,-19],[rbox(sw,r2*2+4,.25,Mats.cover,.6)].concat(Array.from({length:9},(_,i)=>at(rbox(.5,5,.3,Mats.black,.1),-sw/3+i*sw/12,r2*.8,-.05))));
 // pump, compact
 const pg=[];pg.push(rbox(6.2,5.8,cfg.pumpLen,Mats.alum,.8));
 for(let i=-2;i<=2;i++)pg.push(at(rbox(5.8,.25,cfg.pumpLen-.4,Mats.steel,.05),0,3+.0,i*1.1));
 pg.push(at(rbox(4.2,6.2,cfg.pumpLen+.6,Mats.brass,.4),5.2,.2,0));
 [-2.6,0,2.6].forEach(z=>[-1.6,1.6].forEach(y=>pg.push(at(hex(.82,.8,Mats.brass,'x'),7.5,y+.2,z*(cfg.pumpLen/8)))));
 pg.push(at(cyl(.47,cfg.pumpLen/2+3,Mats.steel,'z'),0,0,-cfg.pumpLen/2-1));
 pg.push(at(cyl(.45,1.8,Mats.yellow),-1,3.8,0));
 pg.push(at(rbox(9,.4,cfg.pumpLen+1,Mats.dark,.1),1,-3.2,0));
 const zp=cfg.pumpZ;
 b.node('pump',cfg.pumpLabel,[px,pcy,zp],[6,-1,6],pg);
 const plum=[at(rbox(1.6,1.6,2,Mats.brass,.2),0,0,0),at(hex(.7,1.7,Mats.brass,'x'),1.4,0,0),at(hex(.6,1.5,Mats.brass),0,1.4,0),at(cyl(.3,1.7,Mats.red,'z'),0,0,1.5)];
 b.node('plumb','Pump plumbing',[px+9.2,pcy-1.4,zp+.5],[9,0,8],plum);
 // unloader etc
 const [ux,uy,uz]=cfg.unloader;
 b.node('unloader','Unloader',[ux,uy,uz],[7,5,12],[cyl(1,5,Mats.brass),at(cyl(.75,3.2,Mats.steel),0,4,0),at(cyl(.7,1.2,Mats.brass,'x'),1.2,-.5,0),at(rbox(.3,6,3,Mats.dark,.1),-1.4,-1.5,0)]);
 b.node('accumulator','Accumulator',[ux-.2,uy+4,uz+4.2],[6,14,14],[lathe([[0,-1.8],[1.8,-1.2],[2,0],[1.8,1.2],[0,1.8]],Mats.dark),at(cyl(.5,1.5,Mats.brass),0,-2.4,0)]);
 b.node('relief','Relief valve',[ux-.2,uy-3.5,uz+4],[10,-3,15],[cyl(.7,2.4,Mats.steel),at(hex(.8,.8,Mats.brass),0,-1.3,0),at(cyl(.3,1.5,Mats.brass,'x'),.9,0,0)]);
 // coil
 const cx=cfg.coilX,cy=cfg.coilY,cr=cfg.coilOD/2,cl=cfg.coilLen;
 b.node('coil','Coil wrapper',[cx,cy,0],[0,cfg.coilLift,0],[(()=>{const m=cyl(cr,cl,Mats.wrap,'x',64);return m;})(),at(cyl(cr+.2,.6,Mats.dark,'x',64),-cl/2,0,0),at(cyl(cr+.2,.6,Mats.dark,'x',64),cl/2,0,0)].concat([-.25,.25].map(t=>at(cyl(cr+.05,.3,Mats.dark,'x',64),cl*t,0,0))));
 const helix=[];const turns=cfg.coilTurns,hr=cr-1.3;for(let i=0;i<=turns*14;i++){const a=i/14*Math.PI*2,t=i/(turns*14);helix.push(V(-cl/2+1+t*(cl-2),Math.cos(a)*hr,Math.sin(a)*hr));}
 const hc=new THREE.CatmullRomCurve3(helix);const hg=new THREE.TubeGeometry(hc,turns*30,cfg.coilTube,8);
 const cols=[];const pos=hg.attributes.position,col=new THREE.Color(),cA=new THREE.Color(0x3d8fb0),cB=new THREE.Color(0xd2502a);for(let i=0;i<pos.count;i++){col.lerpColors(cB,cA,THREE.MathUtils.clamp((pos.getX(i)+cl/2)/cl,0,1));cols.push(col.r,col.g,col.b);}
 hg.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
 b.node('coilTube','Heating coil',[cx,cy,0],[0,cfg.coilLift*.22,0],[new THREE.Mesh(hg,new THREE.MeshStandardMaterial({vertexColors:true,metalness:.55,roughness:.45}))]);
 const hel=(u)=>{const i=Math.round(u*(helix.length-1));return helix[i];};
 // exhaust head + cover
 b.node('exhaust','Exhaust head',[cx+cl/2+.6,cy,0],[11,cfg.coilLift*.2,0],[cyl(cr+.1,.8,Mats.dark,'x',64),at(cyl(cr*.45,2.5,Mats.steel,'x',40),1.2,0,0),at(cyl(2.4,.7,Mats.steel,'x',6),-.6,0,0)]);
 const hood=new THREE.Mesh(new THREE.CylinderGeometry(cr+1.1,cr+1.1,cl+4,48,1,false,-Math.PI/2,Math.PI),Mats.cover);hood.geometry.rotateZ(Math.PI/2);
 hood.material=Mats.cover.clone();hood.material.side=THREE.DoubleSide;hood.rotation.x=0;
 b.node('cover','Burner cover',[cx,cy+.6,0],[0,cfg.coverLift,0],[hood]);
 // burner
 const bx=cx-cl/2-cfg.burnerGap;
 const burner=[at(cyl(cr*.75,.6,Mats.dark,'x',48),bx<0?2:-2,0,0),at(cyl(2.6,2.2,Mats.steel,'x',32),1,0,0),rbox(4,5,4.6,Mats.dark,.8),at(cyl(1.7,4,Mats.black,'z',28),0,.3,3.8),at(rbox(2.6,2.8,2.4,Mats.steel,.3),0,.3,-3.4),at(rbox(3.3,1.7,3.5,Mats.black,.2),-.1,3.3,0)];
 b.node('burner','Oil burner',[bx,cy,0],[-13,4,3],burner);
 // tanks
 const tf=cfg.fuelBox, tg=cfg.gasBox;
 b.node('fuelTank','Burner fuel tank',tf.p,tf.off,[rbox(...tf.s,Mats.fuelTank,.8),at(cyl(1.25,.9,Mats.black),tf.s[0]*.2,tf.s[1]/2+.3,0)]);
 b.node('gasTank','Gasoline tank',tg.p,tg.off,[rbox(...tg.s,Mats.gasTank,.8),at(cyl(1,.9,Mats.black),tg.s[0]*.2,tg.s[1]/2+.3,0)]);
 const fl=cfg.filter;
 const filt=[at(cyl(1.6,1.1,Mats.alum),0,1.2,0),cyl(1.45,2.6,Mats.amber),at(cyl(.85,2.3,Mats.white),0,0,0),at(cyl(.55,.6,Mats.black),0,-1.6,0)];
 b.node('filter','Fuel filter',fl,[-3,9,8],filt);
 // panel, jbox
 const pc=cfg.panel;
 const panelKids=[rbox(pc.w,pc.h,.3,Mats.panel,.15),at(rbox(1,1.5,.4,Mats.black,.1),pc.w*.22,0,.25),at(rbox(2.6,1.4,.4,Mats.black,.1),-pc.w*.15,0,.25),at(rbox(2.1,.9,.1,Mats.glass,.05),-pc.w*.15,0,.5),at(cyl(.75,.8,Mats.black,'z',24),pc.w*.36,0,.5)];
 b.node('panel','Control panel',pc.p,[0,3,12],panelKids);
 b.node('jbox','Junction box',cfg.jbox,[-3,6,11],[rbox(4.6,3.2,2.8,Mats.dark,.2),at(rbox(1,.5,.5,Mats.black,.1),0,1.8,0),at(cyl(.5,.8,Mats.steel,'z'),1.2,0,1.6)]);
 // side panel
 const sp=cfg.side;
 b.node('sidePanel',sp.label,sp.p,sp.off,[(()=>{const m=rbox(sp.s[0],sp.s[1],.2,Mats.panel,.3);return m;})()].concat(Array.from({length:7},(_,i)=>at(rbox(sp.s[0]*.6,.25,.26,Mats.black,.05),0,sp.s[1]/2-1.2-i*.7,0))));
 // float tank
 if(cfg.float){const ft=cfg.float;const shell=rbox(...ft.s,Mats.tank,.3);shell.material=Mats.tank.clone();shell.material.transparent=true;shell.material.opacity=.55;
  const ball=lathe(Array.from({length:13},(_,i)=>{const a=-Math.PI/2+i/12*Math.PI;return[Math.cos(a)*1.9,Math.sin(a)*1.9];}),Mats.red);
  const ballG=new THREE.Group();ballG.add(at(ball,0,0,-1));const arm=at(cyl(.1,4,Mats.steel,'x'),-1,-.0,-1);ballG.add(arm);ballG.position.set(0,1,0);
  const n=b.node('floatTank','Float tank',ft.p,[8,14,-7],[shell,ballG,at(hex(.6,1.4,Mats.brass,'z'),ft.s[0]*.3,ft.s[1]/2-1.2,ft.s[2]/2+.6)]);
  b.tick.push((dt,s)=>{ballG.position.y=1+.25*Math.sin(s.t*1.1)*(s.rate?1:0);});
  b.node('floatCover','Float tank cover',[ft.p[0],ft.p[1]+ft.s[1]/2+.3,ft.p[2]],[8,20,-7],[rbox(ft.s[0]+.8,.5,ft.s[2]+.8,Mats.panel,.15)]);}
 // hose + gun, resting at floor
 const fz=W/2+8.5,hosex=cfg.hosex;
 const hr2=[];for(let i=0;i<5;i++)for(let j=0;j<2;j++)hr2.push(at((()=>{const m=new THREE.Mesh(new THREE.TorusGeometry(6.5-j*.7,.28,10,64),Mats.hose);m.rotation.x=Math.PI/2;return m;})(),0,.3+i*.56,0));
 b.node('hose','Hose, '+cfg.hoseLabel,[hosex,0,fz+1],[6,0,10],hr2);
 b.node('gunMachine','Gun and wand, 42 in',[hosex-22,1.6,fz+1],[-3,0,12],[at(cyl(.28,42,Mats.steel,'x'),21,1.2,0),at(rbox(1.6,4.8,1.2,Mats.black,.3),-1.2,-.4,0),at(cyl(.5,3,Mats.brass,'x'),0,1.2,0),at(hex(.42,.8,Mats.yellow,'x'),42.3,1.2,0)]);
 const chemN=[...Array(3)].map((_,i)=>at((()=>{const m=new THREE.Mesh(new THREE.TorusGeometry(3,.1,6,40),Mats.glass);m.rotation.x=Math.PI/2;return m;})(),0,.2+i*.22,0));chemN.push(at(cyl(.5,1.4,Mats.black),3,.8,0));
 b.node('chem',cfg.chemLabel,[hosex+14,0,fz+1],[6,0,10],chemN);
 // hoses as links (rebuilt on explode so they stay connected)
 const P=(n,x,y,z)=>[n,x,y,z];
 const inP=P('pump',4,-1.6,zp>0?0:0);
 const coilIn=[...hel(0)],coilOut=[...hel(1)];
 const outHead=P('pump',8,1.8,0);
 b.link('water-in','hoses','water',.5,Mats.water,cfg.waterIn(P));
 b.link('hp1','hoses','water',.3,Mats.hose,[P('plumb',2.2,0,0),P('plumb',4,.5,3),P('unloader',0,-2.5,0)]);
 b.link('hpcoil','hoses','heat',.33,Mats.hose,[P('unloader',1.8,-.5,0),[null,ux+2.6,uy+3,uz-1],P('coilTube',coilIn[0],coilIn[1],coilIn[2])]);
 b.link('pl2','hoses','water',.3,Mats.brass,[outHead,P('plumb',0,1.2,0)]);
 b.link('outhose','hoses','heat',.33,Mats.hose,[P('coilTube',coilOut[0],coilOut[1],coilOut[2]),[null,cx-cl/2-2,cy-cr-2.5,W/2-5],P('panel',-pc.w*.42,-pc.h*.8,.3),P('hose',0,3,6.5)]);
 b.link('bypass','hoses','water',.28,Mats.water,cfg.bypass(P));
 b.link('fuel1','hoses','fuel',.2,Mats.fuelHose,[P('fuelTank',-tf.s[0]*.3,tf.s[1]/2,tf.s[2]*.25),P('filter',-1.5,1.2,0)]);
 b.link('fuel2','hoses','fuel',.2,Mats.fuelHose,[P('filter',1.5,1.2,0),[null,bx-2,cy-7,2],P('burner',0,.3,-4.6)]);
 b.link('gas','hoses','drive',.2,Mats.fuelHose,[P('gasTank',tg.s[0]*.3,tg.s[1]/2,-tg.s[2]*.2),[null,ex-ew/2-2,8,ez-2],P('engine',-ew/2+1,eh*.7,-ed/2+1)]);
 b.link('wire','hoses','elec',.1,Mats.yellow,[P('jbox',1,-1.5,0),P('panel',-pc.w*.3,-pc.h/2,.1)]);
 b.link('wire2','hoses','elec',.1,Mats.red,[P('jbox',-2,0,0),[null,bx+2,cy-7,5],P('burner',-.1,4,0)]);
 b.node('hoses','Hoses and fittings',[0,0,0],[0,0,0],[]);
 b.camera={p:cfg.cam,t:[0,17,0],explode:.6};
 // fx
 const flame=at(new THREE.Mesh(new THREE.ConeGeometry(cr*.55,cl*.45,24,1,true).rotateZ(-Math.PI/2),Mats.flame.clone()),-cl/2+cl*.22,0,0);flame.userData.noExport=true;flame.userData.noPick=true;
 b.nodes.coilTube.group.add(flame);
 const glow=new THREE.PointLight(0xff8a3c,0,50,1.6);glow.userData.noExport=true;b.nodes.coilTube.group.add(glow);
 b.tick.push((dt,s)=>{const on=s.burner&&s.rate>0;flame.visible=on;glow.intensity=on?1.4+.3*Math.sin(s.t*23):0;flame.scale.x=1+.08*Math.sin(s.t*31);});
 // shake
 const eg=b.nodes.engine.group;b.tick.push((dt,s)=>{if(s.rate)eg.position.x+=Math.sin(s.t*60)*.008;});
 return b;
}
function beltPath(c1,r1,c2,r2){ // external tangents, sampled closed loop
 const d=c2.clone().sub(c1),D=d.length(),base=Math.atan2(d.y,d.x),a=Math.acos((r1-r2)/D),pts=[];
 const arc=(c,r,a0,a1,n)=>{for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n;pts.push(V(c.x+Math.cos(t)*r,c.y+Math.sin(t)*r,0));}};
 arc(c2,r2,base+a-Math.PI*2+0,base-a,18);arc(c1,r1,base-a,base+a-Math.PI*2+ -0,0);
 pts.length=0;
 arc(c1,r1,base+a,base+Math.PI*2-a,12);arc(c2,r2,base-a,base+a,20);
 return pts;
}
const MACHINE_CFG={
 '5355J':{L:48,W:34,H:38.5,hoop:'end',frameTop:25.5,engineX:-1,engineZ:0,engineW:16,engineH:16.5,engineD:14,engineLabel:'Engine, Honda GX630',beltZ:-11.6,r1:2.35,r2:5.9,pumpX:13,pumpY:8.8,pumpZ:-3.4,pumpLen:8,pumpLabel:'Pump, N07-00224',beltCount:2,
  unloader:[20.6,13,8.2],coilX:0,coilY:31.4,coilOD:14,coilLen:31,coilLift:13,coverLift:25,burnerGap:2.8,coilTurns:15,coilTube:.42,
  fuelBox:{p:[-16.5,11.6,8.2],s:[11,14.4,13],off:[-13,0,10]},gasBox:{p:[-16.5,10.6,-7.8],s:[11,12.6,12],off:[-13,0,-10]},filter:[-8.2,16,14],
  panel:{p:[7,23,16.6],w:17,h:4.4},jbox:[-8,23,14.2],side:{label:'Side panel',p:[-15,12.5,16.6],s:[15,17,.2],off:[-7,0,15]},float:{p:[19,20,-10],s:[8.5,11,11]},
  hosex:-4,hoseLabel:'3/8 in x 100 ft',chemLabel:'Chemical line',cam:[58,44,86],
  waterIn:P=>[P('floatTank',-1,-5.5,5.5),[null,17,6,-1],P('plumb',-.3,-.8,0)],
  bypass:P=>[P('unloader',.8,-2,1),[null,24,12,0],P('floatTank',3,-1,5.6)]},
 '8405HNL':{L:47.5,W:22.3,H:42.75,hoop:'side',frameTop:27,engineX:-1,engineZ:.5,engineW:18,engineH:18,engineD:14.5,engineLabel:'Engine, Honda GX800',beltZ:-8.6,r1:2.6,r2:6.4,pumpX:13.5,pumpY:9.6,pumpZ:-1.4,pumpLen:8.2,pumpLabel:'Pump, N07-00092',beltCount:2,
  unloader:[20.2,13,6.6],coilX:0,coilY:33.2,coilOD:18,coilLen:34,coilLift:13,coverLift:24,burnerGap:2.6,coilTurns:18,coilTube:.58,
  fuelBox:{p:[-17,11.6,5.2],s:[9.5,14.4,10],off:[-13,0,10]},gasBox:{p:[-17,11.6,-5.2],s:[9.5,14.4,10],off:[-13,0,-10]},filter:[-11,21.6,8],
  panel:{p:[0,24.8,11.4],w:30,h:3.8},jbox:[-13,23.5,9],side:{label:'Backing panel',p:[0,15,-11.2],s:[34,22,.2],off:[0,0,-22]},
  hosex:-4,hoseLabel:'1/2 in x 50 ft',chemLabel:'Chemical injector',cam:[58,46,84],
  waterIn:P=>[[null,23.6,9,2],[null,22,8,2],P('plumb',-.3,-.8,0)],
  bypass:P=>[P('unloader',.8,-2,1),[null,23,7.5,2],P('plumb',-.3,-.9,.7)]}
};

/* ---------- pump ---------- */
function buildPump(cfg){
 const b=new SceneBuilder(),T=cfg.trip?1:1,len=8.2,zs=[-2.5,0,2.5];
 const crX=0,crR=cfg.stroke; // visual crank radius
 const cc=[];const cs=rbox(6.8,6.2,len,Mats.alum,.9);cs.material=Mats.alum.clone();cs.material.transparent=true;cs.material.opacity=.42;cs.material.depthWrite=false;cc.push(cs);
 for(let i=-3;i<=3;i++)cc.push(at(rbox(.5,.3,len-.6,Mats.alum,.05),i*.85,3.2,0));
 b.node('crankcase','Crankcase',[0,0,0],[0,0,0],cc);
 const crank=new THREE.Group();crank.add(cyl(.47,len+6.4,Mats.steel,'z'));crank.children[0].position.z=-1.4;
 const throws=zs.map((z,i)=>{const a=i*2*Math.PI/3;const g=new THREE.Group();g.add(at(cyl(.62,1.1,Mats.steel,'z',22),Math.cos(a)*crR,Math.sin(a)*crR,z));crank.add(g);[-.65,.65].forEach(d=>{crank.add(at(cyl(1.0,.3,Mats.steel,'z',28),0,0,z+d));});return a;});
 const key=at(rbox(.25,.25,1.6,Mats.dark,.03),0,.47,-len/2-4);crank.add(key);
 b.node('crank','Crankshaft',[crX,0,0],[0,0,-15],[crank]);
 const rodG=new THREE.Group(),rods=[];const rodL=3.1;
 const plGroup=new THREE.Group(),plungers=[];
 zs.forEach(z=>{const big=at(new THREE.Mesh(new THREE.TorusGeometry(.78,.2,10,28),Mats.dark),0,0,z);const beam=at(rbox(rodL,.5,.42,Mats.dark,.08),rodL/2,0,0);const r=new THREE.Group();r.add(beam);big.position.set(0,0,0);r.add(big);r.position.z=z;rodG.add(r);
  const ch=at(cyl(.72,1.6,Mats.steel,'x',24),0,0,z);rodG.add(ch);rods.push({r,ch,z});
  const pl=new THREE.Group();pl.position.z=z;pl.add(at(cyl(.39,cfg.plungerLen,Mats.ceramic,'x',24),cfg.plungerLen/2,0,0));pl.add(at(cyl(.56,.1,Mats.copper,'x',24),-.02,0,0));pl.add(at(hex(.3,.5,Mats.steel,'x'),cfg.plungerLen+.25,0,0));plGroup.add(pl);plungers.push(pl);});
 b.node('rods',cfg.rodLabel,[crX,0,0],[0,10,0],[rodG]);
 b.node('plungers','Plungers',[crX,0,0],[5,0,0],[plGroup]);
 // oil seals & bushing
 b.node('oilSeals','Oil seals and bushings',[3.5,0,0],[6.5,-5.5,0],zs.flatMap(z=>[at(new THREE.Mesh(new THREE.TorusGeometry(.5,.14,10,28).rotateY(Math.PI/2),Mats.rubber),0,0,z),at(cyl(.62,.5,Mats.brass,'x',24),-.4,0,z)]));
 // packings stack
 const pk=[];zs.forEach(z=>{[[0,Mats.brass,.68,.42],[.45,Mats.black,.62,.28],[.8,Mats.brass,.68,.35],[1.2,Mats.rubber,.62,.3],[1.55,Mats.steel,.6,.14],[1.75,Mats.brass,.66,.32]].forEach(([x,m,r,h])=>pk.push(at(new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24).rotateZ(Math.PI/2),m),x,0,z)));});
 b.node('packings','Packing stacks',[5,0,0],[11,0,0],pk);
 // head
 const h=[];const headM=Mats.brass.clone();headM.transparent=true;headM.opacity=.62;h.push(rbox(cfg.headD,6.1,len+.4,headM,.5));
 b.node('head',cfg.headLabel,[8.8,0,0],[19,0,0],h);
 // valves, 6
 const vn=b.node('valves',cfg.valveLabel,[9.0,0,0],[19,0,0]);const vParts=[];
 const vp=b.node('valvePlugs',cfg.plugLabel,[9.0,0,0],[19,0,0]);
 zs.forEach((z,i)=>[1,-1].forEach(s=>{const v=new THREE.Group();v.add(at(cyl(.62,.28,Mats.steel,'y',20),0,0,0));v.add(at(new THREE.Mesh(new THREE.TorusGeometry(.3,.07,6,14).rotateX(Math.PI/2),Mats.alum),0,.32,0),at(new THREE.Mesh(new THREE.TorusGeometry(.3,.07,6,14).rotateX(Math.PI/2),Mats.alum),0,.52,0));
  const pop=at(cyl(.42,.1,Mats.dark,'y',18),0,.22,0);v.add(pop);v.position.set(0,s*1.9,z);if(s<0)v.rotation.x=Math.PI;b.sub(vn,v,[0,s*7,0]);vParts.push({pop,phase:i*2*Math.PI/3,inlet:s<0});
  const pl=at(hex(.86,.75,Mats.brass),0,s*3.45,z);const ring=at(new THREE.Mesh(new THREE.TorusGeometry(.66,.08,8,24).rotateX(Math.PI/2),Mats.rubber),0,s*3.1,z);const g=new THREE.Group();g.add(pl,ring);b.sub(vp,g,[0,s*12,0]);}));
 // bolts
 const bolts=[];[-3.4,3.4].forEach(y=>[-3.6,-1.2,1.2,3.6].forEach(z=>{bolts.push(at(cyl(.2,cfg.boltLen,Mats.steel,'x',12),10.8-cfg.boltLen/2+2,y*.72,z));bolts.push(at(hex(.42,.4,Mats.dark,'x'),10.8+2.2,y*.72,z));}));
 b.node('bolts',cfg.boltLabel,[0,0,0],[30,0,0],bolts);
 // rear & covers
 b.node('rearCover','Rear cover',[-3.6,0,0],[-9,0,0],[rbox(.5,5.4,len-.8,Mats.alum,.5),at(new THREE.Mesh(new THREE.TorusGeometry(2.1,.08,8,40).rotateY(Math.PI/2),Mats.rubber),.4,0,0)]);
 b.node('sight','Oil sight glass',[-4,-1.5,0],[-16,0,0],[cyl(.75,.4,Mats.glass,'x'),at(new THREE.Mesh(new THREE.TorusGeometry(.75,.11,8,24).rotateY(Math.PI/2),Mats.red),0,0,0)]);
 b.node('dipstick','Dipstick',[-1,3.8,0],[0,7,0],[at(cyl(.5,1,Mats.yellow),0,.6,0),at(cyl(.12,3.2,Mats.steel),0,-1.3,0)]);
 const ret=(sign,lbl)=>[at(cyl(2.2,.5,Mats.alum,'z',36),0,0,0)].concat([0,1,2,3].map(i=>at(hex(.3,.3,Mats.dark,'z'),Math.cos(i*Math.PI/2+.8)*1.75,Math.sin(i*Math.PI/2+.8)*1.75,sign*.35)));
 const rt=b.node('retainer',cfg.retLabel,[0,0,0],[0,0,0]);const rA=new THREE.Group();ret(1).forEach(m=>rA.add(m));rA.position.z=len/2+.25;b.sub(rt,rA,[0,0,9.5]);const rB=new THREE.Group();ret(-1).forEach(m=>rB.add(m));rB.position.z=-len/2-.25;b.sub(rt,rB,[0,0,-7]);
 const bng=b.node('bearing',cfg.bearingLabel,[0,0,0],[0,0,0]);[-1,1].forEach(s=>{const m=new THREE.Group();m.add(new THREE.Mesh(new THREE.TorusGeometry(1.15,.32,12,32),Mats.steel));m.add(new THREE.Mesh(new THREE.TorusGeometry(.72,.14,8,28),Mats.dark));m.position.z=s*(len/2-.4);b.sub(bng,m,[0,0,s*6.5]);});
 b.node('seal','Shaft seal',[0,0,-len/2-.7],[0,0,-11],[new THREE.Mesh(new THREE.TorusGeometry(.72,.17,10,28),Mats.rubber)]);
 b.node('mount',cfg.mountLabel,[0,-3.5,0],[0,-7,0],[rbox(9,.4,len+1.5,Mats.dark,.1)].concat([[-3.3,1],[3.3,1],[-3.3,-1],[3.3,-1]].map(([x,s])=>at(hex(.42,.4,Mats.steel),x,.3,s*3))));
 // flows
 const mk=(x,y,z)=>['head',x,y,z];
 zs.forEach(z=>{b.flow('water',[['head',0,-2.8,z+.1],['head',0,-1.4,z],['head',-1,0,z],['head',0,1.4,z],['head',0,2.8,z]],{n:6});});
 b.flow('water',[['head',0,-2.5,-5],['head',0,-2.5,5]],{n:10});b.flow('water',[['head',0,2.5,-5],['head',0,2.5,5]],{n:10,hot:false});
 // animation
 const pinPos=V();let th=0;
 const pose=()=>{zs.forEach((z,i)=>{const a=th+throws[i],px=Math.cos(a)*crR,py=Math.sin(a)*crR,sx=px+Math.sqrt(rodL*rodL-py*py);
   const R=rods[i];R.r.position.set(px,py,z);R.r.rotation.z=Math.atan2(-py,sx-px);R.ch.position.x=sx+.75;plungers[i].position.x=sx+1.6;});
  vParts.forEach(v=>{const p=Math.sin(th+v.phase);const open=v.inlet?Math.max(0,p):Math.max(0,-p);v.pop.position.y=.22+.28*open;});};
 pose();
 b.tick.push((dt,s)=>{if(!s.rate)return;th-=s.rate*dt*1.6;crank.rotation.z=th;pose();});
 b.camera={p:[20,14,27],t:[6,0,0],explode:.55};
 return b;
}
const PUMP_CFG={
 '5355J':{stroke:.47,plungerLen:6,headD:4.2,boltLen:9,headLabel:'Head, brass',valveLabel:'Valve assemblies',plugLabel:'Valve plugs',boltLabel:'Head cap screws',rodLabel:'Crossheads and rods',retLabel:'Bearing retainers',bearingLabel:'Roller bearings',mountLabel:'Pump mount'},
 '8405HNL':{stroke:.62,plungerLen:6,headD:4.6,boltLen:9.5,headLabel:'Manifold',valveLabel:'Valve assemblies',plugLabel:'Valve caps',boltLabel:'Head bolts, M10 x 90',rodLabel:'Connecting rods, guides',retLabel:'Side covers',bearingLabel:'Bearings',mountLabel:'Pump rails'}
};

/* ---------- burner ---------- */
function buildBurner(cfg){
 const b=new SceneBuilder();
 const hm=Mats.dark.clone();hm.transparent=true;hm.opacity=.34;hm.depthWrite=false;
 b.node('housing','Burner housing',[0,0,0],[0,0,0],[cyl(2.9,3.4,hm,'z',48),at(rbox(5,3.4,3.4,hm,.5),-2.2,1,0)]);
 const motor=new THREE.Group();motor.add(cyl(1.75,4.2,Mats.black,'z',36),at(cyl(1.9,.3,Mats.steel,'z',36),0,0,-2.1));const spin=at(cyl(.16,1.6,Mats.steel,'z',12),0,0,-2.8);motor.add(spin);
 b.node('motor','Motor, 12 VDC',[0,0,4.1],[0,0,8],[motor]);
 const fan=new THREE.Group();fan.add(cyl(2.3,.1,Mats.alum,'z',36));for(let i=0;i<30;i++){const a=i/30*Math.PI*2,m=rbox(.08,.55,2.2,Mats.alum,.02);m.position.set(Math.cos(a)*2.2,Math.sin(a)*2.2,0);m.rotation.z=a+.5;fan.add(m);}
 b.node('fan','Blower fan',[0,0,0],[0,0,3.6],[fan]);
 const coup=at(cyl(.42,1.6,Mats.black,'z',18),0,0,0);
 b.node('coupling','Shaft coupling',[0,0,-1.6],[0,0,-3.6],[coup]);
 const pmp=[rbox(3,3,2.6,Mats.steel,.5),at(cyl(1.2,.6,Mats.alum,'z',28),0,0,-1.5),at(hex(.4,.6,Mats.brass,'y'),0,1.8,0),at(hex(.42,.6,Mats.brass,'x'),1.8,.5,0),at(hex(.42,.6,Mats.brass,'x'),-1.8,-.4,0),at(cyl(.7,1.3,Mats.yellow,'y',20),1.1,-2.1,0)];
 b.node('pump','Fuel pump',[0,.2,-3.9],[0,0,-11],pmp);
 const bs=b.node('bands','Air bands',[0,0,-1.95],[0,0,0]);const bo=new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.8,.8,48,1,true).rotateX(Math.PI/2),(()=>{const m=Mats.steel.clone();m.side=THREE.DoubleSide;return m;})());const bi=new THREE.Mesh(new THREE.CylinderGeometry(2.65,2.65,.8,48,1,true,0,4.2).rotateX(Math.PI/2),(()=>{const m=Mats.alum.clone();m.side=THREE.DoubleSide;return m;})());b.sub(bs,bo,[0,0,-5.5]);b.sub(bs,bi,[0,0,-7.8]);
 const tb=Mats.steel.clone();tb.transparent=true;tb.opacity=.3;tb.depthWrite=false;
 b.node('tube','Air tube and flange',[5.8,0,0],[6,0,0],[cyl(1.9,8,tb,'x',40),at(cyl(3.8,.3,Mats.dark,'x',40),-.2,0,0)]);
 b.node('cone','Air cone',[10.4,0,0],[13,0,0],[new THREE.Mesh(new THREE.CylinderGeometry(1.9,1.1,1.2,32,1,true).rotateZ(-Math.PI/2),(()=>{const m=Mats.steel.clone();m.side=THREE.DoubleSide;return m;})())]);
 // gun
 const gun=[at(cyl(.15,10,Mats.copper,'x',12),0,0,0),at(new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,.1,32).rotateZ(Math.PI/2),Mats.steel),3.8,0,0),at(rbox(.6,.8,.5,Mats.brass,.1),-4.9,0,0)];
 b.node('gun','Burner gun assembly',[4.2,0,0],[-14,4.5,0],gun);
 b.node('nozzle','Nozzle',[9.5,0,0],[9,-2.5,0],[cyl(.32,.75,Mats.brass,'x',6),at(cyl(.18,.25,Mats.steel,'x',16),.45,0,0)]);
 const el=[];[-1,1].forEach(s=>{el.push(at(cyl(.22,5,Mats.ceramic,'x',16),5.6,.55,s*.46));el.push(tube([[8,.55,s*.46],[8.8,.6,s*.4],[9.75,.45,s*.08]],.05,Mats.steel,.3));el.push(at(rbox(5,.09,.25,Mats.copper,.02),2.8,.85,s*.46));});
 const sp=at(cyl(.035,.18,Mats.spark,'z',6),9.75,.45,0);sp.userData.noExport=true;sp.userData.noPick=true;el.push(sp);
 b.node('electrodes','Electrodes and buss bars',[0,0,0],[-2,7,0],el);
 const ign=[rbox(4.4,1.3,3,Mats.black,.25),at(hex(.3,.4,Mats.steel,'y'),1.6,-.8,.5),at(hex(.3,.4,Mats.steel,'y'),1.6,-.8,-.5),at(cyl(.1,.9,Mats.yellow,'x',8),-2.6,0,0)];
 b.node('igniter','Igniter',[2.2,3.3,0],[0,10.5,0],ign);
 b.node('box',cfg.boxLabel,[-2.6,3.5,0],[-8,7,0],[rbox(3.4,1.8,3.2,Mats.dark,.2)]);
 b.node('cad','Cad cell',[-1.2,1.4,1.7],[-2,3,8],[cyl(.42,.9,Mats.black,'z',18),at(cyl(.3,.1,Mats.red,'z',18),0,0,.5)]);
 b.node('rearCover','Rear cover',[-4.85,1,0],[-20,0,0],[rbox(.25,3.2,3.2,Mats.panel,.15)]);
 b.node('oilLine','Oil line',[0,0,0],[0,0,0],[]);
 b.link('oil','oilLine','fuel',.09,Mats.copper,[['pump',0,1.9,0],[null,-1,3,-3.5],[null,-5.7,1.2,0],['gun',-4.9,0,0]]);
 b.flow('fuel',[['pump',0,1.9,0],[null,-1,3,-3.5],[null,-5.7,1.2,0],['gun',-4.9,0,0],['gun',5,0,0]],{n:16});
 // fx spray and flame
 const spray=at(new THREE.Mesh(new THREE.ConeGeometry(.9,1.3,20,1,true).rotateZ(Math.PI/2),Mats.flame.clone()),10.9,0,0);spray.userData.noExport=true;spray.userData.noPick=true;spray.material.color.set(0x8fd2ff);spray.material.opacity=.4;
 const flame=at(new THREE.Mesh(new THREE.ConeGeometry(2,8,24,1,true).rotateZ(-Math.PI/2),Mats.flame.clone()),15.4,0,0);flame.userData.noExport=true;flame.userData.noPick=true;
 b.nodes.nozzle.group.add(at(spray,1.4,0,0));b.root.add(flame);
 b.tick.push((dt,s)=>{const on=s.rate>0;motor.rotation.z+=0;spin.rotation.z-=s.rate*dt*8;fan.rotation.z-=s.rate*dt*8;coup.rotation.z-=s.rate*dt*8;spray.visible=on;const off=s.explode;flame.visible=on&&off<.08;flame.scale.x=1+.08*Math.sin(s.t*35);sp.visible=on&&Math.sin(s.t*70)>-.2;sp.position.x=9.75;});
 b.camera={p:[15,14,26],t:[3,1.5,-.5],explode:.6};
 return b;
}

/* ---------- unloader ---------- */
function buildUnloader(cfg){
 const b=new SceneBuilder();
 const bm=Mats.brass.clone();bm.transparent=true;bm.opacity=.42;bm.depthWrite=false;
 b.node('body',cfg.bodyLabel,[0,0,0],[0,0,0],[cyl(1.2,4.4,bm,'y',36),at(cyl(.75,2.3,bm,'x',28),1.6,-1,0),at(cyl(.75,2.3,bm,'x',28),-1.6,-1,0),at(cyl(.7,1.4,bm,'y',28),0,-2.7,0)]);
 const pist=new THREE.Group();pist.add(at(cyl(.55,1.4,Mats.steel,'y',24),0,.5,0),at(cyl(.18,1.9,Mats.steel,'y',12),0,-.9,0),at(new THREE.Mesh(new THREE.TorusGeometry(.55,.07,8,24).rotateX(Math.PI/2),Mats.rubber),0,.9,0),at(new THREE.Mesh(new THREE.TorusGeometry(.55,.07,8,24).rotateX(Math.PI/2),Mats.rubber),0,.2,0));
 const pn=b.node('piston','Piston and seals',[0,.7,0],[0,12.4,0],[pist]);
 const ball=at(lathe(Array.from({length:11},(_,i)=>{const a=-Math.PI/2+i/10*Math.PI;return[Math.cos(a)*.34,Math.sin(a)*.34];}),Mats.steel),0,0,0);
 const bl=b.node('ball','Ball',[0,-1.6,0],[-8,-1,4],[ball]);
 b.node('seat','Seat and O-ring',[0,-2.2,0],[-8,-6,0],[cyl(.5,.35,Mats.steel,'y',24),at(new THREE.Mesh(new THREE.TorusGeometry(.5,.06,8,24).rotateX(Math.PI/2),Mats.rubber),0,.2,0)]);
 const coils=[];for(let i=0;i<=56;i++){const a=i/8*Math.PI*2;coils.push(V(Math.cos(a)*.75,i/56*3,Math.sin(a)*.75));}
 const spr=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coils),170,.1,6),Mats.blue);
 const sg=new THREE.Group();sg.add(spr);sg.position.y=0;
 b.node('spring','Adjustment spring',[0,2.5,0],[0,6.4,0],[sg]);
 b.node('nuts',cfg.nutLabel,[0,6,0],[0,15,0],[hex(.6,.45,Mats.brass),at(hex(.55,.35,Mats.steel),0,.55,0),at(cyl(.16,3,Mats.steel,'y',12),0,-.7,0)]);
 b.node('inlet','Inlet coupling',[3.3,-1,0],[8,0,0],[hex(.95,.9,Mats.steel,'x'),at(cyl(.55,1.1,Mats.steel,'x',20),-.9,0,0)]);
 b.node('outlet','Outlet fitting',[-3.3,-1,0],[-8,0,0],[hex(.95,.9,Mats.steel,'x'),at(cyl(.45,1.5,Mats.steel,'x',20),-1,0,0)]);
 const chk=at(cyl(.32,.9,Mats.brass,'x',16),0,0,0);
 b.node('check','Check valve and spring',[-1.2,-1,0],[-4,6,5],[chk,at(new THREE.Mesh(new THREE.TorusGeometry(.33,.05,6,20).rotateY(Math.PI/2),Mats.rubber),.3,0,0)]);
 b.flow('water',[[null,5,-1,0],[null,1,-1,0],[null,-1,-1,0],[null,-5,-1,0]],{n:12,only:s=>!s.gunClosed});
 b.flow('bypass',[[null,5,-1,0],[null,1,-1,0],[null,0,-2,0],[null,0,-5,0]],{n:12,only:s=>s.gunClosed,color:0x74c7e6});
 let lift=0;
 b.tick.push((dt,s)=>{const tgt=s.gunClosed?1:0;lift+=(tgt-lift)*Math.min(1,dt*5);pist.position.y=lift*.5;sg.scale.y=1-lift*.16;ball.position.y=-lift*-.0+lift*.22;chk.position.x=s.gunClosed?0:-.2;});
 b.camera={p:[10,6,16],t:[0,1.5,0],explode:.5};b.gunToggle=true;
 return b;
}
const UNL_CFG={'5355J':{bodyLabel:'Housing',nutLabel:'Hex nuts, item 21 and 23'},'8405HNL':{bodyLabel:'Brass body',nutLabel:'Ring nut and regulating knob'}};

/* ---------- trigger gun ---------- */
function buildGun(){
 const b=new SceneBuilder();
 const hm=Mats.black.clone();hm.transparent=true;hm.opacity=.4;hm.depthWrite=false;
 const shape=()=>{const s=new THREE.Shape();s.moveTo(-3,2);s.lineTo(3.5,2);s.lineTo(3.5,.4);s.lineTo(.2,.4);s.quadraticCurveTo(-.4,-3,-.9,-4.3);s.lineTo(-3,-4.3);s.quadraticCurveTo(-2.8,-1,-3,2);const g=new THREE.ExtrudeGeometry(s,{depth:.7,bevelEnabled:true,bevelSize:.1,bevelThickness:.1,bevelSegments:2});return g;};
 const hn=b.node('handle','Handle housing',[0,0,0],[0,0,0]);
 const hA=new THREE.Mesh(shape(),hm);hA.position.z=.0;hA.geometry.translate(0,0,0);hA.position.z=0;const gA=new THREE.Group();gA.add(hA);gA.position.z=.02;b.sub(hn,gA,[0,0,6.5]);
 const hB=new THREE.Mesh(shape(),hm);const gB=new THREE.Group();gB.add(hB);gB.position.z=-.82;b.sub(hn,gB,[0,0,-6.5]);
 b.node('valve','Valve housing',[.3,1.1,0],[0,4.5,0],[(()=>{const m=cyl(.55,4,Mats.brass.clone(),'x',24);m.material.transparent=true;m.material.opacity=.55;m.material.depthWrite=false;return m;})()]);
 b.node('discharge','Discharge fitting',[3.4,1.1,0],[7.5,0,0],[hex(.6,1,Mats.steel,'x'),at(cyl(.4,.8,Mats.steel,'x',16),.8,0,0)]);
 b.node('inlet','Inlet fitting and filter',[-1.8,-4.8,0],[-2,-8,0],[hex(.6,1,Mats.steel),at(cyl(.28,.9,Mats.alum,'y',12),0,1,0),at(new THREE.Mesh(new THREE.TorusGeometry(.4,.06,6,20).rotateX(Math.PI/2),Mats.rubber),0,.6,0)]);
 b.node('seat','Valve seat and washers',[-1,1.1,0],[-4,5,-3],[cyl(.48,.3,Mats.steel,'x',20),at(new THREE.Mesh(new THREE.TorusGeometry(.48,.05,6,20).rotateY(Math.PI/2),Mats.copper),.3,0,0)]);
 const ball=lathe(Array.from({length:11},(_,i)=>{const a=-Math.PI/2+i/10*Math.PI;return[Math.cos(a)*.24,Math.sin(a)*.24];}),Mats.steel);
 b.node('ball','Ball, 5/16 in',[-1.4,1.1,0],[-6,5,1],[ball]);
 const cs=[];for(let i=0;i<=40;i++){const a=i/6*Math.PI*2;cs.push(V(i/40*1.1,Math.cos(a)*.27,Math.sin(a)*.27));}
 const sm=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cs),120,.04,5),Mats.steel);
 b.node('spring','Spring',[-2.6,1.1,0],[-8,4,0],[sm]);
 b.node('retainer','Valve retainer',[-2.8,1.1,0],[-14,1,0],[hex(.56,.5,Mats.steel,'x')]);
 const pin=at(cyl(.08,1.6,Mats.steel,'x',8),0,0,0);
 b.node('pin','Valve pin',[.0,1.1,0],[1,7.5,0],[pin]);
 const cam=at(rbox(.5,.5,.3,Mats.dark,.08),0,0,0);
 b.node('cam','Cam',[.7,.5,0],[3.5,-4,4],[cam]);
 const trigG=new THREE.Group();const ts=new THREE.Shape();ts.moveTo(0,0);ts.lineTo(.5,0);ts.quadraticCurveTo(1.05,-1.8,.65,-3.2);ts.lineTo(.25,-3.2);ts.quadraticCurveTo(.55,-1.6,0,0);const tr=new THREE.Mesh(new THREE.ExtrudeGeometry(ts,{depth:.5,bevelEnabled:false}),Mats.red);tr.position.z=-.25;trigG.add(tr);trigG.add(at(cyl(.1,.9,Mats.steel,'z',10),.1,0,0));
 b.node('trigger','Trigger and pin',[1.1,.6,0],[7,-6,0],[trigG]);
 const lat=at(rbox(.25,1,.4,Mats.yellow,.05),0,0,0);
 b.node('latch','Safety latch',[1.65,-1.4,0],[8.5,-10,2],[lat]);
 const wand=[at(cyl(.22,10,Mats.steel,'x',16),5,0,0),at(hex(.45,.9,Mats.yellow,'x'),10.4,0,0),at(cyl(.32,4,Mats.rubber,'x',14),2.4,0,0)];
 b.node('wand','Wand and spray tip, shown shortened',[4.8,1.1,0],[9,0,0],wand);
 b.flow('water',[['inlet',0,-.5,0],[null,-1.7,-2,0],[null,-1.6,1.1,0],[null,3.4,1.1,0],['wand',10,0,0]],{n:18,only:s=>!s.gunClosed});
 let k=0;
 const spray=at(new THREE.Mesh(new THREE.ConeGeometry(1,3,18,1,true).rotateZ(Math.PI/2),Mats.flame.clone()),12.5,0,0);spray.material.color.set(0x8fd2ff);spray.material.opacity=.3;spray.userData.noExport=true;spray.userData.noPick=true;b.nodes.wand.group.add(spray);
 b.tick.push((dt,s)=>{const tgt=s.gunClosed?0:1;k+=(tgt-k)*Math.min(1,dt*7);trigG.rotation.z=k*.34;pin.position.x=-k*.2;ball.position.x=-k*.3;sm.scale.x=1-k*.2;cam.rotation.z=k*.5;lat.rotation.z=k*.15;spray.visible=k>.5;});
 b.camera={p:[9,6,22],t:[5,-.5,0],explode:.45};b.gunToggle=true;
 return b;
}
const BUILDERS={
 machine:m=>buildMachine(MACHINE_CFG[m]),
 pump:m=>buildPump(PUMP_CFG[m]),
 burner:m=>buildBurner({boxLabel:m==='5355J'?'Control box':'Igniter timer and box'}),
 unloader:m=>buildUnloader(UNL_CFG[m]),
 gun:()=>buildGun()
};
const SCENES=[['machine','Whole machine'],['pump','Water pump'],['burner','Oil burner'],['unloader','Unloader valve'],['gun','Trigger gun']];

class Viewer{
 constructor(host,overlay){
  this.host=host;this.overlay=overlay;this.state={explode:.55,rate:1,burner:true,flow:new Set(['water']),gunClosed:false,t:0,labels:true};
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.outputEncoding=THREE.sRGBEncoding;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.92;
  host.appendChild(this.renderer.domElement);
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(30,1,1,2000);
  const pm=new THREE.PMREMGenerator(this.renderer);this.scene.environment=pm.fromScene(new THREE.RoomEnvironment(),.04).texture;
  const key=new THREE.DirectionalLight(0xfff4e6,1.5);key.position.set(40,80,60);this.scene.add(key);const rim=new THREE.DirectionalLight(0x9fd0ff,.7);rim.position.set(-60,30,-50);this.scene.add(rim);this.scene.add(new THREE.AmbientLight(0xffffff,.16));
  this.controls=new THREE.OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.09;
  this.ray=new THREE.Raycaster();this.ptr=new THREE.Vector2();this.hover=null;this.sel=null;this.onPick=()=>{};this.onHover=()=>{};this.clock=new THREE.Clock();
  this.balloons={};this.svg=overlay.querySelector('svg');
  const el=this.renderer.domElement;let dn=null;
  el.addEventListener('pointerdown',e=>dn=[e.clientX,e.clientY]);
  el.addEventListener('pointerup',e=>{if(dn&&Math.hypot(e.clientX-dn[0],e.clientY-dn[1])<5)this.pick(e);dn=null;});
  el.addEventListener('pointermove',e=>this.moveHover(e));
  new ResizeObserver(()=>this.resize()).observe(host);this.resize();
  this.loop=this.loop.bind(this);requestAnimationFrame(this.loop);
 }
 resize(){const w=this.host.clientWidth||600,h=this.host.clientHeight||400;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.fov=w<h?44:30;this.camera.updateProjectionMatrix();this.w=w;this.h=h;}
 load(machine,sceneId,keepExplode){
  if(this.cur){this.clearFlows();this.scene.remove(this.cur.root);this.cur.root.traverse(o=>{o.geometry&&o.geometry.dispose();});}
  const b=BUILDERS[sceneId](machine);this.cur=b;this.sceneId=sceneId;this.machine=machine;
  this.scene.add(b.root);
  // per-node material copies for highlight; tag meshes
  Object.values(b.nodes).forEach(n=>n.group.traverse(o=>{o.userData.node=n.id;if(o.isMesh&&!o.isInstancedMesh){o.material=o.material.clone();o.material.envMapIntensity=.42;o.userData.baseOpacity=o.material.opacity;o.userData.baseTrans=o.material.transparent;}}));
  // links
  b.links.forEach(l=>{const g=b.nodes[l.node].group;l.mesh=new THREE.Mesh(new THREE.BufferGeometry(),l.mat.clone());l.mesh.material.envMapIntensity=.42;l.mesh.userData.node=l.node;l.mesh.userData.baseOpacity=l.mesh.material.opacity;l.mesh.userData.baseTrans=l.mesh.material.transparent;l.mesh.name=l.id;g.add(l.mesh);});
  // flows
  b.flowObjs=b.flows.map(f=>{const n=f.n||30;const color=f.color||({water:0x35b6e8,fuel:0xf0a51e,bypass:0x74c7e6}[f.sys]||0xffffff);const im=new THREE.InstancedMesh(new THREE.SphereGeometry(.22,8,6),new THREE.MeshBasicMaterial({color,depthTest:false,transparent:true,opacity:.95}),n);im.frustumCulled=false;im.renderOrder=20;im.userData.noExport=true;im.userData.noPick=true;this.scene.add(im);return{f,im,n,u:Math.random()};});
  this.addMachineFlows();
  // dashed explode lines
  b.lines=[];Object.values(b.nodes).forEach(n=>{if(n.off.lengthSq()>0){const g=new THREE.BufferGeometry().setFromPoints([n.home.clone(),n.home.clone()]);const l=new THREE.Line(g,new THREE.LineDashedMaterial({color:0x9fb6bf,dashSize:.5,gapSize:.35,transparent:true,opacity:.7}));l.userData.noPick=true;l.userData.noExport=true;l.frustumCulled=false;b.root.add(l);b.lines.push({l,n});}});
  // anchors
  Object.values(b.nodes).forEach(n=>{const bx=new THREE.Box3();n.group.updateWorldMatrix(true,true);bx.setFromObject(n.group);if(!bx.isEmpty()){const c=bx.getCenter(new THREE.Vector3());n.anchor=c.sub(n.group.position);if(n.id==='frame')n.anchor=V(bx.max.x-1,bx.min.y+3,bx.max.z-1);}});
  const cam=b.camera;
  if(!keepExplode)this.state.explode=cam.explode;
  this.applyExplode();this.fit();this.buildBalloons();this.select(null);this.dim(null);
  return b;
 }
 addMachineFlows(){const b=this.cur;if(this.sceneId!=='machine')return;
  const mk=(id,sys,n)=>{const l=b.links.find(x=>x.id===id);if(!l)return;const color={water:0x35b6e8,heat:0xff6a33,fuel:0xf0a51e,drive:0xd65b4c}[sys]||0x35b6e8;const im=new THREE.InstancedMesh(new THREE.SphereGeometry(.42,8,6),new THREE.MeshBasicMaterial({color,depthTest:false,transparent:true,opacity:.95}),n);im.frustumCulled=false;im.renderOrder=20;im.userData.noPick=true;this.scene.add(im);b.flowObjs.push({f:{sys,pts:l.pts,link:l,only:null},im,n,u:Math.random()});};
  [['water-in','water',10],['hp1','water',5],['pl2','water',3],['hpcoil','water',8],['outhose','heat',14],['fuel1','fuel',5],['fuel2','fuel',12],['gas','drive',8]].forEach(a=>mk(...a));
  const cn=b.nodes.coilTube,cfg=MACHINE_CFG[this.machine],mesh=cn.group.children[0];
  const turns=cfg.coilTurns,hr=cfg.coilOD/2-1.3,cl=cfg.coilLen,pts=[];for(let i=0;i<=turns*8;i++){const a=i/8*Math.PI*2,t=i/(turns*8);pts.push(['coilTube',-cl/2+1+t*(cl-2),Math.cos(a)*hr,Math.sin(a)*hr]);}
  const im=new THREE.InstancedMesh(new THREE.SphereGeometry(.42,8,6),new THREE.MeshBasicMaterial({color:0xffffff,depthTest:false,transparent:true,opacity:.95}),60);im.frustumCulled=false;im.renderOrder=20;im.userData.noPick=true;const c0=new THREE.Color(0x35b6e8),c1=new THREE.Color(0xff6a33),c=new THREE.Color();for(let i=0;i<60;i++){im.setColorAt(i,c0);}this.scene.add(im);b.flowObjs.push({f:{sys:'water',pts,coil:true,c0,c1,c,speed:.06},im,n:60,u:0});
 }
 fit(){const b=this.cur,cam=b.camera,box=new THREE.Box3(),tb=new THREE.Box3(),pts=[];Object.values(b.nodes).forEach(n=>{let any=false;n.group.traverse(o=>{if(o.isMesh&&!o.userData.noPick)any=true;});if(!any)return;n.group.updateWorldMatrix(true,true);n.group.traverse(o=>{if(o.isMesh&&!o.userData.noPick&&o.geometry&&o.geometry.attributes.position&&o.geometry.attributes.position.count){tb.setFromObject(o);if(!tb.isEmpty()){box.union(tb);for(let i=0;i<8;i++)pts.push(V(i&1?tb.max.x:tb.min.x,i&2?tb.max.y:tb.min.y,i&4?tb.max.z:tb.min.z));}}});});
  const c=box.getBoundingSphere(new THREE.Sphere());const dir=V(...cam.p).sub(V(...cam.t)).normalize();const tgt=box.getCenter(new THREE.Vector3());let d=c.radius*4;this.camera.near=1;this.camera.far=d*8;this.camera.updateProjectionMatrix();
  for(let it=0;it<4;it++){this.camera.position.copy(tgt).addScaledVector(dir,d);this.camera.lookAt(tgt);this.camera.updateMatrixWorld(true);let mx=0,my=0;for(const w of pts){const q=w.clone().project(this.camera);mx=Math.max(mx,Math.abs(q.x));my=Math.max(my,Math.abs(q.y));}d*=Math.max(mx/.86,my/.86);}
  const pos=tgt.clone().addScaledVector(dir,d);this.camera.position.copy(pos);this.controls.target.copy(tgt);this.controls.minDistance=d*.12;this.controls.maxDistance=d*3;this.controls.update();this.fit0={p:pos.toArray(),t:tgt.toArray()};
  if(this.grid)this.scene.remove(this.grid);const size=Math.ceil(c.radius*3/10)*10;this.grid=new THREE.GridHelper(size,Math.round(size/(this.sceneId==='machine'?6:2)),0x47606b,0x2d414a);this.grid.position.set(tgt.x,box.min.y-.2,tgt.z);this.grid.material.transparent=true;this.grid.material.opacity=.55;this.scene.add(this.grid);this.camera.near=d/60;this.camera.far=d*8;this.camera.updateProjectionMatrix();}
 resolve(p){const[nid,x,y,z]=p;if(!nid)return V(x,y,z);const n=this.cur.nodes[nid];if(!n)return V(x,y,z);return n.group.position.clone().add(V(x,y,z));}
 applyExplode(){
  const b=this.cur,t=this.state.explode,e=t*t*(3-2*t);
  Object.values(b.nodes).forEach(n=>{n.group.position.copy(n.home).addScaledVector(n.off,e);n.subs.forEach(s=>s.obj.position.copy(s.home).addScaledVector(s.off,e));});
  b.lines.forEach(({l,n})=>{const p=l.geometry.attributes.position;const a=n.home.clone().add(n.anchor),c=n.group.position.clone().add(n.anchor);p.setXYZ(0,a.x,a.y,a.z);p.setXYZ(1,c.x,c.y,c.z);p.needsUpdate=true;l.computeLineDistances();l.visible=e>.04;});
  b.links.forEach(l=>{const pts=l.pts.map(p=>this.resolve(p));const c=new THREE.CatmullRomCurve3(pts,false,'catmullrom',.35);l.mesh.geometry.dispose();l.mesh.geometry=new THREE.TubeGeometry(c,Math.max(18,pts.length*10),l.r,7);l.curve=c;});
  b.flowObjs.forEach(o=>{o.curve=o.f.link?o.f.link.curve:new THREE.CatmullRomCurve3(o.f.pts.map(p=>this.resolve(p)),false,'catmullrom',.3);});
 }
 setExplode(v){this.state.explode=v;this.applyExplode();}
 buildBalloons(){
  this.overlay.querySelectorAll('.bln').forEach(e=>e.remove());this.balloons={};
  const nums=this.cbNumbers?this.cbNumbers(this.machine,this.sceneId):{};
  Object.values(this.cur.nodes).forEach(n=>{if(n.id==='frame'&&false)return;if(n.id==='hoses'||n.id==='oilLine')return;const e=document.createElement('button');e.className='bln'+(this.sceneId==='machine'?' pill':'');e.type='button';const num=nums[n.id];
   e.innerHTML=this.sceneId==='machine'?`<span>${n.label}</span>`:`<b>${num===undefined||num===''?'•':num}</b><span>${n.label}</span>`;e.setAttribute('aria-label',n.label);e.addEventListener('click',()=>this.select(n.id,true));e.addEventListener('pointerenter',()=>this.setHover(n.id));e.addEventListener('pointerleave',()=>this.setHover(null));this.overlay.appendChild(e);this.balloons[n.id]={e,x:0,y:0,n};});
 }
 updateBalloons(){
  if(!this.state.labels){Object.values(this.balloons).forEach(b=>{const on=this.sel===b.n.id;b.e.hidden=!on;if(on){const w=b.n.group.position.clone().add(b.n.anchor).project(this.camera);b.e.classList.add('on');b.e.style.transform=`translate(${Math.min(this.w-150,Math.max(4,(w.x+1)/2*this.w-30)).toFixed(0)}px,${Math.max(4,(1-w.y)/2*this.h-34).toFixed(0)}px)`;}});this.svg.innerHTML='';return;}
  const pts=[];const W=this.w,H=this.h;const c=this.controls.target;
  Object.values(this.balloons).forEach(b=>{const n=b.n,w=n.group.position.clone().add(n.anchor);w.project(this.camera);const ax=(w.x+1)/2*W,ay=(1-w.y)/2*H;
   const d=V(ax-W/2,ay-H/2,0);const len=d.length()||1;const push=this.sceneId==='machine'?46:40;
   let bx=ax+d.x/len*push,by=ay+d.y/len*push;pts.push({b,ax,ay,x:bx,y:by,w:b.e.offsetWidth||26,h:b.e.offsetHeight||22});});
  for(let it=0;it<7;it++)for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const a=pts[i],q=pts[j];const dx=(q.x-a.x),dy=(q.y-a.y),ox=(a.w+q.w)/2+3-Math.abs(dx),oy=(a.h+q.h)/2+2-Math.abs(dy);if(ox>0&&oy>0){if(oy<ox){const s=(dy>=0?1:-1)*oy/2;a.y-=s;q.y+=s;}else{const s=(dx>=0?1:-1)*ox/2;a.x-=s;q.x+=s;}}}
  let s='';pts.forEach(p=>{p.x=Math.min(W-p.w/2-3,Math.max(p.w/2+3,p.x));p.y=Math.min(H-p.h/2-3,Math.max(p.h/2+3,p.y));const b=p.b;b.e.hidden=false;b.e.style.transform=`translate(${(p.x-p.w/2).toFixed(1)}px,${(p.y-p.h/2).toFixed(1)}px)`;const on=this.sel===b.n.id||this.hover===b.n.id;b.e.classList.toggle('on',on);s+=`<line x1="${p.ax.toFixed(1)}" y1="${p.ay.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" class="${on?'on':''}"/>`;});
  this.svg.innerHTML=s;
 }
 hit(e){const r=this.renderer.domElement.getBoundingClientRect();this.ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.ptr,this.camera);const xs=this.ray.intersectObjects(this.cur.root.children,true);for(const x of xs){const o=x.object;if(o.userData.noPick||!o.isMesh)continue;if(o.material&&o.material.transparent&&o.material.opacity<.45)continue;if(o.userData.node)return o.userData.node;}return null;}
 pick(e){const id=this.hit(e);this.select(id,true);}
 moveHover(e){if(e.pointerType==='touch'||e.buttons)return;const id=this.hit(e);this.setHover(id);this.renderer.domElement.style.cursor=id?'pointer':'grab';}
 setHover(id){if(this.hover===id)return;this.hover=id;this.paint();}
 select(id,user){this.sel=id;this.paint();this.dim(id);if(user)this.onPick(id);}
 dim(id){if(!this.cur)return;this.cur.root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.userData.noPick)return;const m=o.material;if(id&&o.userData.node!==id){m.transparent=true;m.opacity=Math.min(o.userData.baseOpacity,.16);m.depthWrite=false;}else{m.opacity=o.userData.baseOpacity;m.transparent=o.userData.baseTrans;m.depthWrite=!o.userData.baseTrans||o.userData.baseOpacity>.5;}m.needsUpdate=true;});}
 paint(){if(!this.cur)return;this.cur.root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.userData.noPick||!o.material.emissive)return;const on=o.userData.node&&(o.userData.node===this.hover||o.userData.node===this.sel);o.material.emissive.setHex(on?(this.sel===o.userData.node?0x0d6f93:0x0a4a60):0);o.material.emissiveIntensity=on?.8:0;});}
 focusNode(id){const n=this.cur&&this.cur.nodes[id];if(!n)return;this.select(id,false);}
 loop(){
  requestAnimationFrame(this.loop);if(!this.cur||document.hidden||this.paused)return;
  const dt=Math.min(this.clock.getDelta(),.05);const s=this.state;s.t+=dt;
  const e=s.explode*s.explode*(3-2*s.explode);
  const ss={rate:s.rate,t:s.t,burner:s.burner,gunClosed:s.gunClosed,explode:e};
  this.cur.tick.forEach(f=>f(dt,ss));
  // flows
  const d=this._d||(this._d=new THREE.Object3D());
  this.cur.flowObjs.forEach(o=>{const f=o.f;const vis=s.rate>0&&(s.flow.has(f.sys)||(f.sys==='bypass'&&s.flow.has('water'))||(f.sys==='heat'&&s.flow.has('water'))||(f.sys==='drive'&&s.flow.has('fuel')))&&(!f.only||f.only(ss));o.im.visible=vis;if(!vis||!o.curve)return;o.u=(o.u+dt*s.rate*(f.speed||.28))%1;for(let i=0;i<o.n;i++){const u=(i/o.n+o.u)%1;o.curve.getPoint(u,d.position);d.updateMatrix();o.im.setMatrixAt(i,d.matrix);if(f.coil){f.c.lerpColors(f.c0,f.c1,u);o.im.setColorAt(i,f.c);}}o.im.instanceMatrix.needsUpdate=true;if(f.coil&&o.im.instanceColor)o.im.instanceColor.needsUpdate=true;});
  this.controls.update();this.renderer.render(this.scene,this.camera);this.updateBalloons();
 }
 clearFlows(){if(this.cur&&this.cur.flowObjs)this.cur.flowObjs.forEach(o=>this.scene.remove(o.im));}
}
