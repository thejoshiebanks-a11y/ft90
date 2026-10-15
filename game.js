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
[-1,1].forEach(sg=>(sg<0?[[-80,-4.5],[4.5,80]]:[[-80,80]]).forEach(([a0,a1])=>{bank('x',sg,a0,a1,0,7,.9,.85,1.05,42,0);bank('x',sg,a0,a1,10.55,7,9.3,.95,1.05,42,1);conc2('x',sg,a0,a1,42)}));
[-1,1].forEach(sg=>{bank('z',sg,-42,42,0,7,.9,.85,1.05,60,0);bank('z',sg,-42,42,10.55,7,9.3,.95,1.05,60,1);conc2('z',sg,-42,42,60)});
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
[-1,1].forEach(sg=>{const r=new T.Mesh(new T.BoxGeometry(172,.6,15),roofM);r.position.set(0,21,sg*(42+14));S.add(r);
const e=new T.Mesh(new T.BoxGeometry(172,.35,.5),lampM);e.position.set(0,20.6,sg*(42+6.6));S.add(e);
const e2=new T.Mesh(new T.BoxGeometry(15,.6,86),roofM);e2.position.set(sg*(60+14),21,0);S.add(e2);
const e3=new T.Mesh(new T.BoxGeometry(.5,.35,86),lampM);e3.position.set(sg*(60+6.6),20.6,0);S.add(e3);
for(let x=-80;x<=80;x+=20){const c=new T.Mesh(new T.CylinderGeometry(.45,.45,21,6),steel);c.position.set(x,10.5,sg*63.5);S.add(c)}
for(let z=-40;z<=40;z+=20){const c=new T.Mesh(new T.CylinderGeometry(.45,.45,21,6),steel);c.position.set(sg*81.5,10.5,z);S.add(c)}});
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
bxm(27.6,4.9,.6,0,2.45,-86.2,bm(0xd9dde3));[-1,1].forEach(sd=>HIDE.push(bxm(10,4.9,.6,sd*8.75,2.45,-63.4,bm(0xd9dde3))));
HIDE.push(bxm(27.6,.3,RD+.6,0,5,RC,bm(0x20242e)));[-8,0,8].forEach(x=>HIDE.push(bxm(.7,.08,18,x,4.82,RC,bm(0xffffff))));
[-1,1].forEach(sd=>bxm(.14,.14,RD,sd*13,.12,RC,bm(sd<0?0x2a7de1:0xff3b3b)));
const wallTex=tex(1024,180,(g)=>{g.fillStyle='#e6e9ee';g.fillRect(0,0,1024,180);for(let i=0;i<22;i++)for(let j=0;j<4;j++){const x=i*48,y=j*48-6;g.fillStyle=(i+j)%2?'#cfd4dc':'#f7f8fa';g.beginPath();g.moveTo(x,y+24);g.lineTo(x+24,y);g.lineTo(x+48,y+24);g.lineTo(x+24,y+48);g.fill()}
g.fillStyle='#0b1b3a';g.fillRect(0,168,1024,12)});
const wallP=new T.Mesh(new T.PlaneGeometry(27,4.6),new T.MeshBasicMaterial({map:wallTex}));wallP.position.set(0,2.4,-85.85);room.add(wallP);
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
const COACH=mk(0x15171c,S,{shorts:0x15171c,sock:0x15171c,skin:1,hair:4,hs:2,boot:0x333333});COACH.position.set(0,0,-82);COACH.rotation.y=-Math.PI/2;
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
pad.addEventListener('pointerdown',e=>{pad.setPointerCapture(e.pointerId);pm(e)});pad.addEventListener('pointermove',e=>{if(pad.hasPointerCapture(e.pointerId))pm(e)});
const up=()=>{jx=jy=0;kn.style.transform=''};pad.addEventListener('pointerup',up);pad.addEventListener('pointercancel',up);
$('sh').addEventListener('pointerdown',()=>act(1));$('ps').addEventListener('pointerdown',()=>act(0));$('th').addEventListener('pointerdown',()=>act((sim.owner>=0&&sim.p[sim.owner].t===0)?4:5));$('lb').addEventListener('pointerdown',()=>act((sim.owner>=0&&sim.p[sim.owner].t===0)?2:6));
$('ia').addEventListener('pointerdown',e=>{e.preventDefault();doInteract()});$('mapbtn').addEventListener('pointerdown',e=>{e.preventDefault();if(mode==='walk'&&!WK.busy)openMap();else if(mode==='walk'&&$('mapoverlay').style.display==='flex')closeMap()});
addEventListener('keydown',e=>{K[e.code]=1;if(mode==='walk'){if(e.code==='KeyE'||e.code==='Enter')doInteract();return}if(e.code==='Space')act(1);if(e.code==='KeyE')act(0);if(e.code==='KeyQ')act(2);if(e.code==='KeyR')act(4);if(e.code==='KeyF')act(3)});addEventListener('keyup',e=>K[e.code]=0);
function upd(){$('sc').textContent=st.sc[0]+' - '+st.sc[1];$('tm').textContent=Math.min(90,Math.floor(st.min))+"'"}
function goal(t){ca=3;st.sc[t]++;st.run=false;owner=null;banner('Goal! '+(t?'City':'United'));upd();setTimeout(()=>{banner('');reset();st.run=true},2000)}
function halftime(){st.half=2;ui(false);startWalk('half')}
function fulltime(){const s=sim.st;$('fr').textContent='UTD '+st.sc[0]+' - '+st.sc[1]+' CITY';$('fs').innerHTML=`Shots ${s.shots[0]} - ${s.shots[1]}<br>Fouls ${s.fouls[0]} - ${s.fouls[1]}<br>Yellow cards ${s.yellows[0]} - ${s.yellows[1]} &nbsp; Red cards ${s.reds[0]} - ${s.reds[1]}<br>Offsides ${s.offsides[0]} - ${s.offsides[1]}`;$('ft').classList.add('on');ui(false)}
function begin(){st.sc=[0,0];st.min=0;st.half=1;st.pause=false;st.freeze=0;st.m={sp:1,pw:1,op:1};sim.mood=st.m;sim.stam=1;
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
function kickoff(){mode='play';cap('');ext.visible=false;rs();cam.position.set(0,34,92);cam.lookAt(0,0,0);reset();RF.position.set(0,0,12);st.run=true;ui(true)}
function startLineup(){mode='lineup';tt=0;rs();cam.fov=45;cam.updateProjectionMatrix();cam.position.set(0,10.5,49);cam.lookAt(0,1,-20);ball.position.set(0,.45,0);bv.set(0,0,0);owner=null;
P.forEach((p,i)=>{p.m.visible=true;const n=i%Sim.N;p.x0=-15+(n*3);setP(p,cl((n-5)*.85,-5,5),-42.2+(p.t?2.2:0),Math.PI/2)});RF.position.set(-2,0,-27.1);RF.rotation.y=-Math.PI/2;RF.anim(0,0);ball.position.set(0,.22,-27.1);cap('Teams line up · officials, captains and match ball')}
function shakeStart(){mode='shake';tt=0;cap('Captains and officials · pre-match handshakes');P.forEach(p=>setP(p,p.x0,p.t?1.3:-1.3,Math.PI/2));cam.position.set(0,10,39);cam.lookAt(0,1,0)}
function toKick(){mode='wait';cap('');fade(1);setTimeout(()=>{kickoff();fade(0)},600)}
/* ---------- walkable tunnel + dressing room ---------- */
const WK={x:0,z:0,a:0,vx:0,vz:0,ph:0,kind:'pre',talked:false,lock:false,busy:false,exiting:false,msg:0,lk:new T.Vector3()};
function inside(x,z){
 // Collision volumes for the coach, crowd-control rails, concession counters and lift cores.
 const blocks=[[-28,-126,9.2,3.0],[-12,-113,1.0,13.2],[12,-113,1.0,13.2],[-17,-94,2.8,2.0],[-17,-78,2.8,2.0],[-17,-62,2.8,2.0],[17,-94,2.8,2.0],[17,-78,2.8,2.0],[17,-62,2.8,2.0],[-20,-48,2.1,2.1],[20,-48,2.1,2.1]];
 if(blocks.some(([bx,bz,rx,rz])=>Math.abs(x-bx)<rx&&Math.abs(z-bz)<rz))return false;
 // Connected walkable network: arrival plaza -> public concourse -> dressing-room branch -> players' tunnel -> pitch.
 if(!WK.lock&&x>-55&&x<55&&z>-36.8&&z<35.5)return true;
 if(WK.kind==='pre'&&z<=-94&&z>-151&&x>-52&&x<52)return true;
 if(Math.abs(x)<21.8&&z<=-94&&z>-63.4)return true;
 if(Math.abs(x)<12.5&&z<=-85.2&&z>-63.4)return true;
 if(Math.abs(x)<3.25&&z<=-36.6&&z>-63.4)return true;
 // Half-time uses the same interior circulation, but starts from the pitch side.
 if(WK.kind==='half'&&Math.abs(x)<21.8&&z<=-36.6&&z>-110)return true;
 return false
}
function openDlg(txt,ch){$('dtx').textContent=txt;const c=$('dch');c.innerHTML='';ch.forEach(([l,fn])=>{const b=document.createElement('button');b.textContent=l;b.onclick=fn;c.appendChild(b)});$('dlg').style.display='flex';WK.busy=true}
function closeDlg(){$('dlg').style.display='none';WK.busy=false}
function coachTalk(){if(WK.kind==='pre'&&!WK.security){openDlg('The team liaison stops you at the dressing-room entrance. Please pass the accreditation checkpoint on the public concourse first.',[['Understood',closeDlg]]);return}if(WK.talked){openDlg('Gaffer: "Go on then. Out you go."',[['Okay',closeDlg]]);return}
const q=WK.kind==='pre'?'Gaffer: "Big night, lad. How do you want us to play it?"':'Gaffer: "Talk to me. What do we need for the second half?"';
const choose=m=>{st.m[m]=m==='op'?.92:m==='sp'?1.08:1.18;WK.talked=true;WK.lock=false;openDlg('Gaffer: "Right. Go out there and show them."',[["Let's go",()=>{closeDlg();say(WK.kind==='pre'?'Head out through the tunnel':'Head back out to the pitch',2800)}]])};
openDlg(q,[['Motivate',()=>choose('sp')],['Demand more',()=>choose('pw')],['Stay calm',()=>choose('op')]])}
function openTactics(){st.pause=true;$('pm').classList.add('on')}
const INT=[
 {x:0,z:-112,r:4.5,label:'Security check',fn:()=>openDlg('SECURITY CHECKPOINT  •  A steward checks your accreditation and points you toward the players’ entrance. Public concourse access ends beyond the marked doors.',[['Show accreditation',()=>{WK.security=true;closeDlg();say('Accreditation checked. Follow the green route to PLAYERS / DRESSING ROOMS.',3200)}]])},
 {x:0,z:-102,r:4.2,label:'Stadium map',fn:()=>openMap()},
 {x:-17,z:-94,r:3.8,label:'Food counter',fn:()=>openDlg('MATCHDAY CONCESSIONS  •  The seller is serving supporters. Grab a quick drink or snack before heading toward the players’ entrance.',[['Buy water · £2',()=>{closeDlg();say('Water purchased. The seller nods and passes it over.',2300)}],['Not now',closeDlg]])},
 {x:17,z:-78,r:3.8,label:'Merchandise',fn:()=>openDlg('OFFICIAL FT90 STORE  •  Scarves, shirts and matchday souvenirs are on display. A family is browsing beside you.',[['Buy a scarf · £12',()=>{closeDlg();say('FT90 scarf added to your matchday bag.',2200)}],['Keep moving',closeDlg]])},
 {x:0,z:-67,r:3.4,label:'Players-only door',fn:()=>{if(!WK.security){openDlg('ACCESS DENIED  •  Your accreditation must be checked at the security checkpoint on the public concourse first.',[['Understood',closeDlg]])}else{WK.access=true;openDlg('PLAYERS-ONLY ACCESS  •  Your accreditation is scanned. Beyond this door are the team corridor, dressing room and tunnel. Follow the blue signs.',[['Enter',closeDlg]])}}},
 {x:0,z:-80,r:3.8,label:'Talk',fn:coachTalk},{x:7,z:-84,r:3.8,label:'Tactics',fn:openTactics},{x:11.5,z:-70,r:3.2,label:'Locker',fn:()=>say('Your locker. Number 10. Your boots and kit are ready.',2400)},
 ...RM.map(o=>({x:o.x,z:o.z,r:2.3,label:'Chat',fn:()=>say(o.name+': "'+o.line+'"',2800)}))];
function nearInt(){let best=null,bd=1e9;for(const it of INT){const d=Math.hypot(it.x-WK.x,it.z-WK.z);if(d<it.r&&d<bd){bd=d;best=it}}return best}
function openMap(){const overlay=$('mapoverlay');if(overlay){overlay.style.display='flex';WK.busy=true;const stage=WK.z<-115?1:WK.z<-94?2:WK.z<-63?3:4;overlay.querySelectorAll('.mapnode').forEach((n,i)=>{n.classList.toggle('current',i+1===stage);n.classList.toggle('done',i+1<stage)});}}
function closeMap(){const overlay=$('mapoverlay');if(overlay)overlay.style.display='none';WK.busy=false}
$('mapclose').addEventListener('pointerdown',e=>{e.preventDefault();closeMap()});
function walkObjective(){if(WK.kind==='half')return WK.z>-63?'Return through the tunnel to the pitch':'Find the manager in the dressing room';if(WK.z<-115)return 'OBJECTIVE 1/4 · Walk from the team bus through the supporter arrival plaza';if(WK.z<-94)return 'OBJECTIVE 2/4 · Pass security and enter the main concourse';if(WK.z<-63)return WK.talked?'OBJECTIVE 4/4 · Follow the players’ tunnel to the pitch':'OBJECTIVE 3/4 · Find the dressing room and speak to the manager';return 'OBJECTIVE · Head out to the pitch for the team walkout'}
function doInteract(){if(WK.busy||st.pause)return;const it=nearInt();if(it)it.fn()}
function startWalk(kind){mode='walk';tt=0;WK.kind=kind;WK.talked=false;WK.lock=false;WK.busy=false;WK.exiting=false;WK.security=false;WK.access=false;WK.vx=WK.vz=0;
HIDE.forEach(o=>o.visible=false);housing.visible=false;U.visible=true;mark.visible=false;showWalkUI(true);rs();
if(kind==='pre'){ext.visible=true;WK.x=-39;WK.z=-130;WK.a=Math.PI/2;P.forEach(p=>p.m.visible=false);RF.visible=false;ball.visible=false;say('Team bus arrived. Walk past the supporters, enter the stadium and speak to the manager before the teams are called for the walkout.',6000)}
else{const q=u||P[0];WK.x=cl(q.p.x,-50,50);WK.z=cl(q.p.y,-34,33);WK.a=-Math.PI/2;q.m.visible=false;say('Half time. Walk to the tunnel and into the dressing room',4500)}
cam.position.set(WK.x*.7,9,WK.z+13);walkCam(0,true)}
function walkCam(dt,snap){const z=WK.z;let cx,cy,cz,lx,ly,lz;if(WK.kind==='pre'&&z<-91){cx=WK.x*.72;cy=5.4;cz=z-10;lx=WK.x*.7;ly=1.8;lz=z+10}else if(z>-36){cx=WK.x*.7;cy=7.4;cz=z+11;lx=WK.x;ly=1;lz=z-3}else{cx=WK.x*.5;cy=7.4;cz=z+9;lx=WK.x*.8;ly=.6;lz=z-2.5}
const k=snap?1:Math.min(1,dt*3.5);cam.position.x=lerp(cam.position.x,cx,k);cam.position.y=lerp(cam.position.y,cy,k);cam.position.z=lerp(cam.position.z,cz,k);
WK.lk.x=lerp(snap?lx:WK.lk.x,lx,k);WK.lk.y=lerp(snap?ly:WK.lk.y,ly,k);WK.lk.z=lerp(snap?lz:WK.lk.z,lz,k);cam.lookAt(WK.lk)}
function exitWalk(){if(WK.exiting)return;WK.exiting=true;fade(1);setTimeout(()=>{U.visible=false;HIDE.forEach(o=>o.visible=true);housing.visible=true;showWalkUI(false);ball.visible=true;mark.visible=true;RF.visible=true;
if(WK.kind==='pre')startLineup();else kickoff();fade(0)},650)}
function walkTick(dt){const now=performance.now()/1000;
if(!WK.busy&&!st.pause){const ix=jx+(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),iz=-jy+(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0),m=Math.hypot(ix,iz),nx=m>1?ix/m:ix,nz=m>1?iz/m:iz,top=(Math.hypot(jx,jy)>.91||K.ShiftLeft)?6.4:4.4;
WK.vx=lerp(WK.vx,nx*top,Math.min(1,dt*9));WK.vz=lerp(WK.vz,nz*top,Math.min(1,dt*9))}else{WK.vx*=.8;WK.vz*=.8}
const ax=WK.x+WK.vx*dt,az=WK.z+WK.vz*dt;if(inside(ax,WK.z))WK.x=ax;else WK.vx=0;if(inside(WK.x,az))WK.z=az;else WK.vz=0;
if(WK.kind==='half'&&!WK.lock&&!WK.talked&&WK.z<-39)WK.lock=true;
if(WK.lock&&!WK.talked&&WK.z>-38.6&&WK.vz>.5&&performance.now()>WK.msg){say('The gaffer wants a word first.',2000);WK.msg=performance.now()+3000}
const v=Math.hypot(WK.vx,WK.vz);if(v>.4)WK.a=turnA(WK.a,Math.atan2(WK.vz,WK.vx),dt*12);WK.ph+=v*dt*1.6;
U.position.set(WK.x,0,WK.z);U.rotation.y=-WK.a;U.anim(v*1.25,WK.ph);
if(WK.kind==='half')P.forEach((p,i)=>{if(!p.m.visible)return;const tx=p.t?p.p.x:cl(p.p.x*.3,-6,6)+(i%5-2)*.8,tz=p.t?40:-37.6;walk(p,tx,tz,6.5,dt);if(p.t?p.p.y>36.8:p.p.y<-36.8)p.m.visible=false});
RM.forEach(o=>o.m.pose(o.pose,now));COACH.pose('talk',now);
const it=nearInt(),ia=$('ia');if(it&&!WK.busy&&!st.pause){if(ia.textContent!==it.label+' · TAP')ia.textContent=it.label+' · TAP';ia.style.display='flex'}else ia.style.display='none';const obj=$('walkobj');if(obj)obj.textContent=walkObjective();
if(!WK.exiting&&WK.z>-35.4&&(WK.kind!=='pre'||WK.talked))exitWalk();
mark.position.set(WK.x,4.2,WK.z);walkCam(dt,false)}
let last=performance.now();
function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;tt+=dt;ca*=.985;crowdA.position.y=Math.max(0,Math.sin(n/230))*.25*(1+ca);crowdB.position.y=Math.max(0,Math.sin(n/230+2.1))*.25*(1+ca);
if(mode==='walk'){walkTick(dt);crowdPeople.forEach((o,i)=>{const t=n/1000+o.phase;o.m.pose(o.pose,t);if(o.pose==='wave'){o.m.J.arms[0].rotation.z=2.2+Math.sin(t*4)*.35;o.m.J.arms[1].rotation.z=2.2+Math.cos(t*4)*.35}else if(o.pose==='talk'){o.m.J.hd.rotation.y=Math.sin(t*1.7)*.13;o.m.J.arms[1].rotation.z=.65+Math.max(0,Math.sin(t*2+i))*.55}});worldPeople.forEach((o,i)=>{const t=n/1000+o.phase;o.m.pose(o.pose,t);if(o.pose==='talk'){o.m.J.hd.rotation.y=Math.sin(t*1.4)*.15;o.m.J.arms[0].rotation.z=.4+Math.max(0,Math.sin(t*1.8+i))*.45}});R.render(S,cam)}
else if(mode==='lineup'){P.forEach(p=>walk(p,p.x0,p.t?-29.8:-33.0,3.2,dt));if(tt>7){cap('Starting line-ups');shakeStart()}cam.position.x=lerp(cam.position.x,0,Math.min(1,dt*1.2));cam.position.y=lerp(cam.position.y,10.5,Math.min(1,dt*1.2));cam.position.z=lerp(cam.position.z,49,Math.min(1,dt*1.2));cam.lookAt(0,1,-20);R.render(S,cam)}
else if(mode==='shake'){P.forEach(p=>walk(p,p.x0+(p.t?-4:4),p.t?1.3:-1.3,1.4,dt));if(tt>3.6)toKick();R.render(S,cam)}
else if(mode==='wait')R.render(S,cam);
else{if(!st.pause){if(st.freeze>0)st.freeze-=dt;else step(dt);refUpd(dt)}if(u)mark.position.set(u.p.x,4.2,u.p.y);pitchCrew.forEach(o=>o.m.pose(o.pose,n/1000+o.phase));bowlPeople.forEach(o=>{const t=n/1000+o.phase;o.m.pose(o.pose,t);if(o.pose==='talk'){o.m.J.hd.rotation.y=Math.sin(t*1.5)*.14;o.m.J.arms[0].rotation.z=.45+Math.max(0,Math.sin(t*2))*0.55}});dugoutPeople.forEach(o=>{const t=n/1000+o.phase;o.m.pose(o.pose,t);if(o.pose==='talk'){o.m.J.hd.rotation.y=Math.sin(t*1.5)*.12;o.m.J.arms[1].rotation.z=.7+Math.max(0,Math.sin(t*2))*0.4}});AR.forEach((r,i)=>{r.position.x=cl(ball.position.x*.78+(i===0?-5:5),-48,48);r.position.z=i===0?-38.2:38.2;r.anim(2,n/140)});ctx();drawRad();
const w=cam.aspect<1,b=ball.position;
if(cm===0){
 // Broadcast is deliberately locked to the sideline: passing and possession changes never move the camera.
 cam.position.set(0,w?31:27,w?83:76);
 cam.lookAt(0,0,0);
}else if(cm===2){
 // Wide tactical is also fixed; only its static framing differs from broadcast.
 cam.position.set(0,w?34:31,w?88:81);
 cam.lookAt(0,0,0);
}else{
 const fx=u?u.p.x+cl(u.v.x*.22,-2,2):b.x,fz=u?u.p.y:b.z,k=Math.min(1,dt*1.05);
 cam.position.x+=(fx-cam.position.x)*k;cam.position.y+=(CM[1][0]-cam.position.y)*Math.min(1,dt*1.3);cam.position.z+=(fz+CM[1][1]-cam.position.z)*k;cam.lookAt(fx,0,fz);
}
R.render(S,cam)}
requestAnimationFrame(loop)}
rs();cam.position.set(0,34,92);cam.lookAt(0,0,0);reset();requestAnimationFrame(loop);
