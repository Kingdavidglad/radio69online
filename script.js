/* Rádió69 modern weboldal – csatornák és űrlapok beállítása a fájl elején módosítható. */
const RADIO_CONFIG = {
  // A két csatorna külön mountponton érhető el ugyanazon a streamkiszolgálón.
  streams: {
    remix: "https://s03.diazol.hu:7162/stream",
    hits: "https://s03.diazol.hu:7162/teszt"
  },
  // Icecast 2.4.4 JSON-statisztika: mindkét mount adata egy válaszban érkezik.
  statsUrl: "https://zmejdydtgxotkscluqlo.supabase.co/functions/v1/radio-stats",
  mounts: { remix: "/stream", hits: "/teszt" },
  statsRefreshMs: 5000,
  requestEmail: "info@radio69.hu"
};

const schedule = [
  [
    ["07:00", "Vekker", "Műsorvezető: Frenkl András"],
    ["10:00", "Delelő – A délelőtt hangja", ""],
    ["12:00", "Délutáni Lazító", "Kapcsolj ki, mi bekapcsolunk."],
    ["15:00", "Zene Doboz", "Műsorvezető: Szabolcsi Dávid"],
    ["18:00", "Back in Time (Vissza az időben) 1970–2022", "Műsorvezető: Balu"],
    ["20:00", "NightMix (ismétlés)", "Műsorvezető: Frenkl András"]
  ],
  [
    ["07:00", "Vekker", "Műsorvezető: Frenkl András"],
    ["10:00", "Delelő – A délelőtt hangja", ""],
    ["12:00", "Délutáni Lazító", "Kapcsolj ki, mi bekapcsolunk."],
    ["15:00", "Retró körút (ismétlés)", "Műsorvezető: Dombi Ákos"],
    ["18:00", "MagyarOK", ""],
    ["20:00", "ClubChart (ismétlés)", "Műsorvezető: Frenkl András"]
  ],
  [
    ["07:00", "Vekker", "Műsorvezető: Frenkl András"],
    ["10:00", "Delelő – A délelőtt hangja", ""],
    ["12:00", "Délutáni Lazító", "Kapcsolj ki, mi bekapcsolunk."],
    ["15:00", "Kangoo Jam (ismétlés)", ""],
    ["18:00", "Begurulva – Autó és kütyümustra", "Műsorvezető: Berta István"],
    ["20:00", "Zene Doboz (ismétlés)", "Műsorvezető: Szabolcsi Dávid"]
  ],
  [
    ["07:00", "Vekker", "Műsorvezető: Frenkl András"],
    ["10:00", "Delelő – A délelőtt hangja", ""],
    ["12:00", "Délutáni Lazító", "Kapcsolj ki, mi bekapcsolunk."],
    ["15:00", "MagyarOK (ismétlés)", ""],
    ["18:00", "Retró körút", "Műsorvezető: Dombi Ákos"],
    ["20:00", "Back in Time (ismétlés)", "Műsorvezető: Balu"]
  ],
  [
    ["07:00", "Vekker", "Műsorvezető: Frenkl András"],
    ["10:00", "Delelő – A délelőtt hangja", ""],
    ["12:00", "Délutáni Lazító", "Kapcsolj ki, mi bekapcsolunk."],
    ["15:00", "Magyar Top 40 (ismétlés)", "Műsorvezető: Szabolcsi Dávid (Dave)"],
    ["18:00", "Zsiványok Podcast", "Október 1. és május 31. között • Műsorvezető: Szabolcsi Dávid (Dave)"],
    ["21:00", "NightMix", "Műsorvezető: Frenkl András"]
  ],
  [
    ["07:00", "Vekker", "Műsorvezető: Frenkl András"],
    ["10:00", "Delelő – A délelőtt hangja", ""],
    ["12:00", "Délutáni Lazító", "Kapcsolj ki, mi bekapcsolunk."],
    ["12:00", "Hangposta – Kívánság műsor", ""],
    ["16:00", "DJ Sáv", "A Rádió69 DJ-i veszik át az irányítást energikus mixekkel."]
  ],
  [
    ["07:00", "Vekker", "Műsorvezető: Frenkl András"],
    ["10:00", "Delelő – A délelőtt hangja", ""],
    ["12:00", "Délutáni Lazító", "Kapcsolj ki, mi bekapcsolunk."],
    ["12:00", "Magyar Top 40", "Műsorvezető: Szabolcsi Dávid (Dave)"],
    ["16:00", "DJ Sáv", "A Rádió69 DJ-i veszik át az irányítást energikus mixekkel."],
    ["18:00", "ClubChart", "Műsorvezető: Frenkl András"],
    ["19:00", "Zsiványok Podcast (ismétlés)", "Október 1. és május 31. között • Műsorvezető: Szabolcsi Dávid (Dave)"],
    ["20:00", "Kangoo Jam", ""]
  ]
];
const dayNames = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
const audio = document.getElementById("radioAudio");
const playButton = document.getElementById("playButton");
const playIcon = document.getElementById("playIcon");
const statusText = document.getElementById("playerStatus");
const stateText = document.getElementById("playState");
let selectedChannel = "remix";
let toastTimer;
let playRequestId = 0;

function notify(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3300);
}

function getStreamUrl(channel) {
  const stream = RADIO_CONFIG.streams[channel];
  return stream ? new URL(stream, document.baseURI).href : "";
}

function loadChannelSource(channel) {
  const nextUrl = getStreamUrl(channel);
  if (!nextUrl) return false;

  // Csatornaváltáskor teljesen ürítjük az előző forrást, így a böngésző
  // nem tarthatja életben vagy használhatja újra az előző stream pufferét.
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  audio.setAttribute("src", nextUrl);
  audio.load();
  return true;
}

function updateChannelUi(channel) {
  const isHits = channel === "hits";
  document.querySelectorAll(".channel-tab").forEach((button) => {
    const active = button.dataset.channel === channel;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.getElementById("channelTitle").innerHTML = `<img class="channel-brand-logo" src="assets/radio69-horizontal.png" alt="Rádió69"> <em>${isHits ? "Hits" : "Remix"}</em>`;
  document.getElementById("channelDescription").textContent = isHits
    ? "A 80-as évektől napjainkig – slágerek és kedvencek."
    : "Pörgős remixek, klubhangulat és kedvenc slágerek.";
  stateText.textContent = isHits ? "Rádió69 Hits kiválasztva" : "Rádió69 Remix kiválasztva";
  updateLiveDataUi();
  statusText.textContent = "Nyomd meg a lejátszást az élő adáshoz!";
  playIcon.textContent = "▶";
  playButton.setAttribute("aria-label", "Lejátszás");
}

async function selectChannel(channel, { autoplay = false } = {}) {
  if (!Object.prototype.hasOwnProperty.call(RADIO_CONFIG.streams, channel)) return;

  const channelChanged = channel !== selectedChannel;
  const wasPlaying = !audio.paused && !audio.ended;
  selectedChannel = channel;
  updateChannelUi(channel);

  if (channelChanged) {
    // Érvénytelenítjük az előző, még folyamatban lévő play() hívást.
    playRequestId += 1;
    if (!loadChannelSource(channel)) {
      statusText.textContent = "Ehhez a csatornához nincs streamcím beállítva.";
      return;
    }
  }

  // Ha a hallgató éppen rádiót hallgatott, csatornaváltáskor az új adás
  // automatikusan induljon el, ne maradjon a lejátszó némán megállítva.
  if (channelChanged && (wasPlaying || autoplay)) {
    await startRadio();
  } else if (!channelChanged && autoplay && audio.paused) {
    await startRadio();
  }
}

document.querySelectorAll(".channel-tab").forEach((button) => {
  button.addEventListener("click", () => selectChannel(button.dataset.channel));
});

async function startRadio() {
  const stream = getStreamUrl(selectedChannel);
  if (!stream) {
    statusText.textContent = "Ehhez a csatornához nincs beállítva közvetlen streamcím.";
    notify("A kiválasztott csatorna streamcímét be kell állítani.");
    return;
  }

  // Ha a kiválasztott csatornához tartozó cím nincs betöltve, frissítjük.
  if (audio.getAttribute("src") !== stream) {
    if (!loadChannelSource(selectedChannel)) return;
  }

  const requestId = ++playRequestId;
  stateText.textContent = "Kapcsolódás…";
  statusText.textContent = `Kapcsolódás a Rádió69 ${selectedChannel === "hits" ? "Hits" : "Remix"} adásához…`;
  try {
    await audio.play();
    if (requestId !== playRequestId) return;
    playIcon.textContent = "Ⅱ";
    playButton.setAttribute("aria-label", "Szüneteltetés");
    stateText.textContent = "Most szól a Rádió69";
    statusText.textContent = `${selectedChannel === "hits" ? "Hits" : "Remix"} • Élő adás`;
  } catch (error) {
    if (requestId !== playRequestId) return;

    // A böngészők bizonyos esetekben blokkolják a hangos automatikus lejátszást.
    // Ilyenkor a Remix marad kiválasztva, és a meglévő Lejátszás gombbal indítható.
    if (error && error.name === "NotAllowedError") {
      playIcon.textContent = "▶";
      playButton.setAttribute("aria-label", "Remix lejátszásának indítása");
      stateText.textContent = "Rádió69 Remix kiválasztva";
      statusText.textContent = "A böngésző blokkolta az automatikus hangindítást. Kattints a ▶ gombra a Remix elindításához!";
      return;
    }

    stateText.textContent = "A lejátszás nem indult el";
    statusText.textContent = "Ellenőrizd a kiválasztott csatorna streamcímét.";
    notify("A stream nem indult el. Ellenőrizni kell a csatorna streamcímét és a HTTPS-kapcsolatot.");
  }
}

playButton.addEventListener("click", () => {
  if (audio.paused) startRadio();
  else {
    playRequestId += 1;
    audio.pause();
    playIcon.textContent = "▶";
    playButton.setAttribute("aria-label", "Lejátszás");
    stateText.textContent = "Lejátszás szüneteltetve";
    statusText.textContent = "Nyomd meg a gombot a folytatáshoz!";
  }
});

audio.addEventListener("playing", () => {
  playIcon.textContent = "Ⅱ";
  playButton.setAttribute("aria-label", "Szüneteltetés");
  stateText.textContent = "Most szól a Rádió69";
  statusText.textContent = `${selectedChannel === "hits" ? "Hits" : "Remix"} • Élő adás`;
});

audio.addEventListener("error", () => {
  stateText.textContent = `${selectedChannel === "hits" ? "Hits" : "Remix"} stream nem érhető el`;
  statusText.textContent = "Ellenőrizd a kiválasztott csatorna stream URL-jét.";
  playIcon.textContent = "▶";
  playButton.setAttribute("aria-label", "Lejátszás");
});

document.getElementById("volumeSlider").addEventListener("input", (event) => {
  audio.volume = Number(event.target.value);
});
audio.volume = 0.8;

// Élő Icecast metaadatok: zenecím, előadó és csatornánkénti hallgatószám.
// A stats végpont külön HTTP-kérés; a stream lejátszása ettől független marad.
const liveChannelStats = { remix: null, hits: null };
let liveStatsError = false;
let liveStatsErrorMessage = "";

function normalizeIcecastSources(payload) {
  const source = payload?.icestats?.source;
  if (!source) return [];
  return Array.isArray(source) ? source : [source];
}

function getIcecastMountPath(source) {
  const raw = source?.listenurl || source?.listen_url || source?.mount || "";
  if (!raw) return "";
  try {
    return new URL(String(raw), RADIO_CONFIG.statsUrl).pathname.replace(/\/$/, "") || "/";
  } catch {
    return String(raw).split("?")[0].replace(/\/$/, "");
  }
}

function splitTrackTitle(rawTitle) {
  const separators = [" – ", " — ", " - "];
  let splitAt = -1;
  let splitLength = 0;
  for (const separator of separators) {
    const index = rawTitle.lastIndexOf(separator);
    if (index > splitAt) {
      splitAt = index;
      splitLength = separator.length;
    }
  }
  if (splitAt > 0 && splitAt + splitLength < rawTitle.length) {
    return {
      artist: rawTitle.slice(0, splitAt).trim(),
      title: rawTitle.slice(splitAt + splitLength).trim()
    };
  }
  return { artist: "Rádió69 • élő adás", title: rawTitle };
}

function getSourceMetadata(source) {
  if (!source) return { title: "A csatorna adata jelenleg nem érhető el", artist: "A stream nem adott vissza adatot." };

  // A Remixnél az Edge Function a mobilalkalmazásban már bevált /autodj metaadatot
  // illeszti a 7162-es /stream statisztikájához. Az eredeti metaadat is megmarad.
  const rawTitle = String(source.raw_title || source.yp_currently_playing || source.stream_title || source.title || source.song || "").trim();
  const explicitArtist = String(source.artist || "").trim();
  const explicitTitle = String(source.track_title || source.title || "").trim();
  if (explicitTitle && explicitArtist) return { title: explicitTitle, artist: explicitArtist };
  if (rawTitle) {
    const parsed = splitTrackTitle(rawTitle);
    return {
      title: explicitTitle || parsed.title,
      artist: explicitArtist || parsed.artist
    };
  }
  if (explicitArtist) return { title: explicitArtist, artist: "A zeneszám címe nem érkezett meg." };
  return { title: "A stream jelenleg nem küld zenecímet", artist: "A zene szól, de a metaadat hiányzik." };
}

function updateLiveDataUi() {
  const current = liveChannelStats[selectedChannel];
  const title = document.getElementById("nowPlayingTitle");
  const artist = document.getElementById("nowPlayingArtist");
  const metadataStatus = document.getElementById("metadataStatus");
  const remixCount = document.getElementById("remixListenerCount");
  const hitsCount = document.getElementById("hitsListenerCount");

  [ ["remix", remixCount], ["hits", hitsCount] ].forEach(([channel, element]) => {
    const data = liveChannelStats[channel];
    element.textContent = data && Number.isFinite(data.listeners) ? String(data.listeners) : "—";
    element.parentElement.classList.toggle("is-unavailable", !data || !Number.isFinite(data.listeners));
  });

  if (current) {
    const metadata = getSourceMetadata(current);
    title.textContent = metadata.title;
    artist.textContent = metadata.artist;
    metadataStatus.textContent = liveStatsError ? "UTOLSÓ ELÉRHETŐ ADAT" : "ÉLŐ ADAT";
    metadataStatus.classList.toggle("is-error", liveStatsError);
  } else if (liveStatsError) {
    title.textContent = "A rádiós adatok nem olvashatók";
    artist.textContent = liveStatsErrorMessage || "A stream továbbra is működhet; a statisztikai hozzáférést ellenőrizni kell.";
    metadataStatus.textContent = "ADATKAPCSOLATI HIBA";
    metadataStatus.classList.add("is-error");
  } else {
    title.textContent = "Kapcsolódás a rádióhoz…";
    artist.textContent = selectedChannel === "hits" ? "Rádió69 Hits • élő adatok betöltése" : "Rádió69 Remix • élő adatok betöltése";
    metadataStatus.textContent = "ADATOK BETÖLTÉSE";
    metadataStatus.classList.remove("is-error");
  }
}

async function refreshLiveRadioStats() {
  if (document.visibilityState === "hidden") return;
  const endpoint = RADIO_CONFIG.statsUrl;
  if (!endpoint) return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);
  try {
    // A Supabase Edge Function hívásához a projekt publikus kulcsát
    // apikey fejlécben kell elküldeni. Az sb_publishable_ kulcs NEM JWT,
    // ezért nem szabad Authorization: Bearer fejlécbe tenni.
    const supabaseConfig = window.RADIO69_SUPABASE_CONFIG || {};
    const publishableKey = String(supabaseConfig.publishableKey || supabaseConfig.anonKey || "").trim();
    if (!publishableKey) throw new Error("Hiányzik a Supabase publishable key a supabase-config.js fájlból.");

    const separator = endpoint.includes("?") ? "&" : "?";
    const response = await fetch(`${endpoint}${separator}_=${Date.now()}`, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      credentials: "omit",
      headers: {
        Accept: "application/json",
        apikey: publishableKey
      },
      signal: controller.signal
    });
    if (!response.ok) {
      let details = "";
      try {
        const errorPayload = await response.json();
        details = String(errorPayload.message || errorPayload.msg || errorPayload.error || errorPayload.code || "").trim();
      } catch { /* a válasz nem JSON */ }
      throw new Error(`Supabase radio-stats HTTP ${response.status}${details ? ` – ${details}` : ""}`);
    }
    const payload = await response.json();
    const sources = normalizeIcecastSources(payload);
    if (!sources.length) throw new Error("Az Icecast válaszában nem található aktív forrás.");

    const nextStats = { remix: null, hits: null };
    for (const [channel, mount] of Object.entries(RADIO_CONFIG.mounts)) {
      const source = sources.find((item) => getIcecastMountPath(item) === mount);
      if (!source) continue;
      const listenerNumber = Number(source.listeners);
      nextStats[channel] = {
        title: source.title || "",
        artist: source.artist || "",
        listeners: Number.isFinite(listenerNumber) && source.listeners !== undefined && source.listeners !== null ? listenerNumber : null
      };
    }

    liveChannelStats.remix = nextStats.remix;
    liveChannelStats.hits = nextStats.hits;
    liveStatsError = false;
    liveStatsErrorMessage = "";
    updateLiveDataUi();
  } catch (error) {
    liveStatsError = true;
    const detail = error instanceof Error ? error.message : String(error);
    console.warn("Rádió69 élő statisztika nem érhető el:", error);
    if (/HTTP 401|HTTP 403/i.test(detail)) {
      liveStatsErrorMessage = "A Supabase elutasította a kérést. Ellenőrizd a radio-stats függvény JWT-ellenőrzését és a publikus kulcsot.";
    } else if (/HTTP 502|Icecast stats unavailable/i.test(detail)) {
      liveStatsErrorMessage = "A Supabase proxy elérhető, de a rádiós Icecast-statisztika nem válaszolt.";
    } else if (/publishable key/i.test(detail)) {
      liveStatsErrorMessage = "A Supabase publikus kulcsa hiányzik a weboldal beállításaiból.";
    } else {
      liveStatsErrorMessage = "A státuszlekérés sikertelen. A böngésző fejlesztői konzoljában látható a pontos hiba.";
    }
    updateLiveDataUi();
  } finally {
    clearTimeout(timeoutId);
  }
}

refreshLiveRadioStats();
setInterval(refreshLiveRadioStats, RADIO_CONFIG.statsRefreshMs || 30000);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") refreshLiveRadioStats();
});

audio.volume = 0.8;

document.querySelectorAll("[data-play-channel]").forEach((button) => {
  button.addEventListener("click", () => {
    const channel = button.dataset.playChannel;
    selectChannel(channel, { autoplay: true });
    document.getElementById("elo").scrollIntoView({ behavior: "smooth" });
  });
});

function renderSchedule(index) {
  const list = document.getElementById("scheduleList");
  document.getElementById("scheduleDayTitle").textContent = `${dayNames[index]}i műsoraink`;
  list.innerHTML = schedule[index].map(([time, title, detail]) => `
    <div class="schedule-item"><span class="schedule-time">${time}</span><div><div class="schedule-name">${title}</div>${detail ? `<div class="schedule-detail">${detail}</div>` : ""}</div></div>
  `).join("");
  document.querySelectorAll(".day-tab").forEach((button) => {
    const active = Number(button.dataset.day) === index;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}
document.querySelectorAll(".day-tab").forEach((button) => button.addEventListener("click", () => renderSchedule(Number(button.dataset.day))));
const today = (new Date().getDay() + 6) % 7;
renderSchedule(today);

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

function setFormFeedback(elementId, message, kind = "") {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.classList.remove("is-success", "is-error");
  if (kind) element.classList.add(kind);
}

function getSupabaseConfig() {
  const config = window.RADIO69_SUPABASE_CONFIG || {};
  const url = String(config.url || "").trim().replace(/\/+$/, "");
  const key = String(config.anonKey || config.publishableKey || "").trim();
  if (!url || !key || /YOUR[-_ ]|PASTE[-_ ]/i.test(url + key)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { url, key };
}

async function sendToRadioInbox(payload) {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("A webes üzenetküldéshez még be kell állítani a Supabase projekt URL-jét és publikus kulcsát a supabase-config.js fájlban.");
  }

  const headers = {
    apikey: config.key,
    "Content-Type": "application/json",
    Prefer: "return=minimal"
  };
  // A régebbi anon JWT kulcs Authorization fejlécet is használ. Az új,
  // sb_publishable_ formátumú publikus kulcsot kizárólag apikey-ként küldjük.
  if (config.key.split(".").length === 3) {
    headers.Authorization = `Bearer ${config.key}`;
  }

  const response = await fetch(`${config.url}/rest/v1/radio69_messages`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let details = "";
    try { details = await response.text(); } catch { /* nincs olvasható válasz */ }
    console.error("Rádió69 Supabase beküldési hiba:", response.status, details);
    if (response.status === 401 || response.status === 403) {
      throw new Error("A szerver elutasította a beküldést. Ellenőrizd a Supabase kulcsot és az adatbázis jogosultságait.");
    }
    if (response.status === 404) {
      throw new Error("Az üzenettáblát még nem hoztuk létre a Supabase adatbázisban.");
    }
    throw new Error("Most nem sikerült elküldeni az üzenetet. Kérjük, próbáld meg később.");
  }
}

function isLikelySpam(form, honeypotId) {
  const trap = document.getElementById(honeypotId);
  const openedAt = Number(form.dataset.openedAt || 0);
  return Boolean(trap && trap.value.trim()) || (openedAt > 0 && Date.now() - openedAt < 1800);
}

function prepareForm(form) {
  form.dataset.openedAt = String(Date.now());
}

const wishForm = document.getElementById("wishForm");
const contactForm = document.getElementById("contactForm");
prepareForm(wishForm);
prepareForm(contactForm);

wishForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!wishForm.reportValidity()) return;
  if (isLikelySpam(wishForm, "wishWebsite")) {
    wishForm.reset();
    prepareForm(wishForm);
    return;
  }

  const submitButton = wishForm.querySelector('button[type="submit"]');
  const originalLabel = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.textContent = "Küldés…";
  setFormFeedback("wishFeedback", "A kívánságodat továbbítjuk a Rádió69-nek…");

  try {
    await sendToRadioInbox({
      message_type: "music_request",
      name: document.getElementById("wishName").value.trim(),
      song: document.getElementById("wishSong").value.trim()
    });
    wishForm.reset();
    prepareForm(wishForm);
    setFormFeedback("wishFeedback", "Köszönjük! A zenei kívánságod sikeresen megérkezett a Rádió69-hez.", "is-success");
  } catch (error) {
    setFormFeedback("wishFeedback", error.message || "Nem sikerült elküldeni a kívánságot.", "is-error");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalLabel;
  }
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  if (isLikelySpam(contactForm, "contactWebsite")) {
    contactForm.reset();
    prepareForm(contactForm);
    return;
  }

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalLabel = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.textContent = "Küldés…";
  setFormFeedback("contactFeedback", "Az üzenetedet továbbítjuk a Rádió69-nek…");

  try {
    await sendToRadioInbox({
      message_type: "contact",
      name: document.getElementById("contactName").value.trim(),
      email: document.getElementById("contactEmail").value.trim(),
      message: document.getElementById("contactMessage").value.trim()
    });
    contactForm.reset();
    prepareForm(contactForm);
    setFormFeedback("contactFeedback", "Köszönjük! Az üzeneted sikeresen megérkezett a Rádió69-hez.", "is-success");
  } catch (error) {
    setFormFeedback("contactFeedback", error.message || "Nem sikerült elküldeni az üzenetet.", "is-error");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalLabel;
  }
});

document.getElementById("copyAccount").addEventListener("click", async () => {
  const account = "53500841-10044685";
  try {
    await navigator.clipboard.writeText(account);
    notify("A bankszámlaszám a vágólapra került.");
  } catch (error) {
    notify(`Bankszámlaszám: ${account}`);
  }
});
document.getElementById("year").textContent = new Date().getFullYear();

// Magyar / angol nyelvválasztó. A választás a böngészőben megmarad.
const RADIO69_I18N = {
  en: {
    "Rádió69 – A múlt és a jelen egy helyen!": "Rádió69 – The past and the present in one place!",
    "A MÚLT ÉS A JELEN EGY HELYEN": "THE PAST AND THE PRESENT IN ONE PLACE",
    "Élő rádió": "Live Radio",
    "Műsoraink": "Our Shows",
    "Műsorvezetők": "Presenters",
    "Kívánságdoboz": "Music Requests",
    "Partnerek": "Partners",
    "Támogatás": "Support",
    "Kapcsolat": "Contact",
    "Hallgasd élőben": "Listen Live",
    "ONLINE RÁDIÓ • BÉKÉS VÁRMEGYE": "ONLINE RADIO • BÉKÉS COUNTY",
    "BÉKÉS VÁRMEGYE": "BÉKÉS COUNTY",
    "DJ Sáv": "DJ Set",
    "Nyelvválasztó": "Language selection",
    "Magyar": "Hungarian",
    "Digitális rádióstúdió hangkeverőpulttal és élő hanghullámmal": "Digital radio studio with an audio mixing console and live sound wave",
    "Rádió69 online rádió – Remix, Hits és zenei műsorok": "Rádió69 online radio – Remix, Hits and music shows",
    "A jó zene": "Good music",
    "összeköt.": "brings us together.",
    "A múlt és a jelen egy helyen! Kapcsold be a Rádió69-et, és legyen mindig veled a kedvenc zenéd.": "The past and the present in one place! Tune in to Rádió69 and take your favourite music with you, wherever you go.",
    "Remix és Hits": "Remix & Hits",
    "Két csatorna, rengeteg kedvenc": "Two channels, countless favourites",
    "Non-stop zene": "Non-stop music",
    "Veled otthon és útközben is": "With you at home and on the go",
    "MOST IS SZÓLUNK": "WE'RE ON AIR",
    "Válaszd ki a": "Choose your",
    "hangulatod!": "vibe!",
    "Két csatorna. Egy rádió. Végtelen zene.": "Two channels. One radio. Endless music.",
    "ÉLŐ RÁDIÓ": "LIVE RADIO",
    "Pörgős remixek, klubhangulat és kedvenc slágerek.": "Energetic remixes, club vibes and your favourite hits.",
    "Slágerek • Kedvencek": "Hits • Favourites",
    "MOST SZÓL": "NOW PLAYING",
    "Adatok betöltése…": "Loading data…",
    "Kapcsolódás a rádióhoz…": "Connecting to the radio…",
    "A zeneszám adatai hamarosan megjelennek.": "Track information will appear here shortly.",
    "hallgató": "listeners",
    "Készen állsz?": "Ready?",
    "Válassz csatornát, majd nyomd meg a lejátszást!": "Choose a channel, then press play!",
    "Hangerő": "Volume",
    "A lejátszás automatikusan megpróbál elindulni. Ha a böngésző blokkolja, használd a lejátszás gombot.": "Playback will try to start automatically. If your browser blocks it, press the play button.",
    "A lejátszás a gomb megnyomása után indul. Ha a stream címe megváltozott, a konfigurációban frissíthető.": "Playback will try to start automatically. If your browser blocks it, use the play button. The stream address can be updated in the configuration.",
    "NON-STOP HANGULAT": "NON-STOP VIBES",
    "Mindig találsz": "There's always",
    "egy jó számot.": "a great song waiting.",
    "A 80-as évektől napjainkig, magyar és külföldi kedvencek.": "From the 1980s to today, with Hungarian and international favourites.",
    "A RÁDIÓ VELED VAN": "THE RADIO GOES WITH YOU",
    "Otthon. Útközben.": "At home. On the go.",
    "Munka közben.": "At work.",
    "Fedezd fel a műsorokat": "Explore our shows",
    "MINDEN NAPRA EGY JÓ HANGULAT": "A GOOD VIBE FOR EVERY DAY",
    "Mi szól a": "What's playing on",
    "Rádió69-en?": "Rádió69?",
    "Ismerd meg műsorainkat, és találd meg a kedvencedet a heti kínálatban!": "Discover our shows and find your favourites in the weekly schedule!",
    "A LEGJOBB SLÁGEREK": "THE BEST HITS",
    "Csak zene! Csak a legjobbak! A 80-as évektől napjainkig, éjjel-nappal.": "Music only! The very best, from the 1980s to today, day and night.",
    "Hallgatom": "Listen",
    "PÖRGŐS ÜTEMEK": "UPBEAT RHYTHMS",
    "Klubhangulat, friss remixek és táncolható kedvencek – folyamatosan.": "Club vibes, fresh remixes and dancefloor favourites – around the clock.",
    "A DJ-K VESZIK ÁT AZ IRÁNYÍTÁST": "THE DJS TAKE OVER",
    "Pörgős mixek és energikus zenei blokkok a Rádió69 DJ-itől.": "Up-tempo mixes and energetic music sessions from the Rádió69 DJs.",
    "Mikor hallható?": "When can you hear it?",
    "HETI PROGRAM": "WEEKLY SCHEDULE",
    "Heti": "Weekly",
    "műsorrend": "schedule",
    "Válaszd ki a napot!": "Choose a day!",
    "Hétfő": "Monday",
    "Kedd": "Tuesday",
    "Szerda": "Wednesday",
    "Csütörtök": "Thursday",
    "Péntek": "Friday",
    "Szombat": "Saturday",
    "Vasárnap": "Sunday",
    "Hétfői műsoraink": "Monday's shows",
    "Keddi műsoraink": "Tuesday's shows",
    "Szerdai műsoraink": "Wednesday's shows",
    "Csütörtöki műsoraink": "Thursday's shows",
    "Pénteki műsoraink": "Friday's shows",
    "Szombati műsoraink": "Saturday's shows",
    "Vasárnapi műsoraink": "Sunday's shows",
    "A műsorrend tájékoztató jellegű; az esetleges változásokról a Rádió69 felületein adunk hírt.": "The schedule is for guidance only. Any changes will be announced on Rádió69's channels.",
    "AKIK A HANGULATOT HOZZÁK": "THE PEOPLE BEHIND THE VIBE",
    "Ismerd meg a": "Meet the",
    "csapatot!": "team!",
    "Műsorvezetők és DJ-k, akik gondoskodnak róla, hogy mindig legyen mit hallgatnod.": "Meet the presenters and DJs who make sure there's always something great to listen to.",
    "MŰSORVEZETŐK": "PRESENTERS",
    "MŰSORVEZETŐ": "PRESENTER",
    "Műsorvezető": "Presenter",
    "Műsorvezető • Zene Doboz • Magyar TOP40": "Presenter • Zene Doboz • Hungarian TOP 40",
    "Műsorvezető • Back in Time": "Presenter • Back in Time",
    "Műsorvezető: Frenkl András": "Hosted by: Frenkl András",
    "Műsorvezető: Szabolcsi Dávid": "Hosted by: Szabolcsi Dávid",
    "Műsorvezető: Dombi Ákos": "Hosted by: Dombi Ákos",
    "Műsorvezető: Berta István": "Hosted by: Berta István",
    "Műsorvezető: Balu": "Hosted by: Balu",
    "Kapcsolj ki, mi bekapcsolunk.": "Switch off and let us switch you on.",
    "Október 1. és május 31. között • Műsorvezető: Szabolcsi Dávid (Dave)": "October 1 to May 31 • Hosted by: Szabolcsi Dávid (Dave)",
    "A Rádió69 DJ-i veszik át az irányítást energikus mixekkel.": "The Rádió69 DJs take over with energetic mixes.",
    "Back in Time (Vissza az időben) 1970–2022": "Back in Time 1970–2022",
    "DJ-K": "DJS",
    "TE MONDOD, MI LEJÁTSZUK!": "YOU REQUEST IT, WE PLAY IT!",
    "Küldd el a": "Send us your",
    "kívánságod!": "request!",
    "Van egy kedvenc számod? Írd meg nekünk, és lehet, hogy hamarosan a Rádió69-en hallhatod viszont!": "Have a favourite song? Send it to us and you might hear it on Rádió69 soon!",
    "Neved": "Your name",
    "A kért szám címe": "Requested song title",
    "Weboldal": "Website",
    "Kívánság küldése": "Send request",
    "Küldd el online a zenei kívánságodat!": "Send us your music request online!",
    "EGYÜTT HANGOSABB": "LOUDER TOGETHER",
    "Partnereink": "Our Partners",
    "Örülünk minden együttműködésnek! Partneri megkereséseket a lenti e-mail-címen várunk.": "We welcome every partnership! For business enquiries, contact us at the email address below.",
    "RENDEZVÉNY DJ": "EVENT DJ",
    "Legyél te is partnerünk!": "Become our partner!",
    "Írj nekünk:": "Write to us:",
    "KÖSZÖNJÜK, HOGY VELÜNK VAGY!": "THANK YOU FOR BEING WITH US!",
    "Támogasd a": "Support",
    "Rádió69-et!": "Rádió69!",
    "Köszönjük, hogy támogatod rádiónkat, így még jobb műsorokat és zenei élményeket hozhatunk!": "Thank you for supporting our radio station. Your support helps us bring you even better shows and music experiences!",
    "BANKI ÁTUTALÁS": "BANK TRANSFER",
    "Közlemény: Támogatás": "Reference: Support",
    "Számlaszám másolása ⧉": "Copy account number ⧉",
    "LÉPJ VELÜNK KAPCSOLATBA": "GET IN TOUCH",
    "Van egy jó": "Got a great",
    "ötleted?": "idea?",
    "Kérdésed van, együttműködnél velünk, vagy csak üzennél? Írj nekünk bátran!": "Have a question, want to work with us, or just want to say hello? Drop us a message!",
    "TELEFON": "PHONE",
    "ÁLTALÁNOS INFORMÁCIÓ": "GENERAL ENQUIRIES",
    "KÖZVETLEN E-MAIL": "DIRECT EMAIL",
    "PARTNERI MEGKERESÉS": "PARTNERSHIPS",
    "RÁDIÓ VEZETŐ / TULAJDONOS": "RADIO MANAGER / OWNER",
    "Írj nekünk!": "Send us a message!",
    "Várjuk az üzenetedet.": "We look forward to hearing from you.",
    "E-mail címed": "Your email address",
    "Üzeneted": "Your message",
    "Üzenet küldése": "Send message",
    "Az üzeneted közvetlenül a Rádió69-hez érkezik.": "Your message will be sent directly to Rádió69.",
    "Jó zenék. Jó hangulat. Rádió69.": "Great music. Great vibes. Rádió69.",
    "Vissza az oldal tetejére ↑": "Back to top ↑",
    "Rádió69. Minden jog fenntartva.": "Rádió69. All rights reserved.",
    "A csatorna adata jelenleg nem érhető el": "Channel information is currently unavailable",
    "A stream nem adott vissza adatot.": "The stream did not return any data.",
    "A zeneszám címe nem érkezett meg.": "The track title was not provided.",
    "A stream jelenleg nem küld zenecímet": "The stream is not currently sending track information",
    "A zene szól, de a metaadat hiányzik.": "The music is playing, but track metadata is unavailable.",
    "UTOLSÓ ELÉRHETŐ ADAT": "LAST AVAILABLE DATA",
    "ÉLŐ ADAT": "LIVE DATA",
    "A rádiós adatok nem olvashatók": "Radio data could not be read",
    "A stream továbbra is működhet; a statisztikai hozzáférést ellenőrizni kell.": "The stream may still be working; access to the statistics needs to be checked.",
    "ADATKAPCSOLATI HIBA": "DATA CONNECTION ERROR",
    "Kapcsolódás a rádióhoz…": "Connecting to the radio…",
    "Rádió69 Hits • élő adatok betöltése": "Rádió69 Hits • loading live data",
    "Rádió69 Remix • élő adatok betöltése": "Rádió69 Remix • loading live data",
    "ADATOK BETÖLTÉSE": "LOADING DATA",
    "Lejátszás": "Play",
    "Szüneteltetés": "Pause",
    "Remix lejátszásának indítása": "Start Remix playback",
    "Rádió69 Remix kiválasztva": "Rádió69 Remix selected",
    "Rádió69 Hits kiválasztva": "Rádió69 Hits selected",
    "Nyomd meg a lejátszást az élő adáshoz!": "Press play to listen live!",
    "Ehhez a csatornához nincs streamcím beállítva.": "No stream URL is configured for this channel.",
    "A kiválasztott csatorna streamcímét be kell állítani.": "The selected channel's stream URL needs to be configured.",
    "Ehhez a csatornához nincs beállítva közvetlen streamcím.": "No direct stream URL is configured for this channel.",
    "Kapcsolódás…": "Connecting…",
    "Most szól a Rádió69": "Rádió69 is now playing",
    "Remix • Élő adás": "Remix • Live",
    "Hits • Élő adás": "Hits • Live",
    "A böngésző blokkolta az automatikus hangindítást. Kattints a ▶ gombra a Remix elindításához!": "Your browser blocked autoplay. Click the ▶ button to start the Remix stream.",
    "Ellenőrizd a kiválasztott csatorna streamcímét.": "Check the stream URL for the selected channel.",
    "A lejátszás nem indult el": "Playback did not start",
    "Ellenőrizd a kiválasztott csatorna stream URL-jét.": "Check the stream URL for the selected channel.",
    "A stream nem indult el. Ellenőrizni kell a csatorna streamcímét és a HTTPS-kapcsolatot.": "The stream did not start. Check the channel stream URL and HTTPS connection.",
    "Lejátszás szüneteltetve": "Playback paused",
    "Nyomd meg a gombot a folytatáshoz!": "Press the button to resume playback!",
    "A kiválasztott csatorna stream URL-jét.": "the selected channel's stream URL.",
    "A Supabase elutasította a kérést. Ellenőrizd a radio-stats függvény JWT-ellenőrzését és a publikus kulcsot.": "Supabase rejected the request. Check JWT verification and the public key for the radio-stats function.",
    "A Supabase proxy elérhető, de a rádiós Icecast-statisztika nem válaszolt.": "The Supabase proxy is available, but the radio Icecast statistics did not respond.",
    "A Supabase publikus kulcsa hiányzik a weboldal beállításaiból.": "The Supabase public key is missing from the website configuration.",
    "A státuszlekérés sikertelen. A böngésző fejlesztői konzoljában látható a pontos hiba.": "The status request failed. See the browser developer console for details.",
    "Hiányzik a Supabase publishable key a supabase-config.js fájlból.": "The Supabase publishable key is missing from supabase-config.js.",
    "A webes üzenetküldéshez még be kell állítani a Supabase projekt URL-jét és publikus kulcsát a supabase-config.js fájlban.": "To send messages from the website, configure the Supabase project URL and public key in supabase-config.js.",
    "A szerver elutasította a beküldést. Ellenőrizd a Supabase kulcsot és az adatbázis jogosultságait.": "The server rejected the submission. Check the Supabase key and database permissions.",
    "Az üzenettáblát még nem hoztuk létre a Supabase adatbázisban.": "The messages table has not yet been created in the Supabase database.",
    "Most nem sikerült elküldeni az üzenetet. Kérjük, próbáld meg később.": "Your message could not be sent right now. Please try again later.",
    "Nem sikerült elküldeni a kívánságot.": "The request could not be sent.",
    "Nem sikerült elküldeni az üzenetet.": "The message could not be sent.",
    "Küldés…": "Sending…",
    "A kívánságodat továbbítjuk a Rádió69-nek…": "Your music request is being sent to Rádió69…",
    "Köszönjük! A zenei kívánságod sikeresen megérkezett a Rádió69-hez.": "Thank you! Your music request has been received by Rádió69.",
    "Az üzenetedet továbbítjuk a Rádió69-nek…": "Your message is being sent to Rádió69…",
    "Köszönjük! Az üzeneted sikeresen megérkezett a Rádió69-hez.": "Thank you! Your message has been received by Rádió69.",
    "A bankszámlaszám a vágólapra került.": "The account number has been copied to the clipboard.",
    "Bankszámlaszám: 53500841-10044685": "Account number: 53500841-10044685",
    "Menü megnyitása": "Open menu",
    "Rádió69 kezdőlap": "Rádió69 homepage",
    "Fő navigáció": "Main navigation",
    "Rádiócsatorna kiválasztása": "Select a radio channel",
    "Élő rádiós adatok": "Live radio data",
    "Élő hallgatottság": "Live listener count",
    "A hét napjai": "Days of the week",
    "Partnereink és rendezvény DJ szolgáltatások": "Our partners and event DJ services",
    "Partneri megkeresés küldése": "Send a partnership enquiry",
    "Dave, műsorvezető": "Dave, presenter",
    "Ákos, műsorvezető": "Ákos, presenter",
    "Balu, műsorvezető": "Balu, presenter",
    "DJ Effect – rendezvény DJ, disco, esküvő és céges rendezvény": "DJ Effect – event DJ, disco, weddings and corporate events",
    "DJ Veronic – rendezvény DJ, disco, esküvő és céges rendezvény": "DJ Veronic – event DJ, disco, weddings and corporate events",
    "Teljes neved": "Your full name",
    "Hogy szólíthatunk?": "What should we call you?",
    "Előadó – szám címe": "Artist – song title",
    "nev@email.com": "name@email.com",
    "Miben segíthetünk?": "How can we help?"
  }
};

const RADIO69_LANGUAGE_KEY = "radio69-site-language";
const RADIO69_TEXT_RECORDS = new WeakMap();
const RADIO69_ATTRIBUTE_RECORDS = new WeakMap();
const RADIO69_TRANSLATED_ATTRIBUTES = ["aria-label", "aria-description", "placeholder", "title", "alt"];
let radio69Language = "hu";

function radio69NormalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function radio69TranslateValue(source, language) {
  if (language !== "en") return source;
  const key = radio69NormalizeText(source);
  if (Object.prototype.hasOwnProperty.call(RADIO69_I18N.en, key)) {
    return RADIO69_I18N.en[key];
  }
  // A műsorrendben a műsorvezető neve változó, ezért a címke mintázatát fordítjuk.
  if (key.includes("Műsorvezető:")) {
    return key
      .replace(/Október 1\. és május 31\. között/g, "October 1 to May 31")
      .replace(/Műsorvezető:\s*/g, "Hosted by: ");
  }
  if (/^Hétfői műsoraink$/.test(key)) return "Monday's shows";
  return source;
}

function radio69ApplyTextNode(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE || !node.parentElement) return;
  if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.parentElement.tagName)) return;
  let record = RADIO69_TEXT_RECORDS.get(node);
  const current = node.nodeValue || "";
  if (!record) {
    record = { original: current, rendered: null };
    RADIO69_TEXT_RECORDS.set(node, record);
  } else if (current !== record.rendered) {
    // A weboldal funkciói később is cserélhetnek dinamikus szövegeket.
    record.original = current;
  }
  const original = record.original;
  const leading = (original.match(/^\s*/) || [""])[0];
  const trailing = (original.match(/\s*$/) || [""])[0];
  const translated = radio69TranslateValue(original.trim(), radio69Language);
  const nextValue = translated ? `${leading}${translated}${trailing}` : original;
  record.rendered = nextValue;
  if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
}

function radio69ApplyAttributes(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
  let records = RADIO69_ATTRIBUTE_RECORDS.get(element);
  if (!records) {
    records = {};
    RADIO69_ATTRIBUTE_RECORDS.set(element, records);
  }
  RADIO69_TRANSLATED_ATTRIBUTES.forEach((attribute) => {
    if (!element.hasAttribute(attribute)) return;
    const current = element.getAttribute(attribute) || "";
    let record = records[attribute];
    if (!record) record = records[attribute] = { original: current, rendered: null };
    else if (current !== record.rendered) record.original = current;
    const nextValue = radio69TranslateValue(record.original, radio69Language);
    record.rendered = nextValue;
    if (current !== nextValue) element.setAttribute(attribute, nextValue);
  });
}

function radio69TranslateTree(root) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    radio69ApplyTextNode(root);
    return;
  }
  if (root.nodeType === Node.ELEMENT_NODE) radio69ApplyAttributes(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let textNode;
  while ((textNode = walker.nextNode())) radio69ApplyTextNode(textNode);
  if (root.nodeType === Node.ELEMENT_NODE) {
    root.querySelectorAll("*").forEach(radio69ApplyAttributes);
  }
}

const RADIO69_NAME_DAY_API = "https://www.nevinfo.hu/api/v1/ma";
const RADIO69_NAME_DAY_CACHE_PREFIX = "radio69-name-days:";
const RADIO69_NAME_DAY_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const RADIO69_NAME_DAY_CHECK_MS = 30 * 60 * 1000;
let radio69NameDayDateKey = "";
let radio69NameDayNames = [];
let radio69NameDayState = "loading";

function radio69GetBudapestDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function radio69UpdateNameDayLanguage() {
  const label = document.getElementById("nameDayLabel");
  const greeting = document.getElementById("nameDayGreeting");
  const source = document.getElementById("nameDaySource");
  const ticker = document.getElementById("nameDayTicker");
  const names = document.getElementById("nameDayNames");
  if (label) label.textContent = radio69Language === "en" ? "TODAY'S NAME DAYS" : "MAI NÉVNAPOSOK";
  if (greeting) greeting.textContent = radio69Language === "en" ? "Happy name day!" : "Boldog névnapot!";
  if (source) source.textContent = radio69Language === "en" ? "Source: Névinfo" : "Forrás: Névinfo";
  if (ticker) ticker.setAttribute("aria-label", radio69Language === "en" ? "Today's name days" : "Mai névnapok");
  if (names && radio69NameDayState === "loading") {
    names.textContent = radio69Language === "en" ? "Loading name days…" : "Névnapok betöltése…";
  } else if (names && radio69NameDayState === "unavailable" && radio69NameDayNames.length === 0) {
    names.textContent = radio69Language === "en" ? "Name days are temporarily unavailable" : "A névnapok most nem tölthetők be";
  }
}

function radio69RenderNameDayTicker() {
  const track = document.getElementById("nameDayTrack");
  const group = document.getElementById("nameDayGroup");
  const namesElement = document.getElementById("nameDayNames");
  if (!track || !group || !namesElement) return;

  if (radio69NameDayNames.length) {
    namesElement.textContent = radio69NameDayNames.join(" • ");
  } else if (radio69NameDayState === "unavailable") {
    namesElement.textContent = radio69Language === "en"
      ? "Name days are temporarily unavailable"
      : "A névnapok most nem tölthetők be";
  } else {
    namesElement.textContent = radio69Language === "en" ? "Loading name days…" : "Névnapok betöltése…";
  }

  // A második, képernyőolvasók elől rejtett példány biztosítja a folyamatos futást.
  const oldCopy = track.querySelector(".name-day-group-copy");
  if (oldCopy) oldCopy.remove();
  const copy = group.cloneNode(true);
  copy.removeAttribute("id");
  copy.classList.add("name-day-group-copy");
  copy.setAttribute("aria-hidden", "true");
  copy.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
  track.appendChild(copy);
}

function radio69ReadNameDayCache(dateKey) {
  try {
    const raw = localStorage.getItem(`${RADIO69_NAME_DAY_CACHE_PREFIX}${dateKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.names)) return null;
    const names = parsed.names.map((name) => String(name || "").trim()).filter(Boolean);
    if (!names.length) return null;
    return { names, fetchedAt: Number(parsed.fetchedAt) || 0 };
  } catch {
    return null;
  }
}

function radio69ApplyCachedNameDays(cache) {
  if (!cache || !cache.names.length) return;
  radio69NameDayNames = cache.names;
  radio69NameDayState = "loaded";
  radio69RenderNameDayTicker();
}

async function radio69RefreshNameDays(force = false) {
  const dateKey = radio69GetBudapestDateKey();
  const dateChanged = dateKey !== radio69NameDayDateKey;
  if (dateChanged) {
    radio69NameDayDateKey = dateKey;
    radio69NameDayNames = [];
    radio69NameDayState = "loading";
    const dayCache = radio69ReadNameDayCache(dateKey);
    if (dayCache) radio69ApplyCachedNameDays(dayCache);
    else radio69RenderNameDayTicker();
    force = true;
  }

  const cached = radio69ReadNameDayCache(dateKey);
  if (!force && cached && Date.now() - cached.fetchedAt < RADIO69_NAME_DAY_CACHE_TTL_MS) return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(RADIO69_NAME_DAY_API, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Névnap API HTTP ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload?.ma)) throw new Error("A névnap API válasza nem tartalmaz mai névnaplistát.");
    const names = [...new Set(payload.ma.map((item) => String(item?.name || "").trim()).filter(Boolean))];
    if (!names.length) throw new Error("A mai névnaplista üres.");

    radio69NameDayNames = names;
    radio69NameDayState = "loaded";
    try {
      localStorage.setItem(`${RADIO69_NAME_DAY_CACHE_PREFIX}${dateKey}`, JSON.stringify({ names, fetchedAt: Date.now() }));
    } catch { /* a névnaplista tárolás nélkül is megjelenik */ }
    radio69RenderNameDayTicker();
  } catch (error) {
    console.warn("A mai névnapok lekérése nem sikerült:", error);
    if (cached?.names?.length) {
      radio69ApplyCachedNameDays(cached);
    } else {
      radio69NameDayState = "unavailable";
      radio69NameDayNames = [];
      radio69RenderNameDayTicker();
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

function radio69InitNameDayTicker() {
  radio69NameDayDateKey = radio69GetBudapestDateKey();
  const cached = radio69ReadNameDayCache(radio69NameDayDateKey);
  if (cached) radio69ApplyCachedNameDays(cached);
  else radio69RenderNameDayTicker();
  radio69UpdateNameDayLanguage();
  radio69RefreshNameDays(!cached || Date.now() - cached.fetchedAt >= RADIO69_NAME_DAY_CACHE_TTL_MS);
  setInterval(() => radio69RefreshNameDays(false), RADIO69_NAME_DAY_CHECK_MS);
}

function radio69SetLanguage(language) {
  radio69Language = language === "en" ? "en" : "hu";
  document.documentElement.lang = radio69Language;
  document.title = radio69Language === "en"
    ? "Rádió69 – The past and the present in one place!"
    : "Rádió69 – A múlt és a jelen egy helyen!";
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.content = radio69Language === "en"
      ? "Rádió69 – online radio from Békés County, Hungary. Listen live to the Remix and Hits channels, discover our shows and meet the team!"
      : "Rádió69 – online rádió Békés vármegyéből. Hallgasd élőben a Remix és Hits csatornát, nézd meg műsorainkat és ismerd meg a csapatot!";
  }
  radio69TranslateTree(document.body);
  radio69UpdateNameDayLanguage();
  document.querySelectorAll(".language-button").forEach((button) => {
    const active = button.dataset.language === radio69Language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const languageGroup = document.querySelector(".language-switch");
  if (languageGroup) languageGroup.setAttribute("aria-label", radio69Language === "en" ? "Language selection" : "Nyelvválasztó");
  try { localStorage.setItem(RADIO69_LANGUAGE_KEY, radio69Language); } catch { /* tárolás tiltva: a nyelvváltás ettől még működik */ }
}

let savedRadio69Language = "hu";
try {
  const saved = localStorage.getItem(RADIO69_LANGUAGE_KEY);
  if (saved === "en" || saved === "hu") savedRadio69Language = saved;
} catch { /* private browsing / storage blocked */ }

document.querySelectorAll(".language-button").forEach((button) => {
  button.addEventListener("click", () => radio69SetLanguage(button.dataset.language));
});
radio69SetLanguage(savedRadio69Language);
radio69InitNameDayTicker();

// A később frissülő lejátszó-, statisztikai és űrlapszövegeket is lefordítjuk.
const radio69LanguageObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "characterData") {
      radio69ApplyTextNode(mutation.target);
      return;
    }
    if (mutation.type === "attributes") {
      radio69ApplyAttributes(mutation.target);
      return;
    }
    mutation.addedNodes.forEach((node) => radio69TranslateTree(node));
  });
});
radio69LanguageObserver.observe(document.body, {
  subtree: true,
  childList: true,
  characterData: true,
  attributes: true,
  attributeFilter: RADIO69_TRANSLATED_ATTRIBUTES
});

// Oldalbetöltéskor a Remix az alapértelmezett csatorna: automatikusan
// megpróbáljuk elindítani a hangos streamet. Ha a böngésző ezt tiltja,
// a fenti hibaág útmutatást ad a meglévő lejátszásgomb használatához.
startRadio();
