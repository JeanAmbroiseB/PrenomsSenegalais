/*
 * Significations des prénoms.
 * Clé = prénom exactement comme écrit dans data/prenoms.js.
 * Valeur = texte, ou { sens: "...", source: "..." } pour préciser la source.
 *
 * Pour ajouter une signification, il suffit d'ajouter une ligne :
 *   "Joor": "…",
 *
 * Celles ci-dessous sont indiquées directement dans le calendrier 2018.
 */
const SOURCE_CALENDRIER = "Calendrier des prénoms sénégalais 2018";
const SOURCE_SERERE = "Contribution — prénoms sérères";

const SIGNIFICATIONS = {
  "Pennda":   { sens: "Prénom donné à la troisième fille.", source: SOURCE_CALENDRIER },
  "Daba":     { sens: "Message.", source: SOURCE_CALENDRIER },
  "Koode":    { sens: "Étoiles (en pulaar).", source: SOURCE_CALENDRIER },
  "Wopaa":    { sens: "Équivalent pulaar de « Ken Bugul ».", source: SOURCE_CALENDRIER },
  "Keeba":    { sens: "Père de famille (en mandingue).", source: SOURCE_CALENDRIER },
  "Julde":    { sens: "Prière (en pulaar).", source: SOURCE_CALENDRIER },
  "Góora":    { sens: "Brave homme.", source: SOURCE_CALENDRIER },
  "Mati":     { sens: "Celle qui est juste.", source: SOURCE_CALENDRIER },
  "Koorka":   { sens: "Ramadan (en pulaar).", source: SOURCE_CALENDRIER },
  "Kinne":    { sens: "Chef.", source: SOURCE_CALENDRIER },
  "Kura":     { sens: "Nouvelle.", source: SOURCE_CALENDRIER },
  "Faama":    { sens: "Riche.", source: SOURCE_CALENDRIER },
  "Neene":    { sens: "Maman.", source: SOURCE_CALENDRIER },
  "Yumma":    { sens: "Lait nourricier venant du Nil.", source: SOURCE_CALENDRIER },
  "Ceerno":   { sens: "Le savant.", source: SOURCE_CALENDRIER },
  "Paate":    { sens: "Deuxième fils (en pulaar).", source: SOURCE_CALENDRIER },
  "Ummi":     { sens: "Vie.", source: SOURCE_CALENDRIER },
  "Musu":     { sens: "Fille (en socé).", source: SOURCE_CALENDRIER },
  "Amaa":     { sens: "Fameuse.", source: SOURCE_CALENDRIER },
  "Yero":     { sens: "Prénom donné au quatrième garçon.", source: SOURCE_CALENDRIER },
  "Hammadi":  { sens: "Premier fils (en pulaar).", source: SOURCE_CALENDRIER },
  "Lisë":     { sens: "Grand-père ou grand-mère.", source: SOURCE_CALENDRIER },
  "Malaado":  { sens: "Celle qui a la chance (en pulaar).", source: SOURCE_CALENDRIER },
  "Ngorba":   { sens: "L'âne (en pulaar).", source: SOURCE_CALENDRIER },
  "Sawru":    { sens: "Le bâton (en pulaar).", source: SOURCE_CALENDRIER },

  // ---- Prénoms sérères (contribution) ----
  "Ngoor":      { sens: "Le vrai homme (en sérère).", source: SOURCE_SERERE },
  "Ndew":       { sens: "La femme (en sérère).", source: SOURCE_SERERE },
  "Wagane":     { sens: "Celui qui peut.", source: SOURCE_SERERE },
  "Jeegaan":    { sens: "Celui qui a, le riche (en sérère).", source: SOURCE_SERERE },
  "Modiane":    { sens: "Le meilleur.", source: SOURCE_SERERE },
  "Faakan":     { sens: "La gentille, la tendre.", source: SOURCE_SERERE },
  "Miñaan":     { sens: "Qui a vécu longtemps (en sérère).", source: SOURCE_SERERE },
  "Mosaan":     { sens: "La belle.", source: SOURCE_SERERE },
  "Niokhor":    { sens: "Le bagarreur.", source: SOURCE_SERERE },
  "Maam Koor":  { sens: "Le grand-père.", source: SOURCE_SERERE },
  "Mame Ndew":  { sens: "La grand-mère.", source: SOURCE_SERERE },
  "Makane":     { sens: "L'aînée (de jumelles).", source: SOURCE_SERERE },
  "Ndebaan":    { sens: "La cadette (de jumelles).", source: SOURCE_SERERE },
  "Ngormack":   { sens: "L'aîné (de jumeaux).", source: SOURCE_SERERE },
  "Ngorndéb":   { sens: "Le cadet (de jumeaux).", source: SOURCE_SERERE },
  "Ñilaan":     { sens: "Celle qui met bien le pagne (en sérère).", source: SOURCE_SERERE },
  "Ndébal":     { sens: "Femme noire.", source: SOURCE_SERERE },
  "Kaynak":     { sens: "Le berger.", source: SOURCE_SERERE },
  "Guilgane":   { sens: "Dont le mariage n'est pas célébré.", source: SOURCE_SERERE },
  "Teneŋ":      { sens: "Lundi (en sérère).", source: SOURCE_SERERE },
  "Xemess":     { sens: "Jeudi.", source: SOURCE_SERERE },
  "Diboor":     { sens: "Dimanche.", source: SOURCE_SERERE },
  "Maat":       { sens: "Qui est présent (en sérère, « Maad »).", source: SOURCE_SERERE },
  "Madane":     { sens: "Qui l'a vécu ou en a témoigné.", source: SOURCE_SERERE },
  "Ndiig":      { sens: "L'hivernage (saison des pluies).", source: SOURCE_SERERE },
  "Séék":       { sens: "L'hiver (saison sèche et fraîche).", source: SOURCE_SERERE },
  "Roogodéb":   { sens: "Le petit Dieu.", source: SOURCE_SERERE },
  "Salma Koor": { sens: "Le soldat.", source: SOURCE_SERERE },
  "Sedaar":     { sens: "Qui n'aura jamais honte.", source: SOURCE_SERERE },
  "Sedar":      { sens: "Qui n'aura jamais honte.", source: SOURCE_SERERE },
  "Sonar":      { sens: "L'infatigable.", source: SOURCE_SERERE },
  "Giñaan":     { sens: "La rassasiée.", source: SOURCE_SERERE },
  "Gaskel":     { sens: "Celui qui est prêt à être inhumé.", source: SOURCE_SERERE },
  "Koumakh":    { sens: "Le chef.", source: SOURCE_SERERE },
  "Bougar":     { sens: "Le mal-aimé.", source: SOURCE_SERERE },
  "Lamaan":     { sens: "L'héritier.", source: SOURCE_SERERE },
  "Khookhane":  { sens: "Le cultivateur.", source: SOURCE_SERERE },
  "Baraane":    { sens: "Le doué.", source: SOURCE_SERERE },
  "Liwaan":     { sens: "Le tisseur.", source: SOURCE_SERERE },
  "Mbaar":      { sens: "Le canari (la jarre en terre cuite).", source: SOURCE_SERERE },
  "Sën":        { sens: "Qui n'est nulle part mais est partout. Pour les Sérères, Dieu, la personne, l'animal, l'arbre et l'herbe sont « Sèn », car ils sont partout.", source: SOURCE_SERERE }
};
