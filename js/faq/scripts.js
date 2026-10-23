(function(){
  var items=[].slice.call(document.querySelectorAll('.fq-item'));
  var cats=[].slice.call(document.querySelectorAll('.fq-cat'));
  var form=document.querySelector('.fq-search');
  var input=document.getElementById('fq-q');
  var status=document.getElementById('fq-status');
  var empty=document.querySelector('.fq-empty');
  var sideLinks=[].slice.call(document.querySelectorAll('.fq-side ol a'));
  var chips=[].slice.call(document.querySelectorAll('.fq-chips .chip'));

  // remove acentos e caixa para comparar
  function norm(s){return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()}

  // prepara cada pergunta: envolve o texto, guarda o HTML original para o realce
  items.forEach(function(it){
    var btn=it.querySelector('h3 button');
    var txt=btn.firstChild;
    var span=document.createElement('span');span.className='q-t';span.textContent=txt.textContent.trim();
    btn.replaceChild(span,txt);
    var a=it.querySelector('.fq-a');
    a.id=it.id+'-a';btn.setAttribute('aria-controls',a.id);
    it._q=span;it._ps=[].slice.call(a.querySelectorAll('p'));
    it._qText=span.textContent;it._pHTML=it._ps.map(function(p){return p.innerHTML});
    it._qn=norm(it._qText);it._an=norm(it._ps.map(function(p){return p.textContent}).join(' '));
    btn.addEventListener('click',function(){toggle(it,!it.classList.contains('is-open'),true)});
  });

  function toggle(it,open,fromClick){
    it.classList.toggle('is-open',open);
    it.querySelector('h3 button').setAttribute('aria-expanded',open);
    if(!open){it.querySelectorAll('video').forEach(function(v){v.pause()})}
    if(fromClick&&history.replaceState){history.replaceState(null,'',open?'#'+it.id:location.pathname+location.search)}
  }

  // ---------- pesquisa ----------
  function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
  // realça os termos ignorando acentos: mapeia índices do texto normalizado para o original
  function highlight(text,terms){
    if(!terms.length)return null;
    var n=norm(text),ranges=[];
    terms.forEach(function(t){var re=new RegExp(esc(t),'g'),m;while((m=re.exec(n))){ranges.push([m.index,m.index+t.length])}});
    if(!ranges.length)return null;
    ranges.sort(function(a,b){return a[0]-b[0]});
    var out='',last=0;
    ranges.forEach(function(r){if(r[0]<last)return;out+=escHTML(text.slice(last,r[0]))+'<mark>'+escHTML(text.slice(r[0],r[1]))+'</mark>';last=r[1]});
    return out+escHTML(text.slice(last));
  }
  function escHTML(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  function search(raw){
    var q=norm(raw.trim()),terms=q.split(/\s+/).filter(Boolean),total=0;
    form.classList.toggle('has-q',raw.length>0);
    items.forEach(function(it,i){
      var hay=it._qn+' '+it._an;
      var ok=terms.every(function(t){return hay.indexOf(t)>-1});
      var was=it.classList.contains('is-hidden');
      it.classList.toggle('is-hidden',!ok);
      if(ok&&was){it.classList.remove('fade-in');void it.offsetWidth;it.classList.add('fade-in')}
      if(ok)total++;
      // realce
      var hq=highlight(it._qText,terms);it._q.innerHTML=hq||escHTML(it._qText);
      it._ps.forEach(function(p,j){var h=highlight(p.textContent,terms);p.innerHTML=h||it._pHTML[j]});
      // indica quando o termo só aparece na resposta
      var hint=it.querySelector('.hit-hint');
      var inAnswerOnly=ok&&terms.length&&!terms.every(function(t){return it._qn.indexOf(t)>-1});
      if(inAnswerOnly&&!hint){hint=document.createElement('span');hint.className='hit-hint';hint.textContent='Na resposta';it._q.after(hint)}
      if(!inAnswerOnly&&hint)hint.remove();
    });
    cats.forEach(function(c){
      var has=c.querySelector('.fq-item:not(.is-hidden)');
      c.classList.toggle('is-hidden',!has);
      document.querySelectorAll('a[href="#'+c.id+'"]').forEach(function(a){a.classList.toggle('is-empty',!has)});
    });
    empty.hidden=!(terms.length&&total===0);
    status.innerHTML=terms.length?(total?'<b>'+total+'</b> '+(total===1?'pergunta encontrada':'perguntas encontradas')+' para “'+escHTML(raw.trim())+'”':'Nenhuma pergunta encontrada para “'+escHTML(raw.trim())+'”'):'';
  }

  var timer;
  input.addEventListener('input',function(){clearTimeout(timer);timer=setTimeout(function(){search(input.value)},120)});
  function clear(){input.value='';search('');input.focus()}
  document.querySelector('.fq-clear').addEventListener('click',clear);
  document.querySelector('.fq-reset').addEventListener('click',clear);
  input.addEventListener('keydown',function(e){
    if(e.key==='Escape'){clear()}
    if(e.key==='Enter'){var first=document.querySelector('.fq-item:not(.is-hidden)');if(first){e.preventDefault();openAndScroll(first)}}
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='/'&&document.activeElement!==input&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();input.focus()}
  });

  // ---------- links diretos para perguntas (#q-...) ----------
  function openAndScroll(it){
    if(it.classList.contains('is-hidden')){input.value='';search('')}
    toggle(it,true);
    it.scrollIntoView({behavior:'smooth',block:'start'});
    it.classList.remove('flash');void it.offsetWidth;it.classList.add('flash');
    it.querySelector('h3 button').focus({preventScroll:true});
    if(history.replaceState)history.replaceState(null,'','#'+it.id);
  }
  document.querySelectorAll('a[href^="#q-"]').forEach(function(a){
    a.addEventListener('click',function(e){var it=document.getElementById(a.getAttribute('href').slice(1));if(it){e.preventDefault();openAndScroll(it)}});
  });
  function fromHash(){var id=location.hash.slice(1),it=id&&document.getElementById(id);if(it&&it.classList.contains('fq-item'))setTimeout(function(){openAndScroll(it)},120)}
  window.addEventListener('hashchange',fromHash);
  fromHash();

  // ---------- categoria ativa na barra lateral ----------
  if('IntersectionObserver' in window){
    var spy=new IntersectionObserver(function(en){en.forEach(function(e){
      if(e.isIntersecting){sideLinks.forEach(function(a){a.classList.toggle('is-active',a.getAttribute('href')==='#'+e.target.id)})}
    })},{rootMargin:'-30% 0px -60% 0px'});
    cats.forEach(function(c){spy.observe(c)});
  }

  // ---------- vídeos ----------
  var videos=[].slice.call(document.querySelectorAll('.fq-frame video'));
  videos.forEach(function(v){
    var fr=v.parentNode;
    fr.querySelector('.fq-play').addEventListener('click',function(){v.controls=true;fr.classList.add('playing');v.play()});
    v.addEventListener('play',function(){videos.forEach(function(o){if(o!==v)o.pause()})});
  });
})();
