// Eventos para o GTM via dataLayer. Nunca envia dados pessoais nem o link do convite do WhatsApp.
(function(){
  window.dataLayer=window.dataLayer||[];
  function track(ev,params){var o={event:ev};for(var k in params)o[k]=params[k];dataLayer.push(o)}
  function clean(s,max){return (s||'').replace(/\s+/g,' ').trim().slice(0,max||80)}
  function sectionOf(el){var s=el.closest('[data-section]');return s?s.getAttribute('data-section'):'outra'}

  // ---------- cliques em botões e links ----------
  var IGNORE='.fq-item h3 button,.t-play,.fq-play,summary,.cc-banner button';
  document.addEventListener('click',function(e){
    var el=e.target.closest('a,button');
    if(!el||el.matches(IGNORE))return;
    var name=clean(el.getAttribute('data-cta')||el.textContent||el.getAttribute('aria-label'));
    if(!name)name=clean(el.getAttribute('aria-label'));
    var p={cta_name:name,cta_section:sectionOf(el)};
    var href=el.tagName==='A'?el.getAttribute('href')||'':'';
    var host='';try{host=href?new URL(el.href).hostname:''}catch(err){}
    if(/whatsapp\.com$/.test(host)){track('whatsapp_click',p);return}
    if(/instagram\.com$/.test(host)){track('instagram_click',p);return}
    p.cta_type=!href?'botao':href.charAt(0)==='#'?'ancora':host&&host!==location.hostname?'externo':'interno';
    if(p.cta_type==='externo')p.link_domain=host;
    else if(href)p.link_target=href.split('?')[0].slice(0,60);
    track('cta_click',p);
  });

  // ---------- seções visualizadas (uma vez por página) ----------
  var secs=document.querySelectorAll('[data-section]:not(a):not(button)');
  if('IntersectionObserver' in window){
    var seen=new IntersectionObserver(function(en){en.forEach(function(e){
      if(e.isIntersecting){track('section_view',{section_name:e.target.getAttribute('data-section')});seen.unobserve(e.target)}
    })},{rootMargin:'-45% 0px -45% 0px'});
    secs.forEach(function(s){seen.observe(s)});
  }

  // ---------- vídeos: início, 25/50/75% e fim ----------
  document.querySelectorAll('video').forEach(function(v){
    var title=v.getAttribute('data-title')||'video',marks={},started=false;
    function base(){return {video_title:title,video_duration:Math.round(v.duration)||0}}
    // com preload="none" a duração só existe depois dos metadados
    v.addEventListener('play',function(){
      if(started)return;started=true;
      if(v.duration)track('video_start',base());
      else v.addEventListener('loadedmetadata',function(){track('video_start',base())},{once:true});
    });
    v.addEventListener('timeupdate',function(){
      if(!v.duration)return;var pct=v.currentTime/v.duration*100;
      [25,50,75].forEach(function(m){if(pct>=m&&!marks[m]){marks[m]=1;var p=base();p.video_percent=m;track('video_progress',p)}});
    });
    v.addEventListener('ended',function(){var p=base();p.video_percent=100;track('video_complete',p)});
  });

  // ---------- perguntas frequentes abertas ----------
  document.querySelectorAll('details').forEach(function(d){
    d.addEventListener('toggle',function(){if(d.open)track('faq_open',{faq_question:clean(d.querySelector('summary').textContent),faq_section:sectionOf(d)})});
  });
  document.addEventListener('click',function(e){
    var b=e.target.closest('.fq-item h3 button');if(!b)return;
    var it=b.closest('.fq-item');
    if(it.classList.contains('is-open'))track('faq_open',{faq_id:it.id,faq_question:clean(b.querySelector('.q-t')?b.querySelector('.q-t').textContent:b.textContent),faq_section:sectionOf(it)});
  });

  // ---------- pesquisa do FAQ (termo higienizado, sem e-mails ou números) ----------
  var q=document.getElementById('fq-q'),qt,last='';
  if(q)q.addEventListener('input',function(){
    clearTimeout(qt);
    qt=setTimeout(function(){
      var term=clean(q.value.toLowerCase().replace(/\S+@\S+/g,'[email]').replace(/\d[\d\s.\-()]{3,}/g,'[numero]'),60);
      if(term.length<3||term===last)return;last=term;
      track('search',{search_term:term,results_count:document.querySelectorAll('.fq-item:not(.is-hidden)').length});
    },1500);
  });

  // ---------- aviso de cookies (LGPD) ----------
  function choice(){try{return localStorage.getItem('smv-consent')}catch(e){return null}}
  function setChoice(v){
    try{localStorage.setItem('smv-consent',v)}catch(e){}
    gtag('consent','update',{analytics_storage:v});
    track('consent_update',{analytics_storage:v});
  }
  var banner;
  function showBanner(){
    if(banner){banner.hidden=false;return}
    banner=document.createElement('div');
    banner.className='cc-banner';banner.setAttribute('role','dialog');banner.setAttribute('aria-label','Preferências de cookies');
    banner.innerHTML='<p>Usamos cookies de análise para entender como o site é usado e melhorar a experiência. Nenhum dado é usado para anúncios.</p>'+
      '<div class="cc-actions"><button type="button" class="btn btn-ghost" data-v="denied">Recusar</button><button type="button" class="btn btn-gold" data-v="granted">Aceitar</button></div>';
    banner.addEventListener('click',function(e){var b=e.target.closest('button[data-v]');if(b){setChoice(b.getAttribute('data-v'));banner.hidden=true}});
    document.body.appendChild(banner);
  }
  if(!choice())showBanner();
  document.querySelectorAll('[data-consent-open]').forEach(function(b){b.addEventListener('click',showBanner)});
})();
