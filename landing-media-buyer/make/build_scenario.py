"""Génère le scénario Make « Formation Media Buyer 28-30 nov » (blueprint JSON) et les aperçus HTML des e-mails.

Un seul scénario, déclenché par un webhook (forfait Make gratuit : 2 scénarios actifs au maximum) :
  route 1  action=inscription  (page)        → ligne dans Google Sheets, réponse à la page, e-mail candidat, alerte admin
  route 2  action=valider      (lien admin)  → statut « Place confirmée », e-mail de confirmation, page de réponse avec WhatsApp prêt
  route 3  action=probleme     (lien admin)  → statut « Paiement à vérifier », e-mail au candidat
  route 4  action=cron         (1 fois/jour) → relances acompte, rappels J-2 / J-1 / veille J2, remerciement, point du jour admin

usage : python3 make/build_scenario.py  (écrit make/blueprint.json et make/apercus_emails/*.html)
"""
import json, os, re, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
CFG = json.load(open(os.path.join(HERE, 'parametres.json')))
HOOK_ID, HOOK_URL, TOKEN = CFG['hook_id'], CFG['hook_url'], CFG['token']
SHEET, TAB, TFR = CFG['spreadsheet_id'], 'Inscriptions', 'A1:BZ1'   # plage de colonnes proposée par Make (le tableau va de A à AL)
SHEET_URL = f'https://docs.google.com/spreadsheets/d/{SHEET}/edit'
DRIVE_ID = CFG['drive_folder']; DRIVE_URL = f'https://drive.google.com/drive/folders/{DRIVE_ID}'
GMAIL, GSHEETS = CFG['gmail_connection'], CFG['sheets_connection']
ADMIN, WA_ADMIN = CFG['admin_email'], CFG['whatsapp_admin']
ADRESSE = CFG['adresse']
Q = lambda s: urllib.parse.quote(s, safe='')

# ---------------------------------------------------------------- colonnes du Google Sheets (index 0 = A)
COL = dict(id=0, inscrit=1, statut=2, priorite=3, score=4, prenom=5, nom=6, email=7, whatsapp=8, ville=9, profil=10,
           entreprise=11, site=12, meta=13, google=14, tracking=15, ia=16, objectif=17, budget=18, attentes=19,
           laptop=20, visa=21, presence=22, source=23, utm=24, facture=25, besoins=26, acompte=27, capture=28,
           valider=29, probleme=30, walink=31, relances=32, dernier=33, validee=34, ts=35, consentement=36, paylink=37)

SAMPLE = dict(id='MB-7K3Q9P', prenom='Hanta', nom='Rakoto', email='hanta@example.com', whatsapp='+261 34 12 345 67',
              wa='261341234567', ville='Antananarivo, Ankorondrano', profil_label='E-commerçant(e)', entreprise='Boutique Hanta Créations',
              site='facebook.com/hantacreations', niveau_meta='boost', niveau_meta_label='J’ai déjà boosté des publications',
              niveau_google_label='Quelques notions', tracking_label='Non', ia_label='De temps en temps', objectif='vendre',
              objectif_label='Vendre plus avec mon activité', budget_label='200 000 à 1 000 000 Ar',
              attentes_label='Meta Ads rentables · Tracking (Pixel, GA4) · Piloter avec l’IA', laptop='oui', laptop_label='Oui',
              visa='activation', visa_label='À activer sur place', source_label='Facebook', utm='facebook / cpc / media-buyer-nov',
              facture_label='Non', besoins='Je voudrais savoir si on travaille sur notre propre page.', acompte='plus_tard',
              acompte_operateur='', acompte_ref='', capture_b64='', priorite='Prioritaire', score='72',
              page_url='https://formation-media-buyer.netlify.app/', statut='Candidature reçue', dernier='Accusé de réception · 14/11 10:02',
              inscrit='14/11/2026 10:02')


class Ctx:
    """Produit soit l'expression Make, soit la valeur d'exemple (aperçu)."""
    def __init__(self, mode, src):
        self.mode, self.src = mode, src           # src : 1 (webhook) ou id du module « Search rows »
    def ref(self, k):                               # référence Make sans accolades
        return f'{self.src}.{k}' if self.src == 1 else f'{self.src}.`{COL[k]}`'
    def v(self, k):
        if self.mode == 'preview': return SAMPLE.get(k, '')
        return '{{' + self.ref(k) + '}}'
    def enc(self, k):
        if self.mode == 'preview': return Q(SAMPLE.get(k, ''))
        return '{{encodeURL(' + self.ref(k) + ')}}'
    def iff(self, cond, ok, a, b=''):
        """cond : expression Make (sans accolades) ; ok : valeur booléenne pour l'aperçu."""
        if self.mode == 'preview': return a if ok else b
        assert '"' not in a + b and '{{' not in a + b, (a, b)
        return '{{if(' + cond + '; "' + a + '"; "' + b + '")}}'
    def sw(self, k, cases, default=''):
        if self.mode == 'preview': return cases.get(SAMPLE.get(k), default)
        parts = []
        for key, val in cases.items():
            assert '"' not in val and '{{' not in val
            parts += [f'"{key}"', f'"{val}"']
        return '{{switch(' + self.ref(k) + '; ' + '; '.join(parts) + '; "' + default + '")}}'
    def now(self, fmt='DD/MM/YYYY HH:mm'):
        if self.mode == 'preview': return '14/11/2026 10:02'
        return '{{formatDate(now; "' + fmt + '"; "Indian/Antananarivo")}}'
    def wa_digits(self):
        if self.mode == 'preview': return SAMPLE['wa']
        if self.src == 1: return '{{' + self.ref('wa') + '}}'
        return '{{replace(' + self.ref('whatsapp') + '; "/[^0-9]/g"; "")}}'
    def paylink(self):
        if self.mode == 'preview': return SAMPLE['page_url'] + '?ref=' + SAMPLE['id'] + '#paiement'
        if self.src == 1: return '{{1.page_url}}?ref={{1.id}}#paiement'
        return self.v('paylink')


# ---------------------------------------------------------------- briques HTML (attributs entre apostrophes)
def btn(href, label, color='#1E5BFF'):
    return (f"<a href='{href}' style='display:inline-block;background:{color};color:#ffffff;text-decoration:none;"
            f"font-weight:bold;font-size:15px;padding:14px 22px;border-radius:10px;margin:6px 8px 6px 0'>{label}</a>")
def box(html, color='#1E5BFF', bg='#F5F7FC'):
    return f"<div style='background:{bg};border-left:4px solid {color};padding:14px 18px;border-radius:8px;margin:0 0 18px'>{html}</div>"
SIG = "<p style='margin:22px 0 0'>À très vite,<br><b>Sitraka</b><br>CASSIVI DIGITAL MG</p>"
FOOT = ("<div style='background:#F5F7FC;padding:16px 28px;font-size:12.5px;color:#5C6B86;line-height:1.6'>"
        "Formation Media Buyer pilotée par l’IA · samedi 28 &amp; lundi 30 novembre 2026, de 8h à 17h<br>"
        "Antsakaviro, Antananarivo · WhatsApp +261 37 59 755 12 · cassividigitalmg@gmail.com</div>")
def layout(title, body, eyebrow='CASSIVI DIGITAL MG · FORMATION MEDIA BUYER PILOTÉE PAR L’IA', foot=True):
    return ("<div style='background:#EEF2F8;padding:24px 10px;font-family:Arial,Helvetica,sans-serif'>"
            "<div style='max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E3E8F2'>"
            f"<div style='background:#0A1B3F;padding:24px 28px'><div style='font-size:11px;letter-spacing:2px;color:#E2C88E;font-weight:bold'>{eyebrow}</div>"
            f"<div style='font-size:24px;line-height:1.3;color:#ffffff;font-weight:bold;margin-top:8px'>{title}</div></div>"
            "<div style='height:4px;background:#1E5BFF;line-height:4px;font-size:0'>&nbsp;</div>"
            f"<div style='padding:26px 28px 24px;color:#0D1733;font-size:15.5px;line-height:1.62'>{body}</div>"
            + (FOOT if foot else '') + "</div></div>")

GCAL = lambda d, n: ("https://calendar.google.com/calendar/render?action=TEMPLATE&amp;text=" + Q(f'Formation Media Buyer pilotée par l’IA · Jour {n}')
                     + f"&amp;dates={d}T050000Z/{d}T140000Z&amp;details=" + Q('CASSIVI DIGITAL MG · de 8h à 17h. Apportez votre ordinateur portable et son chargeur.')
                     + "&amp;location=" + Q(ADRESSE))
CAL_BTNS = btn(GCAL('20261128', 1), 'Ajouter le jour 1 à l’agenda', '#0A1B3F') + btn(GCAL('20261130', 2), 'Ajouter le jour 2 à l’agenda', '#0A1B3F')

def wa_to_admin(c, intro):
    return (f"https://wa.me/{WA_ADMIN}?text=" + Q(intro + ' (réf. ') + c.enc('id') + Q(', ') + c.enc('prenom') + Q(' ') + c.enc('nom') + Q(').'))

def wa_to_lead(c, before, after=''):
    """lien WhatsApp vers le candidat, message pré-rédigé (le prénom est inséré)."""
    return f"https://wa.me/{c.wa_digits()}?text=" + Q(before) + c.enc('prenom') + Q(after)

OBJ = {'vendre': '<p><b>Votre objectif : vendre plus avec votre activité.</b> Pendant les deux jours, vous travaillez sur des campagnes adaptées à votre offre, et le mois de suivi vous aide à les faire tourner.</p>',
       'freelance': '<p><b>Votre objectif : devenir media buyer freelance.</b> Le mois de suivi est pensé pour vous aider à décrocher votre première mission.</p>',
       'clients': '<p><b>Votre objectif : proposer la publicité payante à vos clients.</b> Vous repartez avec une méthode claire pour piloter les campagnes et présenter des résultats.</p>',
       'poste': '<p><b>Votre objectif : monter en compétences dans votre poste.</b> Vous repartez avec une méthode et des outils directement applicables.</p>'}
LVL = {'jamais': '<p>Vous débutez en publicité ? C’est prévu : on part des bases, pas à pas, ordinateur en main.</p>',
       'boost': '<p>Vous avez déjà boosté des publications : on passe à la vitesse supérieure avec le Gestionnaire de publicités.</p>',
       'gestionnaire': '<p>Vous utilisez déjà le Gestionnaire de publicités : on va plus loin sur le tracking, l’analyse et l’IA.</p>',
       'clients': '<p>Vous gérez déjà des campagnes pour des clients : l’IA (Claude, ses connecteurs et ses skills) vous fera gagner du temps, avec une méthode d’analyse plus solide.</p>'}


def prep_list(c, sheet):
    """« Pour être prêt(e) » : ordinateur et carte Visa selon les réponses."""
    if sheet:
        lap, visa = (c.ref('laptop') + ' = "Non"', SAMPLE['laptop'] == 'non'), (c.ref('visa') + ' = "Oui"', SAMPLE['visa'] == 'oui')
    else:
        lap, visa = ('1.laptop = "non"', SAMPLE['laptop'] == 'non'), ('1.visa = "oui"', SAMPLE['visa'] == 'oui')
    return ("<ul style='margin:6px 0 18px 18px;padding:0'>"
            + c.iff(lap[0], lap[1], "<li><b>Ordinateur portable :</b> il est indispensable pendant les deux jours. Répondez à cet e-mail, on cherche une solution avec vous.</li>",
                    "<li>Votre ordinateur portable et son chargeur.</li>")
            + c.iff(visa[0], visa[1], "<li>Votre carte Visa, pour régler les publicités sur Meta et Google.</li>",
                    "<li><b>Carte Visa :</b> pas encore ? Elle peut être activée sur place, on vous accompagne.</li>")
            + "<li>De quoi prendre des notes, et votre motivation.</li></ul>")


# ---------------------------------------------------------------- E1 accusé de réception (candidat)
def e1(c):
    paid = ('1.acompte = "paye"', SAMPLE['acompte'] == 'paye')
    body = (f"<p>Bonjour {c.v('prenom')},</p>"
            "<p>Merci pour votre candidature à la <b>formation Media Buyer pilotée par l’IA</b> : deux journées en salle à Antsakaviro, "
            "<b>samedi 28 et lundi 30 novembre, de 8h à 17h</b>, puis un mois de suivi.</p>"
            + c.sw('objectif', OBJ) + c.sw('niveau_meta', LVL)
            + box(f"Votre référence : <b style='font-size:17px;letter-spacing:1px'>{c.v('id')}</b><br><span style='color:#5C6B86;font-size:13.5px'>Gardez-la : elle sert de motif pour votre paiement.</span>", '#B8914A', '#FBF6EC')
            + c.iff(paid[0], paid[1],
                    "<div style='background:#F2FBF5;border-left:4px solid #1FAA57;padding:14px 18px;border-radius:8px;margin:0 0 18px'><b>Acompte déclaré, merci !</b> Nous le vérifions et vous recevez la confirmation de votre place par e-mail, en général sous 24 h.</div>",
                    "<div style='background:#F5F7FC;border-left:4px solid #1E5BFF;padding:14px 18px;border-radius:8px;margin:0 0 18px'><b>Dernière étape pour bloquer votre place :</b> l’acompte de <b>50 000 Ar</b> par Mobile Money. Le solde de 300 000 Ar se règle sur place, le premier jour. Les places étant limitées, elles sont confirmées à réception de l’acompte.</div>")
            + btn('PAYLINK', 'Voir les instructions de paiement')
            + btn(wa_to_admin(c, 'Bonjour, voici la preuve de mon acompte pour la formation Media Buyer'), 'Envoyer ma preuve sur WhatsApp', '#1FAA57')
            + "<p style='margin:18px 0 6px'><b>Pour être prêt(e) le jour J :</b></p>" + prep_list(c, False)
            + "<p>Une question ? Répondez simplement à cet e-mail, ou écrivez-nous sur WhatsApp au 037 59 755 12.</p>" + SIG)
    body = body.replace('PAYLINK', c.paylink())
    subj = f"{c.v('prenom')}, votre candidature est bien reçue · Formation Media Buyer (28 & 30 nov.)"
    return subj, layout('Votre candidature est bien reçue', body)


# ---------------------------------------------------------------- E2 alerte admin (nouvelle candidature)
def e2(c):
    row = lambda k, lab: f"<tr><td style='padding:7px 10px 7px 0;color:#5C6B86;font-size:13.5px;vertical-align:top;white-space:nowrap'>{lab}</td><td style='padding:7px 0;font-size:14.5px;font-weight:bold'>{c.v(k)}</td></tr>"
    fields = [('id', 'Référence'), ('priorite', 'Priorité'), ('score', 'Score /100'), ('email', 'E-mail'), ('whatsapp', 'WhatsApp'),
              ('ville', 'Ville / quartier'), ('profil_label', 'Profil'), ('entreprise', 'Entreprise / activité'), ('site', 'Site / page'),
              ('objectif_label', 'Objectif'), ('niveau_meta_label', 'Meta Ads'), ('niveau_google_label', 'Google Ads'),
              ('tracking_label', 'Pixel / GA4'), ('ia_label', 'Usage de l’IA'), ('budget_label', 'Budget pub / mois'),
              ('attentes_label', 'Priorités'), ('laptop_label', 'Ordinateur portable'), ('visa_label', 'Carte Visa'),
              ('facture_label', 'Facture'), ('source_label', 'Source'), ('utm', 'Campagne (UTM)'), ('besoins', 'Question / besoin')]
    table = "<table style='border-collapse:collapse;width:100%;margin:0 0 18px'>" + ''.join(row(k, l) for k, l in fields) + "</table>"
    paid = ('1.acompte = "paye"', SAMPLE['acompte'] == 'paye')
    acompte = c.iff(paid[0], paid[1], "<b>Acompte déclaré :</b> ", "<b>Acompte :</b> pas encore payé. La relance automatique part demain matin s’il n’est pas déclaré.") \
        + c.v('acompte_operateur') + c.iff('1.acompte_ref', bool(SAMPLE['acompte_ref']), ' · réf. ', '') + c.v('acompte_ref') \
        + c.iff('1.capture_b64', bool(SAMPLE['capture_b64']), f"<br>Capture du transfert enregistrée dans Drive : <a href='{DRIVE_URL}'>dossier des captures</a>.", '')
    valider = f"{HOOK_URL}?action=valider&amp;id={c.v('id')}&amp;t={TOKEN}"
    probleme = f"{HOOK_URL}?action=probleme&amp;id={c.v('id')}&amp;t={TOKEN}"
    welcome = wa_to_lead(c, 'Bonjour ', f', ici Sitraka de CASSIVI DIGITAL MG. Merci pour votre candidature à la formation Media Buyer pilotée par l’IA (samedi 28 et lundi 30 novembre, Antsakaviro). Votre référence : ') \
        + c.enc('id') + Q('. Pour bloquer votre place, il reste l’acompte de 50 000 Ar : tout est expliqué ici ') + (c.enc('page_url') if c.mode == 'make' else Q(SAMPLE['page_url'])) \
        + Q('?ref=') + c.enc('id') + Q('#paiement . Une question ? Je suis là.')
    body = (f"<p style='margin:0 0 14px'><b>{c.v('prenom')} {c.v('nom')}</b> vient de candidater.</p>" + table
            + box(acompte, '#B8914A', '#FBF6EC')
            + "<p style='margin:0 0 6px'><b>Quand l’acompte est reçu sur MVola ou Orange Money :</b> un clic suffit, la confirmation part toute seule.</p>"
            + btn(valider, 'Valider la place', '#1FAA57') + btn(probleme, 'Paiement à vérifier', '#B42318')
            + "<p style='margin:14px 0 6px'><b>Message de bienvenue WhatsApp</b> (déjà rédigé) :</p>" + btn(welcome, 'Ouvrir WhatsApp', '#1FAA57')
            + btn(SHEET_URL, 'Ouvrir le tableau de suivi', '#0A1B3F'))
    subj = f"[Media Buyer] {c.v('priorite')} · {c.v('prenom')} {c.v('nom')} · " + c.iff(paid[0], paid[1], 'acompte déclaré', 'acompte à venir')
    return subj, layout(f"Nouvelle candidature : {c.v('prenom')} {c.v('nom')}", body, 'ALERTE · FORMATION MEDIA BUYER 28 & 30 NOV', foot=False)


# ---------------------------------------------------------------- E3 place confirmée (source : ligne du Sheets)
def e3(c):
    body = (f"<p>Bonjour {c.v('prenom')},</p>"
            "<p><b>C’est officiel : votre place est réservée.</b> Nous avons bien reçu votre acompte, merci pour votre confiance.</p>"
            + box("<b>Samedi 28 et lundi 30 novembre 2026, de 8h à 17h</b><br>" + ADRESSE + "<br>"
                  "Solde de <b>300 000 Ar</b> à régler sur place, le premier jour.", '#1FAA57', '#F2FBF5')
            + "<p><b>Au programme :</b> Meta Ads et Google Ads, le tracking (Pixel, Analytics), la lecture des KPI, et l’IA avec Claude, ses connecteurs et ses skills pour analyser et piloter vos campagnes. L’IA accélère, c’est vous qui décidez.</p>"
            + "<p style='margin:18px 0 6px'><b>À apporter :</b></p>" + prep_list(c, True)
            + CAL_BTNS + "<br>" + btn(f"https://wa.me/{WA_ADMIN}", 'Une question ? WhatsApp', '#1FAA57')
            + "<p style='margin-top:18px'>Le lendemain des deux journées, votre mois de suivi commence : vous pourrez nous écrire pour avancer sur vos campagnes.</p>" + SIG)
    return f"{c.v('prenom')}, votre place est confirmée · Formation Media Buyer, samedi 28 novembre", layout('Votre place est confirmée', body)


# ---------------------------------------------------------------- E4 paiement à vérifier
def e4(c):
    body = (f"<p>Bonjour {c.v('prenom')},</p>"
            "<p>Nous n’avons pas encore pu rapprocher votre acompte de nos relevés Mobile Money. Rien de grave : il nous manque sans doute une information.</p>"
            + box(f"Envoyez-nous sur WhatsApp la <b>capture du transfert</b> ou la <b>référence de la transaction</b>, avec votre référence <b>{c.v('id')}</b>. Nous confirmons votre place dès vérification.", '#B42318', '#FDF2F2')
            + btn(wa_to_admin(c, 'Bonjour, voici la preuve de mon acompte pour la formation Media Buyer'), 'Envoyer ma preuve sur WhatsApp', '#1FAA57')
            + btn(c.paylink(), 'Revoir les instructions de paiement') + SIG)
    return f"{c.v('prenom')}, une précision sur votre acompte · Formation Media Buyer", layout('Une précision sur votre acompte', body)


# ---------------------------------------------------------------- relances et rappels (source : ligne du Sheets)
def relance(c, n):
    if n == 1:
        subj = f"{c.v('prenom')}, votre place pour la formation Media Buyer n’est pas encore bloquée"
        title, intro = 'Votre place n’est pas encore bloquée', (
            "<p>Merci pour votre candidature à la <b>formation Media Buyer pilotée par l’IA</b> (samedi 28 et lundi 30 novembre, Antsakaviro) !</p>"
            "<p>Pour transformer votre candidature en place réservée, il reste une étape : l’acompte de <b>50 000 Ar</b> par Mobile Money. Le solde se règle sur place, le premier jour.</p>")
    elif n == 2:
        subj = f"{c.v('prenom')}, toujours partant(e) pour la formation Media Buyer du 28 novembre ?"
        title, intro = 'Toujours partant(e) ?', (
            "<p>Votre candidature est toujours en attente d’acompte. Si quelque chose vous freine, dites-le-nous :</p>"
            "<ul style='margin:6px 0 18px 18px;padding:0'><li><b>Vous débutez ?</b> On part des bases, pas à pas.</li>"
            "<li><b>Pas de carte Visa ?</b> Elle peut être activée sur place.</li>"
            "<li><b>Une question sur le paiement ?</b> Écrivez-nous, on vous répond vite.</li></ul>"
            "<p>Pour réserver, l’acompte est de <b>50 000 Ar</b> par Mobile Money.</p>")
    else:
        subj = 'Dernier rappel : la formation Media Buyer commence samedi'
        title, intro = 'La formation commence samedi', (
            "<p>La <b>formation Media Buyer pilotée par l’IA</b> commence <b>samedi 28 novembre à 8h</b>, à Antsakaviro.</p>"
            "<p>Votre candidature est enregistrée, mais votre place n’est pas encore confirmée : les places sont limitées et attribuées à réception de l’acompte de <b>50 000 Ar</b>.</p>")
    body = (f"<p>Bonjour {c.v('prenom')},</p>" + intro
            + btn(c.paylink(), 'Voir les instructions de paiement')
            + btn(wa_to_admin(c, 'Bonjour, voici la preuve de mon acompte pour la formation Media Buyer'), 'J’ai payé : envoyer ma preuve', '#1FAA57')
            + f"<p style='color:#5C6B86;font-size:13.5px'>Votre référence : <b>{c.v('id')}</b>. Vous ne pouvez plus venir ? Répondez simplement « désistement » à cet e-mail.</p>" + SIG)
    return subj, layout(title, body)

def rappel(c, kind):
    if kind == 'J2':
        subj, title = 'J-2 : tout ce qu’il faut savoir pour samedi · Formation Media Buyer', 'Rendez-vous samedi à 8h'
        txt = ("<p>Plus que deux jours avant la <b>formation Media Buyer pilotée par l’IA</b>. Voici l’essentiel :</p>"
               + box("<b>Samedi 28 et lundi 30 novembre, de 8h à 17h</b><br>" + ADRESSE + "<br>Solde de 300 000 Ar à régler sur place, le premier jour.", '#1E5BFF')
               + "<p style='margin:18px 0 6px'><b>À apporter :</b></p>" + prep_list(c, True) + CAL_BTNS)
    elif kind == 'J1':
        subj, title = 'C’est demain ! Rendez-vous à 8h à Antsakaviro', 'C’est demain !'
        txt = ("<p>On vous attend <b>demain, samedi 28 novembre, à 8h</b>, à Antsakaviro (" + ADRESSE.split(',')[1].strip() + ").</p>"
               "<p><b>Check-list :</b> ordinateur portable et chargeur, carte Visa si vous en avez une, de quoi noter. Prévoyez d’arriver 10 minutes avant pour vous installer.</p>")
    elif kind == 'V2':
        subj, title = 'Demain, 2e journée de la formation Media Buyer', 'Demain, 2e journée'
        txt = ("<p>Bravo pour cette première journée ! Rendez-vous <b>demain, lundi 30 novembre, à 8h</b>, au même endroit.</p>"
               "<p>Pensez à votre ordinateur et à son chargeur : on passe à la pratique sur vos campagnes, avec l’IA.</p>")
    else:
        subj, title = f"Merci {c.v('prenom')} ! Votre mois de suivi commence", 'Merci, et place au suivi'
        txt = ("<p>Merci d’avoir suivi la <b>formation Media Buyer pilotée par l’IA</b>. Votre mois de suivi commence maintenant : "
               "écrivez-nous sur WhatsApp pour avancer sur vos campagnes et, si vous visez le freelance, sur vos premières missions.</p>"
               "<p><b>Votre avis compte :</b> répondez à cet e-mail en deux lignes. Qu’avez-vous préféré ? Que pourrions-nous améliorer ?</p>"
               + btn(f"https://wa.me/{WA_ADMIN}", 'Écrire sur WhatsApp', '#1FAA57'))
    body = f"<p>Bonjour {c.v('prenom')},</p>" + txt + SIG
    return subj, layout(title, body)


# ---------------------------------------------------------------- point du jour admin (texte agrégé)
def digest_row(c):
    td = "style='padding:9px 8px;border-bottom:1px solid #E3E8F2;font-size:13.5px;vertical-align:top'"
    relance_wa = wa_to_lead(c, 'Bonjour ', ', ici Sitraka de CASSIVI DIGITAL MG. Petit rappel pour la formation Media Buyer (28 et 30 novembre) : votre place sera confirmée dès réception de l’acompte de 50 000 Ar. Tout est expliqué ici : ') + (c.enc('paylink') if c.mode == 'make' else Q(c.paylink())) + Q(' . Une question ? Je suis là.')
    return (f"<tr><td {td}><b>{c.v('prenom')} {c.v('nom')}</b><br><span style='color:#5C6B86'>{c.v('priorite')} · inscrit le {c.v('inscrit')}</span></td>"
            f"<td {td}><b>{c.v('statut')}</b><br><span style='color:#5C6B86'>{c.v('dernier')}</span></td>"
            f"<td {td}><a href='{relance_wa}' style='color:#1FAA57;font-weight:bold'>WhatsApp</a><br><a href='{c.v('valider')}' style='color:#1E5BFF;font-weight:bold'>Valider</a></td></tr>")

def digest(c_text):
    body = ("<p style='margin:0 0 14px'>Voici les candidatures qui attendent une action. Le lien <b>WhatsApp</b> ouvre un message de relance déjà rédigé ; "
            "<b>Valider</b> confirme la place et envoie l’e-mail au participant.</p>"
            "<table style='border-collapse:collapse;width:100%;margin:0 0 18px'><tr>"
            "<th style='text-align:left;padding:8px;background:#EEF2FA;font-size:12.5px'>Candidat</th><th style='text-align:left;padding:8px;background:#EEF2FA;font-size:12.5px'>Statut</th>"
            "<th style='text-align:left;padding:8px;background:#EEF2FA;font-size:12.5px'>Action</th></tr>" + c_text + "</table>"
            + btn(SHEET_URL, 'Ouvrir le tableau de suivi', '#0A1B3F'))
    return layout('Point du jour : candidatures à suivre', body, 'POINT DU JOUR · FORMATION MEDIA BUYER 28 & 30 NOV', foot=False)


# ---------------------------------------------------------------- pages de réponse (liens « Valider » / « Paiement à vérifier »)
def page(title, html, color='#1FAA57'):
    return ("<!doctype html><html lang='fr'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
            f"<title>{title}</title></head><body style='margin:0;font-family:Arial,Helvetica,sans-serif;background:#EEF2F8;color:#0D1733'>"
            "<div style='max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E3E8F2'>"
            "<div style='background:#0A1B3F;color:#ffffff;padding:22px 26px'><div style='font-size:11px;letter-spacing:2px;color:#E2C88E;font-weight:bold'>CASSIVI DIGITAL MG · MEDIA BUYER 28 &amp; 30 NOV</div>"
            f"<div style='font-size:22px;font-weight:bold;margin-top:6px'>{title}</div></div><div style='height:4px;background:{color}'></div>"
            f"<div style='padding:24px 26px;line-height:1.6;font-size:15.5px'>{html}"
            f"<p style='margin-top:20px'><a href='{SHEET_URL}' style='color:#1E5BFF;font-weight:bold'>Ouvrir le tableau de suivi</a></p></div></div></body></html>")

def page_valide(c, already=False):
    msg = wa_to_lead(c, 'Bonjour ', ', c’est confirmé : votre place est réservée pour la formation Media Buyer pilotée par l’IA, samedi 28 et lundi 30 novembre, de 8h à 17h, à Antsakaviro. Pensez à votre ordinateur portable et à son chargeur. Le solde de 300 000 Ar se règle sur place le premier jour. À très vite ! Sitraka, CASSIVI DIGITAL MG')
    head = (f"<p><b>{c.v('prenom')} {c.v('nom')}</b> avait déjà une place confirmée : aucun nouvel e-mail n’a été envoyé.</p>" if already else
            f"<p><b>{c.v('prenom')} {c.v('nom')}</b> est inscrit(e) : le statut est passé à « Place confirmée » et l’e-mail de confirmation vient de partir à {c.v('email')}.</p>")
    html = (head + "<p>Envoyez aussi la confirmation sur WhatsApp, le message est déjà rédigé :</p>"
            f"<a href='{msg}' style='display:block;text-align:center;background:#1FAA57;color:#ffffff;text-decoration:none;font-weight:bold;padding:15px;border-radius:10px'>Envoyer la confirmation sur WhatsApp</a>")
    return page('Place déjà confirmée' if already else 'Place confirmée', html)

def page_probleme(c):
    msg = wa_to_lead(c, 'Bonjour ', ', ici Sitraka de CASSIVI DIGITAL MG. Je n’arrive pas encore à retrouver votre acompte pour la formation Media Buyer. Pouvez-vous m’envoyer la capture du transfert ou sa référence ? Merci !')
    html = (f"<p>Le statut de <b>{c.v('prenom')} {c.v('nom')}</b> est passé à « Paiement à vérifier », et un e-mail lui demande sa preuve de paiement.</p>"
            f"<a href='{msg}' style='display:block;text-align:center;background:#1FAA57;color:#ffffff;text-decoration:none;font-weight:bold;padding:15px;border-radius:10px'>Lui écrire sur WhatsApp</a>")
    return page('Paiement à vérifier', html, '#B42318')


# ---------------------------------------------------------------- modules Make
def gmail(mid, x, y, to, subj, html, flt=None, attach=None):
    m = {'id': mid, 'module': 'google-email:sendAnEmail', 'version': 4, 'parameters': {'__IMTCONN__': GMAIL},
         'mapper': {'to': [to], 'subject': subj, 'content': html, 'bodyType': 'rawHtml'},
         'metadata': {'designer': {'x': x, 'y': y}}}
    if attach: m['mapper']['attachments'] = attach
    if flt: m['filter'] = flt
    return m
def sheet_filter(mid, x, y, conds, limit=1, flt=None):
    m = {'id': mid, 'module': 'google-sheets:filterRows', 'version': 2, 'parameters': {'__IMTCONN__': GSHEETS},
         'mapper': {'from': 'drive', 'includesHeaders': True, 'limit': limit, 'filter': conds, 'sheetId': TAB, 'sortOrder': 'asc', 'spreadsheetId': SHEET, 'tableFirstRow': TFR},
         'metadata': {'designer': {'x': x, 'y': y}}}
    if flt: m['filter'] = flt
    return m
def sheet_update(mid, x, y, src, values, flt=None):
    m = {'id': mid, 'module': 'google-sheets:updateRow', 'version': 2, 'parameters': {'__IMTCONN__': GSHEETS},
         'mapper': {'mode': 'map', 'values': values, 'sheetId': TAB, 'rowNumber': '{{' + f'{src}.__ROW_NUMBER__' + '}}',
                    'spreadsheetId': SHEET, 'tableFirstRow': TFR, 'valueInputOption': 'RAW'},
         'metadata': {'designer': {'x': x, 'y': y}}}
    if flt: m['filter'] = flt
    return m
def respond(mid, x, y, body, ctype, flt=None):
    m = {'id': mid, 'module': 'gateway:WebhookRespond', 'version': 1, 'parameters': {},
         'mapper': {'status': 200, 'body': body, 'headers': [{'key': 'Content-Type', 'value': ctype}, {'key': 'Access-Control-Allow-Origin', 'value': '*'}]},
         'metadata': {'designer': {'x': x, 'y': y}}}
    if flt: m['filter'] = flt
    return m
def router(mid, x, y, routes):
    return {'id': mid, 'module': 'builtin:BasicRouter', 'version': 1, 'mapper': None, 'routes': [{'flow': r} for r in routes],
            'metadata': {'designer': {'x': x, 'y': y}}}
F = lambda name, *groups: {'name': name, 'conditions': [list(g) for g in groups]}
C = lambda a, o, b=None: ({'a': a, 'o': o, 'b': b} if b is not None else {'a': a, 'o': o})
NOW = '{{formatDate(now; "DD/MM/YYYY HH:mm"; "Indian/Antananarivo")}}'
NOWS = '{{formatDate(now; "DD/MM HH:mm"; "Indian/Antananarivo")}}'
TODAY = '{{formatDate(now; "YYYYMMDD"; "Indian/Antananarivo")}}'
TOK = lambda act: [C('{{1.action}}', 'text:equal', act), C('{{1.t}}', 'text:equal', TOKEN), C('{{1.id}}', 'exist')]


def build(mode='make'):
    W = Ctx(mode, 1)
    # ---- route 1 : inscription
    values = {
        '0': '{{1.id}}', '1': NOW, '2': '{{if(1.acompte = "paye"; "Acompte déclaré"; "Candidature reçue")}}', '3': '{{1.priorite}}', '4': '{{1.score}}',
        '5': '{{1.prenom}}', '6': '{{1.nom}}', '7': '{{lower(trim(1.email))}}', '8': '{{1.whatsapp}}', '9': '{{1.ville}}', '10': '{{1.profil_label}}',
        '11': '{{1.entreprise}}', '12': '{{1.site}}', '13': '{{1.niveau_meta_label}}', '14': '{{1.niveau_google_label}}', '15': '{{1.tracking_label}}',
        '16': '{{1.ia_label}}', '17': '{{1.objectif_label}}', '18': '{{1.budget_label}}', '19': '{{1.attentes_label}}', '20': '{{1.laptop_label}}',
        '21': '{{1.visa_label}}', '22': '{{if(1.presence = "oui"; "Confirmée"; "Non confirmée")}}', '23': '{{1.source_label}}', '24': '{{1.utm}}',
        '25': '{{1.facture_label}}', '26': '{{1.besoins}}',
        '27': '{{if(1.acompte = "paye"; "Déclaré · "; "À payer")}}{{1.acompte_operateur}}{{if(1.acompte_ref; " · réf. "; "")}}{{1.acompte_ref}}',
        '28': '{{if(1.capture_b64; "Dans Drive (dossier des captures)"; "")}}',
        '29': f'{HOOK_URL}?action=valider&id={{{{1.id}}}}&t={TOKEN}', '30': f'{HOOK_URL}?action=probleme&id={{{{1.id}}}}&t={TOKEN}',
        '31': wa_to_lead(W, 'Bonjour ', ', ici Sitraka de CASSIVI DIGITAL MG. Petit rappel pour la formation Media Buyer (28 et 30 novembre) : votre place sera confirmée dès réception de l’acompte de 50 000 Ar. Tout est expliqué ici : ')
              + '{{encodeURL(1.page_url)}}' + Q('?ref=') + '{{encodeURL(1.id)}}' + Q('#paiement . Une question ? Je suis là.'),
        '32': '0', '33': '{{if(1.acompte = "paye"; "Accusé de réception (acompte à vérifier)"; "Accusé de réception")}} · ' + NOWS, '35': '{{timestamp}}',
        '36': 'Oui · ' + NOW, '37': '{{1.page_url}}?ref={{1.id}}#paiement'}
    add = {'id': 10, 'module': 'google-sheets:addRow', 'version': 2, 'parameters': {'__IMTCONN__': GSHEETS},
           'filter': F('Inscription valide (anti-robot)', [C('{{1.action}}', 'text:equal', 'inscription'), C('{{1.email}}', 'text:contain', '@'),
                       C('{{1.adresse_complete}}', 'notexist'), C('{{1.consent}}', 'text:equal', 'oui'), C('{{1.t_fill}}', 'number:greaterorequal', '15')]),
           'mapper': {'mode': 'map', 'values': values, 'sheetId': TAB, 'spreadsheetId': SHEET, 'tableFirstRow': TFR,
                      'insertDataOption': 'INSERT_ROWS', 'valueInputOption': 'RAW', 'insertUnformatted': False},
           'metadata': {'designer': {'x': 300, 'y': -600}}}
    s1, h1 = e1(W)
    s2, h2 = e2(W)
    drive = {'id': 16, 'module': 'google-drive:ActionUploadFile', 'version': 3, 'parameters': {'account': GSHEETS},
             'mapper': {'data': '{{toBinary(1.capture_b64; "base64")}}', 'convert': False, 'fileName': '{{1.id}}-{{1.prenom}}-{{1.nom}}-acompte.jpg',
                        'folderId': DRIVE_ID, 'destination': 'personal'},
             'filter': F('Capture jointe', [C('{{1.capture_b64}}', 'exist')]), 'metadata': {'designer': {'x': 1500, 'y': -700}}}
    route1 = [add, respond(11, 600, -600, '{"ok":true,"id":"{{1.id}}"}', 'application/json'),
              gmail(12, 900, -600, '{{lower(trim(1.email))}}', s1, h1),
              router(13, 1200, -600, [[drive], [gmail(15, 1500, -500, ADMIN, s2, h2)]])]
    # ---- route 2 : valider (lien admin)
    V = Ctx(mode, 20); s3, h3 = e3(V)
    route2 = [sheet_filter(20, 300, -150, [[{'a': 'A', 'b': '{{1.id}}', 'o': 'text:equal'}]], 1, F('Lien « Valider » (jeton)', TOK('valider'))),
              router(21, 600, -150, [
                  [sheet_update(22, 900, -250, 20, {'2': 'Place confirmée', '33': 'Confirmation de place · ' + NOWS, '34': NOW},
                                F('Pas encore confirmée', [C('{{20.`2`}}', 'text:notequal', 'Place confirmée')])),
                   gmail(23, 1200, -250, '{{20.`7`}}', s3, h3),
                   respond(24, 1500, -250, page_valide(V), 'text/html; charset=utf-8')],
                  [respond(25, 900, -50, page_valide(V, True), 'text/html; charset=utf-8', F('Déjà confirmée', [C('{{20.`2`}}', 'text:equal', 'Place confirmée')]))]])]
    # ---- route 3 : paiement à vérifier (lien admin)
    P = Ctx(mode, 30); s4, h4 = e4(P)
    route3 = [sheet_filter(30, 300, 250, [[{'a': 'A', 'b': '{{1.id}}', 'o': 'text:equal'}]], 1, F('Lien « Paiement à vérifier » (jeton)', TOK('probleme'))),
              sheet_update(31, 600, 250, 30, {'2': 'Paiement à vérifier', '33': 'Paiement à vérifier · ' + NOWS}),
              gmail(32, 900, 250, '{{30.`7`}}', s4, h4),
              respond(33, 1200, 250, page_probleme(P), 'text/html; charset=utf-8')]
    # ---- route 4 : relances et rappels quotidiens (appel planifié)
    R = Ctx(mode, 41)
    st = lambda v: C('{{41.`2`}}', 'text:equal', v)
    rel = '{{ifempty(41.`32`; 0)}}'
    hrs = '{{(timestamp - parseNumber(41.`35`)) / 3600}}'
    sent = lambda tag: C('{{41.`33`}}', 'text:notcontain', tag)
    day = lambda d: C(TODAY, 'number:equal', d)
    mails = {}
    for n in (1, 2, 3): mails[f'R{n}'] = relance(R, n)
    for k in ('J2', 'J1', 'V2', 'M'): mails[k] = rappel(R, k)
    s3r, h3r = e3(R)
    agg = {'id': 66, 'module': 'util:TextAggregator', 'version': 1, 'parameters': {'feeder': 41, 'rowSeparator': ''},
           'mapper': {'value': digest_row(R)}, 'metadata': {'designer': {'x': 900, 'y': 1650}},
           'filter': F('Candidatures à suivre', [st('Candidature reçue')], [st('Acompte déclaré')], [st('Paiement à vérifier')])}
    routes4 = [
        [gmail(50, 900, 650, '{{41.`7`}}', *mails['R1'], F('Relance 1 (J+1)', [st('Candidature reçue'), C(rel, 'number:equal', '0'), C(hrs, 'number:greaterorequal', '20'), C(TODAY, 'number:less', '20261126')])),
         sheet_update(51, 1200, 650, 41, {'32': '1', '33': 'Relance 1 · ' + NOWS})],
        [gmail(52, 900, 800, '{{41.`7`}}', *mails['R2'], F('Relance 2 (J+3)', [st('Candidature reçue'), C(rel, 'number:equal', '1'), C(hrs, 'number:greaterorequal', '68'), C(TODAY, 'number:less', '20261126')])),
         sheet_update(53, 1200, 800, 41, {'32': '2', '33': 'Relance 2 · ' + NOWS})],
        [gmail(54, 900, 950, '{{41.`7`}}', *mails['R3'], F('Dernier rappel (26 nov.)', [st('Candidature reçue'), day('20261126'), C(rel, 'number:less', '3')],
                                                            [st('Paiement à vérifier'), day('20261126'), C(rel, 'number:less', '3')])),
         sheet_update(55, 1200, 950, 41, {'32': '3', '33': 'Dernier rappel · ' + NOWS})],
        [gmail(56, 900, 1100, '{{41.`7`}}', s3r, h3r, F('Place confirmée depuis le tableau', [st('Place confirmée'), C('{{41.`34`}}', 'notexist')])),
         sheet_update(57, 1200, 1100, 41, {'33': 'Confirmation de place · ' + NOWS, '34': NOW})],
        [gmail(58, 900, 1250, '{{41.`7`}}', *mails['J2'], F('Rappel J-2 (26 nov.)', [st('Place confirmée'), day('20261126'), C('{{41.`34`}}', 'exist'), sent('Rappel J-2')])),
         sheet_update(59, 1200, 1250, 41, {'33': 'Rappel J-2 · ' + NOWS})],
        [gmail(60, 900, 1350, '{{41.`7`}}', *mails['J1'], F('Rappel J-1 (27 nov.)', [st('Place confirmée'), day('20261127'), sent('Rappel J-1')])),
         sheet_update(61, 1200, 1350, 41, {'33': 'Rappel J-1 · ' + NOWS})],
        [gmail(62, 900, 1450, '{{41.`7`}}', *mails['V2'], F('Veille du jour 2 (29 nov.)', [st('Place confirmée'), day('20261129'), sent('Veille jour 2')])),
         sheet_update(63, 1200, 1450, 41, {'33': 'Veille jour 2 · ' + NOWS})],
        [gmail(64, 900, 1550, '{{41.`7`}}', *mails['M'], F('Merci + suivi (1er au 3 déc.)', [st('Place confirmée'), C(TODAY, 'number:greaterorequal', '20261201'), C(TODAY, 'number:lessorequal', '20261203'), sent('Merci')])),
         sheet_update(65, 1200, 1550, 41, {'33': 'Merci + suivi · ' + NOWS})],
        [agg, gmail(67, 1200, 1650, ADMIN, '[Media Buyer] Point du jour · {{formatDate(now; "DD/MM"; "Indian/Antananarivo")}}', digest('{{66.text}}'))]]
    route4 = [respond(40, 300, 1100, '{"ok":true}', 'application/json', F('Appel quotidien (jeton)', [C('{{1.action}}', 'text:equal', 'cron'), C('{{1.t}}', 'text:equal', TOKEN)])),
              sheet_filter(41, 600, 1100, [[{'a': 'C', 'b': 'Désisté', 'o': 'text:notequal'}]], 300),
              router(42, 900, 1100, routes4)]
    flow = [{'id': 1, 'module': 'gateway:CustomWebHook', 'version': 1, 'parameters': {'hook': HOOK_ID, 'maxResults': 1}, 'mapper': {},
             'metadata': {'designer': {'x': -300, 'y': 300}}},
            router(2, 0, 300, [route1, route2, route3, route4])]
    bp = {'name': 'Formation Media Buyer 28-30 nov : inscriptions, validation en 1 clic, relances et rappels', 'flow': flow,
          'metadata': {'instant': True, 'version': 1, 'scenario': {'roundtrips': 1, 'maxErrors': 3, 'autoCommit': True, 'autoCommitTriggerLast': True,
                       'sequential': False, 'confidential': False, 'dataloss': False, 'dlq': False, 'freshVariables': False}}}
    return bp


def previews():
    out = os.path.join(HERE, 'apercus_emails'); os.makedirs(out, exist_ok=True)
    W, R = Ctx('preview', 1), Ctx('preview', 41)
    items = [('01_accuse-reception_candidat', e1(W)), ('02_alerte-admin', e2(W)), ('03_place-confirmee', e3(R)),
             ('04_paiement-a-verifier', e4(R)), ('05_relance-1_J+1', relance(R, 1)), ('06_relance-2_J+3', relance(R, 2)),
             ('07_dernier-rappel_26-nov', relance(R, 3)), ('08_rappel-J-2', rappel(R, 'J2')), ('09_rappel-J-1', rappel(R, 'J1')),
             ('10_veille-jour-2', rappel(R, 'V2')), ('11_merci-suivi', rappel(R, 'M'))]
    for name, (subj, html) in items:
        open(os.path.join(out, name + '.html'), 'w').write(
            f"<!doctype html><html lang='fr'><head><meta charset='utf-8'><title>{subj}</title></head><body style='margin:0'>"
            f"<div style='font-family:Arial;padding:12px 16px;background:#0A1B3F;color:#E2C88E;font-size:13px'>Objet : <b style='color:#fff'>{subj}</b></div>{html}</body></html>")
    open(os.path.join(out, '12_point-du-jour-admin.html'), 'w').write("<!doctype html><html lang='fr'><head><meta charset='utf-8'></head><body style='margin:0'>" + digest(digest_row(R) * 2) + "</body></html>")
    open(os.path.join(out, '13_page-valider.html'), 'w').write(page_valide(R))
    return len(items) + 2


def check(bp):
    bad = []
    def walk(o, path):
        if isinstance(o, dict): [walk(v, path + '.' + str(k)) for k, v in o.items()]
        elif isinstance(o, list): [walk(v, path + f'[{i}]') for i, v in enumerate(o)]
        elif isinstance(o, str):
            depth = 0; i = 0
            while i < len(o):
                if o.startswith('{{', i): depth += 1; i += 2; continue
                if o.startswith('}}', i): depth -= 1; i += 2; continue
                i += 1
                if depth < 0: break
            if depth != 0 or o.count('{{') != o.count('}}'): bad.append(path)
    walk(bp, '')
    assert not bad, bad
    return True


if __name__ == '__main__':
    bp = build(); check(bp)
    json.dump(bp, open(os.path.join(HERE, 'blueprint.json'), 'w'), ensure_ascii=False, indent=1)
    n = previews()
    mods = []
    def walk(fl):
        for m in fl:
            mods.append(m['module'])
            for r in m.get('routes', []): walk(r['flow'])
    walk(bp['flow'])
    print('blueprint.json :', len(mods), 'modules |', os.path.getsize(os.path.join(HERE, 'blueprint.json')) // 1024, 'Ko | aperçus :', n)
    from collections import Counter; print(Counter(mods))
