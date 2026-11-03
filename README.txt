RÁDIÓ69 – SIGNAL ENERGY – SUPABASE-RA ELŐKÉSZÍTETT WEBOLDAL

A SUPABASE KAPCSOLATI ADATOK MÁR BE VANNAK ÁLLÍTVA
- Project URL: https://zmejdydtgxotkscluqlo.supabase.co
- A megadott Publishable key be van állítva a supabase-config.js fájlban.
- A weboldal a böngészőből kizárólag ezt a publikus kulcsot használja.
- Secret vagy service_role kulcs nincs a csomagban.

MÉG EGYSZER EL KELL VÉGEZNI AZ ADATBÁZIS-BEÁLLÍTÁST
1. Nyisd meg a Supabase Dashboardban a Rádió69 projektet.
2. A bal oldali menüben nyisd meg az SQL Editor részt.
3. Nyisd meg a csomagban található supabase-schema.sql fájlt.
4. Másold be a teljes SQL-t az SQL Editorba, majd futtasd le (Run).
5. A Table Editorban ellenőrizd, hogy létrejött-e a radio69_messages tábla.

MIT CSINÁL AZ SQL?
- Létrehozza a radio69_messages táblát.
- Bekapcsolja a Row Level Security (RLS) védelmet.
- A publikus látogatók csak új üzenetet küldhetnek be.
- A látogatók nem olvashatják és nem módosíthatják a beérkezett üzeneteket.
- A zenei kívánságok message_type értéke: music_request.
- A kapcsolatfelvételi üzenetek message_type értéke: contact.

FELTÖLTÉS
A teljes radio69-modern mappa tartalmát töltsd fel a tárhelyre úgy, hogy ezek a fájlok egy könyvtárban maradjanak:
- index.html
- styles.css
- script.js
- supabase-config.js

A supabase-schema.sql csak az adatbázis létrehozásához szükséges; nem kell a nyilvános weboldal könyvtárába feltölteni.

TESZT
1. Az SQL futtatása után nyisd meg a weboldalt HTTPS-en.
2. Küldj egy teszt zenei kívánságot.
3. Küldj egy teszt kapcsolatfelvételi üzenetet.
4. A Supabase Dashboard / Table Editor / radio69_messages táblában ellenőrizd, hogy mindkét rekord megjelent-e.

ÜZENETEK KEZELÉSE
A beérkezett üzeneteket a Supabase Dashboardban, a Table Editor / radio69_messages táblában lehet megtekinteni. A publikus weboldalról nem lehet az üzeneteket lekérdezni.

E-MAIL ÉRTESÍTÉS
Ez a változat adatbázisba menti az üzeneteket, de automatikus e-mailt még nem küld. Ehhez külön szerveroldali Edge Function és e-mail szolgáltató szükséges. E-mail szolgáltatói titkos kulcsot ne tegyél a weboldal fájljaiba.

RÁDIÓSTREAM
- Remix: https://s03.diazol.hu:7162/stream
- Hits:  https://s03.diazol.hu:7162/teszt

A Signal Energy dizájn, a heti műsorrend és a két külön rádióstream változatlan maradt.


ÉLŐ HALLGATOTTSÁG ÉS MOST SZÓL
- A weboldal az Icecast JSON státuszvégpontot olvassa: https://s03.diazol.hu:7162/status-json.xsl
- Remix mount: /stream
- Hits mount: /teszt
- A kijelző 30 másodpercenként frissül, és csatornánként külön mutatja a hallgatók számát.
- A zenecím és előadó csak akkor jelenik meg, ha a streamforrás ezeket az Icecast metaadatokat küldi.
- A stream lejátszása az élő statisztikai lekéréstől függetlenül működik.

FONTOS: BÖNGÉSZŐS HOZZÁFÉRÉS (CORS)
Az élő adatok közvetlenül a Diazol Icecast szerveréről érkeznek. Ahhoz, hogy a radio69.hu weboldal JavaScriptje kiolvashassa a JSON-választ, a streamkiszolgálón engedélyezni kell a weboldal domainjéről érkező CORS-kéréseket (Access-Control-Allow-Origin). Ha a kijelzőn „ADATKAPCSOLATI HIBA” jelenik meg, miközben a rádió továbbra is szól, kérd a szolgáltatótól a CORS engedélyezését a https://radio69.hu domainre, és ellenőriztesd a /status-json.xsl elérhetőségét.

Az Icecast hivatalos dokumentációja szerint a /status-json.xsl végpont a forrásonkénti title, artist, listeners és listenurl mezőket is tartalmazhatja. A mezők jelenléte a stream típusától és a forrás által küldött metaadatoktól függ.


ADATKAPCSOLATI HIBA JAVÍTÁSA
A script.js most már apikey fejlécben küldi a Supabase publishable key-t a radio-stats Edge Functionnek. Ha továbbra is 401-es hiba jelenik meg, a Supabase Dashboardban az Edge Functions → radio-stats beállításainál kapcsold ki a Verify JWT ellenőrzést. A funkció nyilvános, csak olvasási célú rádiós státuszadatot szolgáltat.


RADIO-STATS FUNKCIÓ TELEPÍTÉSE UTÁNI WEBOLDAL-FRISSÍTÉS
A Supabase Edge Function telepítése után a radio69-modern/script.js fájlt is fel kell tölteni a weboldalra. A jelenlegi változat a Supabase radio-stats végpontot hívja meg az apikey fejlécben megadott Publishable key-jel.

A Remix zenecímét közvetlenül a válasz radio69.remixMetadata objektumából olvassa ki, amely a mobilalkalmazásban már bevált 7160 /autodj forrásból érkezik. A Remix hallgatószámát a 7162 /stream forrásból tartja meg. A Hits zenecímét és hallgatószámát továbbra is a 7162 /teszt forrásból olvassa.

FONTOS: a Supabase Dashboardban az Edge Functions → radio-stats beállításainál a Verify JWT legyen kikapcsolva, mert a weboldal sb_publishable_ típusú Publishable key-t küld az apikey fejlécben.

TELEPÍTÉS MOST
1. A Supabase radio-stats Edge Function már telepítve van; azt nem kell újra létrehozni.
2. Töltsd fel a radio69-modern/script.js fájlt a tárhelyre a jelenlegi script.js helyére.
3. A supabase-config.js fájlt, az index.html-t és a styles.css-t most nem kell lecserélni.
4. Ellenőrizd, hogy a radio-stats funkciónál Verify JWT = OFF.
5. Nyisd meg a weboldalt, majd Ctrl+F5-tel frissítsd.
6. A böngésző Network paneljén a /functions/v1/radio-stats kérésnek 200-as választ kell adnia.


AKTUÁLIS ÉS KÖVETKEZŐ MŰSOR
A kezdőlapon a „Most adásban” és „Következik” panelek a heti műsorrendből számolódnak.
A kijelzés a Europe/Budapest időzónát használja, 30 másodpercenként frissül, és az éjfélen átnyúló műsorblokkokat is kezeli.
A Zsiványok Podcast csak október 1. és május 31. között szerepel az automatikus kijelzésben, a régi heti műsorrendben megadott szezon szerint.
A szombati Hangposta és a vasárnapi Magyar Top 40 a Délutáni Lazító részeként jelenik meg a dinamikus kijelzőben, mert a forrásoldal „Benne” elemként tünteti fel őket.
A megadott műsorkezdési időpontok a régi radio69.hu nyilvános műsorrendjéből származnak; a műsorblokkok időtartamát a következő meghirdetett kezdésig számolja a kijelző.
