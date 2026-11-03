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
  statsRefreshMs: 15000,
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
  document.getElementById("channelTitle").innerHTML = `Rádió69 <em>${isHits ? "Hits" : "Remix"}</em>`;
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

// Oldalbetöltéskor a Remix az alapértelmezett csatorna: automatikusan
// megpróbáljuk elindítani a hangos streamet. Ha a böngésző ezt tiltja,
// a fenti hibaág útmutatást ad a meglévő lejátszásgomb használatához.
startRadio();
