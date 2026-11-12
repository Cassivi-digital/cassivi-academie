import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, LoaderCircle, Send } from 'lucide-react';
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
} from '../../data/quoteForm';
import { mailtoUrl, site, whatsappUrl } from '../../data/site';
import { cn } from '../../lib/cn';
import {
  SubmissionError,
  emptyValues,
  submitQuoteRequest,
  validateField,
  validateForm,
  type FormErrors,
  type FormValues,
} from '../../lib/quoteForm';
import { buttonClasses } from '../ui/ButtonLink';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const failureMessages: Record<SubmissionError['reason'], string> = {
  network: 'Vérifiez votre connexion internet, puis renvoyez le formulaire.',
  timeout: 'Le serveur met trop de temps à répondre. Renvoyez le formulaire dans un instant.',
  rejected: "Le serveur n'a pas accepté la demande. Renvoyez le formulaire dans un instant.",
  local:
    "Ce formulaire fonctionne uniquement sur le site en ligne, hébergé par Netlify. Depuis cette adresse, aucune demande n'est envoyée.",
};

const fieldId = (name: FieldName) => `devis-${name}`;
const errorId = (name: FieldName) => `devis-${name}-erreur`;

/** Ouvre le bloc « Politique de confidentialité » du pied de page avant d'y défiler. */
function openPrivacyPolicy() {
  const details = document.getElementById('confidentialite');
  if (details instanceof HTMLDetailsElement) details.open = true;
}

export function QuoteForm() {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [failure, setFailure] = useState<SubmissionError['reason']>('rejected');
  const [sentFirstName, setSentFirstName] = useState('');
  // Tant que JavaScript n'a pas pris la main, le navigateur valide lui-même le formulaire.
  const [enhanced, setEnhanced] = useState(false);

  const honeypotRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);

  useEffect(() => setEnhanced(true), []);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
    if (status === 'error') failureRef.current?.focus();
  }, [status]);

  const setValue = (name: FieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    // Un champ déjà signalé en erreur est revérifié à chaque frappe.
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
    }
  };

  const checkField = (name: FieldName) => {
    setErrors((current) => ({ ...current, [name]: validateField(name, values[name]) }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'submitting') return;

    const found = validateForm(values);
    setErrors(found);
    const firstInvalid = fieldNames.find((name) => found[name]);
    if (firstInvalid) {
      setStatus('idle');
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    setStatus('submitting');
    try {
      await submitQuoteRequest(values, honeypotRef.current?.value ?? '');
      setSentFirstName(values.prenom.trim());
      setValues(emptyValues);
      setStatus('success');
    } catch (error) {
      setFailure(error instanceof SubmissionError ? error.reason : 'rejected');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-green-soft bg-green-tint p-7 outline-none sm:p-10"
      >
        <CircleCheck className="size-10 text-green" strokeWidth={1.75} aria-hidden="true" />
        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Demande envoyée.</h3>
        <p className="mt-3 max-w-lg text-lg leading-relaxed text-ink-soft">
          Merci{sentFirstName ? ` ${sentFirstName}` : ''}. Votre demande de devis m'est bien parvenue. Je
          vous recontacte par e-mail ou par téléphone pour échanger sur votre projet.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className={buttonClasses('secondary', 'md', 'mt-7')}
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  const invalidCount = Object.values(errors).filter(Boolean).length;
  const submitting = status === 'submitting';

  const shared = (name: FieldName) => ({
    id: fieldId(name),
    name,
    value: values[name],
    'aria-invalid': errors[name] ? (true as const) : undefined,
    'aria-describedby': errors[name] ? errorId(name) : undefined,
    onBlur: () => checkField(name),
  });

  return (
    <form
      name={FORM_NAME}
      method="POST"
      action="/"
      noValidate={enhanced}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-white p-6 shadow-panel sm:p-9"
    >
      <input type="hidden" name="form-name" value={FORM_NAME} />
      <input type="hidden" name="subject" value={NOTIFICATION_SUBJECT} />
      <p className="hidden">
        <label>
          Ne remplissez pas ce champ si vous êtes une personne&nbsp;:
          <input ref={honeypotRef} name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <p className="text-sm text-ink-muted">
        Les champs marqués d'un <span className="font-semibold text-red">*</span> sont obligatoires.
      </p>

      <div className="mt-6 grid gap-x-5 gap-y-5 sm:grid-cols-2">
        <Field name="prenom" label="Prénom" required error={errors.prenom}>
          <input
            {...shared('prenom')}
            type="text"
            className="field"
            autoComplete="given-name"
            required
            minLength={2}
            maxLength={80}
            onChange={(event) => setValue('prenom', event.target.value)}
          />
        </Field>

        <Field name="nom" label="Nom" required error={errors.nom}>
          <input
            {...shared('nom')}
            type="text"
            className="field"
            autoComplete="family-name"
            required
            minLength={2}
            maxLength={80}
            onChange={(event) => setValue('nom', event.target.value)}
          />
        </Field>

        <Field name="email" label="Adresse e-mail professionnelle" required error={errors.email}>
          <input
            {...shared('email')}
            type="email"
            className="field"
            autoComplete="email"
            inputMode="email"
            placeholder="prenom@entreprise.fr"
            required
            maxLength={160}
            onChange={(event) => setValue('email', event.target.value)}
          />
        </Field>

        <Field name="telephone" label="Téléphone" required error={errors.telephone}>
          <input
            {...shared('telephone')}
            type="tel"
            className="field"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+33 6 12 34 56 78"
            required
            pattern="[+0-9\s\(\)\.\-]{8,24}"
            maxLength={24}
            onChange={(event) => setValue('telephone', event.target.value)}
          />
        </Field>

        <Field name="ville" label="Ville" required error={errors.ville}>
          <input
            {...shared('ville')}
            type="text"
            className="field"
            autoComplete="address-level2"
            required
            minLength={2}
            maxLength={80}
            onChange={(event) => setValue('ville', event.target.value)}
          />
        </Field>

        <Field name="entreprise" label="Entreprise" required error={errors.entreprise}>
          <input
            {...shared('entreprise')}
            type="text"
            className="field"
            autoComplete="organization"
            required
            minLength={2}
            maxLength={120}
            onChange={(event) => setValue('entreprise', event.target.value)}
          />
        </Field>

        <Field
          name="site-internet"
          label="Site internet"
          error={errors['site-internet']}
          className="sm:col-span-2"
        >
          <input
            {...shared('site-internet')}
            type="text"
            className="field"
            autoComplete="url"
            inputMode="url"
            placeholder="www.entreprise.fr"
            maxLength={200}
            onChange={(event) => setValue('site-internet', event.target.value)}
          />
        </Field>

        <Field name="service" label="Service recherché" required error={errors.service}>
          <select
            {...shared('service')}
            className="field field-select"
            required
            onChange={(event) => setValue('service', event.target.value)}
          >
            <option value="">Sélectionner</option>
            {services.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field name="budget" label="Budget publicitaire mensuel" required error={errors.budget}>
          <select
            {...shared('budget')}
            className="field field-select"
            required
            onChange={(event) => setValue('budget', event.target.value)}
          >
            <option value="">Sélectionner</option>
            {budgets.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field
          name="objectif"
          label="Objectif principal"
          required
          error={errors.objectif}
          className="sm:col-span-2"
        >
          <select
            {...shared('objectif')}
            className="field field-select"
            required
            onChange={(event) => setValue('objectif', event.target.value)}
          >
            <option value="">Sélectionner</option>
            {objectives.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field
          name="description"
          label="Description du projet"
          required
          error={errors.description}
          className="sm:col-span-2"
          hint={`${values.description.trim().length} / ${DESCRIPTION_MAX}`}
        >
          <textarea
            {...shared('description')}
            className="field min-h-36 resize-y"
            rows={5}
            placeholder="Votre activité, votre zone, vos objectifs, ce qui a déjà été testé…"
            required
            minLength={DESCRIPTION_MIN}
            maxLength={DESCRIPTION_MAX}
            onChange={(event) => setValue('description', event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-6">
        <div className="flex items-start gap-3">
          <input
            id={fieldId('consentement')}
            name="consentement"
            type="checkbox"
            value={CONSENT_VALUE}
            checked={values.consentement === CONSENT_VALUE}
            required
            aria-invalid={errors.consentement ? true : undefined}
            aria-describedby={errors.consentement ? errorId('consentement') : undefined}
            onChange={(event) => {
              const next = event.target.checked ? CONSENT_VALUE : '';
              setValues((current) => ({ ...current, consentement: next }));
              setErrors((current) => ({ ...current, consentement: validateField('consentement', next) }));
            }}
            className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-line-strong accent-blue"
          />
          <label
            htmlFor={fieldId('consentement')}
            className="cursor-pointer text-sm leading-relaxed text-ink-soft"
          >
            J'accepte que mes données soient utilisées pour traiter ma demande de devis et me
            recontacter.{' '}
            <span className="font-semibold text-red" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(obligatoire)</span>{' '}
            <a
              href="#confidentialite"
              onClick={openPrivacyPolicy}
              className="font-medium text-blue-strong underline underline-offset-2 hover:text-navy"
            >
              Politique de confidentialité
            </a>
          </label>
        </div>
        <FieldError id={errorId('consentement')} message={errors.consentement} />
      </div>

      {status === 'error' ? (
        <div
          ref={failureRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 rounded-xl border border-red/30 bg-red-tint p-5 outline-none"
        >
          <p className="flex items-center gap-2 font-semibold text-ink">
            <CircleAlert className="size-5 shrink-0 text-red" aria-hidden="true" />
            Votre demande n'a pas été envoyée.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{failureMessages[failure]}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Vos réponses sont conservées ci-dessus. Vous pouvez aussi m'écrire directement par{' '}
            <a href={mailtoUrl} className="font-medium text-blue-strong underline underline-offset-2">
              e-mail ({site.email})
            </a>{' '}
            ou sur{' '}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-strong underline underline-offset-2"
            >
              WhatsApp
            </a>
            .
          </p>
        </div>
      ) : null}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <button
          type="submit"
          disabled={submitting}
          className={buttonClasses('primary', 'lg', 'w-full disabled:cursor-progress disabled:opacity-70 sm:w-auto')}
        >
          {submitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Envoi en cours…
            </>
          ) : (
            <>
              Envoyer ma demande
              <Send className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
        <p className="text-sm text-red" role="alert">
          {invalidCount > 0
            ? `${invalidCount} ${invalidCount > 1 ? 'champs sont' : 'champ est'} à corriger avant l'envoi.`
            : null}
        </p>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  required = false,
  error,
  hint,
  className,
  children,
}: {
  name: FieldName;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={fieldId(name)} className="text-sm font-medium text-ink">
          {label}{' '}
          {required ? (
            <>
              <span className="font-semibold text-red" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(obligatoire)</span>
            </>
          ) : (
            <span className="font-normal text-ink-muted">(facultatif)</span>
          )}
        </label>
        {hint ? (
          <span className="nums text-xs text-ink-muted" aria-hidden="true">
            {hint}
          </span>
        ) : null}
      </div>
      {children}
      <FieldError id={errorId(name)} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className={cn('mt-1.5 flex items-start gap-1.5 text-sm leading-snug text-red')}>
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
