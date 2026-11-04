#!/usr/bin/env python3
"""Check that every part number in src/data.js appears in the text layer of its own manual."""
import re,sys,json,subprocess
txt={k:re.sub(r'\s+',' ',open(v,errors='ignore').read()) for k,v in {'5355J':sys.argv[1],'8405HNL':sys.argv[2]}.items()}
s=subprocess.check_output(['node','-e',"const fs=require('fs'),vm=require('vm');const c=vm.createContext({});vm.runInContext(fs.readFileSync('src/data.js','utf8')+';this.M=MACHINES;this.T=TOOLS',c);const o={};for(const m in c.M){o[m]=[];c.M[m].assemblies.forEach(a=>a.parts.forEach(r=>{if(r[1])o[m].push([a.id,r[0],r[1],r[2],r[3]])}));c.M[m].kits.forEach(k=>o[m].push(['kit','',k[0],k[1],'']));for(const k in c.M[m].keys)if(c.M[m].keys[k])o[m].push(['key',k,c.M[m].keys[k],'','']);}console.log(JSON.stringify(o))"])
d=json.loads(s);bad=0
for m,rows in d.items():
  t=txt[m];miss=[]
  for a,i,pn,desc,q in rows:
    for p in re.split(r'\s*/\s*',pn):
      if p and p not in t: miss.append((a,i,pn,desc))
  print(m,len(rows),'checked,',len(miss),'not found');[print('  ',x) for x in miss[:40]];bad+=len(miss)
