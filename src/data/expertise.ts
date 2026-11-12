export type Pillar = {
  id: 'acquisition' | 'tracking' | 'scaling';
  number: string;
  title: string;
  summary: string;
  items: string[];
};

export const pillars: Pillar[] = [
  {
    id: 'acquisition',
    number: '01',
    title: 'Acquisition PPC',
    summary: "Capter la demande là où elle s'exprime, avec un budget qui travaille.",
    items: [
      'Google Ads Search',
      'Recherche de mots-clés',
      "Analyse de l'intention de recherche",
      'Structure des campagnes',
      "Organisation des groupes d'annonces",
      'Rédaction des annonces',
      "Stratégie d'enchères",
      'Gestion et allocation budgétaire',
    ],
  },
  {
    id: 'tracking',
    number: '02',
    title: 'Tracking & Data',
    summary: 'Mesurer chaque étape pour décider sur des faits, pas sur des impressions.',
    items: [
      'Google Tag Manager',
      'Google Analytics 4',
      'Tracking des conversions',
      'Suivi des événements',
      'Configuration des balises',
      'CRM HubSpot',
      'Conversions hors ligne',
      'Analyse des performances',
    ],
  },
  {
    id: 'scaling',
    number: '03',
    title: 'Optimisation & Scaling',
    summary: 'Couper ce qui coûte, renforcer ce qui rapporte, puis accélérer.',
    items: [
      'Analyse des termes de recherche',
      'Exclusion des recherches non pertinentes',
      'Tests A/B',
      'Optimisation du CPA et CPL',
      'Amélioration du taux de conversion',
      'Scaling horizontal et vertical',
      'Analyse des performances',
      'IA appliquée au marketing avec Claude et Claude Code',
    ],
  },
];

export const aiPrinciple =
  "L'IA accélère mon travail, mais les décisions stratégiques restent sous contrôle humain.";

export type MethodStep = {
  number: string;
  title: string;
  description: string;
};

export const methodSteps: MethodStep[] = [
  {
    number: '01',
    title: 'Analyser',
    description:
      'Identifier les mots-clés, les termes de recherche, les conversions et la qualité des prospects.',
  },
  {
    number: '02',
    title: 'Optimiser',
    description:
      'Éliminer les dépenses inutiles, améliorer les annonces, optimiser les landing pages et renforcer les campagnes performantes.',
  },
  {
    number: '03',
    title: 'Scaler',
    description:
      'Augmenter progressivement les investissements sur les segments qui génèrent des leads qualifiés et des clients.',
  },
];

export type AiUsage = {
  id: 'analysis' | 'skills' | 'code' | 'content' | 'automation';
  title: string;
  description: string;
};

export const aiUsages: AiUsage[] = [
  {
    id: 'analysis',
    title: "Claude pour l'analyse et la recherche",
    description: 'Explorer des données de campagne, préparer une recherche de mots-clés, structurer un audit.',
  },
  {
    id: 'skills',
    title: 'Skills et connecteurs',
    description: 'Accélérer certaines tâches récurrentes en reliant Claude aux outils marketing.',
  },
  {
    id: 'code',
    title: 'Claude Code pour les landing pages',
    description: 'Développer des pages rapides et mesurables, comme ce portfolio.',
  },
  {
    id: 'content',
    title: 'IA générative pour les contenus',
    description: "Créer et optimiser des variantes d'annonces et de textes, toujours relues avant diffusion.",
  },
  {
    id: 'automation',
    title: 'Automatisation de tâches marketing',
    description: "Déléguer certaines tâches répétitives pour consacrer le temps gagné à l'analyse.",
  },
];
