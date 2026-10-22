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
| `admin.html` | Liste des suggestions enregistrées dans ce navigateur, export JSON/CSV |
| `data/prenoms.js` | La liste des prénoms (calendrier 2018 + autres prénoms) et les ethnies |
| `data/significations.js` | Les significations : **c'est ici qu'on ajoute le sens des prénoms** |
| `js/config.js` | Réglage de l'envoi des suggestions |
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

## Recevoir les suggestions des visiteurs

Par défaut, une suggestion n'est enregistrée que dans le navigateur de la personne qui l'envoie.
Pour la recevoir par e-mail : créer un formulaire gratuit sur https://formspree.io, puis coller son adresse
dans `js/config.js` :

```js
SUGGESTIONS_ENDPOINT: "https://formspree.io/f/xxxxxxx"
```

## Sources et remerciements

Ce site existe grâce au travail de :

- **Professeur Babacar Mbaye Diop** (FLSH-UCAD) — calendrier « Pour la sauvegarde des prénoms sénégalais » (2018),
  avec le soutien de la Direction du Patrimoine Culturel, Ministère de la Culture. C'est la source de référence.
- **Djamil Faye, Badou Dia et Ibrahima Fall** — concepteurs du calendrier FayDiaFal (2018).
- Les recherches des créateurs du site et les contributions des visiteurs.

L'objectif n'est pas de s'approprier leur travail mais de le mettre en lumière et de le prolonger.
