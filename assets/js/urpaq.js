/* Adal Urpaq — 3D/2D anti-corruption effects (Three.js, GSAP, Lenis) */
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var mouse={x:0,y:0};addEventListener('pointermove',function(e){mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight*2-1)});

/* smooth scroll */
var lenis=null;
if(window.Lenis&&!reduce){lenis=new Lenis({lerp:.1});
 if(window.gsap&&window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0)}
 else requestAnimationFrame(function r(t){lenis.raf(t);requestAnimationFrame(r)});
 $$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href');if(id.length>1&&$(id)){e.preventDefault();lenis.scrollTo(id,{offset:-80})}})});
}

/* split-text reveal for headings */
$$('h1, section h2:not(.finale-t)').forEach(function(h){
 if(h.dataset.split)return;h.dataset.split=1;
 (function walk(n){[].slice.call(n.childNodes).forEach(function(c){
  if(c.nodeType===3){var f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(function(w){
   if(!w)return;if(/^\s+$/.test(w)){f.appendChild(document.createTextNode(w));return}
   var o=document.createElement('span');o.className='w';var i=document.createElement('span');i.textContent=w;o.appendChild(i);f.appendChild(o)});c.replaceWith(f)}
  else if(c.nodeType===1&&!c.classList.contains('grad'))walk(c);
  else if(c.nodeType===1){c.classList.add('w');c.innerHTML='<span>'+c.innerHTML+'</span>'}
 })})(h);
 $$('.w>span',h).forEach(function(s,i){s.style.transitionDelay=(i*0.05)+'s'});
});
var sio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('split-in');sio.unobserve(e.target)}})},{threshold:.2});
$$('[data-split]').forEach(function(h){reduce?h.classList.add('split-in'):sio.observe(h)});

/* magnetic buttons */
if(!reduce)$$('.btn').forEach(function(b){
 b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.25)+'px,'+((e.clientY-r.top-r.height/2)*.35)+'px)'});
 b.addEventListener('pointerleave',function(){b.style.transform=''});
});

/* 3D tilt cards */
if(!reduce&&matchMedia('(hover:hover)').matches)$$('.bcard,.hcard,.step,.vcard,.stat').forEach(function(c){
 c.setAttribute('data-tilt','');c.style.transition='transform .4s cubic-bezier(.22,1,.36,1)';
 c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  c.style.transform='perspective(900px) rotateX('+(-y*6)+'deg) rotateY('+(x*8)+'deg) translateZ(0)'});
 c.addEventListener('pointerleave',function(){c.style.transform=''});
});

/* cursor ring */
var cur=$('.cur');if(cur&&matchMedia('(hover:hover)').matches){var cx=0,cy=0,tx=0,ty=0;
 addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;cur.classList.toggle('big',!!e.target.closest('a,button,summary,input,select,textarea,label'))});
 (function loop(){cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;cur.style.transform='translate('+cx+'px,'+cy+'px)';requestAnimationFrame(loop)})();}
else if(cur)cur.remove();

/* ===== HERO 3D: glass shield deflecting bribe banknotes & coins ===== */
var cv=$('#scene3d');
if(cv&&window.THREE){try{
 var T=THREE,R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio,2));
 var S=new T.Scene(),C=new T.PerspectiveCamera(40,1,.1,100);C.position.set(0,0,14);
 S.add(new T.AmbientLight(0xffffff,.9));var dl=new T.DirectionalLight(0xffffff,1.6);dl.position.set(4,6,8);S.add(dl);
 var pl=new T.PointLight(0xffffff,10,30);pl.position.set(-4,2,6);S.add(pl);
 var root=new T.Group();S.add(root);
 // shield shape
 var sh=new T.Shape();sh.moveTo(0,2.6);sh.lineTo(2.1,1.9);sh.lineTo(2.1,.2);sh.bezierCurveTo(2.1,-1.5,1.1,-2.4,0,-2.9);sh.bezierCurveTo(-1.1,-2.4,-2.1,-1.5,-2.1,.2);sh.lineTo(-2.1,1.9);sh.closePath();
 var sg=new T.ExtrudeGeometry(sh,{depth:.5,bevelEnabled:true,bevelThickness:.18,bevelSize:.14,bevelSegments:6});sg.center();
 var shield=new T.Mesh(sg,new T.MeshPhysicalMaterial({color:0xffffff,metalness:.1,roughness:.08,clearcoat:1,transparent:true,opacity:.55}));
 var edge=new T.LineSegments(new T.EdgesGeometry(sg,30),new T.LineBasicMaterial({color:0x0057b8,transparent:true,opacity:.55}));
 // check mark
 var ck=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-.9,0,0),new T.Vector3(-.2,-.75,0),new T.Vector3(1.1,.85,0)],false,0,'catmullrom',0),40,.17,12,false),new T.MeshStandardMaterial({color:0xf2b705,metalness:.6,roughness:.25}));
 ck.position.z=.5;var sgp=new T.Group();sgp.add(shield,edge,ck);root.add(sgp);
 // banknotes & coins
 var noteMat=new T.MeshStandardMaterial({color:0xcfe3ff,roughness:.5,side:T.DoubleSide});
 var coinMat=new T.MeshStandardMaterial({color:0xffc21a,metalness:.5,roughness:.3,emissive:0x5a3a00});
 var noteG=new T.BoxGeometry(1.3,.6,.02),coinG=new T.CylinderGeometry(.24,.24,.06,32);
 var items=[];for(var i=0;i<26;i++){var m=new T.Mesh(i%3?coinG:noteG,i%3?coinMat:noteMat);
  var a=Math.random()*Math.PI*2,r=3.6+Math.random()*2.6;m.userData={a:a,r:r,y:(Math.random()-.5)*6,s:(.15+Math.random()*.25)*(Math.random()<.5?-1:1),rx:Math.random()*.03,push:0};
  m.rotation.set(Math.random()*6,Math.random()*6,0);root.add(m);items.push(m)}
 // red "bribe" ring that shatters
 var ring=new T.Mesh(new T.TorusGeometry(3.2,.025,8,140),new T.MeshBasicMaterial({color:0x0078d4,transparent:true,opacity:.35}));root.add(ring);
 var scrollP=0;addEventListener('scroll',function(){scrollP=Math.min(1,scrollY/innerHeight)},{passive:true});
 function size(){var w=cv.clientWidth,h=cv.clientHeight;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix();root.position.x=w>900?4.2:0;root.scale.setScalar(w>900?1.05:.6);root.position.y=w>900?.3:-2.6}
 size();addEventListener('resize',size);
 var clock=new T.Clock(),vis=true;new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(cv);
 (function tick(){requestAnimationFrame(tick);if(!vis)return;var t=clock.getElapsedTime();
  sgp.rotation.y+=((mouse.x*.6+Math.sin(t*.5)*.25)-sgp.rotation.y)*.05;sgp.rotation.x+=((-mouse.y*.3)-sgp.rotation.x)*.05;sgp.position.y=Math.sin(t)*.15;
  ring.rotation.x=1.2+Math.sin(t*.3)*.2;ring.rotation.y=t*.2;ring.scale.setScalar(1+scrollP*1.5);ring.material.opacity=.35*(1-scrollP);
  items.forEach(function(m){var u=m.userData;u.a+=u.s*.01*(reduce?0:1);var rr=u.r+scrollP*8;
   m.position.set(Math.cos(u.a)*rr,u.y+Math.sin(t+u.a)*.3,Math.sin(u.a)*rr*.6-1);m.rotation.x+=u.rx;m.rotation.y+=.01});
  R.render(S,C)})();
}catch(err){console.warn('3D disabled',err)}}

/* ===== STAMP SCENE: coins rain, stamp "ЖОҚ" slams on scroll ===== */
var cc=$('#coins');
if(cc){var g=cc.getContext('2d'),W,H,dpr=Math.min(devicePixelRatio,2),coins=[],prog=0;
 function rs(){W=cc.clientWidth;H=cc.clientHeight;cc.width=W*dpr;cc.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0)}rs();addEventListener('resize',rs);
 for(var k=0;k<70;k++)coins.push({x:Math.random(),y:Math.random()*-1,v:.002+Math.random()*.004,r:8+Math.random()*16,ph:Math.random()*6});
 (function draw(t){requestAnimationFrame(draw);g.clearRect(0,0,W,H);
  coins.forEach(function(c){c.y+=c.v*(1-prog*.9);if(c.y>1.1){c.y=-.1;c.x=Math.random()}
   var x=c.x*W+(prog*(c.x-.5)*W*1.4),y=c.y*H,sx=Math.abs(Math.cos(t/400+c.ph));
   g.globalAlpha=1-prog*.8;g.beginPath();g.ellipse(x,y,c.r*sx+1,c.r,0,0,7);
   var gr=g.createLinearGradient(x-c.r,y-c.r,x+c.r,y+c.r);gr.addColorStop(0,'#ffe27a');gr.addColorStop(1,'#d99a00');g.fillStyle=gr;g.fill();
   g.strokeStyle='rgba(150,100,0,.4)';g.stroke()});g.globalAlpha=1})(0);
 var stamp=$('.stamp');
 if(window.gsap&&window.ScrollTrigger&&!reduce){gsap.registerPlugin(ScrollTrigger);
  var tl=gsap.timeline({scrollTrigger:{trigger:'.stamp-scene',start:'top top',end:'bottom bottom',scrub:.6,onUpdate:function(s){prog=s.progress}}});
  tl.fromTo('.stamp-word',{scale:.85,opacity:.2,filter:'blur(8px)'},{scale:1,opacity:1,filter:'blur(0px)',duration:1})
    .to(stamp,{opacity:1,scale:1,rotate:-12,duration:.35,ease:'power4.in'})
    .to('.stamp-pin',{x:6,duration:.04,yoyo:true,repeat:3})
    .to({},{duration:.6});
 }else if(stamp){stamp.style.opacity=1;stamp.style.transform='translate(-50%,-50%) rotate(-12deg)'}
}

/* parallax for section headings */
if(window.gsap&&window.ScrollTrigger&&!reduce){$$('.center').forEach(function(el){gsap.fromTo(el,{y:40},{y:-20,ease:'none',scrollTrigger:{trigger:el,scrub:true}})})}
})();
/* finale reveal */
(function(){var f=document.querySelector('.finale');if(!f)return;
 if(!('IntersectionObserver' in window)){f.classList.add('in');return}
 var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){f.classList.add('in');io.disconnect()}},{threshold:.25});io.observe(f);})();
