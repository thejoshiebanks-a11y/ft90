const T=THREE,$=id=>document.getElementById(id),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const R=new T.WebGLRenderer({canvas:$('c'),antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;
const S=new T.Scene();S.background=new T.Color(0x16254a);S.fog=new T.Fog(0x0b1220,140,320);
const cam=new T.PerspectiveCamera(50,1,.1,400);
function rs(){const w=document.body.clientWidth,h=document.body.clientHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w<h?55:40;cam.updateProjectionMatrix()}
addEventListener('resize',rs);rs();
S.add(new T.HemisphereLight(0xbfd4ff,0x1a3a1a,.75));
const sun=new T.DirectionalLight(0xffffff,.9);sun.position.set(-30,60,30);sun.castShadow=true;
Object.assign(sun.shadow.camera,{left:-70,right:70,top:50,bottom:-50,far:200});sun.shadow.mapSize.set(1024,1024);S.add(sun);
function tex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'));return new T.CanvasTexture(c)}
const pc=document.createElement('canvas');pc.width=1100;pc.height=720;const g=pc.getContext('2d');
for(let i=0;i<22;i++){g.fillStyle=i%2?'#2a6e2e':'#327b36';g.fillRect(i*50,0,51,720)}for(let i=0;i<14000;i++){g.fillStyle=Math.random()<.5?'#00000012':'#ffffff12';g.fillRect(Math.random()*1100,Math.random()*720,3,3)}
g.strokeStyle='#e9f5e9';g.lineWidth=4;const sx=10,sz=10;
g.strokeRect(4,4,1092,712);g.beginPath();g.moveTo(550,0);g.lineTo(550,720);g.stroke();g.beginPath();g.arc(550,360,9.15*sx,0,7);g.stroke();g.beginPath();g.arc(550,360,5,0,7);g.fill();
[0,1].forEach(s=>{g.strokeRect(s?1100-16.5*sx:0,360-20*sz,16.5*sx,40*sz);g.strokeRect(s?1100-5.5*sx:0,360-9*sz,5.5*sx,18*sz);g.beginPath();g.arc(s?1100-11*sx:11*sx,360,4,0,7);g.fill()});
const pt=new T.CanvasTexture(pc);pt.anisotropy=8;
const pitch=new T.Mesh(new T.PlaneGeometry(110,72),new T.MeshStandardMaterial({map:pt}));pitch.rotation.x=-Math.PI/2;pitch.receiveShadow=true;S.add(pitch);
const gr=new T.Mesh(new T.PlaneGeometry(420,320),new T.MeshStandardMaterial({color:0x1f5a24}));gr.rotation.x=-Math.PI/2;gr.position.y=-.03;S.add(gr);
const ad=tex(512,64,g=>{g.fillStyle='#0d2a5c';g.fillRect(0,0,512,64);g.fillStyle='#fff';g.font='bold 40px sans-serif';g.fillText('FT 90    UNITED CITY',10,46)});ad.wrapS=T.RepeatWrapping;ad.repeat.set(4,1);
[[110,1.1,.3,0,-37.6],[110,1.1,.3,0,37.6],[.3,1.1,76,-57,0],[.3,1.1,76,57,0]].forEach(a=>{const o=new T.Mesh(new T.BoxGeometry(a[0],a[1],a[2]),new T.MeshBasicMaterial({map:ad}));o.position.set(a[3],.55,a[4]);S.add(o)});
function goalMesh(s){const m=new T.MeshStandardMaterial({color:0xffffff}),x=55*s;
[-3.65,3.65].forEach(z=>{const p=new T.Mesh(new T.BoxGeometry(.2,2.44,.2),m);p.position.set(x,1.22,z);S.add(p)});
const b=new T.Mesh(new T.BoxGeometry(.2,.2,7.5),m);b.position.set(x,2.44,0);S.add(b);
const n=new T.Mesh(new T.BoxGeometry(3,2.44,7.3),new T.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.25}));n.position.set(x+1.6*s,1.22,0);S.add(n)}
goalMesh(1);goalMesh(-1);
let ca=0;
const crowdA=new T.Group(),crowdB=new T.Group();S.add(crowdA,crowdB);
const conc=new T.MeshStandardMaterial({color:0x3a3f4c}),seats=[];
const KT=[0xc0392b,0xecf0f1,0x2980b9,0xf1c40f,0x7f8c8d,0x27ae60,0x8e44ad,0x1c1c22,0xe67e22,0xd8342f],SKT=[0xf1c6a0,0xd9a77a,0xb07850,0x7a4a2a,0x4a2c1a];
function tier(alongX,a0,b0,len,rows,dir){for(let r=0;r<rows;r++){const off=r*1.1*dir,y=1+r*.95,fix=b0+off;
const st=new T.Mesh(new T.BoxGeometry(alongX?len:1.2,.3,alongX?1.2:len),conc);st.position.set(alongX?a0:fix,y-.3,alongX?fix:a0);S.add(st);
for(let k=-len/2+.5;k<len/2;k+=1.02)seats.push(alongX?[a0+k,y+.38,fix]:[fix,y+.38,a0+k])}}
tier(true,0,-42,136,14,-1);tier(true,0,42,136,14,1);tier(false,0,-62,84,14,-1);tier(false,0,62,84,14,1);
(function(){const bg=new T.BoxGeometry(.55,.75,.4),hg=new T.SphereGeometry(.22,6,4),m1=new T.MeshStandardMaterial({color:0xffffff}),m2=new T.MeshStandardMaterial({color:0xffffff});
const half=[[],[]];seats.forEach((s,i)=>half[i%2].push(s));
half.forEach((arr,h)=>{const b=new T.InstancedMesh(bg,m1,arr.length),hd=new T.InstancedMesh(hg,m2,arr.length),mx=new T.Matrix4(),col=new T.Color();
arr.forEach((s,i)=>{mx.makeTranslation(s[0],s[1],s[2]);b.setMatrixAt(i,mx);b.setColorAt(i,col.setHex(KT[(Math.random()*KT.length)|0]));
mx.makeTranslation(s[0],s[1]+.6,s[2]);hd.setMatrixAt(i,mx);hd.setColorAt(i,col.setHex(SKT[(Math.random()*5)|0]))});
b.instanceMatrix.needsUpdate=hd.instanceMatrix.needsUpdate=true;b.instanceColor.needsUpdate=hd.instanceColor.needsUpdate=true;(h?crowdB:crowdA).add(b,hd)})})();
const roofM=new T.MeshStandardMaterial({color:0x23262e});
[[0,-56,146,.5,18,0],[0,56,146,.5,18,0],[-68,0,.5,84,0,1],[68,0,.5,84,0,1]].forEach(([x,z,w,d,y,e])=>{const r=new T.Mesh(new T.BoxGeometry(e?16:w,.6,e?100:16),roofM);r.position.set(e?x*1.08:x,e?18:19.5,e?0:z);S.add(r)});
for(let x=-70;x<=70;x+=20)[-60,60].forEach(z=>{const c=new T.Mesh(new T.CylinderGeometry(.4,.4,19,6),roofM);c.position.set(x,9.5,z);S.add(c)});
[[-84,-56],[84,-56],[-84,56],[84,56]].forEach(([x,z])=>{const t=new T.Mesh(new T.CylinderGeometry(.5,.7,32,6),new T.MeshStandardMaterial({color:0x555a66}));t.position.set(x,16,z);S.add(t);
const h=new T.Mesh(new T.BoxGeometry(5,2.5,1),new T.MeshBasicMaterial({color:0xfff6d0}));h.position.set(x,33,z);h.lookAt(0,10,0);S.add(h)});
[[-55,-36],[55,-36],[-55,36],[55,36]].forEach(([x,z])=>{const p=new T.Mesh(new T.CylinderGeometry(.05,.05,1.6,5),new T.MeshBasicMaterial({color:0xffffff}));p.position.set(x,.8,z);S.add(p);const f=new T.Mesh(new T.PlaneGeometry(.6,.4),new T.MeshBasicMaterial({color:0xf1c40f,side:T.DoubleSide}));f.position.set(x+.3,1.4,z);S.add(f)});
const SK=[0xf1c6a0,0xd9a77a,0xb07850,0x7a4a2a,0x4a2c1a],HR=[0x1a1208,0x3a2512,0x6b4a22,0xc9a24a,0x111111],NT={};
function numTex(n,col){const k=n+'_'+col;return NT[k]||(NT[k]=tex(64,64,g=>{g.clearRect(0,0,64,64);g.fillStyle='#fff';g.font='bold 46px sans-serif';g.textAlign='center';g.fillText(n,32,48)}))}
function mk(col,sc=S,o={}){const gp=new T.Group(),M=c=>new T.MeshStandardMaterial({color:c,roughness:.85}),sh=M(col),shorts=M(o.shorts===undefined?0xf2f2f2:o.shorts),sock=M(o.sock===undefined?col:o.sock),skin=M(SK[o.skin||0]),hair=M(HR[o.hair||0]),boot=M(0x111111);
const cs=[],B=(w,h,d,m,x,y,z,par,cast)=>{const e=new T.Mesh(new T.BoxGeometry(w,h,d),m);e.position.set(x,y,z);par.add(e);if(cast)cs.push(e);return e};
const C=(r1,r2,h,m,par,cast)=>{const g=new T.CylinderGeometry(r1,r2,h,8);g.translate(0,-h/2,0);const e=new T.Mesh(g,m);par.add(e);if(cast)cs.push(e);return e};
const hip=new T.Group();hip.position.y=1;gp.add(hip);B(.3,.3,.46,shorts,0,.08,0,hip,1);
const torso=new T.Group();torso.position.y=.2;hip.add(torso);B(.3,.62,.5,sh,0,.34,0,torso,1);
if(o.num){const pl=new T.Mesh(new T.PlaneGeometry(.4,.4),new T.MeshBasicMaterial({map:numTex(o.num,col),transparent:true}));pl.position.set(-.155,.4,0);pl.rotation.y=-Math.PI/2;torso.add(pl)}
const nk=new T.Mesh(new T.CylinderGeometry(.06,.07,.12,6),skin);nk.position.y=.69;torso.add(nk);
const hd=new T.Mesh(new T.SphereGeometry(.17,12,10),skin);hd.position.y=.86;torso.add(hd);
const hr=new T.Mesh(new T.SphereGeometry(.18,12,8,0,Math.PI*2,0,Math.PI*.55),hair);hr.position.set(-.015,.88,0);torso.add(hr);
const arms=[],elb=[],legs=[],knees=[];
[-1,1].forEach(sd=>{const a=new T.Group();a.position.set(0,.58,sd*.33);torso.add(a);C(.07,.06,.3,sh,a);const e=new T.Group();e.position.y=-.3;a.add(e);C(.055,.05,.28,skin,e);arms.push(a);elb.push(e);
const l=new T.Group();l.position.set(0,0,sd*.12);hip.add(l);C(.1,.08,.5,skin,l,1);const k=new T.Group();k.position.y=-.5;l.add(k);C(.075,.065,.5,sock,k,1);B(.3,.1,.14,boot,.07,-.52,0,k);legs.push(l);knees.push(k)});
const bl=new T.Mesh(new T.CircleGeometry(.5,12),new T.MeshBasicMaterial({color:0,transparent:true,opacity:.28}));bl.rotation.x=-Math.PI/2;bl.position.y=.03;gp.add(bl);
cs.forEach(e=>e.castShadow=true);
gp.legs=legs;
gp.anim=(v,ph,st)=>{const k=Math.min(v/8,1),s=Math.sin(ph),c=Math.cos(ph);
legs[0].rotation.z=s*.95*k;legs[1].rotation.z=-s*.95*k;knees[0].rotation.z=-Math.max(0,c)*1.1*k;knees[1].rotation.z=-Math.max(0,-c)*1.1*k;
arms[0].rotation.z=-s*.8*k;arms[1].rotation.z=s*.8*k;elb[0].rotation.z=elb[1].rotation.z=.5*k+.15;torso.rotation.z=-.28*k;hip.position.y=1+Math.abs(s)*.05*k;gp.position.y=0;
if(st){if(st.jp>0){gp.position.y=Math.sin(Math.min(1,1-st.jp/.5)*Math.PI)*.55;arms[0].rotation.z=arms[1].rotation.z=2.4}else if(st.dv>0){const pr=1-st.dv/.7;gp.position.y=Math.sin(Math.min(1,pr)*Math.PI)*.9;arms[0].rotation.z=arms[1].rotation.z=2.7;legs[0].rotation.z=.3;legs[1].rotation.z=-.3}
else if(sim.time-st.kt<.3){const kp=Math.min(1,(sim.time-st.kt)/.3);legs[1].rotation.z=-.9+2.4*kp;knees[1].rotation.z=-.3;arms[0].rotation.z=.8;arms[1].rotation.z=-.8;torso.rotation.z=.08}}};
gp.rotation.order='YXZ';gp.scale.setScalar(1.5);sc.add(gp);gp.anim(0,0);return gp}
const P=[];for(let t=0;t<2;t++)for(let i=0;i<Sim.N;i++){const k=t?0xd8342f:0x2a7de1,gk=i===0?(t?0xf39c12:0x27ae60):k;
P.push({m:mk(gk,S,{num:i+1,shorts:t?0xf2f2f2:0x0b1b3a,sock:gk,skin:(i*3+t)%5,hair:(i*2+t)%5}),t,gk:i===0,p:new T.Vector2(),v:new T.Vector2(),a:0,ph:Math.random()*6,x0:0})}
const ball=new T.Mesh(new T.SphereGeometry(.45,16,12),new T.MeshStandardMaterial({color:0xffffff}));ball.castShadow=true;S.add(ball);
const bv=new T.Vector3(),mark=new T.Mesh(new T.ConeGeometry(.35,.7,8),new T.MeshBasicMaterial({color:0xfac775}));mark.rotation.x=Math.PI;S.add(mark);
let owner=null,u=null,jx=0,jy=0;const K={},st={sc:[0,0],min:0,half:1,run:false,m:{sp:1,pw:1,op:1}};
const sim=Sim.create({diff:.98}),INP={ix:0,iz:0,sprint:false},MR=.375;
function sync(dt){sim.p.forEach((s,i)=>{const p=P[i],v=Math.hypot(s.vx,s.vz);p.p.set(s.x,s.z);p.v.set(s.vx,s.vz);p.a=s.a;p.ph+=v*dt*1.25;
p.m.position.set(s.x,0,s.z);p.m.rotation.y=-s.a;p.m.rotation.x=s.dv>0?s.dd*(Math.cos(s.a)>0?1:-1)*Math.min(1.35,(1-s.dv/.7)*3):0;p.m.anim(v,p.ph,s)});
const b=sim.ball;ball.position.set(b.x,b.y,b.z);bv.set(b.vx,b.vy,b.vz);owner=sim.owner>=0?P[sim.owner]:null;u=P[sim.user]||null}
function reset(){Sim.reset(sim);sim.mood=st.m;sync(0)}
function act(k){if(!st.run||st.pause)return;Sim.act(sim,k)}
const pad=$('pad'),kn=$('kn');
function pm(e){const r=pad.getBoundingClientRect();let dx=e.clientX-r.left-60,dy=e.clientY-r.top-60;const l=Math.hypot(dx,dy);if(l>50){dx*=50/l;dy*=50/l}jx=dx/50;jy=dy/50;kn.style.transform=`translate(${dx}px,${dy}px)`}
pad.addEventListener('pointerdown',e=>{pad.setPointerCapture(e.pointerId);pm(e)});pad.addEventListener('pointermove',e=>{if(pad.hasPointerCapture(e.pointerId))pm(e)});
const up=()=>{jx=jy=0;kn.style.transform=''};pad.addEventListener('pointerup',up);pad.addEventListener('pointercancel',up);
$('sh').addEventListener('pointerdown',()=>act(1));$('th').addEventListener('pointerdown',()=>act(4));$('ps').addEventListener('pointerdown',()=>act(0));$('lb').addEventListener('pointerdown',()=>act(2));$('sk').addEventListener('pointerdown',()=>act(3));
const sp0=()=>sprint=false;$('sp').addEventListener('pointerdown',()=>sprint=true);['pointerup','pointerleave','pointercancel'].forEach(e=>$('sp').addEventListener(e,sp0));
addEventListener('keydown',e=>{K[e.code]=1;if(e.code==='Space')act(1);if(e.code==='KeyE')act(0);if(e.code==='KeyQ')act(2);if(e.code==='KeyR')act(4);if(e.code==='KeyF')act(3)});addEventListener('keyup',e=>K[e.code]=0);
function banner(t){const m=$('msg');m.textContent=t;m.style.display=t?'block':'none'}
function upd(){$('sc').textContent=st.sc[0]+' - '+st.sc[1];$('tm').textContent=Math.min(90,Math.floor(st.min))+"'"}
function goal(t){ca=3;st.sc[t]++;st.run=false;owner=null;banner('Goal! '+(t?'City':'United'));upd();setTimeout(()=>{banner('');reset();st.run=true},2000)}
function halftime(){st.half=2;ui(false);mode='walkoff';tt=0;cap('Half time');cam.fov=50;cam.updateProjectionMatrix();cam.position.set(0,9,10);cam.lookAt(0,1,26)}
document.querySelectorAll('#ch button').forEach(b=>b.onclick=()=>{const m=b.dataset.m;st.m[m]=m==='op'?.92:m==='sp'?1.08:1.18;
$('co').textContent='Coach: "Right. Go out there and show them."';$('ch').style.display='none';$('out').style.display='block'});
$('out').onclick=()=>{$('ht').classList.remove('on');$('room').style.display='none';tOut=false;tt=0;mode='tunnel';cap('Back out for the second half');cam.fov=62;cam.updateProjectionMatrix()};
function fulltime(){$('fr').textContent='UTD '+st.sc[0]+' - '+st.sc[1]+' CITY';$('ft').classList.add('on')}
function begin(){rs();st.sc=[0,0];st.min=0;st.half=1;st.pause=false;stam=1;st.m={sp:1,pw:1,op:1};sim.mood=st.m;sim.stam=1;$('ch').style.display='flex';$('out').style.display='none';$('co').textContent='Coach: "Talk to me. What do we need for the second half?"';upd();reset();st.run=false;['st','ft'].forEach(i=>$(i).classList.remove('on'));ui(false);tOut=false;tt=0;cam.fov=62;cam.updateProjectionMatrix();mode='tunnel';cap('Players walk out')}
$('go').onclick=begin;$('again').onclick=begin;
function step(dt){
if(!st.run)return;st.min+=dt*MR;upd();
if(st.half===1&&st.min>=45){st.run=false;halftime();return}
if(st.min>=90){st.run=false;fulltime();return}
INP.ix=jx+(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0);INP.iz=jy+(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0);INP.sprint=!!(sprint||K.ShiftLeft);
Sim.step(sim,dt,INP);sync(dt);$('stf').style.width=sim.stam*100+'%';
for(const e of sim.ev){if(e.type==='goal'){goal(e.t);break}if(e.type==='restart'){cap(RL[e.kind]+' · '+(e.t?'City':'United'));setTimeout(()=>cap(''),1500)}}}
const I=new T.Scene();I.background=new T.Color(0x0c0c10);I.add(new T.HemisphereLight(0xffffff,0x444455,.8));
const l1=new T.PointLight(0xfff0d8,1.3,40),l2=new T.PointLight(0xfff0d8,1.2,40);l2.position.set(100,5,1);I.add(l1,l2);
const mt=c=>new T.MeshStandardMaterial({color:c}),em=c=>new T.MeshBasicMaterial({color:c});
function bx(w,h,d,x,y,z,m){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);I.add(o);return o}
bx(7,.2,50,0,-.1,-18,mt(0x4a4f5a));bx(7,.3,50,0,4.5,-18,mt(0x202430));
[-3.5,3.5].forEach(x=>{bx(.3,4.5,50,x,2.2,-18,mt(0x2c3040));bx(.05,.3,50,x*.94,1,-18,em(0x2a7de1))});
for(let z=4;z>-40;z-=5)bx(2.5,.12,.5,0,4.3,z,em(0xfff6d0));
bx(5,3.6,.2,0,1.8,-42,em(0xff5a4a));
bx(30,.2,20,100,-.1,-2,mt(0x8a8f99));bx(30,6,.3,100,3,-7.2,mt(0x1c2230));
bx(24,.1,.2,100,.1,-6.2,em(0xff2a3a));bx(20,.5,1,100,.45,-5.6,mt(0x2a3d8a));
[7,9,10,12,5,8,11,3].forEach((n,i)=>{const x=100-9.1+i*2.6;bx(2.2,3.8,.8,x,1.9,-6.6,mt(0x173f73));
const j=new T.Mesh(new T.PlaneGeometry(1.2,1.5),new T.MeshBasicMaterial({map:tex(128,160,g=>{g.fillStyle='#2a7de1';g.fillRect(0,0,128,160);g.fillStyle='#fff';g.font='bold 80px sans-serif';g.textAlign='center';g.fillText(n,64,110)})}));j.position.set(x,2.5,-6.19);I.add(j)});
const crest=new T.Mesh(new T.CircleGeometry(1.1,6),em(0xffffff));crest.position.set(100,5.2,-7);I.add(crest);
const WA=[...Array(22)].map((_,i)=>mk(i<11?0x2a7de1:0xd8342f,I,{shorts:i<11?0x0b1b3a:0xf2f2f2,skin:i%5,hair:(i*2)%5})),RF2=mk(0xf4d03f,I),C=mk(0x111111,I);
[-4.2,-2.4,2.4,4.2].forEach(x=>{const p=mk(0x2a7de1,I);p.position.set(100+x,0,-.5);p.rotation.y=x<0?0:Math.PI});
C.position.set(100,0,-1);C.rotation.y=-Math.PI/2;
let mode='play',tt=0,tOut=false,cm=0,stam=1,sprint=false;
const CM=[[22,40,34],[11,20,14],[34,54,46]],CN=['broadcast','player','wide'];
const RF=mk(0xf4d03f);RF.position.set(0,0,12);
document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{Sim.setFormation(sim,0,b.dataset.f);$('fm').textContent='Formation '+b.dataset.f});
$('cmb').onclick=()=>{cm=(cm+1)%3;$('cmb').textContent='Camera: '+CN[cm]};
$('pz').onclick=()=>{st.pause=true;$('pm').classList.add('on')};$('rsm').onclick=()=>{st.pause=false;$('pm').classList.remove('on')};
const cap=t=>{$('cp').textContent=t},fade=f=>{$('fd').style.opacity=f?1:0};
let atk=true;function ctx(){const a=sim.owner<0?sim.lastT!==1:sim.p[sim.owner].t===0;if(a===atk&&ctx.d)return;atk=a;ctx.d=1;$('ps').textContent=a?'Pass':'Tackle';$('sh').textContent=a?'Shoot':'Slide';$('lb').textContent=a?'Lob':'Switch';$('th').style.visibility=a?'visible':'hidden'}
const RL={throw:'Throw-in',corner:'Corner',goalkick:'Goal kick'};
function ui(on){const d=on?'block':'none',f=on?'flex':'none';$('pad').style.display=d;document.querySelectorAll('.b').forEach(e=>e.style.display=f);$('pz').style.display=f;$('stm').style.display=d;$('sk').style.display='none'}
function setP(p,x,z,a){p.p.set(x,z);p.a=a;p.v.set(0,0);p.m.position.set(x,0,z);p.m.rotation.set(0,-a,0);p.m.anim(0,0)}
function walk(p,tx,tz,sp,dt){const dx=tx-p.p.x,dz=tz-p.p.y,d=Math.hypot(dx,dz);if(d>.3){p.p.x+=dx/d*sp*dt;p.p.y+=dz/d*sp*dt;p.a=Math.atan2(dz,dx);p.ph+=dt*sp*1.6;p.m.anim(Math.min(sp,8),p.ph)}else p.m.anim(0,0);p.m.position.set(p.p.x,0,p.p.y);p.m.rotation.y=-p.a}
function refUpd(dt){const b=ball.position,tx=cl(b.x*.75-4,-40,40),tz=cl(b.z+(b.z>0?-8:8),-26,26),dx=tx-RF.position.x,dz=tz-RF.position.z,d=Math.hypot(dx,dz);if(d>1){const s=Math.min(6,d*1.5);RF.position.x+=dx/d*s*dt;RF.position.z+=dz/d*s*dt;RF.rotation.y=-Math.atan2(dz,dx);RF.anim(s,performance.now()/110)}}
function kickoff(){mode='play';cap('');rs();cam.position.set(0,14,24);reset();RF.position.set(0,0,12);st.run=true;ui(true)}
function startLineup(){mode='lineup';tt=0;cam.fov=45;cam.updateProjectionMatrix();cam.position.set(0,2.6,22);cam.lookAt(0,1.8,0);ball.position.set(0,.45,0);bv.set(0,0,0);owner=null;
P.forEach((p,i)=>{p.x0=(p.t?1.6:-16.6)+(i%11)*1.5;setP(p,p.x0,0,Math.PI/2)});RF.position.set(0,0,-.5);RF.rotation.y=-Math.PI/2;RF.anim(0,0);cap('National anthems')}
function shakeStart(){mode='shake';tt=0;cap('Exchanging handshakes');P.forEach(p=>setP(p,p.x0,p.t?1.3:-1.3,Math.PI/2))}
function toKick(){mode='wait';cap('');fade(1);setTimeout(()=>{kickoff();fade(0)},600)}
function toInt(){mode='wait';cap('');fade(1);setTimeout(()=>{mode='tunnel';tOut=true;tt=0;cam.fov=68;cam.updateProjectionMatrix();fade(0)},600)}
function afterTun(){mode='wait';cap('');fade(1);setTimeout(()=>{if(st.half===1&&st.min<1)startLineup();else kickoff();fade(0)},600)}
function inter(dt){
if(mode==='tunnel'){const o=tOut,z0=-tt*5;
if(o){cam.position.set(0,2.4,z0+4);cam.lookAt(0,1.7,z0-14);l1.position.set(0,3.8,z0)}else{cam.position.set(0,2.2,5);cam.lookAt(0,1.7,-20);l1.position.set(0,3.8,-2)}
const ry=o?Math.PI/2:-Math.PI/2;
WA.forEach((p,i)=>{const r=i%11;p.position.set(i<11?-1.1:1.1,0,o?z0-3-r*1.7:-22+tt*5-r*1.7);p.rotation.y=ry;p.anim(7,tt*9+i)});
RF2.position.set(0,0,o?z0-1:-22+tt*5+3.2);RF2.rotation.y=ry;RF2.anim(7,tt*9);
if(o&&tt>3.4){mode='room';tt=0;cap('');$('ht').classList.add('on');$('room').style.display='flex'}
else if(!o&&tt>5.6)afterTun()}
else{cam.position.set(100+Math.sin(tt*.35)*1.5,2.5,6);cam.lookAt(100,1.8,-3);C.position.y=Math.sin(tt*2)*.03}}
let last=performance.now();
function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;tt+=dt;ca*=.985;crowdA.position.y=Math.max(0,Math.sin(n/230))*.25*(1+ca);crowdB.position.y=Math.max(0,Math.sin(n/230+2.1))*.25*(1+ca);
if(mode==='tunnel'||mode==='room'){inter(dt);R.render(I,cam)}
else if(mode==='walkoff'){let i=0;P.forEach(p=>walk(p,(p.t?1:-1)*(2+(i++%11)*1.2),34,6.5,dt));RF.position.z+=Math.min(6,34-RF.position.z)*dt;if(tt>3.4)toInt();R.render(S,cam)}
else if(mode==='lineup'){if(tt>4)shakeStart();R.render(S,cam)}
else if(mode==='shake'){P.forEach(p=>walk(p,p.x0+(p.t?-4:4),p.t?1.3:-1.3,1.4,dt));if(tt>3.6)toKick();R.render(S,cam)}
else if(mode==='wait')R.render(S,cam);
else{if(!st.pause){step(dt);refUpd(dt)}if(u)mark.position.set(u.p.x,4.2,u.p.y);ctx();
const w=cam.aspect<1,b=ball.position,fx=cm===1&&u?u.p.x+cl(u.v.x*.5,-4,4):cl(b.x+bv.x*.3,-46,46),fz=cm===1&&u?u.p.y:b.z*.35,k=Math.min(1,dt*2.6),c=CM[cm],m=w?1.3:1;
cam.position.x+=(fx-cam.position.x)*k;cam.position.z+=(fz+c[1]*m-cam.position.z)*k;cam.position.y=c[0]*m;cam.lookAt(cam.position.x,0,cam.position.z-c[2]*m);
R.render(S,cam)}
requestAnimationFrame(loop)}
reset();requestAnimationFrame(loop);