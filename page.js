/* Primus by Vaneguard
   Page logic: package tabs, order summary, FAQ, performance charts. */
function switchTab(tab,btn){
  document.querySelectorAll('.tab-panel').forEach(function(p){p.classList.remove('active');p.hidden=true;});
  document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active');b.setAttribute('aria-selected','false');});
  var panel=document.getElementById('tab-'+tab);
  if(panel){panel.classList.add('active');panel.hidden=false;}
  btn.classList.add('active');
  btn.setAttribute('aria-selected','true');
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
  window._modalOpener=document.activeElement;
  var ov=document.getElementById('modalOverlay');
  ov.classList.add('open');
  var c=ov.querySelector('.modal-close'); if(c)c.focus();
}
function closeModal(){
  document.getElementById('modalOverlay').classList.remove('open');
  if(window._modalOpener&&window._modalOpener.focus) window._modalOpener.focus();
}
addEventListener('keydown',function(e){
  var o=document.getElementById('modalOverlay');
  if(e.key==='Escape'&&o&&o.classList.contains('open')) closeModal();
});
function openTelegram(){window.open('https://t.me/cateb007','_blank');}
function toggleFaq(btn){
  var item=btn.parentElement, open=item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(i){
    i.classList.remove('open');
    var q=i.querySelector('.faq-q'); if(q) q.setAttribute('aria-expanded','false');
  });
  if(!open){ item.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
}

/* Contact composer: builds the enquiry text and hands it to Telegram,
   the visitor's email client, or the clipboard. Nothing is posted from
   this page, so the visitor always sees exactly what gets sent. */
(function(){
  var TG='https://t.me/cateb007';
  var MAIL='PrimusByVaneguardSupport@gmail.com';
  function init(){
    var name=document.getElementById('cfName');
    if(!name) return;
    var interest=document.getElementById('cfInterest'),
        budget=document.getElementById('cfBudget'),
        msg=document.getElementById('cfMsg'),
        out=document.getElementById('cfPreview'),
        status=document.getElementById('cfStatus');

    function build(){
      var who=(name.value||'').trim();
      var lines=[];
      lines.push('Hello Primus, '+(who?'my name is '+who+'.':'I would like to get in touch.'));
      lines.push('');
      lines.push('Interested in: '+interest.value);
      if(budget.value!=='Not decided yet') lines.push('Starting account size: '+budget.value);
      var extra=(msg.value||'').trim();
      if(extra){ lines.push(''); lines.push(extra); }
      return lines.join('\n');
    }
    function paint(){
      var t=build();
      out.textContent = (name.value||msg.value||interest.selectedIndex>0||budget.selectedIndex>0)
        ? t : 'Fill in the fields above to build your message.';
    }
    [name,interest,budget,msg].forEach(function(el){
      el.addEventListener('input',paint); el.addEventListener('change',paint);
    });
    paint();

    function say(text,warn){
      status.textContent=text;
      status.className='cf-status'+(warn?' warn':'');
    }
    function ready(){
      if(!(name.value||'').trim()){
        say('Add your name first so we know who we are replying to.',true);
        name.focus();
        return false;
      }
      return true;
    }
    document.getElementById('cfTelegram').addEventListener('click',function(){
      if(!ready()) return;
      window.open(TG+'?text='+encodeURIComponent(build()),'_blank','noopener');
      say('Telegram opened with your message ready to send.');
    });
    document.getElementById('cfEmail').addEventListener('click',function(){
      if(!ready()) return;
      var subject='Enquiry: '+interest.value;
      window.location.href='mailto:'+MAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(build());
      say('Your email app should open with the message ready to send.');
    });
    document.getElementById('cfCopy').addEventListener('click',function(){
      if(!ready()) return;
      var text=build();
      function done(){ say('Message copied. Paste it wherever you prefer.'); }
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(done).catch(function(){ say('Could not copy automatically. Select the preview text instead.',true); });
      } else {
        var ta=document.createElement('textarea');
        ta.value=text; ta.setAttribute('readonly','');
        ta.style.position='fixed'; ta.style.left='-9999px';
        document.body.appendChild(ta); ta.select();
        try{ document.execCommand('copy'); done(); }
        catch(e){ say('Could not copy automatically. Select the preview text instead.',true); }
        document.body.removeChild(ta);
      }
    });
  }
  document.readyState==='loading'?addEventListener('DOMContentLoaded',init):init();
})();

document.addEventListener('DOMContentLoaded',function(){

  /* packages page: #mt5 / #tv / #ind in the URL selects that tab */
  function tabFromHash(){
    var h=(location.hash||'').replace('#','');
    var btns=document.querySelectorAll('.tab-btn');
    var idx={mt5:0,tv:1,ind:2}[h];
    if(idx!==undefined&&btns[idx]&&document.getElementById('tab-'+h)) switchTab(h,btns[idx]);
  }
  tabFromHash();
  addEventListener('hashchange',tabFromHash);

  /* seeded 156-week performance sequence */
  var seq=[],wc=0,ac=0,mc=0;
  var missAt=[12,28,45,67,89,130];
  var aboveAt=[7,22,37,52,68,83,98,112,120,135,148];
  for(var i=0;i<156;i++){
    if(missAt.includes(i)&&mc<6){seq.push('m');mc++;}
    else if(aboveAt.includes(i)&&ac<11){seq.push('a');ac++;}
    else{seq.push('w');wc++;}
  }
  function spread(i,lo,hi){var x=Math.sin(i*12.9898)*43758.5453;x=x-Math.floor(x);return lo+x*(hi-lo);}
  var heights=seq.map(function(t,i){return t==='w'?spread(i,52,88):t==='a'?spread(i,87,99):spread(i,15,35);});

  var perfEl=document.getElementById('perfChart');
  if(perfEl){
    perfEl.setAttribute('role','img');
    perfEl.setAttribute('aria-label','156 weeks of results: 139 weeks hit target, 11 weeks above target, 6 weeks below target.');
    seq.forEach(function(t,i){
      var b=document.createElement('div');
      b.className='pc-bar '+t;
      b.style.height=heights[i]+'%';
      perfEl.appendChild(b);
    });
  }

  var pvEl=document.getElementById('pvChart');
  if(pvEl){pvEl.setAttribute('role','img');pvEl.setAttribute('aria-label','Results for the last 40 weeks, by whether the weekly target was met.');}
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

});
