// Affiche du prénom à imprimer (bêta), commune au site (aperçu avec filigrane) et à admin.html (version HD).
// Le dessin se fait sur une page A4 de 1000 × 1414 unités, mise à l'échelle de la toile.
const Affiche = (() => {
  "use strict";
  const L = 1000, H = 1414;
  const C = { vert: "#0b7a3b", vertFonce: "#065a2b", rouge: "#d0161f", jaune: "#f2c230",
    creme: "#fcf6f1", encre: "#1d2620", gris: "#66706a" };
  const POLICE = "Outfit, system-ui, sans-serif";

  let logo;
  function chargerLogo(src) {
    if (!logo) {
      logo = new Promise((ok) => {
        const img = new Image();
        img.onload = () => ok(img);
        img.onerror = () => ok(null);
        img.src = src;
      });
    }
    return logo;
  }

  function lignes(ctx, texte, largeur) {
    const mots = texte.split(/\s+/).filter(Boolean);
    const res = [];
    let ligne = "";
    for (const m of mots) {
      const essai = ligne ? ligne + " " + m : m;
      if (ctx.measureText(essai).width > largeur && ligne) { res.push(ligne); ligne = m; } else ligne = essai;
    }
    if (ligne) res.push(ligne);
    return res;
  }

  function ajuster(ctx, texte, poids, taille, largeur) {
    do { ctx.font = `${poids} ${taille}px ${POLICE}`; taille -= 4; } while (ctx.measureText(texte).width > largeur && taille > 40);
  }

  function etoile(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r;
      ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a));
    }
    ctx.closePath();
    ctx.fill();
  }

  /**
   * d : { nom, famille, mention, fr, infos, sens, source, genre }
   * opts : { filigrane: bool, logo: "assets/arbre.png" }
   */
  async function dessiner(toile, d, { filigrane = true, logo: srcLogo = "assets/arbre.png" } = {}) {
    try { await Promise.all(["700 100px Outfit", "500 40px Outfit", "400 40px Outfit"].map((f) => document.fonts.load(f))); }
    catch { /* police système */ }
    const img = await chargerLogo(srcLogo);
    const ctx = toile.getContext("2d");
    const k = toile.width / L;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    // Fond et cadre
    ctx.fillStyle = C.creme; ctx.fillRect(0, 0, L, H);
    ctx.strokeStyle = C.vert; ctx.lineWidth = 8; ctx.strokeRect(40, 40, L - 80, H - 80);
    ctx.strokeStyle = C.jaune; ctx.lineWidth = 2; ctx.strokeRect(58, 58, L - 116, H - 116);

    // Bandeau vert-jaune-rouge et étoile
    [C.vert, C.jaune, C.rouge].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(410 + i * 60, 110, 60, 10); });
    ctx.fillStyle = C.vert; etoile(ctx, 500, 115, 14);

    if (img) {
      const h = 230, w = h * img.width / img.height;
      ctx.drawImage(img, (L - w) / 2, 150, w, h);
    }

    // Prénom
    ctx.fillStyle = d.genre === "f" ? C.rouge : C.vertFonce;
    ajuster(ctx, d.nom, 700, 180, 820);
    ctx.fillText(d.nom, 500, 560);
    let y = 560;
    if (d.famille) {
      ctx.fillStyle = C.encre;
      ajuster(ctx, d.famille, 500, 60, 820);
      ctx.fillText(d.famille, 500, y += 82);
    }
    if (d.fr) {
      ctx.fillStyle = C.gris; ctx.font = `400 30px ${POLICE}`;
      ctx.fillText(`Se prononce à peu près : ${d.fr}`, 500, y += 60);
    }

    // Séparateur
    y += 50;
    ctx.fillStyle = C.jaune; ctx.fillRect(250, y, 210, 3); ctx.fillRect(540, y, 210, 3);
    ctx.fillStyle = C.vert; etoile(ctx, 500, y + 1, 14);

    if (d.infos) {
      ctx.fillStyle = C.vertFonce; ctx.font = `500 32px ${POLICE}`;
      ctx.fillText(d.infos, 500, y += 70);
    }

    // Signification
    const sens = d.sens ? `« ${d.sens.replace(/\s+/g, " ").trim()} »` : "";
    if (sens) {
      let taille = 44, ls;
      do { ctx.font = `400 ${taille}px ${POLICE}`; ls = lignes(ctx, sens, 780); taille -= 2; } while (ls.length > 6 && taille > 26);
      ctx.fillStyle = C.encre;
      const pas = taille * 1.45;
      y += 40;
      ls.slice(0, 7).forEach((l) => ctx.fillText(l, 500, y += pas));
    } else {
      // Signification inconnue : une phrase neutre plutôt qu'un vide.
      ctx.fillStyle = C.gris; ctx.font = `400 36px ${POLICE}`;
      ["Un prénom de chez nous,", "transmis de génération en génération."].forEach((l) => ctx.fillText(l, 500, y += 60));
      y += 20;
    }

    if (d.mention) {
      ctx.fillStyle = C.encre;
      ajuster(ctx, d.mention, 500, 40, 820);
      ctx.fillText(d.mention, 500, Math.max(y + 90, 1210));
    }

    ctx.fillStyle = C.gris;
    ctx.font = `600 26px ${POLICE}`; ctx.fillText("Prénoms Sénégalais", 500, 1318);
    if (d.source) { ctx.font = `400 19px ${POLICE}`; ctx.fillText(`Source : ${d.source}`, 500, 1348); }

    if (filigrane) {
      ctx.save();
      ctx.translate(500, 707); ctx.rotate(-Math.PI / 6);
      ctx.fillStyle = "rgba(29, 38, 32, .09)"; ctx.font = `700 54px ${POLICE}`;
      for (let i = -6; i <= 6; i++) ctx.fillText("APERÇU · Prénoms Sénégalais · APERÇU", 0, i * 150);
      ctx.restore();
    }
  }

  // Code de commande : les données de l'affiche, à coller dans admin.html.
  const CHAMPS = ["nom", "famille", "mention", "fr", "infos", "sens", "source", "genre"];
  function code(d) {
    const octets = new TextEncoder().encode(JSON.stringify(CHAMPS.map((c) => d[c] || "")));
    return "PS1-" + btoa(String.fromCharCode(...octets)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function lireCode(texte) {
    const m = String(texte).match(/PS1-([A-Za-z0-9_-]+)/);
    if (!m) return null;
    try {
      const b = atob(m[1].replace(/-/g, "+").replace(/_/g, "/"));
      const valeurs = JSON.parse(new TextDecoder().decode(Uint8Array.from(b, (c) => c.charCodeAt(0))));
      return Object.fromEntries(CHAMPS.map((c, i) => [c, valeurs[i] || ""]));
    } catch { return null; }
  }

  return { dessiner, code, lireCode, LARGEUR: L, HAUTEUR: H };
})();
