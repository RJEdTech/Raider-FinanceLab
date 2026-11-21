/* Raider Labs story kit (pilot, Nov 2026).
   One picture on a stage, one or two sentences under it, a formula strip between them.
   A lesson file calls Story.start({...}) with its steps and its draw function. */
window.Story=(function(){
'use strict';
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const $c=v=>'$'+(Math.round(v*100)/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const money=v=>v<0.995?Math.round(v*100)+'¢':(Math.abs(v-Math.round(v))<0.005?$(v):$c(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,lin=t=>t;
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const el=id=>document.getElementById(id);

/* ---------- svg helpers ---------- */
const n1=v=>Math.round(v*10)/10;
function rect(x,y,w,h,fill,o){o=o||{};if(!(w>0)||!(h>0))return'';
 let st='fill:'+fill;if(o.stroke)st+=';stroke:'+o.stroke+';stroke-width:'+(o.sw||2);if(o.dash)st+=';stroke-dasharray:'+o.dash;if(o.op!=null)st+=';opacity:'+(+o.op).toFixed(2);
 return '<rect x="'+n1(x)+'" y="'+n1(y)+'" width="'+n1(w)+'" height="'+n1(h)+'"'+(o.rx?' rx="'+o.rx+'"':'')+(o.attr||'')+' style="'+st+'"/>';}
function text(s,x,y,o){o=o||{};let st='font-size:'+n1(o.s||14)+'px;font-weight:'+(o.w||500)+';fill:'+(o.c||'var(--fg)');if(o.op!=null)st+=';opacity:'+(+o.op).toFixed(2);
 return '<text x="'+n1(x)+'" y="'+n1(y)+'" text-anchor="'+(o.a||'start')+'"'+(o.halo?' class="halo"':'')+' style="'+st+'">'+esc(s)+'</text>';}
function line(x1,y1,x2,y2,c,o){o=o||{};return '<line x1="'+n1(x1)+'" y1="'+n1(y1)+'" x2="'+n1(x2)+'" y2="'+n1(y2)+'" style="stroke:'+c+';stroke-width:'+(o.w||1)+(o.dash?';stroke-dasharray:'+o.dash:'')+(o.op!=null?';opacity:'+(+o.op).toFixed(2):'')+';stroke-linecap:round"/>';}
function tag(s,x,y,o){o=o||{};const fs=o.s||13,w=s.length*fs*0.57+14,h=fs+10,x0=o.a==='end'?x-w:o.a==='middle'?x-w/2:x;
 return rect(x0,y-h+5,w,h,o.bg||'var(--stage)',{rx:6,stroke:o.bc||'var(--line)',sw:o.bw||1,op:o.op})+text(s,x0+w/2,y-1,{a:'middle',s:fs,w:o.w||700,c:o.c,op:o.op});}
function ticks(max,n){const raw=max/n,p=Math.pow(10,Math.floor(Math.log10(raw)));let st=10*p;for(const m of[1,2,2.5,5,10]){if(raw<=m*p*1.0001){st=m*p;break;}}const out=[];for(let v=0;v<=max*1.0001;v+=st)out.push(v);return out;}
const person=(x,y,c,k)=>'<circle cx="'+n1(x)+'" cy="'+n1(y-9*k)+'" r="'+n1(7*k)+'" style="fill:'+c+'"/><path d="M'+n1(x-12*k)+' '+n1(y+14*k)+' q0 '+n1(-15*k)+' '+n1(12*k)+' '+n1(-15*k)+' q'+n1(12*k)+' 0 '+n1(12*k)+' '+n1(15*k)+' z" style="fill:'+c+'"/>';

/* ---------- state ---------- */
let cfg=null,DEF={},STEPS=[],PARTS=[],FIRST=[],S={};
let gut=null,idx=0,runId=0,tweens=[],rafOn=false,W=1000,H=520,K=1;
let GH=null,ghostHold=false,ghostT0=0,ghT=0;
let altOpen=false,speaking=false,playing=false,voted=null;
const mem={},order={pick:[],ok:false,tries:0,n:0};
const seen={},SNAP={cur:1,sel:1,xk:1,ph:1,one:1,n:1,build:1};
let svg,stageBox,panel,fbar,cap;
const full=o=>Object.assign({},DEF,o||{});

function tw(to,ms,ez){ez=ez||ease;if(RM)ms=0;return new Promise(res=>{const from={};for(const k in to)from[k]=S[k];tweens.push({from,to,ms,t0:performance.now(),ez,res});kick();});}
function dropTweens(){const t=tweens;tweens=[];t.forEach(x=>x.res(false));}
function cancelAll(){dropTweens();runId++;}
function kick(){if(!rafOn){rafOn=true;requestAnimationFrame(frame);}}
function ghostOp(){if(!GH)return 0;if(ghostHold)return 1;return clamp(1-(performance.now()-ghostT0)/2600,0,1);}
function frame(now){
 const done=[];
 tweens=tweens.filter(t=>{const p=t.ms?clamp((now-t.t0)/t.ms,0,1):1,e=t.ez(p);for(const k in t.to)S[k]=t.from[k]+(t.to[k]-t.from[k])*e;if(p>=1){done.push(t);return false;}return true;});
 render();done.forEach(t=>t.res(true));
 if(tweens.length||(GH&&ghostOp()>0))requestAnimationFrame(frame);
 else{rafOn=false;if(GH&&!ghostHold){GH=null;render();if(cfg.onGhostEnd)cfg.onGhostEnd(S);}}
}
/* keep an outline of the picture as it was before a change, then let it fade */
function ghost(snap){if(!ghostHold)GH=snap();ghostHold=true;clearTimeout(ghT);ghT=setTimeout(()=>{ghostHold=false;ghostT0=performance.now();kick();},900);}

/* ---------- analytics: anonymous counts only ---------- */
function ev(name,prefix,suffix){try{const g=window.goatcounter;if(g&&typeof g.count==='function')g.count({path:(prefix||'story')+'/'+cfg.lab+'/'+cfg.id+(suffix||'')+'/'+name,title:cfg.title+': '+name,event:true});}catch(e){}}
const nn=i=>'step-'+String(i+1).padStart(2,'0');

/* ---------- render ---------- */
function size(){const cw=stageBox.clientWidth||1000;const chrome=el('mast').offsetHeight+(fbar.hidden?0:fbar.offsetHeight+10)+cap.offsetHeight+46;
 const hpx=clamp(window.innerHeight-chrome,Math.min(260,cw*0.78),cw<600?cw*0.9:cw*0.6);svg.style.height=Math.round(hpx)+'px';
 W=clamp(cw,540,1080);H=W*hpx/cw;K=cw<520?1.28:cw<760?1.1:1;}
function render(){if(S.view==='P')return;svg.setAttribute('viewBox','0 0 '+n1(W)+' '+n1(H));svg.innerHTML=cfg.draw(S,W,H,K);}
function renderFbar(){const html=cfg.fbar?cfg.fbar(S):null;fbar.hidden=!html;fbar.innerHTML=html||'';if(html&&cfg.bindFbar)cfg.bindFbar(fbar,S);}
function renderPanel(){const p=S.view==='P'?S.panel:null;panel.hidden=!p;stageBox.hidden=!!p;if(p)svg.innerHTML='';panel.innerHTML=p?cfg.panel(p):'';if(p){if(cfg.bindPanel)cfg.bindPanel(panel,p);markVote();paintOrder();bindWords();}}
function plain(html){const d=document.createElement('div');d.innerHTML=html;return d.textContent;}
const val=v=>typeof v==='function'?v():v;
/* a step can ask the student to do something first: st.todo(S,mem) says when it is done. Next is never locked; it reads Skip until then. */
const todoDone=()=>{const st=STEPS[idx];return !st.todo||!!st.todo(S,mem);};
let wasDone=true;
function poke(){const d=todoDone();if(d!==wasDone){wasDone=d;updateChrome();size();render();}}
function updateChrome(){
 const st=STEPS[idx],done=todoDone(),txt=val(st.t)+(st.t2&&!playing&&done?' '+val(st.t2):'');wasDone=done;
 el('kpart').textContent=st.part<0?'Start':'Part '+(st.part+1)+' · '+PARTS[st.part];
 const inPart=STEPS.filter(s=>s.part===st.part),pos=inPart.indexOf(st)+1;el('kstep').textContent=st.part<0?'':'step '+pos+' of '+inPart.length;
 el('ktitle').textContent=st.title;el('ctext').innerHTML=txt;
 el('calt').hidden=!altOpen;el('calt').innerHTML='<b>Another way to say it.</b> '+val(st.alt);el('altb').setAttribute('aria-expanded',altOpen);
 const ch=el('choices');
 if(st.choices){delete ch.dataset.w;ch.hidden=false;ch.innerHTML='<div class="choices">'+st.choices.map(c=>'<button type="button" data-g="'+c[0]+'" aria-pressed="'+(gut===c[0])+'">'+c[1]+'</button>').join('')+'</div>'+(gut?'<p class="locked">'+st.locked+'</p>':'');}
 else if(st.widget){ch.hidden=false;if(ch.dataset.w!==String(idx)){ch.innerHTML=st.widget();ch.dataset.w=String(idx);if(cfg.bindWidget)cfg.bindWidget(ch,S);}}
 else{ch.hidden=true;ch.innerHTML='';delete ch.dataset.w;}
 el('back').disabled=idx===0;el('next').disabled=idx===STEPS.length-1;el('next').textContent=idx===0?'Start':done?'Next':'Skip';el('next').classList.toggle('primary',done);
 const mv=el('move');if(mv){mv.hidden=done||playing||!st.move;mv.innerHTML=st.move?'<i></i><b>Your move.</b> '+val(st.move):'';}
 const rp=el('replay');rp.hidden=!(st.play||(st.auto&&!done));rp.textContent=st.auto&&!done?'Do it for me':'Watch again';
 el('dots').innerHTML=STEPS.map((s,i)=>(i>0&&s.part!==STEPS[i-1].part?'<i class="gap"></i>':'')+'<i class="'+(i===idx?'on':i<idx?'past':'')+'"></i>').join('');
 document.querySelectorAll('#parts button').forEach((b,p)=>{b.setAttribute('aria-current',String(st.part===p));b.classList.toggle('done',st.part>p);});
}
function paint(){updateChrome();renderFbar();renderPanel();size();render();}
async function go(i,replay){
 cancelAll();stopSpeak();playing=false;const prev=idx;idx=clamp(i,0,STEPS.length-1);const st=STEPS[idx],target=full(st.st),fwd=replay||idx===prev+1,my=runId;
 if(idx!==prev)altOpen=false;
 GH=null;ghostHold=false;clearTimeout(ghT);
 if(!seen[idx]){seen[idx]=1;ev(nn(idx));}
 try{history.replaceState(null,'','#s'+(idx+1));}catch(e){}
 if(st.play&&fwd&&!RM){
  let from=full(idx>0?STEPS[idx-1].st:{});if(from.view!==target.view)from=full({view:target.view});
  else if(!replay&&prev===idx-1&&STEPS[prev].keep)STEPS[prev].keep.forEach(key=>{from[key]=S[key];});
  from.fbar=target.fbar;from.cur=target.cur;from.sel=null;
  S=from;playing=true;paint();
  await st.play(()=>my===runId);if(my!==runId)return;S=target;playing=false;updateChrome();size();render();
 }else{
  const sameView=S.view===target.view&&target.view!=='P';
  if(sameView&&!RM){const num={};for(const k in target){if(!SNAP[k]&&typeof target[k]==='number'&&typeof S[k]==='number'&&S[k]!==target[k])num[k]=target[k];else S[k]=target[k];}
   if(cfg.settle)cfg.settle(S);paint();if(Object.keys(num).length){await tw(num,550);if(my!==runId)return;}S=target;render();}
  else{S=target;paint();}
 }
 if(cfg.onStep)cfg.onStep(S,idx);
}
function stopSpeak(){if(speaking&&window.speechSynthesis)speechSynthesis.cancel();speaking=false;const b=el('readb');if(b)b.textContent='Read aloud';}
function speak(){if(!window.speechSynthesis)return;if(speaking){stopSpeak();return;}const st=STEPS[idx],txt=plain(val(st.t)+(st.t2?' '+val(st.t2):''))+(altOpen?' '+plain(val(st.alt)):'');
 try{const u=new SpeechSynthesisUtterance(st.title+'. '+txt);u.rate=0.95;u.onend=()=>{speaking=false;el('readb').textContent='Read aloud';};speechSynthesis.speak(u);speaking=true;el('readb').textContent='Stop reading';}catch(e){}}
function copy(t,msg,fallback){const fall=()=>{fallback.hidden=false;fallback.value=t;fallback.focus();fallback.select();msg.textContent='Select all of the box below and copy it.';};
 try{navigator.clipboard.writeText(t).then(()=>{msg.textContent='Copied. Paste it into your Canvas assignment.';},fall);}catch(e){fall();}}
/* one anonymous question at the end, so teachers and students decide which version is better */
function voteCard(){return '<div class="qcard"><h2>One question for RJ Ed Tech</h2><p>There are two versions of this tool. Which one helped you understand more?</p><div class="opts" id="vote"><button type="button" data-vote="story">This picture version</button><button type="button" data-vote="current">The other version</button><button type="button" data-vote="only">I only used this one</button></div><div class="fbslot" id="votemsg"></div></div>';}
/* put the story's own pictures in order */
const PERM={4:[2,0,3,1],5:[3,0,4,1,2],6:[4,1,5,0,3,2]};
function orderCard(items){order.n=items.length;const perm=PERM[items.length]||items.map((_,i)=>i);
 return '<div class="qcard" id="ordercard"><h2>Put the story in order</h2><p>Tap the pictures in the order they happened. Tap one again to take it back.</p><div class="ordergrid">'+
  perm.map(i=>'<button type="button" class="ocard" data-o="'+i+'" aria-label="Picture '+(perm.indexOf(i)+1)+'"><span class="onum"></span><svg viewBox="0 0 640 350" aria-hidden="true">'+cfg.draw(full(items[i]),640,350,1.15)+'</svg></button>').join('')+
  '</div><div class="copyrow"><button type="button" class="btn" id="ordercheck">Check the order</button><button type="button" class="btn small" id="orderclear">Start over</button></div><div class="fbslot"></div></div>';}
function paintOrder(msg){const c=el('ordercard');if(!c)return;c.querySelectorAll('.ocard').forEach(b=>{const p=order.pick.indexOf(+b.dataset.o);b.querySelector('.onum').textContent=p<0?'':String(p+1);b.classList.toggle('picked',p>=0);b.classList.toggle('right',order.ok);b.classList.remove('wrong');});
 if(order.ok)c.querySelector('.fbslot').innerHTML='<p class="fb ok" role="status">That is the story, in order.</p>';else if(!msg)c.querySelector('.fbslot').innerHTML='';}
function orderClick(e){const c=el('ordercard');if(!c||order.ok)return;const b=e.target.closest('.ocard');
 if(b){const i=+b.dataset.o,p=order.pick.indexOf(i);if(p>=0)order.pick.splice(p,1);else order.pick.push(i);paintOrder();return;}
 if(e.target.closest('#orderclear')){order.pick=[];paintOrder();return;}
 if(e.target.closest('#ordercheck')){if(order.pick.length<order.n){c.querySelector('.fbslot').innerHTML='<p class="fb no" role="status">Number every picture first.</p>';return;}
  order.tries++;const bad=order.pick.filter((v,j)=>v!==j);if(!bad.length){order.ok=true;ev('order-right');paintOrder();return;}
  paintOrder(true);c.querySelectorAll('.ocard').forEach(x=>{const j=order.pick.indexOf(+x.dataset.o);x.classList.toggle('wrong',order.pick[j]!==j);});
  c.querySelector('.fbslot').innerHTML='<p class="fb no" role="status">The red ones are out of place. Ask yourself what had to happen first. Tap them to take them back, then try again.</p>';}}
const orderLine=()=>'Story put in order: '+(order.ok?'correct'+(order.tries>1?' (try '+order.tries+')':''):'not done yet');
function wordsRow(list){return '<div class="words" id="words"><b>Words to use:</b> '+list.map(w=>'<span data-w="'+w+'">'+w+'</span>').join(' ')+'</div>';}
function bindWords(){const box=el('words');if(!box)return;const upd=()=>{const t=Array.prototype.map.call(panel.querySelectorAll('textarea:not([readonly])'),x=>x.value).join(' ').toLowerCase();box.querySelectorAll('span').forEach(s=>s.classList.toggle('used',new RegExp('\\b'+s.dataset.w.toLowerCase()).test(t)));};
 panel.querySelectorAll('textarea:not([readonly])').forEach(x=>x.addEventListener('input',upd));upd();}
function markVote(){const v=el('vote');if(!v||!voted)return;v.querySelectorAll('button').forEach(b=>b.classList.toggle('right',b.dataset.vote===voted));el('votemsg').innerHTML='<p class="fb ok">Thanks. Your answer is counted with no name attached.</p>';}

function start(c){
 cfg=c;DEF=c.DEF;STEPS=c.STEPS;PARTS=c.PARTS;FIRST=PARTS.map((_,p)=>STEPS.findIndex(s=>s.part===p));S=full(STEPS[0].st);
 svg=el('stage');stageBox=el('stagebox');panel=el('panel');fbar=el('fbar');cap=el('cap');
 el('next').addEventListener('click',()=>go(idx+1));
 el('back').addEventListener('click',()=>go(idx-1));
 el('replay').addEventListener('click',async()=>{const st=STEPS[idx];if(st.auto&&!todoDone()){cancelAll();const my=runId;await st.auto(()=>my===runId);if(my===runId){poke();render();}}else go(idx,true);});
 el('altb').addEventListener('click',()=>{altOpen=!altOpen;if(altOpen)ev(nn(idx),'confused','-story');updateChrome();size();render();});
 el('readb').addEventListener('click',speak);if(!window.speechSynthesis)el('readb').hidden=true;
 el('choices').addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(!b)return;gut=b.dataset.g;updateChrome();size();render();});
 el('parts').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(b)go(FIRST[+b.dataset.p]);});
 fbar.addEventListener('click',e=>{const b=e.target.closest('[data-hl]');if(!b)return;S.hl=S.hl===b.dataset.hl?null:b.dataset.hl;renderFbar();render();poke();});
 svg.addEventListener('click',e=>{const t=e.target.closest('.hit');if(!t||!cfg.onHit)return;if(cfg.onHit(t.dataset,S))renderFbar();render();poke();});
 let dragging=false;const pt=e=>{const r=svg.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};};
 svg.addEventListener('pointerdown',e=>{if(!cfg.onDrag||!e.target.closest('.drag'))return;dragging=true;try{svg.setPointerCapture(e.pointerId);}catch(_){}
  cancelAll();if(cfg.onDrag(pt(e),S,W,H,K,mem,'start'))renderFbar();render();poke();e.preventDefault();});
 svg.addEventListener('pointermove',e=>{if(!dragging)return;if(cfg.onDrag(pt(e),S,W,H,K,mem,'move'))renderFbar();render();poke();});
 ['pointerup','pointercancel','lostpointercapture'].forEach(n=>svg.addEventListener(n,()=>{dragging=false;}));
 panel.addEventListener('click',e=>{orderClick(e);const b=e.target.closest('[data-vote]');if(!b)return;if(!voted)ev('vote-'+b.dataset.vote);voted=b.dataset.vote;markVote();});
 document.addEventListener('keydown',e=>{const tg=e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(idx+1);}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(idx-1);}});
 let rz=0;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{size();render();},60);});
 el('parts').innerHTML=PARTS.map((p,i)=>'<button type="button" data-p="'+i+'"><i>'+(i+1)+'</i>'+p+'</button>').join('');
 const m=/^#s(\d+)$/.exec(location.hash||'');seen[0]=1;
 if(m&&+m[1]>1&&+m[1]<=STEPS.length){idx=+m[1]-1;S=full(STEPS[idx].st);seen[idx]=1;}
 paint();if(cfg.onStep)cfg.onStep(S,idx);
}
return {h:{$,$c,money,clamp,lerp,ease,lin,esc,el,n1,rect,text,line,tag,ticks,person,RM},
 start,tw,go,full,ghost,dropTweens,copy,voteCard,orderCard,orderLine,wordsRow,poke,mem,ev,
 redraw:()=>render(),setGut:v=>{gut=v;},refbar:()=>renderFbar(),rechrome:()=>{updateChrome();size();render();},
 get S(){return S;},get gut(){return gut;},get idx(){return idx;},get n(){return STEPS.length;},
 get gh(){const op=ghostOp();return GH&&op>0?{d:GH,op:op}:null;}};
})();
