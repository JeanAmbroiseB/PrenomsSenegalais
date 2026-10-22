"""Change l'adresse officielle du site partout où elle apparaît.

Usage :  python3 scripts/changer_domaine.py prenoms.sn

Met à jour la balise canonique, les balises de partage, les données structurées,
robots.txt, sitemap.xml et la redirection automatique depuis l'ancienne adresse Render.
Ensuite : vérifier, puis envoyer sur GitHub (Render republie le site).
"""
import pathlib
import re
import sys

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

    for nom in FICHIERS:
        chemin = RACINE / nom
        texte = chemin.read_text(encoding="utf-8")
        modifie = texte.replace(ancien, nouveau)
        if modifie != texte:
            chemin.write_text(modifie, encoding="utf-8")
            print(f"  {nom} : {texte.count(ancien)} remplacement(s)")
    print(f"Adresse officielle : {ancien} -> {nouveau}")


if __name__ == "__main__":
    main()
