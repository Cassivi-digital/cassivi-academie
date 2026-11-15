/* ==========================================================================
   CONFIGURATION DE LA PAGE · Formation Media Buyer pilotée par l’IA
   Modifiez uniquement ce fichier, puis redéployez le dossier sur Netlify.
   Aucune donnée secrète ici : ce fichier est public.
   ========================================================================== */
window.CASSIVI_CONFIG = {

  // Adresse du webhook Make du scénario « Formation Media Buyer 28-30 nov ».
  webhookUrl: 'https://hook.eu1.make.com/nlvs0y0kyns9mfsiepuddblftcbmyddt',

  // Contact affiché sur la page
  whatsapp: '261375975512',              // format international, chiffres uniquement
  whatsappAffiche: '+261 37 59 755 12',
  email: 'cassividigitalmg@gmail.com',

  // Session
  debut: '2026-11-28T08:00:00+03:00',                // compte à rebours
  clotureInscriptions: '2026-11-28T08:00:00+03:00',  // après cette date, le formulaire se ferme
  prix: 350000,
  acompte: 50000,
  solde: 300000,

  // Numéros Mobile Money qui reçoivent l’acompte (affichés dans les instructions de paiement).
  // Pour ajouter un service, retirez les « // » devant sa ligne et remplacez le numéro et le nom.
  mobileMoney: [
    { service: 'MVola',        numero: '038 48 782 22', titulaire: 'RAMAMONJISOA' },
    { service: 'Orange Money', numero: '037 59 755 12', titulaire: 'Andrianambinina Sitraka' },
    // { service: 'Airtel Money', numero: '033 00 000 00', titulaire: 'Nom du titulaire' },
  ],

  // Mesure d’audience (facultatif). Laissez vide pour désactiver.
  metaPixelId: '1668983478012670',   // Pixel Meta : PageView (visite), Lead (inscription), Contact (clic WhatsApp)
  ga4Id: '',         // exemple : 'G-XXXXXXXXXX'

  // Copie de secours de chaque candidature dans Netlify Forms (recommandé).
  netlifyForms: true
};
