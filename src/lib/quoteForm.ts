import {
  CONSENT_VALUE,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  FORM_NAME,
  HONEYPOT_FIELD,
  NOTIFICATION_SUBJECT,
  budgets,
  fieldNames,
  objectives,
  services,
  type FieldName,
} from '../data/quoteForm';

export type FormValues = Record<FieldName, string>;
export type FormErrors = Partial<Record<FieldName, string>>;

export const emptyValues: FormValues = Object.fromEntries(
  fieldNames.map((name) => [name, '']),
) as FormValues;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARACTERS = /^[+\d\s().-]+$/;
const WEBSITE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;

const isOneOf = (list: readonly string[], value: string) => list.includes(value);

/** Renvoie le message d'erreur du champ, ou `undefined` s'il est valide. */
export function validateField(name: FieldName, rawValue: string): string | undefined {
  const value = rawValue.trim();

  switch (name) {
    case 'prenom':
      return value.length < 2 ? 'Indiquez votre prénom.' : undefined;
    case 'nom':
      return value.length < 2 ? 'Indiquez votre nom.' : undefined;
    case 'email':
      if (!value) return 'Indiquez votre adresse e-mail professionnelle.';
      return EMAIL.test(value)
        ? undefined
        : "Cette adresse e-mail n'est pas valide. Exemple\u00a0: prenom@entreprise.fr";
    case 'telephone': {
      if (!value) return 'Indiquez un numéro de téléphone.';
      const digits = value.replace(/\D/g, '').length;
      return PHONE_CHARACTERS.test(value) && digits >= 8 && digits <= 15
        ? undefined
        : "Ce numéro n'est pas valide. Saisissez 8 à 15 chiffres, avec l'indicatif si besoin\u00a0: +33 6 12 34 56 78";
    }
    case 'ville':
      return value.length < 2 ? 'Indiquez votre ville.' : undefined;
    case 'entreprise':
      return value.length < 2 ? 'Indiquez le nom de votre entreprise.' : undefined;
    case 'site-internet':
      return !value || WEBSITE.test(value)
        ? undefined
        : "Cette adresse de site n'est pas valide. Exemple\u00a0: www.entreprise.fr";
    case 'service':
      return isOneOf(services, value) ? undefined : 'Sélectionnez le service recherché.';
    case 'budget':
      return isOneOf(budgets, value) ? undefined : 'Sélectionnez votre budget publicitaire mensuel.';
    case 'objectif':
      return isOneOf(objectives, value) ? undefined : 'Sélectionnez votre objectif principal.';
    case 'description':
      if (!value) return 'Décrivez votre projet en quelques phrases.';
      if (value.length < DESCRIPTION_MIN)
        return `Ajoutez quelques précisions\u00a0: ${DESCRIPTION_MIN} caractères au minimum.`;
      return value.length > DESCRIPTION_MAX
        ? `Raccourcissez votre description\u00a0: ${DESCRIPTION_MAX} caractères au maximum.`
        : undefined;
    case 'consentement':
      return value === CONSENT_VALUE
        ? undefined
        : 'Cochez cette case pour autoriser le traitement de votre demande.';
  }
}

export function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  for (const name of fieldNames) {
    const message = validateField(name, values[name]);
    if (message) errors[name] = message;
  }
  return errors;
}

/** Corps de la requête attendu par Netlify Forms (encodage URL, jamais du JSON). */
export function encodeSubmission(values: FormValues, honeypot: string): string {
  const body = new URLSearchParams();
  body.set('form-name', FORM_NAME);
  body.set('subject', NOTIFICATION_SUBJECT);
  body.set(HONEYPOT_FIELD, honeypot);
  for (const name of fieldNames) body.set(name, values[name].trim());
  return body.toString();
}

export class SubmissionError extends Error {
  constructor(
    message: string,
    readonly reason: 'local' | 'network' | 'timeout' | 'rejected',
  ) {
    super(message);
    this.name = 'SubmissionError';
  }
}

const TIMEOUT_MS = 15_000;

/**
 * Netlify Forms n'existe que sur le site déployé. En local, un serveur de
 * développement répondrait « 200 » à n'importe quelle requête : on refuse donc
 * d'envoyer plutôt que d'afficher une confirmation qui serait fausse.
 */
function isLocalHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '[::1]' ||
    hostname.endsWith('.local') ||
    /^127\.|^10\.|^192\.168\.|^0\.0\.0\.0$/.test(hostname)
  );
}

/**
 * Envoie la demande à Netlify Forms. La promesse n'est résolue que si Netlify
 * a répondu par un succès ; tout autre cas lève une `SubmissionError`.
 */
export async function submitQuoteRequest(values: FormValues, honeypot: string): Promise<void> {
  if (isLocalHost(window.location.hostname)) {
    throw new SubmissionError('Netlify Forms est indisponible hors du site déployé.', 'local');
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeSubmission(values, honeypot),
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === 'AbortError';
    throw new SubmissionError(
      aborted ? 'Délai de réponse dépassé.' : 'Connexion impossible.',
      aborted ? 'timeout' : 'network',
    );
  } finally {
    window.clearTimeout(timer);
  }

  if (!response.ok) {
    throw new SubmissionError(`Réponse ${response.status} du serveur.`, 'rejected');
  }
}
