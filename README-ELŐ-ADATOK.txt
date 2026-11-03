RÁDIÓ69 – ÉLŐ HALLGATOTTSÁG ÉS MOST SZÓL

A weboldalban bekapcsoltam az Icecast status-json.xsl végpont olvasását.
- Remix: /stream
- Hits: /teszt
- Frissítés: 30 másodpercenként
- Külön hallgatószám a két csatornán
- Aktuális zeneszám és előadó, ha a stream metadata továbbítja

ELSŐ TESZT
1. Töltsd fel a radio69-modern mappában lévő fájlokat együtt a webtárhelyre.
2. Nyisd meg a radio69.hu oldalt, majd a böngészőben frissíts egy teljes újratöltéssel (Ctrl+F5).
3. Nézd meg az Élő rádió részt.
4. Ha az adatok megjelennek, kész is.

HA „ADATKAPCSOLATI HIBA” LÁTSZIK
Ez jellemzően azt jelenti, hogy az Icecast statisztikai végpont válaszát a böngésző CORS-beállítás miatt nem olvashatja ki. A hang ettől még működhet.

A csomag tartalmaz egy opcionális Supabase Edge Function proxyt:
supabase/functions/radio-stats/index.ts
A proxy telepítése csak akkor szükséges, ha a közvetlen Icecast lekérés CORS miatt nem működik. A funkció nyilvános statisztikai adatot ad vissza, titkos kulcsot nem használ. A `verify_jwt = false` csak ezt a publikus, olvasó funkciót érinti.
A telepítést követően a script.js RADIO_CONFIG.statsUrl értékét erre kell átállítani:
https://zmejdydtgxotkscluqlo.supabase.co/functions/v1/radio-stats

FONTOS
A közvetlen Icecast lekérés az elsődleges megoldás. A CORS engedélyezést a rádiószerver üzemeltetőjének kell beállítania, vagy az opcionális proxy telepíthető a meglévő Supabase projektbe.
A jelenlegi munkakörnyezetből a Diazol szerver élő JSON válasza nem volt közvetlenül elérhető, ezért a működő adatmegjelenítést a feltöltés után kell ellenőrizni.
