// Affiche du prénom (bêta), commune au site (aperçu avec filigrane) et à admin.html (fichier à imprimer).
// Le dessin se fait dans un repère où le petit côté mesure 1000 unités, mis à l'échelle de la toile :
// le même code sert à l'aperçu, aux bâches de plusieurs mètres et aux images pour les écrans.
const Affiche = (() => {
  "use strict";
  const POLICE = "Outfit, system-ui, sans-serif";
  const DRAPEAU = ["#0b7a3b", "#f2c230", "#d0161f"];

  // cm et dpi pour l'impression (export PDF à la taille réelle), px pour les écrans (export PNG).
  const FORMATS = {
    "bache-3x1": { groupe: "Bâches et banderoles", nom: "Banderole 3 × 1 m", l: 300, h: 100, dpi: 100 },
    "bache-2x1": { groupe: "Bâches et banderoles", nom: "Banderole 2 × 1 m", l: 200, h: 100, dpi: 100 },
    "fond-3x2": { groupe: "Bâches et banderoles", nom: "Fond photo 3 × 2 m", l: 300, h: 200, dpi: 75 },
    "kakemono": { groupe: "Bâches et banderoles", nom: "Kakémono 85 × 200 cm", l: 85, h: 200, dpi: 100 },
    "a3": { groupe: "Affiches", nom: "Affiche A3", l: 29.7, h: 42, dpi: 300 },
    "a4": { groupe: "Affiches", nom: "Affiche A4", l: 21, h: 29.7, dpi: 300 },
    "statut": { groupe: "Écrans", nom: "Statut WhatsApp (9:16)", px: [1080, 1920] },
    "ecran": { groupe: "Écrans", nom: "Écran ou projection (16:9)", px: [1920, 1080] },
    "carre": { groupe: "Écrans", nom: "Publication carrée", px: [1080, 1080] }
  };
  for (const f of Object.values(FORMATS)) {
    f.imprime = !f.px;
    const [l, h] = f.px || [f.l, f.h];
    f.ratio = l / h;
    f.pixels = f.px || [Math.round(f.l / 2.54 * f.dpi), Math.round(f.h / 2.54 * f.dpi)];
  }

  const STYLES = {
    classique: { nom: "Classique", fond: "#fcf6f1", cadre: "#0b7a3b", filet: "#f2c230", encre: "#1d2620", doux: "#66706a",
      accent: "#065a2b", nomF: "#d0161f", nomM: "#065a2b", deco: "double" },
    nuit: { nom: "Nuit étoilée", fond: "#0d3b24", cadre: "#f2c230", filet: "rgba(242, 194, 48, .45)", encre: "#fcf6f1",
      doux: "#c8dccf", accent: "#f2c230", nomF: "#ffd34d", nomM: "#ffd34d", deco: "etoiles", medaillon: "#fcf6f1" },
    bogolan: { nom: "Bogolan", fond: "#f1e2c6", cadre: "#5b3a1f", filet: "#b5651d", encre: "#3a2614", doux: "#7a5a3c",
      accent: "#5b3a1f", nomF: "#8f2d1a", nomM: "#5b3a1f", deco: "zigzag" },
    douceur: { nom: "Douceur", fond: "#fdf6f4", cadre: "#9cc5b0", filet: "#f2c9a0", encre: "#33403a", doux: "#7d8a83",
      accent: "#4f8a70", nomF: "#c2546b", nomM: "#3f7d9c", deco: "points" }
  };

  const images = {};
  function charger(src) {
    if (!images[src]) {
      images[src] = new Promise((ok) => {
        const img = new Image();
        img.onload = () => ok(img);
        img.onerror = () => ok(null);
        img.src = src;
      });
    }
    return images[src];
  }

  const police = (poids, taille) => `${poids} ${taille}px ${POLICE}`;

  function lignes(ctx, texte, largeur) {
    const res = [];
    for (const para of texte.split("\n")) {
      let ligne = "";
      for (const m of para.split(/\s+/).filter(Boolean)) {
        const essai = ligne ? ligne + " " + m : m;
        if (ctx.measureText(essai).width > largeur && ligne) { res.push(ligne); ligne = m; } else ligne = essai;
      }
      if (ligne) res.push(ligne);
    }
    return res;
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

  // Petit générateur pseudo-aléatoire : les étoiles restent au même endroit d'un dessin à l'autre.
  function hasard(graine) {
    let s = graine;
    return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  }

  // ---------- Fond et cadre ----------
  function decor(ctx, W, H, st) {
    const m = 40;
    ctx.fillStyle = st.fond; ctx.fillRect(0, 0, W, H);
    if (st.deco === "etoiles") {
      const r = hasard(7);
      ctx.fillStyle = "rgba(242, 194, 48, .22)";
      for (let i = 0, n = Math.round(W * H / 26000); i < n; i++) etoile(ctx, r() * W, r() * H, 3 + r() * 7);
    }
    if (st.deco === "zigzag") {
      // Bande de triangles façon bogolan entre deux filets
      ctx.fillStyle = st.cadre; ctx.fillRect(m, m, W - 2 * m, H - 2 * m);
      ctx.fillStyle = st.fond; ctx.fillRect(m + 46, m + 46, W - 2 * m - 92, H - 2 * m - 92);
      ctx.fillStyle = st.filet;
      const bande = (x0, y0, longueur, horizontal) => {
        const n = Math.max(4, Math.round(longueur / 34)), pas = longueur / n;
        for (let i = 0; i < n; i++) {
          ctx.beginPath();
          if (horizontal) { ctx.moveTo(x0 + i * pas, y0 + 34); ctx.lineTo(x0 + (i + .5) * pas, y0 + 12); ctx.lineTo(x0 + (i + 1) * pas, y0 + 34); }
          else { ctx.moveTo(x0 + 34, y0 + i * pas); ctx.lineTo(x0 + 12, y0 + (i + .5) * pas); ctx.lineTo(x0 + 34, y0 + (i + 1) * pas); }
          ctx.fill();
        }
      };
      ctx.save();
      bande(m, m, W - 2 * m, true);
      ctx.translate(W, H); ctx.rotate(Math.PI); bande(m, m, W - 2 * m, true);
      ctx.restore();
      ctx.save();
      bande(m, m + 46, H - 2 * m - 92, false);
      ctx.translate(W, H); ctx.rotate(Math.PI); bande(m, m + 46, H - 2 * m - 92, false);
      ctx.restore();
      ctx.strokeStyle = st.filet; ctx.lineWidth = 3; ctx.strokeRect(m + 60, m + 60, W - 2 * m - 120, H - 2 * m - 120);
      return m + 70;
    }
    if (st.deco === "points") {
      ctx.strokeStyle = st.cadre; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.roundRect(m, m, W - 2 * m, H - 2 * m, 60); ctx.stroke();
      ctx.fillStyle = st.filet;
      [[m + 70, m + 70], [W - m - 70, m + 70], [m + 70, H - m - 70], [W - m - 70, H - m - 70]].forEach(([x, y]) => {
        [[0, 0, 12], [30, 0, 7], [0, 30, 7], [52, 0, 4], [0, 52, 4]].forEach(([dx, dy, r]) => {
          ctx.beginPath();
          ctx.arc(x + (x < W / 2 ? dx : -dx), y + (y < H / 2 ? dy : -dy), r, 0, 2 * Math.PI);
          ctx.fill();
        });
      });
      return m + 40;
    }
    ctx.strokeStyle = st.cadre; ctx.lineWidth = 8; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    ctx.strokeStyle = st.filet; ctx.lineWidth = 2; ctx.strokeRect(m + 18, m + 18, W - 2 * m - 36, H - 2 * m - 36);
    return m + 40;
  }

  // ---------- Blocs de texte, mis en page dans une colonne ----------
  // Chaque bloc a une taille de base (pour une colonne de 820 unités de large) ; on cherche le plus grand
  // facteur d'échelle pour lequel la colonne tient dans sa boîte.
  function mesurer(ctx, b, s, largeur) {
    if (b.type === "logo") return { h: b.h * s };
    if (b.type === "orn" || b.type === "sep") return { h: 28 * s };
    if (b.type === "nom") {
      // Le prénom et les autres prénoms sur une ligne ; sur deux si la ligne devait devenir trop petite.
      ctx.font = police(b.poids, b.taille * s);
      const largeurDe = (segs) => ctx.measureText(segs.map((x) => x.texte).join(" ")).width;
      const taillePour = (decoupe) => b.taille * s * Math.min(1, ...decoupe.map((segs) => largeur / largeurDe(segs)));
      let decoupe = [b.segments];
      if (b.segments.length > 1 && taillePour(decoupe) < b.taille * s * 0.62) {
        const options = b.segments.slice(1).map((_, i) => [b.segments.slice(0, i + 1), b.segments.slice(i + 1)]);
        decoupe = options.reduce((m, o) => (taillePour(o) > taillePour(m) ? o : m), options[0]);
      }
      const t = taillePour(decoupe);
      return { h: decoupe.length * t * 1.12, t, decoupe };
    }
    if (b.type === "ligne") {
      let t = b.taille * s;
      ctx.font = police(b.poids, t);
      const w = ctx.measureText(b.texte).width;
      if (w > largeur) t *= largeur / w;
      return { h: t * 1.12, t };
    }
    // Paragraphe : on réduit la police s'il y a trop de lignes.
    let t = b.taille * s, ls;
    for (;;) {
      ctx.font = police(b.poids, t);
      ls = lignes(ctx, b.texte, largeur);
      if (ls.length <= b.max || t < b.taille * s * 0.55) break;
      t *= 0.94;
    }
    ls = ls.slice(0, b.max + 1);
    return { h: ls.length * t * 1.4, t, ls };
  }

  function colonne(ctx, blocs, boite, smax) {
    const total = (s) => blocs.reduce((acc, b, i) => acc + (i ? b.avant * s : 0) + mesurer(ctx, b, s, boite.l).h, 0);
    let bas = 0.05, haut = smax;
    if (total(haut) <= boite.h) bas = haut;
    else for (let i = 0; i < 24; i++) { const mi = (bas + haut) / 2; if (total(mi) <= boite.h) bas = mi; else haut = mi; }
    const s = bas;
    const mesures = blocs.map((b) => mesurer(ctx, b, s, boite.l));
    let reste = Math.max(0, boite.h - total(s));
    // Format haut et étroit : le baobab grandit pour occuper une partie du vide.
    const iLogo = blocs.findIndex((b) => b.type === "logo");
    if (iLogo >= 0 && reste > 0) {
      const plus = Math.min(reste * 0.5, mesures[iLogo].h * 1.2);
      mesures[iLogo].h += plus;
      reste -= plus;
    }
    // L'espace restant : un peu plus d'air entre les blocs, le reste au-dessus et au-dessous.
    const ecarts = blocs.length > 1 ? Math.min(reste * 0.6, s * 60 * (blocs.length - 1)) / (blocs.length - 1) : 0;
    let y = boite.y + (reste - ecarts * (blocs.length - 1)) / 2;
    return blocs.map((b, i) => {
      if (i) y += b.avant * s + ecarts;
      const r = { b, s, y, ...mesures[i] };
      y += mesures[i].h;
      return r;
    });
  }

  function peindre(ctx, places, cx, st, img) {
    for (const p of places) {
      const b = p.b;
      ctx.fillStyle = b.couleur || st.encre;
      if (b.type === "logo" && img) {
        const w = p.h * img.width / img.height;
        if (st.medaillon) {
          // Fond sombre : le baobab dans un médaillon clair, pour garder la mère et l'enfant lisibles.
          ctx.fillStyle = st.medaillon;
          ctx.beginPath(); ctx.arc(cx, p.y + p.h / 2, p.h / 2, 0, 2 * Math.PI); ctx.fill();
          ctx.drawImage(img, cx - w * 0.37, p.y + p.h * 0.13, w * 0.74, p.h * 0.74);
        } else ctx.drawImage(img, cx - w / 2, p.y, w, p.h);
      } else if (b.type === "orn") {
        const u = p.s, y = p.y + p.h / 2;
        DRAPEAU.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(cx - 90 * u + i * 60 * u, y - 5 * u, 60 * u, 10 * u); });
        ctx.fillStyle = DRAPEAU[0]; etoile(ctx, cx, y, 14 * u);
      } else if (b.type === "sep") {
        const u = p.s, y = p.y + p.h / 2;
        ctx.fillStyle = st.filet; ctx.fillRect(cx - 250 * u, y - 1.5 * u, 210 * u, 3 * u); ctx.fillRect(cx + 40 * u, y - 1.5 * u, 210 * u, 3 * u);
        ctx.fillStyle = st.accent; etoile(ctx, cx, y, 14 * u);
      } else if (b.type === "nom") {
        ctx.font = police(b.poids, p.t);
        const espace = ctx.measureText(" ").width;
        const aligne = ctx.textAlign;
        ctx.textAlign = "left";
        p.decoupe.forEach((segs, i) => {
          const largeurs = segs.map((x) => ctx.measureText(x.texte).width);
          let x = cx - (largeurs.reduce((a, c) => a + c, 0) + espace * (segs.length - 1)) / 2;
          segs.forEach((seg, j) => {
            ctx.fillStyle = seg.couleur;
            ctx.fillText(seg.texte, x, p.y + p.t * (0.86 + i * 1.12));
            x += largeurs[j] + espace;
          });
        });
        ctx.textAlign = aligne;
      } else if (b.type === "ligne") {
        ctx.font = police(b.poids, p.t);
        ctx.fillText(b.texte, cx, p.y + p.t * 0.86);
      } else if (b.type === "para") {
        ctx.font = police(b.poids, p.t);
        p.ls.forEach((l, i) => ctx.fillText(l, cx, p.y + p.t * (0.95 + i * 1.4)));
      }
    }
  }

  /**
   * d : { nom, avant, apres, famille, accroche, mention, fr, infos, sens, source, genre, format, style, sansSens }
   * opts : { filigrane, logo, largeurPx, y0 } — largeurPx et y0 servent à dessiner une bande d'une grande image.
   */
  async function dessiner(toile, d, { filigrane = true, logo = "assets/arbre-hd.png", largeurPx, y0 = 0 } = {}) {
    try { await Promise.all(["700 100px Outfit", "600 40px Outfit", "500 40px Outfit", "400 40px Outfit"].map((f) => document.fonts.load(f))); }
    catch { /* police système */ }
    const img = await charger(logo);
    const f = FORMATS[d.format] || FORMATS.a4;
    const st = STYLES[d.style] || STYLES.classique;
    const W = f.ratio >= 1 ? 1000 * f.ratio : 1000, H = f.ratio >= 1 ? 1000 : 1000 / f.ratio;
    const ctx = toile.getContext("2d");
    const k = (largeurPx || toile.width) / W;
    ctx.setTransform(k, 0, 0, k, 0, -y0);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    const marge = decor(ctx, W, H, st);
    const couleurNom = d.genre === "f" ? st.nomF : st.nomM;
    // Le prénom traditionnel est souvent le 2e ou le 3e : les autres prénoms l'entourent, et le sens lui reste attribué.
    const accompagne = Boolean(d.avant || d.apres);
    const segments = [
      d.avant && { texte: d.avant, couleur: st.encre },
      { texte: d.nom, couleur: couleurNom },
      d.apres && { texte: d.apres, couleur: st.encre }
    ].filter(Boolean);
    const infos = accompagne && d.infos ? d.infos.replace(/^Prénom/, `${d.nom} : prénom`) : d.infos;

    // Pied de page : toujours en bas, au centre.
    ctx.fillStyle = st.doux;
    const pied = H - marge - (d.source ? 34 : 6);
    ctx.font = police(600, 24); ctx.fillText("Prénoms Sénégalais · prenomssenegalais.com", W / 2, pied);
    if (d.source) { ctx.font = police(400, 18); ctx.fillText(`Source : ${d.source}`, W / 2, pied + 28); }

    const identite = [
      { type: "orn", avant: 0 },
      img && { type: "logo", h: 210, avant: 26 },
      d.accroche && { type: "ligne", texte: d.accroche, poids: 500, taille: 54, couleur: st.encre, avant: 30 },
      { type: "nom", segments, poids: 700, taille: 180, avant: d.accroche ? 4 : 30 },
      d.famille && { type: "ligne", texte: d.famille, poids: 500, taille: 62, couleur: st.encre, avant: 10 },
      d.fr && { type: "ligne", texte: `${accompagne ? d.nom + " se prononce" : "Se prononce"} à peu près : ${d.fr}`, poids: 400, taille: 30, couleur: st.doux, avant: 16 },
      d.mention && { type: "ligne", texte: d.mention, poids: 600, taille: 44, couleur: st.accent, avant: 30 }
    ].filter(Boolean);
    const sens = d.sansSens ? "" : (d.sens || "").replace(/\s+/g, " ").trim();
    const sensBlocs = [
      { type: "sep", avant: 0 },
      infos && { type: "ligne", texte: infos, poids: 500, taille: 32, couleur: st.accent, avant: 26 },
      sens
        ? { type: "para", texte: `« ${sens} »`, poids: 400, taille: f.ratio < 0.7 ? 62 : 44, max: 7, couleur: st.encre, avant: 30 }
        // Signification inconnue : une phrase neutre plutôt qu'un vide.
        : { type: "para", texte: "Un prénom de chez nous,\ntransmis de génération en génération.", poids: 400, taille: 36, max: 3, couleur: st.doux, avant: 30 }
    ].filter(Boolean);

    const haut = marge + 10, bas = pied - 50;
    if (f.ratio >= 1.3) {
      // Paysage : l'enfant à gauche, le sens du prénom à droite.
      const gauche = { x: marge + 20, l: (W - 2 * marge) * 0.54 - 40, y: haut, h: bas - haut };
      const droite = { x: marge + (W - 2 * marge) * 0.54 + 30, l: (W - 2 * marge) * 0.46 - 50, y: haut, h: bas - haut };
      peindre(ctx, colonne(ctx, identite, gauche, gauche.l / 700), gauche.x + gauche.l / 2, st, img);
      peindre(ctx, colonne(ctx, sensBlocs, droite, droite.l / 760), droite.x + droite.l / 2, st, img);
      ctx.fillStyle = st.filet;
      ctx.fillRect(droite.x - 36, haut + (bas - haut) * 0.15, 3, (bas - haut) * 0.7);
    } else {
      const boite = { x: marge + 20, l: W - 2 * marge - 40, y: haut, h: bas - haut };
      peindre(ctx, colonne(ctx, [...identite, ...sensBlocs.map((b, i) => (i ? b : { ...b, avant: 40 }))], boite, boite.l / 820),
        W / 2, st, img);
    }

    if (filigrane) {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
      ctx.translate(W / 2, H / 2); ctx.rotate(-Math.PI / 6);
      ctx.fillStyle = st.deco === "etoiles" ? "rgba(255, 255, 255, .1)" : "rgba(29, 38, 32, .09)";
      ctx.font = police(700, 54);
      const n = Math.ceil(Math.hypot(W, H) / 150);
      for (let i = -n; i <= n; i++) for (let j = -2; j <= 2; j++)
        ctx.fillText("APERÇU · Prénoms Sénégalais", j * 900 + (i % 2) * 450, i * 150);
      ctx.restore();
    }
  }

  // ---------- Export ----------
  // Une très grande image (bâche) est dessinée en bandes, pour rester sous la limite de taille des toiles
  // (notamment sur téléphone), puis assemblée dans un PDF à la taille réelle.
  const jpeg = (toile) => new Promise((ok) => toile.toBlob((b) => ok(b.arrayBuffer()), "image/jpeg", 0.92));

  async function pdf(d, opts = {}, progres = () => {}) {
    const f = FORMATS[d.format] || FORMATS.a4;
    const [L, Hpx] = f.pixels;
    const hauteurBande = Math.max(64, Math.floor(12e6 / L));
    const bandes = [];
    for (let y = 0; y < Hpx; y += hauteurBande) {
      const h = Math.min(hauteurBande, Hpx - y);
      const t = document.createElement("canvas");
      t.width = L; t.height = h;
      await dessiner(t, d, { ...opts, filigrane: false, largeurPx: L, y0: y });
      bandes.push({ y, h, octets: new Uint8Array(await jpeg(t)) });
      t.width = t.height = 0;
      progres(Math.min(1, (y + h) / Hpx));
    }
    return assemblerPdf(bandes, L, Hpx, f.l / 2.54 * 72, f.h / 2.54 * 72);
  }

  function assemblerPdf(bandes, L, Hpx, Lpt, Hpt) {
    const morceaux = [], decalages = [];
    let taille = 0;
    const ecrire = (x) => {
      const o = typeof x === "string" ? new TextEncoder().encode(x) : x;
      morceaux.push(o); taille += o.length;
    };
    const objet = (n, debut, flux, fin = "") => {
      decalages[n] = taille;
      ecrire(`${n} 0 obj\n${debut}`);
      if (flux) { ecrire(flux); ecrire("\nendstream"); }
      ecrire(`${fin}\nendobj\n`);
    };
    const nb = (x) => x.toFixed(3).replace(/\.?0+$/, "");
    const echelle = Hpt / Hpx;
    const dessin = bandes.map((b, i) =>
      `q ${nb(Lpt)} 0 0 ${nb(b.h * echelle)} 0 ${nb(Hpt - (b.y + b.h) * echelle)} cm /Im${i} Do Q`).join("\n");
    const ressources = bandes.map((_, i) => `/Im${i} ${5 + i} 0 R`).join(" ");

    ecrire("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
    objet(1, "<< /Type /Catalog /Pages 2 0 R >>");
    objet(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    objet(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${nb(Lpt)} ${nb(Hpt)}] /Resources << /XObject << ${ressources} >> >> /Contents 4 0 R >>`);
    objet(4, `<< /Length ${new TextEncoder().encode(dessin).length} >>\nstream\n`, new TextEncoder().encode(dessin));
    bandes.forEach((b, i) => objet(5 + i,
      `<< /Type /XObject /Subtype /Image /Width ${L} /Height ${b.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${b.octets.length} >>\nstream\n`,
      b.octets));
    const n = 5 + bandes.length;
    const xref = taille;
    ecrire(`xref\n0 ${n}\n0000000000 65535 f \n`);
    for (let i = 1; i < n; i++) ecrire(String(decalages[i]).padStart(10, "0") + " 00000 n \n");
    ecrire(`trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(morceaux, { type: "application/pdf" });
  }

  async function png(d, opts = {}) {
    const f = FORMATS[d.format] || FORMATS.carre;
    const t = document.createElement("canvas");
    [t.width, t.height] = f.pixels;
    await dessiner(t, d, { ...opts, filigrane: false });
    return new Promise((ok) => t.toBlob(ok, "image/png"));
  }

  // ---------- Code de commande : les données de l'affiche, à coller dans admin.html ----------
  const CHAMPS1 = ["nom", "famille", "mention", "fr", "infos", "sens", "source", "genre"];
  const CHAMPS = [...CHAMPS1, "accroche", "format", "style", "sansSens", "avant", "apres"];
  const b64 = (o) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  function code(d) {
    return "PS2-" + b64(CHAMPS.map((c) => (c === "sansSens" ? (d.sansSens ? 1 : 0) : d[c] || "")));
  }
  function lireCode(texte) {
    const m = String(texte).match(/PS([12])-([A-Za-z0-9_-]+)/);
    if (!m) return null;
    try {
      const b = atob(m[2].replace(/-/g, "+").replace(/_/g, "/"));
      const valeurs = JSON.parse(new TextDecoder().decode(Uint8Array.from(b, (c) => c.charCodeAt(0))));
      const d = Object.fromEntries((m[1] === "1" ? CHAMPS1 : CHAMPS).map((c, i) => [c, valeurs[i] || ""]));
      d.sansSens = Boolean(d.sansSens);
      if (!FORMATS[d.format]) d.format = "a4";
      if (!STYLES[d.style]) d.style = "classique";
      return d;
    } catch { return null; }
  }

  // <option> des formats, groupés, pour les deux pages.
  function optionsFormats() {
    const groupes = {};
    for (const [id, f] of Object.entries(FORMATS)) (groupes[f.groupe] ||= []).push(`<option value="${id}">${f.nom}</option>`);
    return Object.entries(groupes).map(([g, o]) => `<optgroup label="${g}">${o.join("")}</optgroup>`).join("");
  }

  // Le nom tel qu'il est écrit sur l'affiche, pour les messages et les noms de fichiers.
  const nomComplet = (d) => [d.avant, d.nom, d.apres, d.famille].filter(Boolean).join(" ");

  return { nomComplet, dessiner, pdf, png, code, lireCode, optionsFormats, FORMATS, STYLES };
})();
