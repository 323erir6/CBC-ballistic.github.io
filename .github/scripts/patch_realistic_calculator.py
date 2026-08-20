from pathlib import Path
import re

cbc_path = Path("cbc_realistic_ballistics.js")
app_path = Path("app.js")
index_path = Path("index.html")

cbc = cbc_path.read_text(encoding="utf-8")
app = app_path.read_text(encoding="utf-8")
index = index_path.read_text(encoding="utf-8")

MARKER = "REALISTIC_CALCULATOR_FIX_20260820_V3"

if MARKER in app:
    print("Patch already applied; nothing to change.")
    raise SystemExit(0)

new_sim = r'''function sim(P,Y,S,T,V,c,pathOn){
  let y=Y*Math.PI/180,p=P*Math.PI/180,cp=Math.cos(p);
  let dir=[Math.sin(y)*cp,Math.sin(p),Math.cos(y)*cp];
  let v=[dir[0]*V,dir[1]*V,dir[2]*V];
  let L=Math.max(0,Number(c.barrelLength)||0);
  let x=[S[0]+dir[0]*L,S[1]+dir[1]*L,S[2]+dir[2]*L];
  let dx=T[0]-S[0],dz=T[2]-S[2],R=Math.hypot(dx,dz);
  if(!(R>0))return{ok:false,yError:Infinity,crossError:Infinity,ticks:-1,path:null};
  let ux=dx/R,uz=dz/R,rx=uz,rz=-ux;
  let path=pathOn?[{x:0,y:0}]:null;
  if(pathOn&&L>0)path.push({x:Math.hypot(x[0]-S[0],x[2]-S[2]),y:x[1]-S[1]});
  let pa=(x[0]-S[0])*ux+(x[2]-S[2])*uz,px=[...x];
  if(pa>=R)return{ok:false,yError:Infinity,crossError:Infinity,ticks:-1,path};
  let mx=Math.min(20000,Math.max(1,c.maxTicks||2000));
  for(let t=0;t<mx;t++){
    let a=ac(x,v,t,c),n=[x[0]+v[0]+a[0]*.5,x[1]+v[1]+a[1]*.5,x[2]+v[2]+a[2]*.5];
    let q=(n[0]-S[0])*ux+(n[2]-S[2])*uz;
    if(pathOn)path.push({x:Math.hypot(n[0]-S[0],n[2]-S[2]),y:n[1]-S[1]});
    if(q>=R&&pa<R){
      let f=(R-pa)/Math.max(1e-12,q-pa);
      let hit=[lr(px[0],n[0],f),lr(px[1],n[1],f),lr(px[2],n[2],f)];
      return{ok:true,yError:hit[1]-T[1],crossError:(hit[0]-T[0])*rx+(hit[2]-T[2])*rz,ticks:t+f,position:hit,path};
    }
    pa=q;px=x;x=n;v=[v[0]+a[0],v[1]+a[1],v[2]+a[2]];
    if(t>10&&x[1]<Math.min(S[1],T[1])-512&&v[1]<0)break;
  }
  return{ok:false,yError:Infinity,crossError:Infinity,ticks:-1,path};
}'''

new_solve = r'''function refinePitchBracket(lo,hi,B,S,T,V,c){
  let a=sim(lo,B,S,T,V,c,false),b=sim(hi,B,S,T,V,c,false);
  if(!a.ok||!b.ok)return null;
  if(Math.abs(a.yError)<1e-8)return lo;
  if(Math.abs(b.yError)<1e-8)return hi;
  if(a.yError*b.yError>0)return null;
  for(let i=0;i<22;i++){
    let mid=(lo+hi)*.5,m=sim(mid,B,S,T,V,c,false);
    if(!m.ok){hi=mid;continue}
    if(Math.abs(m.yError)<1e-8)return mid;
    if(a.yError*m.yError<=0){hi=mid;b=m}else{lo=mid;a=m}
  }
  return(lo+hi)*.5;
}
function highestReachablePitch(lo,hi,B,S,T,V,c){
  let a=sim(lo,B,S,T,V,c,false);
  if(!a.ok)return null;
  let b=sim(hi,B,S,T,V,c,false);
  if(b.ok)return{pitch:hi,result:b};
  let bestPitch=lo,best=a;
  for(let i=0;i<22;i++){
    let mid=(lo+hi)*.5,m=sim(mid,B,S,T,V,c,false);
    if(m.ok){lo=mid;bestPitch=mid;best=m}else{hi=mid}
  }
  return{pitch:bestPitch,result:best};
}
function solve(S,T,V,c,arc){
  let dx=T[0]-S[0],dz=T[2]-S[2],R=Math.hypot(dx,dz);
  if(!(R>0)||!(V>0))return{ok:false,low:null,high:null,selected:null};
  let B=Math.atan2(dx,dz)*180/Math.PI;
  let minPitch=Math.max(-89,Number.isFinite(c.minPitch)?c.minPitch:-30);
  let maxPitch=Math.min(89,Number.isFinite(c.maxPitch)?c.maxPitch:89);
  if(!(maxPitch>minPitch))return{ok:false,low:null,high:null,selected:null};

  const step=.25;
  let samples=[],roots=[],lastValid=null,firstInvalidAfterValid=null,seenValid=false;
  for(let p=minPitch;p<=maxPitch+1e-9;p+=step){
    let pp=Math.min(p,maxPitch),q=sim(pp,B,S,T,V,c,false);
    if(q.ok&&Number.isFinite(q.yError)){
      seenValid=true;
      let sample={pitch:pp,error:q.yError};
      samples.push(sample);
      lastValid=sample;
    }else if(seenValid){
      firstInvalidAfterValid=pp;
      break;
    }
    if(pp===maxPitch)break;
  }

  for(let i=0;i<samples.length;i++){
    let a=samples[i];
    if(Math.abs(a.error)<1e-6)roots.push(a.pitch);
    if(i===0)continue;
    let b=samples[i-1];
    if(a.pitch-b.pitch<=step*1.5&&b.error*a.error<0){
      let root=refinePitchBracket(b.pitch,a.pitch,B,S,T,V,c);
      if(root!==null)roots.push(root);
    }
  }

  // The upper trajectory often sits in a very narrow interval immediately
  // before the pitch at which horizontal range becomes unreachable. A fixed
  // angle scan can skip it completely. Locate that reachability boundary by
  // bisection and use it as the high-side sample for the upper root.
  if(lastValid){
    let boundary=null;
    if(firstInvalidAfterValid!==null){
      boundary=highestReachablePitch(lastValid.pitch,firstInvalidAfterValid,B,S,T,V,c);
    }else{
      let q=sim(maxPitch,B,S,T,V,c,false);
      if(q.ok)boundary={pitch:maxPitch,result:q};
    }
    if(boundary&&Number.isFinite(boundary.result.yError)){
      if(Math.abs(boundary.result.yError)<1e-6){
        roots.push(boundary.pitch);
      }else if(boundary.result.yError<0){
        for(let i=samples.length-1;i>=0;i--){
          let a=samples[i];
          if(a.pitch>=boundary.pitch)continue;
          if(a.error>0){
            let root=refinePitchBracket(a.pitch,boundary.pitch,B,S,T,V,c);
            if(root!==null)roots.push(root);
            break;
          }
        }
      }
    }
  }

  roots.sort((a,b)=>a-b);
  roots=roots.filter((p,i)=>i===0||Math.abs(p-roots[i-1])>.02);

  if(!roots.length&&samples.length){
    let best=samples.reduce((a,b)=>Math.abs(a.error)<=Math.abs(b.error)?a:b);
    let candidate=rf(best.pitch,B,S,T,V,c);
    if(candidate&&candidate.miss<=Math.max(1,c.allowedMiss||1))roots.push(candidate.pitchDeg);
  }

  let r=roots.map(p=>rf(p,B,S,T,V,c)).filter(Boolean).sort((a,b)=>a.pitchDeg-b.pitchDeg);
  r=r.filter((v,i)=>i===0||Math.abs(v.pitchDeg-r[i-1].pitchDeg)>.02);
  if(!r.length)return{ok:false,low:null,high:null,selected:null};
  let low=r[0],high=r.length>1?r[r.length-1]:null;
  let selected=arc==="high"?high:low;
  return{ok:Boolean(selected&&selected.miss<=Math.max(1,c.allowedMiss||1)),low,high,selected};
}'''

new_sr = r'''function sr(P,Y,S,V,c){
  let p=P*Math.PI/180,y=Y*Math.PI/180,cp=Math.cos(p);
  let dir=[Math.sin(y)*cp,Math.sin(p),Math.cos(y)*cp];
  let v=[dir[0]*V,dir[1]*V,dir[2]*V];
  let L=Math.max(0,Number(c.barrelLength)||0);
  let x=[S[0]+dir[0]*L,S[1]+dir[1]*L,S[2]+dir[2]*L],pr=[...x];
  let mx=Math.min(20000,Math.max(1,c.maxTicks||2000));
  for(let t=0;t<mx;t++){
    let a=ac(x,v,t,c),n=[x[0]+v[0]+a[0]*.5,x[1]+v[1]+a[1]*.5,x[2]+v[2]+a[2]*.5];
    if(t>0&&n[1]<=S[1]){
      let den=pr[1]-n[1];
      let f=Math.abs(den)>1e-12?(pr[1]-S[1])/den:0;
      f=Math.max(0,Math.min(1,f));
      let xx=lr(pr[0],n[0],f),z=lr(pr[2],n[2],f);
      return{range:Math.hypot(xx-S[0],z-S[2]),ticks:t+f};
    }
    pr=x;x=n;v=[v[0]+a[0],v[1]+a[1],v[2]+a[2]];
  }
  return{range:NaN,ticks:-1};
}'''

cbc, n = re.subn(r"function sim\(P,Y,S,T,V,c,pathOn\)\{.*?\}\nfunction rf", new_sim + "\nfunction rf", cbc, count=1, flags=re.S)
if n != 1:
    raise SystemExit("Could not replace realistic sim()")
cbc, n = re.subn(r"function solve\(S,T,V,c,arc\)\{.*?\}\nfunction sr", new_solve + "\nfunction sr", cbc, count=1, flags=re.S)
if n != 1:
    raise SystemExit("Could not replace realistic solve()")
cbc, n = re.subn(r"function sr\(P,Y,S,V,c\)\{.*?\}\nfunction maximumRange", new_sr + "\nfunction maximumRange", cbc, count=1, flags=re.S)
if n != 1:
    raise SystemExit("Could not replace realistic sr()")

# Translation for the manual Calculate button.
app = app.replace('    reset: "Reset",', '    reset: "Reset",\n    calculate: "Calculate",', 1)
app = app.replace('    reset: "Сброс",', '    reset: "Сброс",\n    calculate: "Рассчитать",', 1)
app = app.replace('    reset: "Скинути",', '    reset: "Скинути",\n    calculate: "Розрахувати",', 1)

# Realistic mode must be allowed to search the complete upper trajectory.
old = '  const amaxLimit = calculatorType === "mianbao" ? 89 : 60;'
if old not in app:
    raise SystemExit("Could not patch realistic maximum pitch")
app = app.replace(old,
    '  const realisticMode = calculatorType === "cbc" && $("method")?.value === "realistic";\n'
    '  const amaxLimit = calculatorType === "mianbao" || realisticMode ? 89 : 60;', 1)

# Pass the entered cannon length into the realistic simulation. It is used as
# the pivot/cannon-coordinate -> muzzle distance along the solved barrel vector.
old = '    solidFraction: num("solidFraction"),\n    windEnabled:'
if old not in app:
    raise SystemExit("Could not add realistic barrel length")
app = app.replace(old,
    '    solidFraction: num("solidFraction"),\n'
    '    barrelLength: Math.max(0, opts.length),\n'
    '    windEnabled:', 1)

# Seed is meaningful only when absolute coordinates are supplied. There are two
# duplicate updateInputMode definitions in the current site; patch both safely.
app = app.replace(
    '  const coordsEl = $("coordsGroup");\n  if (use) {',
    '  const coordsEl = $("coordsGroup");\n'
    '  const worldSeedEl = $("worldSeed");\n'
    '  if (worldSeedEl) {\n'
    '    worldSeedEl.disabled = !use;\n'
    '    worldSeedEl.title = use ? "" : "Enable coordinate input to use the world seed";\n'
    '  }\n'
    '  if (use) {'
)

helper = f'''\n// {MARKER}\nfunction isRealisticMode() {{\n  return $("calculatorType")?.value === "cbc" && $("method")?.value === "realistic";\n}}\n\nfunction renderAfterInputChange() {{\n  if (isRealisticMode()) {{\n    clearOutputs();\n    setStatus(t("calculate"), "");\n    drawTrajectory(null, collectOptions());\n    return;\n  }}\n  render();\n}}\n'''
if "function render() {" not in app:
    raise SystemExit("render() not found")
app = app.replace("\nfunction render() {", helper + "\nfunction render() {", 1)

app = app.replace('source: "CBC Realistic Ballistics 1.3.2 browser port",', 'source: "CBC Realistic Ballistics 1.3.3 browser port",', 1)
app = app.replace(
    'note: "Matches the mod\'s static seed-derived wind and aerodynamic trajectory model.",',
    'note: "Matches the mod trajectory model. Flight begins at the muzzle computed from cannon coordinates, solved yaw/pitch and total cannon length.",',
    1
)

# Do not launch the expensive realistic solver because of language/UI changes.
app = app.replace(
    '  syncCannonVelocity();\n  render();\n}\n\nfunction fillProjectiles',
    '  syncCannonVelocity();\n  renderAfterInputChange();\n}\n\nfunction fillProjectiles',
    1
)

old_listener = '''fields.forEach((id) => {\n  const el = $(id);\n  if (!el || id === "method" || id === "projectile") return;\n  const update = () => {\n    if (id === "length") syncCannonVelocity();\n    render();\n  };\n  el.addEventListener("input", update);\n  el.addEventListener("change", update);\n});'''
new_listener = '''fields.forEach((id) => {\n  const el = $(id);\n  if (!el || id === "method" || id === "projectile") return;\n  const update = () => {\n    if (id === "length") syncCannonVelocity();\n    renderAfterInputChange();\n  };\n  el.addEventListener("input", update);\n  el.addEventListener("change", update);\n});'''
if old_listener not in app:
    raise SystemExit("Could not replace input listeners")
app = app.replace(old_listener, new_listener, 1)

old = 'if ($("useCoords")) $("useCoords").addEventListener("change", () => { updateInputMode(); render(); });'
if old not in app:
    raise SystemExit("Could not replace coordinate-mode listener")
app = app.replace(old,
    'if ($("useCoords")) $("useCoords").addEventListener("change", () => { updateInputMode(); renderAfterInputChange(); });',
    1
)

method_old = '''if ($("method")) $("method").addEventListener("change", () => {\n  if ($("method").value === "realistic") syncRealisticProjectileDefaults();\n  syncCannonVelocity();\n  updateUIForMethod();\n  render();\n});'''
method_new = '''if ($("method")) $("method").addEventListener("change", () => {\n  if ($("method").value === "realistic") {\n    syncRealisticProjectileDefaults();\n    if (num("amax") === 60) $("amax").value = 89;\n  } else if (num("amax") === 89) {\n    $("amax").value = 60;\n  }\n  syncCannonVelocity();\n  updateUIForMethod();\n  updateInputMode();\n  renderAfterInputChange();\n});'''
if method_old not in app:
    raise SystemExit("Could not replace method listener")
app = app.replace(method_old, method_new, 1)

projectile_old = '''if ($("projectile")) $("projectile").addEventListener("change", () => {\n  if ($("method").value === "realistic") syncRealisticProjectileDefaults();\n  syncCannonVelocity();\n  updateUIForMethod();\n  render();\n});'''
projectile_new = '''if ($("projectile")) $("projectile").addEventListener("change", () => {\n  if ($("method").value === "realistic") syncRealisticProjectileDefaults();\n  syncCannonVelocity();\n  updateUIForMethod();\n  renderAfterInputChange();\n});'''
if projectile_old not in app:
    raise SystemExit("Could not replace projectile listener")
app = app.replace(projectile_old, projectile_new, 1)

cannon_old = '''if ($("cannonProfile")) $("cannonProfile").addEventListener("change", () => {\n  fillProjectiles($("projectile").value);\n  syncRealisticProjectileDefaults();\n  syncCannonVelocity();\n  render();\n});'''
cannon_new = '''if ($("cannonProfile")) $("cannonProfile").addEventListener("change", () => {\n  fillProjectiles($("projectile").value);\n  syncRealisticProjectileDefaults();\n  syncCannonVelocity();\n  renderAfterInputChange();\n});'''
if cannon_old not in app:
    raise SystemExit("Could not replace cannon listener")
app = app.replace(cannon_old, cannon_new, 1)

calc_old = '''if ($("calculatorType")) $("calculatorType").addEventListener("change", () => {\n  if ($("calculatorType").value === "mianbao" && num("amax") === 60) $("amax").value = 89;\n  if ($("calculatorType").value === "cbc" && num("amax") === 89) $("amax").value = 60;\n  updateCalculatorType();\n  syncCannonVelocity();\n  render();\n});'''
calc_new = '''if ($("calculatorType")) $("calculatorType").addEventListener("change", () => {\n  if ($("calculatorType").value === "mianbao" && num("amax") === 60) $("amax").value = 89;\n  if ($("calculatorType").value === "cbc" && $("method")?.value !== "realistic" && num("amax") === 89) $("amax").value = 60;\n  updateCalculatorType();\n  updateInputMode();\n  syncCannonVelocity();\n  renderAfterInputChange();\n});'''
if calc_old not in app:
    raise SystemExit("Could not replace calculator-type listener")
app = app.replace(calc_old, calc_new, 1)

old = '$("resetBtn").addEventListener("click", resetDefaults);\napplyLanguage(lang);'
if old not in app:
    raise SystemExit("Could not add Calculate listener")
app = app.replace(old,
    '$("resetBtn").addEventListener("click", resetDefaults);\n'
    'if ($("calculateBtn")) $("calculateBtn").addEventListener("click", render);\n'
    'applyLanguage(lang);',
    1
)

button = '\n          <button class="ghost method-realistic" type="button" id="calculateBtn" data-i18n="calculate" style="width:100%;margin-top:12px;">Calculate</button>'
needle = '          </details>\n        </form>'
if needle not in index:
    raise SystemExit("Could not insert Calculate button")
index = index.replace(needle, '          </details>' + button + '\n        </form>', 1)

index = index.replace('cbc_realistic_ballistics.js?v=20260815-4', 'cbc_realistic_ballistics.js?v=20260820-5')
index = index.replace('app.js?v=20260815-5', 'app.js?v=20260820-5')

cbc_path.write_text(cbc, encoding="utf-8")
app_path.write_text(app, encoding="utf-8")
index_path.write_text(index, encoding="utf-8")
print("Realistic calculator patch applied.")
