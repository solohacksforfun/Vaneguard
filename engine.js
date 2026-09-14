/* Primus by Vaneguard
   Interaction: navigation, reading progress, mobile menu,
   scroll reveals, and the point-sphere canvas. */

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
      var openMenu=function(){mnav.classList.add('open');burger.setAttribute('aria-expanded','true');var f=mnav.querySelector('.mclose');if(f)f.focus();};
      var closeMenu=function(){mnav.classList.remove('open');burger.setAttribute('aria-expanded','false');};
      burger.addEventListener('click',openMenu);
      mnav.querySelectorAll('a,.mclose').forEach(function(el){el.addEventListener('click',closeMenu)});
      addEventListener('keydown',function(e){if(e.key==='Escape'&&mnav.classList.contains('open')){closeMenu();burger.focus();}});
    }
    /* active link: match current page, then section in view */
    var here=location.pathname.split('/').pop()||'index.html';
    document.querySelectorAll('.nav-links a.top').forEach(function(a){
      var href=a.getAttribute('href')||'';
      var file=href.split('#')[0]||'index.html';
      if(file===here&&href.indexOf('#')===-1) a.classList.add('active');
    });
    var navMap={};
    document.querySelectorAll('.nav-links a.top').forEach(function(a){
      var href=a.getAttribute('href')||'';
      var file=href.split('#')[0]||'index.html', hash=href.split('#')[1];
      if(hash&&file===here) navMap[hash]=a;
    });
    if(Object.keys(navMap).length){
      var spyObs=new IntersectionObserver(function(es){es.forEach(function(e){
        if(e.isIntersecting&&navMap[e.target.id]){
          document.querySelectorAll('.nav-links a.top.active').forEach(function(a){a.classList.remove('active');});
          navMap[e.target.id].classList.add('active');
        }
      });},{rootMargin:'-40% 0px -55% 0px'});
      document.querySelectorAll('section[id]').forEach(function(s){spyObs.observe(s);});
    }
  }
  document.readyState==='loading'?addEventListener('DOMContentLoaded',init):init();
})();

/* ── SCROLL REVEALS ── */
(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  function init(){document.querySelectorAll('.rv,.rv-l,.rv-r,.rv-s,.stg').forEach(function(el){io.observe(el);});}
  document.readyState==='loading'?addEventListener('DOMContentLoaded',init):init();
})();

/* Point sphere: golden-spiral distribution generated at runtime.
   Follows the pointer, idles on its own, and reduces detail under load. */
(function(){
  var TAU = Math.PI*2;
  function buildSphere(canvas){
    var ctx = canvas.getContext('2d');
    var small = innerWidth<760;
    var density = +canvas.dataset.density||480;
    if(small) density = Math.min(density, 340);
    var speed = +canvas.dataset.speed||1;
    var W,H,R,cx,cy,dpr=Math.min(devicePixelRatio||1,small?1.5:1.75);
    var pts=[], rotY=0.15, rotX=0.32, targX=0.32, targY=null, visible=true;
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){es.forEach(function(e){visible=e.isIntersecting;});},{threshold:0}).observe(canvas);
    }
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
      if(!visible) return;
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
