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
 * Soutien et affiches à imprimer (bêta).
 * Ce qui reste vide n'est pas affiché sur le site. Sans aucun moyen de paiement, le bouton
 * « Soutenir » est masqué et l'affiche reste disponible en aperçu seulement.
 */
const SOUTIEN = {
  WAVE: "",          // lien de paiement Wave, ex. "https://pay.wave.com/m/M_xxxxxxxx/c/sn/"
  ORANGE_MONEY: "",  // numéro ou code marchand Orange Money, ex. "77 123 45 67"
  PAYPAL: "",        // ex. "https://paypal.me/votrenom"
  WHATSAPP: "",      // numéro qui reçoit les commandes d'affiches, format international sans « + », ex. "221771234567"
  PRIX_AFFICHE: "2 000 FCFA"
};
SOUTIEN.actif = () => Boolean(SOUTIEN.WAVE || SOUTIEN.ORANGE_MONEY || SOUTIEN.PAYPAL);
SOUTIEN.commandes = () => SOUTIEN.actif() && /^\d{8,15}$/.test(SOUTIEN.WHATSAPP);

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
