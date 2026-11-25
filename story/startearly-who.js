/* "Who is doing this" for Start at 22 or 32 (Nov 25, 2026): a village savings group, Maradi region, Niger.
   CARE's first Village Savings and Loan Association, Mata Masu Dubara ("Women on the Move"), began here in 1991.
   Cause: the coins stay locked in the box all year, or the group lends them out. Transformation (close-up): a loan becomes
   peanuts, the peanuts become paste, oil and kuli-kuli, and those become coins again, with a little extra.
   Effect: in the village (an oil stall, goats, a cereal bank, a garden) and at share-out: her coins (gray), the extra her coins
   earned (yellow) and the extra the extra earned (green), the same colors as the deposit bars. Numbers stay in Test yourself.
   Sources: CARE (2016 VSLA at 25; "A box with three padlocks"; Fatchima Aboubacar); PBS NewsHour (2018); Karlan et al., PNAS 2017 (IPA). */
window.VS=(function(){
'use strict';
const LW=1770,LH=520,N=10;// three columns: the village, the close-up over the rhyme, the timeline
const V={on:false,pick:null,mode:'lend',run:false,m:0,share:0,shareGo:false,lendDone:false,lockDone:false,t:0,
  stall:0,goats:0,grain:0,garden:0,flights:[],dep:0,yel:0,grn:0,box:null,ctl:null,cv:null,cx:null,last:0};
function RR(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function T(c,s,x,y,o){o=o||{};c.font=(o.w||500)+' '+(o.s||16)+'px "Segoe UI",system-ui,sans-serif';c.fillStyle=o.c||'#1c1c1f';c.textAlign=o.a||'left';c.fillText(s,x,y);}
function rnd(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};}
let BG=null;
/* ---------- the village, drawn once ---------- */
function house(c,x,y,w,h,d,col){// a Hausa mud house: flat roof, corner horns, water spouts, shaded side
  c.fillStyle=col;c.fillRect(x,y-h,w,h);c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.moveTo(x+w,y);c.lineTo(x+w+d,y-d*.5);c.lineTo(x+w+d,y-h-d*.5);c.lineTo(x+w,y-h);c.fill();
  c.fillStyle='rgba(255,240,220,.25)';c.beginPath();c.moveTo(x,y-h);c.lineTo(x+d,y-h-d*.5);c.lineTo(x+w+d,y-h-d*.5);c.lineTo(x+w,y-h);c.fill();
  c.fillStyle=col;[[x,y-h],[x+w,y-h]].forEach(([hx,hy])=>{c.beginPath();c.moveTo(hx-4,hy);c.lineTo(hx,hy-12);c.lineTo(hx+4,hy);c.fill();});
  c.fillStyle='#3a2616';c.fillRect(x+w*.38,y-h*.62,w*.22,h*.62);c.fillStyle='#6b4a2e';c.fillRect(x+w*.12,y-h+6,5,2);c.fillRect(x+w*.82,y-h+6,8,3);
  c.strokeStyle='rgba(120,70,40,.25)';c.lineWidth=1;for(let k=1;k<5;k++){c.beginPath();c.moveTo(x,y-h*k/5);c.lineTo(x+w,y-h*k/5);c.stroke();}}
function neem(c,x,y,s){const R=rnd(5);c.fillStyle='rgba(70,50,30,.22)';c.beginPath();c.ellipse(x+20*s,y+6,170*s,26*s,0,0,7);c.fill();
  c.fillStyle='#5b4632';c.beginPath();c.moveTo(x-14*s,y);c.quadraticCurveTo(x-6*s,y-80*s,x-18*s,y-150*s);c.lineTo(x+10*s,y-150*s);c.quadraticCurveTo(x+6*s,y-80*s,x+16*s,y);c.fill();
  c.strokeStyle='#5b4632';c.lineWidth=7*s;[[-90,-200],[80,-210],[-20,-235],[130,-175],[-140,-170]].forEach(([dx,dy])=>{c.beginPath();c.moveTo(x-4*s,y-140*s);c.quadraticCurveTo(x+dx*.3*s,y+dy*.8*s,x+dx*s,y+dy*s);c.stroke();});
  for(let k=0;k<70;k++){const a=R()*Math.PI,rr=.35+R()*.65,cx=x+Math.cos(a)*180*s*rr,cy=y-200*s-Math.sin(a)*70*s*rr+R()*30*s,r=(16+R()*20)*s;
    c.fillStyle=['#3e6a2c','#4c7a33','#5a8a3a','#355f27'][k%4];c.beginPath();c.arc(cx,cy,r,0,7);c.fill();c.fillStyle='rgba(200,230,150,.22)';c.beginPath();c.arc(cx-r*.3,cy-r*.35,r*.45,0,7);c.fill();}}
function makeBG(){const g=document.createElement('canvas');g.width=900;g.height=600;const c=g.getContext('2d');const R=rnd(11);
  let gr=c.createLinearGradient(0,0,0,200);gr.addColorStop(0,'#a9c6dc');gr.addColorStop(1,'#efe3cc');c.fillStyle=gr;c.fillRect(0,0,900,200);
  gr=c.createLinearGradient(0,190,0,600);gr.addColorStop(0,'#e3cfa6');gr.addColorStop(1,'#d6b989');c.fillStyle=gr;c.fillRect(0,190,900,410);
  for(let k=0;k<40;k++){const x=R()*900,s=4+R()*9;c.fillStyle=`rgba(${100+R()*30|0},${112+R()*20|0},${70+R()*15|0},.6)`;c.beginPath();c.ellipse(x,192-s*.4,s*1.6,s,0,0,7);c.fill();}
  for(let k=0;k<1800;k++){const x=R()*900,y=200+R()*400,s=(y-190)/400;c.fillStyle=R()<.5?`rgba(160,120,70,${.25*s})`:`rgba(250,240,220,${.35*s})`;c.beginPath();c.arc(x,y,.5+s*1.4*R(),0,7);c.fill();}
  // millet-stalk compound wall and far houses
  house(c,40,236,120,52,22,'#c48b58');house(c,300,226,90,44,18,'#bb8152');house(c,690,232,130,56,24,'#c9935f');house(c,560,222,70,36,14,'#b97f50');
  c.strokeStyle='#b49a62';c.lineWidth=2;for(let x=170;x<290;x+=4){c.beginPath();c.moveTo(x,236);c.lineTo(x+(R()-.5)*2,236-26-R()*6);c.stroke();}
  BG=g;}
/* ---------- things that change ---------- */
function granary(c,x,y,f){// the group's cereal bank: a clay granary on stones, thatched lid, sacks of millet when filled
  c.fillStyle='#8a8378';[[-26,0],[-8,4],[12,2],[28,0]].forEach(([dx,dy])=>{c.beginPath();c.ellipse(x+dx,y+dy,9,5,0,0,7);c.fill();});
  const gr=c.createLinearGradient(x-36,0,x+36,0);gr.addColorStop(0,'#b5794a');gr.addColorStop(.6,'#c98f5c');gr.addColorStop(1,'#9b6339');c.fillStyle=gr;
  c.beginPath();c.moveTo(x-34,y-6);c.quadraticCurveTo(x-40,y-50,x-30,y-84);c.lineTo(x+30,y-84);c.quadraticCurveTo(x+40,y-50,x+34,y-6);c.closePath();c.fill();
  c.fillStyle='#b6995a';c.beginPath();c.moveTo(x-44,y-80);c.lineTo(x,y-128);c.lineTo(x+44,y-80);c.closePath();c.fill();c.strokeStyle='rgba(110,85,40,.6)';c.lineWidth=1;for(let k=-5;k<=5;k++){c.beginPath();c.moveTo(x,y-128);c.lineTo(x+k*8.5,y-81);c.stroke();}
  const n=Math.round(f*6);for(let k=0;k<n;k++){const sx=x+46+(k%3)*22,sy=y-2-Math.floor(k/3)*18;c.fillStyle='#e7dcc3';c.beginPath();c.moveTo(sx-10,sy);c.quadraticCurveTo(sx-12,sy-16,sx-6,sy-19);c.lineTo(sx+6,sy-19);c.quadraticCurveTo(sx+12,sy-16,sx+10,sy);c.closePath();c.fill();
    c.strokeStyle='rgba(120,100,70,.5)';c.stroke();c.fillStyle='#c9a24f';c.beginPath();c.ellipse(sx,sy-19,6,2.2,0,0,7);c.fill();}}
function goat(c,x,y,s,col,dir,t){c.save();c.translate(x,y);c.scale(dir*s,s);const step=Math.sin(t)*2;
  c.strokeStyle=col==='#f1ece2'?'#bdb3a2':'#2a2018';c.lineWidth=2.6;[[-11,step],[-6,-step],[8,step],[12,-step]].forEach(([lx,d])=>{c.beginPath();c.moveTo(lx,-8);c.lineTo(lx+d*.4,6);c.stroke();});
  c.fillStyle=col;c.beginPath();c.ellipse(0,-14,17,9,0,0,7);c.fill();c.beginPath();c.moveTo(13,-18);c.lineTo(19,-30);c.lineTo(25,-28);c.lineTo(21,-16);c.fill();
  c.beginPath();c.ellipse(24,-29,6.5,4.2,.4,0,7);c.fill();c.strokeStyle='#5a4a3a';c.lineWidth=1.6;c.beginPath();c.moveTo(21,-33);c.quadraticCurveTo(17,-41,12,-38);c.stroke();
  c.fillStyle='#2a2018';c.beginPath();c.arc(25,-30,1,0,7);c.fill();c.fillStyle=col;c.beginPath();c.ellipse(19,-28,4,1.8,.9,0,7);c.fill();c.beginPath();c.moveTo(-16,-17);c.lineTo(-21,-23);c.lineTo(-17,-14);c.fill();c.restore();}
function pen(c,x,y,f,t){c.strokeStyle='#8e7448';c.lineWidth=2;for(let k=0;k<=24;k++){const xx=x+k*7;c.beginPath();c.moveTo(xx,y);c.lineTo(xx,y-30);c.stroke();}
  c.beginPath();c.moveTo(x,y-24);c.lineTo(x+168,y-24);c.moveTo(x,y-10);c.lineTo(x+168,y-10);c.stroke();
  const cols=['#5a3e2a','#f1ece2','#2b2622','#8a5a34','#f1ece2','#6e4a30'],n=Math.round(f*6);
  for(let k=0;k<n;k++){const gx=x+18+((k*53)%140),gy=y+14+(k%2)*14;goat(c,gx+Math.sin(t*.4+k)*6,gy,.9,cols[k],k%2?1:-1,t*2+k);}
  // fence in front, so the goats stand inside it
  c.strokeStyle='#8e7448';for(let k=0;k<=24;k++){const xx=x+k*7;c.beginPath();c.moveTo(xx,y+42);c.lineTo(xx,y+14);c.stroke();}c.beginPath();c.moveTo(x,y+20);c.lineTo(x+168,y+20);c.moveTo(x,y+34);c.lineTo(x+168,y+34);c.stroke();}
function garden(c,x,y,f){c.fillStyle='#b9895a';c.beginPath();c.moveTo(x,y);c.lineTo(x+190,y);c.lineTo(x+220,y+60);c.lineTo(x-20,y+60);c.closePath();c.fill();
  c.strokeStyle='rgba(110,70,40,.45)';c.lineWidth=2;for(let r=0;r<4;r++){const yy=y+8+r*15;c.beginPath();c.moveTo(x-4-r*5,yy);c.lineTo(x+194+r*5,yy);c.stroke();}
  if(f>.03)for(let r=0;r<4;r++)for(let k=0;k<8;k++){const xx=x+6-r*5+k*(25+r*1.4),yy=y+8+r*15,s=(.5+r*.15)*Math.min(1,f*1.3);
    if(r%2===0){c.fillStyle='#8fbf6a';c.beginPath();c.arc(xx,yy-3*s,7*s,0,7);c.fill();c.fillStyle='#b7da92';c.beginPath();c.arc(xx-1,yy-4*s,4*s,0,7);c.fill();c.strokeStyle='rgba(70,110,50,.6)';c.lineWidth=1;c.beginPath();c.arc(xx,yy-3*s,7*s,3.6,5.8);c.stroke();}
    else{c.strokeStyle='#4f8a34';c.lineWidth=1.2;for(let j=-2;j<=2;j++){c.beginPath();c.moveTo(xx,yy);c.quadraticCurveTo(xx+j*3*s,yy-8*s,xx+j*5*s,yy-14*s);c.stroke();}}}
  c.strokeStyle='#a98c58';c.lineWidth=1.6;for(let k=0;k<=34;k++){const xx=x-20+k*7.1;c.beginPath();c.moveTo(xx,y+62);c.lineTo(xx,y+40);c.stroke();}}
function stall(c,x,y,f){// Fatchima's stall: a thatched shade, a table, peanut oil in bottles and pots, kuli-kuli rings in a calabash
  c.strokeStyle='#6b4f36';c.lineWidth=4;[[x,y],[x+150,y]].forEach(([px,py])=>{c.beginPath();c.moveTo(px,py+40);c.lineTo(px,py-70);c.stroke();});
  c.fillStyle='#c2a564';c.beginPath();c.moveTo(x-20,y-64);c.lineTo(x+170,y-64);c.lineTo(x+160,y-84);c.lineTo(x-10,y-84);c.closePath();c.fill();c.strokeStyle='rgba(120,90,40,.6)';c.lineWidth=1;for(let k=0;k<30;k++){c.beginPath();c.moveTo(x-16+k*6.2,y-84);c.lineTo(x-20+k*6.4,y-62);c.stroke();}
  c.fillStyle='#7a5636';c.fillRect(x-6,y-2,162,8);c.fillStyle='#2f6f8f';c.fillRect(x-6,y+6,162,10);c.strokeStyle='#5c4128';c.lineWidth=3;[[x+4],[x+146]].forEach(([lx])=>{c.beginPath();c.moveTo(lx,y+16);c.lineTo(lx,y+40);c.stroke();});
  const nb=Math.round(f*5);for(let k=0;k<nb;k++){const bx=x+6+k*15;c.fillStyle='rgba(230,236,240,.55)';RR(c,bx,y-30,11,28,3);c.fill();c.fillStyle='#d9a22a';RR(c,bx+1,y-22,9,19,2);c.fill();c.fillStyle='#3d6b3a';c.fillRect(bx+3,y-34,5,5);}
  if(f>.25){c.fillStyle='#9c5a32';c.beginPath();c.ellipse(x+100,y-12,18,13,0,0,7);c.fill();c.fillStyle='#7a4424';c.fillRect(x+92,y-27,16,5);}
  if(f>.45){c.fillStyle='#c98f3e';c.beginPath();c.ellipse(x+134,y-6,18,6,0,0,Math.PI);c.fill();c.fillStyle='#e0b25c';c.beginPath();c.ellipse(x+134,y-6,18,4,0,0,7);c.fill();
    c.strokeStyle='#7a4a22';c.lineWidth=3;for(let k=0;k<Math.round((f-.45)*12);k++){c.beginPath();c.arc(x+124+(k%4)*7,y-8-Math.floor(k/4)*4,3.2,0,7);c.stroke();}}}
const WOM=(()=>{const a=[];for(let k=0;k<N;k++){const ang=Math.PI*.15+k*(Math.PI*1.7/(N-1));a.push({ang,x:330+Math.cos(ang+Math.PI)*120,y:452+Math.sin(ang+Math.PI)*-38,
  wrap:['#b8322e','#1f5f9e','#d08a1a','#2f7a4a','#7a2f6e','#c4541e','#245c74','#a13a5a','#5a6e1f','#8a3a1e'][k],scarf:['#e3b33c','#c13a5e','#2f6fa8','#e07a2e','#3b8a5c','#6e3fa0','#d24a3a','#2c7d8a','#c4891e','#4a5fb0'][k]});}return a.sort((p,q)=>p.y-q.y);})();
function woman(c,w){const x=w.x,y=w.y,face=x<330?1:-1;// seated, side view, legs folded forward on the mat
  c.fillStyle=w.wrap;c.beginPath();c.moveTo(x-12*face,y);c.quadraticCurveTo(x-14*face,y-24,x-6*face,y-36);c.lineTo(x+8*face,y-36);c.quadraticCurveTo(x+12*face,y-20,x+10*face,y-6);c.lineTo(x+30*face,y-4);c.quadraticCurveTo(x+34*face,y+2,x+28*face,y+4);c.lineTo(x-12*face,y+4);c.closePath();c.fill();
  c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1.4;for(let k=0;k<3;k++){c.beginPath();c.moveTo(x-12*face,y-6-k*9);c.lineTo(x+10*face,y-4-k*9);c.stroke();}
  c.fillStyle='#4e321f';c.beginPath();c.ellipse(x+1*face,y-44,7.2,8.2,0,0,7);c.fill();c.fillStyle='#4e321f';c.beginPath();c.moveTo(x+6*face,y-26);c.lineTo(x+20*face,y-14);c.lineTo(x+22*face,y-17);c.lineTo(x+8*face,y-30);c.fill();
  c.fillStyle=w.scarf;c.beginPath();c.moveTo(x-8*face,y-44);c.quadraticCurveTo(x-6*face,y-58,x+3*face,y-56);c.quadraticCurveTo(x+9*face,y-54,x+7*face,y-47);c.lineTo(x-3*face,y-46);c.closePath();c.fill();c.beginPath();c.moveTo(x-8*face,y-46);c.lineTo(x-15*face,y-36);c.lineTo(x-5*face,y-40);c.fill();}
function lockbox(c,x,y,open){// a painted metal trunk with three padlocks
  c.fillStyle='rgba(40,30,20,.25)';c.beginPath();c.ellipse(x,y+4,40,7,0,0,7);c.fill();
  const g=c.createLinearGradient(0,y-30,0,y);g.addColorStop(0,'#3f7f8a');g.addColorStop(1,'#2c5e66');c.fillStyle=g;c.fillRect(x-34,y-30,68,30);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x+20,y-30,14,30);
  c.save();c.translate(x-34,y-30);c.rotate(-open*1.9);c.fillStyle='#4a8f9a';c.fillRect(0,-10,68,10);c.fillStyle='#2c5e66';c.fillRect(0,-2,68,2);c.restore();
  c.strokeStyle='#c9b27a';c.lineWidth=1.4;c.strokeRect(x-34,y-30,68,30);if(open<.1)for(let k=0;k<3;k++){const lx=x-20+k*20,ly=y-26;c.strokeStyle='#8b8f96';c.lineWidth=2;c.beginPath();c.arc(lx,ly-3,3.6,Math.PI,0);c.stroke();c.fillStyle='#b8a25a';RR(c,lx-5,ly-2,10,9,2);c.fill();c.fillStyle='#3a3a3a';c.fillRect(lx-.6,ly+2,1.2,3);}}
function pile(c,x,y,dep,yel,grn){const coin=(cy,col,rim)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,cy,9,3.4,0,0,7);c.fill();c.strokeStyle=rim||'rgba(0,0,0,.35)';c.lineWidth=rim?2:.8;c.stroke();};
  let cy=y;for(let k=0;k<dep;k++){coin(cy,'#a9acb3');cy-=3.2;}for(let k=0;k<yel;k++){coin(cy,'#e2a21b');cy-=3.2;}for(let k=0;k<grn;k++){coin(cy,'#e2a21b','#1b8a4a');cy-=3.2;}}
function pouch(c,x,y,gold){c.fillStyle='#d8c6a0';c.beginPath();c.moveTo(x-7,y);c.quadraticCurveTo(x-9,y-12,x-3,y-14);c.lineTo(x+3,y-14);c.quadraticCurveTo(x+9,y-12,x+7,y);c.closePath();c.fill();c.strokeStyle='#8a6a3a';c.lineWidth=1.2;c.stroke();
  c.beginPath();c.moveTo(x-4,y-13);c.lineTo(x+4,y-13);c.stroke();if(gold){c.fillStyle='#e2a21b';c.beginPath();c.ellipse(x+9,y-4,5,2.2,0,0,7);c.fill();c.strokeStyle='#1b8a4a';c.lineWidth=1;c.stroke();}}
const SPOT={stall:[700,430],goats:[600,330],grain:[120,350],garden:[420,300]};
function scene(c){c.drawImage(BG,10,10);const t=V.t;
  granary(c,110,370,V.grain);garden(c,380,280,V.garden);pen(c,540,318,V.goats,t);
  neem(c,250,440,.95);
  c.fillStyle='#c9ad6e';c.beginPath();c.ellipse(330,452,150,46,0,0,7);c.fill();c.strokeStyle='rgba(140,110,60,.5)';c.lineWidth=1;for(let k=-7;k<=7;k++){c.beginPath();c.moveTo(330+k*20-30,418);c.lineTo(330+k*20+30,490);c.stroke();}
  const front=[],back=[];WOM.forEach(w=>(w.y>452?front:back).push(w));
  back.forEach(w=>woman(c,w));lockbox(c,330,456,V.share>0?Math.min(1,V.share*3):0);front.forEach(w=>woman(c,w));
  stall(c,690,452,V.stall);
  if(V.share>0){const k=Math.min(1,(V.share-.2)/.6);if(k>0)WOM.forEach(w=>{const px=w.x+(330-w.x)*.38,py=w.y+(458-w.y)*.38+12;pile(c,px,py,Math.round(V.dep*k),Math.round(V.yel*k),Math.round(V.grn*k));});}
  // weekly coins into the box, pouches out to the businesses and back
  V.flights.forEach(f=>{const u=Math.min(1,f.u),[x0,y0]=f.from,[x1,y1]=f.to,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u-Math.sin(u*Math.PI)*f.h;
    if(f.kind==='coin'){c.fillStyle='#a9acb3';c.beginPath();c.ellipse(x,y,5,2.2,0,0,7);c.fill();c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=.8;c.stroke();}else pouch(c,x,y,f.kind==='back');});
  // month dial
  if(V.run||V.m>0){c.fillStyle='rgba(255,255,255,.92)';RR(c,700,24,186,40,10);c.fill();T(c,V.share>0?'Share-out day':'Month '+Math.min(12,Math.floor(V.m)+1)+' of 12',716,50,{s:16,w:700});
    for(let k=0;k<12;k++){c.fillStyle=k<V.m?'#C11430':'#d8d8d3';c.beginPath();c.arc(716+k*13.5,58,3,0,7);c.fill();}}}
/* ---------- the close-up: one loan becomes peanuts, paste, oil, then coins again ---------- */
function vig(c,k,x,y,act){const on=act?1:.35;c.globalAlpha=on;
  if(k===0){[0,1,2].forEach(j=>{c.fillStyle='#a9acb3';c.beginPath();c.ellipse(x-8+j*8,y-j*3,11,4,0,0,7);c.fill();c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=.8;c.stroke();});pouch(c,x+20,y+4,false);}
  if(k===1){c.fillStyle='#e7dcc3';c.beginPath();c.moveTo(x-18,y+10);c.quadraticCurveTo(x-22,y-18,x-10,y-22);c.lineTo(x+10,y-22);c.quadraticCurveTo(x+22,y-18,x+18,y+10);c.closePath();c.fill();c.strokeStyle='rgba(120,100,70,.6)';c.lineWidth=1;c.stroke();
    for(let j=0;j<9;j++){const px=x-11+(j%3)*10,py=y-24-Math.floor(j/3)*5;c.fillStyle='#c99a62';c.beginPath();c.ellipse(px,py,5,2.6,j,0,7);c.fill();c.strokeStyle='rgba(110,70,30,.5)';c.stroke();}}
  if(k===2){c.fillStyle='#6e4a2c';c.beginPath();c.moveTo(x-16,y-14);c.lineTo(x+16,y-14);c.lineTo(x+10,y+10);c.lineTo(x-10,y+10);c.closePath();c.fill();c.fillStyle='#8a5a30';c.beginPath();c.ellipse(x,y-14,16,4,0,0,7);c.fill();
    c.fillStyle='#a8743c';c.beginPath();c.ellipse(x,y-14,13,3,0,0,7);c.fill();c.save();c.translate(x+4,y-16);c.rotate(.25+Math.sin(V.t*6)*.08*act);c.fillStyle='#7a5434';RR(c,-3,-44,6,46,3);c.fill();c.restore();}
  if(k===3){c.fillStyle='#9c5a32';c.beginPath();c.ellipse(x-12,y-6,13,11,0,0,7);c.fill();c.fillStyle='#7a4424';c.fillRect(x-18,y-19,12,4);c.fillStyle='#e0a72a';c.beginPath();c.ellipse(x-12,y-16,5,1.6,0,0,7);c.fill();
    c.strokeStyle='#7a4a22';c.lineWidth=3;[[8,-4],[16,-4],[12,-10],[20,-10]].forEach(([dx,dy])=>{c.beginPath();c.arc(x+dx,y+dy,3.8,0,7);c.stroke();});}
  if(k===4){[0,1,2].forEach(j=>{c.fillStyle='#a9acb3';c.beginPath();c.ellipse(x-8+j*8,y-j*3,11,4,0,0,7);c.fill();c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=.8;c.stroke();});
    c.fillStyle='#e2a21b';c.beginPath();c.ellipse(x+16,y-12,11,4,0,0,7);c.fill();c.strokeStyle='#1b8a4a';c.lineWidth=2;c.stroke();}
  c.globalAlpha=1;}
function inset(c){const x=915,y=10,w=475,h=270;c.fillStyle='#fff';c.strokeStyle='#d8d8d3';c.lineWidth=1;RR(c,x,y,w,h,12);c.fill();c.stroke();
  T(c,V.mode==='lend'?'One loan, up close':'Locked in the box',x+16,y+28,{s:17,w:700});
  const P=[[x+70,y+110],[x+190,y+110],[x+310,y+110],[x+400,y+190],[x+190,y+215]],L=['a loan','peanuts','ground to paste','oil and kuli-kuli','back, with a little extra'];
  const lend=V.mode==='lend',ph=lend&&V.run?((V.t*.55)%5):-1,cur=Math.floor(ph);
  c.strokeStyle='#c7c7c2';c.lineWidth=2;c.setLineDash([5,4]);c.beginPath();P.forEach((p,i)=>{i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);});c.lineTo(P[0][0],P[0][1]);c.stroke();c.setLineDash([]);
  P.forEach((p,i)=>{vig(c,i,p[0],p[1],lend&&(cur<0||cur===i||!V.run)?1:0);T(c,L[i],p[0],p[1]+(i===4?30:34),{s:13,w:600,a:'center',c:lend?'#3a3a3a':'#9a9a9a'});});
  if(cur>=0){const p=P[cur],q=P[(cur+1)%5],u=ph-cur;c.strokeStyle='#C11430';c.lineWidth=2.5;c.beginPath();c.arc(p[0],p[1]-6,30,0,7);c.stroke();
    c.fillStyle='#C11430';c.beginPath();c.arc(p[0]+(q[0]-p[0])*u,p[1]+(q[1]-p[1])*u-6,4,0,7);c.fill();}
  if(!lend){c.fillStyle='rgba(255,255,255,.75)';c.fillRect(x+10,y+40,w-20,h-50);lockbox(c,x+w/2,y+160,0);T(c,'The coins sit in the box all year.',x+w/2,y+200,{s:15,w:600,a:'center'});T(c,'Nothing is bought, made or sold with them.',x+w/2,y+222,{s:14,a:'center',c:'#5d5d63'});}
  else T(c,'Fatchima Aboubacar, in the first group, built a peanut-oil business with loans.',x+16,y+h-12,{s:12,c:'#5d5d63'});}
function panel(c){const x=915,y=290;c.fillStyle='#fff';c.strokeStyle='#d8d8d3';c.lineWidth=1;RR(c,x,y,475,500,12);c.fill();c.stroke();T(c,'Mata Masu Dubara,',x+18,y+36,{s:22,w:700});T(c,'“Women on the Move”',x+18,y+64,{s:22,w:700});
  [['📍','1991: Maradi, Niger, with CARE'],['👥','about 20 to 30 members, weekly'],['🔒','one box, three locks, three key keepers'],['🔁','save, lend, repay with interest, share out'],['🥜','loans for oil, goats, grain, gardens'],['🌍','now more than 31 million members'],['⚠️','hard part: more small businesses,']].forEach(([i,t],k)=>{const yy=y+112+k*48;T(c,i,x+32,yy+7,{s:22,a:'center'});T(c,t,x+60,yy+2,{s:17.5,w:600});});
  T(c,'but average income about the same',x+60,y+112+6*48+24,{s:17.5,w:600});T(c,'(a big 2017 study)',x+60,y+112+6*48+48,{s:17.5,w:600});
  T(c,'Sources: CARE; PBS NewsHour (2018); Karlan et al., PNAS (2017).',x+18,y+486,{s:13,c:'#5d5d63'});}
function rhyme(c){const x=24,y=24,w=330,h=122;c.fillStyle='rgba(255,255,255,.93)';c.strokeStyle='#d8d8d3';c.lineWidth=1;RR(c,x,y,w,h,10);c.fill();c.stroke();
  // year one from the deposit chart: the $100 bar and its 7% slice
  c.fillStyle='#4a4d58';c.fillRect(x+30,y+34,40,64);c.fillStyle='#e2a21b';c.fillRect(x+30,y+26,40,8);c.fillStyle='#4a4d58';c.fillRect(x+84,y+34,40,64);c.fillStyle='#e2a21b';c.fillRect(x+84,y+20,40,14);c.fillStyle='#1b8a4a';c.fillRect(x+84,y+17,40,3);
  T(c,'your deposit bars',x+77,y+114,{s:12,a:'center',c:'#5d5d63'});T(c,'=',x+160,y+70,{s:28,w:700,a:'center',c:'#5d5d63'});
  for(let k=0;k<3;k++)pile(c,x+205+k*40,y+96,10-k,3,k===0?2:1);T(c,'a share-out',x+245,y+114,{s:12,a:'center',c:'#5d5d63'});}
function draw(){const cv=V.cv,c=V.cx;if(!cv||!c)return;const r=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),W=Math.round(r.width*dpr),H=Math.round(r.height*dpr);if(!W||!H)return;
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}c.setTransform(1,0,0,1,0,0);c.fillStyle=getComputedStyle(cv.parentNode).backgroundColor||'#fbfbf9';c.fillRect(0,0,W,H);
  const s=Math.min(W/LW,H/LH);c.setTransform(s,0,0,s,(W-LW*s)/2,(H-LH*s)/2);if(!BG)makeBG();
  c.save();RR(c,10,10,767,500,12);c.clip();c.translate(10,10);c.scale(.862,.862);c.translate(-10,-10);scene(c);c.restore();c.strokeStyle='#d8d8d3';c.lineWidth=1;RR(c,10,10,767,500,12);c.stroke();
  c.save();c.translate(792-915,0);inset(c);c.restore();
  c.save();c.translate(792,292);c.scale(1.44,1.44);c.translate(-24,-24);rhyme(c);c.restore();
  c.save();c.translate(1282-915,10-290);panel(c);c.restore();}
/* ---------- the year ---------- */
function step(dt){V.t+=dt;
  if(V.run){const m0=V.m;V.m=Math.min(12,V.m+dt/1.15);
    if(Math.floor(V.m*4)!==Math.floor(m0*4)){WOM.forEach((w,k)=>{if(k%2===Math.floor(V.m*4)%2)V.flights.push({kind:'coin',from:[w.x,w.y-30],to:[330,440],u:0,h:30,sp:1.6});});}
    if(V.mode==='lend'&&Math.floor(V.m)!==Math.floor(m0)&&V.m<11.5){const ks=Object.keys(SPOT);for(let j=0;j<2;j++){const k=ks[(Math.floor(V.m)*2+j)%4];V.flights.push({kind:'out',biz:k,from:[330,440],to:SPOT[k],u:0,h:70,sp:.9});}}
    if(V.m>=12){V.run=false;V.shareGo=true;V.share=0;const r=.05;let B=0,simple=0;for(let k=1;k<=12;k++){B=B*(1+r)+1;}for(let k=1;k<=12;k++)simple+=r*(12-k);
      V.dep=10;if(V.mode==='lend'){V.yel=Math.round(simple*10/12*1.0);V.grn=Math.max(1,Math.round((B-12-simple)*10/12*2));}else{V.yel=0;V.grn=0;}}}
  if(V.shareGo){V.share=Math.min(1,V.share+dt/3.2);if(V.share>=1){V.shareGo=false;if(V.mode==='lend')V.lendDone=true;else V.lockDone=true;paint();if(window.Story)Story.poke();}}
  V.flights=V.flights.filter(f=>{f.u+=dt*f.sp;if(f.u>=1){if(f.kind==='out'){V[f.biz]=Math.min(1,V[f.biz]+.09);V.flights.push({kind:'back',from:SPOT[f.biz],to:[330,440],u:-.6,h:60,sp:.8});}return false;}return true;});}
function loop(ts){if(!V.on)return;const dt=Math.min(.05,(ts-(V.last||ts))/1000);V.last=ts;step(dt);draw();requestAnimationFrame(loop);}
function show(on){if(!V.cv){const sb=document.getElementById('stagebox');if(!sb)return;const cv=document.createElement('canvas');cv.setAttribute('aria-label','A village savings group in Niger: the meeting under a neem tree, a locked box, the businesses its loans pay for, and a close-up of one loan');
  cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:none';sb.appendChild(cv);V.cv=cv;V.cx=cv.getContext('2d');}
  const was=V.on;V.on=!!on;V.cv.style.display=on?'block':'none';if(on&&!was){V.last=0;requestAnimationFrame(loop);}}
function run(){Object.assign(V,{run:true,m:0,share:0,shareGo:false,stall:0,goats:0,grain:0,garden:0,flights:[]});}
function btn(act,v,label,on,dis,primary){return `<button type="button" class="${primary?'vs-p':''}" data-vs="${act}" data-v="${v||''}" aria-pressed="${!!on}" ${dis?'disabled':''}>${label}</button>`;}
function thumb(more){let s='<rect x="0" y="0" width="58" height="52" fill="none"/>';for(let k=0;k<8;k++)s+=`<ellipse cx="29" cy="${46-k*4.2}" rx="12" ry="4" fill="#a9acb3" stroke="rgba(0,0,0,.35)" stroke-width=".8"/>`;
  if(more){for(let k=8;k<10;k++)s+=`<ellipse cx="29" cy="${46-k*4.2}" rx="12" ry="4" fill="#e2a21b" stroke="rgba(0,0,0,.35)" stroke-width=".8"/>`;s+=`<ellipse cx="29" cy="${46-10*4.2}" rx="12" ry="4" fill="#e2a21b" stroke="#1b8a4a" stroke-width="2"/>`;}
  return `<svg width="58" height="56" viewBox="0 0 58 56" aria-hidden="true" style="vertical-align:middle;margin-right:6px">${s}</svg>`;}
function paint(){const box=V.ctl;if(!box)return;let h='';const busy=V.run||V.shareGo;
  if(V.pick!=='more'){h='<div class="choices">'+(V.pick==='same'?'':btn('pick','same',thumb(false)+'Just what she put in'))+btn('pick','more',thumb(true)+'More than she put in')+'</div>';
    if(V.pick==='same')h+='<p class="locked">It can be just what she put in: if the coins only sit in the box. Look at what the group does with them. Tap the other one.</p>';}
  else{h='<div class="choices"><span style="align-self:center;font-weight:700">The coins:</span>'+btn('mode','lock','Stay locked in the box',V.mode==='lock',busy)+btn('mode','lend','Are lent to members',V.mode==='lend',busy)+btn('run','','Run the year',false,busy,true)+'</div>';
    const ms=[['Run a year with the coins lent out',V.lendDone],['Run a year with the coins locked in the box',V.lockDone]];
    h+='<ul class="vs-miss">'+ms.map(([t,d])=>`<li class="${d?'done':''}"><b>${d?'✓':'○'}</b> ${t}</li>`).join('')+'</ul>';
    if(V.lendDone&&V.lockDone)h+='<p class="vs-deep"><b>Go deeper:</b> <a href="https://www.care.org/news-and-stories/village-savings-and-loan-associations-vslas-the-story-behind-cares-global-savings-group-model/" target="_blank" rel="noopener">A box with three padlocks (CARE) ↗</a> · <a href="https://www.pbs.org/newshour/world/from-cattle-to-peanut-butter-cakes-women-in-niger-pool-resources-to-build-businesses" target="_blank" rel="noopener">Women in Niger pool money to build businesses (PBS) ↗</a> · <a href="https://poverty-action.org/impact-savings-groups-lives-rural-poor-ghana-malawi-and-uganda" target="_blank" rel="noopener">What a big study found (IPA) ↗</a></p>';}
  box.innerHTML=h;}
function bind(box){V.ctl=box.querySelector('#vs-ctl')||box;paint();if(box.dataset.vsb)return;box.dataset.vsb='1';
  box.addEventListener('click',e=>{const b=e.target.closest('[data-vs]');if(!b||b.disabled)return;const a=b.dataset.vs,v=b.dataset.v;
    if(a==='pick'){V.pick=v;if(window.Story&&Story.ev)Story.ev('who-pick-'+v);}else if(a==='mode'){V.mode=v;V.m=0;V.share=0;V.flights=[];}else if(a==='run')run();
    paint();if(window.Story){Story.rechrome();Story.poke();}});}
function cap(){if(V.pick!=='more')return 'Maradi, Niger. Every week these women each put a few coins in a locked box. At the end of the year the box is opened and shared out. What does each woman get back?';
  if(V.run)return V.mode==='lend'?'Each week the coins go in. Each month the group lends them out, and the loans come back with a little extra.':'Each week the coins go in, and they stay in the box.';
  if(V.shareGo||V.share>=1)return V.mode==='lend'?'Share-out: her coins (gray), the extra her coins earned (yellow), and the extra that the extra earned (green). Same colors as your deposit bars.':'Share-out: each woman gets back exactly her own coins. Nothing grew.';
  return 'Right, if the coins are working. Choose what happens to the coins, then run the year.';}
return {show,bind,cap,widget:()=>'<div id="vs-ctl"></div>',done:()=>V.lendDone&&V.lockDone,move:()=>V.pick!=='more'?'Tap a picture.':'Run a year both ways.',V};
})();
