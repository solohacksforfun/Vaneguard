/* ══════════════════════════════════════════════════════
   PRIMUS BY VANEGUARD — Interaction Engine
   Nav / progress / mobile menu / magnetic buttons / tilt cards /
   scroll reveals / procedural sphere — ported from the Josh
   Automated engine. Structure and motion identical; the sphere
   is generated at runtime (no fixed shape data) and colored to
   the Primus palette.
   ══════════════════════════════════════════════════════ */

/* ── NAV / PROGRESS / MOBILE MENU ── */
(function(){
  function init(){
    var nav=document.getElementById('nav'),pbar=document.getElementById('pbar'),stop=document.getElementById('stop'),fab=document.getElementById('tgFab');
    function onScroll(){
      var y=scrollY;
      if(nav) nav.classList.toggle('stuck',y>24);
      if(pbar){var h=document.documentElement.scrollHeight-innerHeight;pbar.style.width=(h>0?y/h*100:0)+'%';}
      if(stop) stop.classList.toggle('vis',y>700);
      if(fab) fab.classList.toggle('show',y>520);
    }
    addEventListener('scroll',onScroll,{passive:true});
    onScroll();
    if(stop) stop.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'})});
    var burger=document.getElementById('burger'),mnav=document.getElementById('mnav');
    if(burger&&mnav){
      burger.addEventListener('click',function(){mnav.classList.add('open')});
      mnav.querySelectorAll('a,.mclose').forEach(function(el){el.addEventListener('click',function(){mnav.classList.remove('open')})});
    }
    /* highlight the nav link for the section in view */
    var navMap={};
    document.querySelectorAll('.nav-links a.top[href^="#"]').forEach(function(a){navMap[a.getAttribute('href').slice(1)]=a;});
    var spyObs=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting&&navMap[e.target.id]){
        document.querySelectorAll('.nav-links a.top.active').forEach(function(a){a.classList.remove('active');});
        navMap[e.target.id].classList.add('active');
      }
    });},{rootMargin:'-40% 0px -55% 0px'});
    document.querySelectorAll('section[id]').forEach(function(s){spyObs.observe(s);});
  }
  document.readyState==='loading'?addEventListener('DOMContentLoaded',init):init();
})();

/* ── SCROLL REVEALS ── */
(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  function init(){document.querySelectorAll('.rv,.rv-l,.rv-r,.rv-s,.stg').forEach(function(el){io.observe(el);});}
  document.readyState==='loading'?addEventListener('DOMContentLoaded',init):init();
})();

/* ── MAGNETIC BUTTONS (desktop) ── */
(function(){
  if(matchMedia('(hover:none)').matches) return;
  function init(){
    document.querySelectorAll('.btn-g,.btn-o').forEach(function(b){
      b.addEventListener('pointermove',function(e){
        var r=b.getBoundingClientRect();
        b.style.transform='translate('+((e.clientX-r.left-r.width/2)*0.14)+'px,'+((e.clientY-r.top-r.height/2)*0.24)+'px)';
      });
      b.addEventListener('pointerleave',function(){b.style.transform='';});
    });
  }
  document.readyState==='loading'?addEventListener('DOMContentLoaded',init):init();
})();

/* ── TILT CARDS (desktop) ── */
(function(){
  if(matchMedia('(hover:none)').matches) return;
  function init(){
    document.querySelectorAll('.card').forEach(function(c){
      c.addEventListener('pointermove',function(e){
        var r=c.getBoundingClientRect();
        var px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
        var x=px-0.5, y=py-0.5;
        c.style.setProperty('--mx',(px*100).toFixed(1)+'%');
        c.style.setProperty('--my',(py*100).toFixed(1)+'%');
        c.style.transform='perspective(600px) rotateX('+(-y*5).toFixed(2)+'deg) rotateY('+(x*5).toFixed(2)+'deg) translateY(-2px)';
      });
      c.addEventListener('pointerleave',function(){
        c.style.transform='';
        c.style.setProperty('--mx','50%'); c.style.setProperty('--my','50%');
      });
    });
  }
  document.readyState==='loading'?addEventListener('DOMContentLoaded',init):init();
})();

/* ── PROCEDURAL SPHERE — golden-spiral point distribution, generated
   at runtime (no fixed shape/logo data). Reacts to pointer position,
   idles on its own, auto-degrades quality under load. ── */
(function(){
  var TAU = Math.PI*2;
  function buildSphere(canvas){
    var ctx = canvas.getContext('2d');
    var density = +canvas.dataset.density||480;
    var speed = +canvas.dataset.speed||1;
    var W,H,R,cx,cy,dpr=Math.min(devicePixelRatio||1,1.75);
    var pts=[], rotY=0.15, rotX=0.32, targX=0.32, targY=null;
    function size(){
      var r=canvas.getBoundingClientRect();
      W=r.width;H=r.height;
      canvas.width=W*dpr;canvas.height=H*dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      cx=W/2;cy=H/2;R=Math.min(W,H)*0.40;
    }
    function build(){
      pts=[];
      var golden=Math.PI*(3-Math.sqrt(5));
      for(var i=0;i<density;i++){
        var y=1-(i/(density-1))*2, rad=Math.sqrt(1-y*y), th=golden*i;
        pts.push({x:Math.cos(th)*rad, y:y, z:Math.sin(th)*rad, tw:Math.random()*TAU});
      }
    }
    var host = canvas.parentElement || canvas;
    host.addEventListener('pointermove', function(e){
      var r=host.getBoundingClientRect();
      targX=0.32+((e.clientY-r.top)/r.height-.5)*0.9;
      targY=0.15+((e.clientX-r.left)/r.width-.5)*0.7;
    });
    host.addEventListener('pointerleave', function(){ targX=0.32; targY=null; });

    var last=0, ftSum=0, ftN=0, qCool=0, pFrac=1, motion=1;
    function governQuality(dt){
      ftSum+=dt; ftN++;
      if(ftN<30) return;
      var avg=ftSum/ftN; ftSum=0; ftN=0;
      if(qCool>0){ qCool--; return; }
      var SLOW=20.5, FAST=13.0;
      if(avg>SLOW){
        if(pFrac>0.35){ pFrac=Math.max(0.0,pFrac-0.33); qCool=4; return; }
        if(motion>0.45){ motion=0.40; qCool=4; return; }
        return;
      }
      if(avg<FAST){
        if(motion<1){ motion=1; qCool=4; return; }
        if(pFrac<1){ pFrac=Math.min(1,pFrac+0.33); qCool=4; }
      }
    }
    function frame(t){
      requestAnimationFrame(frame);
      var dt = t-last;
      if(dt<16) return;
      governQuality(dt);
      last=t;
      rotY+=0.0026*speed*motion;
      rotX+=(targX-rotX)*0.05;
      if(targY!==null) rotY+=(targY-rotY)*0.02;
      ctx.clearRect(0,0,W,H);
      var sy=Math.sin(rotY),cy2=Math.cos(rotY),sx=Math.sin(rotX),cx2=Math.cos(rotX);
      var proj=[];
      var limit = Math.floor(pts.length*pFrac);
      for(var j=0;j<limit;j++){
        var p=pts[j];
        var x=p.x*cy2-p.z*sy, z=p.x*sy+p.z*cy2;
        var y=p.y*cx2-z*sx; z=p.y*sx+z*cx2;
        proj.push({x:x,y:y,z:z,tw:p.tw});
      }
      proj.sort(function(a,b){return a.z-b.z});
      for(var k=0;k<proj.length;k++){
        var q=proj[k];
        var depth=(q.z+1)/2;
        var px=cx+q.x*R, py=cy+q.y*R;
        var tw=0.75+Math.sin(t*0.002+q.tw)*0.25;
        var alpha=(0.08+depth*0.72)*tw;
        var sz=0.6+depth*1.7;
        ctx.beginPath();ctx.arc(px,py,sz,0,TAU);
        ctx.fillStyle = depth>.82
          ? 'rgba(201,168,76,'+alpha+')'
          : 'rgba(20,50,160,'+(alpha*0.85)+')';
        ctx.fill();
      }
    }
    size();build();addEventListener('resize',size);requestAnimationFrame(frame);
  }
  function init(){ document.querySelectorAll('canvas.pv-orb').forEach(buildSphere); }
  document.readyState==='loading'?addEventListener('DOMContentLoaded',init):init();
})();
