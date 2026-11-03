RÁDIÓ69 – REMIX METAADAT JAVÍTÁS (A MOBILAPP MŰKÖDŐ LOGIKÁJA ALAPJÁN)

Mi változott?
- A weboldal a Remix metaadatait ugyanarról a forrásról olvassa, mint a mobilalkalmazás:
  http://s03.diazol.hu:7160/status-json.xsl
- Kizárólag a /autodj mount metaadatait használja.
- A 7162-es Icecast végpont továbbra is a két csatorna hallgatószámát és a Hits metaadatait adja.
- A 7160-as forrásból érkező Remix cím/előadó a 7162-es /stream statisztikai adatsorába kerül át.
- Frissítési idő: 15 másodperc.
- A Hits streamet és a weboldal megjelenését nem módosítottuk.

FONTOS: AZ EDGE FUNCTIONT FEL KELL TELEPÍTENI A MÁR MEGLÉVŐ SUPABASE PROJEKTBE.
A weboldal script.js fájlja már erre a HTTPS-címre kérdez rá:
https://zmejdydtgxotkscluqlo.supabase.co/functions/v1/radio-stats

TELEPÍTÉS SUPABASE DASHBOARDON KERESZTÜL
1. Nyisd meg a Supabase Dashboardot, és válaszd ki a Rádió69 projektet.
2. Bal oldalt nyisd meg az Edge Functions részt.
3. Nyisd meg a korábbi radio-stats függvényt, vagy hozz létre új radio-stats nevű függvényt.
4. A függvény teljes forrását cseréld le a csomagban található fájl tartalmára:
   supabase/functions/radio-stats/index.ts
5. Deploy / Save changes.
6. Ellenőrzés: nyisd meg ezt a címet böngészőben:
   https://zmejdydtgxotkscluqlo.supabase.co/functions/v1/radio-stats
   A válaszban szerepelnie kell az icestats.source tömbnek és a radio69.remixMetadata objektumnak.

TELEPÍTÉS SUPABASE CLI-VAL
A projekt gyökeréből:
  supabase functions deploy radio-stats --no-verify-jwt

A Supabase Publishable key marad a korábban beállított supabase-config.js fájlban.
Titkos vagy service_role kulcs nem szükséges ehhez a publikus, csak olvasó státuszvégponthoz.

ELLENŐRZÉS
- radio69.remixMetadata.available = true esetén a 7160 /autodj metaadat megtalálható.
- A remixMetadata.rawTitle az AutoDJ által visszaadott eredeti zenecím.
- A remixMetadata.artist és remixMetadata.title szétválasztva jelenik meg a weboldalon.
- A Hits és mindkét hallgatószám továbbra is a 7162-es Icecast végpontról jön.

A csomagban a teljes radio69-modern mappa szerepel, a meglévő Supabase űrlapbeállítással együtt.
