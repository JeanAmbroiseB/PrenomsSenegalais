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
| `index.html` | La page d'accueil (générateur, recherche) |
| `prenom/` | Une page par prénom + la liste de A à Z (**générées**, ne pas modifier à la main) |
| `admin.html` | Relecture et publication des propositions des visiteurs |
| `data/prenoms.js` | La liste des prénoms (calendrier 2018 + autres prénoms) et les ethnies |
| `data/significations.js` | Les significations : **c'est ici qu'on ajoute le sens des prénoms** |
| `js/config.js` | Connexion à la base des suggestions (Supabase) |
| `supabase/schema.sql` | Création de la base des suggestions |
| `js/app.js` | Le fonctionnement du site |
| `js/fiche.js` | Ajoute les contributions publiées sur les pages des prénoms |
| `js/affiche.js` | Dessin des affiches et bâches (aperçu sur le site, PDF et PNG à livrer dans `admin.html`) |
| `scripts/generer_pages.py` | Génère `prenom/*.html` et `sitemap.xml` à partir des données |
| `css/style.css` | L'apparence |

## Pages des prénoms (référencement Google)

Chaque prénom a sa propre page, par ex. `prenom/ngoone-s.html`, pour que Google puisse la trouver
(« signification prénom Ngoné »…). La liste complète est sur `prenom/index.html`, et `sitemap.xml`
les déclare toutes. Ces fichiers sont **générés** à partir de `data/prenoms.js` et `data/significations.js` :

**après chaque modification des fichiers de données, relancer :**

```bash
python3 scripts/generer_pages.py
```

puis envoyer sur GitHub (pages et `sitemap.xml` compris). Les propositions publiées depuis `admin.html`
s'affichent déjà sur les pages des prénoms sans relancer le script ; pour qu'un prénom proposé par un
visiteur ait sa propre page, il faut l'ajouter dans `data/prenoms.js` puis relancer le script.

## Ajouter une signification

Dans `data/significations.js`, ajouter une ligne avec le prénom écrit exactement comme dans `data/prenoms.js` :

```js
"Joor": { sens: "…", source: "…" },
```

Puis relancer `python3 scripts/generer_pages.py` (voir plus haut).

## Corriger un prénom (ethnie, genre)

Dans `data/prenoms.js`, chaque prénom est une ligne du type `["01-02","Joor","W","f"]` :
date de fête, prénom, code ethnie, genre (`f` fille, `m` garçon, `x` mixte / non précisé).
Changer l'écriture principale ou l'ethnie d'un prénom change aussi l'adresse de sa page :
relancer `python3 scripts/generer_pages.py`, qui supprime l'ancienne page.

## Recevoir et publier les suggestions

Les visiteurs proposent une signification, une correction ou un nouveau prénom, en indiquant leur nom
ou leurs initiales. Avant d'envoyer, ils doivent cocher un engagement (« je certifie que ces informations sont
exactes à ma connaissance et j'en assume la responsabilité »), et indiquer d'où vient toute signification
proposée. Les propositions arrivent sur la page `admin.html` : on les relit, on les corrige si besoin,
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

## Affiches et bâches du prénom (bêta)

Sur chaque fiche, le bouton « Affiche ou bâche » ouvre un petit éditeur avec un aperçu (avec filigrane) :

- **formats** (liste dans `js/affiche.js`, rubrique `FORMATS`) :
  - bâches : banderole 3 × 1 m et 2 × 1 m, fond photo 3 × 2 m, kakémono 85 × 200 cm ;
  - affiches : A4, A3 ;
  - écrans : statut WhatsApp (9:16), écran ou projection (16:9), publication carrée ;
- **styles** : Classique, Nuit étoilée, Bogolan, Douceur (rubrique `STYLES`) ;
- les autres prénoms de l'enfant, avant ou après le prénom traditionnel (qui reste en premier si on les laisse
  vides) : sur l'affiche, le prénom traditionnel garde sa couleur et le sens lui reste attribué ;
- la photo de l'enfant, avec zoom et cadrage : elle reste dans le navigateur et le site ne la reçoit jamais.
  Elle prend la place du baobab, ou une grande colonne à gauche sur les banderoles. Le client l'envoie sur
  WhatsApp après son message, et vous l'ajoutez dans `admin.html` (le code de commande garde le cadrage) ;
- phrase d'accueil (« Bienvenue à », « Dalal ak jàmm »…), nom de famille, date ou mention, et le choix
  d'afficher ou non la signification.

La mise en page s'adapte toute seule au format : en colonne pour les formats hauts, sur deux colonnes
(l'enfant à gauche, le sens du prénom à droite) pour les bannières. Un fichier 3:1 convient aussi pour une
bâche de 4,5 × 1,5 m : l'imprimeur l'agrandit.

Les commandes se règlent dans `js/config.js`, rubrique `COMMANDES` :

```js
WAVE: "https://pay.wave.com/m/…",   // lien de paiement Wave
ORANGE_MONEY: "77 123 45 67",       // numéro ou code marchand (affiché avec un bouton Copier)
PAYPAL: "https://paypal.me/…",
WHATSAPP: "221771234567",           // numéro qui reçoit les commandes
PRIX: { "Bâches et banderoles": "5 000 FCFA", "Affiches": "2 000 FCFA", "Écrans": "1 000 FCFA" }
```

Tant qu'il manque le numéro WhatsApp ou un moyen de paiement, l'éditeur reste en aperçu seulement.
Quand tout est rempli, le visiteur paie puis envoie sa commande sur WhatsApp ; le message contient un code
« PS2-… » qui reprend tous ses choix.

**Livrer une commande** : dans `admin.html`, ouvrir « Affiches et bâches à livrer », coller le message reçu,
**vérifier d'abord que le paiement est bien arrivé**, corriger si besoin, puis télécharger le fichier :

- formats à imprimer : PDF à la taille réelle (300 dpi pour A4 et A3, 100 dpi pour les bâches, 75 dpi pour
  le fond photo, ce que demandent les imprimeurs grand format), à remettre tel quel à l'imprimeur ;
- formats pour écrans : image PNG.

Une grande bâche se prépare en quelques secondes ; de préférence sur ordinateur (un téléphone peut manquer
de mémoire). Le cadre laisse une marge de quelques centimètres pour les œillets.

**Pour l'instant, ces fonctionnalités sont en « hibernation » : les visiteurs ne les voient pas.**
Elles n'apparaissent que sur les navigateurs où le mode bêta a été activé :

- activer : ouvrir `https://www.prenomssenegalais.com/#beta-on` (un message « Mode bêta activé » s'affiche) ;
- désactiver : ouvrir `…/#beta-off`.

Le réglage est mémorisé dans le navigateur : il faut l'activer sur chaque téléphone ou ordinateur, et le
refaire si les données du navigateur sont effacées. Le jour où vous voulez les ouvrir à tous, mettre
`POUR_TOUS = true` dans `js/config.js` (rubrique `BETA`) et envoyer sur GitHub.

Ces numéros et liens sont visibles par tous les visiteurs : utiliser de préférence un compte marchand
ou un numéro dédié.

## Passer à un nom de domaine

1. Acheter le domaine, puis l'ajouter dans Render : **Settings → Custom Domains** (suivre les DNS indiqués).
2. Mettre à jour l'adresse officielle partout (balise canonique, partage, robots.txt, sitemap.xml,
   pages des prénoms, redirection de l'ancienne adresse) en une commande :
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
