"""Génère une page par prénom (prenom/<id>.html), la liste de A à Z (prenom/index.html) et sitemap.xml.

Usage :  python3 scripts/generer_pages.py

À relancer après chaque modification de data/prenoms.js ou data/significations.js,
puis envoyer sur GitHub (Render republie le site).

Les prénoms sont fusionnés exactement comme dans js/app.js (mêmes identifiants, même ordre
des sources, mêmes autres graphies) : la fiche « prenom/ngoone-s.html » correspond à
« index.html#p=ngoone-s ». Les contributions publiées depuis admin.html s'ajoutent sur
les fiches au chargement de la page (js/fiche.js), sans avoir à relancer ce script.
"""
import datetime
import html
import json
import pathlib
import re
import unicodedata
import urllib.parse

RACINE = pathlib.Path(__file__).resolve().parent.parent
DOSSIER = RACINE / "prenom"
VERSION = "11"  # même numéro que les ?v= de index.html (cache des navigateurs)
NB_VOISINS = 12

MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
        "août", "septembre", "octobre", "novembre", "décembre"]
GENRES = {"f": "Fille", "m": "Garçon", "x": "Genre à préciser"}
# Adjectifs au pluriel pour « Autres prénoms … » (sinon le nom de l'ethnie en minuscules).
PLURIELS = {"W": "wolof", "S": "sérères", "D": "diola", "P": "peuls / toucouleurs", "M": "mandingues / socés",
            "SK": "soninkés", "MK": "manjaques", "B": "bassari", "L": "lébous"}
SOURCES = {
    "diop": "Calendrier du Pr Babacar Mbaye Diop (2018)",
    "contrib": "Contribution",
    "fdf": "Calendrier FayDiaFal (2018) de Djamil Faye, Badou Dia et Ibrahima Fall",
}


# ---------- Lecture des fichiers de données (littéraux JavaScript) ----------
JETON = re.compile(r"""
    (?P<espace>\s+|//[^\n]*|/\*.*?\*/)
  | (?P<chaine>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')
  | (?P<nombre>-?\d+(?:\.\d+)?)
  | (?P<nom>[A-Za-z_$][\w$]*)
  | (?P<signe>[\[\]{}:,=;])
""", re.S | re.X)


def jetons(texte):
    pos = 0
    while pos < len(texte):
        m = JETON.match(texte, pos)
        if not m:
            raise SyntaxError(f"Caractère inattendu : {texte[pos:pos + 30]!r}")
        pos = m.end()
        if m.lastgroup != "espace":
            yield m.lastgroup, m.group()


def lire_js(*fichiers):
    """Renvoie les constantes (const NOM = …;) déclarées dans les fichiers, comme objets Python."""
    consts = {}
    for f in fichiers:
        flux = list(jetons((RACINE / f).read_text(encoding="utf-8")))
        i = 0

        def valeur():
            nonlocal i
            genre, t = flux[i]
            i += 1
            if t == "[":
                liste = []
                while flux[i][1] != "]":
                    liste.append(valeur())
                    if flux[i][1] == ",":
                        i += 1
                i += 1
                return liste
            if t == "{":
                objet = {}
                while flux[i][1] != "}":
                    g, cle = flux[i]
                    cle = chaine(cle) if g == "chaine" else cle
                    assert flux[i + 1][1] == ":", f"« : » attendu après {cle}"
                    i += 2
                    objet[cle] = valeur()
                    if flux[i][1] == ",":
                        i += 1
                i += 1
                return objet
            if genre == "chaine":
                return chaine(t)
            if genre == "nombre":
                return float(t) if "." in t else int(t)
            if genre == "nom":
                return {"true": True, "false": False, "null": None}.get(t, consts.get(t))
            raise SyntaxError(f"Valeur inattendue : {t}")

        while i < len(flux):
            if flux[i][1] in ("const", "let", "var"):
                nom = flux[i + 1][1]
                assert flux[i + 2][1] == "="
                i += 3
                consts[nom] = valeur()
            else:
                i += 1
    return consts


def chaine(lit):
    corps = lit[1:-1]
    return re.sub(r"\\(u[0-9a-fA-F]{4}|.)", lambda m: chr(int(m.group(1)[1:], 16)) if m.group(1)[0] == "u"
                  else {"n": "\n", "t": "\t"}.get(m.group(1), m.group(1)), corps)


# ---------- Mêmes règles que js/app.js ----------
def norm(s):
    s = unicodedata.normalize("NFD", s.lower().replace("ŋ", "ng"))
    return re.sub(r"[^a-z]", "", re.sub(r"[̀-ͯ]", "", s))


def loose(s):
    return re.sub(r"(.)\1+", r"\1", norm(s))


def format_date(mmdd):
    m, d = map(int, mmdd.split("-"))
    return f"{'1er' if d == 1 else d} {MOIS[m - 1]}"


VOY = "aeiouéèë"


def francise_mot(w):
    s = w.lower()
    for a, b in [("óo", "o"), ("ée", "é"), ("àa", "a"), ("aa", "a"), ("ee", "é"), ("oo", "o"), ("ii", "i"), ("uu", "u")]:
        s = s.replace(a, b)
    s = re.sub("[àá]", "a", s)
    s = re.sub("[óò]", "o", s)
    s = re.sub(r"([bcdfgjklmnprtwxyñŋ])\1", r"\1", s)

    def v(ch):
        return ch != "" and ch in VOY

    out = ""
    for i, c in enumerate(s):
        nx = s[i + 1] if i + 1 < len(s) else ""
        nx2 = s[i + 2] if i + 2 < len(s) else ""
        prev = s[i - 1] if i > 0 else ""
        if c == "c":
            out += "thi" if nx and nx in "aoueéèë" else "th" if nx == "i" else "tch"
        elif c == "j":
            out += "di" if nx and nx in "aoueéèë" else "dj"
        elif c == "x":
            out += "kh"
        elif c == "ñ":
            out += "gn"
        elif c == "ŋ":
            out += "ng"
        elif c == "u":
            out += "u" if prev == "o" else "ou"
        elif c == "g":
            out += "gu" if nx and nx in "eéèëi" else "g"
        elif c == "e":
            out += "é" if (not nx or v(nx) or (v(nx2) and nx != "y")) else "è"
        elif c == "ë":
            out += "e"
        elif c == "y":
            out += "ye" if (not nx and v(prev)) else "y"
        elif c == "s":
            out += "ss" if (v(prev) and v(nx)) else "s"
        else:
            out += c
    return out[:1].upper() + out[1:]


def francise(nom):
    return "".join(francise_mot(p) if re.search(r"[a-zà-ÿñŋë]", p, re.I) else p
                   for p in re.split(r"(\s+|\s*/\s*|-)", nom))


def cle_tri(nom):
    """Approximation de localeCompare(…, "fr", { sensitivity: "base" })."""
    s = nom.lower().replace("ŋ", "n~")
    return re.sub(r"[̀-ͯ]", "", unicodedata.normalize("NFD", s))


def charger_prenoms(d):
    noms, par_cle, vus = [], {}, set()
    graphies = d["AUTRES_GRAPHIES"]

    def ajouter(nom, e, g, date, src):
        cle = norm(nom) + "-" + e.lower()
        n = par_cle.get(cle)
        if n:
            if date and date not in n["dates"]:
                n["dates"].append(date)
            if nom != n["nom"] and nom not in n["variantes"]:
                n["variantes"].append(nom)
            return
        n = {"id": cle, "nom": nom, "e": e, "g": g, "src": src,
             "dates": [date] if date else [], "variantes": list(graphies.get(nom, []))}
        n["fr"] = francise(nom)

        def sans_e(x):
            return re.sub("e$", "", loose(x))
        if n["fr"] and (norm(n["fr"]) == norm(nom) or any(sans_e(x) == sans_e(n["fr"]) for x in n["variantes"])):
            n["fr"] = None
        par_cle[cle] = n
        vus.update(norm(x) for x in [nom, *n["variantes"]])
        noms.append(n)

    # Préséance (ordre d'ajout des sources) : Pr Diop, contributions, FayDiaFal.
    for date, nom, e, g in d["PRENOMS_CALENDRIER"]:
        ajouter(nom, e, g, date, "diop")
    for liste, src in [("PRENOMS_AUTRES", "diop"), ("PRENOMS_CONTRIBUTIONS", "contrib"), ("PRENOMS_FAYDIAFAL", "fdf")]:
        for nom, e, g in d[liste]:
            if norm(nom) not in vus:
                ajouter(nom, e, g, None, src)

    sigs = d["SIGNIFICATIONS"]
    for n in noms:
        brut = sigs.get(n["nom"]) or next((sigs[x] for x in n["variantes"] if sigs.get(x)), None)
        n["sens"] = {"sens": brut} if isinstance(brut, str) else brut
    noms.sort(key=lambda n: cle_tri(n["nom"]))
    return noms


# ---------- Pages ----------
esc = html.escape


def adjectif_ethnie(n, ethnies):
    return None if n["e"] == "NC" else ethnies[n["e"]]["nom"].lower()


def couper(texte, maxi):
    if len(texte) <= maxi:
        return texte
    return texte[:maxi].rsplit(" ", 1)[0].rstrip(",;:—- ") + "…"


def phrase_intro(n, ethnies):
    adj = adjectif_ethnie(n, ethnies)
    origine = f"d'origine {adj}" if adj else "dont l'ethnie reste à préciser"
    porte = {"f": ", porté par les filles", "m": ", porté par les garçons",
             "x": " ; son genre (fille ou garçon) n'est pas encore précisé"}[n["g"]]
    texte = f"<strong>{esc(n['nom'])}</strong> est un prénom sénégalais {origine}{porte}."
    if n["variantes"]:
        texte += f" Il s'écrit aussi {esc(enumerer(n['variantes']))}."
    if n["dates"]:
        texte += f" Sa fête est le {' et le '.join(format_date(x) for x in n['dates'])}."
    return texte


def enumerer(liste):
    return liste[0] if len(liste) == 1 else ", ".join(liste[:-1]) + " ou " + liste[-1]


def description(n, ethnies):
    adj = adjectif_ethnie(n, ethnies) or "sénégalais"
    genre = {"f": " de fille", "m": " de garçon", "x": ""}[n["g"]]
    debut = n["nom"] + (f" ({', '.join(n['variantes'][:2])})" if n["variantes"] else "")
    texte = f"{debut} : prénom {adj}{genre}"
    if n["dates"]:
        texte += f", fêté le {format_date(n['dates'][0])}"
    texte += ". "
    if n["sens"]:
        texte += "Signification : " + couper(n["sens"]["sens"], 110) + " "
    else:
        texte += "Signification à compléter : vous la connaissez ? Partagez-la. "
    texte += "Prononciation et autres graphies."
    return couper(texte, 200)


def titre(n, ethnies):
    adj = adjectif_ethnie(n, ethnies) or "sénégalais"
    alt = f" ({n['variantes'][0]})" if n["variantes"] else ""
    return f"{n['nom']}{alt} — prénom {adj}, signification"


def tuile(n, ethnies, href):
    meta = " · ".join(x for x in [ethnies[n["e"]]["nom"], format_date(n["dates"][0]) if n["dates"] else ""] if x)
    sens = '<span class="has-sens" title="Signification connue">✦</span> ' if n["sens"] else ""
    return (f'<a class="name-tile" href="{href}" title="{esc(GENRES[n["g"]])}">'
            f'<span><span class="t-name">{esc(n["nom"])}</span><span class="t-meta">{esc(meta)}</span></span>'
            f'<span>{sens}<span class="dot {n["g"]}"></span></span></a>')


def gabarit(site, chemin, titre_page, desc, corps, *, attrs_main="", ld=None, scripts=""):
    url = f"{site}/{chemin}"
    ld_html = f'\n  <script type="application/ld+json">\n  {ld}\n  </script>' if ld else ""
    return f"""<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(titre_page)}</title>
  <meta name="description" content="{esc(desc)}">
  <script>
    // Page générée par scripts/generer_pages.py — ne pas modifier à la main.
    (function () {{
      var OFFICIEL = "{site}";
      if (location.hostname.slice(-13) === ".onrender.com" && location.origin !== OFFICIEL) {{
        location.replace(OFFICIEL + location.pathname + location.search + location.hash);
      }}
    }})();
  </script>
  <link rel="canonical" href="{url}">
  <link rel="icon" href="../assets/favicon.png">
  <link rel="apple-touch-icon" href="../assets/favicon.png">
  <meta name="theme-color" content="#0b7a3b">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Prénoms Sénégalais">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{esc(titre_page)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:image" content="{site}/assets/partage.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Logo Prénoms Sénégalais : un baobab abritant une mère et son enfant">
  <meta name="twitter:card" content="summary_large_image">{ld_html}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css?v={VERSION}">
</head>
<body>
  <header class="site-header">
    <div class="wrap header-inner">
      <a href="../index.html" class="brand" aria-label="Prénoms Sénégalais — accueil">
        <img src="../assets/arbre.png" alt="" class="brand-tree">
        <span class="wordmark">
          <span class="wm-top">Prénoms</span>
          <span class="wm-rule"><i></i><b>★</b><i></i></span>
          <span class="wm-bottom">Sénégalais</span>
        </span>
      </a>
      <nav class="nav">
        <a href="../index.html#generateur">Générer</a>
        <a href="../index.html#explorer">Explorer</a>
        <a href="index.html">Tous les prénoms</a>
        <a href="../index.html#apropos">À propos</a>
      </nav>
    </div>
  </header>

  <main class="wrap page"{attrs_main}>
{corps}
  </main>

  <footer class="site-footer">
    <div class="wrap footer-inner">
      <div>
        <p>Prénoms Sénégalais — pour la sauvegarde et la transmission de nos prénoms.</p>
        <p class="footer-thanks">Avec toute notre gratitude au Professeur Babacar Mbaye Diop, ainsi qu'à Djamil Faye,
          Badou Dia et Ibrahima Fall, concepteurs du calendrier FayDiaFal. <a href="../index.html#apropos">Lire l'hommage</a>
          · <a href="index.html">Tous les prénoms de A à Z</a></p>
      </div>
      <a class="btn-ghost light" href="../index.html#proposer">Proposer un prénom</a>
    </div>
  </footer>{scripts}
</body>
</html>
"""


def fil_ariane(site, elements):
    """Fil d'Ariane visible + données structurées BreadcrumbList."""
    liens = []
    items = []
    for pos, (nom, href, url) in enumerate(elements, 1):
        liens.append(f'<a href="{href}">{esc(nom)}</a>' if href else f'<span aria-current="page">{esc(nom)}</span>')
        items.append(f'{{"@type": "ListItem", "position": {pos}, "name": {json_str(nom)}, "item": {json_str(url)}}}')
    visible = f'    <nav class="breadcrumb" aria-label="Fil d\'Ariane">{" › ".join(liens)}</nav>'
    ld = ('{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [\n    '
          + ",\n    ".join(items) + "]}")
    return visible, ld


def json_str(s):
    return json.dumps(s, ensure_ascii=False).replace("</", "<\\/")


SCRIPTS = f'\n\n  <script src="../js/config.js?v={VERSION}"></script>\n  <script src="../js/fiche.js?v={VERSION}"></script>'


def page_prenom(n, noms, ethnies, site):
    et = ethnies[n["e"]]
    pluriel = "s" if len(n["variantes"]) > 1 else ""
    detail = f" <small>({esc(et['detail'])})</small>" if et.get("detail") else ""
    badges = [f'<span class="badge eth">{esc(et["nom"])}{detail}</span>',
              f'<span class="badge {n["g"]}">{GENRES[n["g"]]}</span>']
    if n["dates"]:
        badges.append(f'<span class="badge fete">Fêté le {" et ".join(format_date(x) for x in n["dates"])}</span>')
    sens = n["sens"]
    if sens:
        credit = f'<p class="src">Source : {esc(sens["source"])}</p>' if sens.get("source") else ""
        bloc_sens = f'<div class="meaning" id="sens">\n        <h2>Signification</h2>\n        <p>{esc(sens["sens"])}</p>{credit}\n      </div>'
    else:
        bloc_sens = ('<div class="meaning empty" id="sens">\n        <h2>Signification</h2>\n'
                     "        <p>La signification de ce prénom n'est pas encore renseignée. Vous la connaissez ? Partagez-la !</p>\n      </div>")

    # Voisins : prénoms de la même ethnie, autour de celui-ci dans l'ordre alphabétique.
    meme = [x for x in noms if x["e"] == n["e"]]
    i = meme.index(n)
    k = min(NB_VOISINS, len(meme) - 1)
    voisins = [meme[(i + d) % len(meme)] for d in range(-(k // 2), k - k // 2 + 1) if d != 0][:k]
    titre_voisins = ("Autres prénoms dont l'ethnie reste à préciser" if n["e"] == "NC"
                     else f"Autres prénoms {PLURIELS.get(n['e'], et['nom'].lower())}")

    partage = f"{n['nom']} ({et['nom']})" + (f" — « {sens['sens'].rstrip('.')} »" if sens else "") + \
        f". Découvert sur Prénoms Sénégalais : {site}/prenom/{n['id']}.html"
    ariane, ld = fil_ariane(site, [("Accueil", "../index.html", site + "/"),
                                   ("Tous les prénoms", "index.html", f"{site}/prenom/index.html"),
                                   (n["nom"], None, f"{site}/prenom/{n['id']}.html")])
    lignes = [ariane, '    <article class="card fiche">', '      <div class="name-display">',
              f'        <h1 class="name-big {n["g"]}">{esc(n["nom"])}</h1>']
    if n["fr"]:
        lignes.append(f'        <p class="name-alt">Se prononce à peu près : <b>{esc(n["fr"])}</b></p>')
    lignes.append(f'        <p class="name-alt" id="graphies"{"" if n["variantes"] else " hidden"}>Autre{pluriel} graphie{pluriel} : '
                  f'<span>{esc(", ".join(n["variantes"]))}</span></p>')
    lignes += [f'        <div class="badges">\n          ' + "\n          ".join(badges) + "\n        </div>",
               f'        <p class="name-src">Source : {esc(SOURCES[n["src"]])}</p>', "      </div>",
               f'      <p class="fiche-intro">{phrase_intro(n, ethnies)}</p>',
               "      " + bloc_sens,
               '      <div class="actions">',
               f'        <a class="btn-action suggest" href="../index.html#suggerer={n["id"]}">'
               f'{"Suggérer une modification" if sens else "Donner la signification / suggérer une modification"}</a>',
               f'        <a class="btn-action" href="../index.html#p={n["id"]}">Voir dans le générateur</a>',
               f'        <a class="btn-action" href="../index.html#affiche={n["id"]}" data-beta hidden>Affiche ou bâche <span class="beta">bêta</span></a>',
               f'        <a class="btn-action" target="_blank" rel="noopener" href="https://wa.me/?text={urllib.parse.quote(partage, safe="")}">WhatsApp</a>',
               "      </div>", "    </article>", ""]
    if voisins:
        lignes += ['    <section class="section">', f"      <h2>{esc(titre_voisins)}</h2>",
                   '      <div class="name-grid">',
                   *(f"        {tuile(x, ethnies, x['id'] + '.html')}" for x in voisins),
                   "      </div>",
                   '      <p class="fiche-more"><a href="index.html">Voir tous les prénoms de A à Z</a></p>',
                   "    </section>"]
    noms_attr = esc("|".join([n["nom"], *n["variantes"]]))
    return gabarit(site, f"prenom/{n['id']}.html", titre(n, ethnies), description(n, ethnies), "\n".join(lignes),
                   attrs_main=f' data-id="{n["id"]}" data-noms="{noms_attr}"', ld=ld,
                   scripts=SCRIPTS)


def lettre(nom):
    return cle_tri(nom).replace("~", "")[:1].upper()


def page_index(noms, ethnies, site):
    groupes = {}
    for n in noms:
        groupes.setdefault(lettre(n["nom"]), []).append(n)
    avec_sens = sum(1 for n in noms if n["sens"])
    ariane, ld = fil_ariane(site, [("Accueil", "../index.html", site + "/"),
                                   ("Tous les prénoms", None, f"{site}/prenom/index.html")])
    lignes = [ariane, '    <section class="card az-head">',
              "      <h1>Tous les prénoms sénégalais de A à Z</h1>",
              f'      <p class="lead">{len(noms)} prénoms wolof, sérères, diola, peuls, toucouleurs, mandingues, soninkés, '
              f"manjaques, bassari et lébous, dont {avec_sens} avec leur signification. Chaque fiche indique "
              "l'ethnie, le genre, la date de fête, la prononciation et les autres graphies du prénom.</p>",
              '      <nav class="az-letters" aria-label="Lettres">',
              "        " + " ".join(f'<a href="#lettre-{l}">{l}</a>' for l in groupes),
              "      </nav>", "    </section>"]
    for l, liste in groupes.items():
        lignes += [f'    <section class="section az-group" id="lettre-{l}">', f"      <h2>{l}</h2>",
                   '      <div class="name-grid">',
                   *(f"        {tuile(n, ethnies, n['id'] + '.html')}" for n in liste),
                   "      </div>", "    </section>"]
    desc = (f"Liste complète des {len(noms)} prénoms sénégalais de A à Z : wolof, sérères, diola, peuls, mandingues, "
            "soninkés, manjaques, bassari, lébous, avec signification, genre et date de fête.")
    return gabarit(site, "prenom/index.html", "Tous les prénoms sénégalais de A à Z — Prénoms Sénégalais",
                   desc, "\n".join(lignes), ld=ld, scripts=SCRIPTS)


def sitemap(noms, site, jour):
    urls = [(site + "/", "weekly", "1.0"), (f"{site}/prenom/index.html", "weekly", "0.8")]
    urls += [(f"{site}/prenom/{n['id']}.html", "monthly", "0.6") for n in noms]
    corps = "".join(f"  <url>\n    <loc>{esc(u)}</loc>\n    <lastmod>{jour}</lastmod>\n"
                    f"    <changefreq>{f}</changefreq>\n    <priority>{p}</priority>\n  </url>\n" for u, f, p in urls)
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<!-- Généré par scripts/generer_pages.py — ne pas modifier à la main. -->\n'
            f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{corps}</urlset>\n')


def main():
    d = lire_js("data/prenoms.js", "data/significations.js")
    noms = charger_prenoms(d)
    ethnies = d["ETHNIES"]
    site = re.search(r'var OFFICIEL = "(https://[^"]+)"', (RACINE / "index.html").read_text(encoding="utf-8")).group(1)
    ids = [n["id"] for n in noms]
    assert len(set(ids)) == len(ids) and all(re.fullmatch(r"[a-z]+-[a-z]+", x) for x in ids), "identifiant invalide"

    DOSSIER.mkdir(exist_ok=True)
    attendus = {f"{x}.html" for x in ids} | {"index.html"}
    for vieux in DOSSIER.glob("*.html"):
        if vieux.name not in attendus:
            vieux.unlink()
            print(f"  supprimé : prenom/{vieux.name}")
    for n in noms:
        (DOSSIER / f"{n['id']}.html").write_text(page_prenom(n, noms, ethnies, site), encoding="utf-8")
    (DOSSIER / "index.html").write_text(page_index(noms, ethnies, site), encoding="utf-8")

    # Date de mise à jour = dernière modification des données (stable si on relance sans rien changer).
    mtime = max((RACINE / f).stat().st_mtime for f in ["data/prenoms.js", "data/significations.js"])
    jour = datetime.date.fromtimestamp(mtime).isoformat()
    (RACINE / "sitemap.xml").write_text(sitemap(noms, site, jour), encoding="utf-8")
    print(f"{len(noms)} fiches générées dans prenom/, plus prenom/index.html et sitemap.xml ({site}).")


if __name__ == "__main__":
    main()
