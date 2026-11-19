/* "What the Church teaches" card (Nov 19, 2026), part of the Raider Labs Catholic-insight pass.
   Each point is a paraphrase in our own words. CCC = Catechism of the Catholic Church (checked against vatican.va, Nov 19, 2026).
   Teach, don't preach: Church teaching is stated as the Church's teaching; applications are left as "Your call" questions. */
(function(){
'use strict';
const P={
"commonGood": "The goods of the earth are meant for the whole human family. Private property is real, but it serves that larger purpose. (CCC 2402–2403; <i>Magnifica humanitas</i> 65–66, 2026)",
"conditions": "Society should help everyone reach the conditions to grow and thrive: food, housing, health care, education, work and social assistance. (CCC 2288)",
"contracts": "Promises and contracts should be kept, as long as what they commit people to is just, and every contract must be made in good faith. (CCC 2410)",
"hardship": "Paying unjust wages, or forcing up prices by taking advantage of someone’s ignorance or hardship, is a way of taking what belongs to others, even when it is legal. (CCC 2409)",
"jubilee": "The Old Testament set a jubilee year when debts were forgiven, banned interest on loans to the poor, and required paying day workers the same day. These laws answer the call to open your hand to the needy. (CCC 2449; Deuteronomy 15)",
"justWage": "A just wage is the legitimate fruit of work. Fair pay should let a worker support a family with dignity, weighing both what they need and what they contribute. (CCC 2434; Leo XIII, <i>Rerum novarum</i>, 1891)",
"option": "People weighed down by poverty receive a preferential love from the Church, because Christ identified himself with the least. (CCC 2448)",
"solidarity": "Solidarity, also called social friendship, is a direct demand of our shared humanity: we are responsible for one another. (CCC 1939)",
"steward": "Owning something makes you its steward: your goods are meant to bear fruit and to benefit others too, first of all your family. (CCC 2404)",
"taxes": "Sharing responsibility for the common good makes it a moral duty to pay taxes and to vote. (CCC 2240)",
"temperanceGoods": "Temperance keeps our attachment to money and things in check; justice gives others what they are due; solidarity shares as Christ shared. (CCC 2407)",
"usury": "The Church condemns lending that preys on people’s need: usurious, greedy dealings and abusive financial systems that keep poor people and poor countries poor. (CCC 2269, 2438)",
"workDignity": "Work is not just a way to earn money: it expresses and builds up human dignity. (Leo XIV, <i>Magnifica humanitas</i> 149, 2026)"
};
const C={
"livingwage": [
[
"justWage",
"workDignity"
],
"What should a full-time job pay, and who should decide?"
],
"paycheck": [
[
"justWage",
"taxes"
],
"Which of the dollars taken out of your check come back to you, and which help someone else?"
],
"minutesofwork": [
[
"workDignity",
"temperanceGoods"
],
"Is this purchase worth the minutes of your life it costs?"
],
"povertypremium": [
[
"hardship",
"option"
],
"Who pays more for being poor here, and who could change that?"
],
"creditcard": [
[
"usury",
"contracts"
],
"When does lending at interest help someone, and when does it take advantage of them?"
],
"debtfit": [
[
"jubilee",
"contracts"
],
"Should some debts ever be forgiven? Which ones, and why?"
],
"savings": [
[
"steward",
"temperanceGoods"
],
"What is your money for, beyond yourself?"
],
"startearly": [
[
"steward",
"temperanceGoods"
],
"If your savings grow, what would you want them to make possible for others?"
],
"taxworld": [
[
"taxes",
"commonGood"
],
"Which public goods would you protect first if a budget had to be cut?"
],
"taxreceipt": [
[
"taxes",
"commonGood"
],
"Which line on your tax receipt surprised you? Is it a good use of shared money?"
],
"insurance": [
[
"solidarity",
"steward"
],
"Insurance pools risk. Who should be in the pool, and who gets left out?"
],
"costofliving": [
[
"conditions",
"option"
],
"What should every family be able to afford, no matter where they live?"
]
};
const css=`.chur{margin-top:14px;background:var(--card);border:1px solid var(--line);border-left:5px solid #b08d2e;border-radius:12px;padding:12px 16px}
.chur h3{margin:0 0 6px;font-size:1.02rem}.chur p.chur-sub{margin:0 0 8px;color:var(--muted);font-size:.92rem}
.chur ul{margin:0 0 8px;padding-left:1.2em}.chur li{margin:0 0 6px;line-height:1.4}
.chur .chur-call{margin:8px 0 0;padding:8px 12px;background:var(--card2,var(--bg));border-radius:8px}.chur .chur-src{margin:8px 0 0;font-size:.9rem;color:var(--muted)}
.chur a{color:var(--rj-ink,var(--rj));font-weight:600}`;
function card(id){const c=C[id];if(!c)return null;const box=document.createElement('section');box.className='chur';box.setAttribute('aria-label','What the Church teaches');
 box.innerHTML=`<h3>What the Church teaches</h3><p class="chur-sub">Regis Jesuit is a Catholic school. Here is what the Church teaches on this question, offered to every student to think through.</p><ul>${c[0].map(k=>'<li>'+P[k]+'</li>').join('')}</ul><p class="chur-call"><b>Your call:</b> ${c[1]}</p><p class="chur-src">CCC = <a href="https://www.vatican.va/archive/ENG0015/_INDEX.HTM" target="_blank" rel="noopener">Catechism of the Catholic Church</a>. Numbers are paragraphs.</p>`;
 return box;}
function add(sec){if(!sec||!sec.classList||sec.querySelector('.chur'))return;const id=(sec.id||'').replace(/^sim-/,'');const sid=sec.dataset.id||id;
 const b=card(sid);if(!b)return;const anchor=sec.querySelector('.about.terms')||sec.querySelector('details.about');if(!anchor)return;anchor.parentNode.insertBefore(b,anchor);}
function scan(){document.querySelectorAll('#sims > section, #sims > .sim').forEach(add);}
function init(){const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const root=document.getElementById('sims');if(!root)return;scan();new MutationObserver(scan).observe(root,{childList:true,subtree:false});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
