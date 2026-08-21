# CE SOIR — Suivi de session

> ⚠️ RÈGLE OBLIGATOIRE : ce document DOIT être mis à jour à la fin de chaque
> session, avant de manquer de tokens ou de changer d'IA. Si tu changes de
> Claude/IA en cours de route, mets ce fichier à jour AVANT de switcher.

---

## Fichier de travail actif (LA SEULE VERSION VALIDE)

**Nom : `index.html`** (à la racine du repo GitHub Pages — sert automatiquement le site)

UN SEUL fichier de travail. Toute nouvelle version remplace ce même fichier, jamais un nouveau nom.

---

## État des bugs connus

| Bug | Statut | Note |
|---|---|---|
| `.premium-card` collapse à 32px (flex-shrink) | ✅ Fixé | 2026-08-20 |
| Chat : barre de saisie cachée derrière la bottomnav | ✅ Fixé | 2026-08-21 — `#view-chat` sans padding-bottom, input-row tombait derrière `.bottomnav` (z-index 960). Ajout `padding-bottom` équivalent à la hauteur de la nav. |
| Babillard : page ne scrolle pas, contenu coupé | ✅ Fixé | 2026-08-21 — `#view-babillard` n'avait pas `overflow-y:auto`. Ajouté + padding-bottom généreux. |
| Login/Signup : pas d'oeil pour voir le mot de passe | ✅ Fait | 2026-08-21 — Oeil press-and-hold (souris + touch) ajouté sur `#authPassword`, partagé signin/signup (même champ). |
| Son propre profil apparaît comme "faux profil" à proximité (carte dupliquée) | ✅ Fixé | 2026-08-21 — `loadProfiles()` n'excluait pas `currentUserId`. Filtré partout (chargement initial + realtime). |
| App semble vide après connexion (profils démo disparus) | ✅ Fixé | 2026-08-21 — **Cause racine** : le code lisait la table `profiles` (EN, 1 seule ligne = compte de Gabriel) au lieu de `profils` (FR, les 14 vrais faux comptes démo). Corrigé pour lire les deux tables et les fusionner (`profils` = démo éditable + `profiles` = vrais comptes signés). Realtime abonné sur les deux tables maintenant. |
| Toast de confirmation invisible sur l'onglet NOW (boutons "Message à tout le monde", "Inviter des amis", "Partager l'activité") | ✅ Fixé | 2026-08-21 — `#nearbyToast` était imbriqué dans `#view-carte` (display:none quand pas actif). Déplacé au niveau `.app`, visible peu importe l'onglet. |
| Activer/désactiver les 14 profils démo manuellement | ✅ Fait | 2026-08-21 — Colonne `actif` (boolean, défaut `true`) ajoutée sur `public.profils`. Passer un profil à `actif=false` dans Supabase le cache instantanément (realtime), `true` le remet. |
| Carte : profils trop loin / dispersés (impression d'être seul) | ✅ Fixé | 2026-08-21 — **Cause** : les 14 profils dans `public.profils` avaient des lat/lng fixes éparpillées dans tout Montréal (5-6km d'écart), pas relatives à la position de l'utilisateur. Recalculées pour clusterer à ~1-1.5km autour de `USER_LOC` (Plateau). Bulles agrandies (50px→62px), zoom carte ajusté (défaut 15→14, min 14→13). |
| Profile Cards layout (bug #2) | ⏳ Non fixé | Identifié, pas encore adressé — à reprendre |
| Babillard : liaison avec vraie source d'événements MTL | 💡 Idée notée | Pas un bug — feature future, demande une source de données externe (API/partenariat) |

---

## Architecture Supabase (⚠️ important, source de confusion la dernière fois)

Projet `xdqyciiydyrcihlawbew`, deux tables distinctes utilisées pour les profils affichés dans l'app :

- **`public.profils`** (FR) — les 14 faux profils démo. Éditables directement dans Supabase
  (table editor ou SQL) : nom, âge, avatar (URL photo), bio, statut, etc. Pas de `user_id`
  (pas liés à un compte auth). Colonne **`actif`** (boolean, défaut `true`) : passer à `false`
  cache le profil de l'app en direct (realtime), `true` le remet — pratique pour gonfler/dégonfler
  le nombre de profils visibles selon le trafic réel.
- **`public.profiles`** (EN) — les vrais comptes créés via inscription (`user_id` → `auth.users`).
  Le compte de l'utilisateur connecté est automatiquement exclu de la liste des profils affichés
  (on ne se voit pas soi-même comme "profil à proximité").

Le code (`loadProfiles()`) charge les deux tables et les fusionne. Les deux ont un abonnement
realtime séparé (`subscribeToProfileChanges()`), donc toute modif faite dans Supabase (démo ou
vrais comptes) se reflète en direct dans l'app sans redéploiement.

---

## Prochaines étapes (dans l'ordre)

1. Reprendre le bug #2 (Profile Cards layout) — jamais réglé
2. Tester le flow complet upload photo (Supabase Storage) avec une vraie photo
3. Compression + cropping/preview avant upload de photo — pas fait
4. Galerie photos complète sur cartes Découvrir — pas fait
5. (Idée, pas prioritaire) Source de données réelle pour les événements du Babillard

---

## Historique des sessions

**2026-08-21** — Session de fixs CSS/JS + découverte architecture Supabase :
- Fix barre de saisie chat cachée derrière la nav
- Fix scroll Babillard (contenu coupé)
- Ajout oeil press-and-hold sur le mot de passe (login + signup)
- Fix duplication du profil de l'utilisateur dans la liste "à proximité"
- **Découverte + fix majeur** : mauvaise table Supabase lue pour les profils démo
  (`profiles` au lieu de `profils`) — corrigé, les deux tables sont maintenant lues et fusionnées
- Fix toast invisible sur l'onglet NOW (élément scopé à la mauvaise vue)
- Désormais : Claude tient ce doc à jour automatiquement après chaque tâche, sans que Gabriel ait à le demander.

**2026-08-20** — Fusion `index-v2-final.html` + `ce-soir-app-v8-photos.html` → `index.html`.

---

## Rappel des règles de travail (Gabriel)

- Un seul fichier actif à la fois. Jamais deux branches en parallèle sans le noter ici.
- Batch tous les changements, push GitHub une seule fois à la fin.
- Exécuter directement, pas d'explication avant d'agir.
- Ce doc + le roadmap Excel sont tenus à jour par Claude après CHAQUE tâche complétée, automatiquement.
- GitHub mobile : "Add file → Upload files" seulement, jamais copier-coller.
