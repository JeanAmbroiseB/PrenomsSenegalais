(() => {
  "use strict";

  const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
    "août", "septembre", "octobre", "novembre", "décembre"];
  const GENRES = { f: "Fille", m: "Garçon", x: "Genre à préciser" };
  const STORE = { fav: "ps-favoris", hist: "ps-historique", sugg: "ps-suggestions" };
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

  function addName(nom, e, g, date) {
    const key = norm(nom) + "-" + e.toLowerCase();
    let n = byKey.get(key);
    if (n) {
      if (date && !n.dates.includes(date)) n.dates.push(date);
      if (nom !== n.nom && !n.variantes.includes(nom)) n.variantes.push(nom);
      return;
    }
    n = { id: key, nom, e, g, dates: date ? [date] : [], variantes: [] };
    n.fr = francise(nom);
    if (loose(n.fr) === loose(nom) && norm(n.fr) === norm(nom)) n.fr = null;
    n.search = [norm(nom), loose(nom), n.fr ? norm(n.fr) : "", n.fr ? loose(n.fr) : ""].join(" ");
    byKey.set(key, n);
    seenNorm.add(norm(nom));
    NAMES.push(n);
  }
  PRENOMS_CALENDRIER.forEach(([d, nom, e, g]) => addName(nom, e, g, d));
  PRENOMS_AUTRES.forEach(([nom, e, g]) => { if (!seenNorm.has(norm(nom))) addName(nom, e, g, null); });

  function meaningOf(n) {
    const raw = SIGNIFICATIONS[n.nom] ?? n.variantes.map((v) => SIGNIFICATIONS[v]).find(Boolean);
    if (!raw) return null;
    return typeof raw === "string" ? { sens: raw } : raw;
  }
  NAMES.forEach((n) => { n.sens = meaningOf(n); n.search += " " + (n.sens ? norm(n.sens.sens) : ""); });
  NAMES.sort((a, b) => a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" }));
  const byId = new Map(NAMES.map((n) => [n.id, n]));

  // ---------- État ----------
  const state = {
    ethnies: new Set(),       // vide = toutes
    sexe: "all",
    inclureX: true,
    current: null,
    history: store.get(STORE.hist, []).filter((id) => byId.has(id)),
    favs: new Set(store.get(STORE.fav, []).filter((id) => byId.has(id))),
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
        ${n.variantes.length ? `<p class="name-alt">Variante : ${n.variantes.map(esc).join(", ")}</p>` : ""}
        <div class="badges">
          <span class="badge eth">${esc(et.nom)}${et.detail ? ` <small>(${esc(et.detail)})</small>` : ""}</span>
          <span class="badge ${n.g}">${GENRES[n.g]}</span>
          ${dates ? `<span class="badge fete">Fêté le ${dates}</span>` : ""}
        </div>
      </div>
      <div class="meaning${sens ? "" : " empty"}">
        <h4>Signification</h4>
        ${sens
          ? `<p>${esc(sens.sens)}</p>${sens.source ? `<p class="src">Source : ${esc(sens.source)}</p>` : ""}`
          : `<p>La signification de ce prénom n'est pas encore renseignée. Vous la connaissez ? Partagez-la !</p>`}
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
    const list = [...state.favs].map((id) => byId.get(id).nom).join(", ");
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
    const list = NAMES.filter((n) =>
      (!e || n.e === e) && (g === "all" || n.g === g) && (!s || n.sens) && (!q || n.search.includes(q)));
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
    updateSuggestTitle();
    dlg.showModal();
    (n ? $("#s-sens") : $("#s-prenom")).focus();
  }
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

    data.date = new Date().toISOString();
    data.statut = "nouveau";
    const saved = store.get(STORE.sugg, []);
    saved.push(data);
    store.set(STORE.sugg, saved);

    let msg = "Merci ! Votre suggestion a bien été enregistrée.";
    if (CONFIG.SUGGESTIONS_ENDPOINT) {
      const btn = $("#s-submit");
      btn.disabled = true;
      try {
        const res = await fetch(CONFIG.SUGGESTIONS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...data, _subject: `Prénoms Sénégalais — ${TITRES[data.type]} : ${data.prenom}` })
        });
        if (!res.ok) throw new Error(res.status);
        msg = "Merci ! Votre suggestion a été envoyée.";
      } catch {
        msg = "Suggestion enregistrée, mais l'envoi a échoué. Réessayez plus tard.";
      } finally {
        btn.disabled = false;
      }
    }
    dlg.close();
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
})();
