# Sauvegardes des scénarios Make (14 novembre 2026)

| Fichier | Contenu |
|---|---|
| `8280140_Formations-Cassivi-inscription_2026-11-14_avant-retrait-telesecretaire.json` | Scénario d’inscription **avant** le retrait de la Télésecrétaire médicale (copie exacte de Make) |
| `8280140_modifie_sans-telesecretaire.json` | Version actuellement en ligne : la branche Télésecrétaire est retirée, les inscriptions IA générative et Claude AI sont inchangées |
| `8280203_Formations-Cassivi-confirmation-rappels_2026-11-14.json` | Scénario « confirmation, rappels et relance » : il était inactif et en erreur. **Supprimé de Make le 14 novembre** à votre demande, pour laisser la place à Media Buyer. Copie exacte ici. |

Changements faits sur le scénario 8280140 :
- **Filtre d’entrée** : il n’accepte plus que les formulaires dont la formation est « IA générative et Freelance » ou « Claude AI et Business ». Les envois sans formation (Télésecrétaire) sont ignorés : aucune ligne dans le tableau, aucun e-mail.
- **E-mail d’accusé de réception Télésecrétaire** (module 3) : retiré.

Pour revenir en arrière, ouvrez le scénario dans Make, puis le menu « … » et « Import Blueprint ». Choisissez le fichier « avant-retrait », puis enregistrez.

Pour recréer le scénario supprimé, créez un nouveau scénario dans Make, puis « Import Blueprint » avec le fichier `8280203_…json`. Avant de l’activer, il faudra corriger ses erreurs.
