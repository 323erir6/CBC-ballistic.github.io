from pathlib import Path

CBC = Path('cbc_realistic_ballistics.js')
INDEX = Path('index.html')

cbc = CBC.read_text(encoding='utf-8')
index = INDEX.read_text(encoding='utf-8')

MARKER = 'REALISTIC_HIGH_ARC_ACCURACY_20260820_V2'
if MARKER in cbc:
    print('High arc accuracy patch already applied')
    raise SystemExit(0)

rf_anchor = 'function rf(P,Y,S,T,V,c){'
if rf_anchor not in cbc:
    raise SystemExit('rf anchor not found')

high_helpers = r'''// REALISTIC_HIGH_ARC_ACCURACY_20260820_V2
// High arc uses correctly aligned crossing interpolation. The historical sim()
// is intentionally left untouched so the empirically best low arc stays exact.
function simHigh(P,Y,S,T,V,c,pathOn){let y=Y*Math.PI/180,p=P*Math.PI/180,h=Math.cos(p)*V,v=[Math.sin(y)*h,Math.sin(p)*V,Math.cos(y)*h],x=[...S],dx=T[0]-S[0],dz=T[2]-S[2],R=Math.hypot(dx,dz),ux=dx/R,uz=dz/R,rx=uz,rz=-ux,path=pathOn?[{x:0,y:0}]:null,pa=0,mx=Math.min(20000,Math.max(1,c.maxTicks||2000));for(let t=0;t<mx;t++){let a=ac(x,v,t,c),n=[x[0]+v[0]+a[0]*.5,x[1]+v[1]+a[1]*.5,x[2]+v[2]+a[2]*.5],q=(n[0]-S[0])*ux+(n[2]-S[2])*uz;if(pathOn)path.push({x:Math.hypot(n[0]-S[0],n[2]-S[2]),y:n[1]-S[1]});if(q>=R&&pa<R){let f=(R-pa)/Math.max(1e-12,q-pa),hit=[lr(x[0],n[0],f),lr(x[1],n[1],f),lr(x[2],n[2],f)];return{ok:true,yError:hit[1]-T[1],crossError:(hit[0]-T[0])*rx+(hit[2]-T[2])*rz,ticks:t+f,position:hit,path}}pa=q;x=n;v=[v[0]+a[0],v[1]+a[1],v[2]+a[2]];if(t>10&&x[1]<Math.min(S[1],T[1])-512&&v[1]<0)break}return{ok:false,yError:Infinity,crossError:Infinity,ticks:-1,path}}
function rfHigh(P,Y,S,T,V,c){for(let i=0;i<16;i++){let b=simHigh(P,Y,S,T,V,c,false);if(!b.ok)return null;if(Math.hypot(b.yError,b.crossError)<.01)break;let st=.05,ps=simHigh(P+st,Y,S,T,V,c,false),ys=simHigh(P,Y+st,S,T,V,c,false);if(!ps.ok||!ys.ok)break;let a=(ps.yError-b.yError)/st,bb=(ys.yError-b.yError)/st,cc=(ps.crossError-b.crossError)/st,d=(ys.crossError-b.crossError)/st,det=a*d-bb*cc;if(Math.abs(det)<1e-9)break;P+=Math.max(-2,Math.min(2,(-b.yError*d+bb*b.crossError)/det));Y+=Math.max(-2,Math.min(2,(-a*b.crossError+b.yError*cc)/det));P=Math.max(c.minPitch,Math.min(c.maxPitch,P))}let f=simHigh(P,Y,S,T,V,c,true);return f.ok?{pitchDeg:P,yawDeg:Y,miss:Math.hypot(f.yError,f.crossError),...f}:null}
'''
cbc = cbc.replace(rf_anchor, high_helpers + rf_anchor, 1)

old_scan = 'for(let p=Math.max(60.25,c.minPitch);p<=c.maxPitch+1e-9;p+=.25){let q=sim(p,B,S,T,V,hc,false);'
new_scan = 'for(let p=Math.max(60.25,c.minPitch);p<=c.maxPitch+1e-9;p+=.25){let q=simHigh(p,B,S,T,V,hc,false);'
if old_scan not in cbc:
    raise SystemExit('high scan anchor not found')
cbc = cbc.replace(old_scan, new_scan, 1)

old_candidates = 'let candidates=hr.map(p=>rf(p,B,S,T,V,hc)).filter(Boolean).filter(x=>x.pitchDeg>60).sort((a,b)=>a.pitchDeg-b.pitchDeg);'
new_candidates = 'let candidates=hr.map(p=>rfHigh(p,B,S,T,V,hc)).filter(Boolean).filter(x=>x.pitchDeg>60&&x.miss<=Math.max(1,hc.allowedMiss||1)).sort((a,b)=>a.pitchDeg-b.pitchDeg);'
if old_candidates not in cbc:
    raise SystemExit('high candidates anchor not found')
cbc = cbc.replace(old_candidates, new_candidates, 1)

old_max = 'function maximumRange(S,V,c,Y){let b={range:-Infinity,pitchDeg:null,ticks:-1};for(let p=Math.max(0,c.minPitch);p<=Math.min(89,c.maxPitch);p++){let r=sr(p,Y,S,V,c);if(r.range>b.range)b={...r,pitchDeg:p}}if(b.pitchDeg===null)return null;for(let p=Math.max(c.minPitch,b.pitchDeg-1);p<=Math.min(c.maxPitch,b.pitchDeg+1);p+=.1){let r=sr(p,Y,S,V,c);if(r.range>b.range)b={...r,pitchDeg:p}}return b}'
new_max = 'function maximumRange(S,V,c,Y){let rc={...c,maxTicks:Math.max(10000,c.maxTicks||0)},b={range:-Infinity,pitchDeg:null,ticks:-1};for(let p=Math.max(0,c.minPitch);p<=Math.min(89,c.maxPitch);p++){let r=sr(p,Y,S,V,rc);if(r.range>b.range)b={...r,pitchDeg:p}}if(b.pitchDeg===null)return null;for(let p=Math.max(c.minPitch,b.pitchDeg-1);p<=Math.min(c.maxPitch,b.pitchDeg+1);p+=.1){let r=sr(p,Y,S,V,rc);if(r.range>b.range)b={...r,pitchDeg:p}}return b}'
if old_max not in cbc:
    raise SystemExit('maximumRange anchor not found')
cbc = cbc.replace(old_max, new_max, 1)

old_cache = 'cbc_realistic_ballistics.js?v=20260820-higharc1'
if old_cache not in index:
    raise SystemExit('cache-bust anchor not found')
index = index.replace(old_cache, 'cbc_realistic_ballistics.js?v=20260820-higharc2', 1)

CBC.write_text(cbc, encoding='utf-8')
INDEX.write_text(index, encoding='utf-8')
print('Applied isolated High arc interpolation/refinement fix and full-duration maximum range')
