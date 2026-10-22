(() => {
  "use strict";

  const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
    "août", "septembre", "octobre", "novembre", "décembre"];
  const GENRES = { f: "Fille", m: "Garçon", x: "Genre à préciser" };
  const STORE = { fav: "ps-favoris", hist: "ps-historique", sugg: "ps-suggestions", auteur: "ps-auteur" };
  const PAGE = 120;

  // ---------- Utilitaires ----------
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => s.toLowerCase().replace(/ŋ/g, "ng")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
  const loose = (s) => norm(s).replace(/(.)\1+/g, "$1");
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* stockage indisponible */ }
    }
  };

  function formatDate(mmdd) {
    const [m, d] = mmdd.split("-").map(Number);
    return `${d === 1 ? "1er" : d} ${MOIS[m - 1]}`;
  }

  // Graphie « à la française » approximative à partir de l'orthographe officielle.
  const VOY = "aeiouéèë";
  function franciseMot(w) {
    let s = w.toLowerCase()
      .replace(/óo/g, "o").replace(/ée/g, "é").replace(/àa/g, "a")
      .replace(/aa/g, "a").replace(/ee/g, "é").replace(/oo/g, "o").replace(/ii/g, "i").replace(/uu/g, "u")
      .replace(/[àá]/g, "a").replace(/[óò]/g, "o")
      .replace(/([bcdfgjklmnprtwxyñŋ])\1/g, "$1");
    let out = "";
    for (let i = 0; i < s.length; i++) {
      const c = s[i], nx = s[i + 1] || "", nx2 = s[i + 2] || "", prev = s[i - 1] || "";
      const v = (ch) => ch !== "" && VOY.includes(ch);
      switch (c) {
        case "c": out += "aoueéèë".includes(nx) && nx ? "thi" : nx === "i" ? "th" : "tch"; break;
        case "j": out += "aoueéèë".includes(nx) && nx ? "di" : "dj"; break;
        case "x": out += "kh"; break;
        case "ñ": out += "gn"; break;
        case "ŋ": out += "ng"; break;
        case "u": out += prev === "o" ? "u" : "ou"; break;
        case "g": out += "eéèëi".includes(nx) && nx ? "gu" : "g"; break;
        case "e": out += (!nx || v(nx) || (v(nx2) && nx !== "y")) ? "é" : "è"; break;
        case "ë": out += "e"; break;
        case "y": out += (!nx && v(prev)) ? "ye" : "y"; break;
        case "s": out += (v(prev) && v(nx)) ? "ss" : "s"; break;
        default: out += c;
      }
    }
    return out.charAt(0).toUpperCase() + out.slice(1);
  }
  const francise = (nom) => nom.split(/(\s+|\s*\/\s*|-)/).map((p) => /[a-zà-ÿñŋë]/i.test(p) ? franciseMot(p) : p).join("");

  // ---------- Données ----------
  const NAMES = [];
  const byKey = new Map();
  const seenNorm = new Set();

  const SOURCES = {
    diop: "Calendrier du Pr Babacar Mbaye Diop (2018)",
    contrib: "Contribution",
    fdf: "Calendrier FayDiaFal (2018) de Djamil Faye, Badou Dia et Ibrahima Fall"
  };

  function addName(nom, e, g, date, src) {
    const key = norm(nom) + "-" + e.toLowerCase();
    let n = byKey.get(key);
    if (n) {
      if (date && !n.dates.includes(date)) n.dates.push(date);
      if (nom !== n.nom && !n.variantes.includes(nom)) n.variantes.push(nom);
      return;
    }
    n = { id: key, nom, e, g, src, dates: date ? [date] : [], variantes: [...(AUTRES_GRAPHIES[nom] || [])] };
    n.fr = francise(nom);
    const sansE = (v) => loose(v).replace(/e$/, "");
    if (n.fr && (norm(n.fr) === norm(nom) || n.variantes.some((v) => sansE(v) === sansE(n.fr)))) n.fr = null;
    byKey.set(key, n);
    [nom, ...n.variantes].forEach((v) => seenNorm.add(norm(v)));
    NAMES.push(n);
  }
  // Préséance (ordre d'ajout des sources) : Pr Diop, contributions, FayDiaFal.
  PRENOMS_CALENDRIER.forEach(([d, nom, e, g]) => addName(nom, e, g, d, "diop"));
  const addIfNew = (src) => ([nom, e, g]) => { if (!seenNorm.has(norm(nom))) addName(nom, e, g, null, src); };
  PRENOMS_AUTRES.forEach(addIfNew("diop"));
  PRENOMS_CONTRIBUTIONS.forEach(addIfNew("contrib"));
  PRENOMS_FAYDIAFAL.forEach(addIfNew("fdf"));

  function meaningOf(n) {
    const raw = SIGNIFICATIONS[n.nom] ?? n.variantes.map((v) => SIGNIFICATIONS[v]).find(Boolean);
    if (!raw) return null;
    return typeof raw === "string" ? { sens: raw } : raw;
  }
  function indexer(n) {
    n.searchNoms = [n.nom, ...n.variantes, n.fr || ""].filter(Boolean).flatMap((v) => [norm(v), loose(v)]);
    n.searchSens = [n.sens, ...n.sensAutres].filter(Boolean).map((x) => loose(x.sens)).join(" ");
  }
  const trier = () => NAMES.sort((a, b) => a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" }));
  NAMES.forEach((n) => { n.sens = meaningOf(n); n.sensAutres = []; indexer(n); });
  trier();
  const byId = new Map(NAMES.map((n) => [n.id, n]));

  // ---------- Contributions publiées (Supabase) ----------
  // Elles complètent les données sans jamais les remplacer : une signification déjà connue reste
  // affichée en premier, une nouvelle écriture devient une « autre graphie ».
  function trouverPrenom(id, nom) {
    if (id && byId.has(id)) return byId.get(id);
    const k = norm(nom);
    return NAMES.find((n) => norm(n.nom) === k || n.variantes.some((v) => norm(v) === k));
  }
  function appliquerContributions(lignes) {
    lignes.sort((a, b) => String(a.publie_le).localeCompare(String(b.publie_le)));
    for (const c of lignes) {
      if (!c.prenom) continue;
      let n = trouverPrenom(c.prenom_id, c.prenom);
      if (!n) {
        const e = ETHNIES[c.ethnie] ? c.ethnie : "NC";
        addName(c.prenom.trim(), e, c.genre || "x", null, "contrib");
        n = NAMES[NAMES.length - 1];
        n.sens = null; n.sensAutres = []; n.par = c.auteur || null;
        byId.set(n.id, n);
      } else {
        if (c.genre && n.g === "x") n.g = c.genre;
        if (c.ethnie && ETHNIES[c.ethnie] && n.e === "NC") n.e = c.ethnie;
        if (c.prenom_id !== n.id && norm(c.prenom) !== norm(n.nom) && !n.variantes.some((v) => norm(v) === norm(c.prenom))) {
          n.variantes.push(c.prenom.trim());
        }
      }
      String(c.graphie || "").split(/[,;\/]/).map((v) => v.trim()).filter(Boolean).forEach((v) => {
        if (norm(v) !== norm(n.nom) && !n.variantes.some((x) => norm(x) === norm(v))) n.variantes.push(v);
      });
      if (c.signification) {
        const entree = { sens: c.signification.trim(), source: "Contribution", par: c.auteur || null };
        const deja = [n.sens, ...n.sensAutres].some((x) => x && loose(x.sens) === loose(entree.sens));
        if (!deja) { if (!n.sens) n.sens = entree; else n.sensAutres.push(entree); }
      }
      indexer(n);
    }
    trier();
  }
  async function chargerContributions() {
    if (!DB.actif()) return;
    try {
      const lignes = await DB.requete("/rest/v1/suggestions?select=id,type,prenom,prenom_id,signification,ethnie,genre,graphie,auteur,publie_le&statut=eq.publiee");
      if (!lignes?.length) return;
      appliquerContributions(lignes);
      renderEthnieChips();
      renderExplore();
      renderFavs();
      initStats();
      if (state.current) showName(state.current); else openFromHash();
    } catch { /* hors ligne : on garde les données du site */ }
  }

  // ---------- État ----------
  const state = {
    ethnies: new Set(),       // vide = toutes
    sexe: "all",
    inclureX: true,
    current: null,
    history: store.get(STORE.hist, []),        // les identifiants inconnus sont ignorés à l'affichage
    favs: new Set(store.get(STORE.fav, [])),
    exploreLimit: PAGE
  };

  // ---------- Générateur ----------
  function matchSexe(n, sexe, inclureX) {
    if (sexe === "all") return true;
    return n.g === sexe || (inclureX && n.g === "x");
  }
  function pool() {
    return NAMES.filter((n) =>
      (state.ethnies.size === 0 || state.ethnies.has(n.e)) && matchSexe(n, state.sexe, state.inclureX));
  }

  function renderEthnieChips() {
    const counts = {};
    NAMES.forEach((n) => { if (matchSexe(n, state.sexe, state.inclureX)) counts[n.e] = (counts[n.e] || 0) + 1; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const chip = (code, label, count, on) =>
      `<button type="button" class="chip${on ? " on" : ""}" data-e="${code}"${!count && !on ? " disabled" : ""}>${esc(label)}<small>${count}</small></button>`;
    $("#ethnie-chips").innerHTML =
      chip("", "Toutes", total, state.ethnies.size === 0) +
      Object.entries(ETHNIES).map(([code, et]) => chip(code, et.nom, counts[code] || 0, state.ethnies.has(code))).join("");
    const p = pool().length;
    $("#pool-count").textContent = `${p} prénom${p > 1 ? "s" : ""} possible${p > 1 ? "s" : ""}`;
    $("#btn-generate").disabled = p === 0;
  }

  $("#ethnie-chips").addEventListener("click", (ev) => {
    const b = ev.target.closest(".chip");
    if (!b) return;
    const code = b.dataset.e;
    if (!code) state.ethnies.clear();
    else if (state.ethnies.has(code)) state.ethnies.delete(code);
    else state.ethnies.add(code);
    renderEthnieChips();
  });
  $("#sexe").addEventListener("click", (ev) => {
    const b = ev.target.closest("button");
    if (!b) return;
    state.sexe = b.dataset.v;
    document.querySelectorAll("#sexe button").forEach((x) => x.classList.toggle("on", x === b));
    renderEthnieChips();
  });
  $("#inclure-x").addEventListener("change", (ev) => { state.inclureX = ev.target.checked; renderEthnieChips(); });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let rolling = false;

  function generate() {
    const p = pool();
    if (!p.length || rolling) return;
    const recent = new Set(state.history.slice(0, Math.min(10, p.length - 1)));
    const candidates = p.filter((n) => !recent.has(n.id));
    const chosen = pick(candidates.length ? candidates : p);
    if (reduceMotion || p.length < 3) return showName(chosen, true);

    rolling = true;
    $("#result-empty").hidden = true;
    $("#result-body").hidden = false;
    let frames = 0;
    const tick = () => {
      if (frames++ < 9) {
        const n = pick(p);
        $("#result-body").innerHTML = `<div class="name-display"><p class="name-big rolling">${esc(n.nom)}</p></div>`;
        setTimeout(tick, 40 + frames * 6);
      } else {
        rolling = false;
        showName(chosen, true);
      }
    };
    tick();
  }
  $("#btn-generate").addEventListener("click", generate);

  document.addEventListener("keydown", (ev) => {
    if (ev.code !== "Space" || ev.repeat) return;
    if (ev.target.closest("input, textarea, select, button, a, dialog")) return;
    ev.preventDefault();
    generate();
  });

  function showName(n, fromGenerator = false) {
    state.current = n;
    $("#result-empty").hidden = true;
    const body = $("#result-body");
    body.hidden = false;

    const sens = n.sens;
    const dates = n.dates.map(formatDate).join(" et ");
    const et = ETHNIES[n.e];
    body.innerHTML = `
      <div class="name-display">
        <p class="name-big ${n.g}">${esc(n.nom)}</p>
        ${n.fr ? `<p class="name-alt">Se prononce à peu près : <b>${esc(n.fr)}</b></p>` : ""}
        ${n.variantes.length ? `<p class="name-alt">Autre${n.variantes.length > 1 ? "s" : ""} graphie${n.variantes.length > 1 ? "s" : ""} : ${n.variantes.map(esc).join(", ")}</p>` : ""}
        <div class="badges">
          <span class="badge eth">${esc(et.nom)}${et.detail ? ` <small>(${esc(et.detail)})</small>` : ""}</span>
          <span class="badge ${n.g}">${GENRES[n.g]}</span>
          ${dates ? `<span class="badge fete">Fêté le ${dates}</span>` : ""}
        </div>
        <p class="name-src">${n.par ? `Proposé par ${esc(n.par)}` : `Source : ${esc(SOURCES[n.src])}`}</p>
      </div>
      <div class="meaning${sens ? "" : " empty"}">
        <h4>Signification</h4>
        ${sens
          ? `<p>${esc(sens.sens)}</p>${creditSens(sens)}`
          : `<p>La signification de ce prénom n'est pas encore renseignée. Vous la connaissez ? Partagez-la !</p>`}
        ${n.sensAutres.length ? `<div class="meaning-more"><h5>Autres éclairages</h5>${n.sensAutres
          .map((x) => `<p>${esc(x.sens)} ${x.par ? `<span class="par">— proposé par ${esc(x.par)}</span>` : ""}</p>`).join("")}</div>` : ""}
      </div>
      <div class="actions">
        <button type="button" class="btn-action fav${state.favs.has(n.id) ? " on" : ""}" data-act="fav">
          ${state.favs.has(n.id) ? "♥ Favori" : "♡ Ajouter aux favoris"}</button>
        <button type="button" class="btn-action" data-act="copy">Copier</button>
        <button type="button" class="btn-action" data-act="share">Partager</button>
        <a class="btn-action" data-act="wa" target="_blank" rel="noopener"
           href="https://wa.me/?text=${encodeURIComponent(shareText(n))}">WhatsApp</a>
        <button type="button" class="btn-action suggest" data-act="suggest">
          ${sens ? "Suggérer une modification" : "Donner la signification / suggérer une modification"}</button>
      </div>`;

    if (fromGenerator) {
      state.history = [n.id, ...state.history.filter((id) => id !== n.id)].slice(0, 15);
      store.set(STORE.hist, state.history);
      renderOthers(n);
    }
    renderHistory();
    history.replaceState(null, "", "#p=" + encodeURIComponent(n.id));
    // Sur mobile, le résultat est sous les filtres : on le fait défiler à l'écran.
    if (window.matchMedia("(max-width: 860px)").matches) {
      $("#result").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  }

  function creditSens(x) {
    if (x.par) return `<p class="par">Proposée par ${esc(x.par)}</p>`;
    return x.source ? `<p class="src">Source : ${esc(x.source)}</p>` : "";
  }

  function renderOthers(n) {
    const p = pool().filter((x) => x.id !== n.id);
    const others = [];
    while (others.length < Math.min(6, p.length)) {
      const x = pick(p);
      if (!others.includes(x)) others.push(x);
    }
    $("#others").hidden = others.length === 0;
    $("#others-list").innerHTML = others.map(chipHtml).join("");
  }
  function renderHistory() {
    const items = state.history.slice(1).map((id) => byId.get(id)).filter(Boolean);
    $("#history").hidden = items.length === 0;
    $("#history-list").innerHTML = items.map(chipHtml).join("");
  }
  const chipHtml = (n) => `<button type="button" class="name-chip ${n.g}" data-id="${esc(n.id)}">${esc(n.nom)}</button>`;

  $("#result").addEventListener("click", async (ev) => {
    const chip = ev.target.closest("[data-id]");
    if (chip) return showName(byId.get(chip.dataset.id));
    const act = ev.target.closest("[data-act]")?.dataset.act;
    const n = state.current;
    if (!act || !n) return;
    if (act === "fav") toggleFav(n);
    if (act === "copy") copy(n.nom, "Prénom copié");
    if (act === "share") {
      const data = { title: "Prénoms Sénégalais", text: shareText(n), url: linkTo(n) };
      if (navigator.share) { try { await navigator.share(data); } catch { /* annulé */ } }
      else copy(linkTo(n), "Lien copié");
    }
    if (act === "suggest") openSuggest(n.sens ? "modification" : "definition", n);
  });

  function linkTo(n) { return location.href.split("#")[0] + "#p=" + encodeURIComponent(n.id); }
  function shareText(n) {
    const sens = n.sens ? ` — « ${n.sens.sens.replace(/\.$/, "")} »` : "";
    return `${n.nom} (${ETHNIES[n.e].nom})${sens}. Découvert sur Prénoms Sénégalais : ${linkTo(n)}`;
  }
  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg); }
    catch { toast("Copie impossible sur ce navigateur"); }
  }

  // ---------- Favoris ----------
  function toggleFav(n) {
    if (state.favs.has(n.id)) state.favs.delete(n.id); else state.favs.add(n.id);
    store.set(STORE.fav, [...state.favs]);
    toast(state.favs.has(n.id) ? `${n.nom} ajouté aux favoris` : `${n.nom} retiré des favoris`);
    if (state.current) showName(state.current);
    renderFavs();
  }
  function renderFavs() {
    const list = [...state.favs].map((id) => byId.get(id)).filter(Boolean);
    $("#fav-empty").hidden = list.length > 0;
    $("#fav-share").hidden = list.length === 0;
    $("#fav-list").innerHTML = list.map(tileHtml).join("");
    const c = $("#fav-count");
    c.hidden = list.length === 0;
    c.textContent = list.length;
  }
  $("#fav-share").addEventListener("click", () => {
    const list = [...state.favs].map((id) => byId.get(id)?.nom).filter(Boolean).join(", ");
    const text = `Mes prénoms sénégalais préférés : ${list}. ${location.href.split("#")[0]}`;
    if (navigator.share) navigator.share({ title: "Mes prénoms préférés", text }).catch(() => {});
    else copy(text, "Liste copiée");
  });

  // ---------- Explorer ----------
  function tileHtml(n) {
    const meta = [ETHNIES[n.e].nom, n.dates[0] ? formatDate(n.dates[0]) : ""].filter(Boolean).join(" · ");
    return `<button type="button" class="name-tile" data-id="${esc(n.id)}" title="${esc(GENRES[n.g])}">
      <span><span class="t-name">${esc(n.nom)}</span><span class="t-meta">${esc(meta)}</span></span>
      <span>${n.sens ? '<span class="has-sens" title="Signification connue">✦</span> ' : ""}<span class="dot ${n.g}"></span></span>
    </button>`;
  }
  function renderExplore() {
    const q = loose($("#q").value);
    const e = $("#f-ethnie").value, g = $("#f-genre").value, s = $("#f-sens").checked;
    // Pertinence : prénom qui commence par la recherche, puis qui la contient, puis signification.
    const rang = (n) => !q ? 0
      : n.searchNoms.some((k) => k.startsWith(q)) ? 0
      : n.searchNoms.some((k) => k.includes(q)) ? 1
      : n.searchSens.includes(q) ? 2 : -1;
    const list = NAMES.map((n) => [n, rang(n)])
      .filter(([n, r]) => r >= 0 && (!e || n.e === e) && (g === "all" || n.g === g) && (!s || n.sens))
      .sort((a, b) => a[1] - b[1]).map(([n]) => n);
    $("#explore-count").textContent = `${list.length} prénom${list.length > 1 ? "s" : ""}`;
    $("#explore-list").innerHTML = list.slice(0, state.exploreLimit).map(tileHtml).join("");
    $("#explore-more").hidden = list.length <= state.exploreLimit;
  }
  $("#f-ethnie").innerHTML = `<option value="">Toutes les ethnies</option>` +
    Object.entries(ETHNIES).map(([c, et]) => `<option value="${c}">${esc(et.nom)}</option>`).join("");
  ["#q", "#f-ethnie", "#f-genre", "#f-sens"].forEach((sel) =>
    $(sel).addEventListener("input", () => { state.exploreLimit = PAGE; renderExplore(); }));
  $("#explore-more").addEventListener("click", () => { state.exploreLimit += PAGE; renderExplore(); });

  function openFromTile(ev) {
    const t = ev.target.closest("[data-id]");
    if (!t) return;
    showName(byId.get(t.dataset.id));
    $("#result").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }
  $("#explore-list").addEventListener("click", openFromTile);
  $("#fav-list").addEventListener("click", openFromTile);

  // ---------- Suggestions ----------
  const dlg = $("#suggest-dialog");
  const form = $("#suggest-form");
  const TITRES = {
    definition: "Donner la signification",
    modification: "Suggérer une modification",
    nouveau: "Proposer un nouveau prénom"
  };
  $("#s-ethnie").innerHTML = `<option value="">— Je ne sais pas —</option>` +
    Object.entries(ETHNIES).filter(([c]) => c !== "NC")
      .map(([c, et]) => `<option value="${c}">${esc(et.nom)}</option>`).join("") +
    `<option value="autre">Autre (préciser en commentaire)</option>`;

  function openSuggest(type, n = null) {
    form.reset();
    $("#s-type").value = type;
    $("#s-prenom").value = n ? n.nom : "";
    $("#s-id").value = n ? n.id : "";
    $("#s-ethnie").value = n && n.e !== "NC" ? n.e : "";
    $("#s-genre").value = n ? n.g : "";
    if (n && n.sens && type !== "nouveau") $("#s-sens").value = n.sens.sens;
    $("#s-auteur").value = store.get(STORE.auteur, "");
    majApercu();
    updateSuggestTitle();
    dlg.showModal();
    (n ? $("#s-sens") : $("#s-prenom")).focus();
  }
  function majApercu() { $("#s-apercu").textContent = $("#s-auteur").value.trim() || "Aly Diop"; }
  $("#s-auteur").addEventListener("input", majApercu);
  function updateSuggestTitle() { $("#suggest-title").textContent = TITRES[$("#s-type").value]; }
  $("#s-type").addEventListener("change", updateSuggestTitle);
  document.querySelectorAll("[data-propose]").forEach((b) => b.addEventListener("click", () => openSuggest("nouveau")));
  dlg.addEventListener("click", (ev) => {
    if (ev.target.closest("[data-close]") || ev.target === dlg) dlg.close();
  });

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    Object.keys(data).forEach((k) => { data[k] = String(data[k]).trim(); });
    const original = byId.get(data.prenom_id);
    if (data.type === "definition" && !data.signification) {
      toast("Merci d'indiquer la signification");
      return $("#s-sens").focus();
    }
    const changed = data.signification !== (original?.sens?.sens ?? "") || data.commentaire || data.graphie ||
      (original && (data.ethnie !== (original.e === "NC" ? "" : original.e) || data.genre !== original.g));
    if (!changed && data.type !== "nouveau") return toast("Aucune modification à envoyer");

    if (data.site_web) { dlg.close(); return toast("Merci !"); } // robot
    store.set(STORE.auteur, data.auteur);

    // Seuls les champs utiles sont envoyés ; une signification inchangée n'est pas renvoyée.
    const vide = (v) => (v ? v : null);
    const envoi = {
      type: data.type,
      prenom: data.prenom,
      prenom_id: vide(data.prenom_id),
      signification: data.signification !== (original?.sens?.sens ?? "") ? vide(data.signification) : null,
      ethnie: original && data.ethnie === (original.e === "NC" ? "" : original.e) ? null : vide(data.ethnie),
      genre: original && data.genre === original.g ? null : vide(data.genre),
      graphie: vide(data.graphie),
      commentaire: vide(data.commentaire),
      auteur: vide(data.auteur),
      email: vide(data.email)
    };

    const btn = $("#s-submit");
    btn.disabled = true;
    let msg;
    try {
      if (DB.actif()) {
        await DB.requete("/rest/v1/suggestions", { method: "POST", body: envoi, prefer: "return=minimal" });
        msg = "Merci ! Votre proposition a été envoyée. Elle sera publiée après relecture.";
      } else {
        const saved = store.get(STORE.sugg, []);
        saved.push({ ...envoi, created_at: new Date().toISOString(), statut: "en_attente" });
        store.set(STORE.sugg, saved);
        msg = "Merci ! Votre proposition a bien été enregistrée.";
      }
      dlg.close();
    } catch {
      msg = "L'envoi a échoué. Vérifiez votre connexion et réessayez.";
    } finally {
      btn.disabled = false;
    }
    toast(msg);
  });

  // ---------- Divers ----------
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  function initToday() {
    const now = new Date();
    const mmdd = String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    const n = NAMES.find((x) => x.dates.includes(mmdd));
    if (!n) return;
    $("#today").hidden = false;
    $("#today-date").textContent = formatDate(mmdd);
    $("#today-name").textContent = n.nom;
    $("#today-name").addEventListener("click", () => showName(n));
  }

  function initStats() {
    const withSens = NAMES.filter((n) => n.sens).length;
    $("#stats").textContent = `${NAMES.length} prénoms référencés, dont ${withSens} avec une signification connue.`;
  }

  function openFromHash() {
    const m = location.hash.match(/^#p=(.+)$/);
    const n = m && byId.get(decodeURIComponent(m[1]));
    if (n) showName(n);
  }
  window.addEventListener("hashchange", openFromHash);

  renderEthnieChips();
  renderExplore();
  renderFavs();
  initToday();
  initStats();
  openFromHash();
  chargerContributions();
})();
