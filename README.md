# Prénoms Sénégalais

Générateur de prénoms sénégalais par ethnie et par sexe, avec signification, date de fête et contributions des visiteurs.
Le site est entièrement statique (HTML/CSS/JS) : aucun serveur ni base de données n'est nécessaire.

## Lancer le site en local

```bash
python3 -m http.server 8080
```

Puis ouvrir http://localhost:8080. On peut aussi ouvrir directement `index.html` dans un navigateur.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | La page du site |
| `admin.html` | Relecture et publication des propositions des visiteurs |
| `data/prenoms.js` | La liste des prénoms (calendrier 2018 + autres prénoms) et les ethnies |
| `data/significations.js` | Les significations : **c'est ici qu'on ajoute le sens des prénoms** |
| `js/config.js` | Connexion à la base des suggestions (Supabase) |
| `supabase/schema.sql` | Création de la base des suggestions |
| `js/app.js` | Le fonctionnement du site |
| `css/style.css` | L'apparence |

## Ajouter une signification

Dans `data/significations.js`, ajouter une ligne avec le prénom écrit exactement comme dans `data/prenoms.js` :

```js
"Joor": { sens: "…", source: "…" },
```

## Corriger un prénom (ethnie, genre)

Dans `data/prenoms.js`, chaque prénom est une ligne du type `["01-02","Joor","W","f"]` :
date de fête, prénom, code ethnie, genre (`f` fille, `m` garçon, `x` mixte / non précisé).

## Recevoir et publier les suggestions

Les visiteurs proposent une signification, une correction ou un nouveau prénom, en indiquant leur nom
ou leurs initiales. Les propositions arrivent sur la page `admin.html` : on les relit, on les corrige si besoin,
puis on les **publie** ou on les **rejette**. Une proposition publiée apparaît aussitôt sur le site avec
« proposé par … », sans redéploiement.

Règles appliquées automatiquement à la publication :
- une signification déjà présente sur le site reste en premier ; la nouvelle s'ajoute dans « Autres éclairages » ;
- une nouvelle écriture d'un prénom existant devient une « autre graphie » ;
- l'ethnie et le genre proposés ne s'appliquent qu'aux prénoms « Non classé » / « Genre à préciser ».

### Mise en place (une seule fois, ~10 minutes)

1. Créer un compte gratuit sur https://supabase.com puis **New project** (région : Europe, par ex. Paris).
2. **SQL Editor → New query** : coller le contenu de `supabase/schema.sql`, remplacer
   `VOTRE_EMAIL@exemple.com` (en bas) par l'e-mail de l'administrateur, puis **Run**.
3. **Authentication → Users → Add user → Create new user** : saisir cet e-mail et un mot de passe,
   cocher « Auto Confirm User ». C'est le compte de connexion à `admin.html`.
4. **Authentication → Sign In / Providers** : désactiver « Allow new users to sign up »
   (personne d'autre ne pourra créer de compte).
5. **Project Settings → API Keys** : copier la clé *publishable* (ou *anon*), et dans
   **Project Settings → Data API** l'adresse *Project URL*. Les coller dans `js/config.js` :
   ```js
   SUPABASE_URL: "https://xxxxxxxx.supabase.co",
   SUPABASE_KEY: "sb_publishable_…"
   ```
6. Envoyer la modification sur GitHub : Render republie le site.

Ensuite, aller sur `https://…/admin.html` et se connecter.

Tant que `js/config.js` n'est pas rempli, les propositions restent dans le navigateur de la personne
qui les envoie (mode test).

## Passer à un nom de domaine

1. Acheter le domaine, puis l'ajouter dans Render : **Settings → Custom Domains** (suivre les DNS indiqués).
2. Mettre à jour l'adresse officielle partout (balise canonique, partage, robots.txt, sitemap.xml,
   redirection de l'ancienne adresse) en une commande :
   ```bash
   python3 scripts/changer_domaine.py prenoms.sn
   ```
3. Envoyer sur GitHub. Les visiteurs de l'ancienne adresse `onrender.com` sont alors renvoyés
   automatiquement vers le nouveau domaine.
4. Dans Google Search Console, ajouter le nouveau domaine et y déclarer `sitemap.xml`.

## Sources et remerciements

Ce site existe grâce au travail de :

- **Professeur Babacar Mbaye Diop** (FLSH-UCAD) — calendrier « Pour la sauvegarde des prénoms sénégalais » (2018),
  avec le soutien de la Direction du Patrimoine Culturel, Ministère de la Culture.
- **Djamil Faye, Badou Dia et Ibrahima Fall** — concepteurs du calendrier FayDiaFal (2018).
- Les recherches des créateurs du site et les contributions des visiteurs.

L'objectif n'est pas de s'approprier leur travail mais de le mettre en lumière et de le prolonger.
