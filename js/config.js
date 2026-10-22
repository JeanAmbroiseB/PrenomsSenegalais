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
  SUPABASE_URL: "",
  SUPABASE_KEY: ""
};

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
    const res = await fetch(CONFIG.SUPABASE_URL.replace(/\/$/, "") + chemin, {
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
