/* App shell: tabs, machine switch, explode controls, guides, parts, maintenance. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={get(k,d){try{const v=localStorage.getItem('pl.'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem('pl.'+k,JSON.stringify(v));}catch(e){}}};
let S={machine:LS.get('machine','5355J'),tab:'view',scene:'machine',symptom:'lowpressure',trail:[],checks:LS.get('checks',{}),order:LS.get('order',{}),q:'',asm:'all',sys:'all',sel:null,drawer:null,drawerChecks:{},hours:{},log:[],shared:false,onlyMissing:false};
const M=()=>MACHINES[S.machine];
const pdfPg=key=>key==null?null:(typeof key==='number'?key:M().pdf[key]);
function toast(t){let e=$('.toast');if(!e){e=document.createElement('div');e.className='toast';e.setAttribute('role','status');document.body.appendChild(e);}e.textContent=t;clearTimeout(e._t);e._t=setTimeout(()=>e.remove(),2200);}

/* ---------- shared store: database inside Claude, browser storage elsewhere ---------- */
const Store={db:null,
 async init(){ if(!window.claude||!window.claude.use)return; try{const db=await window.claude.use('db');if(!db)return;this.db=db;S.shared=true;
   db.collection('machines').onSnapshot(s=>{s.docs.forEach(d=>{S.hours[d.id]=d.data().hours;});renderMaint();},()=>{});
   db.collection('service_log').onSnapshot(s=>{S.log=s.docs.map(d=>Object.assign({id:d.id},d.data()));renderMaint();},()=>{});
   renderMaint();}catch(e){} },
 loadLocal(){S.hours=LS.get('hours',{});S.log=LS.get('log',[]);},
 async setHours(mid,h){S.hours[mid]=h;if(this.db){try{await this.db.doc('machines/'+mid).set({hours:h,updated:new Date().toISOString()});}catch(e){toast('Could not save the hour reading. Ask for edit access.');}}else LS.set('hours',S.hours);},
 async addLog(row){if(this.db){try{await this.db.collection('service_log').add(row);}catch(e){toast('Could not save the entry. Ask for edit access.');}}else{row.id='l'+Date.now();S.log.push(row);LS.set('log',S.log);renderMaint();}},
 async delLog(id){if(this.db){try{await this.db.doc('service_log/'+id).delete();}catch(e){toast('Could not remove the entry.');}}else{S.log=S.log.filter(r=>r.id!==id);LS.set('log',S.log);renderMaint();}}
};

/* ---------- lookups ---------- */
function nodeRef(sc,id){return sc==='machine'?id:sc+':'+id;}
function rowsFor(ref){const out=[];M().assemblies.forEach(a=>a.parts.forEach(r=>{const n=r[4]||a.n;if(n===ref)out.push({a,r});}));return out;}
function itemNumbers(m,sc){const nums={};MACHINES[m].assemblies.forEach(a=>a.parts.forEach(r=>{const n=r[4]||a.n;if(n&&n.startsWith(sc+':')){const id=n.split(':')[1];if(nums[id]===undefined)nums[id]=r[0];}}));return nums;}
function troublesFor(ref){const out=[];TROUBLE.forEach(g=>{if(g.only&&g.only!==S.machine)return;g.items.forEach(i=>{if(i.causes.some(c=>c.loc===ref))out.push(i);});});return out;}
function procsFor(ref){return Object.entries(PROCS).filter(([k,p])=>p.loc===ref);}
const ALLPN=(()=>{const o={};for(const m in MACHINES){MACHINES[m].assemblies.forEach(a=>a.parts.forEach(r=>{if(r[1]){(o[r[1]]=o[r[1]]||new Set()).add(m);}}));MACHINES[m].kits.forEach(k=>{(o[k[0]]=o[k[0]]||new Set()).add(m);});}return o;})();
function otherMachine(pn){const s=ALLPN[pn];if(!s)return null;const others=[...s].filter(x=>x!==S.machine);return others[0]||null;}
function descOf(pn){if(!pn)return'';for(const a of M().assemblies)for(const r of a.parts)if(r[1]===pn)return r[2];const k=M().kits.find(k=>k[0]===pn);if(k)return k[1];const tl=TOOLS.find(x=>x[0]===pn);return tl?tl[1]:'';}
function addOrder(pn,desc){const k=S.machine+'|'+pn;const o=S.order[k]||{q:0,pn,desc:desc||descOf(pn),machine:S.machine};o.q++;S.order[k]=o;LS.set('order',S.order);renderOrder();toast(pn+' added to order list');}
function pnChip(pn){if(!pn)return'';return `<span class="tag"><span class="pn">${esc(pn)}</span><button type="button" data-order="${esc(pn)}" aria-label="Add ${esc(pn)} to order list" title="Add to order list">+</button></span>`;}

/* ---------- 3D ---------- */
let viewer=null,viewerFailed=false;
function ensureViewer(){if(viewer||viewerFailed)return;try{viewer=new Viewer($('#gl'),$('#ov'));viewer.cbNumbers=itemNumbers;viewer.onPick=id=>{S.sel=id;renderNodePanel();};
  const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;if(rm){viewer.state.rate=0;}if(innerWidth<600){viewer.state.labels=false;$('#labels').setAttribute('aria-pressed','false');}
  syncCtl();loadScene(S.scene);}catch(e){viewerFailed=true;$('#gl').innerHTML='<p style="padding:20px">3D needs WebGL, which this browser has turned off. The parts, troubleshooting and maintenance tabs still work.</p>';console.error(e);}}
function loadScene(sc,sel){S.scene=sc;S.sel=sel||null;$$('#sceneTabs .chip').forEach(b=>b.setAttribute('aria-pressed',b.dataset.scene===sc));if(viewer){viewer.load(S.machine,sc);if(sel)viewer.select(sel,false);$('#ex').value=viewer.state.explode;$('#gunRow').hidden=!viewer.cur.gunToggle;}renderNodePanel();syncRunLabel();}
function locate(ref){setTab('view');const [sc,id]=ref.includes(':')?ref.split(':'):['machine',ref];ensureViewer();const sub=sc;
 if(viewer&&viewer.machine===S.machine&&viewer.sceneId===sub){viewer.select(viewer.cur.nodes[id]?id:null,false);S.sel=id;renderNodePanel();}else loadScene(sub,id);
 $('#stage').scrollIntoView({block:'nearest'});}
function syncRunLabel(){const b=$('#run');if(b&&viewer)b.textContent=viewer.state.rate?'Stop motion':'Run motion';}
function syncCtl(){if(!viewer)return;$('#ex').value=viewer.state.explode;syncRunLabel();}
const SUBSCENE={pump:'pump',burner:'burner',unloader:'unloader',gunMachine:'gun'};
const PATHS={
 '5355J':[['water','Water',['Float tank, fed by garden hose','Pump inlet','Pump head, 3,500 psi','Unloader, with accumulator and relief valve','Heating coil, 14 in OD x 126 ft','Quick coupler, 100 ft hose','Trigger gun, wand, tip']],['fuel','Burner fuel',['Fuel tank, 9.5 gal','Fuel filter','Fuel pump, 125 psi','Burner gun and 2.25 gph nozzle']]],
 '8405HNL':[['water','Water',['Garden hose swivel and screen','Pump inlet','Pump head, 3,700 psi','Unloader, with accumulator and relief valve','Heating coil, 18 in OD x 147 ft','Quick coupler, 50 ft hose','Trigger gun, wand, tip']],['fuel','Burner fuel',['Fuel tank, 7 gal','Fuel filter','Fuel pump, 125 psi','Burner gun and 3.25 gph nozzle']]]};
const SCENE_NOTE={machine:'Click any part. Hoses stay connected as the machine opens up.',pump:'Crankshaft turns, rods drive the plungers, and suction and discharge valves lift in turn.',burner:'Motor spins the fan and fuel pump. Fuel reaches the nozzle, the electrodes spark, and the flame shows when assembled.',unloader:'Close the gun to see the piston rise and the flow move to bypass.',gun:'Open or close the gun to see the trigger, cam, pin and ball move.'};
function renderNodePanel(){const box=$('#nodePanel');if(!box)return;const id=S.sel;
 if(!id||!viewer||!viewer.cur||!viewer.cur.nodes[id]){
  box.innerHTML=`<div><div class="lab">${esc(SCENES.find(s=>s[0]===S.scene)[1])}</div><h2>${S.scene==='machine'?S.machine:esc(SCENES.find(s=>s[0]===S.scene)[1])}</h2><p style="margin:6px 0 0">${esc(SCENE_NOTE[S.scene])}</p></div>`+
  (S.scene==='machine'?PATHS[S.machine].map(([sys,n,list])=>`<div><h3><span class="dot" style="background:var(--sys-${sys})"></span>${n} path</h3><ol class="pathlist" style="list-style:none;padding:0;margin:6px 0 0;display:flex;flex-direction:column;gap:4px">${list.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`).join(''):'')+
  `<div><h3>Open a subassembly</h3><ul style="margin-top:6px">${SCENES.filter(s=>s[0]!==S.scene).map(s=>`<li><button class="linkish" data-scene="${s[0]}">${s[1]}</button></li>`).join('')}</ul></div>`;return;}
 const n=viewer.cur.nodes[id],ref=nodeRef(S.scene,id),rows=rowsFor(ref),tr=troublesFor(ref),pr=procsFor(ref),sub=S.scene==='machine'&&SUBSCENE[id];
 box.innerHTML=`<div><div class="lab">${esc(SCENES.find(s=>s[0]===S.scene)[1])}</div><h2>${esc(n.label)}</h2></div>
 <div style="display:flex;gap:6px;flex-wrap:wrap">${sub?`<button class="btn pri" data-scene="${sub}">Open exploded ${esc(SCENES.find(s=>s[0]===sub)[1].toLowerCase())}</button>`:''}<button class="btn" data-clear="1">Clear selection</button></div>
 ${rows.length?`<div><table class="mini"><thead><tr><th>Item</th><th>Part no.</th><th>Description</th><th>Qty</th><th></th></tr></thead><tbody>${rows.slice(0,24).map(({a,r})=>`<tr><td>${esc(r[0])}</td><td class="pn">${r[1]?esc(r[1]):'<span class="mute">not printed</span>'}</td><td>${esc(r[2])}<br><span class="mute">${esc(a.name)}, PDF p.${a.pg}</span></td><td>${esc(r[3])}</td><td>${r[1]?`<button class="btn sm" data-order="${esc(r[1])}" aria-label="Add ${esc(r[1])} to order list">+</button>`:''}</td></tr>`).join('')}</tbody></table>${rows.length>24?`<p class="mute" style="font-size:.84rem;margin:6px 0 0">Showing 24 of ${rows.length}. <button class="linkish" data-asmjump="${esc(rows[0].a.id)}">See all in Parts</button></p>`:''}</div>`:'<p class="mute" style="margin:0">Shown for context. The manual has no separate part row for this.</p>'}
 ${tr.length?`<div><h3>Symptoms that point here</h3><ul style="margin-top:6px">${tr.slice(0,9).map(t=>`<li><button class="linkish" data-sym="${t.id}">${esc(t.t)}</button></li>`).join('')}</ul></div>`:''}
 ${pr.length?`<div><h3>Procedures</h3><ul style="margin-top:6px">${pr.map(([k,p])=>`<li><button class="linkish" data-proc="${k}">${esc(p.t)}</button></li>`).join('')}</ul></div>`:''}`;
}

/* ---------- troubleshooting ---------- */
function allSym(){const o={};TROUBLE.forEach(g=>{if(g.only&&g.only!==S.machine)return;g.items.forEach(i=>o[i.id]=Object.assign({group:g},i));});return o;}
function renderFinder(){const q=($('#tq')?$('#tq').value:'').toLowerCase().trim();const box=$('#symList');box.innerHTML=TROUBLE.filter(g=>!g.only||g.only===S.machine).map(g=>{const items=g.items.filter(i=>!q||i.t.toLowerCase().includes(q)||i.causes.some(c=>(c.c+' '+c.r).toLowerCase().includes(q)));if(!items.length)return'';return `<h3><span class="dot" style="background:var(--sys-${g.sys})"></span>${esc(g.group)}</h3>`+items.map(i=>`<button class="sym" data-sym="${i.id}" aria-current="${S.symptom===i.id}">${esc(i.t)}</button>`).join('');}).join('')||'<p class="mute">No symptom mentions that. Try a part name such as nozzle, belt or valve.</p>';}
function renderDiag(){const all=allSym();if(!all[S.symptom])S.symptom='lowpressure';const i=all[S.symptom];const key=c=>S.machine+'|'+i.id+'|'+c;const pg=M().pdf[i.pg];
 const st=i.causes.map(c=>S.checks[key(c.c)]||'');const done=st.filter(Boolean).length,found=st.filter(x=>x==='found').length;
 $('#diag').innerHTML=`${S.trail.length?`<div class="trail"><span class="mute">Followed from</span>${S.trail.map((t,ix)=>`<button class="linkish" data-back="${ix}">${esc(all[t]?all[t].t:t)}</button><span class="mute">›</span>`).join('')}<span>${esc(i.t)}</span></div>`:''}
 <div class="diag-h"><div><div class="lab">${esc(i.group.group)}, ${S.machine}${pg?`, PDF p.${pg}`:''}</div><h2>${esc(i.t)}</h2></div><div class="mute" style="font-size:.9rem;font-variant-numeric:tabular-nums">${done} of ${i.causes.length} checked${found?`, ${found} found`:''} ${done?`<button class="linkish" data-reset="1">Reset</button>`:''}</div></div>
 ${i.warn?`<div class="warnbox"><b>Warning.</b> ${esc(i.warn)}</div>`:''}
 ${i.group.note?`<div class="note">${esc(i.group.note)}</div>`:''}
 ${i.causes.map((c,ix)=>{const s=S.checks[key(c.c)]||'';const parts=(c.p||[]).map(k=>M().keys[k]).filter(Boolean);return `<article class="cause ${s==='found'?'found':s==='clear'?'clear':''}"><div><h4>${esc(c.c)}</h4><p>${esc(c.r)}</p></div>
  <div class="state" role="group" aria-label="Result for ${esc(c.c)}"><button data-mark="${ix}" data-v="clear" aria-pressed="${s==='clear'}">Ruled out</button><button data-mark="${ix}" data-v="found" aria-pressed="${s==='found'}">Found it</button></div>
  <div class="acts">${c.go&&all[c.go]?`<button class="btn sm" data-follow="${c.go}">Follow: ${esc(all[c.go].t)}</button>`:''}${c.loc?`<button class="btn sm" data-locate="${c.loc}">Show in 3D</button>`:''}${c.proc?`<button class="btn sm" data-proc="${c.proc}">${esc(PROCS[c.proc].t)}</button>`:''}${parts.map(pnChip).join('')}</div></article>`;}).join('')}
 <p class="foot">Causes run in the order the manual lists them, which is not ranked by likelihood. The links between symptoms replace the manual’s “See…” references.</p>`;
}
/* ---------- procedure drawer ---------- */
function openProc(k){S.drawer=k;renderDrawer();}
function procRef(p){if(p.pgFixed)return p.pgFixed;return p.pg?M().pdf[p.pg]:null;}
function renderDrawer(){const old=$('.drawer');if(old)old.remove();if(!S.drawer)return;const p=PROCS[S.drawer];const borrowed=(S.drawer==='pumpoil'||S.drawer==='freeze')&&S.machine==='5355J';const borrowedUnl=S.drawer==='unloaderadj'&&S.machine==='8405HNL';
 const d=document.createElement('aside');d.className='drawer';d.setAttribute('aria-label',p.t);const ck=S.drawerChecks[S.drawer]||{};
 d.innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px;align-items:start"><div><div class="lab">Procedure, ${S.machine}${borrowed?', from the 8405HNL manual, PDF p.25':borrowedUnl?', from the 5355J manual, PDF p.37':procRef(p)?`, PDF p.${procRef(p)}`:''}</div><h2>${esc(p.t)}</h2></div><button class="btn" data-closedraw="1">Close</button></div>
 ${p.warn?`<div class="warnbox"><b>Warning.</b> ${esc(p.warn)}</div>`:''}
 ${borrowed?`<div class="note">The 5355J manual does not print this procedure. It comes from the 8405HNL manual, which uses a pump from the same maker family. Confirm with Alkota.</div>`:''}
 ${borrowedUnl?`<div class="note">The 8405HNL manual prints only the heading. These steps were written for the unloader on the 5355J. Read them against your valve, and call Alkota before adjusting.</div>`:''}
 ${p.lead?`<p style="margin:0">${esc(p.lead)}</p>`:''}
 ${p.spec?`<table class="mini"><tbody>${p.spec.map(s=>`<tr><td>${esc(s[0])}</td><td class="pn">${esc(s[1])}</td></tr>`).join('')}</tbody></table>`:''}
 <div class="note" style="background:var(--panel2);border-color:var(--line)"><b>Before you start (shop practice, not from the manual).</b> ${SAFETY.map(esc).join(' ')}</div>
 <ol>${p.steps.map((s,i)=>`<li><label><input type="checkbox" id="st-${S.drawer}-${i}" data-step="${i}" ${ck[i]?'checked':''}><b>${i+1}</b><span>${esc(s)}</span></label></li>`).join('')}</ol>
 <div style="display:flex;gap:6px;flex-wrap:wrap">${p.loc?`<button class="btn" data-locate="${p.loc}" data-closedraw="1">Show in 3D</button>`:''}<button class="btn pri" data-logproc="${S.drawer}">Log this as done</button></div>`;
 document.body.appendChild(d);}

/* ---------- parts ---------- */
function renderParts(){const q=S.q.toLowerCase().trim();const m=M();
 $('#asmSel').innerHTML=`<option value="all">All assemblies</option>`+m.assemblies.map(a=>`<option value="${a.id}" ${S.asm===a.id?'selected':''}>${esc(a.name)}</option>`).join('');
 $('#sysChips').innerHTML=[['all','All systems']].concat(Object.entries(SYS).map(([k,v])=>[k,v.name])).map(([k,n])=>`<button class="chip" data-sys="${k}" aria-pressed="${S.sys===k}">${k!=='all'?`<span class="dot" style="background:var(--sys-${k})"></span>`:''}${n}</button>`).join('');
 $('#kits').innerHTML=m.kits.filter(k=>!q||(k[0]+' '+k[1]).toLowerCase().includes(q)).map(k=>`<div class="kit"><div class="row"><span class="pn"><b>${esc(k[0])}</b></span><span style="display:flex;gap:4px"><button class="btn sm" data-locate="${k[2]}">Locate</button><button class="btn sm" data-order="${esc(k[0])}" aria-label="Add ${esc(k[0])} to order list">+</button></span></div><span>${esc(k[1])}</span></div>`).join('');
 let count=0,html='';
 m.assemblies.forEach(a=>{if(S.asm!=='all'&&S.asm!==a.id)return;if(S.sys!=='all'&&S.sys!==a.sys)return;const rows=a.parts.filter(r=>!q||(`${r[1]} ${r[2]} ${a.name}`).toLowerCase().includes(q));if(!rows.length)return;count+=rows.length;
  html+=`<tr class="asm" style="--sysc:var(--sys-${a.sys})"><td colspan="6">${esc(a.name)} <span class="pn mute" style="font-size:.78rem;font-weight:400">${esc(a.pn)}, PDF p.${a.pg}</span></td></tr>`+rows.map(r=>{const other=otherMachine(r[1]);const ref=r[4]||a.n;return `<tr><td class="num">${esc(r[0])}</td><td class="pn">${r[1]?esc(r[1]):'<span class="mute">not printed</span>'}</td><td>${esc(r[2])} ${r[5]?`<span class="badge">${esc(r[5])}</span>`:''} ${other?`<span class="badge">also on ${other}</span>`:''}</td><td class="num">${esc(r[3])}</td><td><button class="btn sm" data-locate="${esc(ref)}">Locate</button></td><td>${r[1]?`<button class="btn sm" data-order="${esc(r[1])}" aria-label="Add ${esc(r[1])} to order list">+ Order</button>`:''}</td></tr>`;}).join('');});
 $('#partsBody').innerHTML=html||`<tr><td colspan="6" class="mute" style="padding:18px">No parts match. Clear the search or pick All assemblies.</td></tr>`;
 $('#partCount').textContent=count+' rows';renderOrder();}
function renderOrder(){const box=$('#orderBox');if(!box)return;const rows=Object.entries(S.order).filter(([k,o])=>o.q>0);
 box.innerHTML=`<h3>Order list</h3>`+(rows.length?rows.map(([k,o])=>`<div class="ord-row"><div><span class="pn"><b>${esc(o.pn)}</b></span> <span class="badge">${esc(o.machine)}</span><br>${esc(o.desc)}</div><div class="qty"><button data-qty="${esc(k)}" data-d="-1" aria-label="One less">-</button><span style="min-width:2ch;text-align:center">${o.q}</span><button data-qty="${esc(k)}" data-d="1" aria-label="One more">+</button></div></div>`).join('')+`<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn pri" id="copyOrder">Copy list</button><button class="btn" id="clearOrder">Clear</button></div><textarea id="orderText" readonly hidden rows="5" style="width:100%"></textarea>`:`<p class="mute" style="margin:0">Press + on any part, kit or diagnosis to build a list for your dealer. It stays in this browser.</p>`)+
 `<div><h3 style="margin-top:6px">Service tools</h3><ul style="list-style:none;padding:0;margin:6px 0 0;display:flex;flex-direction:column;gap:4px;font-size:.88rem">${TOOLS.map(t=>`<li><span class="pn">${esc(t[0])}</span> ${esc(t[1])}</li>`).join('')}</ul></div>`;}

/* ---------- tools ---------- */
let HAVE=LS.get('have',{});
function toolRows(){return TOOL_GROUPS.flatMap(g=>g.rows.filter(r=>!r.only||r.only===S.machine).map(r=>({g,r,key:r.pn||r.t,use:typeof r.use==='string'?r.use:r.use[S.machine]})));}
function renderTools(){const all=toolRows(),have=all.filter(x=>HAVE[x.key]).length;
 $('#toolSum').textContent=`${have} of ${all.length} on hand for the ${S.machine}`;
 $('#toolBox').innerHTML=TOOL_GROUPS.map(g=>{const rows=all.filter(x=>x.g===g);if(!rows.length)return'';return `<div class="tool-group"><h3>${esc(g.t)}</h3>${g.note?`<p class="mute" style="margin:2px 0 8px;font-size:.9rem">${esc(g.note)}</p>`:''}<div class="tablewrap"><table class="parts"><thead><tr><th style="width:44px">Have</th><th>Tool or supply</th><th>Part number</th><th>Used for</th><th></th></tr></thead><tbody>${rows.map(({r,key,use},i)=>{const id=`tool-${g.id}-${i}`;return `<tr><td><input type="checkbox" id="${id}" data-have="${esc(key)}" ${HAVE[key]?'checked':''} aria-label="Have ${esc(r.t)}" style="accent-color:var(--accent)"></td><td>${esc(r.t)}</td><td class="pn">${r.pn?esc(r.pn):'<span class="mute">not printed</span>'}</td><td>${esc(use)}</td><td style="white-space:nowrap">${r.proc?`<button class="btn sm" data-proc="${r.proc}">Steps</button> `:''}${r.pn?`<button class="btn sm" data-order="${esc(r.pn)}" aria-label="Add ${esc(r.pn)} to order list">+ Order</button>`:''}</td></tr>`;}).join('')}</tbody></table></div></div>`;}).join('');}

/* ---------- maintenance ---------- */
const today=()=>new Date().toISOString().slice(0,10);
function lastDone(id){const rows=S.log.filter(r=>r.machine===S.machine&&r.task===id).sort((a,b)=>(a.date<b.date?1:-1));return rows[0]||null;}
function status(it){const h=S.hours[S.machine];const last=lastDone(it.id);
 if(it.cond)return{c:'cond',t:'As needed',d:last?`Last logged ${last.date}, ${last.hours||'?'} h`:''};
 const dayMs=864e5;let msg=[],c='ok',t='OK';
 if(it.at){if(last)return{c:'ok',t:'Done',d:`Done ${last.date} at ${last.hours||'?'} h`};if(h==null)return{c:'cond',t:'Enter hours',d:`Due at ${it.at} h`};const left=it.at-h;return left<=0?{c:'over',t:'Overdue',d:`Was due at ${it.at} h`}:{c:left<=10?'due':'ok',t:left<=10?'Due soon':'OK',d:`${left} h left, due at ${it.at} h`};}
 if(it.every){const base=last&&last.hours!=null&&last.hours!==''?+last.hours:(it.id==='oil'?50:0);const span=it.orDays?`Every ${it.every} h or ${it.orDays/30} months`:`Every ${it.every} h`;if(h==null&&!last)return{c:'cond',t:'Enter hours',d:span};const left=base+it.every-(h||0);
  if(!last&&left<=0)return{c:'due',t:'No record',d:span+'. Log the last service to start the count'};
  msg.push(`${left} h left`);if(left<=0){c='over';t='Overdue';}else if(left<=it.every*.1){c='due';t='Due soon';}
  if(it.orDays&&last){const dl=it.orDays-Math.floor((Date.now()-new Date(last.date))/dayMs);msg.push(`${dl} days left`);if(dl<=0){c='over';t='Overdue';}else if(dl<=7&&c==='ok'){c='due';t='Due soon';}}
  msg.push(span);return{c,t,d:msg.join('. ')};}
 if(it.days){if(!last)return{c:'due',t:'Not logged',d:it.days===1?'Each day':it.days===7?'Each week':'Each year'};const age=Math.floor((Date.now()-new Date(last.date+'T12:00'))/dayMs);const left=it.days-age;return left<=0?{c:'over',t:'Due',d:`Last done ${last.date}`}:{c:'ok',t:'OK',d:`Last done ${last.date}`};}
 return{c:'cond',t:''};}
function renderMaint(){const box=$('#schedule');if(!box)return;const h=S.hours[S.machine];
 const hi=$('#hourIn');if(hi&&document.activeElement!==hi)hi.value=h==null?'':h;
 $('#storeNote').textContent=S.shared?'Saved for everyone who can edit this page.':'Saved in this browser only.';
 let counts={over:0,due:0};
 box.innerHTML=SCHEDULE.map(g=>{const items=g.items.filter(i=>!i.only||i.only===S.machine);if(!items.length)return'';return `<h3>${esc(g.group)}</h3>`+items.map(it=>{const st=status(it);if(st.c==='over')counts.over++;if(st.c==='due')counts.due++;const pg=it.pgFixed?it.pgFixed[S.machine]:it.src?M().pdf[it.src]:null;const borrowed=it.note&&it.note[S.machine];return `<div class="task"><span class="pillst ${st.c}">${esc(st.t)}</span><div>${esc(it.t)}<small>${[st.d,borrowed,pg&&!(borrowed&&it.proc)?`PDF p.${pg}`:''].filter(Boolean).map(x=>esc(x).replace(/\.$/,'')).join('. ')}</small></div><div class="acts2" style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">${it.proc?`<button class="btn sm" data-proc="${it.proc}">Steps</button>`:''}${it.loc?`<button class="btn sm" data-locate="${it.loc}">3D</button>`:''}<button class="btn sm" data-done="${it.id}">Log done</button></div></div>`;}).join('');}).join('');
 $('#dueSummary').innerHTML=counts.over||counts.due?`<b>${counts.over}</b> overdue, <b>${counts.due}</b> due soon or not yet logged`:'Nothing due right now';
 const sel=$('#logTask');if(sel&&!sel.dataset.m||sel.dataset.m!==S.machine){const cur=sel.value;sel.innerHTML=SCHEDULE.flatMap(g=>g.items.filter(i=>!i.only||i.only===S.machine)).map(i=>`<option value="${i.id}">${esc(i.t)}</option>`).join('')+`<option value="other">Other service</option>`;sel.dataset.m=S.machine;if(cur)sel.value=cur;}
 const rows=S.log.filter(r=>r.machine===S.machine).sort((a,b)=>(a.date<b.date?1:-1));
 $('#logRows').innerHTML=rows.length?rows.map(r=>`<tr><td style="white-space:nowrap">${esc(r.date)}</td><td class="num">${esc(r.hours)}</td><td>${esc(r.label)}${r.notes?`<br><span class="mute">${esc(r.notes)}</span>`:''}</td><td>${esc(r.by||'')}</td><td><button class="btn sm" data-dellog="${esc(r.id)}" aria-label="Remove entry">Remove</button></td></tr>`).join(''):`<tr><td colspan="5" class="mute" style="padding:10px 6px">No service logged yet for the ${S.machine}. Enter the hour meter reading above, then log the first job.</td></tr>`;
 $('#procLib').innerHTML=PROC_GROUPS.map(([g,keys])=>`<div><h3>${esc(g)}</h3><ul>${keys.map(k=>`<li><button class="linkish" data-proc="${k}">${esc(PROCS[k].t)}</button></li>`).join('')}</ul></div>`).join('');
}
function prefillLog(id,proc){setTab('maintenance');const sel=$('#logTask');if(id)sel.value=id;else sel.value='other';$('#logDate').value=today();const h=S.hours[S.machine];if(h!=null)$('#logHours').value=h;if(proc)$('#logNotes').value=PROCS[proc].t;$('#logForm').scrollIntoView({block:'center'});$('#logHours').focus();}

/* ---------- specs ---------- */
function renderSpecs(){const m=M();$('#specBox').innerHTML=`<div><h2>Check these in the manual</h2><p class="mute" style="margin:4px 0 0;max-width:75ch">The ${m.id} manual contradicts itself or leaves gaps in these places. This page keeps the printed values and marks the conflict.</p><div class="flags">${m.flags.map(f=>`<div class="flag"><b>${esc(f[0])}</b>${esc(f[1])}</div>`).join('')}</div></div>
 <h2>Specifications</h2><p class="mute" style="margin:2px 0 10px">${esc(m.series)}, p/n ${esc(m.pn)}, revision ${esc(m.rev)}. Size ${esc(m.size)}.</p>
 <div class="specs">${m.specs.map(([t,rows])=>`<div class="card"><h3>${esc(t)}</h3><table class="mini" style="margin-top:6px"><tbody>${rows.map(r=>`<tr><td class="mute" style="width:42%">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></div>`).join('')}
 <div class="card"><h3>Pump torque, ft-lb</h3><table class="mini" style="margin-top:6px;font-variant-numeric:tabular-nums"><tbody>${m.torque.map(r=>`<tr><td>${esc(r[0])}</td><td class="num" style="text-align:right">${r[1]}</td></tr>`).join('')}</tbody></table><p class="mute" style="font-size:.85rem;margin:6px 0 0">${esc(m.torqueNote)}</p></div></div>`;}

/* ---------- shell ---------- */
function renderPlate(){const m=M();$$('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===S.machine));$('#plateSub').textContent=`${m.series}, ${m.size}`;
 $('#stats').innerHTML=m.plate.map(p=>`<div><u>${esc(p[0])}</u><b>${esc(p[1])}</b><i>${esc(p[2])}</i></div>`).join('');}
function setTab(t){S.tab=t;LS.set('tab',t);$$('main>section').forEach(s=>s.hidden=s.id!=='tab-'+t);$$('nav.tabs a').forEach(a=>{if(a.dataset.t===t)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});try{if(location.hash.slice(1)!==t)history.replaceState(null,'','#'+t);}catch(e){try{location.hash=t;}catch(_){}}
 if(viewer)viewer.paused=t!=='view';if(t==='view'){ensureViewer();if(viewer)viewer.resize();}
 if(t==='troubleshoot'){renderFinder();renderDiag();}if(t==='parts')renderParts();if(t==='tools')renderTools();if(t==='maintenance')renderMaint();if(t==='specs')renderSpecs();}
function setMachine(id){S.machine=id;LS.set('machine',id);S.trail=[];renderPlate();if(viewer)loadScene(S.scene);else renderNodePanel();setTab(S.tab);}

document.addEventListener('click',e=>{const t=e.target.closest('button,a');if(!t)return;const d=t.dataset;
 if(d.m){setMachine(d.m);return;}
 if(d.scene){loadScene(d.scene);setTab('view');return;}
 if(d.order){addOrder(d.order);return;}
 if(d.locate){locate(d.locate);if(d.closedraw){S.drawer=null;renderDrawer();}return;}
 if(d.closedraw){S.drawer=null;renderDrawer();return;}
 if(d.proc){openProc(d.proc);return;}
 if(d.logproc){const pr=d.logproc;S.drawer=null;renderDrawer();const task=SCHEDULE.flatMap(g=>g.items).find(i=>i.proc===pr&&!i.at);prefillLog(task?task.id:null,pr);return;}
 if(d.sym){S.symptom=d.sym;S.trail=[];setTab('troubleshoot');return;}
 if(d.follow){S.trail.push(S.symptom);S.symptom=d.follow;renderFinder();renderDiag();$('#diag').scrollIntoView({block:'start'});return;}
 if(d.back!==undefined){const ix=+d.back;S.symptom=S.trail[ix];S.trail=S.trail.slice(0,ix);renderFinder();renderDiag();return;}
 if(d.mark!==undefined){const all=allSym(),i=all[S.symptom],c=i.causes[+d.mark],k=S.machine+'|'+i.id+'|'+c.c;S.checks[k]=S.checks[k]===d.v?'':d.v;LS.set('checks',S.checks);renderDiag();return;}
 if(d.reset){const i=allSym()[S.symptom];i.causes.forEach(c=>delete S.checks[S.machine+'|'+i.id+'|'+c.c]);LS.set('checks',S.checks);renderDiag();return;}
 if(d.sys){S.sys=d.sys;renderParts();return;}
 if(d.qty){const o=S.order[d.qty];o.q+=+d.d;if(o.q<=0)delete S.order[d.qty];LS.set('order',S.order);renderOrder();return;}
 if(d.asmjump){S.asm=d.asmjump;S.q='';S.sys='all';const q=$('#pq');if(q)q.value='';setTab('parts');return;}
 if(d.clear){S.sel=null;if(viewer)viewer.select(null,false);renderNodePanel();return;}
 if(d.done){prefillLog(d.done);return;}
 if(d.dellog){Store.delLog(d.dellog);return;}
 if(t.id==='copyOrder'){const txt=Object.values(S.order).filter(o=>o.q>0).map(o=>`${o.q} x ${o.pn}  ${o.desc}  (${o.machine})`).join('\n');const ta=$('#orderText');ta.value=txt;const fb=()=>{ta.hidden=false;ta.select();toast('Select and copy the text below');};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(()=>toast('Order list copied'),fb);else fb();return;}
 if(t.id==='copyMissing'){const txt=toolRows().filter(x=>!HAVE[x.key]).map(x=>`${x.r.t}${x.r.pn?' ('+x.r.pn+')':''}`).join('\n');const fb=()=>{const ta=$('#missingText');ta.value=txt;ta.hidden=false;ta.select();toast('Select and copy the text below');};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(()=>toast('Missing items copied'),fb);else fb();return;}
 if(t.id==='clearOrder'){S.order={};LS.set('order',S.order);renderOrder();return;}
 if(t.id==='run'&&viewer){viewer.state.rate=viewer.state.rate?0:1;syncRunLabel();return;}
 if(t.id==='resetView'&&viewer){viewer.camera.position.set(...viewer.fit0.p);viewer.controls.target.set(...viewer.fit0.t);viewer.select(null,false);S.sel=null;renderNodePanel();return;}
 if(t.id==='labels'&&viewer){viewer.state.labels=!viewer.state.labels;t.setAttribute('aria-pressed',viewer.state.labels);return;}
 if(t.id==='gunBtn'&&viewer){viewer.state.gunClosed=!viewer.state.gunClosed;t.textContent=viewer.state.gunClosed?'Open gun':'Close gun';$('#gunState').textContent=viewer.state.gunClosed?'Gun closed: flow goes to bypass':'Gun open: flow goes to the wand';return;}
 if(d.flow&&viewer){const on=viewer.state.flow.has(d.flow);if(on)viewer.state.flow.delete(d.flow);else viewer.state.flow.add(d.flow);t.setAttribute('aria-pressed',!on);return;}
});
document.addEventListener('input',e=>{const t=e.target;
 if(t.id==='ex'&&viewer){viewer.setExplode(+t.value);}
 if(t.id==='speed'&&viewer){const v=+t.value;viewer.state.rate=v;syncRunLabel();}
 if(t.id==='tq')renderFinder();
 if(t.dataset&&t.dataset.have!==undefined){HAVE[t.dataset.have]=t.checked;LS.set('have',HAVE);const all=toolRows();$('#toolSum').textContent=`${all.filter(x=>HAVE[x.key]).length} of ${all.length} on hand for the ${S.machine}`;}
 if(t.id==='pq'){S.q=t.value;renderParts();}
 if(t.id==='asmSel'){S.asm=t.value;renderParts();}
 if(t.dataset&&t.dataset.step!==undefined&&S.drawer){(S.drawerChecks[S.drawer]=S.drawerChecks[S.drawer]||{})[t.dataset.step]=t.checked;}
});
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target;
 if(f.id==='hourForm'){const v=$('#hourIn').value;if(v===''||isNaN(+v)||+v<0){toast('Enter the reading from the hour meter, such as 412.5');return;}Store.setHours(S.machine,+v);renderMaint();toast('Hour meter saved');}
 if(f.id==='logForm'){const task=$('#logTask').value,it=SCHEDULE.flatMap(g=>g.items).find(i=>i.id===task);const row={machine:S.machine,task,label:it?it.t:'Other service',date:$('#logDate').value||today(),hours:$('#logHours').value,by:$('#logBy').value.trim(),notes:$('#logNotes').value.trim()};Store.addLog(row);f.reset();$('#logDate').value=today();toast('Service logged');}
});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(['view','troubleshoot','parts','tools','maintenance','specs'].includes(h)&&h!==S.tab)setTab(h);});
try{const qm=new URLSearchParams(location.search).get('m');if(qm&&MACHINES[qm]){S.machine=qm;LS.set('machine',qm);}}catch(e){}
Store.loadLocal();renderPlate();
$('#sceneTabs').innerHTML=SCENES.map(s=>`<button class="chip" data-scene="${s[0]}" aria-pressed="${s[0]==='machine'}">${s[1]}</button>`).join('');
$('#logDate').value=today();
const h0=location.hash.slice(1);setTab(['view','troubleshoot','parts','tools','maintenance','specs'].includes(h0)?h0:'view');
Store.init();
window.__viewer=()=>viewer;
