const T=THREE,$=id=>document.getElementById(id),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const R=new T.WebGLRenderer({canvas:$('c'),antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;
const S=new T.Scene();S.background=new T.Color(0x16254a);S.fog=new T.Fog(0x0b1220,100,260);
const cam=new T.PerspectiveCamera(50,1,.1,400);
function rs(){const w=document.body.clientWidth,h=document.body.clientHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w<h?55:42;cam.updateProjectionMatrix()}
addEventListener('resize',rs);rs();
S.add(new T.HemisphereLight(0xbfd4ff,0x1a3a1a,.75));
const sun=new T.DirectionalLight(0xffffff,.9);sun.position.set(-30,60,30);sun.castShadow=true;
Object.assign(sun.shadow.camera,{left:-70,right:70,top:50,bottom:-50,far:200});sun.shadow.mapSize.set(1024,1024);S.add(sun);
function tex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'));return new T.CanvasTexture(c)}
const pc=document.createElement('canvas');pc.width=1024;pc.height=656;const g=pc.getContext('2d');
for(let i=0;i<10;i++){g.fillStyle=i%2?'#2a6e2e':'#327b36';g.fillRect(i*102.4,0,103,656)}for(let i=0;i<9000;i++){g.fillStyle=Math.random()<.5?'#00000012':'#ffffff12';g.fillRect(Math.random()*1024,Math.random()*656,3,3)}
g.strokeStyle='#e9f5e9';g.lineWidth=4;const sx=10.24,sz=10.25;
g.strokeRect(4,4,1016,648);g.beginPath();g.moveTo(512,0);g.lineTo(512,656);g.stroke();g.beginPath();g.arc(512,328,9.15*sx,0,7);g.stroke();
[0,1].forEach(s=>{g.strokeRect(s?1024-16.5*sx:0,328-20*sz,16.5*sx,40*sz);g.strokeRect(s?1024-5.5*sx:0,328-9*sz,5.5*sx,18*sz)});
const pt=new T.CanvasTexture(pc);pt.anisotropy=8;
const pitch=new T.Mesh(new T.PlaneGeometry(100,64),new T.MeshStandardMaterial({map:pt}));pitch.rotation.x=-Math.PI/2;pitch.receiveShadow=true;S.add(pitch);
const gr=new T.Mesh(new T.PlaneGeometry(420,320),new T.MeshStandardMaterial({color:0x1f5a24}));gr.rotation.x=-Math.PI/2;gr.position.y=-.03;S.add(gr);
const ad=tex(512,64,g=>{g.fillStyle='#0d2a5c';g.fillRect(0,0,512,64);g.fillStyle='#fff';g.font='bold 40px sans-serif';g.fillText('FT 90    UNITED CITY',10,46)});ad.wrapS=T.RepeatWrapping;ad.repeat.set(4,1);
[[100,1.1,.3,0,-34.6],[100,1.1,.3,0,34.6],[.3,1.1,69,-52,0],[.3,1.1,69,52,0]].forEach(a=>{const o=new T.Mesh(new T.BoxGeometry(a[0],a[1],a[2]),new T.MeshBasicMaterial({map:ad}));o.position.set(a[3],.55,a[4]);S.add(o)});
function goalMesh(s){const m=new T.MeshStandardMaterial({color:0xffffff}),x=50*s;
[-3.65,3.65].forEach(z=>{const p=new T.Mesh(new T.BoxGeometry(.2,2.44,.2),m);p.position.set(x,1.22,z);S.add(p)});
const b=new T.Mesh(new T.BoxGeometry(.2,.2,7.5),m);b.position.set(x,2.44,0);S.add(b);
const n=new T.Mesh(new T.BoxGeometry(3,2.44,7.3),new T.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.25}));n.position.set(x+1.6*s,1.22,0);S.add(n)}
goalMesh(1);goalMesh(-1);
const cc=document.createElement('canvas');cc.width=cc.height=256;const cg=cc.getContext('2d');cg.fillStyle='#1c1c22';cg.fillRect(0,0,256,256);
const cols=['#c0392b','#ecf0f1','#2980b9','#f1c40f','#7f8c8d'];for(let i=0;i<2200;i++){cg.fillStyle=cols[i%5];cg.fillRect(Math.random()*256,Math.random()*256,4,5)}
const ct=new T.CanvasTexture(cc);ct.wrapS=ct.wrapT=T.RepeatWrapping;ct.repeat.set(10,1);
function stand(x,z,w,ry){const gp=new T.Group(),m=new T.Mesh(new T.PlaneGeometry(w,24),new T.MeshStandardMaterial({map:ct,side:T.DoubleSide}));m.rotation.x=-.6;gp.add(m);gp.position.set(x,11,z);gp.rotation.y=ry;S.add(gp)}
stand(0,-40,130,0);stand(0,40,130,Math.PI);stand(-63,0,90,Math.PI/2);stand(63,0,90,-Math.PI/2);
[[-72,-48],[72,-48],[-72,48],[72,48]].forEach(([x,z])=>{const t=new T.Mesh(new T.CylinderGeometry(.5,.7,32,6),new T.MeshStandardMaterial({color:0x555a66}));t.position.set(x,16,z);S.add(t);
const h=new T.Mesh(new T.BoxGeometry(5,2.5,1),new T.MeshBasicMaterial({color:0xfff6d0}));h.position.set(x,33,z);h.lookAt(0,10,0);S.add(h)});
function mk(col,sc=S){const gp=new T.Group(),sh=new T.MeshStandardMaterial({color:col}),sm=new T.MeshStandardMaterial({color:0x151515});
const bd=new T.Mesh(new T.CylinderGeometry(.42,.38,1.1,10),sh);bd.position.y=1.35;
const hd=new T.Mesh(new T.SphereGeometry(.28,12,10),new T.MeshStandardMaterial({color:0xd9a77a}));hd.position.y=2.15;
const nz=new T.Mesh(new T.BoxGeometry(.22,.22,.3),sh);nz.position.set(.38,1.6,0);
gp.legs=[-.18,.18].map(z=>{const l=new T.Mesh(new T.BoxGeometry(.2,.8,.22),sm);l.geometry.translate(0,-.4,0);l.position.set(0,.85,z);gp.add(l);return l});
gp.add(bd,hd,nz);gp.traverse(o=>o.castShadow=true);gp.rotation.order='YXZ';gp.scale.setScalar(1.45);sc.add(gp);return gp}
const H=[[-46,0,1],[-26,-12],[-26,12],[-6,-15],[-6,15],[14,0]],P=[];
for(let t=0;t<2;t++)H.forEach(h=>P.push({m:mk(t?0xd8342f:0x2a7de1),t,gk:!!h[2],h:new T.Vector2(h[0]*(t?-1:1),h[1]),p:new T.Vector2(),v:new T.Vector2(),a:0,cd:0,hold:0,ph:0,lunge:0,imm:0,dv:0,dd:1,x0:0}));
const ball=new T.Mesh(new T.SphereGeometry(.45,16,12),new T.MeshStandardMaterial({color:0xffffff}));ball.castShadow=true;S.add(ball);
const bv=new T.Vector3(),mark=new T.Mesh(new T.ConeGeometry(.35,.7,8),new T.MeshBasicMaterial({color:0xfac775}));mark.rotation.x=Math.PI;S.add(mark);
let owner=null,u=null,jx=0,jy=0;const K={},st={sc:[0,0],min:0,half:1,run:false,m:{sp:1,pw:1,op:1}};
const sim=Sim.create({diff:.88}),INP={ix:0,iz:0,sprint:false},MR=.375;
function sync(dt){sim.p.forEach((s,i)=>{const p=P[i],v=Math.hypot(s.vx,s.vz);p.p.set(s.x,s.z);p.v.set(s.vx,s.vz);p.a=s.a;p.ph+=v*dt*1.6;
p.m.position.set(s.x,0,s.z);p.m.rotation.y=-s.a;p.m.rotation.x=s.dv>0?s.dd*(Math.cos(s.a)>0?1:-1)*1.3:0;
const sw=Math.sin(p.ph)*Math.min(v/8,1)*.9;p.m.legs[0].rotation.z=sw;p.m.legs[1].rotation.z=-sw});
const b=sim.ball;ball.position.set(b.x,b.y,b.z);bv.set(b.vx,b.vy,b.vz);owner=sim.owner>=0?P[sim.owner]:null;u=P[sim.user]||null}
function reset(){Sim.reset(sim);sim.mood=st.m;sync(0)}
function act(k){if(!st.run||st.pause)return;Sim.act(sim,k)}
const pad=$('pad'),kn=$('kn');
function pm(e){const r=pad.getBoundingClientRect();let dx=e.clientX-r.left-60,dy=e.clientY-r.top-60;const l=Math.hypot(dx,dy);if(l>50){dx*=50/l;dy*=50/l}jx=dx/50;jy=dy/50;kn.style.transform=`translate(${dx}px,${dy}px)`}
pad.addEventListener('pointerdown',e=>{pad.setPointerCapture(e.pointerId);pm(e)});pad.addEventListener('pointermove',e=>{if(pad.hasPointerCapture(e.pointerId))pm(e)});
const up=()=>{jx=jy=0;kn.style.transform=''};pad.addEventListener('pointerup',up);pad.addEventListener('pointercancel',up);
$('sh').addEventListener('pointerdown',()=>act(1));$('ps').addEventListener('pointerdown',()=>act(0));$('lb').addEventListener('pointerdown',()=>act(2));$('sk').addEventListener('pointerdown',()=>act(3));
const sp0=()=>sprint=false;$('sp').addEventListener('pointerdown',()=>sprint=true);['pointerup','pointerleave','pointercancel'].forEach(e=>$('sp').addEventListener(e,sp0));
addEventListener('keydown',e=>{K[e.code]=1;if(e.code==='Space')act(1);if(e.code==='KeyE')act(0);if(e.code==='KeyQ')act(2);if(e.code==='KeyF')act(3)});addEventListener('keyup',e=>K[e.code]=0);
function banner(t){const m=$('msg');m.textContent=t;m.style.display=t?'block':'none'}
function upd(){$('sc').textContent=st.sc[0]+' - '+st.sc[1];$('tm').textContent=Math.min(90,Math.floor(st.min))+"'"}
function goal(t){st.sc[t]++;st.run=false;owner=null;banner('Goal! '+(t?'City':'United'));upd();setTimeout(()=>{banner('');reset();st.run=true},2000)}
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
for(const e of sim.ev)if(e.type==='goal'){goal(e.t);break}}
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
const WA=[...Array(12)].map((_,i)=>mk(i<6?0x2a7de1:0xd8342f,I)),RF2=mk(0xf4d03f,I),C=mk(0x111111,I);
[-4.2,-2.4,2.4,4.2].forEach(x=>{const p=mk(0x2a7de1,I);p.position.set(100+x,0,-.5);p.rotation.y=x<0?0:Math.PI});
C.position.set(100,0,-1);C.rotation.y=-Math.PI/2;
let mode='play',tt=0,tOut=false,cm=0,stam=1,sprint=false;
const CM=[[14,24,20],[8,15,9],[26,34,25]],CN=['broadcast','player','wide'];
const RF=mk(0xf4d03f);RF.position.set(0,0,12);
document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{Sim.setFormation(sim,0,b.dataset.f);$('fm').textContent='Formation '+b.dataset.f});
$('cmb').onclick=()=>{cm=(cm+1)%3;$('cmb').textContent='Camera: '+CN[cm]};
$('pz').onclick=()=>{st.pause=true;$('pm').classList.add('on')};$('rsm').onclick=()=>{st.pause=false;$('pm').classList.remove('on')};
const cap=t=>{$('cp').textContent=t},fade=f=>{$('fd').style.opacity=f?1:0};
function ui(on){const d=on?'block':'none',f=on?'flex':'none';$('pad').style.display=d;document.querySelectorAll('.b').forEach(e=>e.style.display=f);$('pz').style.display=f;$('stm').style.display=d}
function setP(p,x,z,a){p.p.set(x,z);p.a=a;p.v.set(0,0);p.m.position.set(x,0,z);p.m.rotation.set(0,-a,0);p.m.legs[0].rotation.z=p.m.legs[1].rotation.z=0}
function walk(p,tx,tz,sp,dt){const dx=tx-p.p.x,dz=tz-p.p.y,d=Math.hypot(dx,dz);if(d>.3){p.p.x+=dx/d*sp*dt;p.p.y+=dz/d*sp*dt;p.a=Math.atan2(dz,dx);p.ph+=dt*sp*1.6;const s=Math.sin(p.ph)*.8;p.m.legs[0].rotation.z=s;p.m.legs[1].rotation.z=-s}p.m.position.set(p.p.x,0,p.p.y);p.m.rotation.y=-p.a}
function refUpd(dt){const b=ball.position,tx=cl(b.x*.75-4,-40,40),tz=cl(b.z+(b.z>0?-8:8),-26,26),dx=tx-RF.position.x,dz=tz-RF.position.z,d=Math.hypot(dx,dz);if(d>1){const s=Math.min(6,d*1.5);RF.position.x+=dx/d*s*dt;RF.position.z+=dz/d*s*dt;RF.rotation.y=-Math.atan2(dz,dx);const w=Math.sin(performance.now()/110)*.8*Math.min(1,s/5);RF.legs[0].rotation.z=w;RF.legs[1].rotation.z=-w}}
function kickoff(){mode='play';cap('');rs();cam.position.set(0,14,24);reset();RF.position.set(0,0,12);st.run=true;ui(true)}
function startLineup(){mode='lineup';tt=0;cam.fov=45;cam.updateProjectionMatrix();cam.position.set(0,2.4,17);cam.lookAt(0,1.8,0);ball.position.set(0,.45,0);bv.set(0,0,0);owner=null;
P.forEach((p,i)=>{p.x0=(p.t?1.5:-14.5)+(i%6)*2.6;setP(p,p.x0,0,Math.PI/2)});RF.position.set(0,0,-.5);RF.rotation.y=-Math.PI/2;RF.legs[0].rotation.z=RF.legs[1].rotation.z=0;cap('National anthems')}
function shakeStart(){mode='shake';tt=0;cap('Exchanging handshakes');P.forEach(p=>setP(p,p.x0,p.t?1.3:-1.3,Math.PI/2))}
function toKick(){mode='wait';cap('');fade(1);setTimeout(()=>{kickoff();fade(0)},600)}
function toInt(){mode='wait';cap('');fade(1);setTimeout(()=>{mode='tunnel';tOut=true;tt=0;cam.fov=68;cam.updateProjectionMatrix();fade(0)},600)}
function afterTun(){mode='wait';cap('');fade(1);setTimeout(()=>{if(st.half===1&&st.min<1)startLineup();else kickoff();fade(0)},600)}
function inter(dt){
if(mode==='tunnel'){const o=tOut,z0=-tt*5;
if(o){cam.position.set(0,2.4,z0+4);cam.lookAt(0,1.7,z0-14);l1.position.set(0,3.8,z0)}else{cam.position.set(0,2.2,5);cam.lookAt(0,1.7,-20);l1.position.set(0,3.8,-2)}
const ry=o?Math.PI/2:-Math.PI/2;
WA.forEach((p,i)=>{const r=i%6;p.position.set(i<6?-1.1:1.1,0,o?z0-3-r*1.7:-26+tt*5-r*2.2);p.rotation.y=ry;const s=Math.sin(tt*9+i)*.8;p.legs[0].rotation.z=s;p.legs[1].rotation.z=-s});
RF2.position.set(0,0,o?z0-1:-26+tt*5+3.2);RF2.rotation.y=ry;const q=Math.sin(tt*9)*.8;RF2.legs[0].rotation.z=q;RF2.legs[1].rotation.z=-q;
if(o&&tt>3.4){mode='room';tt=0;cap('');$('ht').classList.add('on');$('room').style.display='flex'}
else if(!o&&tt>6)afterTun()}
else{cam.position.set(100+Math.sin(tt*.35)*1.5,2.5,6);cam.lookAt(100,1.8,-3);C.position.y=Math.sin(tt*2)*.03}}
let last=performance.now();
function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;tt+=dt;ct.offset.y=Math.abs(Math.sin(n/180))*.012;
if(mode==='tunnel'||mode==='room'){inter(dt);R.render(I,cam)}
else if(mode==='walkoff'){let i=0;P.forEach(p=>walk(p,(p.t?1:-1)*(2+(i++%6)*1.3),34,6.5,dt));RF.position.z+=Math.min(6,34-RF.position.z)*dt;if(tt>3.4)toInt();R.render(S,cam)}
else if(mode==='lineup'){if(tt>4)shakeStart();R.render(S,cam)}
else if(mode==='shake'){P.forEach(p=>walk(p,p.x0+(p.t?-4:4),p.t?1.3:-1.3,1.4,dt));if(tt>3.6)toKick();R.render(S,cam)}
else if(mode==='wait')R.render(S,cam);
else{if(!st.pause){step(dt);refUpd(dt)}if(u)mark.position.set(u.p.x,4.2,u.p.y);
const w=cam.aspect<1,b=ball.position,fx=cm===1&&u?u.p.x:cl(u?b.x*.5+u.p.x*.5:b.x,-44,44),fz=cm===1&&u?u.p.y:(u?b.z*.3+u.p.y*.3:0),k=Math.min(1,dt*3),c=CM[cm],m=w?1.35:1;
cam.position.x+=(fx-cam.position.x)*k;cam.position.z+=(fz+c[1]*m-cam.position.z)*k;cam.position.y=c[0]*m;cam.lookAt(cam.position.x,0,cam.position.z-c[2]*m);
R.render(S,cam)}
requestAnimationFrame(loop)}
reset();requestAnimationFrame(loop);