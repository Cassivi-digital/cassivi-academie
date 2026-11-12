/** Identité et coordonnées affichées sur le site. Source unique à modifier. */

export const site = {
  name: 'Sitraka Ramamonjisoa',
  firstName: 'Sitraka',
  role: 'PPC Specialist',
  tagline: 'PPC Specialist | Google Ads | Acquisition & Performance',
  email: 'rjsitraka3@gmail.com',
  /** Numéro au format international sans « + », attendu par wa.me. */
  whatsappNumber: '261375975512',
  whatsappDisplay: '+261 37 59 755 12',
  linkedinUrl: 'https://www.linkedin.com/in/sitraka-ramamonjisoa-3a3775282/',
  whatsappMessage:
    "Bonjour Sitraka, j'ai consulté votre portfolio et je souhaiterais échanger avec vous concernant un projet d'acquisition.",
} as const;

export const whatsappUrl = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
  site.whatsappMessage,
)}`;

export const mailtoUrl = `mailto:${site.email}?subject=${encodeURIComponent(
  "Projet d'acquisition — prise de contact",
)}`;

export const navLinks = [
  { href: '#etude-de-cas', label: 'Étude de cas' },
  { href: '#funnel', label: 'Funnel' },
  { href: '#tracking', label: 'Tracking' },
  { href: '#expertise', label: 'Expertise' },
  { href: '#methode', label: 'Méthode' },
  { href: '#contact', label: 'Contact' },
] as const;
