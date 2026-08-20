from pathlib import Path
import re

APP = Path('app.js')
PHYSICS = Path('cbc_realistic_ballistics.js')
INDEX = Path('index.html')

app = APP.read_text(encoding='utf-8')
physics = PHYSICS.read_text(encoding='utf-8')
index = INDEX.read_text(encoding='utf-8')

MARKER = 'REALISTIC_HIGH_ARC_ISOLATED_20260820_V1'
if MARKER in physics:
    print('High-arc patch already applied')
    raise SystemExit(0)

# Allow CBC Realistic to expose 89 degrees while preserving the old 60-degree
# limit for New Ballistics. The low-arc solver itself remains capped at 60.
old = '''  // CBC motors in this calculator are limited to +60; Mianbao launchers may
  // use the full elevation range configured by the user.
  const aminVal = num("amin");
  const amaxRaw = num("amax");
  const amaxLimit = calculatorType === "mianbao" ? 89 : 60;
  const amaxVal = Number.isFinite(amaxRaw) ? Math.min(amaxRaw, amaxLimit) : amaxLimit;'''
new = '''  // Keep the legacy/New Ballistics motor limit at +60. CBC Realistic may
  // search a separate high arc up to +89 without changing its low-arc scan.
  const aminVal = num("amin");
  const amaxRaw = num("amax");
  const realisticMode = calculatorType === "cbc" && $("method")?.value === "realistic";
  const amaxLimit = calculatorType === "mianbao" || realisticMode ? 89 : 60;
  const amaxVal = Number.isFinite(amaxRaw) ? Math.min(amaxRaw, amaxLimit) : amaxLimit;'''
if old not in app:
    raise SystemExit('collectOptions amax block not found')
app = app.replace(old, new, 1)

# When switching into Realistic, use 89 as its normal upper limit. Switching
# back to New Ballistics restores the historical 60-degree value.
old = '''if ($("method")) $("method").addEventListener("change", () => {
  if ($("method").value === "realistic") syncRealisticProjectileDefaults();
  syncCannonVelocity();
  updateUIForMethod();
  updateSeedVisibility();
  renderAfterInputChange();
});'''
new = '''if ($("method")) $("method").addEventListener("change", () => {
  if ($("method").value === "realistic") {
    if (num("amax") === 60) $("amax").value = 89;
    syncRealisticProjectileDefaults();
  } else if (num("amax") === 89) {
    $("amax").value = 60;
  }
  syncCannonVelocity();
  updateUIForMethod();
  updateSeedVisibility();
  renderAfterInputChange();
});'''
if old not in app:
    raise SystemExit('method change listener not found')
app = app.replace(old, new, 1)

old = '''if ($("calculatorType")) $("calculatorType").addEventListener("change", () => {
  if ($("calculatorType").value === "mianbao" && num("amax") === 60) $("amax").value = 89;
  if ($("calculatorType").value === "cbc" && num("amax") === 89) $("amax").value = 60;
  updateCalculatorType();
  updateSeedVisibility();
  syncCannonVelocity();
  renderAfterInputChange();
});'''
new = '''if ($("calculatorType")) $("calculatorType").addEventListener("change", () => {
  const realisticCbc = $("calculatorType").value === "cbc" && $("method").value === "realistic";
  if (($("calculatorType").value === "mianbao" || realisticCbc) && num("amax") === 60) $("amax").value = 89;
  if ($("calculatorType").value === "cbc" && !realisticCbc && num("amax") === 89) $("amax").value = 60;
  updateCalculatorType();
  updateSeedVisibility();
  syncCannonVelocity();
  renderAfterInputChange();
});'''
if old not in app:
    raise SystemExit('calculator type listener not found')
app = app.replace(old, new, 1)

old_solve = '''function solve(S,T,V,c,arc){let dx=T[0]-S[0],dz=T[2]-S[2],R=Math.hypot(dx,dz);if(!(R>0)||!(V>0))return{ok:false};let B=Math.atan2(dx,dz)*180/Math.PI,s=[];for(let p=c.minPitch;p<=c.maxPitch;p++){let q=sim(p,B,S,T,V,c,false);if(q.ok&&Number.isFinite(q.yError))s.push({pitch:p,error:q.yError})}let roots=[];for(let i=1;i<s.length;i++){let a=s[i-1],b=s[i];if(a.error===0||a.error*b.error<=0)roots.push(lr(a.pitch,b.pitch,Math.abs(a.error)/Math.max(1e-12,Math.abs(a.error)+Math.abs(b.error))))}if(!roots.length&&s.length){s.sort((a,b)=>Math.abs(a.error)-Math.abs(b.error));roots.push(s[0].pitch)}let r=roots.map(p=>rf(p,B,S,T,V,c)).filter(Boolean).sort((a,b)=>a.pitchDeg-b.pitchDeg);if(!r.length)return{ok:false};let low=r[0],high=r.length>1?r[r.length-1]:null,selected=arc==="high"&&high?high:low;return{ok:selected.miss<=Math.max(1,c.allowedMiss||1),low,high,selected}}'''
new_solve = '''// REALISTIC_HIGH_ARC_ISOLATED_20260820_V1
function solve(S,T,V,c,arc){let dx=T[0]-S[0],dz=T[2]-S[2],R=Math.hypot(dx,dz);if(!(R>0)||!(V>0))return{ok:false};let B=Math.atan2(dx,dz)*180/Math.PI;
// Preserve the historical low-trajectory search byte-for-byte in behaviour:
// same integer pitches, same <=60 degree ceiling, same maxTicks and same rf().
let lowScanMax=Math.min(c.maxPitch,60),s=[];for(let p=c.minPitch;p<=lowScanMax;p++){let q=sim(p,B,S,T,V,c,false);if(q.ok&&Number.isFinite(q.yError))s.push({pitch:p,error:q.yError})}let roots=[];for(let i=1;i<s.length;i++){let a=s[i-1],b=s[i];if(a.error===0||a.error*b.error<=0)roots.push(lr(a.pitch,b.pitch,Math.abs(a.error)/Math.max(1e-12,Math.abs(a.error)+Math.abs(b.error))))}if(!roots.length&&s.length){s.sort((a,b)=>Math.abs(a.error)-Math.abs(b.error));roots.push(s[0].pitch)}let r=roots.map(p=>rf(p,B,S,T,V,c)).filter(Boolean).sort((a,b)=>a.pitchDeg-b.pitchDeg);if(!r.length)return{ok:false};let low=r[0],high=r.length>1?r[r.length-1]:null;
// Only if the old <=60 degree scan did not already find a second root, search
// the high-angle region separately. This cannot replace or refine `low`.
if(!high&&c.maxPitch>60){let hc={...c,maxTicks:Math.max(10000,c.maxTicks||0)},hs=[];for(let p=Math.max(60.25,c.minPitch);p<=c.maxPitch+1e-9;p+=.25){let q=sim(p,B,S,T,V,hc,false);if(q.ok&&Number.isFinite(q.yError))hs.push({pitch:p,error:q.yError})}let hr=[];for(let i=1;i<hs.length;i++){let a=hs[i-1],b=hs[i];if(a.error===0||a.error*b.error<=0)hr.push(lr(a.pitch,b.pitch,Math.abs(a.error)/Math.max(1e-12,Math.abs(a.error)+Math.abs(b.error))))}if(!hr.length&&hs.length){hs.sort((a,b)=>Math.abs(a.error)-Math.abs(b.error));hr.push(hs[0].pitch)}let candidates=hr.map(p=>rf(p,B,S,T,V,hc)).filter(Boolean).filter(x=>x.pitchDeg>60).sort((a,b)=>a.pitchDeg-b.pitchDeg);if(candidates.length)high=candidates[candidates.length-1]}
let selected=arc==="high"&&high?high:low;return{ok:selected.miss<=Math.max(1,c.allowedMiss||1),low,high,selected}}'''
if old_solve not in physics:
    raise SystemExit('exact Realistic solve() block not found; refusing to alter physics unexpectedly')
physics = physics.replace(old_solve, new_solve, 1)

# Cache bust only; no other HTML changes.
index = re.sub(r'cbc_realistic_ballistics\.js\?v=[^"\']+', 'cbc_realistic_ballistics.js?v=20260820-higharc1', index, count=1)
index = re.sub(r'app\.js\?v=[^"\']+', 'app.js?v=20260820-higharc1', index, count=1)

APP.write_text(app, encoding='utf-8')
PHYSICS.write_text(physics, encoding='utf-8')
INDEX.write_text(index, encoding='utf-8')
print('Applied isolated CBC Realistic high-arc search fix')
