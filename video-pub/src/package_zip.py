"""Crée un ZIP prêt à télécharger, avec des fichiers renommés par plateforme.
usage: python3 src/package_zip.py <dossier_export> <préfixe_fichiers> <nom_dossier_zip> <titre>"""
import sys, zipfile, os
src, pre, name, title = sys.argv[1:5]
F = [('9x16', '9x16_Facebook-Instagram_Reels-Stories_TikTok.mp4', 'Reels et Stories Facebook/Instagram, TikTok, YouTube Shorts, Statut WhatsApp (haute qualité)'),
     ('4x5', '4x5_Facebook-Instagram_Fil-actualite.mp4', "Fil d'actualité Facebook et Instagram (format mobile recommandé), LinkedIn mobile"),
     ('1x1', '1x1_Facebook-LinkedIn_Fil-Marketplace-Messenger.mp4', 'Fil Facebook (alternative), Marketplace, colonne de droite, Messenger, LinkedIn'),
     ('16x9', '16x9_YouTube_Facebook-InStream_LinkedIn-ordinateur.mp4', 'YouTube, Facebook in-stream, vidéo de couverture de Page, LinkedIn sur ordinateur'),
     ('WhatsApp', '9x16_WhatsApp_Statut-Message_720p-leger.mp4', 'Envoi direct sur WhatsApp (message, groupe, statut) : version légère 720p')]
out = os.path.join(src, f'{name}_TOUS-FORMATS.zip')
lis = [title, '=' * len(title), '', 'Quel fichier pour quelle plateforme ?', '']
with zipfile.ZipFile(out, 'w') as z:
    for k, new, use in F:
        p = os.path.join(src, f'{pre}_{k}.mp4')
        z.write(p, f'{name}/{new}', compress_type=zipfile.ZIP_STORED)
        lis += [f'- {new}', f'  → {use}', '']
    srt = os.path.join(src, f'{pre}_sous-titres.srt')
    if os.path.exists(srt):
        z.write(srt, f'{name}/Sous-titres_FR.srt', compress_type=zipfile.ZIP_DEFLATED)
        lis += ['- Sous-titres_FR.srt', "  → à ajouter dans le Gestionnaire de publicités (la plupart des vidéos du fil sont vues sans le son)", '']
    for k in ['9x16', '4x5', '1x1', '16x9']:
        m = os.path.join(src, f'miniature_{k}.jpg')
        if os.path.exists(m): z.write(m, f'{name}/Miniatures/miniature_{k}.jpg', compress_type=zipfile.ZIP_STORED)
    lis += ['- Miniatures/ : images de couverture de chaque format', '',
            'Campagne Meta Ads : dans une même publicité, chargez le 4x5 (fil), le 9x16 (Stories/Reels) et le 1x1',
            '(Marketplace, colonne de droite) avec « Personnaliser les éléments par placement ».',
            'Objectif recommandé : Messages → WhatsApp (037 59 755 12).', '',
            'Qualité : MP4 H.264, 30 i/s, couleurs BT.709, son AAC 320 kb/s à −14 LUFS (versions principales).']
    z.writestr(f'{name}/LISEZ-MOI.txt', '\r\n'.join(lis), compress_type=zipfile.ZIP_DEFLATED)
print(out, round(os.path.getsize(out) / 1e6, 1), 'Mo')
with zipfile.ZipFile(out) as z:
    for i in z.infolist(): print(f'  {i.filename}  {i.file_size/1e6:.1f} Mo')
    assert z.testzip() is None
