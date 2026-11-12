/**
 * Architecture de tracking et de CRM.
 *
 * `status` distingue ce qui a été mis en œuvre sur le cas client de ce qui
 * relève de l'architecture recommandée. Pour changer l'étiquette d'une étape,
 * il suffit de modifier ce champ : le schéma et la légende suivent.
 */

export type TrackingStatus = 'realise' | 'recommande';

export const statusLabels: Record<TrackingStatus, string> = {
  realise: 'Réalisé sur le cas client',
  recommande: 'Architecture recommandée',
};

export type TrackingStep = {
  id: string;
  title: string;
  caption: string;
  status: TrackingStatus;
};

export const trackingSteps: TrackingStep[] = [
  {
    id: 'google-ads',
    title: 'Google Ads Search',
    caption: "L'annonce répond à une recherche à forte intention.",
    status: 'realise',
  },
  {
    id: 'landing-page',
    title: 'Landing page',
    caption: 'Le visiteur arrive sur une page dédiée et envoie le formulaire.',
    status: 'realise',
  },
  {
    id: 'gtm',
    title: 'Google Tag Manager',
    caption: "L'envoi du formulaire déclenche l'événement de conversion.",
    status: 'realise',
  },
  {
    id: 'ga4-google-ads',
    title: 'GA4 + Google Ads',
    caption: 'La conversion est enregistrée et rattachée à la campagne.',
    status: 'realise',
  },
  {
    id: 'hubspot',
    title: 'HubSpot CRM',
    caption: 'Chaque demande devient un contact suivi dans le CRM.',
    status: 'recommande',
  },
  {
    id: 'qualification',
    title: 'Qualification commerciale',
    caption: 'Lead qualifié, devis envoyé, client signé\u00a0: chaque statut est tracé.',
    status: 'recommande',
  },
  {
    id: 'offline-conversions',
    title: 'Conversions qualifiées renvoyées à Google Ads',
    caption: "Les enchères s'optimisent sur les vrais clients, pas sur les simples formulaires.",
    status: 'recommande',
  },
];

export type TrackingTool = {
  id: string;
  name: string;
  role: string;
};

export const trackingTools: TrackingTool[] = [
  { id: 'google-ads', name: 'Google Ads', role: 'Acquisition et intention de recherche.' },
  { id: 'gtm', name: 'GTM', role: 'Déclenchement des événements de conversion.' },
  { id: 'ga4', name: 'GA4', role: 'Analyse des comportements et des conversions.' },
  { id: 'hubspot', name: 'HubSpot', role: 'Centralisation et qualification des prospects.' },
  {
    id: 'offline-conversions',
    name: 'Offline conversions',
    role: 'Remontée des résultats commerciaux vers Google Ads.',
  },
];
