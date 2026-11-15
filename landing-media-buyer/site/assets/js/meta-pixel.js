/* Meta Pixel · CASSIVI DIGITAL MG · Formation Media Buyer
   Code de base officiel de Meta (ID 1668983478012670), chargé en premier dans le <head> de la page.
   Il est dans ce fichier plutôt que collé dans la page : la politique de sécurité du site (CSP)
   bloque les scripts collés directement dans le HTML. Le code est identique à celui fourni par Meta.
   Événements envoyés ensuite par assets/js/app.js :
   - Lead    : uniquement après une inscription réellement envoyée (réponse reçue de Make ou de Netlify) ;
   - Contact : clic sur un bouton WhatsApp de la page. */
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1668983478012670');
fbq('track', 'PageView');
