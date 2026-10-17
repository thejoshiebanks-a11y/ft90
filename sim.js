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
 S.p.filter(p=>p.t===t).forEach((p,i)=>{p.hx=f[i][0]*1.1*(t?-1:1);p.hz=f[i][1]*1.06;p.role=roleOf(f[i][0])});
 const m={D:[0,0],M:[0,0],F:[0,0]};S.p.forEach(p=>{if(p.t===t&&m[p.role]){m[p.role][0]+=p.hx*(t?-1:1);m[p.role][1]++}});S.hxm=S.hxm||[{},{}];S.hxm[t]={D:m.D[1]?m.D[0]/m.D[1]:-30,M:m.M[1]?m.M[0]/m.M[1]:-8,F:m.F[1]?m.F[0]/m.F[1]:15}}
function turn(a,b,m){const d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;return a+cl(d,-m,m)}
function create(o){
const rg=()=>Math.random();
const S={roll:.5,thru:null,cross:null,rs:null,lock:0,lastT:-1,rcv:-1,time:0,p:[],ball:{x:0,y:.45,z:0,vx:0,vy:0,vz:0},owner:-1,user:-1,ev:[],diff:(o&&o.diff)||.9,mood:{sp:1,pw:1,op:1},stam:1,rng:Math.random,botUser:false,career:!!(o&&o.career),hero:-1,call:{t:-9,kind:''},hxm:[{},{}],inp:{ix:0,iz:0,sprint:false},
 st:{goals:[0,0],shots:[0,0],sot:[0,0],passes:[0,0],passOK:[0,0],inter:[0,0],poss:[0,0],saves:0,tackles:0,fouls:[0,0],yellows:[0,0],reds:[0,0],offsides:[0,0],pens:[0,0]},
 offs:null,pg:null,ol:[0,0],kickoff:null,nextKickoff:0,form:['4-3-3','4-4-2'],plan:[{press:[],sup:[],run:[],mk:{},chase:null,chase2:null},{press:[],sup:[],run:[],mk:{},chase:null,chase2:null}],pt:0,shot:null,shotId:0,lastPass:null,kickT:-9,lkid:-1};
for(let t=0;t<2;t++)for(let i=0;i<N;i++)S.p.push({id:t*N+i,t,gk:i===0,role:'M',hx:0,hz:0,x:0,z:0,vx:0,vz:0,a:t?Math.PI:0,cd:0,imm:0,hold:0,dv:0,dd:1,gt:0,lunge:0,jp:0,kt:-9,
 thk:0,tkw:0,prs:0,stun:0,dph:0,mk:-1,dx:t?-1:1,dz:0,seen:0,tc:0,skcd:0,sk:null,skt:-9,skd:0,vol:0,ttime:-9,tpar:0,hdt:-9,hd:.84+rg()*.3,
 spd:.96+rg()*.1,pa:.86+rg()*.22,sh:.84+rg()*.26,ta:.86+rg()*.22,dr:.84+rg()*.26,pc:.86+rg()*.22,re:.11+rg()*.13});
S.p.forEach(p=>{if(p.gk)gkInit(p)});S.hero=S.career?(o.heroIdx>0?o.heroIdx:9):-1;setFormation(S,0,'4-3-3');setFormation(S,1,'4-4-2');reset(S);return S}
function reset(S,team){S.offs=null;S.pg=null;S.shot=null;S.lastPass=null;
team=team===0||team===1?team:(S.nextKickoff===0||S.nextKickoff===1?S.nextKickoff:0);S.nextKickoff=1-team;
S.p.forEach(p=>{if(p.off)return;p.x=p.t?Math.max(p.hx,p.gk?p.hx:2.5):Math.min(p.hx,p.gk?p.hx:-2.5);p.z=p.hz;p.vx=p.vz=0;p.a=p.t?Math.PI:0;p.cd=p.imm=p.lunge=p.dv=p.hold=p.jp=p.tkw=p.prs=p.stun=0;p.thk=.2;p.mk=-1;p.dx=p.t?-1:1;p.dz=0;p.seen=0;if(p.gk)gkReset(p)});
for(const p of S.p){if(p.off)continue;if(p.t===team){p.x=team===0?Math.min(p.x,-1.2):Math.max(p.x,1.2)}else{p.x=team===0?Math.max(p.x,1.2):Math.min(p.x,-1.2)}}
const taker=S.p[team*N+9],support=S.p[team*N+10];taker.x=team===0?-.72:.72;taker.z=0;taker.vx=taker.vz=0;taker.a=team===0?0:Math.PI;support.x=team===0?-4:4;support.z=team===0?2.4:-2.4;support.vx=support.vz=0;
const b=S.ball;b.x=0;b.y=.22;b.z=0;b.vx=b.vy=b.vz=0;S.owner=-1;S.rs=null;S.thru=null;S.cross=null;S.rcv=-1;S.lastT=team;S.kickoff={team,taker:taker.id,at:S.time};S.user=S.career&&S.hero>=0?S.hero:taker.id;S.pt=0}
/* ---------------- helpers ---------------- */
function pickUser(S,force){const b=S.ball,P=S.p;
if(S.career&&S.hero>=0&&P[S.hero]&&!P[S.hero].off)return S.hero;
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
function manualSwitch(S){if(S.career)return;const b=S.ball,i=S.inp,m=hyp(i.ix,i.iz);let best=-1,bs=1e9;
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
function kick(S,p,dx,dz,sp,vy){const l=hyp(dx,dz)||1,b=S.ball;S.offs=offList(S,p);b.vx=dx/l*sp;b.vz=dz/l*sp;b.vy=vy;S.owner=-1;p.cd=.4;p.hold=0;p.kt=S.time;S.lastT=p.t;S.rcv=-1;S.rs=null;S.roll=S.rng();S.lastPass=null;p.thk=.25;S.kickT=S.time;S.lkid=p.id;b.curve=0;p.ttime=S.time}
function shotQ(S,p){const dir=p.t?-1:1,gx=dir*L,dx=Math.abs(gx-p.x);if(dx>33)return 0;
const ang=Math.abs(Math.atan2(GW-p.z,dx)-Math.atan2(-GW-p.z,dx));let q=Math.pow(Math.min(ang/.62,1.2),1.5)*.5;
const ax=gx-p.x,az=-p.z,l2=ax*ax+az*az||1;let bl=0;
for(const o of S.p){if(o.t===p.t||o.off||o.gk)continue;const t=cl(((o.x-p.x)*ax+(o.z-p.z)*az)/l2,0,1);if(t<.08)continue;if(hyp(p.x+ax*t-o.x,p.z+az*t-o.z)<1.35)bl++}
return q*Math.pow(.6,bl)}
function shoot(S,p,user,pw){const dir=p.t?-1:1,gk=S.p.find(q=>q.gk&&q.t!==p.t),inp=S.inp,pen=!!(S.rs&&S.rs.kind==='pen');
const gdx=Math.abs(dir*L-p.x),ch=pw===undefined?.4:pw;
let tz=gk.z>0?-2.75:2.75;if(Math.abs(p.z)>9)tz=-Math.sign(p.z)*2.55;
tz+=(S.rng()-.5)*.7;
if(pen)tz=user&&hyp(inp.ix,inp.iz)>.3?cl(inp.iz*3.2,-3.2,3.2):(S.rng()<.5?-1:1)*(1.8+S.rng()*.8);
let dx=dir*L-p.x,dz=tz-p.z;
if(user&&!pen){const m=hyp(inp.ix,inp.iz),l=hyp(dx,dz);if(m>.3){if((inp.ix*dx+inp.iz*dz)/(l*m)<.55){dx=inp.ix;dz=inp.iz}else{tz=cl(p.z*.2+inp.iz*3.1,-3.3,3.3);dz=tz-p.z}}
else if((Math.cos(p.a)*dx+Math.sin(p.a)*dz)/l<.5){dx=Math.cos(p.a);dz=Math.sin(p.a)}
if(ch>.72){const e=(S.rng()-.5)*(ch-.72)*1.1,c=Math.cos(e),s=Math.sin(e),x=dx*c-dz*s;dz=dx*s+dz*c;dx=x}}
else if(!user){const e=(S.rng()-.5)*(.10+gdx*.007)*(1.7-(p.t?S.diff:1)*p.sh);const c=Math.cos(e),s=Math.sin(e);const x=dx*c-dz*s;dz=dx*s+dz*c;dx=x}
let power=pen?(user?23:22):(user?(21.5+Math.min(gdx,30)*.2)*S.mood.pw*(.8+.5*ch):(21+S.rng()*4+Math.min(gdx,30)*.1)*p.sh);
let vy=pen?0.8+S.rng()*1.1:(S.rng()<.12&&gdx<16?3.5+S.rng()*2:0.5+S.rng()*2);
/* finesse / curled shot: bends from the near side round towards the far post */
let curve=0;const far=gdx>14||Math.abs(p.z)>8;
if(!pen&&far&&gdx<36&&(user?(ch>=.28&&ch<=.7):S.rng()<.38)){const mag=3.4+S.rng()*1.8,sg=-(Math.sign(p.z)||(S.rng()<.5?1:-1));curve=sg*dir*mag;power*=.86;vy=1.2+S.rng()*1.4;
 const l=hyp(dx,dz)||1,T=l/power,lat=.5*curve*T*T,px=-dz/l,pz=dx/l;dx-=px*lat;dz-=pz*lat}
kick(S,p,dx,dz,power,vy);if(curve)S.ball.curve=curve;S.shot={t:p.t,time:S.time,id:++S.shotId};
if(pen)S.pg={z:S.rng()<.3?tz:(S.rng()<.5?-2.6:2.6),t:S.time};S.st.shots[p.t]++}
function lead(p,q,k,c){let d=hyp(q.x-p.x,q.z-p.z),t=0,tx=q.x,tz=q.z;for(let i=0;i<4;i++){const sp=cl(d*k+c,9,21);t=Math.min(1.5,d/(sp*.82));tx=q.x+q.vx*t;tz=q.z+q.vz*t;d=hyp(tx-p.x,tz-p.z)}return[tx,tz]}
function noisy(S,p,dx,dz,amp){const df=p.t?S.diff:1,pr=nearOpp(S,p).d,e=(S.rng()-.5)*amp*(1.5-df*p.pa)*(pr<3?1.5:1),c=Math.cos(e),s=Math.sin(e);return[dx*c-dz*s,dx*s+dz*c]}
function passTo(S,p,q,user,pw){const ld=lead(p,q,.88,5.5);let dx=ld[0]-p.x,dz=ld[1]-p.z;
if(!user){const n=noisy(S,p,dx,dz,.2);dx=n[0];dz=n[1]}
let sp=cl(hyp(dx,dz)*.95+6.5,10,22);
if(user&&pw!==undefined){const d=hyp(dx,dz),ideal=cl((d-8)/30,.1,.9),qu=1-Math.min(1,Math.abs(pw-ideal)*2.4);sp=cl(sp*(.8+.42*pw),9,26);const e=(1-qu)*.16*(S.rng()-.5)*2,c=Math.cos(e),s=Math.sin(e),x=dx*c-dz*s;dz=dx*s+dz*c;dx=x;if(qu>.84)S.ev.push({type:'perfect',kind:'pass'})}
kick(S,p,dx,dz,sp,0);S.rcv=q.id;S.st.passes[p.t]++;S.lastPass={t:p.t,from:p.id,to:q.id,time:S.time}}
function passTarget(S,p){const inp=S.inp,m=hyp(inp.ix,inp.iz),fx=m>.3?inp.ix/m:Math.cos(p.a),fz=m>.3?inp.iz/m:Math.sin(p.a);
let best=null,bs=-9;for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<2.5)continue;
const c=(dx*fx+dz*fz)/d,sc=c*1.2-d*.012-(blocked(S,p,q.x,q.z)?0.85:0)-(q.x*(p.t?-1:1)>S.ol[p.t]+.3?.35:0);if(c>.4&&sc>bs){bs=sc;best=q}}
return{q:best,fx,fz}}
function previewPass(S){const p=S.p[S.user];if(!p||S.owner!==p.id)return null;const r=passTarget(S,p);return{id:r.q?r.q.id:-1,fx:r.fx,fz:r.fz,x:r.q?r.q.x:p.x+r.fx*14,z:r.q?r.q.z:p.z+r.fz*14}}
function userPass(S,p,pw){const r=passTarget(S,p);if(r.q)passTo(S,p,r.q,true,pw);else{kick(S,p,r.fx,r.fz,16,0);S.st.passes[p.t]++}}
function throughTo(S,p,q,user,pw){const dir=p.t?-1:1,tx=cl(q.x+q.vx*.9+dir*10,-L+4,L-4),tz=cl(q.z+q.vz*.5,-W+6,W-6);let dx=tx-p.x,dz=tz-p.z;
if(!user){const n=noisy(S,p,dx,dz,.2);dx=n[0];dz=n[1]}
kick(S,p,dx,dz,cl(hyp(dx,dz)*.9+5.5,10,21)*(user&&pw!==undefined?.82+.4*pw:1),0);S.rcv=q.id;S.thru={x:tx,z:tz,t:S.time+1.8,id:q.id};S.st.passes[p.t]++;S.lastPass={t:p.t,from:p.id,to:q.id,time:S.time}}
function userThrough(S,p,pw){const inp=S.inp,m=hyp(inp.ix,inp.iz),dir=p.t?-1:1,fx=m>.3?inp.ix/m:dir,fz=m>.3?inp.iz/m:0;let best=null,bs=-9;
for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<6)continue;const c=(dx*fx+dz*fz)/d,sc=c+(q.x-p.x)*dir*.02+(q.vx*dir>2?.25:0);if(c>.3&&sc>bs){bs=sc;best=q}}
if(best)throughTo(S,p,best,true,pw);else userPass(S,p,pw)}
function lobTo(S,p,tx,tz,cross){let dx=tx-p.x,dz=tz-p.z;const dist=hyp(dx,dz)||1;let vy,T,sp,c=0,ax=dx,az=dz;
if(cross){vy=dist<14?11.3:12;T=(vy+Math.sqrt(vy*vy-100))/25;const corner=S.rs&&S.rs.kind==='corner';
 if((Math.abs(p.z)>10||corner)&&Math.abs(dx)>6){const sg=-(Math.sign(p.z)||1),mag=3+S.rng()*1.8;c=Math.sign(dx*sg)*mag;const lat=.5*c*T*T;ax=dx-(-dz/dist)*lat;az=dz-(dx/dist)*lat}
 sp=cl(hyp(ax,az)/T,10,29)}
else{vy=cl(dist*.24+3,6,14.5);T=2*vy/25;sp=cl(dist/T*.9,10,32)}
kick(S,p,ax,az,sp,vy);S.ball.curve=c;S.st.passes[p.t]++;
if(cross)S.cross={x:tx,z:tz,t:S.time+T*.7,tm:p.t};else S.lastPass={t:p.t,from:p.id,to:-1,time:S.time}}
function cornerKick(S,p,user){const rs=S.rs,sl=rs.sl||[];let tgt=null;
if(user){const m=hyp(S.inp.ix,S.inp.iz);if(m>.3){let bs=-9;for(const q of sl){const dx=q[0]-p.x,dz=q[1]-p.z,d=hyp(dx,dz)||1,sc=(dx*S.inp.ix+dz*S.inp.iz)/(d*m);if(sc>bs){bs=sc;tgt=q}}}else tgt=sl[2]}
else{const rt=rs.routine;if(rt===3&&rs.short!==undefined&&S.p[rs.short]){passTo(S,p,S.p[rs.short],false);return}tgt=sl[rt===0?0:rt===1?1:2]}
if(!tgt){const dir=p.t?-1:1;tgt=[dir*(L-9),0]}
lobTo(S,p,tgt[0]+(S.rng()-.5)*1.5,tgt[1]+(S.rng()-.5)*1.5,true)}
function cornerSetup(S,t,e,sz,tk){const att=S.p.filter(p=>p.t===t&&!p.gk&&!p.off&&p!==tk).sort((a,c)=>(c.x*e)-(a.x*e)),def=S.p.filter(p=>p.t!==t&&!p.gk&&!p.off);
const rt=S.rng()*4|0,ex=e*L,slots={};S.rs.routine=rt;S.rs.slots=slots;
const sl=[[ex-e*4.2,sz*3.4],[ex-e*4.6,-sz*3.8],[ex-e*11,-sz*.8],[ex-e*17,sz*6],[ex-e*16,-sz*9],[ex-e*7.5,sz*.4]];
if(rt===3){sl[3]=[ex-e*9,sz*(W-9)];}
S.rs.sl=sl;
const usedD=new Set();
att.slice(0,6).forEach((p,i)=>{slots[p.id]=sl[i];p.x=sl[i][0];p.z=sl[i][1];p.vx=p.vz=0;p.a=Math.atan2(-p.z,ex-p.x);if(rt===3&&i===3)S.rs.short=p.id;
 let bd=1e9,bq=null;for(const d of def){if(usedD.has(d.id))continue;const dd=hyp(d.x-p.x,d.z-p.z);if(dd<bd){bd=dd;bq=d}}
 if(bq){usedD.add(bq.id);const ux=ex-p.x,uz=-p.z,ul=hyp(ux,uz)||1,gx=p.x+ux/ul*1.5,gz=p.z+uz/ul*1.5;slots[bq.id]=[gx,gz];bq.x=gx;bq.z=gz;bq.vx=bq.vz=0}});
let k=0;for(const d of def){if(usedD.has(d.id))continue;if(k<2){const ps=[ex-e*.7,k?3.3:-3.3];slots[d.id]=ps;d.x=ps[0];d.z=ps[1];d.vx=d.vz=0;k++}}}
function boxTarget(S,p){const dir=p.t?-1:1;let best=null,bs=-9;
for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;const gd=Math.abs(dir*L-q.x);if(gd>22||Math.abs(q.z)>13)continue;const sc=Math.min(openness(S,q),8)-gd*.12;if(sc>bs){bs=sc;best=q}}
return best?[best.x+best.vx*.6,best.z+best.vz*.6]:[dir*(L-9),(S.rng()-.5)*7-Math.sign(p.z)*2]}
function lob(S,p,user){const dir=p.t?-1:1;
if(S.rs&&S.rs.kind==='corner'&&S.rs.slots){cornerKick(S,p,user);return}
if(Math.abs(p.z)>15&&p.x*dir>20){const t=boxTarget(S,p);lobTo(S,p,t[0],t[1],true);return}
let fx=Math.cos(p.a),fz=Math.sin(p.a);if(user){const m=hyp(S.inp.ix,S.inp.iz);if(m>.3){fx=S.inp.ix/m;fz=S.inp.iz/m}}
let best=null,bs=-9;for(const q of S.p){if(q===p||q.t!==p.t||q.gk||q.off)continue;const dx=q.x-p.x,dz=q.z-p.z,d=hyp(dx,dz);if(d<14)continue;const sc=(dx*fx+dz*fz)/d+Math.min(openness(S,q),8)*.04;if(sc>bs){bs=sc;best=q}}
if(best)lobTo(S,p,best.x+best.vx*.8,best.z+best.vz*.8);else lobTo(S,p,cl(p.x+fx*30,-L+2,L-2),cl(p.z+fz*30,-W+2,W-2))}
function skill(S,p,type){if(p.skcd>0||S.owner!==p.id||p.gk)return false;const b=S.ball,nd=nearOpp(S,p),hx=Math.cos(p.a),hz=Math.sin(p.a),side=S.rng()<.5?1:-1;
p.sk=type;p.skt=S.time;p.skd=.6;p.skcd=1.05;p.imm=Math.max(p.imm,.6);
if(type==='stepover'){b.vx+=-hz*side*1.1;b.vz+=hx*side*1.1;p.tc=.25}
else if(type==='roulette'){let sx=-hz,sz=hx;if(nd.o){const ox=nd.o.x-p.x,oz=nd.o.z-p.z;if(ox*sx+oz*sz>0){sx=-sx;sz=-sz}}b.vx=sx*4+p.vx*.4;b.vz=sz*4+p.vz*.4;p.vx=p.vx*.4+sx*3.4;p.vz=p.vz*.4+sz*3.4;p.tc=.32}
else if(type==='dragback'){b.vx=-hx*3.6;b.vz=-hz*3.6;p.vx*=.3;p.vz*=.3;p.tc=.22}
else{b.vx+=hx*4.5;b.vz+=hz*4.5;p.vx+=hx*2;p.vz+=hz*2;p.tc=.34}
for(const q of S.p){if(q.t===p.t||q.gk||q.off)continue;const d=hyp(q.x-p.x,q.z-p.z);if(d<3.3&&S.rng()<.62*p.dr/(q.ta+.05)){q.stun=.55;q.cd=Math.max(q.cd,.3)}}
S.ev.push({type:'skill',id:p.id,sk:type});return true}
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
 const calling=q.id===S.hero&&S.time-S.call.t<2.5;if(calling)sc+=S.call.kind==='run'?.5:1.8;
 out.push({q,sc,kind:'g'});
 if(fwd>8&&q.vx*dir>2.2&&open>3.6&&!offside&&q.x*dir<=S.ol[p.t]+1){const tx=cl(q.x+q.vx*.9+dir*9,-L+4,L-4),tz=cl(q.z+q.vz*.5,-W+6,W-6);
  if(laneClear(S,p,tx,tz)>2.2)out.push({q,sc:fwd*.1+open*.3+1.1-d*.02+(calling&&S.call.kind==='run'?2.6:0),kind:'t'})}}
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
if(p.gk){gkDistribute(S,p);return}
if(S.rs&&S.rs.kind==='corner'&&S.rs.taker===p.id&&p.hold>=1.1){cornerKick(S,p,false);return}
p.thk-=dt;if(p.thk>0)return;p.thk=.14+S.rng()*.12+(1-df)*.3;
const gdx=Math.abs(dir*L-p.x),near=nearOpp(S,p),pr=near.d;
const ind=S.rs&&S.rs.ind;
if(!ind&&p.hold>.12+(1-df)*.5){const xg=shotQ(S,p);if(xg>(pr<3.5?.075:.105)+S.rng()*.05){shoot(S,p,false);return}}
if(Math.abs(p.z)>15&&gdx<30&&p.hold>.35+(1-df)*.4&&S.rng()<.4){lob(S,p,false);return}
const opts=passOptions(S,p),dr=dribbleOption(S,p);p.dx=dr.dx;p.dz=dr.dz;p.dclear=dr.clear;
const pb=opts[0];
if(pr<2.7&&p.skcd<=0&&p.hold>.3&&p.dr>.93&&(!pb||pb.sc<1.3)&&S.rng()<.13){skill(S,p,pr<1.7?'roulette':(S.rng()<.5?'stepover':'dragback'));return}
if(pb){const pressured=pr<3.4,want=(pressured&&pb.sc>-.4&&p.hold>.22)||(pb.sc>dr.sc+.9&&p.hold>.55)||p.hold>2.8;
 if(want){/* occasionally pick the 2nd best to avoid predictability */
  const pick=(opts[1]&&opts[1].sc>pb.sc-.45&&S.rng()<.25)?opts[1]:pb;
  if(pick.kind==='t')throughTo(S,p,pick.q,false);else passTo(S,p,pick.q,false);return}}
if(p.hold>3.4){lob(S,p,false)}}
/* ---------------- ball physics (shared by the match and by the keeper's prediction) ---------------- */
function ballPhys(b,dt){
b.vy-=25*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;
if(b.curve){const h0=hyp(b.vx,b.vz);if(h0>4){const cx=-b.vz/h0*b.curve*dt,cz=b.vx/h0*b.curve*dt;b.vx+=cx;b.vz+=cz}b.curve*=Math.pow(.5,dt)}
/* ground contact: the ball sits on the turf at y=.22; it only snaps back down when it is falling onto it (fixes lobs/crosses staying glued to the floor at 60 fps) */
if(b.y<.22){b.y=.22;b.vy=b.vy<-3?-b.vy*.45:0}
if(b.y<.3){const k=hyp(b.vx,b.vz)>10?.52:.82,f=Math.max(0,1-k*dt);b.vx*=f;b.vz*=f}else{const f=Math.max(0,1-.1*dt);b.vx*=f;b.vz*=f}}
/* goal frame: posts and crossbar (ball radius .22 + woodwork half-thickness .08) */
function woodwork(S,b){const sx=b.x>0?1:-1,gx=L*sx;if(Math.abs(b.x-gx)>.6)return null;
for(const pz of [-GW,GW]){const dx=b.x-gx,dz=b.z-pz,d=hyp(dx,dz);if(d<.3&&b.y<2.52){const nx=dx/(d||1),nz=dz/(d||1),vn=b.vx*nx+b.vz*nz;if(vn<0){b.vx-=1.62*vn*nx;b.vz-=1.62*vn*nz;b.x=gx+nx*.3;b.z=pz+nz*.3;return'post'}}}
if(Math.abs(b.z)<GW+.05){const dx=b.x-gx,dy=b.y-2.44,d=hyp(dx,dy);if(d<.3){const nx=dx/(d||1),ny=dy/(d||1),vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=1.55*vn*nx;b.vy-=1.55*vn*ny;b.x=gx+nx*.3;b.y=2.44+ny*.3;return'bar'}}}
return null}
/* where will the ball be when it crosses the vertical plane x=xp (towards the goal side gs)? same physics as the match */
function ballPath(S,xp,gs,tmax){const b=S.ball,c={x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy,vz:b.vz,curve:b.curve||0},dt=1/50;let t=0;
if((c.x-xp)*gs>=0)return{t:0,x:c.x,y:c.y,z:c.z,vx:c.vx,vy:c.vy,vz:c.vz,sp:Math.hypot(c.vx,c.vy,c.vz)};
for(let i=0,n=Math.ceil((tmax||2.6)/dt);i<n;i++){ballPhys(c,dt);t+=dt;if((c.x-xp)*gs>=0)return{t,x:c.x,y:c.y,z:c.z,vx:c.vx,vy:c.vy,vz:c.vz,sp:Math.hypot(c.vx,c.vy,c.vz)}}
return null}
/* first moment a lofted ball comes down to claiming height (or lands) */
function ballDescent(S,tmax){const b=S.ball,c={x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy,vz:b.vz,curve:b.curve||0},dt=1/40;let t=0;
for(let i=0,n=Math.ceil((tmax||2.8)/dt);i<n;i++){ballPhys(c,dt);t+=dt;if((c.vy<0&&c.y<=2.7)||c.y<=.24)return{t,x:c.x,y:c.y,z:c.z,vx:c.vx,vz:c.vz}}
return null}
/* ---------------- goalkeeper v3 ---------------- */
/* Keeper state machine (p.gst): set | dive | down | rise | catch | punch | parry | claim | throw | kick | collect
   p.gt0 = time the state started, p.gdur = its length (read by the animation). */
const GKA=.55;
function gkReset(p){p.gst='set';p.gt0=-9;p.gdur=0;p.dvT=.4;p.ddx=0;p.ddz=0;p.dlat=1;p.dfwd=0;p.dh=1;p.gball=0;p.gsay=-9;p.gsk='';p.gshk=-9;p.gerr=0;p.gerr2=0;p.gthr=-9;p.gfa=null;p.g1=-1;p.gholdT=1;p.gsm=0;p.dv=0;p.gjump=0;p.gpose='ready';p.gwait=0;p.gdec=0}
function gkInit(p){p.gh=.86+Math.random()*.26;p.gcr=.25+Math.random()*.65;gkReset(p)}
function gkSet(S,p,st,dur){p.gst=st;p.gt0=S.time;p.gdur=dur||0}
function gkGo(p,tx,tz,vmax){const dx=tx-p.x,dz=tz-p.z,d=hyp(dx,dz);if(d<.06)return[0,0,0];const s=Math.min(vmax,1.5+d*5.2);return[dx/d*s,dz/d*s,0]}
function gkThreat(S,p){const b=S.ball,gs=p.t?1:-1,gl=gs*L,dist=-(b.x-gl)*gs;
if(b.vx*gs<3.2||dist>46||dist<-.3)return null;
const pa=ballPath(S,gl-gs*GKA,gs,2.6);if(!pa)return null;
if(Math.abs(pa.z)>GW+1.7||pa.y>3.3)return null;return pa}
/* default position: on the line between the ball and the middle of the goal (angle closing), stepping up as a sweeper when his team has the ball */
function gkPos(S,p,gs,gl,b){const bd=hyp(b.x-gl,b.z),fwd=-(b.x-gl)*gs,own=S.owner>=0&&S.p[S.owner].t===p.t,ours=own||(S.owner<0&&S.lastT===p.t);
const arc=cl(1.7+(bd<20?(20-bd)*.09:0)+(bd>40?.8:0),1.5,4.6);let out=arc;
if(ours){const ds=S.p.filter(q=>q.t===p.t&&!q.gk&&!q.off).map(q=>-(q.x-gl)*gs).sort((a,c)=>a-c),dl=(ds[0]+ds[1]+ds[2]+ds[3])/4||18,sw=cl(dl*.38,3.5,12.5);const k=cl((fwd-20)/14,0,1);out=arc+(sw-arc)*k}
else if(fwd>36)out=cl(arc+(fwd-36)*.25,arc,6.5);
let tz=cl((b.z/Math.max(bd,8))*(out*1.3+.4),-3.05,3.05);
if(fwd<10&&Math.abs(b.z)>5){tz=Math.sign(b.z)*(GW-.75);out=Math.min(out,1.1)}
return[gl-gs*out,tz]}
function gkTf(p,D,sm){return((sm?.38:.3)+.105*D)*(1.07-.07*p.gh)}
function gkDive(S,p,tx,tz,ty,smother){const Dxr=tx-p.x,Dzr=tz-p.z;let Dx,Dz,D;
if(smother){const dl=hyp(Dxr,Dzr)||1;D=cl(dl-.8,.45,3.3);Dx=Dxr/dl*D;Dz=Dzr/dl*D}
else{D=cl(Math.abs(Dzr)-.82,.25,2.75);Dz=Math.sign(Dzr||1)*D;Dx=cl(Dxr*.7,-.6,.9)}
const Tf=gkTf(p,D,smother),dl=hyp(Dx,Dz)||1,fx=Math.cos(p.a),fz=Math.sin(p.a);
p.ddx=Dx;p.ddz=Dz;p.dh=ty>1.5?2:ty>.62?1:0;p.dlat=(-Dx*fz+Dz*fx)/dl;p.dfwd=(Dx*fx+Dz*fz)/dl;if(Math.abs(p.dlat)<.05)p.dlat=Dz>=0?.05:-.05;
p.gsm=smother?1:0;p.dvT=Tf;gkSet(S,p,'dive',Tf+.26);p.dv=p.gdur;p.jp=0;p.gjump=0;p.cd=0}
/* hands/body reach envelope in the keeper's own frame (f = facing, l = lateral) */
function gkReach(S,p,hs){const b=S.ball;if(p.off||p.cd>0||b.y>3.45)return null;
const rx=b.x-p.x,rz=b.z-p.z;if(Math.abs(rx)>4.2||Math.abs(rz)>4.2)return null;
const fx=Math.cos(p.a),fz=Math.sin(p.a),along=rx*fx+rz*fz,lat=-rx*fz+rz*fx,y=b.y,st=p.gst,age=S.time-p.gt0;
let c=0,rl=.95,aMin=-.85,aMax=.85,y0=-.1,y1=2.62,ym=1.2,dvv=false;
if(st==='dive'||st==='down'){dvv=true;const u=st==='down'?1:cl(age/(p.dvT*.95),0,1),ext=u*u*(3-2*u),sg=p.dlat>=0?1:-1;
 if(p.gsm){const ex=Math.max(.15,Math.abs(p.dfwd));c=0;rl=1.0;aMin=-.45;aMax=.9+1.5*ext*ex;ym=.5;y0=-.1;y1=1.25}
 else{const far=.85+.5*ext,back=.55;c=sg*(far-back)/2;rl=(far+back)/2+.12;aMin=-.8;aMax=.8;const dh=p.dh;ym=dh===2?1.8:dh===1?1.0:.45;y0=dh===2?.6:dh===1?.05:-.1;y1=dh===2?3.0:dh===1?1.95:1.15;
  if(st==='down'||age>p.dvT){y1=Math.min(y1,.95);ym=Math.min(ym,.45)}}}
else if(st==='rise'){rl=.8;y1=2.1}
else if(p.gjump>0||st==='claim'){y1=3.2;ym=1.75;rl=.9}
if(along<aMin||along>aMax)return null;
let kind=null,q=0;
if(y>=y0&&y<=y1&&Math.abs(lat-c)<rl){const dl=Math.abs(lat-c)/rl,dy=Math.abs(y-ym)/((y1-y0)/2);q=cl(1-Math.hypot(dl,dy*.5)/1.12,0,1);kind='hands'}
else if(!dvv&&Math.abs(along)<.55&&Math.abs(lat)<.52&&y<1.9){kind='block';q=.15}
if(!kind)return null;
return{p,q,kind,lat,y,along,dv:dvv}}
/* what happens when the ball meets the keeper */
function gkTouch(S,h){const p=h.p;if(!h.dv)p.dlat=h.lat>=0?1:-1;const b=S.ball,gs=p.t?1:-1,gl=gs*L,sp=Math.hypot(b.vx,b.vy,b.vz),hs=hyp(b.vx,b.vz),sh=S.shot&&S.shot.t!==p.t,
 dfc=p.t?S.diff:1,gh=p.gh*(.9+.1*dfc),inBox=Math.abs(b.x-gl)<16.6&&Math.abs(b.z)<20.2,P=S.p;
const lk=S.lkid>=0?P[S.lkid]:null,bp=!!(lk&&lk.t===p.t&&lk!==p&&!lk.gk&&S.lastT===p.t&&S.time-S.kickT<3.2&&!(S.rs&&S.rs.kind==='throw'));
const aer=!sh&&(b.y>1.15||p.gst==='claim'||p.gjump>0)&&sp<27;
let opp=0;for(const q of P){if(q.t===p.t||q.off)continue;if(hyp(q.x-p.x,q.z-p.z)<2.2)opp++}
const done=(kind,great)=>{S.lastT=p.t;S.rcv=-1;S.thru=null;S.cross=null;S.lastPass=null;S.offs=null;b.curve=0;
 if(sh&&sp>8){S.st.sot[S.shot.t]++;if(kind!=='goal')S.st.saves++;S.shot=null}
 S.ev.push({type:'save',id:p.id,t:p.t,kind,great:!!great,sp,shot:!!sh})};
const side=()=>Math.abs(b.z)>.9?Math.sign(b.z):(h.lat>=0?1:-1)*(p.a>1.5?-1:1)*(S.rng()<.5?1:-1);
const hold=(hands)=>{S.owner=p.id;p.hold=0;p.gball=hands?1:0;S.rcv=-1;b.vx=b.vy=b.vz=0;p.gholdT=hands?(.8+S.rng()*.9):(.32+S.rng()*.2);if(hands)p.vx*=.4,p.vz*=.4};
/* feet: outside the box or a back-pass, the keeper may not use his hands */
if((!inBox||bp)&&(h.kind!=='block'||hs<14)){
 if(hs<19&&b.y<1.0){hold(false);if(!p.gst||p.gst==='set')gkSet(S,p,'collect',.3);done('collect',false);return}
 const sg2=Math.sign(b.z)||1;b.vx=-gs*(6+S.rng()*6);b.vz=sg2*(3+S.rng()*6);b.vy=2+S.rng()*3;p.cd=.35;gkSet(S,p,'parry',.4);done('block',false);return}
if(h.kind==='block'){/* hit his body / legs: big deflection, no control */
 const sg2=Math.sign(b.z-p.z)||(S.rng()<.5?-1:1);
 if(hs<8&&b.y<.9){hold(true);gkSet(S,p,'collect',.35);done('catch',false);return}
 b.vx=-gs*(Math.max(2.5,hs*.3)+S.rng()*3);b.vz=sg2*(2+S.rng()*5)+b.vz*.2;b.vy=1+S.rng()*2.5;p.cd=.3;done('block',false);return}
/* aerial ball: claim it, or punch it clear when contested */
if(aer){const pc=cl(.94*gh-opp*.14-(1-h.q)*.3-Math.max(0,hs-16)*.02,.18,.97);
 if(opp>0&&S.rng()<.45+.2*opp||S.rng()>pc){/* punch */
  const sg2=Math.sign(b.z)||(S.rng()<.5?-1:1);b.vx=-gs*(10+S.rng()*5);b.vz=sg2*(2+S.rng()*6);b.vy=6+S.rng()*3;p.cd=.4;gkSet(S,p,'punch',.5);S.lastT=p.t;S.rcv=-1;S.cross=null;S.lastPass=null;b.curve=0;S.ev.push({type:'save',id:p.id,t:p.t,kind:'punch',great:false,sp,shot:false});return}
 hold(true);if(p.gst!=='claim')gkSet(S,p,'claim',.6);done('claim',false);return}
/* shot (or any hard ground ball) */
let pc;if(sp<8)pc=.97*Math.min(1,.6+h.q);else pc=cl(1.08-(sp-8)*.04-(1-h.q)*.5,0,.97)*gh;if(h.dv)pc*=.8;if(h.q<.12)pc*=.5;
const r=S.rng();
if(r<pc){/* held */
 hold(true);if(!h.dv)gkSet(S,p,'catch',.55);done('catch',h.dv&&sp>16);return}
const great=sp>15&&(h.q<.45||h.dv);
if(h.q<.1&&sp>24&&S.rng()<.45){/* fingertips only: nicks it but it still goes in */b.vx*=.72;b.vy+=S.rng()*2;b.vz+=(S.rng()-.5)*3;p.cd=.4;if(!h.dv)gkSet(S,p,'parry',.4);done('goal',false);return}
const sg2=side();
if(b.y>2.0&&(p.gjump>0||p.dh===2||h.dv)&&S.rng()<.8){/* tipped over the bar */
 b.vx=gs*(2+hs*.28);b.vz=sg2*(1+S.rng()*2);b.vy=4.5+S.rng()*2;p.cd=.4;if(!h.dv)gkSet(S,p,'parry',.45);done('tip',true);return}
if(Math.abs(b.z)>2.2&&h.q<.55&&S.rng()<.7){/* turned round the post */
 b.vx=gs*(1.5+S.rng()*2.5);b.vz=sg2*(5.5+S.rng()*4);b.vy=.8+S.rng()*1.6;p.cd=.4;if(!h.dv)gkSet(S,p,'parry',.45);done('tip',true);return}
if(h.q>.5&&sp<22&&S.rng()<.4){/* spills it in front of him */
 b.vx=-gs*(1+S.rng()*2.5);b.vz=(S.rng()-.5)*3;b.vy=.8+S.rng()*1.5;p.cd=.32;if(!h.dv)gkSet(S,p,'parry',.4);done('spill',false);return}
b.vx=-gs*(2.5+S.rng()*4.5);b.vz=sg2*(4+S.rng()*6);b.vy=1.4+S.rng()*3;p.cd=.4;if(!h.dv)gkSet(S,p,'parry',.45);done('parry',great)}
/* the keeper's brain: returns [wantedVx,wantedVz,direct?] */
function gkStep(S,p,own,dt){const gs=p.t?1:-1,gl=gs*L,b=S.ball,now=S.time,dfc=p.t?S.diff:1,P=S.p,fa0=p.t?Math.PI:0;let age=now-p.gt0;
p.gfa=null;if(p.gjump>0)p.gjump-=dt;
if(p.gst==='dive'){p.dv=Math.max(.01,p.gdur-age);let vx,vz;
 if(age<p.dvT){const u=age/p.dvT,k=(2/p.dvT)*(1-u);vx=p.ddx*k;vz=p.ddz*k}else{const f=Math.exp(-7*dt);vx=p.vx*f;vz=p.vz*f}
 if(age>=p.gdur){p.dv=0;gkSet(S,p,'down',own===p?.5:.32+S.rng()*.22)}
 return[vx,vz,1]}
if(p.gst==='down'){p.dv=0;const f=Math.exp(-8*dt);if(age>=p.gdur)gkSet(S,p,'rise',.4);return[p.vx*f,p.vz*f,1]}
if(age>=p.gdur&&p.gst!=='set')gkSet(S,p,'set',0);
const slow=p.gst==='rise'?.5:1;
const face=()=>Math.atan2(b.z-p.z,b.x-p.x);
/* holding the ball */
if(own===p){p.gfa=fa0;return[0,0,0]}
/* penalty: on the line, eyes on the taker */
if(S.rs&&S.rs.kind==='pen'&&S.rs.t!==p.t&&S.owner===S.rs.taker){p.gfa=face();return gkGo(p,gl-gs*.45,Math.sin(now*2.1)*.55,2.2)}
/* ---------- incoming shot ---------- */
const shotLive=!!(S.shot&&S.shot.t!==p.t&&now-S.shot.time<2.4),airborne=S.owner<0&&S.lastT!==p.t&&(b.y>1.1||b.vy>3)&&hyp(b.vx,b.vz)<27;
const th=S.owner<0&&!(airborne&&!shotLive)?gkThreat(S,p):null;
if(th){
 if(p.gshk!==S.kickT){p.gshk=S.kickT;p.gerr=(S.rng()-.5)*2;p.gerr2=(S.rng()-.5)*2;p.gdec=0}
 const isPen=!!(S.pg&&S.time-S.pg.t<1.4&&S.time-S.kickT<1.4),rea=isPen?.05:(p.re+.09)*(dfc<1?1+(1-dfc)*2:1);
 p.gfa=face();
 if(now-S.kickT<rea)return[0,0,0];
 const sk=cl(p.pc*dfc,.7,1.15),spf=cl(th.sp/26,.6,1.25),k=cl(th.t/.5,.28,1);
 let zp=th.z+p.gerr*(1.55-.7*sk)*spf*k,yp=th.y+p.gerr2*.3*k;
 if(isPen){zp=S.pg.z;yp=p.gerr2>.25?1.7:p.gerr2<-.3?.35:.9}
 const d=zp-p.z,ad=Math.abs(d),T=th.t,RL=.82;
 if(ad<=.5&&!isPen){/* hold the line, maybe jump for a high one */
  if(yp>2.05&&T<.3&&p.gjump<=0)p.gjump=.5;
  return gkGo(p,p.x,zp,4.8*slow)}
 const shufCap=Math.max(0,T-.05)*4.4;
 if(!isPen&&ad<=RL+shufCap*.62){if(yp>2.05&&ad<RL+.4&&T<.3&&p.gjump<=0)p.gjump=.5;return gkGo(p,p.x,zp,5.3*slow)}
 /* a dive is needed */
 const D=cl(ad-.82,.25,2.75),Tf=gkTf(p,D,false),wait=.05+(1.12-sk)*.2;
 if(p.gst==='rise')return gkGo(p,p.x,zp,3);
 if(isPen||T<=Tf+wait||T<.3){gkDive(S,p,th.x,zp,yp,false);return[p.ddx*(2/p.dvT),p.ddz*(2/p.dvT),1]}
 return gkGo(p,p.x,zp,5.2*slow)}
/* ---------- crosses & high balls ---------- */
if(airborne&&!th){const ds=ballDescent(S,2.6);
 if(ds&&Math.abs(ds.x-gl)<18.5&&Math.abs(ds.z)<19.5&&-(ds.x-gl)*gs>-.4){
  const dd=hyp(ds.x-p.x,ds.z-p.z),tr=(Math.max(0,dd-.7))/7.6+.32;
  let rivals=0;for(const q of P){if(q.t===p.t||q.off)continue;if(hyp(q.x-ds.x,q.z-ds.z)<2.2)rivals++}
  const ok=tr<ds.t-.04+p.gcr*.18&&(rivals<2||dd<4.5);
  if(ok&&ds.y>1.9&&dd<2.9&&ds.t<.5&&p.gst!=='claim'&&p.gjump<=0){p.gjump=.62;gkSet(S,p,'claim',.62)}
  p.gfa=face();
  if(ok)return gkGo(p,cl(ds.x,gl-gs*16,gl),cl(ds.z,-19,19),8*slow);
  const pq=gkPos(S,p,gs,gl,b);return gkGo(p,pq[0],pq[1],5.4*slow)}}
/* ---------- loose ball / through ball: sweep it up ---------- */
if(S.owner<0&&(S.lastT!==p.t||S.rcv===p.id||(S.lastT===p.t&&b.vx*gs>1.5))&&b.y<1.3&&hyp(b.vx,b.vz)<21&&-(b.x-gl)*gs<30&&Math.abs(b.z)<27){
 let best=null;const c={x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy,vz:b.vz,curve:b.curve||0};
 for(let i=1;i<=26;i++){ballPhys(c,.1);const t=i*.1,dk=hyp(c.x-p.x,c.z-p.z),tk=Math.max(0,dk-.9)/8.1+.15;if(tk<=t){best={x:c.x,z:c.z,t,tk};break}}
 if(best){let to=9;for(const q of P){if(q.t===p.t||q.off||q.gk)continue;to=Math.min(to,Math.max(0,hyp(q.x-best.x,q.z-best.z)-.7)/(q.spd*7.4*(q.t?S.diff:1)));}
  const inBoxT=Math.abs(best.x-gl)<18&&Math.abs(best.z)<20;
  if((S.lastT===p.t||best.tk+.14<to)&&(inBoxT||S.lastT===p.t||best.tk+.4<to)){p.gfa=Math.atan2(best.z-p.z,best.x-p.x);return gkGo(p,best.x,best.z,8.2*slow)}}}
/* ---------- one on one: come out and make himself big ---------- */
if(own&&own.t!==p.t){const c=own,dc=hyp(c.x-gl,c.z),cv=hyp(c.vx,c.vz);
 let cover=0;for(const q of P){if(q.t!==p.t||q.gk||q.off)continue;if(-(q.x-gl)*gs<-(c.x-gl)*gs-.5&&Math.abs(q.z-c.z)<4.2&&hyp(q.x-c.x,q.z-c.z)<9)cover++}
 const toward=(c.vx*gs>1.2)||dc<9;
 if(dc<24&&cover===0&&toward&&Math.abs(c.z)<22){
  if(p.g1!==c.id){p.g1=c.id;p.gdec=p.gcr+(dc<14?.3:0)+S.rng()*.25>.62?1:0}
  if(p.gdec){const ux=(gl-c.x)/(dc||1),uz=(0-c.z)/(dc||1),stand=cl(dc*.3,2.6,6.5),tx=c.x+ux*stand+c.vx*.12,tz=c.z+uz*stand+c.vz*.12;
   p.gfa=face();p.gpose=hyp(c.x-p.x,c.z-p.z)<7?'big':'ready';
   /* ball a little loose: dive at his feet */
   const bd2=hyp(b.x-p.x,b.z-p.z),cb=hyp(b.x-c.x,b.z-c.z);
   if(cb>1.5&&bd2<3.4&&bd2<cb+.6&&p.gst!=='dive'&&p.cd<=0&&p.gst!=='rise'){gkDive(S,p,b.x+b.vx*.12,b.z+b.vz*.12,.3,true);return[p.ddx*(2/p.dvT),p.ddz*(2/p.dvT),1]}
   return gkGo(p,cl(tx,gl-gs*21,gl-gs*.5),cl(tz,-16,16),(dc>10?8.4:5.6)*slow)}}
 else if(p.g1===c.id&&dc>=24)p.g1=-1}
p.gpose='ready';
/* ---------- set pieces against him ---------- */
if(S.rs&&S.rs.t!==p.t&&(S.rs.kind==='corner'||S.rs.kind==='free')){
 const sz=Math.sign(b.z)||1;p.gfa=face();
 if(S.rs.kind==='corner'&&now-p.gsay>7){p.gsay=now;p.gsk='shout'}
 if(S.rs.kind==='free'&&-(b.x-gl)*gs<32&&now-p.gsay>7){p.gsay=now;p.gsk='shout'}
 if(S.rs.kind==='corner')return gkGo(p,gl-gs*2.1,-sz*.9,4.2);
 const pp=gkPos(S,p,gs,gl,b);return gkGo(p,pp[0],cl(pp[1]*1.15,-3.1,3.1),4.4)}
/* ---------- default: stand in the right place, square to the ball ---------- */
const pp=gkPos(S,p,gs,gl,b);p.gfa=face();
const far=-(b.x-gl)*gs>34;
if(far&&hyp(pp[0]-p.x,pp[1]-p.z)>3){p.gfa=hyp(pp[0]-p.x,pp[1]-p.z)>0?Math.atan2(pp[1]-p.z,pp[0]-p.x):p.gfa;return gkGo(p,pp[0],pp[1],6.6*slow)}
return gkGo(p,pp[0],pp[1],(far?4.4:5.2)*slow)}
/* ---------------- keeper distribution ---------------- */
function gkThrow(S,p,q,roll){const b=S.ball,ld=lead(p,q,.8,3),dx=ld[0]-p.x,dz=ld[1]-p.z,d=hyp(dx,dz)||1,kt=p.kt;let n=noisy(S,p,dx,dz,roll?.1:.08);
if(roll){b.y=.22;kick(S,p,n[0],n[1],cl(d*.9+5,9,15),0)}
else{const y0=1.6,uh=cl(15+d*.28,17,26),T=d/uh,vy=(12.5*T*T-(y0-.22))/T;b.y=y0;kick(S,p,n[0],n[1],uh,vy)}
p.kt=kt;p.gthr=S.time;p.gthk=roll?1:0;p.gball=0;gkSet(S,p,'throw',.6);S.rcv=q.id;S.st.passes[p.t]++;S.lastPass={t:p.t,from:p.id,to:q.id,time:S.time}}
function gkDistribute(S,p){const dir=p.t?-1:1,gs=p.t?1:-1,b=S.ball;
if(p.hold<(S.rs&&S.rs.taker===p.id?Math.max(1.1,p.gholdT):p.gholdT))return;
const kind=S.rs&&S.rs.taker===p.id?S.rs.kind:'',pr=nearOpp(S,p).d,opts=passOptions(S,p).filter(e=>!e.q.gk&&e.kind==='g'&&e.sc>-.4);
const o=opts[0],d=o?hyp(o.q.x-p.x,o.q.z-p.z):0;
if(p.gball){
 if(o&&d<15&&(pr>4.5||d<9)&&S.rng()<.72){gkThrow(S,p,o.q,true);return}
 if(o&&d<34&&S.rng()<.9){gkThrow(S,p,o.q,false);return}
 b.y=.7;lob(S,p,false);p.gball=0;gkSet(S,p,'kick',.5);return}
/* feet: goal kick, back-pass, or a loose ball outside the area */
if(kind==='goalkick'){
 if(o&&d<26&&pr>3.5&&S.rng()<.55){passTo(S,p,o.q,false);gkSet(S,p,'kick',.5);return}
 lob(S,p,false);gkSet(S,p,'kick',.5);return}
if(o&&(d<30||pr<5)&&o.sc>-.2){passTo(S,p,o.q,false);gkSet(S,p,'kick',.45);return}
lobTo(S,p,p.x-gs*28,(S.rng()-.5)*30);gkSet(S,p,'kick',.45)}
/* ---------------- outfield AI movement ---------------- */
function shapeTarget(S,p,att){const dir=p.t?-1:1,b=S.ball,bX=b.x*dir,hZ=p.hz,hm=S.hxm&&S.hxm[p.t]?S.hxm[p.t][p.role]:undefined,hX=hm!==undefined?p.hx*dir*.35+hm*.65:p.hx*dir;let X,Z;
if(att){const k=p.role==='D'?.4:p.role==='M'?.58:.64;X=hX+cl(bX+30,0,60)*k;Z=hZ*1.14+(b.z-hZ)*.1;
 if(p.role!=='D')X=Math.min(X,Math.max(S.ol[p.t],bX)-.8);else X=Math.min(X,Math.max(S.ol[p.t]-14,-20))}
else{const k=p.role==='D'?.34:p.role==='M'?.42:.3;X=hX+cl(bX+28,0,56)*k;
 if(p.role==='D')X=Math.min(X,Math.max(bX+2,-36));else if(p.role==='M')X=Math.min(X,Math.max(bX+9,-26));
 Z=hZ*.78+(b.z-hZ)*.32}
const cX=p.role==='D'?(att?.08:.2):p.role==='M'?(att?.24:.32):(att?.04:.22),cZ=att?.3:.42;let wx=X*dir,wz=Z;wx+=(b.x-wx)*cX;wz+=(b.z-wz)*cZ;
return[cl(wx,-L+2,L-2),cl(wz,-W+2,W-2)]}
function aiMove(S,p,own){const dir=p.t?-1:1,b=S.ball,P=S.p,pl=S.plan[p.t],df=p.t?S.diff*S.mood.op:1;
if(p.gk)return[p.x,p.z,0];
if(S.rs&&S.rs.kind==='corner'&&S.rs.slots&&S.rs.slots[p.id]&&S.owner===S.rs.taker){const q=S.rs.slots[p.id];return[q[0]+Math.sin(S.time*1.7+p.id)*.5,q[1]+Math.cos(S.time*1.3+p.id)*.5,3.2]}
const base=(p.role==='D'?6.5:p.role==='M'?6.8:7)*df*p.spd;let spd=base;
if(S.rs&&S.rs.kind==='pen'&&p.id!==S.rs.taker){const gx=S.rs.gx;return[gx*Math.min(gx*p.x,L-23.5),p.z,p.x*gx>L-22?9:4]}
if(S.rs&&p.t!==S.rs.t){const d=hyp(p.x-b.x,p.z-b.z);if(d<10){const tx=p.x+(p.x-b.x)/(d||1)*6,tz=p.z+(p.z-b.z)/(d||1)*6;return[cl(tx,-L+1,L-1),cl(tz,-W+1,W-1),7]}}
const car=own||((S.rcv>=0&&S.lastT>=0&&P[S.rcv].t===S.lastT)?P[S.rcv]:null);
const mine=car?car.t===p.t:false;
let tx,tz;
if(own===p){const run=hyp(own.vx,own.vz);
 if(hyp(b.x-p.x,b.z-p.z)>1.7&&!(S.rs&&S.rs.taker===p.id))return[b.x+b.vx*.25,b.z+b.vz*.25,Math.max(base*1.2,run+2)];tx=p.x+p.dx*12;tz=p.z+p.dz*12;if(S.rs&&S.rs.taker===p.id){tx=p.x;tz=p.z}spd=Math.min(base*(p.dclear>9?1.3:1.12),run+2.8);spd=Math.max(spd,base*.9);
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
 if(p.role==='D'&&si<0&&Math.abs(p.hz)>12&&car!==p&&car.z*Math.sign(p.hz)>6&&car.x*dir>4){tx=cl(car.x+dir*7,-L+8,L-8);tz=Math.sign(p.hz)*(W-5);spd=base*1.12}
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
if(S.career&&kind==='corner'&&t===0&&S.hero>=0&&!P[S.hero].off)tk=P[S.hero];
b.x=x;b.z=z;b.y=.22;b.vx=b.vy=b.vz=0;tk.x=x-Math.sign(x)*.8*(kind==='goalkick'?0:1)*(kind==='throw'?0:1);tk.z=z-(kind==='throw'?Math.sign(z)*.8:0);tk.vx=tk.vz=0;tk.a=Math.atan2(-tk.z,-tk.x);
tk.imm=1.3;tk.cd=0;tk.hold=0;S.owner=tk.id;S.rcv=-1;S.thru=null;S.cross=null;S.offs=null;S.lastT=t;S.shot=null;S.rs={kind,t,taker:tk.id,until:S.time+6};if(tk.gk){tk.gball=0;tk.gholdT=1.1;gkSet(S,tk,'set',0)}
if(kind==='corner')cornerSetup(S,t,Math.sign(x)||1,Math.sign(z)||1,tk);
if(t===0&&!tk.gk&&!S.career)S.user=tk.id;S.ev.push({type:'restart',kind,t})}
function setPiece(S,kind,t,x,z,ind,victim){const dir=t?-1:1,b=S.ball;x=cl(x,-L+1,L-1);z=cl(z,-W+1,W-1);
let tk=null,bd=1e9;if(kind==='pen'&&victim&&!victim.gk&&!victim.off)tk=victim;
if(!tk)for(const p of S.p){if(p.t!==t||p.gk||p.off)continue;const d=hyp(p.x-x,p.z-z);if(d<bd){bd=d;tk=p}}
if(S.career&&t===0&&S.hero>=0&&!S.p[S.hero].off&&(kind==='pen'||(kind==='free'&&Math.abs(dir*L-x)<34)))tk=S.p[S.hero];
b.x=x;b.z=z;b.y=.22;b.vx=b.vy=b.vz=0;tk.x=x-dir*.9;tk.z=z;tk.vx=tk.vz=0;tk.a=Math.atan2(-z,dir*L-x);
tk.imm=1.3;tk.cd=0;tk.hold=0;S.owner=tk.id;S.rcv=-1;S.thru=null;S.cross=null;S.offs=null;S.lastT=t;S.shot=null;
S.rs={kind,t,taker:tk.id,until:S.time+(kind==='pen'?9:6),ind:!!ind,gx:dir};if(t===0&&!S.career)S.user=tk.id;S.ev.push({type:'restart',kind,t})}
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
function startKick(S,k){const P=S.p;const taker=P[S.kickoff.taker];if(!taker)return;if(!S.career)S.user=taker.id;S.owner=taker.id;S.kickoff=null;taker.hold=0;
if(S.botUser||taker.t===1||k===undefined||(S.career&&taker.id!==S.hero)){const o=passOptions(S,taker);const q=(o.find(e=>e.q.id!==taker.id)||{}).q;if(q)passTo(S,taker,q,false);else userPass(S,taker);return}
if(k===1)shoot(S,taker,true);else if(k===2)lob(S,taker,true);else if(k===4)userThrough(S,taker);else userPass(S,taker)}
function step(S,dt,inp){S.ev.length=0;if(inp)S.inp=inp;const n=Math.max(1,Math.ceil(dt/.0185)),h=dt/n;for(let i=0;i<n;i++){stepOnce(S,h);if(S.ev.some(e=>e.type==='goal'))break}}
function stepOnce(S,dt){S.time+=dt;
const P=S.p,b=S.ball;
if(S.kickoff){if((S.kickoff.team===1||S.botUser||(S.career&&S.kickoff.taker!==S.hero))&&S.time-S.kickoff.at>1.4)startKick(S);return}
let own=S.owner>=0?P[S.owner]:null;
if(!S.botUser){const nu=pickUser(S);if(nu!==S.user&&S.user>=0)S.lock=Math.max(S.lock,S.time+.9);S.user=nu}
S.ol=[0,1].map(t=>{const dir=t?-1:1,ds=P.filter(q=>q.t!==t&&!q.off).map(q=>q.x*dir).sort((a,c)=>c-a);return Math.max(ds[1]===undefined?0:ds[1],0)});
S.pt-=dt;if(S.pt<=0){S.pt=.12;planTeam(S,0);planTeam(S,1)}
const isU=p=>!S.botUser&&p.id===S.user;
for(const p of P){if(p.off)continue;p.cd-=dt;p.imm-=dt;p.dv-=dt;p.lunge-=dt;p.jp-=dt;p.tkw-=dt;p.prs-=dt;p.stun-=dt;p.skcd-=dt;p.vol-=dt;p.tc-=0;
 if(!p.gk&&p.jp<=0&&p.cd<=0&&b.y>1.25&&b.y<3.2&&b.vy<6&&hyp(b.vx,b.vz)>3&&hyp(b.x-p.x,b.z-p.z)<2.4)p.jp=.5;
 let wx=0,wz=0,gd=0;
 if(isU(p)){const i=S.inp,m=hyp(i.ix,i.iz);let ix=m>1?i.ix/m:i.ix,iz=m>1?i.iz/m:i.iz;
  if(p.prs>0&&own&&own.t!==p.t){/* pressure assist: lean the stick towards the carrier */const dx=own.x+own.vx*.3-p.x,dz=own.z+own.vz*.3-p.z,d=hyp(dx,dz)||1;ix=ix*.55+dx/d*.45;iz=iz*.55+dz/d*.45}
  const sr=i.sprint&&S.stam>.02&&m>.1;S.stam=sr?S.stam-dt*.2:Math.min(1,S.stam+dt*.1);
  const sp=6.8*S.mood.sp*(sr?1.34:1)*(p.lunge>0?1.7:1)*(own===p?.97:1)*(p.stun>0?.5:1);wx=ix*sp;wz=iz*sp}
 else if(p.gk){const g=gkStep(S,p,own,dt);wx=g[0];wz=g[1];gd=g[2]}
 else{const t=aiMove(S,p,own),dx=t[0]-p.x,dz=t[1]-p.z,d=hyp(dx,dz);if(d>.6){const s=t[2]*Math.min(1,d/3)*(p.stun>0?.5:1);wx=dx/d*s;wz=dz/d*s}
  /* AI tackle decisions for the first presser */
  if(own&&own.t!==p.t&&!p.gk&&p.cd<=0&&p.lunge<=0&&p.tkw<=0&&S.plan[p.t].press[0]===p){const dd=hyp(own.x-p.x,own.z-p.z),os=hyp(own.vx,own.vz),df=p.t?S.diff:1;
   if(dd<2.7&&dd>1.45&&os>5.6&&S.rng()<dt*.3*df)p.lunge=.35;
   else if(dd<1.7&&S.rng()<dt*1.0*df)p.tkw=.3}}
 let ax=wx-p.vx,az=wz-p.vz;
 if(p.gk){if(gd){p.vx=wx;p.vz=wz;ax=az=0}else{const l=hyp(ax,az),mx=(p.gst==='rise'?11:25)*dt;if(l>mx){ax*=mx/l;az*=mx/l}}}
 else if(p.dv>0){const l=hyp(ax,az),mx=55*dt;if(l>mx){ax*=mx/l;az*=mx/l}}
 else{const v=hyp(p.vx,p.vz),hx=v>.4?p.vx/v:Math.cos(p.a),hz=v>.4?p.vz/v:Math.sin(p.a),ctl=isU(p)?1.22:1;
  let al=ax*hx+az*hz,pe=-ax*hz+az*hx;
  const acc=(p.lunge>0?6:Math.max(4.5,(13-v*.7)*ctl)),brk=(p.lunge>0?9:30*ctl),prp=(p.lunge>0?5:(26*ctl)/(1+v*.2));
  al=cl(al,-brk*dt,acc*dt);pe=cl(pe,-prp*dt,prp*dt);ax=al*hx-pe*hz;az=al*hz+pe*hx}
 p.vx+=ax;p.vz+=az;
 p.x=cl(p.x+p.vx*dt,-L-3,L+3);p.z=cl(p.z+p.vz*dt,-W-2,W+2);
 const spd=hyp(p.vx,p.vz);p.dph+=spd*dt*.9;
 if(p.gk){const lock=p.gst==='dive'||p.gst==='down';if(!lock){if(p.gfa!==null&&p.gfa!==undefined)p.a=turn(p.a,p.gfa,10*dt);else if(spd>.8)p.a=turn(p.a,Math.atan2(p.vz,p.vx),14*dt)}}
 else if(spd>.8)p.a=turn(p.a,Math.atan2(p.vz,p.vx),(own===p?11:16)*dt)}
if(own){const o=own,sp=hyp(o.vx,o.vz),spf=Math.min(sp/9,1);
 const glued=o.gk||(S.rs&&S.rs.taker===o.id);
 if(o.gk){const fx=Math.cos(o.a),fz=Math.sin(o.a);
  if(o.gball){const lie=o.gst==='down'||o.gst==='dive',off=lie?.28:.36;b.x=o.x+fx*off;b.z=o.z+fz*off;b.y=lie?.34:1.08}
  else{b.x=o.x+fx*.62;b.z=o.z+fz*.62;b.y=.22}
  b.vx=o.vx;b.vz=o.vz;b.vy=0}
 else if(glued){const ph=o.dph*1.55,touch=Math.max(0,Math.sin(ph)),off=.7+.12*spf+touch*(.1+.5*spf),lat=Math.cos(ph*.5)*.07*spf;
  b.x=o.x+Math.cos(o.a)*off-Math.sin(o.a)*lat;b.z=o.z+Math.sin(o.a)*off+Math.cos(o.a)*lat;b.y=.22;b.vx=o.vx;b.vz=o.vz;b.vy=0}
 else{
  /* real dribbling: the ball rolls ahead and the carrier takes a touch every few strides */
  o.tc-=dt;let hx,hz,sti=0;
  if(isU(o)){const i=S.inp;sti=hyp(i.ix,i.iz);if(sti>.2){hx=i.ix/sti;hz=i.iz/sti}else{hx=Math.cos(o.a);hz=Math.sin(o.a)}}
  else{hx=o.dx;hz=o.dz;const hl=hyp(hx,hz);if(hl<.01){hx=Math.cos(o.a);hz=Math.sin(o.a)}else{hx/=hl;hz/=hl}}
  const usr=isU(o),rv=usr&&sp>2&&spf>.5&&sti>.2&&(hx*o.vx+hz*o.vz)/sp<-.1,dB0=hyp(b.x-o.x,b.z-o.z),reach=(1.3+.45*spf)*(usr?(rv?1.05:1.4):1),moving=sp>.9||sti>.2;
  /* you changed direction: take an early touch so the ball follows your new heading instead of being left behind */
  if(usr&&!rv&&sti>.35&&o.lhx!==undefined&&o.tc>.05&&dB0<reach&&hx*o.lhx+hz*o.lhz<.85)o.tc=0;
  if(o.tc<=0&&dB0<reach&&(moving||dB0>1.05)){
   const T=.3-.07*spf+S.rng()*.04,ah=.62+.9*spf,tx=o.x+o.vx*T+hx*ah,tz=o.z+o.vz*T+hz*ah;
   let nvx=(tx-b.x)/T,nvz=(tz-b.z)/T;const nl=hyp(nvx,nvz),cap=Math.max(sp+7,9);if(nl>cap){nvx*=cap/nl;nvz*=cap/nl}
   b.vx=nvx;b.vz=nvz;o.tc=T*.95;o.ttime=S.time;o.tpar^=1;o.lhx=hx;o.lhz=hz}
  b.y=.22;b.vy=0;b.x+=b.vx*dt;b.z+=b.vz*dt;
  const fr=moving?1.1:7,f=Math.max(0,1-fr*dt);b.vx*=f;b.vz*=f;
  /* magnetic follow-through: while you steer, the ball is gently pulled along your heading (weaker at full sprint, so it can still run away) */
  if(usr&&sti>.2&&dB0<3){const sp2=Math.max(0,spf-.8)/.2,as=(1-.55*sp2)*(rv?.12:1),cx=o.x+o.vx*.14+hx*(.75+.5*spf),cz=o.z+o.vz*.14+hz*(.75+.5*spf);
   b.vx+=(cx-b.x)*7*as*dt;b.vz+=(cz-b.z)*7*as*dt;
   const lat=(b.vx-o.vx)*(-hz)+(b.vz-o.vz)*hx,kk=Math.min(1,dt*6*as);b.vx+=hz*lat*kk;b.vz-=hx*lat*kk}
  if(!moving&&dB0<3){const k=1-Math.exp(-12*dt);b.vx+=((o.x+Math.cos(o.a)*.7-b.x)*4+o.vx-b.vx)*k;b.vz+=((o.z+Math.sin(o.a)*.7-b.z)*4+o.vz-b.vz)*k}
  const dB=hyp(b.x-o.x,b.z-o.z);
  if(dB>(usr&&!rv?4.2:3.3)){S.owner=-1;S.lastT=o.t;o.cd=.3;S.rcv=-1}
  else if(Math.abs(b.z)>W+.3||Math.abs(b.x)>L+.3){if(!(Math.abs(b.x)>L&&Math.abs(b.z)<GW)){S.owner=-1;S.lastT=o.t;S.rcv=-1}}
 }
 const dBo=hyp(b.x-o.x,b.z-o.z);
 if(S.owner===o.id&&!(o.gk&&o.gball))for(const q of P){if(q.t===o.t||q.off||q.cd>0||o.imm>0||q.stun>0)continue;
  const reach=q.lunge>0?2.1:1.25,dB=hyp(q.x-b.x,q.z-b.z),dO=hyp(q.x-o.x,q.z-o.z);if(Math.min(dB,dO+.25)>reach)continue;
  const usr=isU(q),df=(q.t?S.diff:1);
  if(!glued&&!q.gk&&dBo>1.7&&dB<1.0&&S.rng()<dt*6*q.ta*df){S.owner=q.id;q.hold=0;S.rcv=-1;S.thru=null;S.rs=null;S.lastT=q.t;S.lastPass=null;q.cd=0;o.cd=.4;break}
  let pr=q.lunge>0?3.2:(q.tkw>0?5.2:(usr?0:.55));if(pr<=0)continue;
  pr*=q.ta*df*(usr?1.12:1)*(1-Math.min(sp/13,.5))*(1.2-.36*o.dr)*(1+Math.max(0,dBo-.9)*1.1);
  if(S.rng()<dt*pr){const win=S.rng()<.54+.12*(q.ta-o.dr),bh=(o.x-q.x)*Math.cos(o.a)+(o.z-q.z)*Math.sin(o.a)>.5,fp=(win?.035:.2)*(q.lunge>0?2.3:1)*(bh?1.8:1);
   if(S.rng()<fp){foul(S,q,o,bh);return}
   S.st.tackles++;
   if(win){if(S.rng()<.6){S.owner=q.id;q.hold=0;S.rcv=-1;S.thru=null;S.rs=null;S.lastT=q.t;S.lastPass=null;q.cd=0;o.cd=.5}
    else{const a=S.rng()*6.28;b.vx=Math.cos(q.a)*5+Math.cos(a)*2;b.vz=Math.sin(q.a)*5+Math.sin(a)*2;b.vy=1.4;S.owner=-1;S.rs=null;S.lastT=q.t;S.rcv=-1;o.cd=.45;q.cd=.12}}
   else{o.cd=.6;q.stun=q.lunge>0?.55:.3;if(q.lunge>0)q.lunge=0}
   break}}}
if(S.owner<0){
ballPhys(b,dt);{const wk=woodwork(S,b);if(wk)S.ev.push({type:'wood',kind:wk,sp:hyp(b.vx,b.vy,b.vz)})}
const hs=hyp(b.vx,b.vz);let pick=null,pd=1e9,hd=false,aer=null;
/* goalkeepers first: hands / body reach envelope */
let gkh=null;for(const q of P){if(!q.gk||q.off)continue;const h=gkReach(S,q,hs);if(h&&(!gkh||h.q>gkh.q))gkh=h}
if(gkh)gkTouch(S,gkh);
for(const q of P){if(gkh||q.cd>0||q.off||q.gk)continue;const d=hyp(q.x-b.x,q.z-b.z),r=q.gk?(q.dv>0?2.05:1.35):(q.id===S.rcv?1.7:1.05);
 if(d<r&&b.y<(q.gk?2.9:1.1)&&(q.gk||hs<22)&&d<pd&&!(q.gk&&hs>20&&S.roll>.6-.2*(d/r))){pd=d;pick=q}}
if(!gkh&&!pick&&b.y>1.1&&b.y<3&&hs>3){const cs=[];for(const q of P){if(q.off||q.gk||q.cd>0||q.stun>0)continue;const d=hyp(q.x-b.x,q.z-b.z);if(d<(q.jp>0?1.7:1.3))cs.push([d,q])}
 if(cs.length){let bq=null,bsc=-9;for(const [d,q] of cs){const sc=q.hd*(q.jp>0?1.08:1)-d*.22+(S.rng()-.5)*.55+(q.t===S.lastT?.06:0)+(q.id===S.rcv?.12:0);if(sc>bsc){bsc=sc;bq=q}}
  pick=bq;hd=true;aer=cs}}
if(pick){const q=pick;
 if(S.offs){const f=S.offs;if(q.t!==f.t)S.offs=null;else if(!q.gk&&S.time-f.at<4&&S.lastT===q.t&&f.ids.includes(q.id)){S.st.offsides[q.t]++;S.ev.push({type:'offside',t:q.t,id:q.id});setPiece(S,'free',1-q.t,q.x,q.z,true);return}}
 if(!q.gk&&!hd&&q.vol>0&&isU(q)&&Math.abs((q.t?-1:1)*L-q.x)<34){q.vol=0;S.rcv=-1;S.cross=null;shoot(S,q,true,.62);q.cd=.4}
 else if(hd){const dir=q.t?-1:1,gd=Math.abs(dir*L-q.x),og=Math.abs(-dir*L-q.x);q.jp=.55;q.hdt=S.time;
  for(const [d,c] of aer)if(c!==q){c.jp=Math.max(c.jp,.5);c.stun=.3;c.cd=.4}
  const att=S.lastT===q.t||(S.cross&&S.cross.tm===q.t);
  if(gd<21&&att){const e=(S.rng()-.5)*6;kick(S,q,dir*L-q.x,e*(1.25-q.sh*.3),15+S.rng()*5,.3+S.rng()*1.4);S.shot={t:q.t,time:S.time,id:++S.shotId};S.st.shots[q.t]++}
  else if(og<24){kick(S,q,dir*20,(S.rng()-.5)*30-Math.sign(q.z)*6,16+S.rng()*5,5+S.rng()*3)}
  else{const o=passOptions(S,q),g=o.find(e=>!e.q.gk&&e.q.id!==q.id&&e.sc>-1);
   if(g){const ld=lead(q,g.q,.7,3),dx=ld[0]-q.x,dz=ld[1]-q.z;kick(S,q,dx,dz,cl(hyp(dx,dz)*.9+5,9,19),1.5+S.rng()*2);S.rcv=g.q.id;S.lastPass={t:q.t,from:q.id,to:g.q.id,time:S.time}}
   else kick(S,q,dir*20,(S.rng()-.5)*22,14,5)}
  q.cd=.5;S.cross=null;S.ev.push({type:'header',id:q.id})}
 else if(hs>12&&S.rng()<((hs-12)/32)*(1.35-q.pc)){b.vx*=.38;b.vz*=.38;b.vx+=(S.rng()-.5)*2;b.vz+=(S.rng()-.5)*2;q.cd=.22;S.rcv=-1}
 else{const lp=S.lastPass;if(lp){if(q.t===lp.t){if(q.id!==lp.from)S.st.passOK[q.t]++}else S.st.inter[q.t]++;S.lastPass=null}
  S.owner=q.id;q.hold=0;S.rcv=-1;S.thru=null;S.cross=null;S.lastT=q.t;S.shot=null;b.curve=0;if(S.rs&&S.rs.taker!==q.id)S.rs=null}}}
own=S.owner>=0?P[S.owner]:null;
if(own&&(!isU(own)||(S.rs&&S.rs.taker===own.id&&S.time>S.rs.until)))aiCarrier(S,own,dt);
if(S.owner>=0)S.st.poss[P[S.owner].t]++;
if(Math.abs(b.x)>L&&Math.abs(b.z)<GW&&b.y<2.44){const t=b.x>0?0:1;S.st.goals[t]++;S.nextKickoff=1-t;if(S.shot){S.st.sot[S.shot.t]++}S.ev.push({type:'goal',t});return}
if(S.owner<0&&(Math.abs(b.x)>L+.3||Math.abs(b.z)>W+.3))outOfPlay(S)}
function act(S,k,pw){const P=S.p;if(S.kickoff){startKick(S,k);return}const p=P[S.user];if(!p)return;const own=S.owner===p.id;
if(k===5){manualSwitch(S);return}
if(k===7){if(own&&!p.gk){const i=S.inp,m=hyp(i.ix,i.iz),sp=hyp(p.vx,p.vz);let ty='stepover';
 if(m>.3){const c=(i.ix*Math.cos(p.a)+i.iz*Math.sin(p.a))/m;if(c<-.45)ty='dragback';else if(Math.abs(c)<.6)ty='roulette';else ty=sp>6.5?'burst':'stepover'}
 skill(S,p,ty)}return}
if(own){if(k===4)userThrough(S,p,pw);else if(k===2)lob(S,p,true);else if(k===1)shoot(S,p,true,pw);else if(k===6){kick(S,p,p.t?-1:1,(S.rng()-.5)*.8,24,6);S.st.passes[p.t]++}else userPass(S,p,pw);return}
const mine=S.career&&S.owner>=0&&P[S.owner].t===p.t;
if(mine){if(k===0)S.call={t:S.time,kind:'feet'};else if(k===4)S.call={t:S.time,kind:'run'};else if(k===2)S.call={t:S.time,kind:'cross'};else if(k===1)p.vol=.8;return}
if(S.career&&k===1&&S.owner<0){p.vol=.8;return}
if(k===4&&S.career){p.lunge=.46;p.imm=.12;return}
if(k===4){manualSwitch(S);return}
if(k===6){if(S.owner>=0&&P[S.owner].t!==p.t){p.lunge=.5;p.cd=Math.max(p.cd,0)}else if(S.owner<0&&hyp(S.ball.vx,S.ball.vz)>1){kick(S,p,p.t?-1:1,0,13,2);S.lastT=p.t}return}
if(k===1){const c=S.owner>=0&&P[S.owner].t!==p.t?P[S.owner]:null;
 if(c&&hyp(c.x-p.x,c.z-p.z)<2.1){p.tkw=.42;p.imm=.1}else{p.lunge=.46;p.imm=.12}return}
if(k===0){p.prs=1.1;p.tkw=Math.max(p.tkw,0);return}
if(k===2){manualSwitch(S);return}
p.lunge=.3}
const Sim={create,reset,step,act,setFormation,previewPass,FORM,N,L,W};
if(typeof module!=='undefined'&&module.exports)module.exports=Sim;else root.Sim=Sim;
})(typeof window!=='undefined'?window:globalThis);
