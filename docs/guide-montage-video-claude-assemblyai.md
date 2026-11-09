# Guide : faire monter ses vidéos par Claude (Claude Code + AssemblyAI)

Ce guide reprend le principe montré dans la vidéo « Claude peut désormais monter… » (IA Campus) :
**Claude Code** pilote le montage, **AssemblyAI** transcrit la vidéo mot par mot avec les horodatages,
et **FFmpeg** effectue les coupes et l'export.

Concrètement, Claude :
1. envoie l'audio de la vidéo à AssemblyAI et récupère la transcription horodatée ;
2. repère les silences, les « euh », les phrases ratées et les répétitions ;
3. vous montre la liste des coupes à valider ;
4. découpe la vidéo avec FFmpeg, ajoute éventuellement des sous-titres et exporte (format Reels/TikTok 9:16 si besoin).

> Tout se passe **sur votre ordinateur**, là où se trouvent vos vidéos.

---

## 1. Prérequis

| Élément | Pourquoi | Coût |
|---|---|---|
| Abonnement Claude Pro ou Max (ou clé API Anthropic) | Pour utiliser Claude Code | Payant |
| Claude Code | L'agent qui fait le montage | Inclus |
| Node.js 18+ | Pour installer les skills (`npx`) | Gratuit |
| FFmpeg | Le moteur de découpe et d'export vidéo | Gratuit |
| Compte AssemblyAI | La transcription mot par mot | Crédits gratuits à l'inscription |

---

## 2. Installer Claude Code

**Windows (PowerShell)**
```powershell
irm https://claude.ai/install.ps1 | iex
```

**macOS / Linux**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Puis lancez `claude` dans un terminal et connectez-vous avec votre compte Claude.

---

## 3. Installer FFmpeg

**Windows**
```powershell
winget install Gyan.FFmpeg
```

**macOS**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian)**
```bash
sudo apt install ffmpeg
```

Vérification : `ffmpeg -version` doit afficher une version.

---

## 4. Créer sa clé API AssemblyAI

1. Créez un compte sur <https://www.assemblyai.com>.
2. Dans le tableau de bord, menu de gauche : **Manage → API Keys** (c'est l'écran visible dans la vidéo).
3. Copiez la clé « Default API Key » (ou créez-en une nouvelle avec **Create new API key**).

Enregistrez-la comme **variable d'environnement** (ne la collez jamais dans le chat ni dans un fichier partagé) :

**Windows (PowerShell)** — puis fermez et rouvrez le terminal :
```powershell
setx ASSEMBLYAI_API_KEY "votre_cle_ici"
```

**macOS / Linux** — ajoutez la ligne dans `~/.zshrc` ou `~/.bashrc` :
```bash
export ASSEMBLYAI_API_KEY="votre_cle_ici"
```

> Si votre clé a été vue par quelqu'un (capture d'écran, vidéo, message), supprimez-la dans
> AssemblyAI et créez-en une nouvelle.

---

## 5. Installer le skill AssemblyAI dans Claude Code

Le skill officiel apprend à Claude à utiliser correctement l'API AssemblyAI :

```bash
npx skills add AssemblyAI/assemblyai-skill --global
```

(sans `--global`, il est installé uniquement dans le dossier courant)

### Option : un skill dédié au montage

Pour un montage plus poussé (coupe entre les mots sans les rogner, liste de coupes à valider,
sous-titres, export FCPXML pour DaVinci Resolve / Premiere) :

```bash
npx skills add vargHQ/skills --skill edit-footage-with-code
```

Ce skill peut aussi fonctionner sans AssemblyAI (transcription locale Whisper).

---

## 6. Utilisation

1. Mettez votre vidéo dans un dossier, par exemple `Videos/montage/prise1.mp4`.
2. Ouvrez un terminal dans ce dossier et lancez :
   ```bash
   claude
   ```
3. Donnez votre consigne en français.

### Exemples de consignes

- « Transcris `prise1.mp4` avec AssemblyAI, supprime les silences de plus de 0,7 s, les "euh" et les
  phrases que je recommence. Montre-moi la liste des coupes avant de couper. Ne modifie jamais le fichier original. »
- « Fais un Reel 9:16 de 45 secondes maximum avec les meilleurs passages, et incruste les sous-titres en français. »
- « Génère un fichier de sous-titres `.srt` en français à partir de la transcription. »
- « Découpe ce podcast de 60 minutes en 5 extraits verticaux de 30 secondes avec sous-titres. »

---

## 7. Conseils et limites

- **Validez toujours la liste des coupes** avant l'export : Claude peut couper une pause voulue.
- **Gardez l'original** : demandez explicitement d'écrire dans un nouveau fichier.
- Les crédits AssemblyAI gratuits sont limités : surveillez **Manage → Usage** dans le tableau de bord.
- Pour les effets avancés (zooms, animations, B-roll), Claude peut s'appuyer sur Remotion ou HyperFrames,
  mais cela demande plus de configuration.
