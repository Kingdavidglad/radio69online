// Rádió69 – Icecast statisztika + a mobilalkalmazásból átvett Remix metaadat.
// A böngésző kizárólag ezt a HTTPS-es Edge Functiont hívja meg.
// A Hits metaadata és a /stream mount statisztikája a 7162-es végpontról érkezik.
// A Remix zenecímét és tényleges hallgatószámát a 7160 /autodj mount adja.

const corsHeaders = {
  // A végpont csak nyilvános rádiós státuszadatot ad vissza, titkos adatot nem.
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const STATS_URL = "https://s03.diazol.hu:7162/status-json.xsl";
const REMIX_METADATA_URL = "http://s03.diazol.hu:7160/status-json.xsl";

function jsonResponse(payload: unknown, status = 200, cacheSeconds = 8) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${cacheSeconds}`,
    },
  });
}

function normalizeSources(payload: any): Record<string, any>[] {
  const value = payload?.icestats?.source;
  if (!value) return [];
  return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [value];
}

function getMountPath(source: Record<string, any>): string {
  const candidates = [source.listenurl, source.listen_url, source.mount, source.mountpoint, source.stream_url];
  for (const candidate of candidates) {
    if (typeof candidate !== "string" || !candidate.trim()) continue;
    try {
      return new URL(candidate).pathname.replace(/\/$/, "") || "/";
    } catch {
      const value = candidate.split("?")[0].replace(/\/$/, "");
      if (value.startsWith("/")) return value;
    }
  }
  return "";
}

function readString(source: Record<string, any>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function parseArtistAndTitle(rawTitle: string) {
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
      title: rawTitle.slice(splitAt + splitLength).trim(),
    };
  }
  return { artist: "Rádió69 Remix", title: rawTitle };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return jsonResponse({ error: "Method not allowed" }, 405, 0);

  try {
    // A statisztika és a mobilapp által használt Remix metaadat párhuzamosan töltődik.
    const [statsResult, remixResult] = await Promise.allSettled([
      fetch(STATS_URL, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(9000),
      }),
      fetch(REMIX_METADATA_URL, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(9000),
      }),
    ]);

    if (statsResult.status !== "fulfilled") throw statsResult.reason;
    const statsResponse = statsResult.value;
    if (!statsResponse.ok) throw new Error(`Icecast stats HTTP ${statsResponse.status}`);

    const statsPayload = await statsResponse.json();
    const statsSources = normalizeSources(statsPayload);
    if (!statsSources.length) throw new Error("Az Icecast statisztikában nincs aktív forrás.");

    let remixMetadata = {
      available: false,
      mount: "/autodj",
      rawTitle: "",
      artist: "",
      title: "",
      message: "A Remix metaadatforrása még nem adott vissza zenecímet.",
    };

    if (remixResult.status === "fulfilled" && remixResult.value.ok) {
      try {
        const remixPayload = await remixResult.value.json();
        const remixSource = normalizeSources(remixPayload).find((source) => getMountPath(source) === "/autodj");
        if (remixSource) {
          const rawTitle = readString(remixSource, [
            "title",
            "yp_currently_playing",
            "stream_title",
            "song",
            "track",
          ]);
          if (rawTitle) {
            const explicitArtist = readString(remixSource, ["artist", "performer", "creator"]);
            const parsed = explicitArtist
              ? { artist: explicitArtist, title: rawTitle }
              : parseArtistAndTitle(rawTitle);
            remixMetadata = {
              available: true,
              mount: "/autodj",
              rawTitle,
              artist: parsed.artist,
              title: parsed.title,
              message: "Remix metaadat frissítve.",
            };

            // A weboldal a 7162-es /stream adatsorából olvassa a Remix adatait.
            // A tényleges hallgatókat az Icecast az /autodj mounton számlálja,
            // ezért a hallgatószámot is átmásoljuk a /stream sorba.
            // A Hits /teszt mountjához nem nyúlunk.
            const remixStatsSource = statsSources.find((source) => getMountPath(source) === "/stream");
            const remixListenerSource = statsSources.find((source) => getMountPath(source) === "/autodj");
            if (remixStatsSource) {
              remixStatsSource.raw_title = rawTitle;
              remixStatsSource.yp_currently_playing = rawTitle;
              remixStatsSource.artist = parsed.artist;
              remixStatsSource.title = parsed.title;
              remixStatsSource.track_title = parsed.title;

              const remixListeners = Number(remixListenerSource?.listeners);
              if (
                remixListenerSource?.listeners !== undefined &&
                remixListenerSource?.listeners !== null &&
                Number.isFinite(remixListeners)
              ) {
                remixStatsSource.listeners = remixListeners;
              }
            }
          }
        } else {
          remixMetadata.message = "A 7160-as Icecast válaszban nem található /autodj mount.";
        }
      } catch (error) {
        remixMetadata.message = `A Remix metaadat feldolgozása nem sikerült: ${String(error)}`;
      }
    } else {
      remixMetadata.message = remixResult.status === "rejected"
        ? "A 7160-as Remix metaadat-végpont nem érhető el."
        : `A Remix metaadat-végpont HTTP ${remixResult.value.status} hibát adott.`;
    }

    return jsonResponse({
      ...statsPayload,
      icestats: {
        ...(statsPayload?.icestats || {}),
        source: statsSources,
      },
      radio69: { remixMetadata },
    });
  } catch (error) {
    console.error("Rádió69 radio-stats proxy error:", error);
    return jsonResponse({ error: "Icecast stats unavailable" }, 502, 0);
  }
});
