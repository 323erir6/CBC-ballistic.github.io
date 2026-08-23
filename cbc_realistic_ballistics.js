"use strict";(function(g){
const TPS=20,O=7.2921159e-5,T53=9007199254740992;
const CANNONS=[
{id:"manual",name:"Custom / projectile native size",caliber:null},
{id:"cbc_big_cannon",name:"CBC Big Cannon (875 mm for standard CBC projectiles)",caliber:null},
{id:"cbc_drop_mortar",name:"CBC Drop Mortar",caliber:.120,velocityModel:"cbc_drop_mortar"},
{id:"cbc_autocannon",name:"CBC Autocannon (steel)",caliber:.02,velocityModel:"cbc_autocannon"},
{id:"military_small_single",name:"Military Supplement Small Single Cannon",caliber:.060,velocityModel:"military_dual"},
{id:"military_small_dual",name:"Military Supplement Small Dual Cannon",caliber:.060,velocityModel:"military_dual"},
{id:"military_small_medium_single",name:"Military Supplement Medium Single Cannon",caliber:.080,velocityModel:"military_dual"},
{id:"military_small_medium_dual",name:"Military Supplement Medium Dual Cannon",caliber:.080,velocityModel:"military_dual"},
{id:"military_large_single",name:"Military Supplement Large Cannon",caliber:.125,velocityModel:"military_dual"},
{id:"military_large_dual",name:"Military Supplement Giant Cannon",caliber:.180,velocityModel:"military_dual"},
{id:"military_torpedo_tube",name:"Military Supplement Torpedo Tube",caliber:.380,velocityModel:"military_torpedo"},
{id:"modern_medium_cannon",name:"CBC Modern Warfare Medium Cannon (steel)",caliber:.155,velocityModel:"modern_medium"},
{id:"modern_rotary_cannon",name:"CBC Modern Warfare Rotary Cannon (steel)",caliber:.02,velocityModel:"modern_rotary"},
{id:"modern_torpedo_tube",name:"CBC Modern Warfare Torpedo Tube",caliber:.380,velocityModel:"military_torpedo"},
{id:"cbc_at_heavy_autocannon",name:"CBC AT Heavy Autocannon (steel)",caliber:.045,velocityModel:"cbc_autocannon"},
{id:"cbc_at_twin_autocannon",name:"CBC AT Twin Autocannon (steel)",caliber:.02,velocityModel:"cbc_autocannon"},
{id:"cbc_at_vertical_twin_autocannon",name:"CBC AT Vertical Twin Autocannon (steel)",caliber:.02,velocityModel:"cbc_autocannon"},
{id:"cbc_at_rocket_pod",name:"CBC AT Rocket Pod (steel)",caliber:.070,velocityModel:"cbc_at_rocket"},
{id:"cbc_at_medium_rocket_rail",name:"CBC AT Medium Rocket Rail (steel)",caliber:.122,velocityModel:"cbc_at_rocket"},
{id:"cbcatfix_big_rocket_rail",name:"CBC AT Fix Big Rocket Rail (steel)",caliber:.240,velocityModel:"cbc_at_rocket"}];
const MR={"cbcmoreshells:aphe_bomb":.2,"cbcmoreshells:he_bomb":.2,"cbcmoreshells:aphe_bouncing_bomb":.2,"cbcmoreshells:he_bouncing_bomb":.2,"cbcmoreshells:aphe_rocket":2,"cbcmoreshells:he_rocket":2,"cbcmoreshells:dual_aphe_rocket":2,"cbcmoreshells:dual_he_rocket":2,"cbcmoreshells:aphe_loitering_rocket":.5,"cbcmoreshells:he_loitering_rocket":.5,"cbcmoreshells:racked_torpedo":.25,"cbcmoreshells:depth_charge":.2};
const MT={"cbcmoreshells:early_torpedo":.829,"cbcmoreshells:gambler_medium_range_torpedo":1.005,"cbcmoreshells:highspeed_long_range_torpedo":1.407,"cbcmoreshells:light_high_speed_torpedo":1.307,"cbcmoreshells:long_range_shrapnel_torpedo":1.09,"cbcmoreshells:long_range_torpedo":1.005,"cbcmoreshells:medium_range_deepwater_torpedo":1.055,"cbcmoreshells:medium_range_deepwater_torpedo_typeb":.97,"cbcmoreshells:medium_range_torpedo":1.055,"cbcmoreshells:medium_range_torpedo_typeb":1.15,"cbcmoreshells:primary_torpedo":.905,"cbcmoreshells:reductive_highspeed_torpedo":1.307,"cbcmoreshells:reductive_long_range_torpedo":1.005,"cbcmoreshells:reductive_medium_range_torpedo":1.055,"cbcmoreshells:reinforced_long_range_torpedo":.779,"cbcmoreshells:reinforced_medium_range_torpedo":.98,"cbcmoreshells:reinforced_reductive_medium_range_torpedo":1.005,"cbcmoreshells:reinforced_reductive_short_range_torpedo":.93,"cbcmoreshells:reinforced_short_range_torpedo":.955,"cbcmoreshells:short_range_torpedo":1.055,"cbcmoreshells:slow_long_range_torpedo":.678,"cbcmoreshells:ultraspeed_torpedo":1.482};
function bv(n,b,p,m,k){let c=Math.max(0,Math.floor(+n||0)-1);return(b*k+Math.min(c,m)*p*k)*TPS}
function fixedMuzzleVelocity(c,p,n){switch(CANNONS.find(x=>x.id===c)?.velocityModel){case"cbc_drop_mortar":return 6*TPS;case"military_dual":return 800;case"military_torpedo":return(MT[p]??1)*TPS;case"cbc_autocannon":return bv(n,3,1.5,4,1);case"modern_medium":return bv(n,3,1,11,1);case"modern_rotary":return bv(n,3,1.5,3,1);case"cbc_at_rocket":return bv(n,3,1.5,4,.5);default:return null}}
const RAW="arcon:bops_projectile,8|cbcatfix:flak_shell,2|cbcatfix:heat_shell,2|cbcatfix:heavy_he_shell,4|cbcatfix:hesh_shell,2.5|cbcmodernwarfare:ap_mediumshell,5|cbcmodernwarfare:apds_autocannon,3.5|cbcmodernwarfare:apds_mediumshell,5|cbcmodernwarfare:apds_shot,8|cbcmodernwarfare:apfsds_mediumshell,6|cbcmodernwarfare:aphe_mediumshell,4|cbcmodernwarfare:canister_autocannon,1|cbcmodernwarfare:canister_burst,0.25|cbcmodernwarfare:canister_mediumshell,1|cbcmodernwarfare:he_autocannon,1|cbcmodernwarfare:he_mediumshell,1|cbcmodernwarfare:heap_mediumshell,1|cbcmodernwarfare:heap_shell,2|cbcmodernwarfare:heat_jet,5|cbcmodernwarfare:hef_mediumshell,1|cbcmodernwarfare:hefrag_shell,2|cbcmodernwarfare:hvap_autocannon,2.5|cbcmodernwarfare:munitions_contraption,2|cbcmodernwarfare:smoke_grenade,0|cbcmodernwarfare:smoke_mediumshell,1|cbcmoreshells:airdropped_shrapnel_torpedo,0.1|cbcmoreshells:airdropped_torpedo,0.1|cbcmoreshells:antiair_he_shell,0.1|cbcmoreshells:antiair_machine_gun_bullet,0.5|cbcmoreshells:antiair_shrapnel_burst,8|cbcmoreshells:antiair_shrapnel_shell,0.1|cbcmoreshells:ap_super_heavy_shot,16.5|cbcmoreshells:apbc_shell,13|cbcmoreshells:apbc_shot,14|cbcmoreshells:apfsds_shot,14|cbcmoreshells:aphe_bomb,24|cbcmoreshells:aphe_bouncing_bomb,24|cbcmoreshells:aphe_cannon_rocket,7.5|cbcmoreshells:aphe_loitering_rocket,14|cbcmoreshells:aphe_rocket,14|cbcmoreshells:baguette_shot,8|cbcmoreshells:baked_apfsds_shot,7|cbcmoreshells:beef_noodle,0.1|cbcmoreshells:bubble_drink,14|cbcmoreshells:cannon_torpedo,0.1|cbcmoreshells:deepwater_shrapnel_torpedo,0.1|cbcmoreshells:depth_charge,0.1|cbcmoreshells:dual_aphe_rocket,13.5|cbcmoreshells:dual_he_rocket,0.1|cbcmoreshells:early_torpedo,0.1|cbcmoreshells:extended_antiair_he_shell,0.1|cbcmoreshells:extended_ap_shot,8|cbcmoreshells:gambler_medium_range_torpedo,0.1|cbcmoreshells:he_bomb,0.1|cbcmoreshells:he_bouncing_bomb,0.1|cbcmoreshells:he_cannon_rocket,0.1|cbcmoreshells:he_loitering_rocket,0.1|cbcmoreshells:he_rocket,0.1|cbcmoreshells:hesh_shell,0.1|cbcmoreshells:highspeed_long_range_torpedo,0.1|cbcmoreshells:highspeed_torpedo,0.1|cbcmoreshells:incendiary_he_shell,0.1|cbcmoreshells:inferior_he_shell,0.1|cbcmoreshells:light_high_speed_torpedo,0.1|cbcmoreshells:long_range_shrapnel_torpedo,0.1|cbcmoreshells:long_range_torpedo,0.1|cbcmoreshells:medium_range_deepwater_torpedo,0.1|cbcmoreshells:medium_range_deepwater_torpedo_typeb,0.1|cbcmoreshells:medium_range_torpedo,0.1|cbcmoreshells:medium_range_torpedo_typeb,0.1|cbcmoreshells:normal_antiair_he_shell,0.1|cbcmoreshells:normal_ap_shell,6.5|cbcmoreshells:normal_ap_shot,8.75|cbcmoreshells:normal_apbc_shell,6.25|cbcmoreshells:normal_he_shell,0.1|cbcmoreshells:normal_incendiary_he_shell,0.1|cbcmoreshells:normal_sap_shell,4.25|cbcmoreshells:primary_torpedo,0.1|cbcmoreshells:racked_torpedo,0.1|cbcmoreshells:reductive_highspeed_torpedo,0.1|cbcmoreshells:reductive_long_range_torpedo,0.1|cbcmoreshells:reductive_medium_range_torpedo,0.1|cbcmoreshells:reinforced_long_range_torpedo,0.1|cbcmoreshells:reinforced_medium_range_torpedo,0.1|cbcmoreshells:reinforced_reductive_medium_range_torpedo,0.1|cbcmoreshells:reinforced_reductive_short_range_torpedo,0.1|cbcmoreshells:reinforced_short_range_torpedo,0.1|cbcmoreshells:sap_shell,7.5|cbcmoreshells:sharpnel_torpedo,0.1|cbcmoreshells:shelless_ap_shot,5|cbcmoreshells:shelless_he_shell,0.1|cbcmoreshells:shelless_incendiary_he_shell,0.1|cbcmoreshells:shelless_sap_shell,5|cbcmoreshells:short_range_torpedo,0.1|cbcmoreshells:slow_long_range_torpedo,0.1|cbcmoreshells:torpedo_burst,12|cbcmoreshells:ultraspeed_torpedo,0.1|createbigcannons:ap_autocannon,2|createbigcannons:ap_shell,6|createbigcannons:ap_shot,8|createbigcannons:bag_of_grapeshot,2|createbigcannons:drop_mortar_shell,2|createbigcannons:flak_autocannon,1|createbigcannons:flak_burst,0.75|createbigcannons:fluid_blob_burst,0|createbigcannons:fluid_shell,2|createbigcannons:grapeshot_burst,1.5|createbigcannons:he_shell,2|createbigcannons:machine_gun_bullet,0.5|createbigcannons:mortar_stone,4|createbigcannons:shot,3|createbigcannons:shrapnel_burst,0.75|createbigcannons:shrapnel_shell,2|createbigcannons:smoke_shell,2|createbigcannons:traffic_cone,30|cbc_at:ap_rocket,2|cbc_at:flak_rocket,2|cbc_at:he_rocket,2|cbc_at:hei_rocket,2|cbc_at:medium_ap_rocket,3|cbc_at:medium_he_rocket,3|cbc_at:medium_hef_rocket,3|cbc_at:medium_heat_rocket,3|cbc_at:ha_ap_projectile,4|cbc_at:ha_apds_projectile,4|cbc_at:ha_apdsfs_projectile,4|cbc_at:ha_he_projectile,4|cbc_at:ha_hef_projectile,4|cbc_at:ha_heat_projectile,4|cbc_at:ha_smoke_projectile,4|cbc_at:ha_heat_copper_ray,0.25|cbc_at:apds_projectile,2|cbc_at:apdsfs_projectile,2|cbc_at:he_projectile,2|cbc_at:hei_projectile,2|cbc_at:cluster_projectile,2|vestalihy:ptur_jet,240".split("|").map(x=>{let i=x.lastIndexOf(",");return[x.slice(0,i),+x.slice(i+1)]});
const BIG=/^createbigcannons:(?:ap_shell|ap_shot|bag_of_grapeshot|fluid_shell|he_shell|shot|shrapnel_shell|smoke_shell|traffic_cone)$/;
function diam(id){let v=id.toLowerCase();if(/^createbigcannons:(?:drop_mortar_shell|mortar_stone)$/.test(v))return .120;if(/torpedo/.test(v)&&!/_burst$/.test(v))return .380;if(/^cbcatfix:big_(?:ap|he|heat)_rocket$/.test(v))return .240;if(/^cbc_at:medium_.*_rocket$/.test(v))return .122;if(/^cbc_at:(?:ap|flak|he|hei)_rocket$/.test(v))return .070;if(BIG.test(v))return .875;if(v.includes("mediumshell"))return .155;if(/^cbc_at:ha_.*_projectile$/.test(v))return .045;if(v.includes("autocannon")||v.includes("machine_gun")||/^cbc_at:(?:apds|apdsfs|he|hei|cluster)_projectile$/.test(v))return .02;if(/^cbcmoreshells:(?:normal_|extended_)/.test(v))return .060;return .8}
function cd(id){let v=id.toLowerCase();if(v.includes("traffic_cone"))return .9;if(v.includes("mortar")||v.includes("grapeshot"))return .47;if(v.includes("mediumshell")){if(v.includes("apfsds")||v.includes("apds"))return .18;if(v.includes("aphe")||v.includes(":ap_"))return .22;return .25}if(v==="createbigcannons:ap_shot"||v==="createbigcannons:shot"||/(?:^|_)ap_shot$/.test(v))return .28;if(v.includes("ap_shell")||v.includes("apshell"))return .22;if(v.includes("autocannon")||v.includes("machine_gun"))return .2;if(v.includes("shell"))return .25;return .3}
const EXTRA_PROJECTILES=[["cbcatfix:big_ap_rocket",4],["cbcatfix:big_he_rocket",4],["cbcatfix:big_heat_rocket",4]];
const PROJECTILES=RAW.concat(EXTRA_PROJECTILES).map(([id,referenceMass])=>({id,referenceMass,diameter:diam(id),cd:cd(id)})).sort((a,b)=>a.id.localeCompare(b.id)),PM=new Map(PROJECTILES.map(x=>[x.id,x]));
const INT=/(?:_burst$|heat_jet$|ha_heat_copper_ray$|ptur_jet$)/,DUAL=/^cbcmoreshells:(?:normal_|extended_)/,RACK=/^cbcmoreshells:(?:(?:aphe|he)_(?:bomb|bouncing_bomb|loitering_rocket|rocket)|dual_(?:aphe|he)_rocket|racked_torpedo|depth_charge)$/,TORP=/^cbcmoreshells:(?!.*_burst$).*torpedo/,AUTO=/^(?:createbigcannons:(?:ap_autocannon|flak_autocannon|machine_gun_bullet)|cbcmodernwarfare:(?:apds|canister|he|hvap)_autocannon|cbcmoreshells:antiair_machine_gun_bullet)$/,LAT=/^cbc_at:(?:apds|apdsfs|he|hei|cluster)_projectile$/,HAT=/^cbc_at:ha_(?:ap|apds|apdsfs|he|hef|heat|smoke)_projectile$/;
const load=id=>!INT.test(id)&&!id.endsWith(":smoke_grenade");
function big(id){if(id.startsWith("createbigcannons:"))return !AUTO.test(id)&&!INT.test(id);if(id.startsWith("cbcatfix:"))return true;if(/^cbcmodernwarfare:(?:apds_shot|heap_shell|hefrag_shell)$/.test(id))return true;if(id.startsWith("cbcmoreshells:"))return load(id)&&!DUAL.test(id)&&!RACK.test(id)&&!TORP.test(id)&&!AUTO.test(id);return false}
function isProjectileCompatible(c,id){if(!load(id))return false;switch(c){case"manual":return true;case"cbc_big_cannon":return big(id);case"cbc_drop_mortar":return /^createbigcannons:(?:drop_mortar_shell|mortar_stone)$/.test(id);case"cbc_autocannon":case"modern_rotary_cannon":return AUTO.test(id);case"military_small_single":case"military_small_dual":case"military_small_medium_single":case"military_small_medium_dual":return /^cbcmoreshells:normal_/.test(id);case"military_large_single":case"military_large_dual":return /^cbcmoreshells:extended_/.test(id);case"military_torpedo_tube":case"modern_torpedo_tube":return TORP.test(id);case"modern_medium_cannon":return /^cbcmodernwarfare:[a-z0-9_]*mediumshell$/.test(id);case"cbc_at_heavy_autocannon":return HAT.test(id);case"cbc_at_twin_autocannon":case"cbc_at_vertical_twin_autocannon":return LAT.test(id);case"cbc_at_rocket_pod":return /^cbc_at:(?:ap|flak|he|hei)_rocket$/.test(id);case"cbc_at_medium_rocket_rail":return /^cbc_at:medium_(?:ap|he|hef|heat)_rocket$/.test(id);case"cbcatfix_big_rocket_rail":return /^cbcatfix:big_(?:ap|he|heat)_rocket$/.test(id);default:return false}}
function rocketMotorProfile(c,id){if(c==="cbc_at_rocket_pod"&&/^cbc_at:(?:ap|flak|he|hei)_rocket$/.test(id))return{step:.025,max:2.5};if(c==="cbc_at_medium_rocket_rail"&&/^cbc_at:medium_.*_rocket$/.test(id))return{step:.05,max:3.75};if(c==="cbcatfix_big_rocket_rail"&&/^cbcatfix:big_.*_rocket$/.test(id))return{step:1,max:9};return null}
function projectileDefaults(id){return PM.get(id)||{id,referenceMass:2,diameter:diam(id||""),cd:cd(id||"")}}
const u=x=>BigInt.asUintN(64,x);
function mix(v){v=u(v);v=u((v^(v>>30n))*0xBF58476D1CE4E5B9n);v=u((v^(v>>27n))*0x94D049BB133111EBn);return u(v^(v>>31n))}
function j(s){let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return BigInt(h)}
function ps(x){try{return BigInt(String(x).trim()||"0")}catch{return 0n}}
function ws(c){return mix(ps(c.worldSeed)^ps(c.seedSalt)^u(j(c.dimensionId||"minecraft:overworld")*0x9E3779B97F4A7C15n))}
function ln(s,x,z,ch){let v=mix(s^mix(BigInt(x)*0x632BE59BD9B4E019n)^mix(BigInt(z)*0x9E3779B97F4A7C15n)^ch);return Number(v>>11n)/T53*2-1}
const sm=x=>x*x*(3-2*x),lr=(a,b,t)=>a+(b-a)*t;
function sn(s,x,z,ch){let x0=Math.floor(x),z0=Math.floor(z),tx=sm(x-x0),tz=sm(z-z0);return lr(lr(ln(s,x0,z0,ch),ln(s,x0+1,z0,ch),tx),lr(ln(s,x0,z0+1,ch),ln(s,x0+1,z0+1,ch),tx),tz)}
function windAt(p,c){if(!c.windEnabled)return[0,0,0];let r=0,t=0;if(c.weatherAffectsWind){if(c.weather==="rain")r=1;if(c.weather==="thunder")r=t=1}let b=c.windSpeed+c.rainWindBonus*r+c.thunderWindBonus*t,gu=c.gustSpeed+c.rainGustBonus*r+c.thunderGustBonus*t;if(b<=0&&gu<=0)return[0,0,0];let z=Math.max(16,c.windRegionSize),sd=c._windSeed??(c._windSeed=ws(c)),a=sn(sd,p[0]/z,p[2]/z,0x51EEDn),d=sn(sd,p[0]/z,p[2]/z,0xD1CE7n),vn=sn(sd,p[0]/z,p[2]/z,0xA17n),rm=Math.max(0,1+a*c.windSpeedVariation),alt=Math.max(0,p[1]-c.seaLevelY),af=1+Math.min(Math.max(0,c.altitudeWindMultiplier-1),Math.log1p(alt/10)*.08),sp=Math.max(0,(b*rm+gu*a)*af)/20,di=(c.windDirection+d*c.windDirectionVariation)*Math.PI/180;return[Math.sin(di)*sp,gu*c.verticalTurbulence*vn/20,Math.cos(di)*sp]}
function mm(m){if(m<.75)return 1;if(m<.95)return lr(1,1.65,(m-.75)/.2);if(m<1.1)return lr(1.65,2.05,(m-.95)/.15);if(m<1.5)return lr(2.05,1.45,(m-1.1)/.4);if(m<3)return lr(1.45,1.1,(m-1.5)/1.5);return 1.1}
function ac(p,v,t,c){let w=windAt(p,c),r=[v[0]-w[0],v[1]-w[1],v[2]-w[2]],s=Math.hypot(...r),al=p[1]-c.seaLevelY,te=15+(c.biomeTemperature-.8)*20-Math.max(0,al)*.0065,rho=Math.max(.02,Math.min(3,1.225*Math.exp(-al/c.scaleHeight)*(288.15/Math.max(150,te+273.15)))),snd=Math.max(250,331.3+.606*te),C=c.cd*mm(s*20/snd),d=c.diameter,A=Math.PI*d*d*.25,rm=Math.sqrt(Math.max(.25,c.referenceMass)/2),M=Math.max(.1,c.projectileDensity*A*d*c.lengthCalibers*c.solidFraction*rm),D=s>1e-12?.5*rho*C*A/M*s*s:0;D=Math.min(D,s*.25);let ax=s>1e-12?-r[0]/s*D:0,ay=-c.gravity/400+(s>1e-12?-r[1]/s*D:0),az=s>1e-12?-r[2]/s*D:0;if(c.enableCoriolis){let q=c.latitude*Math.PI/180,oy=O*Math.sin(q),oz=-O*Math.cos(q),x=v[0]*20,y=v[1]*20,z=v[2]*20;ax+=-2/400*(oy*z-oz*y);ay+=-2/400*oz*x;az+=-2/400*(-oy*x)}if(c.enableSpinDrift){let h=Math.hypot(v[0],v[2]);if(h>1e-12){let q=c.gravity/400*c.spinDriftFactor*Math.min(1,(t+1)/100);ax+=v[2]/h*q;az-=v[0]/h*q}}let motor=c.rocketMotor,fuel=Math.max(0,Math.floor(c.rocketFuelTicks||0)),vs=Math.hypot(...v);if(motor&&t+1<fuel&&vs>1e-12){let thrust=Math.min(motor.max,motor.step*(t+2));ax+=v[0]/vs*thrust;ay+=v[1]/vs*thrust;az+=v[2]/vs*thrust}return[ax,ay,az]}
function launch(P,Y,S,V,c){let y=Y*Math.PI/180,p=P*Math.PI/180,d=[Math.sin(y)*Math.cos(p),Math.sin(p),Math.cos(y)*Math.cos(p)],length=Number.isFinite(+c.barrelLength)?Math.max(0,+c.barrelLength):0,barrel=Math.max(0,length-2);return{x:[S[0]+d[0]*barrel,S[1]+d[1]*barrel,S[2]+d[2]*barrel],v:[d[0]*V,d[1]*V,d[2]*V]}}
function sim(P,Y,S,T,V,c,pathOn){let l=launch(P,Y,S,V,c),v=l.v,x=l.x,M=[...x],dx=T[0]-M[0],dz=T[2]-M[2],R=Math.hypot(dx,dz),ux=dx/R,uz=dz/R,rx=uz,rz=-ux,path=pathOn?[{x:Math.hypot(M[0]-S[0],M[2]-S[2]),y:M[1]-S[1]}]:null,pa=0,mx=Math.min(20000,Math.max(1,c.maxTicks||2000));for(let t=0;t<mx;t++){let a=ac(x,v,t,c),n=[x[0]+v[0]+a[0]*.5,x[1]+v[1]+a[1]*.5,x[2]+v[2]+a[2]*.5],q=(n[0]-M[0])*ux+(n[2]-M[2])*uz;if(pathOn)path.push({x:Math.hypot(n[0]-S[0],n[2]-S[2]),y:n[1]-S[1]});if(q>=R&&pa<R){let f=(R-pa)/Math.max(1e-12,q-pa),hit=[lr(x[0],n[0],f),lr(x[1],n[1],f),lr(x[2],n[2],f)];return{ok:true,yError:hit[1]-T[1],crossError:(hit[0]-T[0])*rx+(hit[2]-T[2])*rz,ticks:t+f,position:hit,path}}pa=q;x=n;v=[v[0]+a[0],v[1]+a[1],v[2]+a[2]];if(t>10&&x[1]<Math.min(M[1],T[1])-512&&v[1]<0)break}return{ok:false,yError:Infinity,crossError:Infinity,ticks:-1,path}}
// Exact browser port of AbstractCannonProjectile.tick() together with
// RealisticFlightModel.replaceForces(). There are no measured range offsets
// or nominal-to-effective velocity multipliers in this path.
function simHigh(P,Y,S,T,V,c,pathOn){
  let launchState=launch(P,Y,S,V,c),v=launchState.v,x=launchState.x,muzzle=[...x];
  let dx=T[0]-muzzle[0],dz=T[2]-muzzle[2],range=Math.hypot(dx,dz);
  if(!(range>0))return{ok:false,rangeError:Infinity,yError:Infinity,crossError:Infinity,ticks:-1,path:null};
  let forwardX=dx/range,forwardZ=dz/range,rightX=forwardZ,rightZ=-forwardX;
  let path=pathOn?[{x:Math.hypot(muzzle[0]-S[0],muzzle[2]-S[2]),y:muzzle[1]-S[1]}]:null;
  let maxTicks=Math.min(20000,Math.max(1,c.maxTicks||2000)),descending=v[1]<=0;
  for(let tick=0;tick<maxTicks;tick++){
    // CBC moves by v + 0.5*a, then stores v + a for the next tick.
    let acceleration=ac(x,v,tick,c);
    let next=[
      x[0]+v[0]+acceleration[0]*.5,
      x[1]+v[1]+acceleration[1]*.5,
      x[2]+v[2]+acceleration[2]*.5
    ];
    let nextVelocity=[v[0]+acceleration[0],v[1]+acceleration[1],v[2]+acceleration[2]];
    if(pathOn)path.push({x:Math.hypot(next[0]-S[0],next[2]-S[2]),y:next[1]-S[1]});
    if(next[1]<x[1])descending=true;
    if(descending&&x[1]>=T[1]&&next[1]<=T[1]){
      let fraction=(x[1]-T[1])/Math.max(1e-12,x[1]-next[1]);
      let hit=[lr(x[0],next[0],fraction),T[1],lr(x[2],next[2],fraction)];
      let along=(hit[0]-muzzle[0])*forwardX+(hit[2]-muzzle[2])*forwardZ;
      let cross=(hit[0]-T[0])*rightX+(hit[2]-T[2])*rightZ;
      return{ok:true,rangeError:along-range,yError:0,crossError:cross,ticks:tick+fraction,position:hit,path};
    }
    x=next;
    v=nextVelocity;
  }
  return{ok:false,rangeError:Infinity,yError:Infinity,crossError:Infinity,ticks:-1,path};
}

function refineHighFromJava(P,Y,S,T,V,c){
  for(let iteration=0;iteration<20;iteration++){
    let base=simHigh(P,Y,S,T,V,c,false);
    if(!base.ok)return null;
    if(Math.hypot(base.rangeError,base.crossError)<.001)break;
    let step=.01,pitchTrial=simHigh(P+step,Y,S,T,V,c,false),yawTrial=simHigh(P,Y+step,S,T,V,c,false);
    if(!pitchTrial.ok||!yawTrial.ok)return null;
    let rrP=(pitchTrial.rangeError-base.rangeError)/step;
    let rrY=(yawTrial.rangeError-base.rangeError)/step;
    let crP=(pitchTrial.crossError-base.crossError)/step;
    let crY=(yawTrial.crossError-base.crossError)/step;
    let determinant=rrP*crY-rrY*crP;
    if(Math.abs(determinant)<1e-12)return null;
    let pitchCorrection=(-base.rangeError*crY+rrY*base.crossError)/determinant;
    let yawCorrection=(-rrP*base.crossError+base.rangeError*crP)/determinant;
    P+=Math.max(-1,Math.min(1,pitchCorrection));
    Y+=Math.max(-1,Math.min(1,yawCorrection));
    P=Math.max(c.minPitch,Math.min(c.maxPitch,P));
  }
  let finalState=simHigh(P,Y,S,T,V,c,true);
  return finalState.ok?{pitchDeg:P,yawDeg:Y,miss:Math.hypot(finalState.rangeError,finalState.crossError),...finalState}:null;
}

function solveLowFromJava(S,T,V,c,directYaw,allowed){
  let minimumPitch=Math.max(-89.9,c.minPitch),maximumPitch=Math.min(89.9,c.maxPitch),step=2;
  let previous=null,bracket=null;
  for(let pitch=minimumPitch;pitch<=maximumPitch;pitch+=step){
    let state=simHigh(pitch,directYaw,S,T,V,c,false);
    if(!state.ok)continue;
    let sample={pitch,error:state.rangeError};
    if(previous&&previous.error*sample.error<=0){bracket=[previous,sample];break}
    previous=sample;
  }
  if(!bracket)return null;
  let a=bracket[0],b=bracket[1];
  for(let iteration=0;iteration<48;iteration++){
    let pitch=(a.pitch+b.pitch)*.5,state=simHigh(pitch,directYaw,S,T,V,c,false);
    if(!state.ok)break;
    let middle={pitch,error:state.rangeError};
    if(a.error*middle.error<=0)b=middle;else a=middle;
  }
  let result=refineHighFromJava((a.pitch+b.pitch)*.5,directYaw,S,T,V,c);
  return result&&result.miss<=allowed?result:null;
}

// A low shot may meet an elevated target while it is still climbing, so its
// root is measured at the target's horizontal plane rather than at a later
// descending height crossing. This is the only path retained from the former
// solver; High arc never uses it.
function solveAscendingLow(S,T,V,c,directYaw,minimumPitch,maximumPitch,allowed){
  let horizontal=Math.hypot(T[0]-S[0],T[2]-S[2]),height=T[1]-S[1],gravity=c.gravity/400;
  let discriminant=V**4-gravity*(gravity*horizontal**2+2*height*V**2);
  if(discriminant>=0&&gravity>0&&horizontal>0){
    let seed=Math.atan((V**2-Math.sqrt(discriminant))/(gravity*horizontal))*180/Math.PI;
    if(seed>=minimumPitch&&seed<=maximumPitch){
      let direct=rf(seed,directYaw,S,T,V,c);
      if(direct&&direct.miss<=allowed)return direct;
      // Drag can move the low root above the vacuum guess far enough that the
      // first trial falls before the target plane. Walk upward only until CBC's
      // own simulation reaches that plane, then let the coupled solver finish.
      for(let pitch=seed+1;pitch<=Math.min(maximumPitch,seed+30);pitch+=1){
        let state=sim(pitch,directYaw,S,T,V,c,false);
        if(!state.ok)continue;
        let recovered=rf(pitch,directYaw,S,T,V,c);
        if(recovered&&recovered.miss<=allowed)return recovered;
      }
    }
  }
  let samples=[];
  for(let pitch=minimumPitch;pitch<maximumPitch;pitch+=2){
    let state=sim(pitch,directYaw,S,T,V,c,false);
    if(state.ok&&Number.isFinite(state.yError))samples.push({pitch,error:state.yError});
  }
  let last=sim(maximumPitch,directYaw,S,T,V,c,false);
  if(last.ok&&Number.isFinite(last.yError))samples.push({pitch:maximumPitch,error:last.yError});
  let seeds=[];
  for(let index=1;index<samples.length;index++){
    let a=samples[index-1],b=samples[index];
    if(a.error===0||a.error*b.error<=0){
      seeds.push(lr(a.pitch,b.pitch,Math.abs(a.error)/Math.max(1e-12,Math.abs(a.error)+Math.abs(b.error))));
    }
  }
  for(let index=1;index+1<samples.length;index++){
    let before=Math.abs(samples[index-1].error),current=Math.abs(samples[index].error),after=Math.abs(samples[index+1].error);
    if(current<=before&&current<=after&&current<=Math.max(2,allowed*4))seeds.push(samples[index].pitch);
  }
  let roots=seeds.map(pitch=>rf(pitch,directYaw,S,T,V,c))
    .filter(Boolean)
    .filter(root=>root.pitchDeg>=minimumPitch-1e-6&&root.pitchDeg<=maximumPitch+1e-6&&root.miss<=allowed)
    .sort((a,b)=>a.pitchDeg-b.pitchDeg);
  return roots[0]||null;
}
function rf(P,Y,S,T,V,c){for(let i=0;i<12;i++){let b=sim(P,Y,S,T,V,c,false);if(!b.ok)return null;if(Math.hypot(b.yError,b.crossError)<.01)break;let st=.05,ps=sim(P+st,Y,S,T,V,c,false),ys=sim(P,Y+st,S,T,V,c,false);if(!ps.ok||!ys.ok)break;let a=(ps.yError-b.yError)/st,bb=(ys.yError-b.yError)/st,cc=(ps.crossError-b.crossError)/st,d=(ys.crossError-b.crossError)/st,det=a*d-bb*cc;if(Math.abs(det)<1e-9)break;P+=Math.max(-2,Math.min(2,(-b.yError*d+bb*b.crossError)/det));Y+=Math.max(-2,Math.min(2,(-a*b.crossError+b.yError*cc)/det));P=Math.max(c.minPitch,Math.min(c.maxPitch,P))}let f=sim(P,Y,S,T,V,c,true);return f.ok?{pitchDeg:P,yawDeg:Y,miss:Math.hypot(f.yError,f.crossError),...f}:null}
// High arc uses the exact Java-tick simulation. The vacuum solution is only
// a fast initial guess; the final bracket, bisection and coupled correction
// are evaluated exclusively through the mod's force model.
function solve(S,T,V,c,arc){
  let dx=T[0]-S[0],dz=T[2]-S[2],horizontalRange=Math.hypot(dx,dz);
  if(!(horizontalRange>0)||!(V>0))return{ok:false,low:null,high:null,selected:null};
  let directYaw=Math.atan2(dx,dz)*180/Math.PI;
  let minimumPitch=Math.max(-89.9,Number.isFinite(+c.minPitch)?+c.minPitch:-89.9);
  let maximumPitch=Math.min(89.9,Number.isFinite(+c.maxPitch)?+c.maxPitch:89.9);
  if(!(maximumPitch>minimumPitch))return{ok:false,low:null,high:null,selected:null};
  let allowed=Math.max(.05,c.allowedMiss||1),step=2;
  let low=solveAscendingLow(S,T,V,c,directYaw,minimumPitch,maximumPitch,allowed);
  if(!low)low=solveLowFromJava(S,T,V,c,directYaw,allowed);
  let gravity=c.gravity/400,height=T[1]-S[1],velocitySquared=V*V;
  let discriminant=velocitySquared*velocitySquared
    -gravity*(gravity*horizontalRange*horizontalRange+2*height*velocitySquared);
  let guess=maximumPitch;
  if(gravity>0&&discriminant>=0){
    guess=Math.atan((velocitySquared+Math.sqrt(discriminant))/(gravity*horizontalRange))*180/Math.PI;
    guess=Math.max(minimumPitch,Math.min(maximumPitch,guess));
  }
  let evaluate=pitch=>{
    let state=simHigh(pitch,directYaw,S,T,V,c,false);
    return state.ok&&Number.isFinite(state.rangeError)?{pitch,error:state.rangeError}:null;
  };
  let start=evaluate(guess),bracket=null,high=null;
  if(start&&Math.abs(start.error)<=Math.max(2,allowed*4)){
    let directRoot=refineHighFromJava(start.pitch,directYaw,S,T,V,c);
    if(directRoot&&directRoot.miss<=allowed)high=directRoot;
  }
  if(start&&!high){
    let direction=start.error<=0?-1:1,previous=start;
    for(let pitch=guess+direction*step;
        pitch>=minimumPitch&&pitch<=maximumPitch;
        pitch+=direction*step){
      let current=evaluate(pitch);
      if(!current)continue;
      if(previous.error===0||previous.error*current.error<=0){bracket=[previous,current];break}
      previous=current;
    }
  }
  // Conservative fallback for extreme custom configs where the vacuum guess
  // is outside the part of the trajectory that descends through target Y.
  if(!high&&!bracket){
    let previous=null;
    for(let pitch=maximumPitch;pitch>=minimumPitch;pitch-=step){
      let current=evaluate(pitch);
      if(!current)continue;
      if(previous&&(previous.error===0||previous.error*current.error<=0)){
        bracket=[previous,current];
        break;
      }
      previous=current;
    }
  }
  if(!high&&bracket){
    let a=bracket[0],b=bracket[1];
    for(let iteration=0;iteration<48;iteration++){
      let pitch=(a.pitch+b.pitch)*.5;
      let state=simHigh(pitch,directYaw,S,T,V,c,false);
      if(!state.ok)break;
      let middle={pitch,error:state.rangeError};
      if(a.error*middle.error<=0)b=middle;else a=middle;
    }
    let root=refineHighFromJava((a.pitch+b.pitch)*.5,directYaw,S,T,V,c);
    if(root&&root.miss<=allowed)high=root;
  }
  if(high&&low&&Math.abs(low.pitchDeg-high.pitchDeg)<=.05)low=null;
  let selected=arc==="high"?high:low;
  return{ok:!!selected,low,high,selected};
}
function sr(P,Y,S,V,c){let l=launch(P,Y,S,V,c),v=l.v,x=l.x,pr=[...x],mx=Math.min(20000,Math.max(1,c.maxTicks||2000));for(let t=0;t<mx;t++){let a=ac(x,v,t,c),n=[x[0]+v[0]+a[0]*.5,x[1]+v[1]+a[1]*.5,x[2]+v[2]+a[2]*.5];if(t>0&&n[1]<=S[1]){let f=(pr[1]-S[1])/Math.max(1e-12,pr[1]-n[1]),xx=lr(pr[0],n[0],f),z=lr(pr[2],n[2],f);return{range:Math.hypot(xx-S[0],z-S[2]),ticks:t+f}}pr=x;x=n;v=[v[0]+a[0],v[1]+a[1],v[2]+a[2]]}return{range:NaN,ticks:-1}}
function maximumRange(S,V,c,Y){let rc={...c,maxTicks:Math.max(10000,c.maxTicks||0)},b={range:-Infinity,pitchDeg:null,ticks:-1};for(let p=Math.max(0,c.minPitch);p<=Math.min(89,c.maxPitch);p++){let r=sr(p,Y,S,V,rc);if(r.range>b.range)b={...r,pitchDeg:p}}if(b.pitchDeg===null)return null;for(let p=Math.max(c.minPitch,b.pitchDeg-1);p<=Math.min(c.maxPitch,b.pitchDeg+1);p+=.1){let r=sr(p,Y,S,V,rc);if(r.range>b.range)b={...r,pitchDeg:p}}return b}
g.CBCRealisticBallistics={CANNONS,PROJECTILES,projectileDefaults,isProjectileCompatible,fixedMuzzleVelocity,rocketMotorProfile,windAt,solve,maximumRange};
})(window);
