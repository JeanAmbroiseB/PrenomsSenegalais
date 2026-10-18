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
  "Sawru":    { sens: "Le bâton (en pulaar).", source: SOURCE_CALENDRIER }
};
