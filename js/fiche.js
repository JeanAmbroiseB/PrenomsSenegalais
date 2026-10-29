// Pages prenom/*.html : affiche le lien « Soutenir » si besoin, et ajoute les contributions publiées (Supabase) à la fiche générée,
// avec les mêmes règles que js/app.js : une signification déjà connue reste en premier,
// une nouvelle écriture devient une « autre graphie ».
(() => {
  "use strict";
  // Mode bêta (js/config.js) : bouton « Affiche à imprimer », et lien « Soutenir » si un paiement est configuré.
  if (typeof BETA !== "undefined" && BETA.actif) {
    document.querySelectorAll("[data-beta]").forEach((x) => { x.hidden = false; });
    if (SOUTIEN.actif()) document.querySelectorAll("[data-soutien]").forEach((x) => { x.hidden = false; });
  }
  const main = document.querySelector("main[data-id]");
  if (!main || typeof DB === "undefined" || !DB.actif()) return;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => s.toLowerCase().replace(/ŋ/g, "ng")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
  const loose = (s) => norm(s).replace(/(.)\1+/g, "$1");

  const id = main.dataset.id;
  const noms = main.dataset.noms.split("|");
  const vus = new Set(noms.map(norm));
  const liste = (x) => `"${x.replace(/"/g, '\\"')}"`;

  async function charger() {
    const filtre = `(prenom_id.eq.${id},prenom.in.(${noms.map(liste).join(",")}))`;
    const lignes = await DB.requete("/rest/v1/suggestions?select=prenom,prenom_id,signification,graphie,auteur,publie_le&or="
      + encodeURIComponent(filtre));
    if (!lignes?.length) return;
    lignes.sort((a, b) => String(a.publie_le).localeCompare(String(b.publie_le)));

    const sens = document.getElementById("sens");
    const textes = [...sens.querySelectorAll("p:not(.src):not(.par)")].map((p) => loose(p.textContent));
    const graphies = document.getElementById("graphies");
    const nouvelles = [];
    let autres = sens.querySelector(".meaning-more");

    for (const c of lignes) {
      if (c.prenom_id && c.prenom_id !== id) continue;
      [c.prenom, ...String(c.graphie || "").split(/[,;\/]/)].map((v) => (v || "").trim()).filter(Boolean)
        .forEach((v) => { if (!vus.has(norm(v))) { vus.add(norm(v)); nouvelles.push(v); } });
      const s = (c.signification || "").trim();
      if (!s || textes.includes(loose(s))) continue;
      textes.push(loose(s));
      const par = c.auteur ? esc(c.auteur) : "";
      if (sens.classList.contains("empty")) {
        sens.classList.remove("empty");
        sens.innerHTML = `<h2>Signification</h2><p>${esc(s)}</p>${par ? `<p class="par">Proposée par ${par}</p>` : ""}`;
      } else {
        if (!autres) {
          autres = document.createElement("div");
          autres.className = "meaning-more";
          autres.innerHTML = "<h5>Autres éclairages</h5>";
          sens.append(autres);
        }
        autres.insertAdjacentHTML("beforeend",
          `<p>${esc(s)} ${par ? `<span class="par">— proposé par ${par}</span>` : ""}</p>`);
      }
    }
    if (nouvelles.length) {
      const span = graphies.querySelector("span");
      const toutes = [...(span.textContent ? span.textContent.split(", ") : []), ...nouvelles];
      span.textContent = toutes.join(", ");
      graphies.firstChild.textContent = toutes.length > 1 ? "Autres graphies : " : "Autre graphie : ";
      graphies.hidden = false;
    }
  }
  charger().catch(() => { /* hors ligne : la fiche générée suffit */ });
})();
