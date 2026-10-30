/*
 * Configuration du site.
 *
 * Suggestions des visiteurs : elles sont stockées dans Supabase (gratuit).
 * Une fois le projet Supabase créé (voir README), coller ici :
 *   - SUPABASE_URL : Project Settings → API → Project URL
 *   - SUPABASE_KEY : Project Settings → API Keys → clé « publishable » (ou « anon »)
 * Cette clé est publique par nature : la base n'autorise que l'envoi de suggestions
 * et la lecture de celles que vous avez publiées.
 *
 * Tant que ces deux valeurs sont vides, les suggestions restent seulement dans le
 * navigateur de la personne qui les envoie (mode test).
 */
const CONFIG = {
  SUPABASE_URL: "https://cstdmoyyikrkxwnbhniw.supabase.co",
  SUPABASE_KEY: "sb_publishable_VOTvTAVtWjJPRjIgHWM_1w_gAB1JQ37"
};

/*
 * Mode bêta : les affiches à commander ne sont visibles que sur les navigateurs où on l'a activé,
 * en ouvrant une page du site avec #beta-on à la fin de l'adresse (#beta-off pour le désactiver).
 * Pour les ouvrir à tous les visiteurs, remplacer « POUR_TOUS = false » par « POUR_TOUS = true ».
 */
const BETA = (() => {
  const POUR_TOUS = false;
  const CLE = "ps-beta";
  let change = null;
  try {
    if (location.hash === "#beta-on") { localStorage.setItem(CLE, "1"); change = "on"; }
    if (location.hash === "#beta-off") { localStorage.removeItem(CLE); change = "off"; }
    if (change) history.replaceState(null, "", location.pathname + location.search);
    return { actif: POUR_TOUS || localStorage.getItem(CLE) === "1", change };
  } catch {
    return { actif: POUR_TOUS, change };
  }
})();

/*
 * Commandes d'affiches et de bâches (bêta, voir ci-dessus).
 * Tant qu'il manque le numéro WhatsApp ou un moyen de paiement, l'affiche reste disponible en aperçu seulement.
 * Les prix sont ceux du fichier à imprimer ; l'impression elle-même se fait chez l'imprimeur.
 */
const COMMANDES = {
  WAVE: "",          // lien de paiement Wave, ex. "https://pay.wave.com/m/M_xxxxxxxx/c/sn/"
  ORANGE_MONEY: "",  // numéro ou code marchand Orange Money, ex. "77 123 45 67"
  PAYPAL: "",        // ex. "https://paypal.me/votrenom"
  WHATSAPP: "",      // numéro qui reçoit les commandes, format international sans « + », ex. "221771234567"
  PRIX: {            // par groupe de formats (voir js/affiche.js)
    "Bâches et banderoles": "5 000 FCFA",
    "Affiches": "2 000 FCFA",
    "Écrans": "1 000 FCFA"
  }
};
COMMANDES.actif = () => BETA.actif && /^\d{8,15}$/.test(COMMANDES.WHATSAPP)
  && Boolean(COMMANDES.WAVE || COMMANDES.ORANGE_MONEY || COMMANDES.PAYPAL);

// Petit client commun au site et à la page d'administration.
const DB = {
  actif: () => Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY),
  headers(token) {
    const h = { apikey: CONFIG.SUPABASE_KEY, "Content-Type": "application/json" };
    // Les anciennes clés « anon » sont des jetons JWT : on les envoie aussi en Authorization.
    const bearer = token || (CONFIG.SUPABASE_KEY.startsWith("eyJ") ? CONFIG.SUPABASE_KEY : "");
    if (bearer) h.Authorization = "Bearer " + bearer;
    return h;
  },
  async requete(chemin, { method = "GET", body, token, prefer } = {}) {
    const headers = this.headers(token);
    if (prefer) headers.Prefer = prefer;
    // Accepte aussi une adresse collée avec « /rest/v1/ » à la fin.
    const base = CONFIG.SUPABASE_URL.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
    const res = await fetch(base + chemin, {
      method, headers, body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      const err = new Error("Erreur " + res.status);
      err.status = res.status;
      try { err.detail = await res.json(); } catch { /* corps vide */ }
      throw err;
    }
    return res.status === 204 ? null : res.json().catch(() => null);
  }
};
