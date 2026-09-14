/* ══════════════════════════════════════════════════════
   PRIMUS BY VANEGUARD — Page logic
   Tabs, cart/checkout, modal, FAQ, performance charts, live
   rate ticks — ported as-is from the original build.
   ══════════════════════════════════════════════════════ */
function switchTab(tab,btn){
  document.querySelectorAll('.tab-panel').forEach(function(p){p.classList.remove('active');});
  document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active');});
  document.getElementById('tab-'+tab).classList.add('active');
  btn.classList.add('active');
}

var cart={};
function toggleCard(card,name,price){
  if(card.classList.contains('contact-card'))return;
  var btn=card.querySelector('.p-btn-sel');
  if(cart[name]){delete cart[name];card.classList.remove('selected');if(btn){btn.classList.remove('sel');btn.textContent='+ Add to Order';}}
  else{cart[name]=price;card.classList.add('selected');if(btn){btn.classList.add('sel');btn.textContent='Added';}}
  updateBar();
}
function toggleInd(card,name,price){
  var btn=card.querySelector('.p-btn-sel');
  if(cart[name]){delete cart[name];card.classList.remove('selected');if(btn){btn.classList.remove('sel');btn.textContent='+ Add to Order';}}
  else{cart[name]=price;card.classList.add('selected');if(btn){btn.classList.add('sel');btn.textContent='Added';}}
  updateBar();
}
function toggleAddon(row,name,price){
  if(row.classList.contains('checked')){delete cart[name];row.classList.remove('checked');}
  else{cart[name]=price;row.classList.add('checked');}
  updateBar();
}
function updateBar(){
  var keys=Object.keys(cart);
  var total=keys.reduce(function(s,k){return s+cart[k];},0);
  document.getElementById('cbTotal').textContent='$'+total.toLocaleString();
  document.getElementById('cbItems').textContent=keys.length?keys.join(' \u00b7 '):'No items selected';
  document.getElementById('checkoutBar').classList.toggle('visible',keys.length>0);
}
function clearCart(){
  cart={};
  document.querySelectorAll('.p-card.selected,.ind-card.selected').forEach(function(c){
    c.classList.remove('selected');
    var b=c.querySelector('.p-btn-sel');
    if(b){b.classList.remove('sel');b.textContent='+ Add to Order';}
  });
  document.querySelectorAll('.card-addon-row.checked').forEach(function(r){r.classList.remove('checked');});
  updateBar();
}
function openModal(){
  var keys=Object.keys(cart);
  if(!keys.length)return;
  var total=keys.reduce(function(s,k){return s+cart[k];},0);
  document.getElementById('modalRows').innerHTML=keys.map(function(k){return '<div class="modal-row"><span>'+k+'</span><span>$'+cart[k].toLocaleString()+'</span></div>';}).join('');
  document.getElementById('modalTotal').textContent='$'+total.toLocaleString();
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal(){document.getElementById('modalOverlay').classList.remove('open');}
function openTelegram(){window.open('https://t.me/cateb007','_blank');}
function openTelegramReport(){
  var msg=encodeURIComponent("Hey Cate, I would like a complete performance report for the \u2014 [insert bot name e.g. $1,000 Standard MT5 Bot] \u2014 please.");
  window.open('https://t.me/cateb007?text='+msg,'_blank');
}
function toggleFaq(btn){
  var item=btn.parentElement, open=item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(i){i.classList.remove('open');});
  if(!open)item.classList.add('open');
}

document.addEventListener('DOMContentLoaded',function(){

  /* seeded 156-week performance sequence */
  var seq=[],wc=0,ac=0,mc=0;
  var missAt=[12,28,45,67,89,130];
  var aboveAt=[7,22,37,52,68,83,98,112,120,135,148];
  for(var i=0;i<156;i++){
    if(missAt.includes(i)&&mc<6){seq.push('m');mc++;}
    else if(aboveAt.includes(i)&&ac<11){seq.push('a');ac++;}
    else{seq.push('w');wc++;}
  }
  var heights=seq.map(function(t){return t==='w'?52+Math.random()*36:t==='a'?87+Math.random()*12:15+Math.random()*20;});

  var perfEl=document.getElementById('perfChart');
  var startDate=new Date('2023-06-19');
  function weekDateLabel(weekIndex){
    var d=new Date(startDate);
    d.setDate(d.getDate()+weekIndex*7);
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  }
  if(perfEl)seq.forEach(function(t,i){
    var b=document.createElement('div');
    b.className='pc-bar '+t;
    b.style.height=heights[i]+'%';
    var label=t==='w'?'Hit Target':t==='a'?'Above Target':'Below Target';
    b.title='Week '+(i+1)+' \u2014 '+weekDateLabel(i)+' \u2014 '+label;
    perfEl.appendChild(b);
  });

  var pvEl=document.getElementById('pvChart');
  if(pvEl)seq.slice(0,40).forEach(function(t,i){
    var b=document.createElement('div');
    b.className='pv-bar '+t;
    b.style.height=heights[i]+'%';
    pvEl.appendChild(b);
  });

  var circ=2*Math.PI*48;
  function animateDonut(){
    var total=156,hit=139,above=11,miss=6;
    var aboveArc=circ*(above/total),hitArc=circ*(hit/total),missArc=circ*(miss/total);
    var ae=document.getElementById('donut-above'),he=document.getElementById('donut-hit'),me=document.getElementById('donut-miss');
    if(ae){ae.style.strokeDasharray=aboveArc+' '+circ;ae.style.strokeDashoffset='0';}
    if(he){he.style.strokeDasharray=hitArc+' '+circ;he.style.strokeDashoffset=(-aboveArc)+'';}
    if(me){me.style.strokeDasharray=missArc+' '+circ;me.style.strokeDashoffset=(-(aboveArc+hitArc))+'';}
  }
  var donutEl=document.querySelector('.donut-svg');
  if(donutEl){
    var donutObs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){setTimeout(animateDonut,200);donutObs.disconnect();}});},{threshold:0.4});
    donutObs.observe(donutEl);
  }else{setTimeout(animateDonut,600);}

  [perfEl,pvEl].forEach(function(chart){
    if(!chart)return;
    var bars=chart.querySelectorAll('.pc-bar,.pv-bar');
    bars.forEach(function(b,i){b.style.transitionDelay=(i*4)+'ms';});
    var growObs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){chart.classList.add('chart-grow');growObs.disconnect();}});},{threshold:0.3});
    growObs.observe(chart);
  });

  function countUp(el){
    var raw=el.textContent.trim();
    var m=raw.match(/^(\d+(?:\.\d+)?)(%?)$/);
    if(!m)return;
    var target=parseFloat(m[1]),suffix=m[2],dec=m[1].includes('.')?1:0,dur=1400,t0=performance.now();
    function frame(t){
      var p=Math.min((t-t0)/dur,1),eased=1-Math.pow(1-p,3);
      el.textContent=(target*eased).toFixed(dec)+suffix;
      if(p<1)requestAnimationFrame(frame);else el.textContent=raw;
    }
    requestAnimationFrame(frame);
  }
  var countObs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){countUp(e.target);countObs.unobserve(e.target);}});},{threshold:0.6});
  document.querySelectorAll('.trust-num,.stat-v,.pvs-val').forEach(function(el){countObs.observe(el);});

  function fluctuate(base,minDrift,maxDrift){
    var drift=(Math.random()*(maxDrift-minDrift)+minDrift)*(Math.random()<0.5?-1:1);
    var val=base+drift;
    if(val<base-1.5)val=base-1.5;
    if(val>base+1.5)val=base+1.5;
    return val;
  }
  function liveTick(el,v){
    el.style.opacity='0.35';el.style.transform='translateY(3px)';
    setTimeout(function(){el.textContent=v.toFixed(1)+'%';el.style.opacity='1';el.style.transform='translateY(0)';},250);
  }
  function updateLiveRates(){
    var overall=document.getElementById('liveWinRate');
    var gold=document.getElementById('pairRateGold');
    var eur=document.getElementById('pairRateEur');
    var gbp=document.getElementById('pairRateGbp');
    if(overall)liveTick(overall,fluctuate(89,0.02,0.7));
    if(gold)liveTick(gold,fluctuate(89.4,0.02,0.6));
    if(eur)liveTick(eur,fluctuate(86.1,0.02,0.8));
    if(gbp)liveTick(gbp,fluctuate(87.6,0.02,0.7));
  }
  setTimeout(updateLiveRates,1200);
  setInterval(updateLiveRates,8000);

});
