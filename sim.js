(function(root){
'use strict';
const GW=3.65,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),hyp=Math.hypot;
const N=11,DEF=[[-30,-20],[-32,-7],[-32,7],[-30,20]];
const FORM={
'4-3-3':[[-46,0],...DEF,[-10,-12],[-12,0],[-10,12],[14,-18],[18,0],[14,18]],
'4-4-2':[[-46,0],...DEF,[-10,-22],[-12,-7],[-12,7],[-10,22],[14,-8],[14,8]],
'4-2-3-1':[[-46,0],...DEF,[-14,-8],[-14,8],[0,-18],[2,0],[0,18],[16,0]],
'3-5-2':[[-46,0],[-30,-12],[-32,0],[-30,12],[-14,-24],[-12,-10],[-8,0],[-12,10],[-14,24],[14,-8],[14,8]]};
function setFormation(S,t,name){const f=FORM[name];S.p.filter(p=>p.t===t).forEach((p,i)=>{p.hx=f[i][0]*(t?-1:1);p.hz=f[i][1]})}
function turn(a,b,m){const d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;return a+cl(d,-m,m)}
function create(o){
const S={roll:.5,thru:null,lastT:-1,rcv:-1,time:0,p:[],ball:{x:0,y:.45,z:0,vx:0,vy:0,vz:0},owner:-1,user:-1,ev:[],diff:(o&&o.diff)||.88,mood:{sp:1,pw:1,op:1},stam:1,rng:Math.random,botUser:false,inp:{ix:0,iz:0,sprint:false},st:{goals:[0,0],shots:[0,0],passes:[0,0],poss:[0,0],saves:0,tackles:0}};
for(let t=0;t<2;t++)for(let i=0;i<N;i++)S.p.push({id:t*N+i,t,gk:i===0,hx:0,hz:0,x:0,z:0,vx:0,vz:0,a:t?Math.PI:0,cd:0,imm:0,hold:0,dv:0,dd:1,lunge:0,kt:-9});
setFormation(S,0,'4-3-3');setFormation(S,1,'4-4-2');reset(S);return S}
function reset(S){S.p.forEach(p=>{p.x=p.hx;p.z=p.hz;p.vx=p.vz=0;p.a=p.t?Math.PI:0;p.cd=p.imm=p.lunge=p.dv=p.hold=0});
const b=S.ball;b.x=0;b.y=.45;b.z=0;b.vx=b.vy=b.vz=0;S.owner=-1;S.user=pickUser(S,true)}
function pickUser(S,force){const b=S.ball,P=S.p;if(S.owner>=0&&P[S.owner].t===0&&!P[S.owner].gk)return S.owner;
let best=-1,bd=1e9;for(const p of P){if(p.t||p.gk)continue;const d=hyp(p.x-b.x,p.z-b.z);if(d<bd){bd=d;best=p.id}}
if(!force&&S.user>=0&&!P[S.user].gk&&P[S.user].t===0&&hyp(P[S.user].x-b.x,P[S.user].z-b.z)<bd+3)return S.user;return best}
function chasers(S,t){const b=S.ball,ex=(t===0&&!S.botUser)?S.user:-1,dir=t?-1:1;
const l=S.p.filter(p=>p.t===t&&!p.gk&&p.id!==ex).map(p=>[hyp(p.x-b.x,p.z-b.z),p]).sort((a,c)=>a[0]-c[0]);
const r=[];if(l[0])r.push(l[0][1]);if(l[1]&&l[1][0]<12&&b.x*dir<-10)r.push(l[1][1]);return r}
function nearOpp(S,p){let o=null,d=1e9;for(const q of S.p){if(q.t===p.t||q.gk)continue;const e=hyp(q.x-p.x,q.z-p.z);if(e<d){d=e;o=q}}return{o,d}}
function openness(S,q){let m=99;for(const o of S.p)if(o.t!==q.t){const d=hyp(o.x-q.x,o.z-q.z);if(d<m)m=d}return m}
function blocked(S,p,tx,tz){const ax=tx-p.x,az=tz-p.z,l2=ax*ax+az*az||1;for(const o of S.p){if(o.t===p.t)continue;
const t=cl(((o.x-p.x)*ax+(o.z-p.z)*az)/l2,0,1);if(hyp(p.x+ax*t-o.x,p.z+az*t-o.z)<1.6)return true}return false}
function kick(S,p,dx,dz,sp,vy){const l=hyp(dx,dz)||1,b=S.ball;b.vx=dx/l*sp;b.vz=dz/l*sp;b.vy=vy;S.owner=-1;p.cd=.45;p.hold=0;p.kt=S.time;S.lastT=p.t;S.rcv=-1;S.roll=S.rng()}
function shoot(S,p,user){const dir=p.t?-1:1,gk=S.p.find(q=>q.gk&&q.t!==p.t),inp=S.inp;
let tz=gk.z>0?-2.6:2.6;if(Math.abs(p.z)>9)tz=-Math.sign(p.z)*2.4;
let dx=dir*50-p.x,dz=tz-p.z;
if(user){const m=hyp(inp.ix,inp.iz),l=hyp(dx,dz);if(m>.3){if((inp.ix*dx+inp.iz*dz)/(l*m)<.55){dx=inp.ix;dz=inp.iz}}
else if((Math.cos(p.a)*dx+Math.sin(p.a)*dz)/l<.5){dx=Math.cos(p.a);dz=Math.sin(p.a)}}
else{const e=(S.rng()-.5)*.3*(1.5-(p.t?S.diff:1)),c=Math.cos(e),s=Math.sin(e);const x=dx*c-dz*s;dz=dx*s+dz*c;dx=x}
kick(S,p,dx,dz,(user?26*S.mood.pw:23+S.rng()*4),1.5+S.rng()*3);S.st.shots[p.t]++}
function passTo(S,p,q,user){const d0=hyp(q.x-p.x,q.z-p.z);let tx=q.x+q.vx*Math.min(.6,d0/25),tz=q.z+q.vz*Math.min(.6,d0/25);
let dx=tx-p.x,dz=tz-p.z;if(!user){const e=(S.rng()-.5)*.25*(1.4-(p.t?S.diff:1)),c=Math.cos(e),s=Math.sin(e),x=dx*c-dz*s;dz=dx*s+dz*c;dx=x}
kick(S,p,dx,dz,cl(hyp(dx,dz)*1.15+6,10,25),0);S.rcv=q.id;S.st.passes[p.t]++}
function userPass(S,p){const inp=S.inp,m=hyp(inp.ix,inp.iz),fx=m>.3?inp.ix/m:Math.cos(p.a),fz=m>.3?inp.iz/m:Math.sin(p.a);
let best=null,bs=-9;for(const q of S.p){if(q===p||q.t!==p.t||q.gk)continue;const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<2.5)continue;
const c=(dx*fx+dz*fz)/d,sc=c-d*.01-(blocked(S,p,q.x,q.z)?.4:0);if(c>.4&&sc>bs){bs=sc;best=q}}
if(best)passTo(S,p,best,true);else{kick(S,p,fx,fz,15,0);S.st.passes[p.t]++}}
function throughTo(S,p,q,user){const dir=p.t?-1:1,tx=cl(q.x+dir*11,-46,46),tz=cl(q.z*.8,-26,26);let dx=tx-p.x,dz=tz-p.z;
if(!user){const e=(S.rng()-.5)*.2*(1.4-(p.t?S.diff:1)),c=Math.cos(e),sn=Math.sin(e),x=dx*c-dz*sn;dz=dx*sn+dz*c;dx=x}
kick(S,p,dx,dz,cl(hyp(dx,dz)*1.15+6,12,26),0);S.rcv=q.id;S.thru={x:tx,z:tz,t:S.time+1.8,id:q.id};S.st.passes[p.t]++}
function userThrough(S,p){const inp=S.inp,m=hyp(inp.ix,inp.iz),dir=p.t?-1:1,fx=m>.3?inp.ix/m:dir,fz=m>.3?inp.iz/m:0;let best=null,bs=-9;
for(const q of S.p){if(q===p||q.t!==p.t||q.gk)continue;const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<6)continue;const c=(dx*fx+dz*fz)/d,sc=c+(q.x-p.x)*dir*.02;if(c>.3&&sc>bs){bs=sc;best=q}}
if(best)throughTo(S,p,best,true);else userPass(S,p)}
function lobTo(S,p,tx,tz){const dx=tx-p.x,dz=tz-p.z;kick(S,p,dx,dz,Math.min(32,hyp(dx,dz)/.96),12);S.st.passes[p.t]++}
function lob(S,p,user){const dir=p.t?-1:1;
if(Math.abs(p.z)>16&&p.x*dir>24){lobTo(S,p,dir*43,(S.rng()-.5)*6);return}
let fx=Math.cos(p.a),fz=Math.sin(p.a);if(user){const m=hyp(S.inp.ix,S.inp.iz);if(m>.3){fx=S.inp.ix/m;fz=S.inp.iz/m}}
let best=null,bs=-9;for(const q of S.p){if(q===p||q.t!==p.t||q.gk)continue;const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<14)continue;const sc=(dx*fx+dz*fz)/d;if(sc>bs){bs=sc;best=q}}
if(best)lobTo(S,p,best.x+best.vx*.8,best.z+best.vz*.8);else lobTo(S,p,p.x+fx*30,p.z+fz*30)}
function bestPass(S,p){const dir=p.t?-1:1;let best=null,bs=-99;for(const q of S.p){if(q===p||q.t!==p.t||q.gk)continue;
const d=hyp(q.x-p.x,q.z-p.z);if(d<4||d>32)continue;let sc=(q.x-p.x)*dir*.08+Math.min(openness(S,q),9)*.3-d*.03;if(blocked(S,p,q.x,q.z))sc-=9;if(sc>bs){bs=sc;best=q}}
return{q:best,sc:bs}}
function decide(S,p,dt){const dir=p.t?-1:1,gd=Math.abs(dir*50-p.x),df=p.t?S.diff:1,near=nearOpp(S,p);p.hold+=dt;
if(p.gk){if(p.hold>.7){const b=bestPass(S,p);if(b.q)passTo(S,p,b.q,false);else lobTo(S,p,p.x+dir*25,0)}return}
if(gd<31&&p.hold>.1+(1-df)*.5&&(gd<21||!blocked(S,p,dir*50,0)||near.d<4.5)){shoot(S,p,false);return}
if(Math.abs(p.z)>16&&gd<28&&p.hold>.4+(1-df)*.5){lob(S,p,false);return}
if(p.hold>.5&&S.rng()<dt*1.6){let r=null,rs=0;for(const q of S.p){if(q===p||q.t!==p.t||q.gk)continue;const fw=(q.x-p.x)*dir;if(fw<9||fw>34)continue;const o=openness(S,q);if(o<5||blocked(S,p,q.x+dir*8,q.z))continue;const sc=fw*.1+o*.3;if(sc>rs){rs=sc;r=q}}
if(r){throughTo(S,p,r,false);return}}
const b=bestPass(S,p);if(b.q&&((near.d<4.2&&b.sc>-1)||(p.hold>1.3&&b.sc>.2)||p.hold>2.5))passTo(S,p,b.q,false)}
function aiMove(S,p,ch,own){const dir=p.t?-1:1,b=S.ball,mine=own?own.t===p.t:(S.lastT===p.t&&S.rcv>=0);
let tx=p.hx,tz=p.hz,spd=7.2*(p.t?S.diff*S.mood.op:1);
if(p.gk){const gs=p.t?1:-1;tx=gs*46;tz=cl(b.z*.3,-5,5);spd=6.5;
if(!own&&b.vx*gs>8&&Math.abs(b.x-gs*50)<26){const pz=b.z+b.vz*(gs*50-b.x)/b.vx+(p.dv<=0?(S.rng()-.5)*2.4*(1.45-(p.t?S.diff:1)):0);tz=cl(pz,-4.5,4.5);tx=gs*47;
if(Math.abs(pz-p.z)>1&&p.dv<=0){p.dv=.7;p.dd=Math.sign(pz-p.z)||1}}
else if(!own&&Math.abs(b.x-gs*50)<14&&Math.abs(b.z)<10&&hyp(b.vx,b.vz)<9&&hyp(p.x-b.x,p.z-b.z)<10){tx=b.x;tz=b.z;spd=8}
if(p.dv>0)spd=13;return[tx,tz,spd]}
if(own===p){tx=dir*50;tz=0;const o=nearOpp(S,p);if(o.o&&o.d<7&&(o.o.x-p.x)*dir>-1){tz=cl(p.z+(Math.sign(p.z-o.o.z)||1)*6,-28,28);tx=p.x+dir*10}spd*=.95}
else if(!mine){
if(S.thru&&S.time<S.thru.t&&p.id===S.thru.id){tx=S.thru.x;tz=S.thru.z;spd*=1.22}
else if(ch[p.t].includes(p)||p.id===S.rcv){tx=b.x+b.vx*.3;tz=b.z+b.vz*.3;spd*=1.1;if(own&&hyp(own.x-p.x,own.z-p.z)<3.2){spd=Math.min(spd,hyp(own.vx,own.vz)*1.08+1.2);tx=own.x+own.vx*.2;tz=own.z+own.vz*.2}}
else{tx=p.hx+(b.x-p.hx)*.3;tz=p.hz+(b.z-p.hz)*.3;
if(p.hx*dir<-10){const g=b.x-dir*3;tx=dir>0?Math.min(tx,g):Math.max(tx,g)}
else{let o=null,d=14;for(const q of S.p){if(q.t===p.t||q.gk||q===own)continue;const e=hyp(q.x-p.hx,q.z-p.hz);if(e<d){d=e;o=q}}
if(o){tx=(tx+o.x-dir*2.5)/2;tz=(tz+o.z)/2}}}}
else{const ref=own||b;if(S.thru&&S.time<S.thru.t&&p.id===S.thru.id){tx=S.thru.x;tz=S.thru.z;spd*=1.22}else if(p.id===S.rcv){tx=b.x+b.vx*.3;tz=b.z+b.vz*.3;spd*=1.1}else{tx=p.hx+dir*(p.hx*dir>0?18:12)+(ref.x-p.hx)*.15;tz=p.hz+(ref.z-p.hz)*.3}}
if(own!==p&&!ch[p.t].includes(p))for(const q of S.p){if(q===p||q.t!==p.t||q.gk)continue;const d=hyp(q.x-p.x,q.z-p.z);if(d<5&&d>.1){tx+=(p.x-q.x)/d*(5-d)*.6;tz+=(p.z-q.z)/d*(5-d)*.6}}
return[cl(tx,-47,47),cl(tz,-30,30),spd]}
function step(S,dt,inp){
S.ev.length=0;if(inp)S.inp=inp;S.time+=dt;
const P=S.p,b=S.ball;let own=S.owner>=0?P[S.owner]:null;
if(!S.botUser)S.user=pickUser(S);
const ch=[chasers(S,0),chasers(S,1)],isU=p=>!S.botUser&&p.id===S.user;
for(const p of P){p.cd-=dt;p.imm-=dt;p.dv-=dt;p.lunge-=dt;let wx=0,wz=0;
if(isU(p)){const i=S.inp,m=hyp(i.ix,i.iz),ix=m>1?i.ix/m:i.ix,iz=m>1?i.iz/m:i.iz;
const sr=i.sprint&&S.stam>.02&&m>.1;S.stam=sr?S.stam-dt*.22:Math.min(1,S.stam+dt*.1);
const sp=8.4*S.mood.sp*(sr?1.38:1)*(p.lunge>0?1.6:1)*(own===p?.97:1);wx=ix*sp;wz=iz*sp}
else{const t=aiMove(S,p,ch,own),dx=t[0]-p.x,dz=t[1]-p.z,d=hyp(dx,dz);if(d>.6){const s=t[2]*Math.min(1,d/3);wx=dx/d*s;wz=dz/d*s}}
let ax=wx-p.vx,az=wz-p.vz;const l=hyp(ax,az),mx=(p.dv>0?40:27)*dt;if(l>mx){ax*=mx/l;az*=mx/l}p.vx+=ax;p.vz+=az;
p.x=cl(p.x+p.vx*dt,-52,52);p.z=cl(p.z+p.vz*dt,-34,34);
if(hyp(p.vx,p.vz)>.8)p.a=turn(p.a,Math.atan2(p.vz,p.vx),14*dt)}
if(own){const o=own,sp=hyp(o.vx,o.vz),off=.9+.15*Math.min(sp/8,1);b.x=o.x+Math.cos(o.a)*off;b.z=o.z+Math.sin(o.a)*off;b.y=.45;b.vx=o.vx;b.vz=o.vz;b.vy=0;
for(const q of P){if(q.t===o.t||q.cd>0||o.imm>0)continue;if(hyp(q.x-o.x,q.z-o.z)<1.25){
const pr=1.8*(q.t?S.diff:1)*(isU(q)?2:1)*(1-Math.min(sp/12,.5));if(S.rng()<dt*pr){S.st.tackles++;o.cd=.7;if(S.rng()<.5){S.owner=q.id;q.hold=0;S.rcv=-1;S.thru=null}else{b.vx=Math.cos(q.a)*5;b.vz=Math.sin(q.a)*5;b.vy=1.5;S.owner=-1}break}}}}
else{b.vy-=25*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;
if(b.y<.45){b.y=.45;b.vy=b.vy<-3?-b.vy*.45:0}
if(b.y<.5){const k=hyp(b.vx,b.vz)>12?.4:1.1,f=Math.max(0,1-k*dt);b.vx*=f;b.vz*=f}
const hs=hyp(b.vx,b.vz);let pick=null,pd=1e9;
for(const q of P){if(q.cd>0)continue;const d=hyp(q.x-b.x,q.z-b.z),r=q.gk?(q.dv>0?2.3:1.5):1.35;
if(d<r&&b.y<(q.gk?2.8:1.6)&&(q.gk||hs<21)&&d<pd&&!(q.gk&&hs>20&&S.roll>.55-.2*(d/r))){pd=d;pick=q}}
if(pick){const q=pick;
if(q.gk){if(hs>22&&S.rng()>.55){q.cd=.4;b.vx*=-.35;b.vz+=(S.rng()-.5)*10;S.st.saves++}else{S.owner=q.id;q.hold=0;S.rcv=-1;S.thru=null;S.st.saves+=hs>14?1:0}}
else if(hs>12&&S.rng()<(hs-14)/40){b.vx*=.4;b.vz*=.4;q.cd=.3}
else{S.owner=q.id;q.hold=0;S.rcv=-1;S.thru=null}}}
own=S.owner>=0?P[S.owner]:null;
if(own&&!isU(own))decide(S,own,dt);
if(S.owner>=0)S.st.poss[P[S.owner].t]++;
if(Math.abs(b.x)>50&&Math.abs(b.z)<GW&&b.y<2.44){const t=b.x>0?0:1;S.st.goals[t]++;S.ev.push({type:'goal',t});return}
if(Math.abs(b.x)>52){b.x=Math.sign(b.x)*52;b.vx*=-.4}
if(Math.abs(b.z)>34){b.z=Math.sign(b.z)*34;b.vz*=-.4}}
function act(S,k){const P=S.p,p=P[S.user];if(!p)return;const own=S.owner===p.id;
if(k===3){if(own){p.imm=.7;p.lunge=.3}return}
if(own){if(k===4)userThrough(S,p);else if(k===2)lob(S,p,true);else if(k===1)shoot(S,p,true);else userPass(S,p)}else p.lunge=.35}
const Sim={create,reset,step,act,setFormation,FORM,N};
if(typeof module!=='undefined'&&module.exports)module.exports=Sim;else root.Sim=Sim;
})(typeof window!=='undefined'?window:globalThis);
