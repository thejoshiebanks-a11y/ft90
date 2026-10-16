(function(root){
'use strict';
/* FT90 simulation core v2
   Pitch: x in [-55,55] (team 0 attacks +x), z in [-36,36]. Goal half-width GW.
   Systems: ball-touch dribbling, lane-aware passing, first touch, press/cover/mark defending,
   support + forward runs, offside line, intercept prediction, reactive goalkeeper, tackles/slides. */
const GW=3.65,L=55,W=36,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),hyp=Math.hypot,N=11;
const DEF=[[-30,-20],[-32,-7],[-32,7],[-30,20]];
const FORM={
'4-3-3':[[-46,0],...DEF,[-10,-12],[-12,0],[-10,12],[14,-18],[18,0],[14,18]],
'4-4-2':[[-46,0],...DEF,[-10,-22],[-12,-7],[-12,7],[-10,22],[14,-8],[14,8]],
'4-2-3-1':[[-46,0],...DEF,[-14,-8],[-14,8],[0,-18],[2,0],[0,18],[16,0]],
'3-5-2':[[-46,0],[-30,-12],[-32,0],[-30,12],[-14,-24],[-12,-10],[-8,0],[-12,10],[-14,24],[14,-8],[14,8]]};
const roleOf=x=>x<-40?'G':x<-20?'D':x<7?'M':'F';
function setFormation(S,t,name){const f=FORM[name];if(!f)return;S.form[t]=name;
 S.p.filter(p=>p.t===t).forEach((p,i)=>{p.hx=f[i][0]*1.1*(t?-1:1);p.hz=f[i][1]*1.06;p.role=roleOf(f[i][0])})}
function turn(a,b,m){const d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;return a+cl(d,-m,m)}
function create(o){
const rg=()=>Math.random();
const S={roll:.5,thru:null,cross:null,rs:null,lock:0,lastT:-1,rcv:-1,time:0,p:[],ball:{x:0,y:.45,z:0,vx:0,vy:0,vz:0},owner:-1,user:-1,ev:[],diff:(o&&o.diff)||.9,mood:{sp:1,pw:1,op:1},stam:1,rng:Math.random,botUser:false,inp:{ix:0,iz:0,sprint:false},
 st:{goals:[0,0],shots:[0,0],sot:[0,0],passes:[0,0],passOK:[0,0],inter:[0,0],poss:[0,0],saves:0,tackles:0,fouls:[0,0],yellows:[0,0],reds:[0,0],offsides:[0,0],pens:[0,0]},
 offs:null,pg:null,ol:[0,0],kickoff:null,nextKickoff:0,form:['4-3-3','4-4-2'],plan:[{press:[],sup:[],run:[],mk:{},chase:null,chase2:null},{press:[],sup:[],run:[],mk:{},chase:null,chase2:null}],pt:0,shot:null,shotId:0,lastPass:null};
for(let t=0;t<2;t++)for(let i=0;i<N;i++)S.p.push({id:t*N+i,t,gk:i===0,role:'M',hx:0,hz:0,x:0,z:0,vx:0,vz:0,a:t?Math.PI:0,cd:0,imm:0,hold:0,dv:0,dd:1,gt:0,lunge:0,jp:0,kt:-9,
 thk:0,tkw:0,prs:0,stun:0,dph:0,mk:-1,dx:t?-1:1,dz:0,seen:0,
 spd:.96+rg()*.1,pa:.86+rg()*.22,sh:.84+rg()*.26,ta:.86+rg()*.22,dr:.84+rg()*.26,pc:.86+rg()*.22,re:.11+rg()*.13});
setFormation(S,0,'4-3-3');setFormation(S,1,'4-4-2');reset(S);return S}
function reset(S,team){S.offs=null;S.pg=null;S.shot=null;S.lastPass=null;
team=team===0||team===1?team:(S.nextKickoff===0||S.nextKickoff===1?S.nextKickoff:0);S.nextKickoff=1-team;
S.p.forEach(p=>{if(p.off)return;p.x=p.t?Math.max(p.hx,p.gk?p.hx:2.5):Math.min(p.hx,p.gk?p.hx:-2.5);p.z=p.hz;p.vx=p.vz=0;p.a=p.t?Math.PI:0;p.cd=p.imm=p.lunge=p.dv=p.hold=p.jp=p.tkw=p.prs=p.stun=0;p.thk=.2;p.mk=-1;p.dx=p.t?-1:1;p.dz=0;p.seen=0});
for(const p of S.p){if(p.off)continue;if(p.t===team){p.x=team===0?Math.min(p.x,-1.2):Math.max(p.x,1.2)}else{p.x=team===0?Math.max(p.x,1.2):Math.min(p.x,-1.2)}}
const taker=S.p[team*N+9],support=S.p[team*N+10];taker.x=team===0?-.72:.72;taker.z=0;taker.vx=taker.vz=0;taker.a=team===0?0:Math.PI;support.x=team===0?-4:4;support.z=team===0?2.4:-2.4;support.vx=support.vz=0;
const b=S.ball;b.x=0;b.y=.22;b.z=0;b.vx=b.vy=b.vz=0;S.owner=-1;S.rs=null;S.thru=null;S.cross=null;S.rcv=-1;S.lastT=team;S.kickoff={team,taker:taker.id,at:S.time};S.user=taker.id;S.pt=0}
/* ---------------- helpers ---------------- */
function pickUser(S,force){const b=S.ball,P=S.p;
const ok=i=>i>=0&&P[i]&&P[i].t===0&&!P[i].gk&&!P[i].off;
if(S.owner>=0&&P[S.owner].t===0&&!P[S.owner].gk)return S.owner;
if(!force&&S.lock>S.time&&ok(S.user))return S.user;
const cur=ok(S.user)?S.user:-1;
if(S.owner<0&&ok(S.rcv)){const r=P[S.rcv];if(cur<0||hyp(r.x-b.x,r.z-b.z)<4.5)return S.rcv;return cur}
const px=b.x+b.vx*.25,pz=b.z+b.vz*.25;let best=-1,bd=1e9;
for(const p of P){if(p.t||p.gk||p.off)continue;let d=hyp(p.x-px,p.z-pz);
 /* when defending prefer the player who is goal-side of the ball */
 if(S.owner>=0&&P[S.owner].t===1&&p.x>b.x+1.5)d+=3;
 if(d<bd){bd=d;best=p.id}}
if(!force&&cur>=0&&hyp(P[cur].x-px,P[cur].z-pz)<bd+6)return cur;return best}
function manualSwitch(S){const b=S.ball,i=S.inp,m=hyp(i.ix,i.iz);let best=-1,bs=1e9;
for(const p of S.p){if(p.t||p.gk||p.off||p.id===S.user)continue;let sc=hyp(p.x-b.x,p.z-b.z);
if(m>.3){const dx=p.x-S.p[S.user].x,dz=p.z-S.p[S.user].z,d=hyp(dx,dz)||1;sc+=(1-(dx*i.ix+dz*i.iz)/(d*m))*14}
if(sc<bs){bs=sc;best=p.id}}
if(best>=0){S.user=best;S.lock=S.time+2.5}}
function nearOpp(S,p){let o=null,d=1e9;for(const q of S.p){if(q.t===p.t||q.gk||q.off)continue;const e=hyp(q.x-p.x,q.z-p.z);if(e<d){d=e;o=q}}return{o,d}}
function openness(S,q){let m=99;for(const o of S.p)if(o.t!==q.t&&!o.off){const d=hyp(o.x-q.x,o.z-q.z);if(d<m)m=d}return m}
function laneClear(S,p,tx,tz){const ax=tx-p.x,az=tz-p.z,l2=ax*ax+az*az||1;let m=9;
for(const o of S.p){if(o.t===p.t||o.off)continue;const t=cl(((o.x-p.x)*ax+(o.z-p.z)*az)/l2,0,1);const d=hyp(p.x+ax*t-o.x,p.z+az*t-o.z);
 /* defenders close to the receiver are handled by openness; weigh interceptors mid-lane more */
 const w=t>.88?1.4:1;if(d*1/w<m)m=d/w}return m}
function blocked(S,p,tx,tz){return laneClear(S,p,tx,tz)<1.6}
function offList(S,p){const rs=S.rs;if(rs&&(rs.kind==='throw'||rs.kind==='goalkick'||rs.kind==='corner'))return null;const dir=p.t?-1:1,bx=S.ball.x*dir,ds=S.p.filter(q=>q.t!==p.t&&!q.off).map(q=>q.x*dir).sort((a,c)=>c-a),ln=Math.max(ds[1]===undefined?0:ds[1],bx,0),ids=[];
for(const q of S.p)if(q.t===p.t&&q!==p&&!q.gk&&!q.off&&q.x*dir>ln+.35)ids.push(q.id);return ids.length?{t:p.t,ids,at:S.time}:null}
/* ball flight prediction (ground friction approximation) and intercept search */
function icpt(S,p,spd){const b=S.ball;
for(let k=0;k<=2.6;k+=.2){const f=b.y>.6?k:(1-Math.exp(-.7*k))/.7,x=b.x+b.vx*f,z=b.z+b.vz*f;
 if(Math.abs(x)>L+2||Math.abs(z)>W+2)break;const d=hyp(x-p.x,z-p.z);if((d-.8)/spd<=k)return{t:k,x,z}}
const f=(1-Math.exp(-.7*2.6))/.7;return{t:99,x:cl(b.x+b.vx*f,-L,L),z:cl(b.z+b.vz*f,-W,W)}}
/* ---------------- kicking ---------------- */
function kick(S,p,dx,dz,sp,vy){const l=hyp(dx,dz)||1,b=S.ball;S.offs=offList(S,p);b.vx=dx/l*sp;b.vz=dz/l*sp;b.vy=vy;S.owner=-1;p.cd=.4;p.hold=0;p.kt=S.time;S.lastT=p.t;S.rcv=-1;S.rs=null;S.roll=S.rng();S.lastPass=null;p.thk=.25;S.kickT=S.time}
function shotQ(S,p){const dir=p.t?-1:1,gx=dir*L,dx=Math.abs(gx-p.x);if(dx>33)return 0;
const ang=Math.abs(Math.atan2(GW-p.z,dx)-Math.atan2(-GW-p.z,dx));let q=Math.pow(Math.min(ang/.62,1.2),1.5)*.5;
const ax=gx-p.x,az=-p.z,l2=ax*ax+az*az||1;let bl=0;
for(const o of S.p){if(o.t===p.t||o.off||o.gk)continue;const t=cl(((o.x-p.x)*ax+(o.z-p.z)*az)/l2,0,1);if(t<.08)continue;if(hyp(p.x+ax*t-o.x,p.z+az*t-o.z)<1.35)bl++}
return q*Math.pow(.6,bl)}
function shoot(S,p,user){const dir=p.t?-1:1,gk=S.p.find(q=>q.gk&&q.t!==p.t),inp=S.inp,pen=!!(S.rs&&S.rs.kind==='pen');
const gdx=Math.abs(dir*L-p.x);
let tz=gk.z>0?-2.75:2.75;if(Math.abs(p.z)>9)tz=-Math.sign(p.z)*2.55;
tz+= (S.rng()-.5)*.7;
if(pen)tz=user&&hyp(inp.ix,inp.iz)>.3?cl(inp.iz*3.2,-3.2,3.2):(S.rng()<.5?-1:1)*(1.8+S.rng()*.8);
let dx=dir*L-p.x,dz=tz-p.z;
if(user&&!pen){const m=hyp(inp.ix,inp.iz),l=hyp(dx,dz);if(m>.3){if((inp.ix*dx+inp.iz*dz)/(l*m)<.55){dx=inp.ix;dz=inp.iz}else{/* stick up/down chooses the corner */tz=cl(p.z*.2+inp.iz*3.1,-3.3,3.3);dz=tz-p.z}}
else if((Math.cos(p.a)*dx+Math.sin(p.a)*dz)/l<.5){dx=Math.cos(p.a);dz=Math.sin(p.a)}}
else if(!user){const e=(S.rng()-.5)*(.10+gdx*.007)*(1.7-(p.t?S.diff:1)*p.sh);const c=Math.cos(e),s=Math.sin(e);const x=dx*c-dz*s;dz=dx*s+dz*c;dx=x}
const power=pen?(user?23:22):(user?(21.5+Math.min(gdx,30)*.2)*S.mood.pw:(21+S.rng()*4+Math.min(gdx,30)*.1)*p.sh);
const vy=pen?0.8+S.rng()*1.1:(S.rng()<.12&&gdx<16?3.5+S.rng()*2:0.5+S.rng()*2);
kick(S,p,dx,dz,power,vy);S.shot={t:p.t,time:S.time,id:++S.shotId};
if(pen)S.pg={z:S.rng()<.3?tz:(S.rng()<.5?-2.6:2.6),t:S.time};S.st.shots[p.t]++}
function lead(p,q,k,c){let d=hyp(q.x-p.x,q.z-p.z),t=0,tx=q.x,tz=q.z;for(let i=0;i<4;i++){const sp=cl(d*k+c,9,21);t=Math.min(1.5,d/(sp*.82));tx=q.x+q.vx*t;tz=q.z+q.vz*t;d=hyp(tx-p.x,tz-p.z)}return[tx,tz]}
function noisy(S,p,dx,dz,amp){const df=p.t?S.diff:1,pr=nearOpp(S,p).d,e=(S.rng()-.5)*amp*(1.5-df*p.pa)*(pr<3?1.5:1),c=Math.cos(e),s=Math.sin(e);return[dx*c-dz*s,dx*s+dz*c]}
function passTo(S,p,q,user){const ld=lead(p,q,.88,5.5);let dx=ld[0]-p.x,dz=ld[1]-p.z;
if(!user){const n=noisy(S,p,dx,dz,.2);dx=n[0];dz=n[1]}
const sp=cl(hyp(dx,dz)*.95+6.5,10,22);kick(S,p,dx,dz,sp,0);S.rcv=q.id;S.st.passes[p.t]++;S.lastPass={t:p.t,from:p.id,to:q.id,time:S.time}}
function userPass(S,p){const inp=S.inp,m=hyp(inp.ix,inp.iz),fx=m>.3?inp.ix/m:Math.cos(p.a),fz=m>.3?inp.iz/m:Math.sin(p.a);
let best=null,bs=-9;for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<2.5)continue;
const c=(dx*fx+dz*fz)/d,sc=c*1.2-d*.012-(blocked(S,p,q.x,q.z)?0.85:0)-(q.x*(p.t?-1:1)>S.ol[p.t]+.3?.35:0);if(c>.4&&sc>bs){bs=sc;best=q}}
if(best)passTo(S,p,best,true);else{kick(S,p,fx,fz,16,0);S.st.passes[p.t]++}}
function throughTo(S,p,q,user){const dir=p.t?-1:1,tx=cl(q.x+q.vx*.9+dir*10,-L+4,L-4),tz=cl(q.z+q.vz*.5,-W+6,W-6);let dx=tx-p.x,dz=tz-p.z;
if(!user){const n=noisy(S,p,dx,dz,.2);dx=n[0];dz=n[1]}
kick(S,p,dx,dz,cl(hyp(dx,dz)*.9+5.5,10,21),0);S.rcv=q.id;S.thru={x:tx,z:tz,t:S.time+1.8,id:q.id};S.st.passes[p.t]++;S.lastPass={t:p.t,from:p.id,to:q.id,time:S.time}}
function userThrough(S,p){const inp=S.inp,m=hyp(inp.ix,inp.iz),dir=p.t?-1:1,fx=m>.3?inp.ix/m:dir,fz=m>.3?inp.iz/m:0;let best=null,bs=-9;
for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<6)continue;const c=(dx*fx+dz*fz)/d,sc=c+(q.x-p.x)*dir*.02+(q.vx*dir>2?.25:0);if(c>.3&&sc>bs){bs=sc;best=q}}
if(best)throughTo(S,p,best,true);else userPass(S,p)}
function lobTo(S,p,tx,tz,cross){const dx=tx-p.x,dz=tz-p.z;kick(S,p,dx,dz,Math.min(25,hyp(dx,dz)/1.25),12);S.st.passes[p.t]++;
if(cross)S.cross={x:tx,z:tz,t:S.time+1,tm:p.t};else S.lastPass={t:p.t,from:p.id,to:-1,time:S.time}}
function boxTarget(S,p){const dir=p.t?-1:1;let best=null,bs=-9;
for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;const gd=Math.abs(dir*L-q.x);if(gd>22||Math.abs(q.z)>13)continue;const sc=Math.min(openness(S,q),8)-gd*.12;if(sc>bs){bs=sc;best=q}}
return best?[best.x+best.vx*.6,best.z+best.vz*.6]:[dir*(L-9),(S.rng()-.5)*7-Math.sign(p.z)*2]}
function lob(S,p,user){const dir=p.t?-1:1;
if(Math.abs(p.z)>15&&p.x*dir>20){const t=boxTarget(S,p);lobTo(S,p,t[0],t[1],true);return}
let fx=Math.cos(p.a),fz=Math.sin(p.a);if(user){const m=hyp(S.inp.ix,S.inp.iz);if(m>.3){fx=S.inp.ix/m;fz=S.inp.iz/m}}
let best=null,bs=-9;for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<14)continue;const sc=(dx*fx+dz*fz)/d+Math.min(openness(S,q),8)*.04;if(sc>bs){bs=sc;best=q}}
if(best)lobTo(S,p,best.x+best.vx*.8,best.z+best.vz*.8);else lobTo(S,p,cl(p.x+fx*30,-L+2,L-2),cl(p.z+fz*30,-W+2,W-2))}
/* ---------------- AI ball carrier ---------------- */
function passOptions(S,p){const dir=p.t?-1:1,out=[],pr=nearOpp(S,p).d;
for(const q of S.p){if(q===p||q.t!==p.t||q.off)continue;
 const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<4||d>38)continue;
 if(q.gk&&!(pr<3.2&&d<34))continue;
 const lane=laneClear(S,p,q.x,q.z);if(lane<1.35+d*.04)continue;
 const open=Math.min(openness(S,q),10),fwd=dx*dir;
 let sc=fwd*.105+open*.3+Math.min(lane,5)*.4-d*.03;
 const offside=q.x*dir>S.ol[p.t]+.3&&!(S.rs&&(S.rs.kind==='throw'||S.rs.kind==='goalkick'));
 if(offside)sc-=6;if(q.x*dir>L-30)sc+=.6;if(q.gk)sc-=1.4;
 out.push({q,sc,kind:'g'});
 if(fwd>8&&q.vx*dir>2.2&&open>3.6&&!offside&&q.x*dir<=S.ol[p.t]+1){const tx=cl(q.x+q.vx*.9+dir*9,-L+4,L-4),tz=cl(q.z+q.vz*.5,-W+6,W-6);
  if(laneClear(S,p,tx,tz)>2.2)out.push({q,sc:fwd*.1+open*.3+1.1-d*.02,kind:'t'})}}
out.sort((a,c)=>c.sc-a.sc);return out}
function dribbleOption(S,p){const dir=p.t?-1:1,gx=dir*L,tgx=gx-p.x,tgz=-p.z*.55,tl=hyp(tgx,tgz)||1;let best=null,bs=-99;
const base=Math.atan2(tgz,tgx);
for(const da of [0,.5,-.5,1,-1,1.6,-1.6,2.5]){const a=base+da,ux=Math.cos(a),uz=Math.sin(a);let clear=14;
 for(const o of S.p){if(o.t===p.t||o.off)continue;const rx=o.x-p.x,rz=o.z-p.z,along=rx*ux+rz*uz,perp=Math.abs(rx*uz-rz*ux);
  if(along>0&&along<14&&perp<2.6){const c=along-perp*.6;if(c<clear)clear=c}}
 let sc=clear*.28+ux*dir*1.7;
 const ez=p.z+uz*9,ex=p.x+ux*9;if(Math.abs(ez)>W-2)sc-=3;if(Math.abs(ex)>L-1.5)sc-=2.5;
 if(da>1.2)sc-=.8;if(sc>bs){bs=sc;best={dx:ux,dz:uz,clear,sc}}}
return best}
function aiCarrier(S,p,dt){const dir=p.t?-1:1,df=p.t?S.diff:1;
p.hold+=dt;
if(S.rs&&S.rs.taker===p.id&&p.hold<1.1)return;
if(p.gk){if(p.hold>1.15){const o=passOptions(S,p);const g=o.find(e=>!e.q.gk&&e.sc>0);if(g)passTo(S,p,g.q,false);else lobTo(S,p,p.x+dir*26,(S.rng()-.5)*20)}return}
p.thk-=dt;if(p.thk>0)return;p.thk=.14+S.rng()*.12+(1-df)*.3;
const gdx=Math.abs(dir*L-p.x),near=nearOpp(S,p),pr=near.d;
const ind=S.rs&&S.rs.ind;
if(!ind&&p.hold>.12+(1-df)*.5){const xg=shotQ(S,p);if(xg>(pr<3.5?.075:.105)+S.rng()*.05){shoot(S,p,false);return}}
if(Math.abs(p.z)>15&&gdx<30&&p.hold>.35+(1-df)*.4&&S.rng()<.4){lob(S,p,false);return}
const opts=passOptions(S,p),dr=dribbleOption(S,p);p.dx=dr.dx;p.dz=dr.dz;p.dclear=dr.clear;
const pb=opts[0];
if(pb){const pressured=pr<3.4,want=(pressured&&pb.sc>-.4&&p.hold>.22)||(pb.sc>dr.sc+.9&&p.hold>.55)||p.hold>2.8;
 if(want){/* occasionally pick the 2nd best to avoid predictability */
  const pick=(opts[1]&&opts[1].sc>pb.sc-.45&&S.rng()<.25)?opts[1]:pb;
  if(pick.kind==='t')throughTo(S,p,pick.q,false);else passTo(S,p,pick.q,false);return}}
if(p.hold>3.4){lob(S,p,false)}}
/* ---------------- goalkeeper ---------------- */
function gkMove(S,p,own){const gs=p.t?1:-1,b=S.ball,gl=gs*L,bd=hyp(b.x-gl,b.z),hs=hyp(b.vx,b.vz);
if(S.rs&&S.rs.kind==='pen'&&p.t!==S.rs.t)return[gl-gs*1.3,0,6];
if(p.dv>0)return[gl-gs*1.5,cl(p.gt,-5.8,5.8),15];
const danger=!own&&b.vx*gs>6&&Math.abs(b.x-gl)<36&&S.lastT!==p.t;
if(danger){const t=(gl-b.x)/b.vx;
 if(t>0&&t<1.7){const pz=b.z+b.vz*t,py=b.y+b.vy*t-12.5*t*t;
  if(py<3.4&&Math.abs(pz)<GW+3.4){
   const sh=S.shot;
   if(sh&&sh.t!==p.t&&S.time-sh.time<p.re)return[gl-gs*2.2,cl(p.z*.8,-4,4),6.5];
   if(p.seen!==(sh?sh.id:-1)||!sh){p.seen=sh?sh.id:-1;const sk=(p.t?S.diff:1)*p.pc;p.gt=pz+(S.rng()-.5)*2.3*(1.7-sk)}
   p.dd=Math.sign(p.gt-p.z)||1;
   if(Math.abs(p.gt-p.z)>1.15&&t<.66&&p.cd<=0){p.dv=.8;p.jp=0}
   return[gl-gs*1.8,cl(p.gt,-5.8,5.8),9.6]}}}
if(!own&&Math.abs(b.x-gl)<19&&Math.abs(b.z)<15&&hs<14){let opp=1e9;for(const q of S.p)if(q.t!==p.t&&!q.off)opp=Math.min(opp,hyp(q.x-b.x,q.z-b.z));
 const mine=hyp(p.x-b.x,p.z-b.z);
 if(S.cross&&S.cross.tm!==p.t&&S.time<S.cross.t+1.3&&mine<12)return[cl(S.cross.x,gl-gs*14,gl),cl(S.cross.z,-8,8),8.6];
 if(mine<opp*1.1+1.4&&mine<15)return[b.x+b.vx*.25,b.z+b.vz*.25,8.8]}
/* angle-closing position on the line ball -> goal centre */
const out=cl(1.7+(bd<20?(20-bd)*.09:0)+(bd>46?1:0),1.5,4.4);
return[gl-gs*out,cl(b.z*.36*(bd<24?1.15:1),-4.4,4.4),7.4]}
/* ---------------- outfield AI movement ---------------- */
function shapeTarget(S,p,att){const dir=p.t?-1:1,b=S.ball,bX=b.x*dir,hX=p.hx*dir,hZ=p.hz;let X,Z;
if(att){const k=p.role==='D'?.4:p.role==='M'?.58:.64;X=hX+cl(bX+30,0,60)*k;Z=hZ*1.14+(b.z-hZ)*.1;
 if(p.role!=='D')X=Math.min(X,Math.max(S.ol[p.t],bX)-.8);else X=Math.min(X,Math.max(S.ol[p.t]-14,-20))}
else{const k=p.role==='D'?.34:p.role==='M'?.42:.3;X=hX+cl(bX+28,0,56)*k;
 if(p.role==='D')X=Math.min(X,Math.max(bX+2,-36));else if(p.role==='M')X=Math.min(X,Math.max(bX+9,-26));
 Z=hZ*.78+(b.z-hZ)*.32}
const cX=p.role==='D'?(att?.08:.2):p.role==='M'?(att?.24:.32):(att?.04:.22),cZ=att?.3:.42;let wx=X*dir,wz=Z;wx+=(b.x-wx)*cX;wz+=(b.z-wz)*cZ;
return[cl(wx,-L+2,L-2),cl(wz,-W+2,W-2)]}
function aiMove(S,p,own){const dir=p.t?-1:1,b=S.ball,P=S.p,pl=S.plan[p.t],df=p.t?S.diff*S.mood.op:1;
if(p.gk)return gkMove(S,p,own);
const base=(p.role==='D'?6.5:p.role==='M'?6.8:7)*df*p.spd;let spd=base;
if(S.rs&&S.rs.kind==='pen'&&p.id!==S.rs.taker){const gx=S.rs.gx;return[gx*Math.min(gx*p.x,L-23.5),p.z,p.x*gx>L-22?9:4]}
if(S.rs&&p.t!==S.rs.t){const d=hyp(p.x-b.x,p.z-b.z);if(d<10){const tx=p.x+(p.x-b.x)/(d||1)*6,tz=p.z+(p.z-b.z)/(d||1)*6;return[cl(tx,-L+1,L-1),cl(tz,-W+1,W-1),7]}}
const car=own||((S.rcv>=0&&S.lastT>=0&&P[S.rcv].t===S.lastT)?P[S.rcv]:null);
const mine=car?car.t===p.t:false;
let tx,tz;
if(own===p){const run=hyp(own.vx,own.vz);tx=p.x+p.dx*12;tz=p.z+p.dz*12;if(S.rs&&S.rs.taker===p.id){tx=p.x;tz=p.z}spd=Math.min(base*(p.dclear>9?1.3:1.12),run+2.8);spd=Math.max(spd,base*.9);
 tx=cl(tx,-L+1,L-1);tz=cl(tz,-W+1,W-1);return[tx,tz,spd]}
if(S.thru&&S.time<S.thru.t&&p.id===S.thru.id&&S.owner<0){return[S.thru.x,S.thru.z,base*1.25]}
if(S.owner<0&&S.rcv===p.id){const ip=icpt(S,p,base*1.18);return[ip.x,ip.z,base*1.2]}
if(S.owner<0&&(pl.chase===p||pl.chase2===p)){const ip=icpt(S,p,base*1.12);let x=ip.x,z=ip.z;if(pl.chase2===p&&pl.chase){x=b.x-dir*4;z=b.z*.9}return[x,z,base*(pl.chase===p?1.25:1.05)]}
if(S.cross&&S.time<S.cross.t+1.2&&!p.gk){const l=P.filter(q=>!q.gk&&q.t===p.t&&!q.off).map(q=>[hyp(q.x-S.cross.x,q.z-S.cross.z),q]).sort((a,c)=>a[0]-c[0]);
 if(l.slice(0,p.t===S.cross.tm?3:2).some(e=>e[1]===p))return[S.cross.x+(p.t===S.cross.tm?0:dir*-1.5),S.cross.z+(p.id%3-1)*2.2,base*1.2]}
if(!mine&&car){/* defending: press / cover / mark / hold shape */
 if(pl.press[0]===p){const d=hyp(car.x-p.x,car.z-p.z),cs=hyp(car.vx,car.vz);
  if(d>4.8){tx=car.x+car.vx*.35;tz=car.z+car.vz*.35;spd=base*1.2}
  else{const gx=-dir*L,ux=gx-car.x,uz=-car.z,ul=hyp(ux,uz)||1;tx=car.x+car.vx*.18+ux/ul*1.5;tz=car.z+car.vz*.18+uz/ul*1.5;spd=Math.min(base*1.25,Math.max(4.8,cs*1.08+1.6))}
  return[tx,tz,spd]}
 if(pl.press[1]===p){const gx=-dir*L,ux=gx-car.x,uz=-car.z,ul=hyp(ux,uz)||1;tx=car.x+ux/ul*6.5;tz=car.z+uz/ul*6.5+Math.sign(b.z-p.z||1)*1.5;return[cl(tx,-L+2,L-2),cl(tz,-W+2,W-2),base*1.05]}
 if(pl.mk[p.id]!==undefined){const a=P[pl.mk[p.id]];if(a){const gx=-dir*L,ux=gx-a.x,uz=-a.z,ul=hyp(ux,uz)||1,db=hyp(a.x-b.x,a.z-b.z),g=db<20?1.7:2.8;
   tx=a.x+ux/ul*g+a.vx*.15;tz=a.z+uz/ul*g*.45+a.vz*.15;const sh=shapeTarget(S,p,false);tx=tx*.8+sh[0]*.2;tz=tz*.8+sh[1]*.2;return[cl(tx,-L+2,L-2),cl(tz,-W+2,W-2),base*1.02]}}
 const sh=shapeTarget(S,p,false);tx=sh[0];tz=sh[1];
 if(S.owner<0&&S.lastT!==p.t&&hyp(b.vx,b.vz)>7){/* cut passing lanes */const t0=1.2,sx=b.vx*t0,sz=b.vz*t0,l2=sx*sx+sz*sz||1,k=cl(((p.x-b.x)*sx+(p.z-b.z)*sz)/l2,.15,1),ix=b.x+sx*k,iz=b.z+sz*k;if(hyp(ix-p.x,iz-p.z)<10){tx=ix;tz=iz;spd*=1.2}}}
else if(car){/* attacking */
 const si=pl.sup.indexOf(p),sh=shapeTarget(S,p,true);tx=sh[0];tz=sh[1];
 if(si>=0&&car!==p){const side=car.z>9?-1:car.z<-9?1:(p.hz>=0?1:-1);let sx,sz;
  if(si===0){sx=car.x+dir*8;sz=car.z+side*10}else if(si===1){sx=car.x+dir*1.5;sz=car.z-side*12}else{sx=car.x-dir*8;sz=car.z+side*5}
  tx=sx*.62+tx*.38;tz=sz*.62+tz*.38}
 else if(pl.run.includes(p)&&car.hold>.2&&car===own){const xt=Math.min(S.ol[p.t]-.8,L-6);tx=dir*xt;tz=cl(p.hz*1.05+Math.sin(S.time*.5+p.id)*5,-26,26);spd=base*1.18}
 if(p.role==='D'||p.role==='M'){/* stay onside */}
 if(p.role!=='D')tx=dir*Math.min(tx*dir,S.ol[p.t]-.6)}
else{const sh=shapeTarget(S,p,S.lastT===p.t);tx=sh[0];tz=sh[1]}
if(own!==p){for(const q of P){if(q===p||q.t!==p.t||q.gk||q.off)continue;const d=hyp(q.x-p.x,q.z-p.z);if(d<6&&d>.1){tx+=(p.x-q.x)/d*(6-d)*.55;tz+=(p.z-q.z)/d*(6-d)*.55}}}
return[cl(tx,-L+2,L-2),cl(tz,-W+2,W-2),spd]}
/* ---------------- team planning (press roles, marking, support, runs, chasers) ---------------- */
function planTeam(S,t){const P=S.p,b=S.ball,dir=t?-1:1,own=S.owner>=0?P[S.owner]:null,exU=(t===0&&!S.botUser)?S.user:-1;
const pl=S.plan[t];pl.press=[];pl.sup=[];pl.run=[];pl.mk={};pl.chase=null;pl.chase2=null;
const car=own||((S.rcv>=0&&S.lastT>=0&&P[S.rcv].t===S.lastT)?P[S.rcv]:null);
const cands=P.filter(p=>p.t===t&&!p.gk&&!p.off&&p.id!==exU);
if(S.owner<0){
 if(S.rcv>=0&&P[S.rcv].t===t&&!P[S.rcv].off&&S.lastT===t)pl.chase=P[S.rcv];
 else{const l=cands.filter(p=>S.lastT===t||S.time-(S.kickT||-9)>p.re+.12).map(p=>{const i=icpt(S,p,7.2);return[i.t===99?50+hyp(p.x-i.x,p.z-i.z)*.1:i.t,p]}).sort((a,c)=>a[0]-c[0]);
  if(l[0])pl.chase=l[0][1];if(l[1]&&l[1][0]<l[0][0]+.5&&hyp(l[1][1].x-b.x,l[1][1].z-b.z)<16)pl.chase2=l[1][1]}}
if(!car)return;
if(car.t!==t){
 const tp={x:car.x+car.vx*.3,z:car.z+car.vz*.3};
 const l=cands.filter(p=>p!==own).map(p=>[hyp(p.x-tp.x,p.z-tp.z)/(p.spd*7)+(p.role==='F'?.6:0),p]).sort((a,c)=>a[0]-c[0]);
 if(l[0])pl.press.push(l[0][1]);if(l[1]&&hyp(l[1][1].x-tp.x,l[1][1].z-tp.z)<20)pl.press.push(l[1][1]);
 const used=new Set(pl.press.map(p=>p.id));
 const atk=P.filter(a=>a.t!==t&&!a.gk&&!a.off&&a!==car&&a.x*dir<22).sort((a,c)=>(a.x*dir)-(c.x*dir));
 let n=0;for(const a of atk){if(n>=5)break;let best=null,bd=1e9;
  for(const d of cands){if(used.has(d.id)||d.role==='F')continue;const dd=hyp(d.x-a.x,d.z-a.z)+(d.mk===a.id?-4:0);if(dd<bd&&dd<26){bd=dd;best=d}}
  if(best){used.add(best.id);pl.mk[best.id]=a.id;best.mk=a.id;n++}}}
else{
 const mates=cands.filter(p=>p!==car);
 pl.sup=mates.map(p=>[hyp(p.x-car.x,p.z-car.z),p]).filter(e=>e[0]>4&&e[0]<30).sort((a,c)=>a[0]-c[0]).slice(0,3).map(e=>e[1]);
 pl.run=mates.filter(p=>p.role==='F'||(p.role==='M'&&p.hx*dir>-4)).sort((a,c)=>(c.x*dir)-(a.x*dir)).slice(0,3)}}
/* ---------------- restarts ---------------- */
function outOfPlay(S){const b=S.ball,P=S.p,lt=S.lastT<0?0:S.lastT;let t,x,z,kind;
if(Math.abs(b.z)>W&&Math.abs(b.x)<=L){kind='throw';t=1-lt;x=cl(b.x,-L+3,L-3);z=Math.sign(b.z)*W}
else{const e=Math.sign(b.x)||1,defT=e>0?1:0;if(lt===defT){kind='corner';t=1-defT;x=e*(L-.6);z=(Math.sign(b.z)||1)*(W-.6)}else{kind='goalkick';t=defT;x=e*(L-5.5);z=0}}
let tk=null,bd=1e9;for(const p of P){if(p.t!==t||p.off||(kind==='goalkick')!==p.gk)continue;const d=hyp(p.x-x,p.z-z);if(d<bd){bd=d;tk=p}}
b.x=x;b.z=z;b.y=.22;b.vx=b.vy=b.vz=0;tk.x=x-Math.sign(x)*.8*(kind==='goalkick'?0:1)*(kind==='throw'?0:1);tk.z=z-(kind==='throw'?Math.sign(z)*.8:0);tk.vx=tk.vz=0;tk.a=Math.atan2(-tk.z,-tk.x);
tk.imm=1.3;tk.cd=0;tk.hold=0;S.owner=tk.id;S.rcv=-1;S.thru=null;S.cross=null;S.offs=null;S.lastT=t;S.shot=null;S.rs={kind,t,taker:tk.id,until:S.time+6};
if(t===0&&!tk.gk)S.user=tk.id;S.ev.push({type:'restart',kind,t})}
function setPiece(S,kind,t,x,z,ind,victim){const dir=t?-1:1,b=S.ball;x=cl(x,-L+1,L-1);z=cl(z,-W+1,W-1);
let tk=null,bd=1e9;if(kind==='pen'&&victim&&!victim.gk&&!victim.off)tk=victim;
if(!tk)for(const p of S.p){if(p.t!==t||p.gk||p.off)continue;const d=hyp(p.x-x,p.z-z);if(d<bd){bd=d;tk=p}}
b.x=x;b.z=z;b.y=.22;b.vx=b.vy=b.vz=0;tk.x=x-dir*.9;tk.z=z;tk.vx=tk.vz=0;tk.a=Math.atan2(-z,dir*L-x);
tk.imm=1.3;tk.cd=0;tk.hold=0;S.owner=tk.id;S.rcv=-1;S.thru=null;S.cross=null;S.offs=null;S.lastT=t;S.shot=null;
S.rs={kind,t,taker:tk.id,until:S.time+(kind==='pen'?9:6),ind:!!ind,gx:dir};if(t===0)S.user=tk.id;S.ev.push({type:'restart',kind,t})}
function foul(S,q,o,bh){const dir=o.t?-1:1,box=o.x*dir>L-16.5&&Math.abs(o.z)<20.2;
S.st.fouls[q.t]++;const sev=(q.lunge>0?.34:.12)+(bh?.26:0)+(box?.1:0),r=S.rng();let card=null;
if(!q.gk){if(r<sev*.06)card='red';else if(r<sev)card='yellow'}else if(r<sev*.5)card='yellow';
if(card==='yellow'){q.yc=(q.yc||0)+1;S.st.yellows[q.t]++;if(q.yc>=2){card='second';S.st.reds[q.t]++;q.off=true}}
else if(card==='red'){S.st.reds[q.t]++;q.off=true}
if(q.off){q.x=q.z=400;q.vx=q.vz=0}
if(box)S.st.pens[o.t]++;
S.ev.push({type:'foul',t:q.t,id:q.id,vid:o.id,card,pen:box});
setPiece(S,box?'pen':'free',o.t,box?dir*(L-11):o.x,box?0:o.z,false,o)}
/* ---------------- main step ---------------- */
function startKick(S,k){const P=S.p;const taker=P[S.kickoff.taker];if(!taker)return;S.user=taker.id;S.owner=taker.id;S.kickoff=null;taker.hold=0;
if(S.botUser||taker.t===1||k===undefined){const o=passOptions(S,taker);const q=(o.find(e=>e.q.id!==taker.id)||{}).q;if(q)passTo(S,taker,q,false);else userPass(S,taker);return}
if(k===1)shoot(S,taker,true);else if(k===2)lob(S,taker,true);else if(k===4)userThrough(S,taker);else userPass(S,taker)}
function step(S,dt,inp){
S.ev.length=0;if(inp)S.inp=inp;S.time+=dt;
const P=S.p,b=S.ball;
if(S.kickoff){if((S.kickoff.team===1||S.botUser)&&S.time-S.kickoff.at>1.4)startKick(S);return}
let own=S.owner>=0?P[S.owner]:null;
if(!S.botUser){const nu=pickUser(S);if(nu!==S.user&&S.user>=0)S.lock=Math.max(S.lock,S.time+.9);S.user=nu}
S.ol=[0,1].map(t=>{const dir=t?-1:1,ds=P.filter(q=>q.t!==t&&!q.off).map(q=>q.x*dir).sort((a,c)=>c-a);return Math.max(ds[1]===undefined?0:ds[1],0)});
S.pt-=dt;if(S.pt<=0){S.pt=.12;planTeam(S,0);planTeam(S,1)}
const isU=p=>!S.botUser&&p.id===S.user;
for(const p of P){if(p.off)continue;p.cd-=dt;p.imm-=dt;p.dv-=dt;p.lunge-=dt;p.jp-=dt;p.tkw-=dt;p.prs-=dt;p.stun-=dt;let wx=0,wz=0;
 if(isU(p)){const i=S.inp,m=hyp(i.ix,i.iz);let ix=m>1?i.ix/m:i.ix,iz=m>1?i.iz/m:i.iz;
  if(p.prs>0&&own&&own.t!==p.t){/* pressure assist: lean the stick towards the carrier */const dx=own.x+own.vx*.3-p.x,dz=own.z+own.vz*.3-p.z,d=hyp(dx,dz)||1;ix=ix*.55+dx/d*.45;iz=iz*.55+dz/d*.45}
  const sr=i.sprint&&S.stam>.02&&m>.1;S.stam=sr?S.stam-dt*.2:Math.min(1,S.stam+dt*.1);
  const sp=6.8*S.mood.sp*(sr?1.34:1)*(p.lunge>0?1.7:1)*(own===p?.97:1)*(p.stun>0?.5:1);wx=ix*sp;wz=iz*sp}
 else{const t=aiMove(S,p,own),dx=t[0]-p.x,dz=t[1]-p.z,d=hyp(dx,dz);if(d>.6){const s=t[2]*Math.min(1,d/3)*(p.stun>0?.5:1);wx=dx/d*s;wz=dz/d*s}
  /* AI tackle decisions for the first presser */
  if(own&&own.t!==p.t&&!p.gk&&p.cd<=0&&p.lunge<=0&&p.tkw<=0&&S.plan[p.t].press[0]===p){const dd=hyp(own.x-p.x,own.z-p.z),os=hyp(own.vx,own.vz),df=p.t?S.diff:1;
   if(dd<2.7&&dd>1.45&&os>5.6&&S.rng()<dt*.3*df)p.lunge=.35;
   else if(dd<1.7&&S.rng()<dt*1.0*df)p.tkw=.3}}
 let ax=wx-p.vx,az=wz-p.vz;
 if(p.dv>0){const l=hyp(ax,az),mx=55*dt;if(l>mx){ax*=mx/l;az*=mx/l}}
 else{const v=hyp(p.vx,p.vz),hx=v>.4?p.vx/v:Math.cos(p.a),hz=v>.4?p.vz/v:Math.sin(p.a),ctl=isU(p)?1.22:1;
  let al=ax*hx+az*hz,pe=-ax*hz+az*hx;
  const acc=(p.lunge>0?6:Math.max(4.5,(13-v*.7)*ctl)),brk=(p.lunge>0?9:30*ctl),prp=(p.lunge>0?5:(26*ctl)/(1+v*.2));
  al=cl(al,-brk*dt,acc*dt);pe=cl(pe,-prp*dt,prp*dt);ax=al*hx-pe*hz;az=al*hz+pe*hx}
 p.vx+=ax;p.vz+=az;
 p.x=cl(p.x+p.vx*dt,-L-3,L+3);p.z=cl(p.z+p.vz*dt,-W-2,W+2);
 const spd=hyp(p.vx,p.vz);p.dph+=spd*dt*.9;
 if(spd>.8)p.a=turn(p.a,Math.atan2(p.vz,p.vx),(own===p?11:16)*dt)}
if(own){const o=own,sp=hyp(o.vx,o.vz),spf=Math.min(sp/9,1),ph=o.dph*1.55,touch=Math.max(0,Math.sin(ph)),off=.7+.12*spf+touch*(.1+.5*spf),lat=Math.cos(ph*.5)*.07*spf;
 b.x=o.x+Math.cos(o.a)*off-Math.sin(o.a)*lat;b.z=o.z+Math.sin(o.a)*off+Math.cos(o.a)*lat;b.y=.22;b.vx=o.vx;b.vz=o.vz;b.vy=0;
 for(const q of P){if(q.t===o.t||q.off||q.cd>0||o.imm>0||q.stun>0)continue;
  const reach=q.lunge>0?2.1:1.25,dB=hyp(q.x-b.x,q.z-b.z),dO=hyp(q.x-o.x,q.z-o.z);if(Math.min(dB,dO+.25)>reach)continue;
  const usr=isU(q),df=(q.t?S.diff:1);
  let pr=q.lunge>0?3.2:(q.tkw>0?5.2:(usr?0:.55));if(pr<=0)continue;
  pr*=q.ta*df*(usr?1.12:1)*(1-Math.min(sp/13,.5))*(1.2-.36*o.dr)*(1+Math.max(0,off-.9)*.9);
  if(S.rng()<dt*pr){const win=S.rng()<.54+.12*(q.ta-o.dr),bh=(o.x-q.x)*Math.cos(o.a)+(o.z-q.z)*Math.sin(o.a)>.5,fp=(win?.035:.2)*(q.lunge>0?2.3:1)*(bh?1.8:1);
   if(S.rng()<fp){foul(S,q,o,bh);return}
   S.st.tackles++;
   if(win){if(S.rng()<.6){S.owner=q.id;q.hold=0;S.rcv=-1;S.thru=null;S.rs=null;S.lastT=q.t;S.lastPass=null;q.cd=0;o.cd=.5}
    else{const a=S.rng()*6.28;b.vx=Math.cos(q.a)*5+Math.cos(a)*2;b.vz=Math.sin(q.a)*5+Math.sin(a)*2;b.vy=1.4;S.owner=-1;S.rs=null;S.lastT=q.t;S.rcv=-1;o.cd=.45;q.cd=.12}}
   else{o.cd=.6;q.stun=q.lunge>0?.55:.3;if(q.lunge>0)q.lunge=0}
   break}}}
else{b.vy-=25*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;
if(b.y<.45){b.y=.22;b.vy=b.vy<-3?-b.vy*.45:0}
if(b.y<.25){const k=hyp(b.vx,b.vz)>10?.52:.82,f=Math.max(0,1-k*dt);b.vx*=f;b.vz*=f}else{const f=Math.max(0,1-.1*dt);b.vx*=f;b.vz*=f}
const hs=hyp(b.vx,b.vz);let pick=null,pd=1e9;
for(const q of P){if(q.cd>0||q.off)continue;const d=hyp(q.x-b.x,q.z-b.z),r=q.gk?(q.dv>0?2.05:1.35):(q.id===S.rcv?1.7:1.05);
 if(d<r&&b.y<(q.gk?2.9:2.3)&&(q.gk||hs<22)&&d<pd&&!(q.gk&&hs>20&&S.roll>.6-.2*(d/r))){pd=d;pick=q}}
if(pick){const q=pick;
 if(S.offs){const f=S.offs;if(q.t!==f.t)S.offs=null;else if(!q.gk&&S.time-f.at<4&&S.lastT===q.t&&f.ids.includes(q.id)){S.st.offsides[q.t]++;S.ev.push({type:'offside',t:q.t,id:q.id});setPiece(S,'free',1-q.t,q.x,q.z,true);return}}
 if(q.gk){const sh=S.shot&&S.shot.t!==q.t;
  const parry=hs>15&&S.rng()<cl((hs-15)/17,0,.8);
  if(sh&&hs>9){S.st.sot[S.shot.t]++;S.shot=null}
  if(parry){q.cd=.45;S.st.saves++;S.lastT=q.t;const sg=Math.sign(b.z-q.z)||(S.rng()<.5?-1:1);b.vx=-Math.sign(b.x)*(3+S.rng()*5);b.vz=sg*(4+S.rng()*6);b.vy=2+S.rng()*3}
  else{S.owner=q.id;q.hold=0;S.rcv=-1;S.thru=null;S.cross=null;S.lastT=q.t;S.lastPass=null;S.st.saves+=hs>14?1:0}}
 else if(b.y>1.05&&hs>5){const dir=q.t?-1:1,gd=Math.abs(dir*L-q.x);q.jp=.5;
  if(gd<24&&S.lastT!==1-q.t||gd<16){const e=(S.rng()-.5)*5-q.z*.3;kick(S,q,dir*L-q.x,e,18+S.rng()*5,1+S.rng()*2);S.shot={t:q.t,time:S.time,id:++S.shotId};S.st.shots[q.t]++}
  else kick(S,q,dir*20,(S.rng()-.5)*22,16,6);q.cd=.5;S.cross=null}
 else if(hs>12&&S.rng()<((hs-12)/32)*(1.35-q.pc)){/* heavy first touch */b.vx*=.38;b.vz*=.38;b.vx+=(S.rng()-.5)*2;b.vz+=(S.rng()-.5)*2;q.cd=.22;S.rcv=-1}
 else{const lp=S.lastPass;if(lp){if(q.t===lp.t){if(q.id!==lp.from)S.st.passOK[q.t]++}else S.st.inter[q.t]++;S.lastPass=null}
  S.owner=q.id;q.hold=0;S.rcv=-1;S.thru=null;S.cross=null;S.lastT=q.t;S.shot=null;if(S.rs&&S.rs.taker!==q.id)S.rs=null}}}
own=S.owner>=0?P[S.owner]:null;
if(own&&(!isU(own)||(S.rs&&S.rs.taker===own.id&&S.time>S.rs.until)))aiCarrier(S,own,dt);
if(S.owner>=0)S.st.poss[P[S.owner].t]++;
if(Math.abs(b.x)>L&&Math.abs(b.z)<GW&&b.y<2.44){const t=b.x>0?0:1;S.st.goals[t]++;S.nextKickoff=1-t;if(S.shot){S.st.sot[S.shot.t]++}S.ev.push({type:'goal',t});return}
if(S.owner<0&&(Math.abs(b.x)>L+.3||Math.abs(b.z)>W+.3))outOfPlay(S)}
function act(S,k){const P=S.p;if(S.kickoff){startKick(S,k);return}const p=P[S.user];if(!p)return;const own=S.owner===p.id;
if(k===5){manualSwitch(S);return}
if(own){if(k===4)userThrough(S,p);else if(k===2)lob(S,p,true);else if(k===1)shoot(S,p,true);else userPass(S,p);return}
/* Defensive contextual actions: pressure (0), tackle (1), switch (2/4/5), clear (6). */
if(k===4){manualSwitch(S);return}
if(k===6){if(S.owner>=0&&P[S.owner].t!==p.t){p.lunge=.5;p.cd=Math.max(p.cd,0)}else if(S.owner<0&&hyp(S.ball.vx,S.ball.vz)>1){kick(S,p,p.t?-1:1,0,13,2);S.lastT=p.t}return}
if(k===1){const c=S.owner>=0&&P[S.owner].t!==p.t?P[S.owner]:null;
 if(c&&hyp(c.x-p.x,c.z-p.z)<2.1){p.tkw=.42;p.imm=.1}else{p.lunge=.46;p.imm=.12}return}
if(k===0){p.prs=1.1;p.tkw=Math.max(p.tkw,0);return}
if(k===2){manualSwitch(S);return}
p.lunge=.3}
const Sim={create,reset,step,act,setFormation,FORM,N,L,W};
if(typeof module!=='undefined'&&module.exports)module.exports=Sim;else root.Sim=Sim;
})(typeof window!=='undefined'?window:globalThis);
