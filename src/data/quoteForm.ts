/**
 * Formulaire de demande de devis (Netlify Forms).
 *
 * IMPORTANT : les noms de champs ci-dessous doivent rester identiques à ceux
 * du formulaire statique déclaré dans `index.html`. C'est ce dernier que
 * Netlify analyse au déploiement pour enregistrer le formulaire « devis ».
 * `scripts/prerender.mjs` vérifie cette correspondance à chaque build.
 */

export const FORM_NAME = 'devis';
export const HONEYPOT_FIELD = 'bot-field';
export const NOTIFICATION_SUBJECT = 'Nouvelle demande de devis — %{formName} (%{submissionId})';

export const services = [
  'Google Ads',
  'Meta Ads',
  'Audit PPC',
  'Tracking & Analytics',
  'CRM & Conversions hors ligne',
  'Landing page',
  'Accompagnement acquisition',
] as const;

export const budgets = [
  'Moins de 500 €',
  '500 à 1 000 €',
  '1 000 à 3 000 €',
  '3 000 à 5 000 €',
  'Plus de 5 000 €',
] as const;

export const objectives = [
  'Générer des leads qualifiés',
  'Augmenter les ventes en ligne',
  "Réduire le coût d'acquisition",
  'Mesurer correctement les conversions',
  'Lancer une nouvelle campagne',
  'Autre objectif',
] as const;

export type FieldName =
  | 'prenom'
  | 'nom'
  | 'email'
  | 'telephone'
  | 'ville'
  | 'entreprise'
  | 'site-internet'
  | 'service'
  | 'budget'
  | 'objectif'
  | 'description'
  | 'consentement';

/** Tous les champs envoyés à Netlify, dans l'ordre d'affichage. */
export const fieldNames: FieldName[] = [
  'prenom',
  'nom',
  'email',
  'telephone',
  'ville',
  'entreprise',
  'site-internet',
  'service',
  'budget',
  'objectif',
  'description',
  'consentement',
];

export const CONSENT_VALUE = 'Oui';
export const DESCRIPTION_MIN = 20;
export const DESCRIPTION_MAX = 2000;
