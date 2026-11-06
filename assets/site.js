(()=>{'use strict';
const header=document.getElementById('cabecalho');
const nav=document.getElementById('mobile-nav');
const toggle=document.querySelector('.menu-toggle');
const year=document.getElementById('current-year');
if(year)year.textContent=String(new Date().getFullYear());
const closeMenu=()=>{if(!toggle||!nav)return;nav.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menu')};
if(toggle&&nav){
  toggle.addEventListener('click',()=>{const opening=nav.hidden;nav.hidden=!opening;toggle.setAttribute('aria-expanded',String(opening));toggle.setAttribute('aria-label',opening?'Fechar menu':'Abrir menu')});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  window.addEventListener('resize',()=>{if(window.innerWidth>900)closeMenu()});
  document.addEventListener('click',e=>{if(!header.contains(e.target))closeMenu()})
}
const onScroll=()=>header&&header.classList.toggle('is-scrolled',window.scrollY>8);
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
const elements=[...document.querySelectorAll('.reveal')];
if('IntersectionObserver'in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.09,rootMargin:'0px 0px -25px 0px'});
  elements.forEach(el=>observer.observe(el));
}else elements.forEach(el=>el.classList.add('is-visible'));
const gallery=document.getElementById('media-gallery');
const safePath=s=>typeof s==='string'&&s.startsWith('assets/media/')&&!s.includes('..')&&/\.(jpg|jpeg|png|webp|avif|mp4|webm)$/i.test(s);
const add=(tag,cls,parent,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;if(parent)parent.appendChild(el);return el};
function renderMedia(items){
 if(!gallery||!Array.isArray(items))return;
 const usable=items.filter(x=>x&&(x.type==='foto'||x.type==='video')&&safePath(x.src)).slice(0,24);if(!usable.length)return;
 gallery.replaceChildren();
 for(const item of usable){
   const f=add('figure','media-item'+(item.type==='video'?' has-video':''),gallery);
   if(item.type==='foto'){const img=add('img','',f);img.src=item.src;img.loading='lazy';img.decoding='async';img.alt=String(item.alt||item.title||'Registro da Clínica Med Center')}
   else{const vid=add('video','',f);vid.src=item.src;vid.controls=true;vid.playsInline=true;vid.preload='none';if(safePath(item.poster))vid.poster=item.poster}
   const caption=add('figcaption','',f);add('span','media-source',caption,item.type==='video'?'VÍDEO · MED CENTER':'FOTO · MED CENTER');add('span','',caption,String(item.title||'Registro de atuação'));
   if(item.type==='foto'&&typeof item.link==='string'&&item.link.startsWith('https://www.instagram.com/')){const a=add('a','',f);a.href=item.link;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','Ver publicação original no Instagram')}
 }
}
if(gallery&&window.fetch)fetch('media.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(d)renderMedia(d.media)}).catch(()=>{});
})();