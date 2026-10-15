(function(root){
'use strict';
const GW=3.65,L=55,W=36,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),hyp=Math.hypot;
const N=11,DEF=[[-30,-20],[-32,-7],[-32,7],[-30,20]];
const FORM={
'4-3-3':[[-46,0],...DEF,[-10,-12],[-12,0],[-10,12],[14,-18],[18,0],[14,18]],
'4-4-2':[[-46,0],...DEF,[-10,-22],[-12,-7],[-12,7],[-10,22],[14,-8],[14,8]],
'4-2-3-1':[[-46,0],...DEF,[-14,-8],[-14,8],[0,-18],[2,0],[0,18],[16,0]],
'3-5-2':[[-46,0],[-30,-12],[-32,0],[-30,12],[-14,-24],[-12,-10],[-8,0],[-12,10],[-14,24],[14,-8],[14,8]]};
function setFormation(S,t,name){const f=FORM[name];S.p.filter(p=>p.t===t).forEach((p,i)=>{p.hx=f[i][0]*1.1*(t?-1:1);p.hz=f[i][1]*1.06})}
function turn(a,b,m){const d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;return a+cl(d,-m,m)}
function create(o){
const S={roll:.5,thru:null,cross:null,rs:null,lock:0,lastT:-1,rcv:-1,time:0,p:[],ball:{x:0,y:.45,z:0,vx:0,vy:0,vz:0},owner:-1,user:-1,ev:[],diff:(o&&o.diff)||.9,mood:{sp:1,pw:1,op:1},stam:1,rng:Math.random,botUser:false,inp:{ix:0,iz:0,sprint:false},st:{goals:[0,0],shots:[0,0],passes:[0,0],poss:[0,0],saves:0,tackles:0,fouls:[0,0],yellows:[0,0],reds:[0,0],offsides:[0,0],pens:[0,0]},offs:null,pg:null,ol:[0,0],kickoff:null,nextKickoff:0};
for(let t=0;t<2;t++)for(let i=0;i<N;i++)S.p.push({id:t*N+i,t,gk:i===0,hx:0,hz:0,x:0,z:0,vx:0,vz:0,a:t?Math.PI:0,cd:0,imm:0,hold:0,dv:0,dd:1,gt:0,lunge:0,jp:0,kt:-9});
setFormation(S,0,'4-3-3');setFormation(S,1,'4-4-2');reset(S);return S}
function reset(S,team){S.offs=null;S.pg=null;team=team===0||team===1?team:(S.nextKickoff===0||S.nextKickoff===1?S.nextKickoff:0);S.nextKickoff=1-team;S.p.forEach(p=>{if(p.off)return;p.x=p.t?Math.max(p.hx,p.gk?p.hx:2.5):Math.min(p.hx,p.gk?p.hx:-2.5);p.z=p.hz;p.vx=p.vz=0;p.a=p.t?Math.PI:0;p.cd=p.imm=p.lunge=p.dv=p.hold=p.jp=0});
/* Proper centre kick-off: both sides start in their own half; only the taker and one nearby option occupy the centre area. */
for(const p of S.p){if(p.off)continue;if(p.t===team){p.x=team===0?Math.min(p.x,-1.2):Math.max(p.x,1.2)}else{p.x=team===0?Math.max(p.x,1.2):Math.min(p.x,-1.2)}}
const taker=S.p[team*N+9],support=S.p[team*N+10];taker.x=team===0?-.72:.72;taker.z=0;taker.vx=taker.vz=0;taker.a=team===0?0:Math.PI;support.x=team===0?-4:4;support.z=team===0?2.4:-2.4;support.vx=support.vz=0;
const b=S.ball;b.x=0;b.y=.22;b.z=0;b.vx=b.vy=b.vz=0;S.owner=-1;S.rs=null;S.thru=null;S.cross=null;S.rcv=-1;S.lastT=team;S.kickoff={team,taker:taker.id};S.user=taker.id}
function pickUser(S,force){const b=S.ball,P=S.p;
const ok=i=>i>=0&&P[i]&&P[i].t===0&&!P[i].gk&&!P[i].off;
if(S.owner>=0&&P[S.owner].t===0&&!P[S.owner].gk)return S.owner;
if(!force&&S.lock>S.time&&ok(S.user))return S.user;
const cur=ok(S.user)?S.user:-1;
/* Own pass in flight: stay on the passer until the ball is nearly at the receiver, then hand over once. */
if(S.owner<0&&ok(S.rcv)){const r=P[S.rcv];if(cur<0||hyp(r.x-b.x,r.z-b.z)<4.5)return S.rcv;return cur}
const px=b.x+b.vx*.25,pz=b.z+b.vz*.25;let best=-1,bd=1e9;
for(const p of P){if(p.t||p.gk||p.off)continue;const d=hyp(p.x-px,p.z-pz);if(d<bd){bd=d;best=p.id}}
if(!force&&cur>=0&&hyp(P[cur].x-px,P[cur].z-pz)<bd+7)return cur;return best}
function manualSwitch(S){const b=S.ball,i=S.inp,m=hyp(i.ix,i.iz);let best=-1,bs=1e9;
for(const p of S.p){if(p.t||p.gk||p.off||p.id===S.user)continue;let sc=hyp(p.x-b.x,p.z-b.z);
if(m>.3){const dx=p.x-S.p[S.user].x,dz=p.z-S.p[S.user].z,d=hyp(dx,dz)||1;sc+=(1-(dx*i.ix+dz*i.iz)/(d*m))*14}
if(sc<bs){bs=sc;best=p.id}}
if(best>=0){S.user=best;S.lock=S.time+2.5}}
const ppos=(S)=>{const b=S.ball;return{x:b.x+b.vx*.35,z:b.z+b.vz*.35}};
function chasers(S,t){const pp=ppos(S),ex=(t===0&&!S.botUser)?S.user:-1,dir=t?-1:1;
const l=S.p.filter(p=>p.t===t&&!p.gk&&!p.off&&p.id!==ex).map(p=>[hyp(p.x-pp.x,p.z-pp.z),p]).sort((a,c)=>a[0]-c[0]);
const r=[];if(l[0])r.push(l[0][1]);if(l[1]&&l[1][0]<16)r.push(l[1][1]);return r}
function nearOpp(S,p){let o=null,d=1e9;for(const q of S.p){if(q.t===p.t||q.gk||q.off)continue;const e=hyp(q.x-p.x,q.z-p.z);if(e<d){d=e;o=q}}return{o,d}}
function openness(S,q){let m=99;for(const o of S.p)if(o.t!==q.t){const d=hyp(o.x-q.x,o.z-q.z);if(d<m)m=d}return m}
function blocked(S,p,tx,tz){const ax=tx-p.x,az=tz-p.z,l2=ax*ax+az*az||1;for(const o of S.p){if(o.t===p.t)continue;
const t=cl(((o.x-p.x)*ax+(o.z-p.z)*az)/l2,0,1);if(hyp(p.x+ax*t-o.x,p.z+az*t-o.z)<1.7)return true}return false}
function offList(S,p){const rs=S.rs;if(rs&&(rs.kind==='throw'||rs.kind==='goalkick'||rs.kind==='corner'))return null;const dir=p.t?-1:1,bx=S.ball.x*dir,ds=S.p.filter(q=>q.t!==p.t&&!q.off).map(q=>q.x*dir).sort((a,c)=>c-a),ln=Math.max(ds[1]===undefined?0:ds[1],bx,0),ids=[];
for(const q of S.p)if(q.t===p.t&&q!==p&&!q.gk&&!q.off&&q.x*dir>ln+.35)ids.push(q.id);return ids.length?{t:p.t,ids,at:S.time}:null}
function kick(S,p,dx,dz,sp,vy){const l=hyp(dx,dz)||1,b=S.ball;S.offs=offList(S,p);b.vx=dx/l*sp;b.vz=dz/l*sp;b.vy=vy;S.owner=-1;p.cd=.4;p.hold=0;p.kt=S.time;S.lastT=p.t;S.rcv=-1;S.rs=null;S.roll=S.rng()}
function shoot(S,p,user){const dir=p.t?-1:1,gk=S.p.find(q=>q.gk&&q.t!==p.t),inp=S.inp,pen=!!(S.rs&&S.rs.kind==='pen');
let tz=gk.z>0?-2.7:2.7;if(Math.abs(p.z)>9)tz=-Math.sign(p.z)*2.5;
if(pen)tz=user&&hyp(inp.ix,inp.iz)>.3?cl(inp.iz*3.2,-3.2,3.2):(S.rng()<.5?-1:1)*(1.8+S.rng()*.8);
let dx=dir*L-p.x,dz=tz-p.z;
if(user&&!pen){const m=hyp(inp.ix,inp.iz),l=hyp(dx,dz);if(m>.3){if((inp.ix*dx+inp.iz*dz)/(l*m)<.55){dx=inp.ix;dz=inp.iz}}
else if((Math.cos(p.a)*dx+Math.sin(p.a)*dz)/l<.5){dx=Math.cos(p.a);dz=Math.sin(p.a)}}
else if(!user){const e=(S.rng()-.5)*.3*(1.5-(p.t?S.diff:1)),c=Math.cos(e),s=Math.sin(e);const x=dx*c-dz*s;dz=dx*s+dz*c;dx=x}
kick(S,p,dx,dz,pen?(user?23:22):(user?23*S.mood.pw:20+S.rng()*3),pen?0.8+S.rng()*1.1:0.7+S.rng()*2);if(pen)S.pg={z:S.rng()<.3?tz:(S.rng()<.5?-2.6:2.6),t:S.time};S.st.shots[p.t]++}
function lead(p,q,k,c){let d=hyp(q.x-p.x,q.z-p.z),t=0,tx=q.x,tz=q.z;for(let i=0;i<4;i++){const sp=cl(d*k+c,9,21);t=Math.min(1.5,d/(sp*.82));tx=q.x+q.vx*t;tz=q.z+q.vz*t;d=hyp(tx-p.x,tz-p.z)}return[tx,tz]}
function passTo(S,p,q,user){const ld=lead(p,q,.88,5.5);let tx=ld[0],tz=ld[1];
let dx=tx-p.x,dz=tz-p.z;if(!user){const e=(S.rng()-.5)*.22*(1.4-(p.t?S.diff:1)),c=Math.cos(e),s=Math.sin(e),x=dx*c-dz*s;dz=dx*s+dz*c;dx=x}
kick(S,p,dx,dz,cl(hyp(dx,dz)*0.88+5.5,9,20),0);S.rcv=q.id;S.st.passes[p.t]++}
function userPass(S,p){const inp=S.inp,m=hyp(inp.ix,inp.iz),fx=m>.3?inp.ix/m:Math.cos(p.a),fz=m>.3?inp.iz/m:Math.sin(p.a);
let best=null,bs=-9;for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<2.5)continue;
const c=(dx*fx+dz*fz)/d,sc=c-d*.012-(blocked(S,p,q.x,q.z)?0.85:0);if(c>.4&&sc>bs){bs=sc;best=q}}
if(best)passTo(S,p,best,true);else{kick(S,p,fx,fz,16,0);S.st.passes[p.t]++}}
function throughTo(S,p,q,user){const dir=p.t?-1:1,tx=cl(q.x+q.vx*.9+dir*10,-L+4,L-4),tz=cl(q.z+q.vz*.5,-W+6,W-6);let dx=tx-p.x,dz=tz-p.z;
if(!user){const e=(S.rng()-.5)*.2*(1.4-(p.t?S.diff:1)),c=Math.cos(e),sn=Math.sin(e),x=dx*c-dz*sn;dz=dx*sn+dz*c;dx=x}
kick(S,p,dx,dz,cl(hyp(dx,dz)*0.9+5.5,10,21),0);S.rcv=q.id;S.thru={x:tx,z:tz,t:S.time+1.8,id:q.id};S.st.passes[p.t]++}
function userThrough(S,p){const inp=S.inp,m=hyp(inp.ix,inp.iz),dir=p.t?-1:1,fx=m>.3?inp.ix/m:dir,fz=m>.3?inp.iz/m:0;let best=null,bs=-9;
for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<6)continue;const c=(dx*fx+dz*fz)/d,sc=c+(q.x-p.x)*dir*.02;if(c>.3&&sc>bs){bs=sc;best=q}}
if(best)throughTo(S,p,best,true);else userPass(S,p)}
function lobTo(S,p,tx,tz,cross){const dx=tx-p.x,dz=tz-p.z;kick(S,p,dx,dz,Math.min(25,hyp(dx,dz)/1.25),12);S.st.passes[p.t]++;
if(cross)S.cross={x:tx,z:tz,t:S.time+1,tm:p.t}}
function lob(S,p,user){const dir=p.t?-1:1;
if(Math.abs(p.z)>15&&p.x*dir>24){lobTo(S,p,dir*(L-9),(S.rng()-.5)*7-Math.sign(p.z)*2,true);return}
let fx=Math.cos(p.a),fz=Math.sin(p.a);if(user){const m=hyp(S.inp.ix,S.inp.iz);if(m>.3){fx=S.inp.ix/m;fz=S.inp.iz/m}}
let best=null,bs=-9;for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<14)continue;const sc=(dx*fx+dz*fz)/d;if(sc>bs){bs=sc;best=q}}
if(best)lobTo(S,p,best.x+best.vx*.8,best.z+best.vz*.8);else lobTo(S,p,cl(p.x+fx*30,-L+2,L-2),cl(p.z+fz*30,-W+2,W-2))}
function bestPass(S,p){const dir=p.t?-1:1;let best=null,bs=-99;for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;
const d=hyp(q.x-p.x,q.z-p.z);if(d<4||d>34)continue;let sc=(q.x-p.x)*dir*.09+Math.min(openness(S,q),9)*.32-d*.03;if(blocked(S,p,q.x,q.z))sc-=9;if(sc>bs){bs=sc;best=q}}
return{q:best,sc:bs}}
function decide(S,p,dt){const dir=p.t?-1:1,gd=Math.abs(dir*L-p.x),df=p.t?S.diff:1,near=nearOpp(S,p);p.hold+=dt;
if(S.rs&&S.rs.taker===p.id&&p.hold<1.1)return;
if(p.gk){if(p.hold>1.15){const b=bestPass(S,p);if(b.q&&!blocked(S,p,b.q.x,b.q.z))passTo(S,p,b.q,false);else lobTo(S,p,p.x+dir*26,(S.rng()-.5)*20)}return}
if(gd<32&&!(S.rs&&S.rs.ind)&&p.hold>.18+(1-df)*.7&&(gd<22||!blocked(S,p,dir*L,0)||near.d<4.5)){shoot(S,p,false);return}
if(Math.abs(p.z)>15&&gd<30&&p.hold>.3+(1-df)*.5){lob(S,p,false);return}
if(p.hold>.65&&S.rng()<dt*1.15){let r=null,rs=0;for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;const fw=(q.x-p.x)*dir;if(fw<9||fw>36)continue;const o=openness(S,q);if(o<5||blocked(S,p,q.x+dir*8,q.z))continue;const sc=fw*.1+o*.3;if(sc>rs){rs=sc;r=q}}
if(r){throughTo(S,p,r,false);return}}
const b=bestPass(S,p);if(b.q&&((near.d<4.5&&b.sc>-1)||(p.hold>1.35&&b.sc>.2)||p.hold>2.7))passTo(S,p,b.q,false)}
function gkMove(S,p,own){const gs=p.t?1:-1,b=S.ball,gl=gs*(L-4.5),db=hyp(b.x-gl,b.z),hs=hyp(b.vx,b.vz);
if(S.rs&&S.rs.kind==='pen'&&p.t!==S.rs.t)return[gs*(L-2.2),0,6];
let tx=gl-gs*cl((34-db)*.1,0,3.2),tz=cl(b.z*.32,-5.5,5.5),spd=7;
if(p.dv>0)return[gs*(L-3.5),cl(p.gt,-5.5,5.5),15];
if(!own&&b.vx*gs>7&&Math.abs(b.x-gl)<32){const t=(gs*L-b.x)/b.vx,pz=b.z+b.vz*t,py=b.y+b.vy*t-12.5*t*t;
if(py<2.8&&Math.abs(pz)<GW+2.5){p.gt=pz+(S.rng()-.5)*1.7*(1.55-(p.t?S.diff:1));if(S.pg&&S.time-S.pg.t<1.5)p.gt=S.pg.z;p.dd=Math.sign(p.gt-p.z)||1;
if(Math.abs(p.gt-p.z)>1.1&&t<.75&&p.cd<=0){p.dv=.8;p.jp=0}
tz=cl(p.gt,-5.5,5.5);tx=gs*(L-3.8);spd=9.2}}
else if(!own&&Math.abs(b.x-gl)<17&&Math.abs(b.z)<13&&hs<11&&hyp(p.x-b.x,p.z-b.z)<12){tx=b.x;tz=b.z;spd=9}
return[tx,tz,spd]}
function crossRole(S,p){const c=S.cross;if(!c||S.time>c.t+1.2||p.gk)return false;
const l=S.p.filter(q=>!q.gk&&q.t===p.t).map(q=>[hyp(q.x-c.x,q.z-c.z),q]).sort((a,b)=>a[0]-b[0]);return l.slice(0,p.t===c.tm?3:2).some(e=>e[1]===p)}
function aiMove(S,p,ch,own){const dir=p.t?-1:1,b=S.ball,P=S.p,df=p.t?S.diff*S.mood.op:1,hs=hyp(b.vx,b.vz);
const poss=own?own.t:(S.lastT>=0&&S.rcv>=0&&P[S.rcv].t===S.lastT?S.lastT:-1),mine=poss===p.t;
let tx=p.hx,tz=p.hz,spd=6.4*df;
if(p.gk)return gkMove(S,p,own);
if(S.rs&&S.rs.kind==='pen'&&p.id!==S.rs.taker){const gx=S.rs.gx;return[gx*Math.min(gx*p.x,L-23.5),p.z,p.x*gx>L-22?9:4]}
if(S.rs&&p.t!==S.rs.t){const d=hyp(p.x-b.x,p.z-b.z);if(d<10){tx=p.x+(p.x-b.x)/(d||1)*6;tz=p.z+(p.z-b.z)/(d||1)*6;return[cl(tx,-L+1,L-1),cl(tz,-W+1,W-1),7]}}
if(own===p){tx=dir*L;tz=Math.abs(p.z)>14&&Math.abs(dir*L-p.x)<32?p.z*.8:0;const o=nearOpp(S,p);if(o.o&&o.d<7&&(o.o.x-p.x)*dir>-1){tz=cl(p.z+(Math.sign(p.z-o.o.z)||1)*7,-W+3,W-3);tx=p.x+dir*10}spd*=.97}
else if(S.thru&&S.time<S.thru.t&&p.id===S.thru.id){tx=S.thru.x;tz=S.thru.z;spd*=1.25}
else if(p.id===S.rcv&&S.owner<0){tx=b.x+b.vx*.3;tz=b.z+b.vz*.3;spd*=1.15}
else if(crossRole(S,p)){tx=S.cross.x+(p.t===S.cross.tm?0:dir*-1.5);tz=S.cross.z+(p.id%3-1)*2.2;spd*=1.2}
else if(!mine&&ch[p.t].includes(p)){const first=ch[p.t][0]===p;tx=b.x+b.vx*.3;tz=b.z+b.vz*.3;spd*=first?1.14:1;
if(!first){tx=b.x-dir*4;tz=b.z*.9;spd*=.95}
if(own&&hyp(own.x-p.x,own.z-p.z)<3.4){spd=Math.min(spd*1.1,hyp(own.vx,own.vz)*1.1+1.6);tx=own.x+own.vx*.2;tz=own.z+own.vz*.2}}
else{const att=mine,line=p.hx*dir<-12,push=att?(line?9:14):(line?-2:-5);
tx=p.hx+dir*push+cl((b.x-p.hx)*(att?.22:.4),-18,18);tz=p.hz*(att?1.1:.78)+(b.z-p.hz)*(att?.15:.3);
if(!att&&line)tx=dir>0?Math.min(tx,b.x-3):Math.max(tx,b.x+3);
if(att&&p.hx*dir>0){const ref=own||b;tx=dir>0?Math.max(tx,ref.x+6):Math.min(tx,ref.x-6);tz+=Math.sin(S.time*.7+p.id)*3}
if(att)tx=dir*Math.min(tx*dir,Math.max(S.ol[p.t],b.x*dir)-.8);
if(!att){let o=null,d=15;for(const q of P){if(q.t===p.t||q.gk||q===own)continue;const e=hyp(q.x-tx,q.z-tz);if(e<d){d=e;o=q}}
if(o){tx=(tx+o.x-dir*3)/2;tz=(tz+o.z)/2}}
if(!mine&&S.owner<0&&hs>7&&S.lastT!==p.t){const t0=Math.min(1.4,Math.abs(b.vx)>0?(L-Math.abs(b.x))/Math.abs(b.vx):1.4),sx=b.vx*t0,sz=b.vz*t0,l2=sx*sx+sz*sz||1,
k=cl(((p.x-b.x)*sx+(p.z-b.z)*sz)/l2,.15,1),ix=b.x+sx*k,iz=b.z+sz*k;if(hyp(ix-p.x,iz-p.z)<10){tx=ix;tz=iz;spd*=1.25}}}
if(own!==p&&!ch[p.t].includes(p))for(const q of P){if(q===p||q.t!==p.t||q.gk||q.off)continue;const d=hyp(q.x-p.x,q.z-p.z);if(d<6&&d>.1){tx+=(p.x-q.x)/d*(6-d)*.6;tz+=(p.z-q.z)/d*(6-d)*.6}}
return[cl(tx,-L+2,L-2),cl(tz,-W+2,W-2),spd]}
function outOfPlay(S){const b=S.ball,P=S.p,lt=S.lastT<0?0:S.lastT;let t,x,z,kind;
if(Math.abs(b.z)>W&&Math.abs(b.x)<=L){kind='throw';t=1-lt;x=cl(b.x,-L+3,L-3);z=Math.sign(b.z)*W}
else{const e=Math.sign(b.x)||1,defT=e>0?1:0;if(lt===defT){kind='corner';t=1-defT;x=e*(L-.6);z=(Math.sign(b.z)||1)*(W-.6)}else{kind='goalkick';t=defT;x=e*(L-5.5);z=0}}
let tk=null,bd=1e9;for(const p of P){if(p.t!==t||p.off||(kind==='goalkick')!==p.gk)continue;const d=hyp(p.x-x,p.z-z);if(d<bd){bd=d;tk=p}}
b.x=x;b.z=z;b.y=.22;b.vx=b.vy=b.vz=0;tk.x=x-Math.sign(x)*.8*(kind==='goalkick'?0:1)*(kind==='throw'?0:1);tk.z=z-(kind==='throw'?Math.sign(z)*.8:0);tk.vx=tk.vz=0;tk.a=Math.atan2(-tk.z,-tk.x);
tk.imm=1.3;tk.cd=0;tk.hold=0;S.owner=tk.id;S.rcv=-1;S.thru=null;S.cross=null;S.offs=null;S.lastT=t;S.rs={kind,t,taker:tk.id,until:S.time+6};
if(t===0&&!tk.gk)S.user=tk.id;S.ev.push({type:'restart',kind,t})}
function setPiece(S,kind,t,x,z,ind,victim){const dir=t?-1:1,b=S.ball;x=cl(x,-L+1,L-1);z=cl(z,-W+1,W-1);
let tk=null,bd=1e9;if(kind==='pen'&&victim&&!victim.gk&&!victim.off)tk=victim;
if(!tk)for(const p of S.p){if(p.t!==t||p.gk||p.off)continue;const d=hyp(p.x-x,p.z-z);if(d<bd){bd=d;tk=p}}
b.x=x;b.z=z;b.y=.22;b.vx=b.vy=b.vz=0;tk.x=x-dir*.9;tk.z=z;tk.vx=tk.vz=0;tk.a=Math.atan2(-z,dir*L-x);
tk.imm=1.3;tk.cd=0;tk.hold=0;S.owner=tk.id;S.rcv=-1;S.thru=null;S.cross=null;S.offs=null;S.lastT=t;
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
function step(S,dt,inp){
S.ev.length=0;if(inp)S.inp=inp;S.time+=dt;
const P=S.p,b=S.ball;if(S.kickoff)return;let own=S.owner>=0?P[S.owner]:null;
if(!S.botUser){const nu=pickUser(S);if(nu!==S.user&&S.user>=0)S.lock=Math.max(S.lock,S.time+.9);S.user=nu}
S.ol=[0,1].map(t=>{const dir=t?-1:1,ds=P.filter(q=>q.t!==t&&!q.off).map(q=>q.x*dir).sort((a,c)=>c-a);return Math.max(ds[1]===undefined?0:ds[1],0)});
const ch=[chasers(S,0),chasers(S,1)],isU=p=>!S.botUser&&p.id===S.user;
for(const p of P){if(p.off)continue;p.cd-=dt;p.imm-=dt;p.dv-=dt;p.lunge-=dt;p.jp-=dt;let wx=0,wz=0;
if(isU(p)){const i=S.inp,m=hyp(i.ix,i.iz),ix=m>1?i.ix/m:i.ix,iz=m>1?i.iz/m:i.iz;
const sr=i.sprint&&S.stam>.02&&m>.1;S.stam=sr?S.stam-dt*.2:Math.min(1,S.stam+dt*.1);
const sp=6.8*S.mood.sp*(sr?1.34:1)*(p.lunge>0?1.7:1)*(own===p?.97:1);wx=ix*sp;wz=iz*sp}
else{const t=aiMove(S,p,ch,own),dx=t[0]-p.x,dz=t[1]-p.z,d=hyp(dx,dz);if(d>.6){const s=t[2]*Math.min(1,d/3);wx=dx/d*s;wz=dz/d*s}
if(own&&own.t!==p.t&&!p.gk&&p.cd<=0&&p.lunge<=0&&ch[p.t][0]===p&&hyp(own.x-p.x,own.z-p.z)<2.5&&S.rng()<dt*1.4*(p.t?S.diff:1))p.lunge=.35}
let ax=wx-p.vx,az=wz-p.vz;const l=hyp(ax,az),mx=(p.dv>0?55:34)*dt;if(l>mx){ax*=mx/l;az*=mx/l}p.vx+=ax;p.vz+=az;
p.x=cl(p.x+p.vx*dt,-L-3,L+3);p.z=cl(p.z+p.vz*dt,-W-2,W+2);
if(hyp(p.vx,p.vz)>.8)p.a=turn(p.a,Math.atan2(p.vz,p.vx),16*dt)}
if(own){const o=own,sp=hyp(o.vx,o.vz),off=.9+.2*Math.min(sp/9,1);b.x=o.x+Math.cos(o.a)*off;b.z=o.z+Math.sin(o.a)*off;b.y=.22;b.vx=o.vx;b.vz=o.vz;b.vy=0;
for(const q of P){if(q.t===o.t||q.off||q.cd>0||o.imm>0)continue;if(hyp(q.x-o.x,q.z-o.z)<(q.lunge>0?1.9:1.3)){
const pr=2.1*(q.t?S.diff:1)*(isU(q)?2:1)*(q.lunge>0?2.4:1)*(1-Math.min(sp/13,.5));if(S.rng()<dt*pr){const win=S.rng()<.55,bh=(o.x-q.x)*Math.cos(o.a)+(o.z-q.z)*Math.sin(o.a)>.5,fp=(win?.04:.22)*(q.lunge>0?2.3:1)*(bh?1.8:1);if(S.rng()<fp){foul(S,q,o,bh);return}S.st.tackles++;o.cd=.7;if(win){S.owner=q.id;q.hold=0;S.rcv=-1;S.thru=null;S.rs=null;S.lastT=q.t}else{b.vx=Math.cos(q.a)*6;b.vz=Math.sin(q.a)*6;b.vy=1.5;S.owner=-1;S.rs=null}break}}}}
else{b.vy-=25*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;
if(b.y<.45){b.y=.22;b.vy=b.vy<-3?-b.vy*.45:0}
if(b.y<.25){const k=hyp(b.vx,b.vz)>10?.52:.82,f=Math.max(0,1-k*dt);b.vx*=f;b.vz*=f}
const hs=hyp(b.vx,b.vz);let pick=null,pd=1e9;
for(const q of P){if(q.cd>0||q.off)continue;const d=hyp(q.x-b.x,q.z-b.z),r=q.gk?(q.dv>0?2.4:1.45):(q.id===S.rcv?1.7:1.05);
if(d<r&&b.y<(q.gk?2.9:2.3)&&(q.gk||hs<22)&&d<pd&&!(q.gk&&hs>20&&S.roll>.6-.2*(d/r))){pd=d;pick=q}}
if(pick){const q=pick;
if(S.offs){const f=S.offs;if(q.t!==f.t)S.offs=null;else if(!q.gk&&S.time-f.at<4&&S.lastT===q.t&&f.ids.includes(q.id)){S.st.offsides[q.t]++;S.ev.push({type:'offside',t:q.t,id:q.id});setPiece(S,'free',1-q.t,q.x,q.z,true);return}}
if(q.gk){if(hs>22&&S.rng()>.55){q.cd=.4;S.st.saves++;S.lastT=q.t;if(S.rng()<.4){b.vx=Math.sign(b.x)*7;b.vz=(b.z>=0?1:-1)*(6+S.rng()*4);b.vy=3}else{b.vx*=-.35;b.vz+=(S.rng()-.5)*10}}else{S.owner=q.id;q.hold=0;S.rcv=-1;S.thru=null;S.cross=null;S.lastT=q.t;S.st.saves+=hs>14?1:0}}
else if(b.y>1.05&&hs>5){const dir=q.t?-1:1,gd=Math.abs(dir*L-q.x);q.jp=.5;
if(gd<24&&S.lastT!==1-q.t||gd<16){kick(S,q,dir*L-q.x,(S.rng()-.5)*5-q.z*.3,18+S.rng()*5,1+S.rng()*2);S.st.shots[q.t]++}
else kick(S,q,dir*20,(S.rng()-.5)*22,16,6);q.cd=.5;S.cross=null}
else if(hs>12&&S.rng()<(hs-14)/40){b.vx*=.4;b.vz*=.4;q.cd=.3}
else{S.owner=q.id;q.hold=0;S.rcv=-1;S.thru=null;S.cross=null;S.lastT=q.t;if(S.rs&&S.rs.taker!==q.id)S.rs=null}}}
own=S.owner>=0?P[S.owner]:null;
if(own&&(!isU(own)||(S.rs&&S.rs.taker===own.id&&S.time>S.rs.until)))decide(S,own,dt);
if(S.owner>=0)S.st.poss[P[S.owner].t]++;
if(Math.abs(b.x)>L&&Math.abs(b.z)<GW&&b.y<2.44){const t=b.x>0?0:1;S.st.goals[t]++;S.nextKickoff=1-t;S.ev.push({type:'goal',t});return}
if(S.owner<0&&(Math.abs(b.x)>L+.3||Math.abs(b.z)>W+.3))outOfPlay(S)}
function act(S,k){const P=S.p;if(S.kickoff){const taker=P[S.kickoff.taker];if(!taker)return;S.user=taker.id;S.owner=taker.id;S.kickoff=null;taker.hold=0;if(k===1)shoot(S,taker,true);else if(k===2)lob(S,taker,true);else if(k===4)userThrough(S,taker);else userPass(S,taker);return}const p=P[S.user];if(!p)return;const own=S.owner===p.id;
if(k===5){manualSwitch(S);return}
if(own){if(k===4)userThrough(S,p);else if(k===2)lob(S,p,true);else if(k===1)shoot(S,p,true);else userPass(S,p);return}
/* Defensive contextual actions: pressure, tackle, switch, clear. */
if(k===4){manualSwitch(S);return}
if(k===6){if(S.owner>=0&&P[S.owner].t!==p.t){p.lunge=.5;p.cd=Math.max(p.cd,0)}else if(S.owner<0&&hyp(S.ball.vx,S.ball.vz)>1){kick(S,p,p.t?-1:1,0,13,2);S.lastT=p.t}return}
if(k===1){p.lunge=.48;p.imm=.12;return}
if(k===0){p.lunge=.25;p.imm=.08;return}
if(k===2){manualSwitch(S);return}
p.lunge=.3}
const Sim={create,reset,step,act,setFormation,FORM,N,L,W};
if(typeof module!=='undefined'&&module.exports)module.exports=Sim;else root.Sim=Sim;
})(typeof window!=='undefined'?window:globalThis);
