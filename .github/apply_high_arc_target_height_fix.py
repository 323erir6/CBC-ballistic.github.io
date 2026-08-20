from pathlib import Path

cbc_path = Path('cbc_realistic_ballistics.js')
index_path = Path('index.html')
cbc = cbc_path.read_text(encoding='utf-8')
index = index_path.read_text(encoding='utf-8')

if 'REALISTIC_HIGH_ARC_TARGET_HEIGHT_20260820_V3' in cbc:
    print('Target-height High arc solver already applied')
    raise SystemExit(0)

start = cbc.index('// REALISTIC_HIGH_ARC_ACCURACY_20260820_V2')
end = cbc.index('function rf(P,Y,S,T,V,c)', start)

replacement = r'''// REALISTIC_HIGH_ARC_TARGET_HEIGHT_20260820_V3
// High arc is solved at the descending crossing of target Y. This is more
// robust than requiring every neighbouring trial angle to reach target XZ.
// The historical sim()/rf() path remains untouched for the low trajectory.
function simHigh(P,Y,S,T,V,c,pathOn){let y=Y*Math.PI/180,p=P*Math.PI/180,h=Math.cos(p)*V,v=[Math.sin(y)*h,Math.sin(p)*V,Math.cos(y)*h],x=[...S],dx=T[0]-S[0],dz=T[2]-S[2],R=Math.hypot(dx,dz),ux=dx/R,uz=dz/R,rx=uz,rz=-ux,path=pathOn?[{x:0,y:0}]:null,mx=Math.min(20000,Math.max(1,c.maxTicks||2000)),descending=false;for(let t=0;t<mx;t++){let a=ac(x,v,t,c),n=[x[0]+v[0]+a[0]*.5,x[1]+v[1]+a[1]*.5,x[2]+v[2]+a[2]*.5];if(pathOn)path.push({x:Math.hypot(n[0]-S[0],n[2]-S[2]),y:n[1]-S[1]});if(n[1]<x[1])descending=true;if(descending&&x[1]>=T[1]&&n[1]<=T[1]){let f=(x[1]-T[1])/Math.max(1e-12,x[1]-n[1]),hit=[lr(x[0],n[0],f),lr(x[1],n[1],f),lr(x[2],n[2],f)],q=(hit[0]-S[0])*ux+(hit[2]-S[2])*uz,ce=(hit[0]-T[0])*rx+(hit[2]-T[2])*rz,re=q-R;return{ok:true,rangeError:re,yError:0,crossError:ce,ticks:t+f,position:hit,path}}x=n;v=[v[0]+a[0],v[1]+a[1],v[2]+a[2]]}return{ok:false,rangeError:Infinity,yError:Infinity,crossError:Infinity,ticks:-1,path}}
function rfHigh(P,Y,S,T,V,c){for(let i=0;i<18;i++){let b=simHigh(P,Y,S,T,V,c,false);if(!b.ok)return null;if(Math.hypot(b.rangeError,b.crossError)<.01)break;let st=.05,ps=simHigh(P+st,Y,S,T,V,c,false),ys=simHigh(P,Y+st,S,T,V,c,false);if(!ps.ok||!ys.ok)break;let a=(ps.rangeError-b.rangeError)/st,bb=(ys.rangeError-b.rangeError)/st,cc=(ps.crossError-b.crossError)/st,d=(ys.crossError-b.crossError)/st,det=a*d-bb*cc;if(Math.abs(det)<1e-9)break;P+=Math.max(-2,Math.min(2,(-b.rangeError*d+bb*b.crossError)/det));Y+=Math.max(-2,Math.min(2,(-a*b.crossError+b.rangeError*cc)/det));P=Math.max(c.minPitch,Math.min(c.maxPitch,P))}let f=simHigh(P,Y,S,T,V,c,true);return f.ok?{pitchDeg:P,yawDeg:Y,miss:Math.hypot(f.rangeError,f.crossError),...f}:null}
'''
cbc = cbc[:start] + replacement + cbc[end:]

old_high = '''if(!high&&c.maxPitch>60){let hc={...c,maxTicks:Math.max(10000,c.maxTicks||0)},hs=[];for(let p=Math.max(60.25,c.minPitch);p<=c.maxPitch+1e-9;p+=.25){let q=simHigh(p,B,S,T,V,hc,false);if(q.ok&&Number.isFinite(q.yError))hs.push({pitch:p,error:q.yError})}let hr=[];for(let i=1;i<hs.length;i++){let a=hs[i-1],b=hs[i];if(a.error===0||a.error*b.error<=0)hr.push(lr(a.pitch,b.pitch,Math.abs(a.error)/Math.max(1e-12,Math.abs(a.error)+Math.abs(b.error))))}if(!hr.length&&hs.length){hs.sort((a,b)=>Math.abs(a.error)-Math.abs(b.error));hr.push(hs[0].pitch)}let candidates=hr.map(p=>rfHigh(p,B,S,T,V,hc)).filter(Boolean).filter(x=>x.pitchDeg>60&&x.miss<=Math.max(1,hc.allowedMiss||1)).sort((a,b)=>a.pitchDeg-b.pitchDeg);if(candidates.length)high=candidates[candidates.length-1]}'''
new_high = '''if(!high&&c.maxPitch>low.pitchDeg+.25){let hc={...c,maxTicks:Math.max(10000,c.maxTicks||0)},hs=[],startPitch=Math.max(c.minPitch,low.pitchDeg+.5);for(let p=startPitch;p<=c.maxPitch+1e-9;p+=.25){let q=simHigh(p,B,S,T,V,hc,false);if(q.ok&&Number.isFinite(q.rangeError))hs.push({pitch:p,error:q.rangeError})}let hr=[];for(let i=1;i<hs.length;i++){let a=hs[i-1],b=hs[i];if(a.error===0||a.error*b.error<=0)hr.push(lr(a.pitch,b.pitch,Math.abs(a.error)/Math.max(1e-12,Math.abs(a.error)+Math.abs(b.error))))}if(!hr.length&&hs.length){let nearest=[...hs].sort((a,b)=>Math.abs(a.error)-Math.abs(b.error))[0];if(nearest)hr.push(nearest.pitch)}let candidates=hr.map(p=>rfHigh(p,B,S,T,V,hc)).filter(Boolean).filter(x=>x.pitchDeg>low.pitchDeg+.25&&x.miss<=Math.max(1,hc.allowedMiss||1)).sort((a,b)=>a.pitchDeg-b.pitchDeg);if(candidates.length)high=candidates[candidates.length-1]}'''
if old_high not in cbc:
    raise SystemExit('old High search block not found')
cbc = cbc.replace(old_high, new_high, 1)

index = index.replace('cbc_realistic_ballistics.js?v=20260820-higharc2', 'cbc_realistic_ballistics.js?v=20260820-higharc3')

cbc_path.write_text(cbc, encoding='utf-8')
index_path.write_text(index, encoding='utf-8')
print('Applied target-height High arc solver; low sim/rf unchanged')
