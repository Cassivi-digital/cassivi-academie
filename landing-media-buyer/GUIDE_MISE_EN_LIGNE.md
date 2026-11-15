# Mise en ligne · Landing « Formation Media Buyer pilotée par l’IA »

Session des **samedi 28 et lundi 30 novembre 2026** à Antsakaviro. Il faut environ 20 minutes pour tout mettre en route.

## Ce qui est déjà prêt

| Élément | État |
|---|---|
| **Page de réservation**, avec un formulaire d’inscription en 5 étapes et une étape de vérification | Prête : `1_A_DEPOSER_SUR_NETLIFY.zip` |
| **Scénario Make** « Formation Media Buyer 28-30 nov : inscriptions, validation en 1 clic, relances et rappels » (ID 8566781) | **Créé et activé** dans votre compte Make |
| **Tableau de suivi** Google Sheets « Inscriptions » et « Tableau de bord » | Dans votre Google Drive (lien dans chaque e-mail d’alerte) |
| **Pixel Meta** `1668983478012670` | **Installé dans le `<head>`** : PageView (visite), Lead (après une inscription réellement envoyée), Contact (clic WhatsApp) |
| **Tests** | 110 vérifications réussies sur ordinateur et mobile, au clavier, en cas d’envoi réussi comme de panne réseau, Pixel compris. Accessibilité WCAG 2.2 AA : aucun problème. |

---

## Étape 1 · Vérifier `config.js` (2 min)

Ouvrez le fichier `config.js` (à la racine du dossier du site) avec le Bloc-notes.

1. **Numéros Mobile Money** pour l’acompte : ils sont déjà remplis.
   ```js
   mobileMoney: [
     { service: 'MVola',        numero: '038 48 782 22', titulaire: 'RAMAMONJISOA' },
     { service: 'Orange Money', numero: '037 59 755 12', titulaire: 'Andrianambinina Sitraka' },
   ],
   ```
   - Ils s’affichent dans les instructions de paiement : juste après l’inscription, et sur le lien « Voir les instructions de paiement » de chaque e-mail.
   - Chaque numéro a un bouton « Copier ». La page conseille MVola ou Orange Money selon le numéro de téléphone de l’inscrit.
   - Pour changer un numéro ou un nom, modifiez la ligne, puis redéployez le dossier.
2. **Pixel Meta** : déjà installé, rien à remplir.
   - Le code de base officiel (ID `1668983478012670`) est chargé en premier dans le `<head>` de la page, depuis `assets/js/meta-pixel.js`.
   - **PageView** part à chaque visite.
   - **Lead** part uniquement après une inscription réellement envoyée, jamais sur un simple clic ni sur un envoi en échec.
   - **Contact** part à chaque clic sur un bouton WhatsApp.
   - Sans JavaScript, une image de secours envoie PageView, et la page merci envoie Lead.
   - Ne collez pas le code du Pixel dans `index.html` : la sécurité de la page bloque les scripts collés, et le Pixel serait compté deux fois.
   - Google Analytics 4 reste facultatif (`ga4Id` dans `config.js`).

## Étape 2 · Mettre la page sur Netlify (5 min)

1. Décompressez `1_A_DEPOSER_SUR_NETLIFY.zip`.
2. Sur **app.netlify.com**, ouvrez **Add new site → Deploy manually**, puis glissez le dossier obtenu. C’est celui qui contient `index.html`.
3. Le site s’appelle **`media-buyer-ia`** (adresse **media-buyer-ia.netlify.app**).
   - Les aperçus Facebook, WhatsApp et LinkedIn (image et titre) pointent vers cette adresse.
   - Autre nom ? Dans `index.html`, remplacez les 4 occurrences de `media-buyer-ia.netlify.app`.
4. Activez la **copie de secours** des inscriptions :
   - **Forms → Enable form detection**, puis glissez à nouveau le dossier dans **Deploys**.
   - Ensuite, dans **Forms → Form notifications**, ajoutez un e-mail vers cassividigitalmg@gmail.com.
5. **Modifier la page plus tard** : changez le fichier, puis glissez à nouveau le dossier dans **Deploys**.

## Pixel Meta · mettre en ligne et vérifier (10 min)

### 1. Mettre en ligne sur Netlify
1. Décompressez `1_A_DEPOSER_SUR_NETLIFY.zip`. Vous obtenez un dossier qui contient `index.html`.
2. Ouvrez **app.netlify.com** et connectez-vous.
3. Cliquez sur votre site **media-buyer-ia**. Ne créez pas de nouveau site : l’adresse changerait.
4. Ouvrez l’onglet **Deploys**.
5. Glissez le dossier décompressé dans la zone de dépôt (« Drag and drop ») de cette page.
6. Attendez que le déploiement passe à **Published**, en quelques secondes. L’adresse reste https://media-buyer-ia.netlify.app, et la publicité en cours en profite tout de suite.

### 2. Vérifier que le Pixel fonctionne
1. Dans Chrome, installez l’extension **Meta Pixel Helper**.
2. Ouvrez https://media-buyer-ia.netlify.app. L’extension affiche **1 pixel**, ID `1668983478012670`, avec l’événement **PageView**.
3. Ouvrez le **Gestionnaire d’événements** (Meta Business Suite), choisissez votre Pixel, puis l’onglet **Tester les événements**.
4. Saisissez https://media-buyer-ia.netlify.app, puis cliquez sur **Ouvrir le site web**. Vérifiez trois événements :
   - **PageView** apparaît tout de suite ;
   - **Contact** apparaît quand vous cliquez sur un bouton WhatsApp ;
   - **Lead** apparaît quand vous faites une inscription test jusqu’à l’écran « Merci ». Supprimez ensuite la ligne de test dans le tableau Google Sheets.
5. Si rien n’apparaît, ouvrez la page dans une fenêtre de navigation privée et désactivez votre bloqueur de publicités : il bloque aussi le Pixel.

### 3. Utiliser le Pixel dans vos publicités
- **Ensemble de publicités** : objectif **Prospects**, lieu de conversion **Site web**, Pixel `1668983478012670`, événement de conversion **Prospect** (Lead).
- **Publicité** : dans **Suivi**, puis **Événements du site web**, cochez le Pixel.
- **Publicité déjà en ligne** : la modifier la renvoie en examen chez Meta. Le Pixel mesure de toute façon les visites venues de toutes vos publicités.

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
- [ ] Ouvrez le lien « Voir les instructions de paiement » d’un e-mail : le panneau de paiement s’affiche avec la référence et les numéros MVola et Orange Money.
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
