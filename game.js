const T=THREE,$=id=>document.getElementById(id),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k;
const R=new T.WebGLRenderer({canvas:$('c'),antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;
const S=new T.Scene();S.background=new T.Color(0x16254a);S.fog=new T.Fog(0x0b1220,170,400);
const cam=new T.PerspectiveCamera(50,1,.1,500);
function rs(){const w=document.body.clientWidth,h=document.body.clientHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w<h?55:(typeof mode!=='undefined'&&mode==='walk'?50:44);cam.updateProjectionMatrix()}
addEventListener('resize',rs);
S.add(new T.HemisphereLight(0xbfd4ff,0x1a3a1a,.8));
const sun=new T.DirectionalLight(0xffffff,.9);sun.position.set(-30,60,30);sun.castShadow=true;
Object.assign(sun.shadow.camera,{left:-70,right:70,top:50,bottom:-50,far:200});sun.shadow.mapSize.set(1024,1024);S.add(sun);
function tex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),c);return new T.CanvasTexture(c)}
/* ---------- pitch ---------- */
const pc=document.createElement('canvas');pc.width=1100;pc.height=720;const g=pc.getContext('2d');
for(let i=0;i<22;i++){g.fillStyle=i%2?'#2a6e2e':'#327b36';g.fillRect(i*50,0,51,720)}for(let i=0;i<14000;i++){g.fillStyle=Math.random()<.5?'#00000012':'#ffffff12';g.fillRect(Math.random()*1100,Math.random()*720,3,3)}
g.strokeStyle='#e9f5e9';g.lineWidth=4;const sx=10,sz=10;
g.strokeRect(4,4,1092,712);g.beginPath();g.moveTo(550,0);g.lineTo(550,720);g.stroke();g.beginPath();g.arc(550,360,9.15*sx,0,7);g.stroke();g.beginPath();g.arc(550,360,5,0,7);g.fill();
[0,1].forEach(s=>{g.strokeRect(s?1100-16.5*sx:0,360-20*sz,16.5*sx,40*sz);g.strokeRect(s?1100-5.5*sx:0,360-9*sz,5.5*sx,18*sz);g.beginPath();g.arc(s?1100-11*sx:11*sx,360,4,0,7);g.fill();
g.beginPath();g.arc(s?1100-11*sx:11*sx,360,9.15*sx,s?Math.PI*.69:-Math.PI*.31,s?Math.PI*1.31:Math.PI*.31);g.stroke()});
const pt=new T.CanvasTexture(pc);pt.anisotropy=8;
const pitch=new T.Mesh(new T.PlaneGeometry(110,72),new T.MeshStandardMaterial({map:pt}));pitch.rotation.x=-Math.PI/2;pitch.receiveShadow=true;S.add(pitch);
const gr=new T.Mesh(new T.PlaneGeometry(520,420),new T.MeshStandardMaterial({color:0x1f5a24}));gr.rotation.x=-Math.PI/2;gr.position.y=-.03;S.add(gr);
const apron=new T.Mesh(new T.PlaneGeometry(126,84),new T.MeshStandardMaterial({color:0x2b6a30}));apron.rotation.x=-Math.PI/2;apron.position.y=-.015;S.add(apron);
const ad=tex(512,64,g=>{g.fillStyle='#0d2a5c';g.fillRect(0,0,512,64);g.fillStyle='#fff';g.font='bold 40px sans-serif';g.fillText('FT 90    UNITED CITY',10,46)});ad.wrapS=T.RepeatWrapping;ad.repeat.set(4,1);
const adM=new T.MeshBasicMaterial({map:ad});
[[50.5,1.1,.3,-29.75,-37.6],[50.5,1.1,.3,29.75,-37.6],[110,1.1,.3,0,37.6],[.3,1.1,76,-57,0],[.3,1.1,76,57,0]].forEach(a=>{const o=new T.Mesh(new T.BoxGeometry(a[0],a[1],a[2]),adM);o.position.set(a[3],.55,a[4]);S.add(o)});
function goalMesh(s){const postMat=new T.MeshStandardMaterial({color:0xffffff,roughness:.35,metalness:.12}),netMat=new T.MeshBasicMaterial({color:0xeaf2f5,wireframe:true,transparent:true,opacity:.22,side:T.DoubleSide}),x=55*s;
// Regulation-sized frame with a deeper, visibly structured net.
[-3.66,3.66].forEach(z=>{const p=new T.Mesh(new T.BoxGeometry(.16,2.44,.16),postMat);p.position.set(x,1.22,z);p.castShadow=true;S.add(p)});
const bar=new T.Mesh(new T.BoxGeometry(.16,.16,7.44),postMat);bar.position.set(x,2.44,0);bar.castShadow=true;S.add(bar);
const n=new T.Mesh(new T.BoxGeometry(3.1,2.42,7.28),netMat);n.position.set(x+1.55*s,1.21,0);S.add(n);
const rear=new T.Mesh(new T.BoxGeometry(.08,2.42,7.28),netMat);rear.position.set(x+3.08*s,1.21,0);S.add(rear);
for(let z=-3.5;z<=3.51;z+=.5){const v=new T.Mesh(new T.BoxGeometry(3.08,.025,.025),netMat);v.position.set(x+1.55*s,Math.min(2.35,2.25),z);S.add(v)}}
goalMesh(1);goalMesh(-1);
[[-55,-36],[55,-36],[-55,36],[55,36]].forEach(([x,z])=>{const p=new T.Mesh(new T.CylinderGeometry(.05,.05,1.6,5),new T.MeshBasicMaterial({color:0xffffff}));p.position.set(x,.8,z);S.add(p);const f=new T.Mesh(new T.PlaneGeometry(.6,.4),new T.MeshBasicMaterial({color:0xf1c40f,side:T.DoubleSide}));f.position.set(x+.3,1.4,z);S.add(f)});
/* ---------- stadium: solid two-tier banks, sections, concourse, gates, roofs ---------- */
let ca=0;const crowdA=new T.Group(),crowdB=new T.Group();S.add(crowdA,crowdB);
const conc=new T.MeshStandardMaterial({color:0x4a505e,roughness:.95}),concD=new T.MeshStandardMaterial({color:0x2c303a,roughness:1}),seatRec=[];
const KT=[0xc0392b,0xecf0f1,0x2980b9,0xf1c40f,0x7f8c8d,0x27ae60,0x8e44ad,0x1c1c22,0xe67e22,0xd8342f],SKT=[0xf1c6a0,0xd9a77a,0xb07850,0x7a4a2a,0x4a2c1a];
const BLU=[0x2a7de1,0xffffff,0x1d5fb0,0x0b1b3a],RED=[0xd8342f,0xffffff,0x8e1b17,0x15151a],SUIT=[0x1c1c22,0x394150,0xecf0f1,0x7f8c8d,0x2c3e50,0xbdc3c7];
const pick=a=>a[(Math.random()*a.length)|0];
function bank(kind,sg,a0,a1,d0,rows,y0,rise,run,base,tier){
const sh=new T.Shape();sh.moveTo(d0,0);for(let r=0;r<rows;r++){const h=y0+r*rise;sh.lineTo(d0+r*run,h);sh.lineTo(d0+(r+1)*run,h)}sh.lineTo(d0+rows*run,0);sh.lineTo(d0,0);
const m=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:a1-a0,bevelEnabled:false}),conc);m.receiveShadow=true;
if(kind==='x'){if(sg>0){m.rotation.y=-Math.PI/2;m.position.set(a1,0,base)}else{m.rotation.y=Math.PI/2;m.position.set(a0,0,-base)}}
else{if(sg>0)m.position.set(base,0,a0);else{m.rotation.y=Math.PI;m.position.set(-base,0,a1)}}
S.add(m);
for(let r=0;r<rows;r++){const d=d0+(r+.5)*run,y=y0+r*rise;let c=0;for(let a=a0+.6;a<a1-.3;a+=1.04,c++){if((c+((a0*7)|0))%17===0||Math.random()<.08)continue;seatRec.push({a,d,y,r,kind,sg,base,tier,c})}}}
function crowdCol(s){const lo=s.tier===0;
if(s.kind==='z'){const pal=s.sg<0?BLU:RED;return (Math.floor(s.a/3)+s.r)%4<2?pal[0]:pal[1]}
if(Math.abs(s.a)<24)return s.sg<0?pick(SUIT):(Math.random()<.6?pick(KT):pick(SUIT));
const pal=s.a<0?BLU:RED;return Math.random()<(lo?.72:.55)?pick(pal):pick(KT)}
function conc2(kind,sg,a0,a1,base){const len=a1-a0,mid=(a0+a1)/2;
const slab=new T.Mesh(new T.BoxGeometry(kind==='x'?len:3.2,.3,kind==='x'?3.2:len),concD);
const adv=new T.Mesh(new T.BoxGeometry(kind==='x'?len:.15,1.1,kind==='x'?.15:len),adM);
const wall=new T.Mesh(new T.BoxGeometry(kind==='x'?len:.3,3.3,kind==='x'?.3:len),concD);
const dd=7.35+1.6,dw=10.45;
if(kind==='x'){slab.position.set(mid,5.85,sg*(base+dd));adv.position.set(mid,7.7,sg*(base+dw-.1));wall.position.set(mid,7.6,sg*(base+dw+.1))}
else{slab.position.set(sg*(base+dd),5.85,mid);adv.position.set(sg*(base+dw-.1),7.7,mid);wall.position.set(sg*(base+dw+.1),7.6,mid)}
adv.material=adM;S.add(slab,wall,adv);
for(let a=a0+14;a<a1-8;a+=26){const gate=new T.Mesh(new T.BoxGeometry(kind==='x'?3.6:.4,2.8,kind==='x'?.4:3.6),new T.MeshBasicMaterial({color:0x07090d}));
const fr=new T.Mesh(new T.BoxGeometry(kind==='x'?4.2:.3,3.3,kind==='x'?.3:4.2),new T.MeshBasicMaterial({color:0xffe8b0}));
if(kind==='x'){gate.position.set(a,7.4,sg*(base+dw-.35));fr.position.set(a,7.55,sg*(base+dw-.15))}else{gate.position.set(sg*(base+dw-.35),7.4,a);fr.position.set(sg*(base+dw-.15),7.55,a)}S.add(fr,gate)}}
[-1,1].forEach(sg=>(sg<0?[[-80,-4.5],[4.5,80]]:[[-80,80]]).forEach(([a0,a1])=>{bank('x',sg,a0,a1,0,7,.9,.85,1.05,42,0);bank('x',sg,a0,a1,10.55,7,9.3,.95,1.05,42,1);if(sg>0)bank('x',sg,a0,a1,17.9,8,16,1,1.05,42,2);conc2('x',sg,a0,a1,42)}));
[-1,1].forEach(sg=>{bank('z',sg,-42,42,0,7,.9,.85,1.05,60,0);bank('z',sg,-42,42,10.55,7,9.3,.95,1.05,60,1);bank('z',sg,-42,42,17.9,8,16,1,1.05,60,2);conc2('z',sg,-42,42,60)});
(function(){const bg=new T.BoxGeometry(.55,.75,.4),hg=new T.SphereGeometry(.22,5,3),m1=new T.MeshStandardMaterial({color:0xffffff}),m2=new T.MeshStandardMaterial({color:0xffffff});
const half=[[],[]];seatRec.forEach((s,i)=>{const w=s.kind==='x'?[s.a,s.y+.42,s.sg*(s.base+s.d)]:[s.sg*(s.base+s.d),s.y+.42,s.a];half[i%2].push([w,crowdCol(s)])});
half.forEach((arr,h)=>{const b=new T.InstancedMesh(bg,m1,arr.length),hd=new T.InstancedMesh(hg,m2,arr.length),arL=new T.InstancedMesh(new T.BoxGeometry(.13,.48,.14),m1,arr.length),arR=new T.InstancedMesh(new T.BoxGeometry(.13,.48,.14),m1,arr.length),mx=new T.Matrix4(),col=new T.Color();
arr.forEach(([s,c],i)=>{mx.makeTranslation(s[0],s[1],s[2]);b.setMatrixAt(i,mx);b.setColorAt(i,col.setHex(c));
mx.makeTranslation(s[0],s[1]+.6,s[2]);hd.setMatrixAt(i,mx);hd.setColorAt(i,col.setHex(pick(SKT)));
// Visible arms turn the old head-and-torso crowd silhouettes into recognisable seated human figures.
mx.makeRotationZ((i%9===0)?-.55:.12);mx.setPosition(s[0]-.34,s[1]+.02,s[2]);arL.setMatrixAt(i,mx);arL.setColorAt(i,col.setHex(c));
mx.makeRotationZ((i%7===0)?.55:-.12);mx.setPosition(s[0]+.34,s[1]+.02,s[2]);arR.setMatrixAt(i,mx);arR.setColorAt(i,col.setHex(c))});
[b,hd,arL,arR].forEach(q=>{q.instanceMatrix.needsUpdate=true;if(q.instanceColor)q.instanceColor.needsUpdate=true});(h?crowdB:crowdA).add(b,hd,arL,arR)})})();
/* roofs, supports, floodlights */
const roofM=new T.MeshStandardMaterial({color:0x2a2e38,roughness:.8}),steel=new T.MeshStandardMaterial({color:0x555a66}),lampM=new T.MeshBasicMaterial({color:0xfff6d0});
[-1,1].forEach(sg=>{const r=new T.Mesh(new T.BoxGeometry(172,.6,sg<0?15:34),roofM);r.position.set(0,30,sg<0?-56:sg*65.5);S.add(r);
const e=new T.Mesh(new T.BoxGeometry(172,.35,.5),lampM);e.position.set(0,29.6,sg*(42+6.6));S.add(e);
const e2=new T.Mesh(new T.BoxGeometry(34,.6,86),roofM);e2.position.set(sg*83.5,30,0);S.add(e2);
const e3=new T.Mesh(new T.BoxGeometry(.5,.35,86),lampM);e3.position.set(sg*(60+6.6),29.6,0);S.add(e3);
for(let x=-80;x<=80;x+=20){const c=new T.Mesh(new T.CylinderGeometry(.55,.55,30,6),steel);c.position.set(x,15,sg<0?-63.5:sg*72);S.add(c)}
for(let z=-40;z<=40;z+=20){const c=new T.Mesh(new T.CylinderGeometry(.55,.55,30,6),steel);c.position.set(sg*92,15,z);S.add(c)}});
[[-92,-66],[92,-66],[-92,66],[92,66]].forEach(([x,z])=>{const t=new T.Mesh(new T.CylinderGeometry(.6,.9,36,6),steel);t.position.set(x,18,z);S.add(t);
const h=new T.Mesh(new T.BoxGeometry(7,3.4,1),lampM);h.position.set(x,37,z);h.lookAt(0,10,0);S.add(h)});
/* Inner-bowl identity, broadcast scoreboard, roof trusses and section wayfinding. */
const screenTex=tex(768,300,g=>{g.fillStyle='#071226';g.fillRect(0,0,768,300);g.fillStyle='#143a70';g.fillRect(0,0,768,62);g.fillStyle='#fff';g.font='bold 48px sans-serif';g.textAlign='center';g.fillText('FT 90  ·  MATCHDAY',384,44);g.fillStyle='#f7f9fc';g.font='bold 108px sans-serif';g.fillText('UNITED  0 — 0  CITY',384,180);g.fillStyle='#62e6b2';g.font='bold 28px sans-serif';g.fillText('THE GAME NEVER ENDS',384,246)});
const screenMat=new T.MeshBasicMaterial({map:screenTex,side:T.DoubleSide});
[-1,1].forEach(sg=>{const screen=new T.Mesh(new T.PlaneGeometry(22,8),screenMat);screen.position.set(0,15.8,sg*45);screen.rotation.y=sg<0?0:Math.PI;S.add(screen);
for(let x=-76;x<=76;x+=8){const beam=new T.Mesh(new T.BoxGeometry(.22,.22,18),steel);beam.position.set(x,20.4,sg*47);S.add(beam)}
for(let x=-70;x<=70;x+=14){const banner=new T.Mesh(new T.PlaneGeometry(3.8,2.3),new T.MeshBasicMaterial({map:tex(256,128,g=>{g.fillStyle='#101a2e';g.fillRect(0,0,256,128);g.fillStyle=x%2?'#e8f0ff':'#e7c66b';g.font='bold 32px sans-serif';g.textAlign='center';g.fillText(x%2?'FT90':'MATCHDAY',128,75)}),side:T.DoubleSide}));banner.position.set(x,12.2,sg*55);banner.rotation.y=sg<0?0:Math.PI;S.add(banner)} });
// A second inner LED ribbon and clearly marked section entrances add scale to the bowl.
[-1,1].forEach(sg=>{const ribbon=new T.Mesh(new T.BoxGeometry(150,.55,.35),new T.MeshBasicMaterial({map:ad}));ribbon.position.set(0,9.9,sg*51.6);S.add(ribbon)});
for(let i=0;i<8;i++){const x=-70+i*20;const board=new T.Mesh(new T.PlaneGeometry(4,1.2),new T.MeshBasicMaterial({map:tex(256,80,g=>{g.fillStyle='#111827';g.fillRect(0,0,256,80);g.fillStyle='#fff';g.font='bold 38px sans-serif';g.textAlign='center';g.fillText('SECTION '+String.fromCharCode(65+i),128,52)}),side:T.DoubleSide}));board.position.set(x,8.2,-51.9);S.add(board)}
/* tunnel housing sign over the players' tunnel (north side) */
const housing=new T.Group();S.add(housing);
{const blk=new T.Mesh(new T.BoxGeometry(9.5,11.1,17.9),concD);blk.position.set(0,9.45,-(42+8.95));housing.add(blk);
const sg=new T.Mesh(new T.PlaneGeometry(8.6,1.5),new T.MeshBasicMaterial({map:tex(512,90,g=>{g.fillStyle='#0b1b3a';g.fillRect(0,0,512,90);g.fillStyle='#fff';g.font='bold 54px Barlow Condensed, sans-serif';g.textAlign='center';g.fillText("PLAYERS' TUNNEL",256,64)})}));sg.position.set(0,8.2,-41.9);housing.add(sg)}
/* ---------- exterior arrival plaza: FT90's Bernabeu-inspired matchday approach ---------- */
const ext=new T.Group();S.add(ext);
const facade=new T.MeshStandardMaterial({color:0x8a909a,metalness:.68,roughness:.38});
const facadeDark=new T.MeshStandardMaterial({color:0x202733,metalness:.35,roughness:.62});
const glass=new T.MeshStandardMaterial({color:0x152a43,metalness:.5,roughness:.22,emissive:0x071426});
const gateGlow=new T.MeshBasicMaterial({color:0x9edbff});
// Large, continuous metallic outer skin, with a deliberate central arrival gate.
[-1,1].forEach(side=>{
 const wing=new T.Mesh(new T.BoxGeometry(36,21,5),facade);wing.position.set(side*26,10.5,-93);ext.add(wing);
 const glazing=new T.Mesh(new T.BoxGeometry(34,11,.22),glass);glazing.position.set(side*26,12,-90.35);ext.add(glazing);
 for(let x=9;x<43;x+=2.2){const rib=new T.Mesh(new T.BoxGeometry(.28,20,.35),new T.MeshStandardMaterial({color:0xc2c7ce,metalness:.7,roughness:.35}));rib.position.set(side*x,10.5,-90.1);ext.add(rib)}
 const tower=new T.Mesh(new T.BoxGeometry(8,27,7),facadeDark);tower.position.set(side*49,13.5,-92);ext.add(tower);
 const strip=new T.Mesh(new T.BoxGeometry(8.1,.5,7.1),gateGlow);strip.position.set(side*49,24,-92);ext.add(strip);
});
const canopy=new T.Mesh(new T.BoxGeometry(22,1.2,12),facadeDark);canopy.position.set(0,18.5,-91.5);ext.add(canopy);
const entrySign=new T.Mesh(new T.PlaneGeometry(19,3.4),new T.MeshBasicMaterial({map:tex(1024,180,g=>{g.fillStyle='#081528';g.fillRect(0,0,1024,180);g.fillStyle='#d8ecff';g.font='bold 98px sans-serif';g.textAlign='center';g.fillText('FT90 STADIUM',512,120)}),side:T.DoubleSide}));entrySign.position.set(0,15.9,-87.2);ext.add(entrySign);
// Arrival plaza and a lit pedestrian route leading to the central gate.
const plaza=new T.Mesh(new T.PlaneGeometry(130,64),new T.MeshStandardMaterial({color:0x555d68,roughness:.95}));plaza.rotation.x=-Math.PI/2;plaza.position.set(0,.02,-124);ext.add(plaza);
const path=new T.Mesh(new T.PlaneGeometry(18,52),new T.MeshStandardMaterial({color:0x737b86,roughness:.9}));path.rotation.x=-Math.PI/2;path.position.set(0,.04,-116);ext.add(path);
for(let z=-142;z<=-96;z+=8){[-10.2,10.2].forEach(x=>{const l=new T.Mesh(new T.BoxGeometry(.22,.22,.22),gateGlow);l.position.set(x,.2,z);ext.add(l)})}
// Team coach parked at the arrival bay.
const bus=new T.Group();ext.add(bus);
const busBody=new T.Mesh(new T.BoxGeometry(17,4.2,3.8),new T.MeshStandardMaterial({color:0x101d36,metalness:.35,roughness:.3}));busBody.position.y=2.45;bus.add(busBody);
const busGlass=new T.Mesh(new T.BoxGeometry(14.6,1.25,3.9),glass);busGlass.position.set(0,3.35,0);bus.add(busGlass);
const busStripe=new T.Mesh(new T.BoxGeometry(16.7,.42,3.95),new T.MeshBasicMaterial({color:0x2a7de1}));busStripe.position.set(0,1.85,0);bus.add(busStripe);
for(let x=-6.2;x<=6.3;x+=4.1){const wheel=new T.Mesh(new T.CylinderGeometry(.78,.78,.32,12),new T.MeshStandardMaterial({color:0x090b10,roughness:1}));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.85,2);bus.add(wheel);const wheel2=wheel.clone();wheel2.position.z=-2;bus.add(wheel2)}
const busLabel=new T.Mesh(new T.PlaneGeometry(8,.9),new T.MeshBasicMaterial({map:tex(512,80,g=>{g.fillStyle='#101d36';g.fillRect(0,0,512,80);g.fillStyle='#fff';g.font='bold 58px sans-serif';g.textAlign='center';g.fillText('FT90 UNITED',256,59)}),side:T.DoubleSide}));busLabel.position.set(0,2.55,1.96);bus.add(busLabel);bus.position.set(-28,0,-126);bus.rotation.y=Math.PI/2;
// Arrival barriers; full human supporter models are placed after the shared character builder.
const barrierM=new T.MeshStandardMaterial({color:0x9aa3ad,metalness:.65,roughness:.45});
[-1,1].forEach(side=>{const rail=new T.Mesh(new T.BoxGeometry(1,1.25,25),barrierM);rail.position.set(side*12,.65,-113);ext.add(rail);for(let z=-125;z<=-101;z+=4){const post=new T.Mesh(new T.CylinderGeometry(.055,.055,1.25,8),barrierM);post.position.set(side*12,.65,z);ext.add(post)}});
// Exterior should only be seen during the arrival sequence; it is hidden during play.
ext.visible=false;
/* Broadcast-grade dugouts and technical areas: transparent canopy, individual bucket seats, staff and coaches. */
const dugoutPeople=[],dugoutTeams=[];
[-15,15].forEach((x,team)=>{const d=new T.Group(),glass=new T.MeshPhysicalMaterial({color:0x9bd0ff,transparent:true,opacity:.18,roughness:.18,metalness:.15,side:T.DoubleSide}),frame=new T.MeshStandardMaterial({color:0x20242e,metalness:.55,roughness:.42}),seatmat=new T.MeshStandardMaterial({color:team?0xc52b31:0x246bd0,roughness:.6});
const roof=new T.Mesh(new T.BoxGeometry(12.8,.18,3.25),frame);roof.position.set(0,2.32,0);d.add(roof);
const front=new T.Mesh(new T.BoxGeometry(12.4,2.1,.08),glass);front.position.set(0,1.14,-1.55);d.add(front);
[-6.2,6.2].forEach(sx=>{const post=new T.Mesh(new T.BoxGeometry(.12,2.35,3.2),frame);post.position.set(sx,1.15,0);d.add(post)});
const back=new T.Mesh(new T.BoxGeometry(12.4,1.9,.08),glass);back.position.set(0,1.05,1.55);d.add(back);
for(let i=0;i<8;i++){const sx=-5.1+i*1.46;const base=new T.Mesh(new T.BoxGeometry(1.12,.16,.86),seatmat);base.position.set(sx,.68,.42);d.add(base);const backrest=new T.Mesh(new T.BoxGeometry(1.12,.7,.12),seatmat);backrest.position.set(sx,1.05,.79);d.add(backrest);const arm1=new T.Mesh(new T.BoxGeometry(.08,.32,.65),frame);arm1.position.set(sx-.52,.86,.42);d.add(arm1);const arm2=arm1.clone();arm2.position.x=sx+.52;d.add(arm2)}
const fascia=new T.Mesh(new T.BoxGeometry(12.7,.22,.12),new T.MeshBasicMaterial({color:team?0xe74c3c:0x2a7de1}));fascia.position.set(0,2.2,-1.62);d.add(fascia);d.position.set(x,0,40.6);S.add(d);
dugoutTeams.push([x,team]);
});
/* ---------- players: shared geometry, tapered kit, face, hair styles, procedural gait ---------- */
const SK=[0xf1c6a0,0xd9a77a,0xb07850,0x7a4a2a,0x4a2c1a],HR=[0x1a1208,0x3a2512,0x6b4a22,0xc9a24a,0x111111],NT={},GC={},MC={};
const mat=(c,r=.85)=>{const k=c+'_'+r;return MC[k]||(MC[k]=new T.MeshStandardMaterial({color:c,roughness:r}))};
const gCyl=(r1,r2,h,pv,seg)=>{const k=['c',r1,r2,h,pv,seg].join();return GC[k]||(GC[k]=(()=>{const q=new T.CylinderGeometry(r1,r2,h,seg||8);q.translate(0,pv==='top'?-h/2:h/2,0);return q})())};
const gBox=(w,h,d)=>{const k=['b',w,h,d].join();return GC[k]||(GC[k]=new T.BoxGeometry(w,h,d))};
const gSph=(r,a,b,p0,pl,t0,tl)=>{const k=['s',r,a,b,p0,pl,t0,tl].join();return GC[k]||(GC[k]=new T.SphereGeometry(r,a||10,b||8,p0||0,pl||Math.PI*2,t0||0,tl||Math.PI))};
function numTex(n){return NT[n]||(NT[n]=tex(64,64,g=>{g.clearRect(0,0,64,64);g.lineWidth=6;g.strokeStyle='#0008';g.fillStyle='#fff';g.font='bold 46px sans-serif';g.textAlign='center';g.strokeText(n,32,48);g.fillText(n,32,48)}))}
function mk(col,sc,o){sc=sc||S;o=o||{};const gp=new T.Group(),M=mat,sh=M(col),shorts=M(o.shorts===undefined?0xf2f2f2:o.shorts),sock=M(o.sock===undefined?col:o.sock),skin=M(SK[o.skin||0]),hair=M(HR[o.hair||0]),boot=M(o.boot||0x111111,.5),hand=M(o.gk?0x7CFC9A:SK[o.skin||0]),dark=M(0x111111),band=M(0xffffff);
const cs=[],A=(geo,m,par,x,y,z,cast)=>{const e=new T.Mesh(geo,m);e.position.set(x||0,y||0,z||0);par.add(e);if(cast)cs.push(e);return e};
const hip=new T.Group();hip.position.y=1.02;gp.add(hip);A(gBox(.3,.22,.5),shorts,hip,0,.06,0,1);
const torso=new T.Group();torso.position.y=.16;hip.add(torso);const ch=A(gCyl(.2,.28,.64,'bottom',10),sh,torso,0,0,0,1);ch.scale.x=.62;
[-1,1].forEach(sd=>A(gSph(.1,8,6),sh,torso,0,.6,sd*.29));
if(o.num){const pl=new T.Mesh(new T.PlaneGeometry(.4,.4),new T.MeshBasicMaterial({map:numTex(o.num),transparent:true}));pl.position.set(-.17,.36,0);pl.rotation.y=-Math.PI/2;torso.add(pl)}
A(gCyl(.06,.07,.1,'bottom',6),skin,torso,0,.62,0);
const hd=new T.Group();hd.position.y=.7;torso.add(hd);const hh=A(gSph(.17,12,10),skin,hd,0,.1,0);hh.scale.set(.95,1.12,.95);
[-1,1].forEach(sd=>{A(gSph(.035,5,4),skin,hd,0,.1,sd*.165);A(gBox(.03,.035,.05),dark,hd,.155,.14,sd*.06)});
const hs=o.hs||0;if(hs!==2){if(hs===1)A(gSph(.23,10,8),hair,hd,-.02,.17,0);else{A(gSph(.18,12,8,0,Math.PI*2,0,Math.PI*.55),hair,hd,-.015,.12,0);if(hs===3)A(gBox(.34,.07,.06),hair,hd,-.02,.3,0);if(hs===4)A(gBox(.08,.28,.3),hair,hd,-.15,.0,0)}}
const arms=[],elb=[],legs=[],knees=[],ft=[];
[-1,1].forEach(sd=>{const a=new T.Group();a.position.set(0,.56,sd*.33);torso.add(a);A(gCyl(.065,.055,.28,'top'),sh,a,0,0,0,1);const e=new T.Group();e.position.y=-.28;a.add(e);A(gCyl(.05,.045,.26,'top'),skin,e);A(gSph(o.gk?.08:.06,6,5),hand,e,0,-.28,0);arms.push(a);elb.push(e);
const l=new T.Group();l.position.set(0,0,sd*.12);hip.add(l);A(gCyl(.11,.085,.5,'top'),skin,l,0,0,0,1);A(gCyl(.125,.115,.24,'top'),shorts,l,0,.02,0);const k=new T.Group();k.position.y=-.5;l.add(k);A(gCyl(.078,.062,.46,'top'),sock,k,0,0,0,1);A(gCyl(.083,.082,.05,'top'),band,k,0,-.03,0);
const f=new T.Group();f.position.y=-.46;k.add(f);A(gBox(.3,.1,.15),boot,f,.07,-.04,0);A(gSph(.075,6,5),boot,f,.2,-.045,0);legs.push(l);knees.push(k);ft.push(f)});
const bl=new T.Mesh(new T.CircleGeometry(.55,12),new T.MeshBasicMaterial({color:0,transparent:true,opacity:.28}));bl.rotation.x=-Math.PI/2;bl.position.y=.03;gp.add(bl);
cs.forEach(e=>e.castShadow=true);gp.ph0=Math.random()*6;gp.J={hip,torso,hd,arms,elb,legs,knees,ft};
gp.anim=(v,ph,st)=>{const now=performance.now()/1000,k=Math.min(v/8,1),mv=Math.min(1,v/1.2),s=Math.sin(ph),c=Math.cos(ph);
gp.rotation.z=0;gp.position.y=0;hip.rotation.set(0,s*.2*mv*(.4+.6*k),0);torso.rotation.set(0,-s*.3*mv*(.4+.6*k),-.3*k-.04*mv);hd.rotation.set(0,0,.25*k);hip.position.y=1.02+Math.abs(s)*.06*mv*(.4+.6*k);
const sw=(.5+.5*k)*mv,kb=(.5+.9*k)*mv;legs[0].rotation.set(0,0,s*sw);legs[1].rotation.set(0,0,-s*sw);knees[0].rotation.z=-Math.max(0,c)*kb-.1*mv;knees[1].rotation.z=-Math.max(0,-c)*kb-.1*mv;ft[0].rotation.z=Math.max(0,s)*.4*mv;ft[1].rotation.z=Math.max(0,-s)*.4*mv;
arms[0].rotation.set(0,0,-s*(.55+.5*k)*mv);arms[1].rotation.set(0,0,s*(.55+.5*k)*mv);elb[0].rotation.z=elb[1].rotation.z=(.3+.9*k)*mv+.12;
if(mv<1)torso.rotation.z+=Math.sin(now*1.8+gp.ph0)*.014*(1-mv);
if(st){if(st.gk&&st.dv<=0&&!(st.jp>0)&&v<3){legs[0].rotation.set(.14,0,.25);legs[1].rotation.set(-.14,0,.25);knees[0].rotation.z=knees[1].rotation.z=-.5;torso.rotation.z=-.3;arms[0].rotation.set(.8,0,.5);arms[1].rotation.set(-.8,0,.5);hip.position.y=.92}
if(st.jp>0){gp.position.y=Math.sin(Math.min(1,1-st.jp/.5)*Math.PI)*.55;arms[0].rotation.z=arms[1].rotation.z=2.4;torso.rotation.z=.12}
else if(st.dv>0){const pr=1-st.dv/.7;gp.position.y=Math.sin(Math.min(1,pr)*Math.PI)*.9;arms[0].rotation.set(0,0,2.7);arms[1].rotation.set(0,0,2.7);legs[0].rotation.z=.4;legs[1].rotation.z=-.4;knees[0].rotation.z=knees[1].rotation.z=-.2}
else if(st.lunge>0&&v>2.5){gp.rotation.z=1.15;gp.position.y=.42;legs[0].rotation.z=.25;legs[1].rotation.z=.05;knees[0].rotation.z=knees[1].rotation.z=-.1;torso.rotation.z=-.15;arms[0].rotation.set(0,0,-.9);arms[1].rotation.set(0,0,-.9)}
else if(typeof sim!=='undefined'&&sim.time-st.kt<.42){const kp=(sim.time-st.kt)/.42,a=kp<.3?-1*(kp/.3):-1+2.7*Math.min(1,(kp-.3)/.35);legs[1].rotation.z=a;knees[1].rotation.z=kp<.3?-.9*(kp/.3):-.9+.9*Math.min(1,(kp-.3)/.25);arms[0].rotation.z=.9*(a>0?1:-a);arms[1].rotation.z=-.9;torso.rotation.z=kp<.3?.1:-.14;legs[0].rotation.z=-.1}}};
gp.pose=(type,t)=>{gp.anim(0,0);const w=Math.sin(t*1.6+gp.ph0);
if(type==='sit'||type==='tie'){hip.position.y=.64;legs[0].rotation.set(0,0,1.5);legs[1].rotation.set(0,0,1.5);knees[0].rotation.z=knees[1].rotation.z=-1.5;arms[0].rotation.z=arms[1].rotation.z=.6;elb[0].rotation.z=elb[1].rotation.z=.9;torso.rotation.z=-.05+w*.015;
if(type==='tie'){torso.rotation.z=-.95+w*.03;hd.rotation.z=.5;arms[0].rotation.z=arms[1].rotation.z=1.1;elb[0].rotation.z=elb[1].rotation.z=.4}}
else if(type==='stretch'){arms[0].rotation.z=arms[1].rotation.z=2.7+w*.15;torso.rotation.z=.1+w*.06;legs[0].rotation.z=.5;knees[0].rotation.z=-.1}
else if(type==='talk'){arms[1].rotation.z=.9+Math.max(0,w)*.5;elb[1].rotation.z=1.4;torso.rotation.y=w*.1}};
gp.rotation.order='YXZ';gp.scale.setScalar(1.02);sc.add(gp);gp.anim(0,0);return gp}
// Populate the completed dugouts only after the shared human rig and its materials exist.
dugoutTeams.forEach(([x,team])=>{for(let i=0;i<6;i++){const person=mk(team?0xd8342f:0x2a7de1,S,{shorts:0x171a20,skin:(i+team)%5,hair:(i+2)%5,hs:i%4,boot:0x111111});person.position.set(x-4.9+i*1.55,0,40.25);person.rotation.y=team?Math.PI:0;dugoutPeople.push({m:person,pose:i%3===0?'talk':'sit',phase:i*.9+team})}
const coach=mk(0x20242e,S,{shorts:0x20242e,sock:0x20242e,skin:team?3:1,hair:2,hs:2,boot:0x111111});coach.position.set(x+(team?-7.2:7.2),0,37.9);coach.rotation.y=team?Math.PI:0;dugoutPeople.push({m:coach,pose:'talk',phase:team+2});});
// Front-row supporters are individually rigged for small cheers and conversations; the upper tiers remain instanced for mobile performance.
const bowlPeople=[];
for(let side of [-1,1])for(let i=0;i<6;i++){const f=mk(pick(side<0?BLU:RED),S,{shorts:pick([0x171a20,0x303744,0xf2f2f2]),skin:i%5,hair:(i+2)%5,hs:i%5,boot:0x171717});f.position.set(-29+i*11,.92,side*43.2);f.rotation.y=side<0?Math.PI:0;bowlPeople.push({m:f,pose:i%3===0?'stretch':'talk',phase:i*.8+side})}
for(let side of [-1,1])for(let i=0;i<4;i++){const f=mk(pick(side<0?BLU:RED),S,{shorts:0x20242e,skin:(i+2)%5,hair:i%5,hs:i%4,boot:0x171717});f.position.set(side*61,.92,-25+i*16.5);f.rotation.y=side<0?Math.PI/2:-Math.PI/2;bowlPeople.push({m:f,pose:i%2?'stretch':'talk',phase:i+side})}
const P=[];for(let t=0;t<2;t++)for(let i=0;i<Sim.N;i++){const k=t?0xd8342f:0x2a7de1,gk=i===0?(t?0xf39c12:0x27ae60):k;
P.push({m:mk(gk,S,{num:i+1,shorts:t?0xf2f2f2:0x0b1b3a,sock:gk,skin:(i*3+t)%5,hair:(i*2+t)%5,hs:(i+t*2)%5,gk:i===0,boot:i%3?0x111111:0xf5f5f5}),t,gk:i===0,p:new T.Vector2(),v:new T.Vector2(),a:0,ph:Math.random()*6,x0:0})}
const ball=new T.Mesh(new T.SphereGeometry(.22,16,12),new T.MeshStandardMaterial({color:0xffffff}));ball.castShadow=true;S.add(ball);
const bv=new T.Vector3(),mark=new T.Mesh(new T.ConeGeometry(.35,.7,8),new T.MeshBasicMaterial({color:0xfac775}));mark.rotation.x=Math.PI;S.add(mark);
/* ---------- walkable tunnel + dressing room (north side, beyond the stand) ---------- */
const room=new T.Group();S.add(room);const HIDE=[],bm=c=>new T.MeshBasicMaterial({color:c});
const bxm=(w,h,d,x,y,z,m)=>{const e=new T.Mesh(new T.BoxGeometry(w,h,d),m);e.position.set(x,y,z);room.add(e);return e};
bxm(7.5,.2,26,0,-.08,-50.4,bm(0x59606c));
[-1,1].forEach(sd=>{bxm(1,3.8,26,sd*4.25,1.9,-50.4,bm(0xd5dae2));bxm(.1,.35,26,sd*3.72,1.1,-50.4,bm(0x2a7de1))});
HIDE.push(bxm(9.5,.3,26,0,3.95,-50.4,bm(0x1a1e29)));
for(let z=-40;z>-63;z-=4.5)HIDE.push(bxm(2.4,.08,.7,0,3.78,z,bm(0xfff3d0)));
for(let z=-40;z>-63;z-=6)bxm(7.5,.02,.45,0,.03,z,bm(0x2a7de1));
const RC=-74.7,RD=22.6;
bxm(27.6,.2,RD+.6,0,-.08,RC,bm(0x8a909c));[-1,1].forEach(sd=>bxm(.6,4.9,RD+.6,sd*13.8,2.45,RC,bm(0xd9dde3)));
bxm(11.3,4.9,.6,-8.15,2.45,-86.2,bm(0xd9dde3));bxm(11.3,4.9,.6,8.15,2.45,-86.2,bm(0xd9dde3));bxm(5,1.2,.6,0,4.3,-86.2,bm(0xd9dde3));bxm(5.2,.1,.7,0,3.7,-86.2,bm(0x3dffb0));[-1,1].forEach(sd=>HIDE.push(bxm(10,4.9,.6,sd*8.75,2.45,-63.4,bm(0xd9dde3))));
HIDE.push(bxm(27.6,.3,RD+.6,0,5,RC,bm(0x20242e)));[-8,0,8].forEach(x=>HIDE.push(bxm(.7,.08,18,x,4.82,RC,bm(0xffffff))));
[-1,1].forEach(sd=>bxm(.14,.14,RD,sd*13,.12,RC,bm(sd<0?0x2a7de1:0xff3b3b)));
const wallTex=tex(1024,180,(g)=>{g.fillStyle='#e6e9ee';g.fillRect(0,0,1024,180);for(let i=0;i<22;i++)for(let j=0;j<4;j++){const x=i*48,y=j*48-6;g.fillStyle=(i+j)%2?'#cfd4dc':'#f7f8fa';g.beginPath();g.moveTo(x,y+24);g.lineTo(x+24,y);g.lineTo(x+48,y+24);g.lineTo(x+24,y+48);g.fill()}
g.fillStyle='#0b1b3a';g.fillRect(0,168,1024,12);g.clearRect(417,31,190,149)});
const wallP=new T.Mesh(new T.PlaneGeometry(27,4.6),new T.MeshBasicMaterial({map:wallTex,transparent:true,alphaTest:.5}));wallP.position.set(0,2.4,-85.85);room.add(wallP);
const crestP=new T.Mesh(new T.PlaneGeometry(3.6,3.6),new T.MeshBasicMaterial({map:tex(256,256,g=>{g.clearRect(0,0,256,256);g.fillStyle='#0b1b3a';g.beginPath();g.moveTo(28,20);g.lineTo(228,20);g.lineTo(228,140);g.quadraticCurveTo(228,210,128,238);g.quadraticCurveTo(28,210,28,140);g.fill();g.strokeStyle='#2a7de1';g.lineWidth=10;g.stroke();g.fillStyle='#fff';g.font='bold 82px Barlow Condensed, sans-serif';g.textAlign='center';g.fillText('FT',128,112);g.fillText('90',128,190)}),transparent:true}));crestP.position.set(-5,2.7,-85.8);room.add(crestP);
const board=tex(512,300,()=>{}),bctx=board.image.getContext('2d');
function drawBoard(f){const g=bctx;g.fillStyle='#14361c';g.fillRect(0,0,512,300);g.strokeStyle='#cfe8d0';g.lineWidth=3;g.strokeRect(10,10,492,280);g.beginPath();g.moveTo(256,10);g.lineTo(256,290);g.stroke();g.beginPath();g.arc(256,150,34,0,7);g.stroke();
(Sim.FORM[f]||Sim.FORM['4-3-3']).forEach((q,i)=>{const x=256+q[0]/55*236,y=150+q[1]/36*130;g.fillStyle=i?'#2a7de1':'#27ae60';g.beginPath();g.arc(x,y,9,0,7);g.fill()});g.fillStyle='#fff';g.font='bold 26px sans-serif';g.fillText(f,18,34);board.needsUpdate=true}
drawBoard('4-3-3');const boardP=new T.Mesh(new T.PlaneGeometry(6.4,3.75),new T.MeshBasicMaterial({map:board}));boardP.position.set(7,2.6,-85.8);room.add(boardP);
const NAMES=['Okafor','Silva','Marsh','Diallo','Kane','Ruiz','Novak','Adeyemi','Hart','Costa','Mendes'],LINES=["Let's get stuck in!","Gaffer wants more from the wings.","Keep it tight at the back.","Feed me early, I'll finish it.","Big crowd tonight. Soak it in.","Press high, win it back quick.","Stay switched on for set pieces.","Play your game, kid."];
function shirtTex(n,name,mine){return tex(128,160,g=>{g.fillStyle=mine?'#f1c40f':'#2a7de1';g.beginPath();g.moveTo(30,10);g.lineTo(98,10);g.lineTo(124,40);g.lineTo(104,62);g.lineTo(96,50);g.lineTo(96,150);g.lineTo(32,150);g.lineTo(32,50);g.lineTo(24,62);g.lineTo(4,40);g.fill();g.fillStyle=mine?'#0b1b3a':'#fff';g.textAlign='center';g.font='bold 22px sans-serif';g.fillText(name,64,56);g.font='bold 62px sans-serif';g.fillText(n,64,118)})}
const lockerZ=[-66.8,-70.2,-73.6,-77,-80.4,-83.8];
[-1,1].forEach(sd=>{lockerZ.forEach((z,i)=>{bxm(.3,3.9,3.1,sd*13.3,2.05,z,bm(sd<0?0x1c2a4a:0x232b3a));const mine=sd>0&&i===1,n=sd<0?i+1:i+7,sp=new T.Mesh(new T.PlaneGeometry(1.4,1.75),new T.MeshBasicMaterial({map:shirtTex(mine?10:n,mine?'YOU':NAMES[(n-1)%NAMES.length].toUpperCase(),mine),transparent:true}));sp.position.set(sd*13.1,2.5,z);sp.rotation.y=sd<0?Math.PI/2:-Math.PI/2;room.add(sp);bxm(.5,.1,2.6,sd*13,.9,z,bm(0x8d929c))});
bxm(1.3,.75,21,sd*10.9,.375,RC,bm(0xdfe3ea));bxm(1.3,.12,21,sd*10.9,.8,RC,bm(sd<0?0x2a4fb0:0xb02a2a))});
bxm(1.6,.1,3.4,13,.03,-69.5,bm(0xf1c40f));
[[-6,-67.6,0xc0392b],[6,-65.6,0x2a7de1],[-9,-84,0x2a7de1],[9.5,-83,0xc0392b]].forEach(([x,z,c])=>bxm(1.6,.9,.9,x,.45,z,bm(c)));
const RM=[],occ=(x,z,a,pose,i)=>{const m=mk(0x2a7de1,S,{num:i+1,shorts:0x0b1b3a,skin:(i*2)%5,hair:(i*3)%5,hs:i%5,boot:i%2?0x111111:0xf5f5f5});m.position.set(x,0,z);m.rotation.y=-a;RM.push({m,x,z,pose,name:NAMES[i%NAMES.length],line:LINES[i%LINES.length]})};
[['sit',-67.5],['sit',-70.8],['tie',-74],['sit',-77.3],['sit',-80.6],['tie',-83.5]].forEach(([p,z],i)=>occ(-11,z,0,p,i));
[['sit',-70.8],['sit',-74],['tie',-77.3],['sit',-80.6]].forEach(([p,z],i)=>occ(11,z,Math.PI,p,i+6));
occ(-5,-76,0,'stretch',2);occ(4,-72.5,Math.PI,'talk',5);
const COACH=mk(0x15171c,S,{shorts:0x15171c,sock:0x15171c,skin:1,hair:4,hs:2,boot:0x333333});COACH.position.set(5,0,-79);COACH.rotation.y=Math.PI/2;
const U=mk(0x2a7de1,S,{num:10,shorts:0x0b1b3a,skin:2,hair:0,hs:0});U.visible=false;
/* ---------- match wiring ---------- */
let owner=null,u=null,jx=0,jy=0;const K={},st={sc:[0,0],min:0,half:1,run:false,m:{sp:1,pw:1,op:1},freeze:0,pause:false};
const sim=Sim.create({diff:.98}),INP={ix:0,iz:0,sprint:false},MR=.375;
const RF=mk(0xf4d03f,S);RF.position.set(0,0,12);
/* touchline production crew, ball kids and technical-area staff */
const pitchCrew=[];
const AR=[mk(0xf4d03f,S,{shorts:0x15171c,skin:1,hair:1,hs:2}),mk(0xf4d03f,S,{shorts:0x15171c,skin:3,hair:2,hs:1})];
AR.forEach((r,i)=>{r.position.set(0,0,i===0?-38.2:38.2);r.rotation.y=i===0?Math.PI:0;const flag=new T.Mesh(new T.PlaneGeometry(.48,.32),new T.MeshBasicMaterial({color:i===0?0xf1c40f:0xe74c3c,side:T.DoubleSide}));flag.position.set(.22,1.3,0);r.add(flag)});
function cameraRig(x,z,rot){const rig=new T.Group();S.add(rig);const metal=new T.MeshStandardMaterial({color:0x151922,metalness:.55,roughness:.55});
const legs=new T.Mesh(new T.CylinderGeometry(.08,.1,1.5,6),metal);legs.position.y=.75;rig.add(legs);
const camBody=new T.Mesh(new T.BoxGeometry(.85,.48,.42),new T.MeshStandardMaterial({color:0x080b12,roughness:.4}));camBody.position.set(0,1.65,0);rig.add(camBody);
const lens=new T.Mesh(new T.CylinderGeometry(.16,.22,.42,10),metal);lens.rotation.x=Math.PI/2;lens.position.set(0,1.65,-.34);rig.add(lens);
const op=mk(0x1b202a,S,{shorts:0x171a20,skin:2,hair:1,hs:1,boot:0x111111});op.position.set(x+.9,0,z);op.rotation.y=rot;pitchCrew.push({m:op,pose:'talk',phase:x});rig.position.set(x,0,z);rig.rotation.y=rot;return rig}
cameraRig(-29,39.2,Math.PI);cameraRig(29,-39.2,0);
// Full-body matchday crowd and concourse population using the same human character rig as players.
const crowdPeople=[],worldPeople=[];
function addPerson(parent,x,z,opts={}){const colors=[0x2a7de1,0xd8342f,0xf2f2f2,0x202733,0x27ae60,0xf1c40f,0x8e44ad,0xe67e22];const m=mk(opts.color||pick(colors),S,{shorts:opts.shorts===undefined?0x20242b:opts.shorts,skin:opts.skin===undefined?(Math.random()*5|0):opts.skin,hair:Math.random()*5|0,hs:Math.random()*5|0,boot:0x171717});m.position.set(x,0,z);m.rotation.y=opts.rot||0;parent.add(m);const rec={m,pose:opts.pose||'talk',phase:Math.random()*8,kind:opts.kind||'crowd',baseX:x,baseZ:z};(opts.kind==='world'?worldPeople:crowdPeople).push(rec);return rec}
// Dense, varied supporters along both sides of the team arrival route; each has a complete body rig.
for(let side of [-1,1])for(let i=0;i<35;i++){const x=side*(13.6+(i%3)*.92),z=-126+(i%18)*1.38;const q=addPerson(ext,x,z,{pose:i%4===0?'stretch':i%3===0?'talk':'wave',kind:'crowd',rot:side<0?-.2:Math.PI+.2});if(i%7===0){const sign=new T.Mesh(new T.PlaneGeometry(1.15,.65),new T.MeshBasicMaterial({map:tex(256,96,g=>{g.fillStyle='#101d36';g.fillRect(0,0,256,96);g.fillStyle='#fff';g.font='bold 38px sans-serif';g.textAlign='center';g.fillText(i%14===0?'FT90':'UNITED',128,62)}),side:T.DoubleSide}));sign.position.set(x,2.1,z);sign.rotation.y=side<0?-.25:Math.PI+.25;ext.add(sign)}}
// Concourses and an intentionally readable circulation route: retail, wayfinding, stairs/escalators and lift lobby.
const concourse=new T.Group();S.add(concourse);
const floorM=new T.MeshStandardMaterial({color:0x626a76,roughness:.92}),wallM=new T.MeshStandardMaterial({color:0x333b48,roughness:.9}),glassM=new T.MeshStandardMaterial({color:0x5f94b8,metalness:.25,roughness:.25,transparent:true,opacity:.42});
const floor=new T.Mesh(new T.PlaneGeometry(48,78),floorM);floor.rotation.x=-Math.PI/2;floor.position.set(0,.03,-72);concourse.add(floor);
// Corridor walls with open central passage and clear route markers.
[-24,24].forEach(x=>{const w=new T.Mesh(new T.BoxGeometry(.55,5,78),wallM);w.position.set(x,2.5,-72);concourse.add(w)});
for(let z=-108;z<=-38;z+=10){const stripe=new T.Mesh(new T.BoxGeometry(2.2,.025,1.3),new T.MeshBasicMaterial({color:0x42d8ad}));stripe.position.set(0,.07,z);concourse.add(stripe)}
function signBoard(textLabel,x,y,z,rot=0){const m=new T.Mesh(new T.PlaneGeometry(5,1.3),new T.MeshBasicMaterial({map:tex(512,128,g=>{g.fillStyle='#0b1b3a';g.fillRect(0,0,512,128);g.fillStyle='#e8f4ff';g.font='bold 43px sans-serif';g.textAlign='center';g.fillText(textLabel,256,82)}),side:T.DoubleSide}));m.position.set(x,y,z);m.rotation.y=rot;concourse.add(m)}
signBoard('PLAYERS / DRESSING ROOMS',0,4,-60);signBoard('FOOD  •  DRINKS  •  MERCH',-16,3.4,-76,Math.PI/2);signBoard('LIFTS  ↑   ESCALATORS  ↑',16,3.4,-76,-Math.PI/2);
// Concession kiosks with counters and display shelves.
for(let side of [-1,1])for(let i=0;i<3;i++){const x=side*17,z=-94+i*16;const stall=new T.Group();const counter=new T.Mesh(new T.BoxGeometry(5,.95,2.3),new T.MeshStandardMaterial({color:i%2?0x174d73:0x8b3e2f}));counter.position.set(x,.5,z);stall.add(counter);const canopy=new T.Mesh(new T.BoxGeometry(5,.22,2.6),new T.MeshStandardMaterial({color:i%2?0x1d9e75:0xf1c40f}));canopy.position.set(x,2.6,z);stall.add(canopy);const menu=new T.Mesh(new T.PlaneGeometry(3.6,.85),new T.MeshBasicMaterial({map:tex(360,90,g=>{g.fillStyle='#111827';g.fillRect(0,0,360,90);g.fillStyle='#fff';g.font='bold 30px sans-serif';g.textAlign='center';g.fillText(i===0?'FOOD':i===1?'DRINKS':'MERCH',180,58)}),side:T.DoubleSide}));menu.position.set(x,1.95,z+1.18);stall.add(menu);concourse.add(stall);addPerson(concourse,x-side*2.1,z-2,{kind:'world',pose:'talk',rot:side>0?Math.PI:0});addPerson(concourse,x-side*4.4,z+3,{kind:'world',pose:'talk',rot:side<0?0:Math.PI})}
// Broad stair flights and escalators on each side; adjacent lift shafts are clearly marked.
for(let side of [-1,1]){const x=side*11;for(let i=0;i<12;i++){const step=new T.Mesh(new T.BoxGeometry(4,.16,1.05),floorM);step.position.set(x,.15+i*.22,-49-i*.85);concourse.add(step)}const escalator=new T.Mesh(new T.BoxGeometry(3.2,2.8,13),new T.MeshStandardMaterial({color:0x202733,metalness:.35,roughness:.55}));escalator.position.set(side*16,1.55,-56);escalator.rotation.x=side>0?-.18:.18;concourse.add(escalator);const lift=new T.Mesh(new T.BoxGeometry(3.2,5,3.2),glassM);lift.position.set(side*20,2.5,-48);concourse.add(lift);signBoard('LIFT',side*20,5.3,-48,side<0?Math.PI/2:-Math.PI/2)}
// Moving visitors: shoppers, families and staff use full-body models; animation is subtle and deterministic.
for(let i=0;i<22;i++){const x=-20+(i%8)*5.5,z=-105+Math.floor(i/8)*22;const pose=i%5===0?'stretch':i%3===0?'talk':'sit';addPerson(concourse,x,z,{kind:'world',pose,rot:(i%2)*Math.PI})}

// Distinctive stadium identity: fan-centre frontage, destination pylons and staffed security guides.
function panelLabel(label,x,y,z,w=5,h=1.15){const q=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex(512,128,g=>{g.fillStyle='#07172a';g.fillRect(0,0,512,128);g.fillStyle='#63e6be';g.fillRect(0,0,12,128);g.fillStyle='#f4f8ff';g.font='bold 42px sans-serif';g.textAlign='center';g.fillText(label,264,82)}),side:T.DoubleSide}));q.position.set(x,y,z);concourse.add(q);return q}
panelLabel('FT90 FAN CENTRE',-21,4.2,-88,6.2,1.4);panelLabel('OFFICIAL MEGASTORE',21,4.2,-78,6.8,1.4);panelLabel('PLAYERS / MEDIA ACCESS',0,4.8,-68,7,1.2);
// Security stewards stand at the checkpoint and along the route; their high-visibility tops make them legible.
const securityStaff=[];[[-5,-113,0],[5,-113,Math.PI],[0,-75,Math.PI]].forEach(([x,z,r],i)=>{const p=addPerson(concourse,x,z,{kind:'world',pose:'talk',color:0xf1c40f,shorts:0x17202b,rot:r});securityStaff.push({...p,homeX:x,homeZ:z,idx:i});const vest=new T.Mesh(new T.BoxGeometry(.43,.72,.24),new T.MeshStandardMaterial({color:0xf4d03f,roughness:.8}));vest.position.set(0,1.45,0);p.m.add(vest);});
// Small kiosk displays and a family seating nook make the concourse read as a public destination.
for(const [x,z,c] of [[-22,-92,0x246a86],[22,-88,0x8b4b2d]]){const kiosk=new T.Group();const base=new T.Mesh(new T.BoxGeometry(4.5,1.05,2.2),new T.MeshStandardMaterial({color:c,roughness:.65}));base.position.y=.55;kiosk.add(base);const top=new T.Mesh(new T.BoxGeometry(4.8,.16,2.5),new T.MeshStandardMaterial({color:0xe8edf4,metalness:.15,roughness:.4}));top.position.y=1.15;kiosk.add(top);for(let j=0;j<3;j++){const item=new T.Mesh(new T.BoxGeometry(.42,.58,.42),new T.MeshStandardMaterial({color:[0xe74c3c,0x27ae60,0xf1c40f][j]}));item.position.set(-1+j,1.5,0);kiosk.add(item)}kiosk.position.set(x,0,z);concourse.add(kiosk)}

// Ball kids in high-visibility bibs near each touchline/end-zone corner.
[[-52,-31],[52,-31],[-52,31],[52,31],[-34,-39],[34,-39]].forEach(([x,z],i)=>{const kid=mk(0xf1c40f,S,{shorts:0x101820,skin:i%5,hair:i%4,hs:i%3,boot:0x111111});kid.position.set(x,0,z);kid.rotation.y=Math.atan2(-x,-z);pitchCrew.push({m:kid,pose:'sit',phase:i*1.4})});
// Coaches and substitutes occupy both dugouts instead of leaving the technical areas empty.
[-1,1].forEach((side,team)=>{for(let i=0;i<5;i++){const person=mk(team?0xd8342f:0x2a7de1,S,{shorts:0x171a20,skin:(i+team)%5,hair:(i+2)%5,hs:i%4,boot:0x111111});person.position.set(side*15+(i-2)*1.65,0,40.1);person.rotation.y=side>0?Math.PI:0;pitchCrew.push({m:person,pose:i%2?'talk':'sit',phase:i+team*2})}});

let mode='play',tt=0,cm=0,sprint=false;
const CM=[[34,92,0],[11,20,14],[43,112,0]],CN=['broadcast','player','wide'];
let camTrackX=0,camTrackZ=0;
const tn=t=>t?'City':'United',nm=id=>(id%11)+1,turnA=(a,b,m)=>{const d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;return a+cl(d,-m,m)};
const cap=t=>{$('cp').textContent=t},fade=f=>{$('fd').style.opacity=f?1:0};
function say(t,ms){cap(t);clearTimeout(say.h);say.h=setTimeout(()=>cap(''),ms||1800)}
function banner(t){const m=$('msg');m.textContent=t;m.style.display=t?'block':'none'}
function sync(dt){sim.p.forEach((s,i)=>{const p=P[i],v=Math.hypot(s.vx,s.vz);p.p.set(s.x,s.z);p.v.set(s.vx,s.vz);p.a=s.a;p.ph+=v*dt*1.25;p.m.visible=!s.off;
p.m.position.set(s.x,0,s.z);p.m.rotation.y=-s.a;p.m.rotation.x=s.dv>0?s.dd*(Math.cos(s.a)>0?1:-1)*Math.min(1.35,(1-s.dv/.7)*3):0;p.m.anim(v,p.ph,s)});
const b=sim.ball;ball.position.set(b.x,b.y,b.z);bv.set(b.vx,b.vy,b.vz);owner=sim.owner>=0?P[sim.owner]:null;u=P[sim.user]||null}
function reset(){Sim.reset(sim);sim.mood=st.m;sync(0)}
function act(k){if(!st.run||st.pause||st.freeze>0)return;Sim.act(sim,k)}
const pad=$('pad'),kn=$('kn');
function pm(e){const r=pad.getBoundingClientRect();let dx=e.clientX-r.left-60,dy=e.clientY-r.top-60;const l=Math.hypot(dx,dy);if(l>50){dx*=50/l;dy*=50/l}jx=dx/50;jy=dy/50;kn.style.transform=`translate(${dx}px,${dy}px)`}
pad.style.touchAction='none';pad.addEventListener('pointerdown',e=>{e.preventDefault();pad.setPointerCapture(e.pointerId);pm(e)});pad.addEventListener('pointermove',e=>{if(pad.hasPointerCapture(e.pointerId))pm(e)});
const up=()=>{jx=jy=0;kn.style.transform=''};pad.addEventListener('pointerup',up);pad.addEventListener('pointercancel',up);
let lookPointer=null,lookX=0,lookY=0;const gameCanvas=$('c');gameCanvas.style.touchAction='none';
// In walk mode, drag anywhere on the open world (not the joystick/UI) to orbit the camera.
gameCanvas.addEventListener('pointerdown',e=>{if(mode==='walk'&&!WK.busy&&e.clientX>innerWidth*.24&&e.clientX<innerWidth*.88&&e.clientY<innerHeight*.88){e.preventDefault();lookPointer=e.pointerId;lookX=e.clientX;lookY=e.clientY;gameCanvas.setPointerCapture(e.pointerId)}});
gameCanvas.addEventListener('pointermove',e=>{if(lookPointer!==e.pointerId||mode!=='walk')return;e.preventDefault();const dx=e.clientX-lookX,dy=e.clientY-lookY;lookX=e.clientX;lookY=e.clientY;WK.camYaw=cl(WK.camYaw-dx*.008,-1.35,1.35);WK.camPitch=cl(WK.camPitch+dy*.014,-.65,.8)});
const endLook=e=>{if(lookPointer===e.pointerId)lookPointer=null};gameCanvas.addEventListener('pointerup',endLook);gameCanvas.addEventListener('pointercancel',endLook);

$('sh').addEventListener('pointerdown',()=>act(1));$('ps').addEventListener('pointerdown',()=>act(0));$('th').addEventListener('pointerdown',()=>act((sim.owner>=0&&sim.p[sim.owner].t===0)?4:5));$('lb').addEventListener('pointerdown',()=>act((sim.owner>=0&&sim.p[sim.owner].t===0)?2:6));
$('ia').addEventListener('pointerdown',e=>{e.preventDefault();doInteract()});$('mapbtn').addEventListener('pointerdown',e=>{e.preventDefault();if(mode==='walk'&&!WK.busy)openMap();else if(mode==='walk'&&$('mapoverlay').style.display==='flex')closeMap()});
addEventListener('keydown',e=>{K[e.code]=1;if(mode==='walk'){if(e.code==='KeyE'||e.code==='Enter')doInteract();return}if(e.code==='Space')act(1);if(e.code==='KeyE')act(0);if(e.code==='KeyQ')act(2);if(e.code==='KeyR')act(4);if(e.code==='KeyF')act(3)});addEventListener('keyup',e=>K[e.code]=0);
function upd(){$('sc').textContent=st.sc[0]+' - '+st.sc[1];$('tm').textContent=Math.min(90,Math.floor(st.min))+"'"}
function goal(t){ca=3;st.sc[t]++;st.run=false;owner=null;banner('Goal! '+(t?'City':'United'));upd();setTimeout(()=>{banner('');reset();st.run=true},2000)}
function halftime(){st.half=2;ui(false);startWalk('half')}
function fulltime(){const s=sim.st;$('fr').textContent='UTD '+st.sc[0]+' - '+st.sc[1]+' CITY';$('fs').innerHTML=`Shots ${s.shots[0]} - ${s.shots[1]}<br>Fouls ${s.fouls[0]} - ${s.fouls[1]}<br>Yellow cards ${s.yellows[0]} - ${s.yellows[1]} &nbsp; Red cards ${s.reds[0]} - ${s.reds[1]}<br>Offsides ${s.offsides[0]} - ${s.offsides[1]}`;$('ft').classList.add('on');ui(false)}
function begin(){try{audioInit()}catch(e){}st.sc=[0,0];st.min=0;st.half=1;st.pause=false;st.freeze=0;st.m={sp:1,pw:1,op:1};sim.mood=st.m;sim.stam=1;
Object.keys(sim.st).forEach(k=>sim.st[k]=Array.isArray(sim.st[k])?[0,0]:0);sim.p.forEach(p=>{p.off=false;p.yc=0});
closeDlg();$('pm').classList.remove('on');upd();reset();st.run=false;['st','ft'].forEach(i=>$(i).classList.remove('on'));ui(false);rs();startWalk('pre')}
$('go').onclick=begin;$('again').onclick=begin;
function step(dt){
if(!st.run)return;st.min+=dt*MR;upd();
if(st.half===1&&st.min>=45){st.run=false;halftime();return}
if(st.min>=90){st.run=false;fulltime();return}
INP.ix=jx+(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0);INP.iz=jy+(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0);INP.sprint=!!(Math.hypot(jx,jy)>.91||K.ShiftLeft);
Sim.step(sim,dt,INP);sync(dt);$('stf').style.width=sim.stam*100+'%';
for(const e of sim.ev){if(e.type==='goal'){goal(e.t);break}handle(e)}}
/* ---------- rules feedback: cards, penalties, offside ---------- */
const RL={throw:'Throw-in',corner:'Corner',goalkick:'Goal kick'};
function cardFx(c){const e=$('cfx');e.style.background=c==='yellow'?'#f5c518':'#e0222d';e.style.display='block';clearTimeout(cardFx.h);cardFx.h=setTimeout(()=>e.style.display='none',1700)}
function handle(e){
if(e.type==='foul'){let txt='Foul · '+tn(e.t)+' #'+nm(e.id);
if(e.card==='yellow'){cardFx('yellow');txt+=' · Yellow card'}else if(e.card==='red'){cardFx('red');txt+=' · Red card'}else if(e.card==='second'){cardFx('red');txt+=' · Second yellow, sent off'}
if(e.pen){banner('Penalty!');setTimeout(()=>banner(''),1500);txt=e.t===1?'Penalty! Aim with the stick, press Shoot':'Penalty to City'}
say(txt,2400);st.freeze=e.card?1.9:(e.pen?1.7:.7)}
else if(e.type==='offside'){say('Offside · '+tn(e.t)+' #'+nm(e.id),1800);st.freeze=.8}
else if(e.type==='restart'&&RL[e.kind])say(RL[e.kind]+' · '+tn(e.t),1500)}
/* ---------- radar ---------- */
const rad=$('rad'),rg=rad.getContext('2d');
function drawRad(){const w=rad.width,h=rad.height,X=x=>w/2+x/55*(w/2-4),Z=z=>h/2+z/36*(h/2-4);rg.clearRect(0,0,w,h);rg.fillStyle='#0b1220aa';rg.fillRect(0,0,w,h);rg.strokeStyle='#ffffff66';rg.lineWidth=1;rg.strokeRect(2,2,w-4,h-4);rg.beginPath();rg.moveTo(w/2,2);rg.lineTo(w/2,h-2);rg.stroke();
sim.p.forEach(p=>{if(p.off)return;rg.fillStyle=p.t?'#e24b4a':'#4d9bff';rg.beginPath();rg.arc(X(p.x),Z(p.z),p.id===sim.user?4:2.6,0,7);rg.fill();if(p.id===sim.user){rg.strokeStyle='#fac775';rg.lineWidth=1.5;rg.stroke()}});
rg.fillStyle='#fff';rg.beginPath();rg.arc(X(sim.ball.x),Z(sim.ball.z),2.4,0,7);rg.fill()}
/* ---------- menus ---------- */
document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{Sim.setFormation(sim,0,b.dataset.f);$('fm').textContent='Formation '+b.dataset.f;drawBoard(b.dataset.f)});
$('cmb').onclick=()=>{cm=(cm+1)%3;$('cmb').textContent='Camera: '+CN[cm];rs();};
$('pz').onclick=()=>{st.pause=true;$('pm').classList.add('on')};$('rsm').onclick=()=>{st.pause=false;$('pm').classList.remove('on')};
let atk=true;function ctx(){const a=sim.owner>=0?sim.p[sim.owner].t===0:(sim.lastT===0);if(a===atk&&ctx.d)return;atk=a;ctx.d=1;$('ps').textContent=a?'Pass':'Pressure';$('sh').textContent=a?'Shoot':'Tackle';$('th').textContent=a?'Through':'Switch';$('lb').textContent=a?'Cross':'Clear'}
function ui(on){const d=on?'block':'none',f=on?'flex':'none';$('pad').style.display=d;document.querySelectorAll('.b').forEach(e=>e.style.display=f);$('pz').style.display=f;$('stm').style.display=d;$('rad').style.display=d;$('ia').style.display='none'}
function showWalkUI(on){$('pad').style.display=on?'block':'none';$('sc').parentNode.style.display=on?'none':'flex';$('ia').style.display='none';$('rad').style.display='none';$('mapbtn').style.display=on?'block':'none';$('walkobj').style.display=on?'block':'none';if(!on)$('cp').textContent=''}
/* ---------- ceremony helpers (lineup, handshakes, kickoff) ---------- */
function setP(p,x,z,a){p.p.set(x,z);p.a=a;p.v.set(0,0);p.m.position.set(x,0,z);p.m.rotation.set(0,-a,0);p.m.anim(0,0)}
function walk(p,tx,tz,spd,dt){const dx=tx-p.p.x,dz=tz-p.p.y,d=Math.hypot(dx,dz);if(d>.3){p.p.x+=dx/d*spd*dt;p.p.y+=dz/d*spd*dt;p.a=Math.atan2(dz,dx);p.ph+=dt*spd*1.6;p.m.anim(Math.min(spd,8),p.ph)}else p.m.anim(0,0);p.m.position.set(p.p.x,0,p.p.y);p.m.rotation.y=-p.a}
function refUpd(dt){const b=ball.position,tx=cl(b.x*.75-4,-40,40),tz=cl(b.z+(b.z>0?-8:8),-26,26),dx=tx-RF.position.x,dz=tz-RF.position.z,d=Math.hypot(dx,dz);if(d>1){const s=Math.min(6,d*1.5);RF.position.x+=dx/d*s*dt;RF.position.z+=dz/d*s*dt;RF.rotation.y=-Math.atan2(dz,dx);RF.anim(s,performance.now()/110)}}
function kickoff(){mode='play';cap('');ext.visible=false;ESC.forEach(k=>k.visible=false);rs();cam.position.set(0,34,92);cam.lookAt(0,0,0);reset();RF.position.set(0,0,12);st.run=true;ui(true)}
const ESC=[];
function startLineup(){mode='lineup';tt=0;rs();cam.fov=45;cam.updateProjectionMatrix();owner=null;bv.set(0,0,0);
 P.forEach((p,i)=>{const n=i%Sim.N;p.m.visible=false;p.dl=1.6+n*.55+(p.t?.25:0);p.cx=p.t?1.5:-1.5;p.fx=(p.t?1:-1)*(3.6+(10-n)*2.15);p.x0=-15+n*3;p.ph=0;p.stg=0;setP(p,p.cx,-52,Math.PI/2)});
 RF.visible=true;RF.position.set(0,0,-52);RF.rotation.y=-Math.PI/2;RF.anim(0,0);ball.position.set(0.28,1.05,-51.7);
 if(!ESC.length)for(let i=0;i<22;i++){const k=mk(i<11?0xffd23f:0x2a7de1,S,{shorts:0x101820,skin:i%5,hair:i%4,hs:i%3,boot:0x111111});k.scale.setScalar(.72);ESC.push(k)}
 ESC.forEach(k=>k.visible=false);cam.position.set(0,2.6,-22);cam.lookAt(0,1.7,-46);cap('FT90 Stadium · Teams walk out')}
function lineupTick(dt){
 P.forEach((p,i)=>{if(tt<p.dl)return;p.m.visible=true;const wp=[[p.cx,-35.5],[p.fx,-35.5],[p.fx,-31.2]],s=p.stg;
  if(s<3){const tx=wp[s][0],tz=wp[s][1];walk(p,tx,tz,3.3,dt);if(Math.hypot(tx-p.p.x,tz-p.p.y)<.5)p.stg++}else{p.m.anim(0,0);p.m.position.set(p.p.x,0,p.p.y);p.m.rotation.y=-Math.PI/2;p.a=Math.PI/2}
  const k=ESC[i];if(k){k.visible=true;k.position.set(p.p.x,0,p.p.y+1.15);k.rotation.y=p.m.rotation.y;if(s<3)k.anim(3.3,p.ph);else k.anim(0,0)}});
 if(RF.position.z<-29.8){RF.position.z+=3.4*dt;RF.rotation.y=-Math.PI/2;RF.anim(3.4,tt*5.4)}else RF.anim(0,0);ball.position.set(RF.position.x+.28,1.05,RF.position.z+.28);
 if(tt<5.5){cam.position.set(Math.sin(tt*.3)*1.2,2.6,-22);cam.lookAt(0,1.7,-44+tt*.9)}else{const k=Math.min(1,dt*1.0);cam.position.x=lerp(cam.position.x,0,k);cam.position.y=lerp(cam.position.y,6.2,k);cam.position.z=lerp(cam.position.z,-2,k);cam.lookAt(0,1.4,-31)}}
function shakeStart(){mode='shake';tt=0;ESC.forEach(k=>k.visible=false);ball.position.set(0,.22,0);cap('Captains and officials · pre-match handshakes');P.forEach(p=>setP(p,p.x0,p.t?1.3:-1.3,Math.PI/2));cam.position.set(0,10,39);cam.lookAt(0,1,0)}
function toKick(){mode='wait';cap('');fade(1);setTimeout(()=>{kickoff();fade(0)},600)}
/* ---------- walkable tunnel + dressing room ---------- */
const WK={x:0,z:0,a:0,vx:0,vz:0,ph:0,kind:'pre',talked:false,lock:false,busy:false,exiting:false,msg:0,lk:new T.Vector3(),target:null,camYaw:0,camPitch:0,ri:0};
/* ======================================================================
   FT90 MATCHDAY WORLD v2
   Night sky, high-tech entrance gate, Grand Atrium (mall), escalator + lifts,
   upper concourse with stadium views, stairs, players' corridor, instanced
   body-rigged crowds, armed security, chanting audio, route beacon + map.
   Route: bus -> plaza -> gate -> atrium -> escalator -> upper concourse
          -> west stairs -> players' corridor -> door -> dressing room -> tunnel
   ====================================================================== */
[...ext.children].forEach(c=>{if(c!==bus)ext.remove(c)});
crowdPeople.length=0;worldPeople.length=0;securityStaff.length=0;S.remove(concourse);
bus.position.set(-46,0,-294);
const BLK=[];
/* ---- night sky dome (also improves the match view) ---- */
const sky=new T.Mesh(new T.SphereGeometry(450,32,16),new T.MeshBasicMaterial({fog:false,depthWrite:false,side:T.BackSide,map:tex(1024,512,g=>{
 const gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#040a1c');gr.addColorStop(.3,'#0e1d45');gr.addColorStop(.47,'#34508f');gr.addColorStop(.5,'#c97d63');gr.addColorStop(.53,'#1a2438');gr.addColorStop(1,'#0b1220');g.fillStyle=gr;g.fillRect(0,0,1024,512);
 for(let i=0;i<420;i++){g.fillStyle='rgba(255,255,255,'+(.25+Math.random()*.6)+')';g.fillRect(Math.random()*1024,Math.random()*210,Math.random()<.1?2:1,Math.random()<.1?2:1)}
 for(let i=0;i<26;i++){const x=Math.random()*1024,y=120+Math.random()*90,r=40+Math.random()*70,rg=g.createRadialGradient(x,y,2,x,y,r);rg.addColorStop(0,'rgba(120,140,190,.16)');rg.addColorStop(1,'rgba(120,140,190,0)');g.fillStyle=rg;g.save();g.translate(x,y);g.scale(2.4,.5);g.translate(-x,-y);g.beginPath();g.arc(x,y,r,0,7);g.fill();g.restore()}
 const mg=g.createRadialGradient(720,70,2,720,70,60);mg.addColorStop(0,'rgba(255,250,220,1)');mg.addColorStop(.12,'rgba(255,248,215,.95)');mg.addColorStop(.14,'rgba(200,215,255,.25)');mg.addColorStop(1,'rgba(200,215,255,0)');g.fillStyle=mg;g.fillRect(600,0,240,160)})}));
sky.renderOrder=-10;S.add(sky);
/* ---- batched static geometry: lit / glowing / glass, each one draw call ---- */
const WB=(()=>{const mkB=()=>({p:[],n:[],c:[],i:[]}),B={L:mkB(),E:mkB(),G:mkB()},cube=new T.BoxGeometry(1,1,1),cp=cube.attributes.position.array,cn=cube.attributes.normal.array,ci=cube.index.array,col=new T.Color();
 function put(b,cx,cy,cz,w,h,d,c,rx,ry){col.setHex(c);const base=b.p.length/3,sx=Math.sin(rx||0),cxr=Math.cos(rx||0),sy=Math.sin(ry||0),cyr=Math.cos(ry||0);
  for(let i=0;i<cp.length;i+=3){let x=cp[i]*w,y=cp[i+1]*h,z=cp[i+2]*d,nx=cn[i],ny=cn[i+1],nz=cn[i+2],t;
   t=y*cxr-z*sx;z=y*sx+z*cxr;y=t;t=ny*cxr-nz*sx;nz=ny*sx+nz*cxr;ny=t;
   t=x*cyr+z*sy;z=-x*sy+z*cyr;x=t;t=nx*cyr+nz*sy;nz=-nx*sy+nz*cyr;nx=t;
   b.p.push(x+cx,y+cy,z+cz);b.n.push(nx,ny,nz);b.c.push(col.r,col.g,col.b)}
  for(let i=0;i<ci.length;i++)b.i.push(ci[i]+base)}
 const ext2=(k,x0,x1,y0,y1,z0,z1,c,rx,ry)=>put(B[k],(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,x1-x0,y1-y0,z1-z0,c,rx,ry);
 function flush(){[['L',new T.MeshLambertMaterial({vertexColors:true})],['E',new T.MeshBasicMaterial({vertexColors:true})],['G',new T.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.3,depthWrite:false})]].forEach(([k,m])=>{const b=B[k];if(!b.i.length)return;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('color',new T.Float32BufferAttribute(b.c,3));g.setIndex(new T.Uint32BufferAttribute(b.i,1));const me=new T.Mesh(g,m);me.frustumCulled=false;ext.add(me)})}
 return{L:(...a)=>ext2('L',...a),E:(...a)=>ext2('E',...a),G:(...a)=>ext2('G',...a),flush}})();
const Lb=WB.L,Eb=WB.E,Gb=WB.G;
function sign(txt,x,y,z,w,h,rot,bg,fg,sub){const q=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({side:T.DoubleSide,map:tex(512,Math.round(512*h/w)||128,(g,c)=>{g.fillStyle=bg||'#07172a';g.fillRect(0,0,c.width,c.height);g.fillStyle='#63e6be';g.fillRect(0,0,10,c.height);g.fillStyle=fg||'#f4f8ff';g.textAlign='center';let fs=Math.min(c.height*.56,70);g.font='bold '+fs+'px sans-serif';while(g.measureText(txt).width>c.width-40&&fs>14){fs-=2;g.font='bold '+fs+'px sans-serif'}g.fillText(txt,c.width/2+4,c.height*(sub?.5:.64));if(sub){g.fillStyle='#9fb6cc';g.font='bold '+Math.round(fs*.5)+'px sans-serif';g.fillText(sub,c.width/2,c.height*.84)}})}));q.position.set(x,y,z);q.rotation.y=rot===undefined?Math.PI:rot;ext.add(q);return q}
const N=Math.PI,WEST=Math.PI/2,EAST=-Math.PI/2; // sign facing: N = faces -z (seen walking south)
/* ---- ground, plaza, route ---- */
const sprawl=new T.Mesh(new T.PlaneGeometry(900,420),new T.MeshLambertMaterial({color:0x1b232c}));sprawl.rotation.x=-Math.PI/2;sprawl.position.set(0,-.02,-330);ext.add(sprawl);
const payT=tex(256,256,g=>{g.fillStyle='#4c5561';g.fillRect(0,0,256,256);g.strokeStyle='#3b434d';g.lineWidth=2;for(let i=0;i<=256;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,256);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(256,i);g.stroke()}for(let i=0;i<500;i++){g.fillStyle=Math.random()<.5?'#ffffff0d':'#0000001a';g.fillRect(Math.random()*256,Math.random()*256,4,4)}});payT.wrapS=payT.wrapT=T.RepeatWrapping;payT.repeat.set(17,8);
const plazaM=new T.Mesh(new T.PlaneGeometry(136,64),new T.MeshLambertMaterial({map:payT}));plazaM.rotation.x=-Math.PI/2;plazaM.position.set(0,.02,-285);ext.add(plazaM);
const tileT=tex(256,256,g=>{g.fillStyle='#5b6472';g.fillRect(0,0,256,256);g.strokeStyle='#8e98a8';g.lineWidth=3;g.strokeRect(0,0,256,256);g.strokeStyle='#4a5260';g.lineWidth=1;g.strokeRect(128,0,128,128);g.strokeRect(0,128,128,128)});tileT.wrapS=tileT.wrapT=T.RepeatWrapping;tileT.repeat.set(40,27);
const atriumFloor=new T.Mesh(new T.PlaneGeometry(160,108),new T.MeshLambertMaterial({map:tileT}));atriumFloor.rotation.x=-Math.PI/2;atriumFloor.position.set(0,.03,-194);ext.add(atriumFloor);
Lb(-6,6,.02,.06,-318,-252,0x77818e);
for(let z=-316;z<=-254;z+=4){Eb(-6.3,-6,.05,.13,z,z+1.2,0x7fd8ff);Eb(6,6.3,.05,.13,z,z+1.2,0x7fd8ff)}
// barriers & light poles & flags along the supporter lane
[-1,1].forEach(s=>{Lb(s*11.4-.15,s*11.4+.15,0,1.2,-318,-256,0x9aa3ad);Eb(s*11.4-.17,s*11.4+.17,1.2,1.28,-318,-256,0x7fd8ff)});
for(let z=-314;z<=-258;z+=14)[-1,1].forEach(s=>{Lb(s*24-.2,s*24+.2,0,13,z-.2,z+.2,0x2a303c);Eb(s*24-1.2,s*24+1.2,13,13.4,z-.6,z+.6,0xfff3d0);Lb(s*24+(s<0?.2:-1.7),s*24+(s<0?1.7:-.2),10.5,12,z-.03,z+.03,s<0?0x2a7de1:0xd8342f)});
// merchandise trucks, tents, trees
[[-52,-262,0x174d73,'MERCH'],[-52,-276,0x8b3e2f,'BURGERS'],[52,-262,0x1d6a4f,'DRINKS'],[52,-276,0x7a4b9c,'PIZZA']].forEach(([x,z,c,t])=>{Lb(x-3,x+3,.5,3.2,z-2.2,z+2.2,c);Lb(x-3.2,x+3.2,3.2,3.4,z-2.6,z+2.6,0xf1c40f);Lb(x-2.6,x+2.6,.2,.7,z-2.4,z+2.4,0x20242b);Eb(x-2.6,x+2.6,3.4,3.55,z-2.55,z+2.55,0xffe6a8);BLK.push([x,z,3.4,2.5]);sign(t,x,2.2,z+(x<0?2.25:2.25)*(1),4.4,1,N,'#111827')});
for(let i=0;i<14;i++){const s=i%2?1:-1,x=s*(34+(i>>1)*5),z=-318+(i*7)%40;Lb(x-.25,x+.25,0,2.6,z-.25,z+.25,0x4a3526);Lb(x-1.4,x+1.4,2.4,5,z-1.4,z+1.4,0x1f5a33)}
// monument
Lb(30,34,0,.5,-290,-286,0x2a303c);Lb(31.2,32.8,.5,9,-289,-287,0x0b1b3a);Eb(31.1,32.9,9,9.4,-289.1,-286.9,0x7fd8ff);sign('FT90',32,5.5,-289.1,3.2,3.2,N,'#0b1b3a','#7fd8ff');BLK.push([32,-288,2.4,2.4]);
/* ---- high-tech entrance gate ---- */
const GZ0=-252,GZ1=-248,PORT=[-24,-12,0,12,24];
[[-80,-27],[27,80]].forEach(([a,b])=>Lb(a,b,0,27,GZ0,GZ1,0x232a38));
[-18,-6,6,18].forEach(c=>Lb(c-3,c+3,0,27,GZ0,GZ1,0x232a38));
PORT.forEach((c,i)=>{Lb(c-3,c+3,7.4,27,GZ0,GZ1,0x2c3445);Eb(c-3,c+3,7.2,7.4,GZ0-.1,GZ0+.2,0x7fd8ff);sign('GATE '+String.fromCharCode(65+i),c,8.7,GZ0-.12,5.2,1.3,N,'#06121f','#7fd8ff','FAST-TRACK · PLAYERS & STAFF');
 [-1,1].forEach(s=>{Lb(c+s*3.2-.3,c+s*3.2+.3,0,2.4,GZ1+1,GZ1+2.2,0x161b26);Eb(c+s*3.2-.2,c+s*3.2+.2,1.6,2.2,GZ1+1.6,GZ1+2.3,0x3dffb0);BLK.push([c+s*3.2,GZ1+1.6,.5,.7])});Eb(c-3,c+3,6.2,6.4,GZ1+1.2,GZ1+1.5,0x3dffb0)});
for(let x=-78;x<=78;x+=3){if(PORT.some(c=>Math.abs(x-c)<3.4))continue;Eb(x-.09,x+.09,1,26,GZ0-.12,GZ0-.02,0x4fc8ff)}
Gb(-78,78,10,24,GZ0-.3,GZ0-.2,0x9edbff);
Lb(-80,80,26,27.4,GZ0-3,GZ1+1,0x161b26);Eb(-80,80,26,26.35,GZ0-3.05,GZ0-2.9,0x7fd8ff);
sign('FT90 STADIUM',0,19,GZ0-.4,46,6.2,N,'#050d1c','#d8ecff','MATCHDAY · WELCOME');
Lb(-78,78,11.6,12.1,-263,-251,0x161b26);for(let x=-76;x<=76;x+=6)Eb(x-.3,x+.3,11.5,11.6,-262,-252,0xfff3d0);
[-34,-18,18,34].forEach(x=>{Lb(x-.5,x+.5,0,11.6,-262.5,-261.5,0x2a303c);BLK.push([x,-262,.8,.8])});
[-1,1].forEach(s=>{Lb(s*70-8,s*70+8,0,42,-264,-246,0x141a26);Eb(s*70-8.1,s*70+8.1,39,39.8,-264.1,-245.9,0x7fd8ff);Eb(s*70-1,s*70+1,6,38,-264.1,-263.9,0x4fc8ff);sign('FT90',s*70,26,-264.2,10,10,N,'#0b1b3a','#7fd8ff')});
const doors=PORT.map(c=>[-1,1].map(s=>{const d=new T.Mesh(new T.BoxGeometry(3,6.8,.3),new T.MeshLambertMaterial({color:0x9edbff,transparent:true,opacity:.35,depthWrite:false}));d.position.set(c+s*1.5,3.4,GZ0+1);ext.add(d);return{m:d,c,s}})).flat();
/* ---- Grand Atrium (x -80..80, z -248..-140) ---- */
Lb(-82,-80,0,21,-248,-140,0x1f2634);Lb(80,82,0,21,-248,-140,0x1f2634);Lb(-80,80,20,21,-248,-140,0x161b26);
for(let x=-72;x<=72;x+=16)Eb(x-1,x+1,19.9,20,-244,-142,0xf4f8ff);
Lb(-80,80,0,6,-171,-168,0x232a38);Lb(-80,-67,6,21,-140,-139.4,0x232a38);Lb(-53,80,0,21,-140.6,-140,0x232a38);Lb(-67,-53,14.5,21,-140.6,-140,0x232a38);
// pillars
[-60,-40,-20,20,40,60].forEach(x=>[-228,-196].forEach(z=>{Lb(x-.8,x+.8,0,20,z-.8,z+.8,0x2d3544);Eb(x-.85,x+.85,3,3.3,z-.85,z+.85,0x7fd8ff);BLK.push([x,z,1,1])}));
// central avenue inlay + chevrons guiding to the escalator
Lb(-6,6,.03,.06,-246,-171,0x2a3a55);for(let z=-244;z<=-172;z+=6)Eb(-.7,.7,.06,.08,z,z+1.6,0x42d8ad);
Lb(6,60,.03,.06,-203,-197,0x2a3a55);for(let x=10;x<=56;x+=6)Eb(x,x+1.6,.06,.08,-201.4,-198.6,0x42d8ad);
// Fan Zone monument (centre)
Lb(-10,10,0,.6,-228,-212,0x20283a);Eb(-10,10,.6,.7,-228,-212,0x7fd8ff);Gb(-5,5,.7,4.8,-224,-216,0x9edbff);Eb(-1,1,.9,3.6,-221,-219,0xf1c40f);Eb(-1.8,1.8,3.6,4,-221.4,-218.6,0xf1c40f);BLK.push([0,-220,5.2,4.4]);
sign('FT90 FAN ZONE',0,13,-212,16,3,N,'#07172a','#f4f8ff','TROPHIES · LEGENDS · MATCHDAY LIVE');Lb(-8,8,9,16,-212.3,-212,0x0b1b3a);
// kids play zone
Lb(-26,-14,.03,.07,-200,-186,0x27ae60);[[-24,-198,0xe74c3c],[-20,-194,0xf1c40f],[-16,-198,0x2a7de1],[-23,-189,0x8e44ad]].forEach(([x,z,c])=>{Lb(x-1.3,x+1.3,0,1.5,z-1.3,z+1.3,c);BLK.push([x,z,1.4,1.4])});sign('KIDS ZONE',-20,6.5,-185,8,1.6,N,'#1d6a4f');
// Megastore (west)
sign('OFFICIAL MEGASTORE',-62,15,-206,22,3.4,N,'#07172a','#f4f8ff','SHIRTS · SCARVES · SOUVENIRS');
Lb(-80,-79,0,12,-240,-206,0x0b1b3a);for(let z=-238;z<=-208;z+=4)[0,1,2].forEach(r=>Lb(-79,-78.3,1+r*2.6,3.2+r*2.6,z,z+2.6,[0x2a7de1,0xffffff,0xd8342f,0xf1c40f][(z+r)&3]));
[[-70,-230],[-62,-230],[-70,-218],[-62,-218]].forEach(([x,z])=>{Lb(x-2,x+2,0,1.3,z-1,z+1,0x20283a);Lb(x-1.8,x+1.8,1.3,2.4,z-.3,z+.3,0x2a7de1);BLK.push([x,z,2.2,1.2])});
Lb(-54,-48,0,1.2,-222,-212,0x8b3e2f);BLK.push([-51,-217,3.2,5.2]);
// Food court (east)
sign('FOOD COURT',62,15,-206,22,3.4,N,'#07172a','#f4f8ff','BURGERS · PIZZA · COFFEE · DESSERTS');
['BURGERS','PIZZA','COFFEE','CHICKEN','ICE CREAM','NOODLES'].forEach((t,i)=>{const z=-240+i*5.6,c=[0x8b3e2f,0xb03a2e,0x5b3a29,0x9c6b1f,0x2a7de1,0x1d6a4f][i];Lb(76-.5,79,0,1.1,z,z+4.4,c);Lb(75.5,79.4,3.4,3.7,z-.2,z+4.6,[0xf1c40f,0x1d9e75][i&1]);Eb(75.6,75.9,2.2,3.3,z+.4,z+4,0xffe6a8);BLK.push([77,z+2.2,1.8,2.3]);sign(t,74.9,2.7,z+2.2,3.8,.9,WEST,'#111827')});
for(let r=0;r<3;r++)for(let c=0;c<4;c++){const x=48+c*8,z=-232+r*9;Lb(x-1.2,x+1.2,.9,1.05,z-1.2,z+1.2,0xe8edf4);Lb(x-.15,x+.15,0,.9,z-.15,z+.15,0x20283a);[[-1.7,0],[1.7,0],[0,-1.7],[0,1.7]].forEach(([a,b])=>Lb(x+a-.35,x+a+.35,0,.5,z+b-.35,z+b+.35,[0xd8342f,0x2a7de1,0xf1c40f,0x27ae60][(r+c)&3]));BLK.push([x,z,1.5,1.5])}
// info kiosks with live map screens
[-14,14].forEach(x=>{Lb(x-1.2,x+1.2,0,2.6,-226.4,-225.6,0x161b26);Eb(x-1,x+1,.9,2.4,-226.5,-226.38,0x1d6a9a);sign('STADIUM MAP',x,3.1,-226.5,2.4,.6,N,'#07172a');BLK.push([x,-226,1.3,.6])});
// hanging wayfinding
sign('UPPER CONCOURSE ↑  ESCALATORS →',30,9,-203,16,2,N,'#0b2a28','#9ff5d6','PLAYERS & DRESSING ROOMS · LEVEL 2 · WEST');sign('LIFTS  ←',-56,9,-176,10,1.8,N,'#07172a');
// Escalators (east, x 51..63, z -198..-168, rising 6m) + railings + step lines
Lb(51,63,2.7,3.1,-198.5,-167.6,0x1a202c,-.1974);for(let i=0;i<30;i++){const z=-197+i,y=.1+(i+.5)*(6/30);Eb(52,62,y+.28,y+.32,z,z+.12,0x394357,0)}
[51.3,57,62.7].forEach(x=>{Lb(x-.15,x+.15,1.4,2.2,-198,-168,0x0b1b3a,-.1974);Eb(x-.17,x+.17,2.15,2.25,-198,-168,0x7fd8ff,-.1974)});
sign('ESCALATOR ↑ LEVEL 2',57,9,-199,8,1.6,N,'#0b2a28','#9ff5d6');
// Lifts (west) with moving glass cars
[-74,-70].forEach(x=>{Gb(x-1.5,x+1.5,0,20,-178,-174,0x9edbff);Lb(x-1.6,x-1.5,0,20,-178,-174,0x2d3544);Lb(x+1.5,x+1.6,0,20,-178,-174,0x2d3544)});
const liftCar=new T.Mesh(new T.BoxGeometry(2.6,2.8,3.2),new T.MeshBasicMaterial({color:0x7fd8ff,transparent:true,opacity:.55}));liftCar.position.set(-74,1.4,-176);ext.add(liftCar);const liftCar2=liftCar.clone();liftCar2.position.set(-70,12,-176);ext.add(liftCar2);BLK.push([-72,-176,5,2.4]);
Eb(-75.6,-68.4,6.1,6.3,-173.9,-173.7,0x3dffb0);sign('LIFTS → LEVEL 2',-72,4.2,-173.7,7,1,N,'#07172a');
/* ---- Upper concourse / mezzanine (y=6, z -168..-140) with stadium-view windows ---- */
Lb(-80,80,5.4,6,-168,-140,0x39414f);Lb(-80,80,13.6,14,-168,-140,0x161b26);for(let x=-72;x<=72;x+=14)Eb(x-1.5,x+1.5,13.5,13.6,-165,-143,0xf4f8ff);
Gb(-80,80,6,7.3,-168.1,-167.9,0x9edbff);Eb(-80,80,7.3,7.45,-168.2,-167.8,0x7fd8ff);
for(let x=-62;x<=62;x+=6){Lb(x-.15,x+.15,6,13.6,-140.6,-140.2,0x2d3544)}Gb(-66,62,6.5,13.5,-140.5,-140.4,0x9edbff);
Lb(-80,-79,6,14,-168,-140,0x1f2634);Lb(79,80,6,14,-168,-140,0x1f2634);
sign('UPPER CONCOURSE',0,11.5,-166.7,18,2,N,'#07172a','#f4f8ff','LEVEL 2 · VIEWS OF THE PITCH');
sign('PLAYERS & DRESSING ROOMS ←  STAIRS',-34,10,-166.7,22,2.2,N,'#0a2640','#7fd8ff','WEST · FOLLOW THE BLUE LINE');
for(let x=52;x>=-58;x-=5)Eb(x-.6,x+.6,6.01,6.04,-154.8,-153.2,0x2a9dff);
// Hall of Fame cases
for(let i=0;i<5;i++){const x=-44+i*9;Lb(x-1.5,x+1.5,6,7.2,-166,-163,0x20283a);Gb(x-1.4,x+1.4,7.2,8.8,-165.9,-163.1,0x9edbff);Eb(x-.4,x+.4,7.4,8.2,-164.8,-164.2,[0xf1c40f,0xc0c8d4,0xd8832f,0xf1c40f,0x7fd8ff][i]);BLK.push([x,-164.5,1.7,1.7])}
sign('HALL OF FAME',-22,12.2,-166.5,10,1.6,N,'#2a1f05','#f1c40f');
// Sky lounge
Lb(22,44,6,7.1,-164,-160,0x5b3a29);Eb(22,44,7.1,7.2,-164,-160,0xffe6a8);for(let x=24;x<=42;x+=4)Lb(x-.35,x+.35,6,6.8,-158.5,-157.8,0xd8342f);BLK.push([33,-162,11.2,2.4]);sign('SKY LOUNGE',33,12,-166.5,10,1.6,N,'#2b1a10','#ffe6a8');
// Window pylons on the south side
BLK.push([-72,-141.5,1,1]);
/* ---- West stairs (x -66..-54, z -140..-112, 6m drop) ---- */
for(let i=0;i<14;i++){const y=6-(i+1)*(6/14);Lb(-66,-54,0,Math.max(.05,y),-140+i*2,-138+i*2,0x4a5262);Eb(-66,-54,Math.max(.05,y)-.02+.02,Math.max(.05,y)+.03,-138+i*2-.12,-138+i*2,0x7fd8ff)}
[-66,-54].forEach(x=>{Lb(x-.15,x+.15,0,14.5,-140,-112,0x1f2634);Lb(x-.2,x+.2,1,2.2,-140,-112,0x0b1b3a,.2)});Lb(-67,-53,14.4,14.6,-140,-112,0x161b26);for(let z=-136;z<=-116;z+=7)Eb(-61,-59,14.3,14.4,z,z+3,0xf4f8ff);
sign('PLAYERS ONLY ↓',-60,10.5,-139.6,9,2,N,'#0a2640','#7fd8ff','STAFF · MEDIA · DRESSING ROOMS');
/* ---- Players' corridor (ground) ---- */
const FLR=0x182236,WL=0x2a3550;
Lb(-67,-53,-.1,.02,-112,-96,FLR);Lb(-53,3,-.1,.02,-103,-97,FLR);Lb(-3,3,-.1,.02,-97,-86,FLR);
Lb(-67,-66.7,0,3.6,-112,-96,WL);Lb(-53.3,-53,0,3.6,-96,-97,WL);Lb(-67,-53,0,3.6,-96.3,-96,WL);
Lb(-53,3,0,3.6,-103.3,-103,WL);Lb(-53,-3.2,0,3.6,-97,-96.7,WL);Lb(3,3.3,0,3.6,-103,-86,WL);Lb(-3.3,-3,0,3.6,-97,-86,WL);Lb(3.2,3.3,0,3.6,-86.4,-86,WL);
Eb(-66.8,-66.6,3.2,3.6,-112,-96,0x7fd8ff);Eb(-53,3,3.35,3.55,-103.1,-102.9,0x7fd8ff);Eb(-53,-3.4,3.35,3.55,-96.9,-96.7,0x7fd8ff);
Gb(-67,3,3.7,4.4,-103,-97,0x9edbff);for(let x=-50;x<=0;x+=10)Eb(x-.15,x+.15,3.6,3.7,-103,-97,0xf4f8ff);
for(let x=-52;x<=2;x+=2.5)Eb(x,x+1.2,.03,.06,-100.2,-99.8,0x2a9dff);
for(let i=0;i<5;i++)sign(['UNITED','FT90','ONE CLUB','THE GAME NEVER ENDS','MATCHDAY'][i],-48+i*10.5,2.1,-102.95,8,1.7,N,'#0b1b3a','#7fd8ff');
sign('PLAYERS ENTRANCE · DRESSING ROOM →',-8,3.3,-97.3,12,1.1,N,'#0a2640','#7fd8ff');
sign('MANAGER & PLAYERS',0,3.2,-89,4.4,.9,N,'#0a2640','#7fd8ff');
Lb(-66,-63,0,1,-111.5,-109,0x30363f);BLK.push([-64.5,-110.2,1.6,1.4]);Lb(-20,-14,0,1.4,-102.9,-101.8,0x20283a);BLK.push([-17,-102.4,3.2,.7]);
const pdoor=[-1,1].map(s=>{const d=new T.Mesh(new T.BoxGeometry(1.5,3.4,.5),new T.MeshLambertMaterial({color:0x14203a}));d.position.set(-30+s*.75,1.7,-100);ext.add(d);return{m:d,s}});Eb(-31.8,-28.2,3.4,3.6,-100.3,-99.7,0x3dffb0);sign('PLAYERS ONLY',-30,2.8,-102.8,3.2,.6,N,'#0a2640','#ff7a7a');BLK.push([-30,-100,.3,3]);
/* ---- batched geometry done ---- */
WB.flush();
/* ---- instanced body crowds: torso, head, hair, legs, arms, flags, bags in a few draw calls ---- */
const IC=(()=>{const max=760,lam=new T.MeshLambertMaterial({color:0xffffff}),mk1=(g,m)=>{const q=new T.InstancedMesh(g,m||lam,max);q.frustumCulled=false;q.count=0;ext.add(q);return q};
 const M={torso:mk1(new T.BoxGeometry(.5,.64,.3).translate(0,1.14,0)),head:mk1(new T.SphereGeometry(.17,8,6).translate(0,1.64,0)),hair:mk1(new T.SphereGeometry(.19,8,5,0,Math.PI*2,0,Math.PI*.55).translate(0,1.68,0)),legL:mk1(new T.BoxGeometry(.21,.82,.23).translate(0,-.41,0)),legR:mk1(new T.BoxGeometry(.21,.82,.23).translate(0,-.41,0)),armL:mk1(new T.BoxGeometry(.13,.6,.14).translate(0,-.3,0)),armR:mk1(new T.BoxGeometry(.13,.6,.14).translate(0,-.3,0)),pole:mk1(new T.BoxGeometry(.04,1.2,.04).translate(0,.6,0),new T.MeshLambertMaterial({color:0xcccccc})),cloth:mk1(new T.PlaneGeometry(.8,.5).translate(.42,.95,0),new T.MeshLambertMaterial({color:0xffffff,side:T.DoubleSide})),bag:mk1(new T.BoxGeometry(.34,.5,.2).translate(0,.25,0))};
 const L=[],keys=Object.keys(M),Y=new T.Vector3(0,1,0),X=new T.Vector3(1,0,0),qB=new T.Quaternion(),qL=new T.Quaternion(),qF=new T.Quaternion(),q=new T.Quaternion(),v=new T.Vector3(),base=new T.Vector3(),m4=new T.Matrix4(),one=new T.Vector3(1,1,1),zero=new T.Vector3(0,0,0),z4=new T.Matrix4().makeScale(0,0,0),col=new T.Color();
 function put(mesh,i,ox,oy,oz,ql){v.set(ox,oy,oz).applyQuaternion(qB).add(base);if(ql)q.copy(qB).multiply(ql);else q.copy(qB);m4.compose(v,q,one);mesh.setMatrixAt(i,m4)}
 function hide(i){keys.forEach(k=>M[k].setMatrixAt(i,z4))}
 function add(x,z,o){if(L.length>=max)return null;const i=L.length,p={x,z,y:o.y||0,ry:o.ry||0,kind:o.kind||'idle',ph:Math.random()*20,sp:o.sp||1.2,vis:true,ax:x,az:z,bx:x,bz:z,L:1,flag:!!o.flag};
  if(o.path){p.ax=o.path[0];p.az=o.path[1];p.bx=o.path[2];p.bz=o.path[3];p.L=Math.hypot(p.bx-p.ax,p.bz-p.az)||1}
  L.push(p);const c=o.col===undefined?0x2a7de1:o.col;[['torso',c],['armL',c],['armR',c],['legL',o.leg||0x15171c],['legR',o.leg||0x15171c],['head',o.skin||0xd9a77a],['hair',o.hair||0x1a1208],['cloth',o.fc||pick([0x2a7de1,0xd8342f,0xffffff,0xf1c40f])],['bag',pick([0x222831,0x8b3e2f,0x1d6a4f,0x555d68])]].forEach(([k,h])=>M[k].setColorAt(i,col.setHex(h)));
  keys.forEach(k=>{M[k].count=L.length});p.bagOn=!!o.bag;return p}
 function update(t,px,pz,R){const R2=R*R;for(let i=0;i<L.length;i++){const p=L[i],dx=p.x-px,dz=p.z-pz;
   if(dx*dx+dz*dz>R2&&!(p.kind==='walk'&&((p.ax-px)**2+(p.az-pz)**2<R2||(p.bx-px)**2+(p.bz-pz)**2<R2))){if(p.vis){hide(i);p.vis=false}continue}p.vis=true;
   let x=p.x,z=p.z,ry=p.ry,j=0,aL=.08,aR=.08,lL=0,lR=0;const u=t+p.ph;
   switch(p.kind){case 'chant':j=Math.max(0,Math.sin(u*3.6))*.16;aL=-(2.55+Math.sin(u*7.2)*.3);aR=-(2.55+Math.cos(u*7.2)*.3);break;
    case 'wave':aR=-(2.8+Math.sin(u*5)*.3);j=Math.abs(Math.sin(u*2))*.05;break;
    case 'clap':aL=aR=-(1.25+Math.sin(u*9)*.25);j=Math.abs(Math.sin(u*3))*.07;break;
    case 'bounce':j=Math.abs(Math.sin(u*4))*.35;aL=aR=-2.2+Math.sin(u*8)*.4;break;
    case 'walk':{const Ln=p.L,w2=(t*p.sp+p.ph*13)%(2*Ln),f=w2<Ln?w2/Ln:2-w2/Ln,s=w2<Ln?1:-1;x=p.ax+(p.bx-p.ax)*f;z=p.az+(p.bz-p.az)*f;p.x=x;p.z=z;ry=Math.atan2((p.bx-p.ax)*s,(p.bz-p.az)*s);const w=Math.sin(t*p.sp*2.6+p.ph*9);lL=w*.7;lR=-w*.7;aL=-w*.5;aR=w*.5;j=Math.abs(w)*.04;break}
    default:aR=-.45+Math.sin(u*1.6)*.35;aL=.1}
   qB.setFromAxisAngle(Y,ry);base.set(x,p.y+j,z);
   put(M.torso,i,0,0,0);put(M.head,i,0,0,0);put(M.hair,i,0,0,0);
   qL.setFromAxisAngle(X,lL);put(M.legL,i,-.13,.82,0,qL);qL.setFromAxisAngle(X,lR);put(M.legR,i,.13,.82,0,qL);
   qL.setFromAxisAngle(X,aL);put(M.armL,i,-.33,1.42,0,qL);qL.setFromAxisAngle(X,aR);put(M.armR,i,.33,1.42,0,qL);
   if(p.flag){qF.setFromAxisAngle(Y,Math.sin(u*3)*.5);put(M.pole,i,.36,1.05,.2);v.set(.36,1.05+0,.2);put(M.cloth,i,.36,1.05,.2,qF)}else{M.pole.setMatrixAt(i,z4);M.cloth.setMatrixAt(i,z4)}
   if(p.bagOn)put(M.bag,i,.5,0,.15);else M.bag.setMatrixAt(i,z4)}
  keys.forEach(k=>{M[k].instanceMatrix.needsUpdate=true})}
 keys.forEach(k=>{M[k].instanceMatrix.setUsage(T.DynamicDrawUsage)});
 return{add,update,L}})();
const FC=[0x2a7de1,0xffffff,0x2a7de1,0x1d5fb0,0xd8342f,0xf1c40f,0x0b1b3a,0x27ae60],LG=[0x15171c,0x233a63,0x30343b,0x4a4f58],HC=[0x1a1208,0x3a2512,0x6b4a22,0xc9a24a,0x111111];
const rnd=(a,b)=>a+Math.random()*(b-a);
const fan=(x,z,cx,cz,kind,o)=>IC.add(x,z,Object.assign({kind,ry:Math.atan2(cx-x,cz-z),col:pick(FC),leg:pick(LG),skin:pick(SKT),hair:pick(HC),flag:kind==='wave'},o||{}));
const KN=['chant','chant','chant','wave','clap','clap','idle'];
// supporter lanes on both sides of the team-arrival route (3 rows deep, chanting)
for(const s of [-1,1])for(let r=0;r<3;r++)for(let z=-316;z<-257;z+=1.75)fan(s*(13.2+r*1.6)+rnd(-.2,.2),z+rnd(-.4,.4),0,z,pick(KN),{y:r*.0});
// crowds around the gate and food trucks
for(let i=0;i<60;i++)fan(rnd(-60,60),rnd(-276,-256),0,-250,pick(['idle','idle','chant','clap']),{});
for(let i=0;i<22;i++)fan(rnd(-64,-34),rnd(-318,-280),-46,-294,pick(['clap','chant','wave']),{});
// plaza walkers, families with luggage
for(let i=0;i<16;i++){const z=rnd(-312,-262),x0=rnd(-60,-26);IC.add(x0,z,{kind:'walk',path:[x0,z,x0+rnd(26,40),z+rnd(-6,6)],sp:rnd(.9,1.6),col:pick(FC),leg:pick(LG),skin:pick(SKT),hair:pick(HC),bag:i%2===0})}
for(let i=0;i<14;i++){const z=rnd(-312,-262),x0=rnd(26,62);IC.add(x0,z,{kind:'walk',path:[x0,z,x0-rnd(24,40),z+rnd(-6,6)],sp:rnd(.9,1.6),col:pick(FC),leg:pick(LG),skin:pick(SKT),hair:pick(HC),bag:i%3===0})}
// Atrium: shoppers, queues, chatting groups, children, fans in kits
for(let i=0;i<46;i++){const z=rnd(-242,-176),x0=rnd(-74,40);IC.add(x0,z,{kind:'walk',path:[x0,z,x0+rnd(18,40),z+rnd(-8,8)],sp:rnd(.8,1.5),col:pick(FC.concat([0x8e44ad,0xe67e22,0x202733])),leg:pick(LG),skin:pick(SKT),hair:pick(HC),bag:i%3===0})}
for(let i=0;i<36;i++)IC.add(rnd(-74,74),rnd(-240,-178),{kind:'idle',ry:rnd(0,6.28),col:pick(FC.concat([0x8e44ad,0xe67e22])),leg:pick(LG),skin:pick(SKT),hair:pick(HC)});
for(let i=0;i<10;i++)IC.add(rnd(-26,-14),rnd(-200,-186),{kind:'bounce',ry:rnd(0,6.28),col:pick([0xe74c3c,0xf1c40f,0x2a7de1,0x27ae60]),leg:0x233a63,skin:pick(SKT),hair:pick(HC),y:0});
for(let i=0;i<14;i++)IC.add(rnd(-10,10),rnd(-232,-210),{kind:'idle',ry:Math.atan2(0,1)+(i%2?0:Math.PI),col:pick(FC),leg:pick(LG),skin:pick(SKT),hair:pick(HC)});
// Upper concourse crowd
for(let i=0;i<34;i++){const z=rnd(-166,-142),x0=rnd(-70,20);IC.add(x0,z,{kind:'walk',path:[x0,z,x0+rnd(20,50),z+rnd(-3,3)],sp:rnd(.8,1.4),y:6,col:pick(FC.concat([0x8e44ad,0x202733])),leg:pick(LG),skin:pick(SKT),hair:pick(HC),bag:i%4===0})}
for(let i=0;i<18;i++)IC.add(rnd(-72,72),rnd(-160,-143),{kind:'idle',ry:rnd(0,6.28),y:6,col:pick(FC),leg:pick(LG),skin:pick(SKT),hair:pick(HC)});
/* ---- rigged NPCs (full-body model, same rig as the players): vendors, buyers, security, staff, families ---- */
const NPC=[];
function npc(x,z,o){o=o||{};const m=mk(o.col===undefined?pick([0x2a7de1,0xd8342f,0xf2f2f2,0x27ae60,0xf1c40f,0x8e44ad,0xe67e22,0x202733]):o.col,S,{shorts:o.sh===undefined?0x20242b:o.sh,skin:(Math.random()*5)|0,hair:(Math.random()*5)|0,hs:(Math.random()*5)|0,boot:0x171717});
 if(o.kid)m.scale.setScalar(.74);m.position.set(x,o.y||0,z);m.rotation.y=-(o.a||0);ext.add(m);
 if(o.gun){const gn=new T.Mesh(new T.BoxGeometry(.95,.09,.08),new T.MeshLambertMaterial({color:0x14161b}));gn.position.set(.14,.3,.2);gn.rotation.z=-.45;m.J.torso.add(gn);const st=new T.Mesh(new T.BoxGeometry(.22,.12,.06),new T.MeshLambertMaterial({color:0x14161b}));st.position.set(-.3,.22,.2);m.J.torso.add(st)}
 if(o.vest){const vt=new T.Mesh(new T.BoxGeometry(.43,.5,.62),new T.MeshLambertMaterial({color:0xf4d03f}));vt.position.set(0,.3,0);m.J.torso.add(vt)}
 if(o.cam){const cb=new T.Mesh(new T.BoxGeometry(.5,.3,.22),new T.MeshLambertMaterial({color:0x0a0d14}));cb.position.set(.25,.5,.2);m.J.torso.add(cb)}
 const r={m,kind:o.kind||'talk',x,z,y:o.y||0,ph:Math.random()*8,path:o.path,sp:o.sp||1.1,u:Math.random()*100};NPC.push(r);return r}
// gate security: armed officers and stewards in hi-vis
PORT.forEach((c,i)=>{npc(c+3.2,-245,{a:Math.PI/2,col:0x1c2330,sh:0x1c2330,gun:i%2===0,vest:i%2===1,kind:'talk'})});
[-16,-8,8,16].forEach((x,i)=>npc(x,-262.5,{a:Math.PI/2,col:0x1c2330,sh:0x1c2330,gun:true,kind:'talk'}));
[-10.5,10.5].forEach(x=>[-300,-286,-270].forEach(z=>npc(x,z,{a:x<0?0:Math.PI,col:0x1c2330,sh:0x1c2330,gun:true,vest:false,kind:'talk'})));
// plaza vendors + buyers at the trucks
[[-52,-259.4],[-52,-273.4],[52,-259.4],[52,-273.4]].forEach(([x,z],i)=>{npc(x,z,{a:Math.PI/2,col:0xf4f8ff,sh:0x20242b,kind:'talk'});npc(x+(x<0?1:-1)*0,z+1.7+i%2*.5,{a:-Math.PI/2,kind:'talk'})});
// atrium: megastore staff + customers, food-court sellers + buyers, fan-zone host, lift/escalator stewards
[[-52,-210.5],[-54,-223]].forEach(([x,z])=>npc(x,z,{a:Math.PI/2,col:0xd8342f,kind:'talk'}));[[-48,-216],[-56,-212],[-46,-222]].forEach(([x,z],i)=>npc(x,z,{a:i*1.7,kind:'talk'}));
for(let i=0;i<6;i++){npc(74.6,-237.8+i*5.6,{a:Math.PI,col:[0xf4f8ff,0xf1c40f,0xd8342f][i%3],kind:'talk'});npc(72.4,-237.8+i*5.6+rnd(-.5,.5),{a:0,kind:'talk'})}
npc(0,-212.8,{a:Math.PI/2,col:0x2a7de1,kind:'talk'});npc(-72,-171.5,{a:Math.PI/2,col:0xf4d03f,vest:true,kind:'talk'});npc(57,-199.5,{a:Math.PI/2,col:0xf4d03f,vest:true,kind:'talk'});npc(48,-199.5,{a:Math.PI/2,col:0x1c2330,sh:0x1c2330,gun:true,kind:'talk'});
// families (adult + child) crossing the atrium and plaza
[[ -40,-190,-10,-192],[ 20,-236,48,-240],[-36,-240,-6,-236],[-30,-300,-15,-296],[30,-300,16,-290]].forEach(([ax,az,bx,bz],i)=>{npc(ax,az,{kind:'patrol',path:[ax,az,bx,bz],sp:1.15+i*.05});npc(ax+.8,az+.5,{kind:'patrol',path:[ax+.8,az+.5,bx+.8,bz+.5],sp:1.15+i*.05,kid:true})});
// upper concourse stewards + patrons, armed security by the stairs
[[-30,-155],[10,-150],[40,-160]].forEach(([x,z],i)=>npc(x,z,{y:6,kind:'talk',a:i*2,col:0x1c2330,sh:0x1c2330,vest:i!==1,gun:i===1}));[[ -52,-158,-70,-158],[0,-146,36,-146]].forEach(([ax,az,bx,bz],i)=>npc(ax,az,{y:6,kind:'patrol',path:[ax,az,bx,bz],sp:1.2}));
npc(-62,-145,{y:6,a:Math.PI/2,col:0x1c2330,sh:0x1c2330,gun:true,kind:'talk'});npc(-58,-145,{y:6,a:Math.PI/2,col:0x1c2330,sh:0x1c2330,gun:true,kind:'talk'});
// players' corridor: kit staff, camera crew, armed guards, ball kids
npc(-36,-101.5,{a:Math.PI,col:0x1c2330,sh:0x1c2330,gun:true,kind:'talk'});npc(-24,-98.6,{a:0,col:0x1c2330,sh:0x1c2330,gun:true,kind:'talk'});npc(-48,-100,{a:0,col:0x2a7de1,kind:'talk'});npc(-12,-101.6,{a:Math.PI/2,col:0x0b1b3a,cam:true,kind:'talk'});npc(-9,-98.4,{a:0,col:0x0b1b3a,cam:true,kind:'talk'});npc(-58,-104,{a:Math.PI/2,col:0xf1c40f,sh:0x101820,kid:true,kind:'talk'});npc(-56,-103,{a:Math.PI/2,col:0xf1c40f,sh:0x101820,kid:true,kind:'talk'});
function npcTick(t,px,pz){NPC.forEach(r=>{let dx=r.x-px,dz=r.z-pz;if(r.path){dx=r.path[0]-px;dz=r.path[1]-pz}if(dx*dx+dz*dz>5200){r.m.visible=false;return}r.m.visible=true;
 if(r.kind==='patrol'){const[ax,az,bx,bz]=r.path,Ln=Math.hypot(bx-ax,bz-az),w=(t*r.sp+r.u)%(2*Ln),f=w<Ln?w/Ln:2-w/Ln,s=w<Ln?1:-1;r.x=ax+(bx-ax)*f;r.z=az+(bz-az)*f;r.m.position.set(r.x,r.y,r.z);r.m.rotation.y=-Math.atan2((bz-az)*s,(bx-ax)*s);r.m.anim(r.sp*3.2,t*r.sp*2.6+r.ph)}
 else{r.m.pose('talk',t+r.ph)}})}
/* ---- chanting crowd audio (procedural) + on-screen chants ---- */
const AU={c:null,noise:null,voice:null,lvl:0};
function audioInit(){if(AU.c)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),len=c.sampleRate*2,buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);let l=0;for(let i=0;i<len;i++){l=l*.94+(Math.random()*2-1)*.06;d[i]=l*3.2}
 const src=c.createBufferSource();src.buffer=buf;src.loop=true;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=650;bp.Q.value=.6;const g=c.createGain();g.gain.value=0;src.connect(bp);bp.connect(g);g.connect(c.destination);src.start();
 const vg=c.createGain();vg.gain.value=0;const f1=c.createBiquadFilter(),f2=c.createBiquadFilter();f1.type=f2.type='bandpass';f1.frequency.value=700;f2.frequency.value=1250;f1.Q.value=f2.Q.value=3;
 [140,148,176,186,220,233].forEach(fq=>{const o=c.createOscillator();o.type='sawtooth';o.frequency.value=fq;const og=c.createGain();og.gain.value=.05;o.connect(og);og.connect(f1);og.connect(f2);o.start()});f1.connect(vg);f2.connect(vg);vg.connect(c.destination);
 AU.c=c;AU.noise=g;AU.voice=vg;setInterval(chantBurst,2600)}catch(e){}}
const CHANTS=['UNI-TED! UNI-TED!','WE ARE FT90!','OLE OLE OLE OLE!','COME ON YOU BLUES!','FT-NINETY! FT-NINETY!'];let chantI=0;
function chantBurst(){if(!AU.c)return;if(AU.c.state==='suspended')AU.c.resume();const t0=AU.c.currentTime+.05,g=AU.voice.gain,lv=AU.lvl;if(lv<.03)return;[0,.45,.9,1.55,2.0].forEach((o,i)=>{g.cancelScheduledValues&&0;g.setTargetAtTime(lv*.55,t0+o,.03);g.setTargetAtTime(0,t0+o+(i===2||i===4?.4:.22),.05)});
 const el=document.getElementById('chant');if(el&&AU.lvl>.2){el.textContent=CHANTS[chantI++%CHANTS.length];el.style.opacity=1;setTimeout(()=>{el.style.opacity=0},1900)}}
function crowdLevel(){if(mode==='walk'){if(WK.kind==='half')return .12;const x=WK.x,z=WK.z;if(z<-252)return Math.min(.95,.35+(Math.abs(x)<22?.6:0));if(z<-168)return .3;if(z<-112)return .2;return .1}if(mode==='lineup'||mode==='shake')return .95;if(mode==='play')return .42+Math.min(.5,ca*.2);return .1}
function audioTick(dt){if(!AU.c)return;const lv=crowdLevel();AU.lvl+=(lv-AU.lvl)*Math.min(1,dt*1.5);AU.noise.gain.setTargetAtTime(AU.lvl*.35,AU.c.currentTime,.2)}
/* ---- floor height, route beacon ---- */
function gy(x,z){if(typeof WK==='undefined'||WK.kind!=='pre')return 0;if(x>=51&&x<=63&&z>=-198&&z<-168)return 6*cl((z+198)/30,0,1);if(z>=-168&&z<-140&&x>-80&&x<80)return 6;if(x>=-67&&x<=-53&&z>=-140&&z<-112)return 6*(1-cl((z+140)/28,0,1));return 0}
const ROUTE=[[-41,-290],[-26,-280],[0,-268],[0,-254],[0,-244],[0,-228],[28,-205],[57,-200],[57,-166],[50,-154],[-60,-154],[-60,-136],[-60,-110],[-60,-100],[-33,-100],[-8,-100],[0,-92],[0,-80],[0,-56],[0,-37]];
const beacon=new T.Mesh(new T.CylinderGeometry(.5,.5,70,10,1,true),new T.MeshBasicMaterial({color:0x42ffcc,transparent:true,opacity:.28,depthWrite:false,side:T.DoubleSide}));ext.add(beacon);
const beaconRoom=beacon.clone();S.add(beaconRoom);beaconRoom.visible=false;
/* ---- per-frame world update (called from walkTick) ---- */
function worldTick(now,dt){const px=WK.x,pz=WK.z;
 PORT.forEach(()=>0);doors.forEach(d=>{const near=Math.abs(px-d.c)<9&&Math.abs(pz+250)<12;d.m.position.x+=((d.c+d.s*(near?4.4:1.5))-d.m.position.x)*Math.min(1,dt*5)});
 pdoor.forEach(d=>{d.m.position.y+=((WK.access?5.6:1.7)-d.m.position.y)*Math.min(1,dt*3)});
 liftCar.position.y=7+Math.sin(now*.45)*6.2;liftCar2.position.y=7-Math.sin(now*.45)*6.2;
 if(WK.kind==='pre'){IC.update(now,px,pz,95);npcTick(now,px,pz);while(WK.ri<ROUTE.length-1&&Math.hypot(ROUTE[WK.ri][0]-px,ROUTE[WK.ri][1]-pz)<5)WK.ri++;const rp=ROUTE[WK.ri];beacon.visible=!WK.talked;beacon.position.set(rp[0],gy(rp[0],rp[1])+35,rp[1])}
 audioTick(dt)}

function inside(x,z){
 const R=(x0,x1,z0,z1)=>x>=x0&&x<=x1&&z>=z0&&z<=z1;
 const room=Math.abs(x)<13.2&&z>-86&&z<=-63.4,tun=Math.abs(x)<3.5&&z>-63.4&&z<=-36.6;
 if(WK.kind==='half'){if(room||tun)return true;return !WK.lock&&R(-55,55,-36.8,35.5)}
 if(BLK.some(([bx,bz,rx,rz])=>Math.abs(x-bx)<rx&&Math.abs(z-bz)<rz))return false;
 if(R(-68,68,-320,-252))return true;                       // arrival plaza
 if(R(-27,27,-252,-247.5))return WK.security||z>-252.4;    // gate lanes (security first)
 if(R(-78,78,-247.5,-171)||R(52,62,-198,-168))return true; // grand atrium + escalator
 if(R(-78,78,-168,-140))return true;                       // upper concourse (level 2)
 if(R(-66,-54,-140,-112)||R(-66,-54,-112,-96))return true; // west stairs + landing
 if(R(-66,-31,-102.6,-97.4))return true;                   // corridor up to the players-only door
 if(!WK.access)return false;
 if(R(-31,2.6,-102.6,-97.4)||R(-2.4,2.4,-98,-86))return true; // beyond the door
 if(room||tun)return true;
 return !WK.lock&&R(-55,55,-36.8,35.5)}
function openDlg(txt,ch){$('dtx').textContent=txt;const c=$('dch');c.innerHTML='';ch.forEach(([l,fn])=>{const b=document.createElement('button');b.textContent=l;b.onclick=fn;c.appendChild(b)});$('dlg').style.display='flex';WK.busy=true}
function closeDlg(){$('dlg').style.display='none';WK.busy=false}
function coachTalk(){if(WK.kind==='pre'&&!WK.access){openDlg('The team liaison stops you at the dressing-room entrance. Please pass the accreditation checkpoint on the public concourse first.',[['Understood',closeDlg]]);return}if(WK.talked){openDlg('Gaffer: "Go on then. Out you go."',[['Okay',closeDlg]]);return}
const q=WK.kind==='pre'?'Gaffer: "Big night, lad. How do you want us to play it?"':'Gaffer: "Talk to me. What do we need for the second half?"';
const choose=m=>{st.m[m]=m==='op'?.92:m==='sp'?1.08:1.18;WK.talked=true;WK.lock=false;openDlg('Gaffer: "Right. Go out there and show them."',[["Let's go",()=>{closeDlg();say(WK.kind==='pre'?'Head out through the tunnel':'Head back out to the pitch',2800)}]])};
openDlg(q,[['Motivate',()=>choose('sp')],['Demand more',()=>choose('pw')],['Stay calm',()=>choose('op')]])}
function openTactics(){st.pause=true;$('pm').classList.add('on')}
const goLevel=l=>{if(WK.busy)return;WK.busy=true;fade(1);setTimeout(()=>{WK.x=-70;WK.z=l?-160:-170.5;WK.vx=WK.vz=0;fade(0);WK.busy=false;say(l?'LEVEL 2 · Upper Concourse':'LEVEL 1 · Grand Atrium',2200)},600)};
const INT=[
 {x:0,z:-253,r:9,label:'Security check',fn:()=>showSecurityCheck()},
 {x:-14,z:-224,r:4.5,label:'Stadium map',fn:()=>openMap()},{x:14,z:-224,r:4.5,label:'Stadium map',fn:()=>openMap()},
 {x:0,z:-232,r:8,label:'Fan Zone',fn:()=>openDlg('FT90 FAN ZONE · The trophy cabinet shines under the atrium lights. Supporters queue for photos, legends videos play on the big ring screen.',[['Take a photo',()=>{closeDlg();say('Great shot! The fan zone team cheers.',2000)}],['Move on',closeDlg]])},
 {x:-60,z:-214,r:8,label:'Megastore',fn:()=>openDlg('OFFICIAL FT90 MEGASTORE · Shirts, scarves and matchday souvenirs. Staff are serving a queue of supporters.',[['Buy a scarf · £12',()=>{closeDlg();say('FT90 scarf added to your matchday bag.',2200)}],['Leave',closeDlg]])},
 {x:66,z:-221,r:10,label:'Food court',fn:()=>openDlg('FOOD COURT · Burgers, pizza, coffee, chicken, ice cream and noodles. The sellers are calling out orders.',[['Buy a coffee · £3',()=>{closeDlg();say('Coffee purchased. The seller nods.',2200)}],['Not now',closeDlg]])},
 {x:-20,z:-192,r:7,label:'Kids zone',fn:()=>say('Children are bouncing on the soft-play blocks while parents watch.',2600)},
 {x:-70,z:-171.5,r:4,label:'Lift to Level 2',fn:()=>goLevel(1)},{x:-70,z:-160,r:4.5,label:'Lift to Level 1',fn:()=>goLevel(0)},
 {x:57,z:-200,r:5,label:'Escalator',fn:()=>say('Step onto the escalator (east side) to ride up to the Upper Concourse.',3000)},
 {x:-22,z:-158,r:9,label:'Hall of Fame',fn:()=>openDlg('HALL OF FAME · Trophies and kits from FT90 legends. A plaque reads: THE GAME NEVER ENDS.',[['Close',closeDlg]])},
 {x:33,z:-157,r:9,label:'Sky lounge',fn:()=>openDlg('SKY LOUNGE · Hospitality guests enjoy the view over the pitch.',[['Close',closeDlg]])},
 {x:-60,z:-144,r:5,label:'Armed security',fn:()=>say('Security: "Players and staff only past this point. Take the stairs down and follow the blue line."',3400)},
 {x:-36,z:-100,r:4.5,label:'Players-only door',fn:()=>{if(!WK.security){openDlg('ACCESS DENIED · Your accreditation must be verified at the main gate first.',[['Understood',closeDlg]])}else if(WK.access){say('Door open. Follow the corridor to the dressing room.',2200)}else{WK.access=true;openDlg('PLAYERS-ONLY ACCESS · Accreditation scanned by armed security. The corridor leads to the dressing room.',[['Enter',closeDlg]])}}},
 {x:5,z:-78,r:3.8,label:'Talk',fn:coachTalk},{x:7,z:-84,r:3.8,label:'Tactics',fn:openTactics},{x:11.5,z:-70,r:3.2,label:'Locker',fn:()=>say('Your locker. Number 10. Your boots and kit are ready.',2400)},
 ...RM.map(o=>({x:o.x,z:o.z,r:2.3,label:'Chat',fn:()=>say(o.name+': \"'+o.line+'\"',2800)}))];
function nearInt(){let best=null,bd=1e9;for(const it of INT){const d=Math.hypot(it.x-WK.x,it.z-WK.z);if(d<it.r&&d<bd){bd=d;best=it}}return best}
function drawMap(cv){const x=cv.getContext('2d'),W=cv.width,H=cv.height,X=z=>(z+330)/300*W,Y=q=>(q+95)/190*H;x.clearRect(0,0,W,H);x.fillStyle='#07111e';x.fillRect(0,0,W,H);
 const Z=(x0,x1,z0,z1,f,t)=>{x.fillStyle=f;x.fillRect(X(z0),Y(x0),X(z1)-X(z0),Y(x1)-Y(x0));if(t){x.fillStyle='#e8f4ff';x.font='bold 11px system-ui,sans-serif';x.textAlign='center';x.fillText(t,(X(z0)+X(z1))/2,(Y(x0)+Y(x1))/2+4)}};
 Z(-68,68,-320,-252,'#2b3a4a','ARRIVAL PLAZA');Z(-78,78,-248,-170,'#23505e','GRAND ATRIUM');Z(-78,78,-168,-140,'#2d3f6e','LEVEL 2');Z(-66,-54,-140,-96,'#35507a');Z(-66,3,-102.6,-97.4,'#1d3a6a');Z(-2.4,2.4,-98,-86,'#1d3a6a');Z(-13.2,13.2,-86,-63.4,'#2a7de1','');Z(-3.5,3.5,-63.4,-36.6,'#1d3a6a');Z(-55,55,-36,36,'#1f6a2e','PITCH');
 Z(52,62,-198,-168,'#42d8ad');x.strokeStyle='#42ffcc';x.lineWidth=2.5;x.setLineDash([6,4]);x.beginPath();ROUTE.forEach((p,i)=>i?x.lineTo(X(p[1]),Y(p[0])):x.moveTo(X(p[1]),Y(p[0])));x.stroke();x.setLineDash([]);
 x.fillStyle='#ff4d4d';x.beginPath();x.arc(X(-75),Y(0),9,0,7);x.fill();x.fillStyle='#fff';x.font='bold 11px system-ui,sans-serif';x.textAlign='center';x.fillText('DRESSING ROOM',X(-75),Y(0)-14);
 x.fillStyle='#ffd23f';x.beginPath();x.arc(X(WK.z),Y(WK.x),6+Math.sin(performance.now()/200)*1.5,0,7);x.fill();x.strokeStyle='#000';x.lineWidth=2;x.stroke();x.fillStyle='#fff';x.fillText('YOU',X(WK.z),Y(WK.x)-11)}
function openMap(){
 const overlay=$('mapoverlay');if(!overlay)return;overlay.style.display='flex';WK.busy=true;
 let cv=$('mapcv');if(!cv){cv=document.createElement('canvas');cv.id='mapcv';cv.width=620;cv.height=240;overlay.querySelector('.maproute').before(cv)}
 drawMap(cv);clearInterval(openMap.h);openMap.h=setInterval(()=>{if(overlay.style.display==='flex')drawMap(cv);else clearInterval(openMap.h)},120);
 const z=WK.z,stage=z<-252?1:z<-168?2:z<-140?3:(z<-86?4:(z<-63.4?5:6)),idx=[0,4,8,12,17,19],names=['Arrival plaza','Grand Atrium','Upper Concourse','Players corridor','Dressing room','Players tunnel'];
 overlay.querySelectorAll('.mapnode').forEach((n,i)=>{n.classList.toggle('current',i+1===stage);n.classList.toggle('done',i+1<stage);
  n.onclick=()=>{WK.ri=idx[i];closeMap();say('ROUTE BEACON SET · '+names[i]+' · follow the glowing column and the blue floor line.',3000)}});
 const note=overlay.querySelector('.mapnote');if(note)note.textContent='Red pin = dressing room. Dashed green = your route: gate → Grand Atrium → escalator (east) or lift (west) → Upper Concourse → west stairs → players corridor → accreditation door → dressing room → tunnel. Tap a place to move the route beacon.';
}
function closeMap(){const overlay=$('mapoverlay');if(overlay)overlay.style.display='none';WK.busy=false}
$('mapclose').addEventListener('pointerdown',e=>{e.preventDefault();closeMap()});
function walkObjective(){
 if(WK.kind==='half')return WK.z>-63?'Return through the tunnel to the pitch':'Find the manager in the dressing room';
 const rp=ROUTE[WK.ri],d=' · '+Math.round(Math.hypot(rp[0]-WK.x,rp[1]-WK.z))+' m to beacon',z=WK.z;
 if(WK.talked)return 'OBJECTIVE 6/6 · Follow the players’ tunnel to the pitch'+d;
 if(z<-253)return 'OBJECTIVE 1/6 · Walk through the supporters to the main entrance'+d;
 if(!WK.security)return 'OBJECTIVE 2/6 · Pass SECURITY at the gate';
 if(z<-168&&gy(WK.x,z)<1)return 'OBJECTIVE 2/6 · Cross the Grand Atrium · escalator (east) or lift (west) to Level 2'+d;
 if(z<-140)return 'OBJECTIVE 3/6 · Upper Concourse · head WEST to the PLAYERS ONLY stairs'+d;
 if(!WK.access)return 'OBJECTIVE 4/6 · Follow the blue line to the PLAYERS-ONLY door and show your accreditation'+d;
 if(z<-86)return 'OBJECTIVE 5/6 · Continue along the corridor to the dressing room'+d;
 return 'OBJECTIVE 5/6 · Speak to the manager in the dressing room'+d}
function showSecurityCheck(){if(WK.security){say('Accreditation verified. Follow the green signs to the players-only door.',2400);return}openDlg('FT90 SECURITY CHECKPOINT\n\nArmed security need to verify your player accreditation before you enter the stadium. Tap SHOW ACCREDITATION to continue.',[['Show accreditation',()=>{WK.security=true;closeDlg();say('✓ ACCREDITATION VERIFIED — enter the Grand Atrium, then head for the Upper Concourse.',3600)}],['Not yet',closeDlg]])}
function doInteract(){if(WK.busy||st.pause)return;const it=nearInt();if(it)it.fn()}
function startWalk(kind){mode='walk';tt=0;WK.kind=kind;WK.talked=false;WK.lock=false;WK.busy=false;WK.exiting=false;WK.security=false;WK.access=false;WK.vx=WK.vz=0;
HIDE.forEach(o=>o.visible=false);housing.visible=false;U.visible=true;mark.visible=false;showWalkUI(true);rs();
if(kind==='pre'){ext.visible=true;WK.x=-41;WK.z=-292;WK.a=Math.PI/2;WK.ri=0;P.forEach(p=>p.m.visible=false);RF.visible=false;ball.visible=false;say('Team bus arrived. Walk through the chanting supporters, pass security, cross the atrium and find the dressing room.',6500)}
else{const q=u||P[0];WK.x=cl(q.p.x,-50,50);WK.z=cl(q.p.y,-34,33);WK.a=-Math.PI/2;q.m.visible=false;say('Half time. Walk to the tunnel and into the dressing room',4500)}
cam.position.set(WK.x,8,kind==='pre'?WK.z-13:WK.z+13);walkCam(0,true)}
function walkCam(dt,snap){const z=WK.z,x=WK.x,gh=gy(x,z);let cx,cy,cz,lx,ly,lz;
 if(WK.kind==='pre'){
  if(z>-36){cx=x*.7;cy=7.4;cz=z+11;lx=x;ly=1;lz=z-3}
  else if(z>-140){cx=x;cy=gh+(gh>.3?6.6:7.6);cz=z-(z>-86?6.5:7);lx=x;ly=gh+.8;lz=z+3.5;if(z>-86){cy=9.5}}
  else{cx=x*.82;cy=gh+5.4;cz=z-10;lx=x*.9;ly=gh+1.8;lz=z+10;if(z>-247&&z<-200)cz=Math.max(cz,-247.4)}}
 else if(z>-36){cx=WK.x*.7;cy=7.4;cz=z+11;lx=WK.x;ly=1;lz=z-3}else{cx=WK.x*.5;cy=7.4;cz=z+9;lx=WK.x*.8;ly=.6;lz=z-2.5}
const k=snap?1:Math.min(1,dt*3.5);cx+=Math.sin(WK.camYaw)*10;cz+=Math.cos(WK.camYaw)*10;ly+=WK.camPitch*5;
cam.position.x=lerp(cam.position.x,cx,k);cam.position.y=lerp(cam.position.y,cy,k);cam.position.z=lerp(cam.position.z,cz,k);
WK.lk.x=lerp(snap?lx:WK.lk.x,lx+Math.sin(WK.camYaw)*12,k);WK.lk.y=lerp(snap?ly:WK.lk.y,ly,k);WK.lk.z=lerp(snap?lz:WK.lk.z,lz-Math.cos(WK.camYaw)*4,k);cam.lookAt(WK.lk)}
function exitWalk(){if(WK.exiting)return;WK.exiting=true;fade(1);setTimeout(()=>{U.visible=false;HIDE.forEach(o=>o.visible=true);housing.visible=true;showWalkUI(false);ball.visible=true;mark.visible=true;RF.visible=true;
if(WK.kind==='pre')startLineup();else kickoff();fade(0)},650)}
function walkTick(dt){const now=performance.now()/1000;
if(!WK.busy&&!st.pause){const sx=jx+(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),sf=-jy+(K.KeyW||K.ArrowUp?1:0)-(K.KeyS||K.ArrowDown?1:0),cd=cam.getWorldDirection(new T.Vector3()),cl2=Math.hypot(cd.x,cd.z)||1,fx=cd.x/cl2,fz=cd.z/cl2,ix=fx*sf-fz*sx,iz=fz*sf+fx*sx,m=Math.hypot(ix,iz),nx=m>1?ix/m:ix,nz=m>1?iz/m:iz,top=(Math.hypot(jx,jy)>.91||K.ShiftLeft)?6.4:4.4;
WK.vx=lerp(WK.vx,nx*top,Math.min(1,dt*9));WK.vz=lerp(WK.vz,nz*top,Math.min(1,dt*9))}else{WK.vx*=.8;WK.vz*=.8}
if(WK.target&&!WK.busy){
 const dx=WK.target.x-WK.x,dz=WK.target.z-WK.z,d=Math.hypot(dx,dz);
 if(d<2.2){WK.target=null;say('Waypoint reached.',1500)}
 else if(Math.hypot(jx,jy)<.12&&!K.KeyW&&!K.KeyA&&!K.KeyS&&!K.KeyD&&!K.ArrowUp&&!K.ArrowDown&&!K.ArrowLeft&&!K.ArrowRight){WK.vx=lerp(WK.vx,dx/d*2,Math.min(1,dt*1.4));WK.vz=lerp(WK.vz,dz/d*2,Math.min(1,dt*1.4))}
}
const ax=WK.x+WK.vx*dt,az=WK.z+WK.vz*dt;
// Stop at the checkpoint and open accreditation automatically so mobile users cannot miss the interaction prompt.
if(WK.kind==='pre'&&!WK.security&&Math.abs(WK.x)<27&&WK.z<=-252.6&&az>-252.6){WK.z=-252.6;WK.vz=0;showSecurityCheck()}
if(inside(ax,WK.z))WK.x=ax;else WK.vx=0;if(!WK.busy){if(inside(WK.x,az))WK.z=az;else WK.vz=0}else{WK.vx*=.5;WK.vz=0;}
if(WK.kind==='half'&&!WK.lock&&!WK.talked&&WK.z<-39)WK.lock=true;
if(WK.lock&&!WK.talked&&WK.z>-38.6&&WK.vz>.5&&performance.now()>WK.msg){say('The gaffer wants a word first.',2000);WK.msg=performance.now()+3000}
const v=Math.hypot(WK.vx,WK.vz);if(v>.4)WK.a=turnA(WK.a,Math.atan2(WK.vz,WK.vx),dt*12);WK.ph+=v*dt*1.6;
if(WK.kind==='pre'&&WK.x>=52&&WK.x<=62&&WK.z>=-198&&WK.z<-168.4)WK.z+=1.3*dt;U.position.set(WK.x,gy(WK.x,WK.z),WK.z);U.rotation.y=-WK.a;worldTick(now,dt);U.anim(v*1.25,WK.ph);
if(WK.kind==='half')P.forEach((p,i)=>{if(!p.m.visible)return;const tx=p.t?p.p.x:cl(p.p.x*.3,-6,6)+(i%5-2)*.8,tz=p.t?40:-37.6;walk(p,tx,tz,6.5,dt);if(p.t?p.p.y>36.8:p.p.y<-36.8)p.m.visible=false});
RM.forEach(o=>o.m.pose(o.pose,now));COACH.pose('talk',now);
const it=nearInt(),ia=$('ia');if(it&&!WK.busy&&!st.pause){if(ia.textContent!==it.label+' · TAP')ia.textContent=it.label+' · TAP';ia.style.display='flex'}else ia.style.display='none';const obj=$('walkobj');if(obj)obj.textContent=walkObjective();
if(!WK.exiting&&WK.z>-35.4&&(WK.kind!=='pre'||WK.talked))exitWalk();
mark.position.set(WK.x,4.2,WK.z);walkCam(dt,false)}
let last=performance.now();
function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;tt+=dt;sky.position.copy(cam.position);if(mode!=='walk')audioTick(dt);ca*=.985;crowdA.position.y=Math.max(0,Math.sin(n/230))*.25*(1+ca);crowdB.position.y=Math.max(0,Math.sin(n/230+2.1))*.25*(1+ca);
if(mode==='walk'){walkTick(dt);crowdPeople.forEach((o,i)=>{const t=n/1000+o.phase;o.m.pose(o.pose,t);if(o.pose==='wave'){o.m.J.arms[0].rotation.z=2.2+Math.sin(t*4)*.35;o.m.J.arms[1].rotation.z=2.2+Math.cos(t*4)*.35}else if(o.pose==='talk'){o.m.J.hd.rotation.y=Math.sin(t*1.7)*.13;o.m.J.arms[1].rotation.z=.65+Math.max(0,Math.sin(t*2+i))*.55}});worldPeople.forEach((o,i)=>{const t=n/1000+o.phase;o.m.pose(o.pose,t);if(o.pose==='talk'){o.m.J.hd.rotation.y=Math.sin(t*1.4)*.15;o.m.J.arms[0].rotation.z=.4+Math.max(0,Math.sin(t*1.8+i))*.45}});securityStaff.forEach((o,i)=>{const t=n/1000+i;o.m.J.hd.rotation.y=Math.sin(t*1.1)*.16;o.m.J.arms[1].rotation.z=.55+Math.max(0,Math.sin(t*1.7))*.45});R.render(S,cam)}
else if(mode==='lineup'){lineupTick(dt);if(tt>14.5){cap('Starting line-ups');shakeStart()}R.render(S,cam)}
else if(mode==='shake'){P.forEach(p=>walk(p,p.x0+(p.t?-4:4),p.t?1.3:-1.3,1.4,dt));if(tt>3.6)toKick();R.render(S,cam)}
else if(mode==='wait')R.render(S,cam);
else{if(!st.pause){if(st.freeze>0)st.freeze-=dt;else step(dt);refUpd(dt)}if(u)mark.position.set(u.p.x,4.2,u.p.y);pitchCrew.forEach(o=>o.m.pose(o.pose,n/1000+o.phase));bowlPeople.forEach(o=>{const t=n/1000+o.phase;o.m.pose(o.pose,t);if(o.pose==='talk'){o.m.J.hd.rotation.y=Math.sin(t*1.5)*.14;o.m.J.arms[0].rotation.z=.45+Math.max(0,Math.sin(t*2))*0.55}});dugoutPeople.forEach(o=>{const t=n/1000+o.phase;o.m.pose(o.pose,t);if(o.pose==='talk'){o.m.J.hd.rotation.y=Math.sin(t*1.5)*.12;o.m.J.arms[1].rotation.z=.7+Math.max(0,Math.sin(t*2))*0.4}});AR.forEach((r,i)=>{r.position.x=cl(ball.position.x*.78+(i===0?-5:5),-48,48);r.position.z=i===0?-38.2:38.2;r.anim(2,n/140)});ctx();drawRad();
const w=cam.aspect<1,b=ball.position;
if(cm===0){
 // FC25/eFootball-style broadcast: inside the bowl, above the near roof, slowly panning with the ball.
 const bx=cl(b.x*(w?.8:.5),-(w?46:30),w?46:30);camTrackX+=(bx-camTrackX)*Math.min(1,dt*1.6);
 cam.position.set(camTrackX,w?31:25,w?61:53);
 cam.lookAt(camTrackX*.9,0,w?3:5);
}else if(cm===2){
 const wx=cl(b.x*.25,-18,18);camTrackX+=(wx-camTrackX)*Math.min(1,dt*1.2);
 cam.position.set(camTrackX,w?38:33,w?68:60);
 cam.lookAt(camTrackX,0,2);
}else{
 const fx=u?u.p.x+cl(u.v.x*.22,-2,2):b.x,fz=u?u.p.y:b.z,k=Math.min(1,dt*1.05);
 cam.position.x+=(fx-cam.position.x)*k;cam.position.y+=(CM[1][0]-cam.position.y)*Math.min(1,dt*1.3);cam.position.z+=(fz+CM[1][1]-cam.position.z)*k;cam.lookAt(fx,0,fz);
}
R.render(S,cam)}
requestAnimationFrame(loop)}
rs();cam.position.set(0,34,92);cam.lookAt(0,0,0);reset();requestAnimationFrame(loop);

/* No text selection, copy menu or long-press highlight anywhere. */
['selectstart','contextmenu','dragstart'].forEach(t=>document.addEventListener(t,e=>e.preventDefault()));

document.addEventListener('selectionchange',()=>{const s=window.getSelection&&window.getSelection();if(s&&s.rangeCount)s.removeAllRanges()});
document.addEventListener('touchstart',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
