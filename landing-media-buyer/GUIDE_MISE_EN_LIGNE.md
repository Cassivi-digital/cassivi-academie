# Mise en ligne · Landing « Formation Media Buyer pilotée par l’IA »

Session des **samedi 28 et lundi 30 novembre 2026** à Antsakaviro. Il faut environ 20 minutes pour tout mettre en route.

## Ce qui est déjà prêt

| Élément | État |
|---|---|
| **Page de réservation**, avec un formulaire d’inscription en 5 étapes et une étape de vérification | Prête : `1_A_DEPOSER_SUR_NETLIFY.zip` |
| **Scénario Make** « Formation Media Buyer 28-30 nov : inscriptions, validation en 1 clic, relances et rappels » (ID 8566781) | **Créé et activé** dans votre compte Make |
| **Tableau de suivi** Google Sheets « Inscriptions » et « Tableau de bord » | Dans votre Google Drive (lien dans chaque e-mail d’alerte) |
| **Tests** | 86 vérifications réussies sur ordinateur et mobile, au clavier, en cas d’envoi réussi comme de panne réseau. Accessibilité WCAG 2.2 AA : aucun problème. |

---

## Étape 1 · Compléter `config.js` (5 min)

Ouvrez le fichier `config.js` (à la racine du dossier du site) avec le Bloc-notes.

1. **Numéros Mobile Money** pour l’acompte. Retirez les `//` en début de ligne et remplacez les numéros et les noms :
   ```js
   mobileMoney: [
     { service: 'MVola',        numero: '034 xx xxx xx', titulaire: 'Votre nom' },
     { service: 'Orange Money', numero: '032 xx xxx xx', titulaire: 'Votre nom' },
   ],
   ```
   Tant que la liste reste vide, la page invite les inscrits à vous demander le numéro sur WhatsApp, avec leur référence. Rien n’est bloqué.
2. **Facultatif** : Pixel Meta (`metaPixelId`) et Google Analytics 4 (`ga4Id`).
   - L’événement « Lead » est envoyé à chaque inscription.
   - Une mention de mesure d’audience s’ajoute alors automatiquement en bas de page.

## Étape 2 · Mettre la page sur Netlify (5 min)

1. Décompressez `1_A_DEPOSER_SUR_NETLIFY.zip`.
2. Sur **app.netlify.com**, ouvrez **Add new site → Deploy manually**, puis glissez le dossier obtenu. C’est celui qui contient `index.html`.
3. Dans **Site configuration → Change site name**, choisissez **`formation-media-buyer-cassivi`**.
   - Les aperçus Facebook, WhatsApp et LinkedIn (image et titre) pointent vers cette adresse.
   - Autre nom ? Dans `index.html`, remplacez les 4 occurrences de `formation-media-buyer-cassivi.netlify.app`.
4. Activez la **copie de secours** des inscriptions :
   - **Forms → Enable form detection**, puis glissez à nouveau le dossier dans **Deploys**.
   - Ensuite, dans **Forms → Form notifications**, ajoutez un e-mail vers cassividigitalmg@gmail.com.
5. **Modifier la page plus tard** : changez le fichier, puis glissez à nouveau le dossier dans **Deploys**.

## Étape 3 · Programmer l’appel quotidien (3 min)

Les relances et les rappels partent quand le scénario reçoit un appel chaque matin.

1. Créez un compte gratuit sur **cron-job.org**, puis cliquez sur **Create cronjob**.
2. Collez l’URL indiquée dans `ACCES_PRIVES.txt`.
3. Réglez : **tous les jours à 09:00**, fuseau **Indian/Antananarivo**.

Chaque appel déclenche :

| Quand | Ce qui part |
|---|---|
| J+1 et J+3 après l’inscription | Relance si l’acompte n’est pas encore déclaré (jusqu’au 25 nov.) |
| 26 novembre | Dernier rappel aux inscrits sans place confirmée |
| Chaque matin | Confirmation des places que vous avez passées à « Place confirmée » directement dans le tableau |
| 26, 27 et 29 novembre | Rappels J-2, J-1 et veille du 2e jour aux places confirmées |
| 1er au 3 décembre | Remerciement et lancement du mois de suivi |
| Chaque matin | **Point du jour** pour vous : les inscriptions à suivre, avec un bouton WhatsApp et un bouton « Valider » |

## Étape 4 · Valider une place en un clic

Pour chaque inscription, vous recevez l’e-mail « [Media Buyer] Prioritaire · Prénom Nom… », avec toutes les réponses et deux boutons :

- **Valider la place** : le statut passe à « Place confirmée » et le participant reçoit sa confirmation, avec l’adresse et les liens d’agenda. Une page s’ouvre ensuite avec le message WhatsApp de confirmation déjà rédigé.
- **Paiement à vérifier** : le participant reçoit un e-mail qui lui demande sa preuve de transfert.

Vous pouvez aussi écrire « Place confirmée » dans la colonne **Statut** du tableau. L’e-mail part alors au prochain appel quotidien.

## Étape 5 · Tester avant de lancer la publicité (10 min)

- [ ] Sur votre téléphone, faites une inscription test avec votre propre e-mail.
- [ ] Vérifiez que l’inscription est bien arrivée :
  - une nouvelle ligne dans le tableau ;
  - l’e-mail d’accusé de réception côté participant ;
  - l’alerte côté administrateur.
- [ ] Dans l’alerte, cliquez **Valider la place** : vous recevez l’e-mail de confirmation.
- [ ] Ouvrez le lien « Voir les instructions de paiement » d’un e-mail : le panneau de paiement s’affiche avec la référence.
- [ ] Partagez l’adresse du site dans WhatsApp : l’aperçu (image et titre) s’affiche.
- [ ] Supprimez la ligne de test dans le tableau.

## À vérifier par vous

- **Adresse et solde** : je les ai repris de vos formations à Antsakaviro (« à droite du centre de thèse de la faculté de médecine », solde de 300 000 Ar réglé sur place le premier jour).
- **Forfait Make gratuit** : 1 000 opérations par mois, partagées avec vos autres scénarios.
  - Une inscription consomme environ 6 opérations.
  - L’appel quotidien en consomme environ 5, plus 2 par e-mail de relance ou de rappel envoyé.
- **Fermeture des inscriptions** : le formulaire se ferme seul le 28 novembre à 8h. Pour changer cette heure, modifiez `clotureInscriptions` dans `config.js`.

## Contenu du dossier complet

| Chemin | Rôle |
|---|---|
| `site/` | La page, identique au ZIP Netlify : HTML, CSS, JS, polices, photos, vidéo 4:5, `config.js` |
| `make/blueprint.json` | Copie du scénario Make, réimportable (Make : Import blueprint) |
| `make/apercus_emails/` | Aperçu de chacun des 13 e-mails automatiques |
| `apercus/` | Captures de la page (mobile et ordinateur) |
| `ACCES_PRIVES.txt` | URL de l’appel quotidien (secrète : ne la publiez pas) |
| `DESIGN.md` | Charte graphique de la page (couleurs, typographie, composants) |

Confidentialité : le jeton secret qui protège les liens « Valider la place » n’apparaît jamais dans la page publique.
