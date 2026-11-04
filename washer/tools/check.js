// node check: every part row and trouble/maintenance reference resolves to a real 3D node
const fs=require('fs'),vm=require('vm'),path=require('path');
const T=require(process.env.THREE_PATH||'three');
const c=vm.createContext({THREE:T,console,Math});
const R=path.join(__dirname,'..','src');
vm.runInContext(['data.js','guides.js','model.js'].map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n')+';this.X={MACHINES,TROUBLE,PROCS,SCHEDULE,BUILDERS,SCENES};',c);
const {MACHINES,TROUBLE,PROCS,SCHEDULE,BUILDERS,SCENES}=c.X;let bad=0;
for(const m in MACHINES){const nodes={};for(const [s] of SCENES){nodes[s]=Object.keys(BUILDERS[s](m).nodes);console.log(m,s,nodes[s].length);}
 const ok=r=>{const[a,b]=r.includes(':')?r.split(':'):['machine',r];return nodes[a]&&nodes[a].includes(b);};
 const seen=new Set();const rep=r=>{if(!seen.has(r)){seen.add(r);bad++;console.log(' BAD',m,r);}};
 MACHINES[m].assemblies.forEach(a=>a.parts.forEach(r=>{const n=r[4]||a.n;if(!ok(n))rep(n);}));
 MACHINES[m].kits.forEach(k=>{if(!ok(k[2]))rep(k[2]);});
 TROUBLE.forEach(g=>{if(g.only&&g.only!==m)return;g.items.forEach(i=>i.causes.forEach(c=>{if(c.loc&&!ok(c.loc))rep(c.loc);if(c.proc&&!PROCS[c.proc])rep('proc '+c.proc);(c.p||[]).forEach(k=>{if(!(k in MACHINES[m].keys))rep('key '+k);});}));});
 Object.values(PROCS).forEach(p=>{if(p.loc&&!ok(p.loc))rep(p.loc);});
 SCHEDULE.forEach(g=>g.items.forEach(i=>{if(i.loc&&!ok(i.loc))rep(i.loc);}));
}
console.log(bad?'FAILED '+bad:'all references resolve');
