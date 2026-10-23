(function(){
  var els=document.querySelectorAll('.rv,.step');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')})}else{
  var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(e){io.observe(e)});
  }
  var fw=document.querySelector('.float-wa');window.addEventListener('scroll',function(){fw.classList.toggle('show',window.scrollY>700)},{passive:true});
  var tv=document.getElementById('t-vid');
  if(tv){var tf=tv.parentNode;
    tf.querySelector('.t-play').addEventListener('click',function(){tv.controls=true;tf.classList.add('playing');tv.play()});
  }
  document.getElementById('y').textContent=new Date().getFullYear();
})();
