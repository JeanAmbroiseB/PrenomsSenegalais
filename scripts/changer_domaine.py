"""Change l'adresse officielle du site partout où elle apparaît.

Usage :  python3 scripts/changer_domaine.py prenoms.sn

Met à jour la balise canonique, les balises de partage, les données structurées,
robots.txt, sitemap.xml, les pages des prénoms (prenom/*.html) et la redirection automatique
depuis l'ancienne adresse Render.
Ensuite : vérifier, puis envoyer sur GitHub (Render republie le site).
"""
import pathlib
import re
import sys
import urllib.parse

RACINE = pathlib.Path(__file__).resolve().parent.parent
FICHIERS = ["index.html", "admin.html", "robots.txt", "sitemap.xml"]
ACTUEL = re.compile(r'var OFFICIEL = "(https://[^"]+)"')


def main():
    if len(sys.argv) != 2:
        sys.exit("Usage : python3 scripts/changer_domaine.py nouveau-domaine.sn")
    domaine = sys.argv[1].strip().lower()
    domaine = re.sub(r"^https?://", "", domaine).strip("/")
    if not re.fullmatch(r"[a-z0-9-]+(\.[a-z0-9-]+)+", domaine):
        sys.exit(f"Nom de domaine invalide : {domaine}")
    nouveau = "https://" + domaine

    index = (RACINE / "index.html").read_text(encoding="utf-8")
    ancien = ACTUEL.search(index).group(1)
    if ancien == nouveau:
        sys.exit(f"Le site utilise déjà {nouveau}.")

    pages = sorted(str(p.relative_to(RACINE)) for p in (RACINE / "prenom").glob("*.html"))
    total = 0
    for nom in FICHIERS + pages:
        chemin = RACINE / nom
        texte = chemin.read_text(encoding="utf-8")
        # Les liens de partage WhatsApp des pages contiennent l'adresse encodée (https%3A%2F%2F…).
        modifie = texte.replace(ancien, nouveau).replace(
            urllib.parse.quote(ancien, safe=""), urllib.parse.quote(nouveau, safe=""))
        if modifie != texte:
            chemin.write_text(modifie, encoding="utf-8")
            if nom in FICHIERS:
                print(f"  {nom} : mis à jour")
            else:
                total += 1
    if total:
        print(f"  prenom/ : {total} page(s) mise(s) à jour")
    print(f"Adresse officielle : {ancien} -> {nouveau}")


if __name__ == "__main__":
    main()
