// Roda ANTES da tag do Google: define o consentimento padrão (LGPD).
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
(function(){
  var saved=null;try{saved=localStorage.getItem('smv-consent')}catch(e){}
  // análise só com aceite; publicidade sempre negada (o site não usa anúncios)
  gtag('consent','default',{
    analytics_storage:saved==='granted'?'granted':'denied',
    ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',
    functionality_storage:'granted',security_storage:'granted',
    wait_for_update:500
  });
  gtag('set','ads_data_redaction',true);
})();
