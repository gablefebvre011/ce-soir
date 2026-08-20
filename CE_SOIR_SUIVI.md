# CE SOIR — Suivi de session

> ⚠️ RÈGLE OBLIGATOIRE : ce document DOIT être mis à jour à la fin de chaque
> session, avant de manquer de tokens ou de changer d'IA. Si tu changes de
> Claude/IA en cours de route, mets ce fichier à jour AVANT de switcher.

---

## Fichier de travail actif (LA SEULE VERSION VALIDE)

**Nom : `index.html`** (à la racine du repo GitHub Pages — sert automatiquement le site)

- Contenu = ancien `ce-soir-app-v9.html`, renommé `index.html` pour simplifier
- Base : `ce-soir-app-v8-photos.html` (upload photos Supabase Storage)
- + fix CSS `.premium-card { flex-shrink:0 }` réappliqué (venait de `index-v2-final.html`)
- Statut : à re-tester au complet avant d'ajouter du nouveau code par-dessus

⚠️ Ne plus jamais créer de nouveau nom de fichier (`v2-final`, `v8-photos`, `v9`, etc).
UN SEUL fichier de travail désormais : `index.html`. Toute nouvelle version
remplace ce même fichier, jamais un nouveau nom.

Historique : `index-v2-final.html` et `ce-soir-app-v8-photos.html` avaient
divergé le 2026-08-20 (une session a fixé le CSS pendant qu'une autre bâtissait
le système photo, sans que les deux se voient). Fusionnés et renommés `index.html`.

---

## État des bugs connus

| Bug | Statut | Note |
|---|---|---|
| `.premium-card` collapse à 32px (flex-shrink) | ✅ Fixé | Réappliqué dans v9 le 2026-08-20 |
| Profile Cards layout (bug #2) | ⏳ Non fixé | Identifié, pas encore adressé |

---

## Système photo (upload Supabase Storage)

- ✅ Upload vers bucket `avatars` — `uploadPhotoToStorage()`
- ✅ Slots photo avec état "uploading"
- ✅ `persistMyPhotos()` — sync Supabase en arrière-plan
- ❌ Compression avant upload — PAS FAIT
- ❌ Cropping/preview avant envoi — PAS FAIT
- ❌ Galerie complète sur cartes Découvrir — PAS FAIT
- ❌ Test bout-en-bout avec une vraie photo — PAS ENCORE TESTÉ

---

## Prochaines étapes (dans l'ordre)

1. Tester upload d'une vraie photo dans `ce-soir-app-v9.html`, confirmer que l'URL Supabase s'affiche
2. Ajouter compression d'image avant upload
3. Ajouter cropping/preview avant envoi
4. Afficher galerie photos sur les cartes de profil (Découvrir)
5. Revenir sur le bug #2 (Profile Cards layout) — jamais réglé

---

## Historique des sessions

**2026-08-20** — Découverte que `index-v2-final.html` et `ce-soir-app-v8-photos.html`
avaient divergé (session précédente a manqué de tokens avant de mettre ce
suivi à jour). Fusion faite manuellement : `ce-soir-app-v9.html` = photos
(v8) + fix CSS (v2-final). Suivi recréé de zéro car l'ancien avait été perdu/jamais fait.

---

## Rappel des règles de travail (Gabriel)

- Un seul fichier actif à la fois. Jamais deux branches en parallèle sans le noter ici.
- Batch tous les changements, push GitHub une seule fois à la fin.
- Exécuter directement, pas d'explication avant d'agir.
- Mettre à jour ce doc + le roadmap Excel après CHAQUE tâche complétée, pas à la fin de la session seulement (pour éviter de le perdre si l'IA manque de tokens).
- GitHub mobile : "Add file → Upload files" seulement, jamais copier-coller.
