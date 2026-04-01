# Projektová dokumentace – Rodiče v péči (Fáze 2)

> Sloučený dokument ze všech specifikací fáze 2.
> Obsahuje 8 dokumentů seřazených podle názvu.

---

## Obsah

1. [02 Strategy Layer f2 v2](#02-strategy-layer-f2-v2)
2. [03 Informační architektura f2 v2](#03-informační-architektura-f2-v2)
3. [04 Killer features a Business model f2 v2](#04-killer-features-a-business-model-f2-v2)
4. [05 Roadmap f2 v2](#05-roadmap-f2-v2)
5. [06 Uživatelské toky f2 v2](#06-uživatelské-toky-f2-v2)
6. [07 Design System f2 v2](#07-design-system-f2-v2)
7. [08 Copywriting f2 v2](#08-copywriting-f2-v2)
8. [09 Zadání projektu f2 v2](#09-zadání-projektu-f2-v2)

---

# 02 Strategy Layer f2 v2

## Strategický rámec: Rodiče v péči – Fáze 2 (v. 2.2 – FINÁLNÍ)
### 1. Rozšíření trhu
Primární segment: Ženy 40–55 let – „Koordinátorky péče“ (aktivní dcery, které nesou hlavní zátěž komunikace).
Sekundární segment: Muži 45–60 let – „Krizoví logistici“ (synové řešící administrativu, finance a transporty).
Terciární segment: Aktivní senioři (65+) – Subjekty péče využívající Senior Mode pro vlastní bezpečnost a potvrzování medikace.
Terciární segment: Profesionální pečovatelé (Odloženo do Fáze 3).
### 2. Aktualizovaná hodnotová propozice
Fáze 1: „Digitální jistota a právní navigace“ – nástroj pro přežití v chaosu.
Fáze 2: „Aktivní rodinný management a bezpečí“ – propojená platforma, která aktivně monitoruje compliance (léky) a synchronizuje rodinnou logistiku s osobním životem pečujících.
### 3. Nové klíčové funkce F2
3.1 Integrace externích kalendářů: Selektivní obousměrná synchronizace. Uživatel v aplikaci manuálně označí události ze svého Google/Apple kalendáře, které se mají sdílet s rodinným týmem (chrání soukromí pečujícího).
3.2 eRecept přes Advanced OCR: Inteligentní vytěžování dat z papírových i digitálních průvodek. Automatická aktualizace lékového plánu a kontrola duplicit.
3.3 Senior Mode & Lékový asistent: Zjednodušené rozhraní pro seniora. Vizuální a zvukové připomínky s eskalací na rodinný tým v případě nepotvrzení dávky.
3.4 Kontextový rodinný chat: Komunikace vázaná na konkrétní záznamy (úkoly, léky, dokumenty) pro zachování kontextu rozhodování.
### 4. Aktualizovaná riziková mapa
### Riziko
### Pravděpodobnost
### Dopad
### Mitigace
### OCR Chybovost
### Střední
### Vysoký
Povinné potvrzení správnosti dat uživatelem (human-in-the-loop).
Privacy Leak (Calendar)
Vysoká
Střední
Selektivní opt-in synchronizace událostí.
Notification fatigue
Vysoká
Střední
Prioritizace notifikací (Léky = Urgentní, Admin = Odložené).
### 5. Unit Economics F2 (Konsolidováno)
Základní (Free): SOS karta, základní navigace v systému, manuální zápis léků.
Premium (199 Kč/měsíc): Včetně všech funkcí Fáze 2 (Advanced OCR, Lékový asistent se Senior Mode, Kontextový chat, Obousměrný kalendář).
Nový add-on: „Automatické připomínky léků“ za +49 Kč/měsíc Zrušeno ve prospěch silného Premium balíčku.


---

# 03 Informační architektura f2 v2

## Informační architektura: Rodiče v péči – Fáze 2 (v. 2.2 – FINÁLNÍ)
### 0. Změny v globálních prvcích
Notifikační centrum & Inbox (Zvoneček): Sjednocené centrum pro systémová hlášení (expirace, úřady) a rodinnou komunikaci (@zmínky, nové zprávy v chatu).
Kontextový chat (Bublina): Viditelný prvek v detailu úkolů, léků a dokumentů.
Sync indikátor: Vizuální stav propojení s Google/Apple kalendáři.
Senior Mode Management: Nástroj pro generování 6místného párovacího kódu pro zařízení rodiče.
### 1. Nástěnka (Dashboard) – Rozšíření
Karta připomínek léků: Denní přehled s potvrzovacím flow (pokud senior nepotvrdil, možnost potvrzení pečujícím na dálku po telefonu).
Widget termínů: Mix lokálních událostí a selektivně synchronizovaných událostí z Google/Apple kalendáře.
Chat Quick-Feed: Poslední interakce z rodinných vláken.
### 2. Kalendář – Rozšíření
OAuth Management: Rozhraní pro připojení/odpojení Google a Apple účtů.
Selective Sync Toggle: Možnost u každé externí události jedním klikem zvolit „Sdílet do rodinného kalendáře“.
Překryvný pohled: Současné zobrazení osobního plánu pečujícího a kritických termínů seniora.
### 3. Nárokový průvodce & Smart Test
Katalog 5 průvodců: PnP, ZTP/P, Invalidní důchod, Mobilita, Zdravotní pomůcky.
Smart Test nároků: Interaktivní diagnostika situace s výstupem ve formě Mapy nároků (prioritizovaný seznam dávek k vyřízení).
### 4. Notifikační centrum & Inbox (Kategorie)
Léky: Připomínky, eskalace (červená prioritní zpráva), týdenní compliance report.
Kalendář: Blížící se termíny, chyby synchronizace.
Rodina (Inbox): Nové chatové zprávy, @zmínky, sdílené dokumenty.
Systém: Legislativní novinky, expirace dokladů rodiče.
### 5. Připomínky léků & Senior Mode
Workflow: Advanced OCR sken → Kontrola dat → Nastavení eskalací → Aktivace připomínek.
### Senior Mode (Zjednodušená aplikace):
UI: Extrémně velká typografie, vysoký kontrast, eliminace menu.
Funkce: Pouze „Dnešní léky“ a „Dnešní úkoly“.
Interakce: Tlačítka „VZAL JSEM“ (Zelená) / „NEVZAL“ (Šedá).
Párování: Zadání kódu od Zakladatele při prvním spuštění.
### 6. Kontextový rodinný chat
Chat-over-Data: Komunikace probíhá přímo v kontextu záznamu (např. diskuze o vedlejších účincích pod konkrétním lékem).
Audit Trail: Zprávy jsou trvale uloženy jako součást historie daného prvku (prevence ztráty informací při odchodu z aplikace).
### 7. Nastavení – Rozšíření
Konektivita: Správa Google/Apple OAuth.
Správa Senior Mode: Seznam spárovaných zařízení rodičů, nastavení eskalací (po jaké době má být rodina notifikována).
Reporty: Nastavení frekvence a příjemců PDF reportů o péči.


---

# 04 Killer features a Business model f2 v2

## Killer Features a Business Model: Rodiče v péči – Fáze 2 (v. 2.2 – FINÁLNÍ)
### 1. Killer Feature: Chytrý lékový asistent (Eskalační smyčka)
Tato funkce transformuje aplikaci z pasivního šanonu na aktivního strážce života.
### Scénář ranní rutiny:
07:00 – Aktivace u seniora: Zařízení seniora (Senior Mode) vydá zvukový signál a zobrazí velkou kartu: „Čas na ranní léky. Warfarin a Enalapril.“
Akce seniora: Senior potvrdí podání stisknutím obřího tlačítka [VZAL JSEM].
Potvrzení rodině: Všem pečujícím přijde tichá notifikace (peace-of-mind), že ranní léky byly v pořádku podány.
07:45 – Krizová eskalace: Pokud senior podání nepotvrdil, systém spustí prioritní push notifikaci rodině: „⚠️ Pozor: Maminka nepotvrdila ranní léky. Zkuste jí zavolat.“
Hodnota: Drastické snížení stresu pečujících a prokazatelné zvýšení bezpečnosti seniora.
### 2. Killer Feature: Mapa nároků (Lead-gen test)
Interaktivní diagnostický nástroj, který uživatele provede bludištěm sociálního systému.
Mechanika: 8–12 otázek mapujících mobilitu, kognitivní stav a finanční situaci seniora.
Výsledek zdarma: Personalizovaný přehled nároků (např. „Máte nárok na příspěvek 12 800 Kč měsíčně“).
Premium Upsell: Odemčení kompletní Mapy nároků s krokovými návody, insider tipy a vzory odvolání pro případ neúspěchu.
Cíl: Konverze do registrace (20 %), konverze do Premium (5–8 %).
### 3. Business model (Finální paywall logika)
### Funkce
### Free (Základní)
### Premium (199 Kč/měs.)
### Mapa nároků
Základní výpočet částek
Kompletní Průvodci + Vzory odvolání
### Lékový asistent
Osobní rozpis (manuální)
Eskalace rodině + Senior Mode + OCR
### Sync kalendářů
Jednosměrný import (Read-only)
Obousměrná selektivní synchronizace
### Rodinný Chat
Historie zpráv 7 dní
Neomezená historie a vyhledávání
### Reporting
—
PDF měsíční reporty pro lékaře/úřady
### 4. Metriky úspěchu (Cíle F2)
DAU/MAU: 40 % (Denní interakce seniorů a kontrola dětmi vytváří extrémně vysokou lepkavost/stickiness produktu).
LTV (Lifetime Value): Zvýšení o 30 % díky delší retenci uživatelů v procesu dlouhodobé medikace.
Compliance Rate: Cíl >85 % (Podíl včas potvrzených léků skrze aplikaci).
Konverze Free → Premium: 12 % (Díky silným konverzním bodům v Mrazáku a Testu nároků).


---

# 05 Roadmap f2 v2

## Plán vývoje (Roadmapa): Rodiče v péči – Fáze 2 (v. 2.2 – FINÁLNÍ)
### 🟢 Měsíc 4: Lékové bezpečí a Senior Mode
Cíl: Uzavření krizové smyčky mezi seniorem a pečujícím.
### T13: Push infrastruktura & Eskalační logika
Implementace Firebase Cloud Messaging (FCM).
Vývoj logiky eskalace: Pokud senior nepotvrdí podání do 30 min, systém pošle prioritní push rodině.
### T14: Senior Mode UI & Párování
Vývoj zjednodušeného rozhraní pro seniora (vysoký kontrast, obří ovládací prvky).
Implementace párovacího workflow přes 6místný kód.
### T15: Týdenní reporty a Dashboard
Tvorba týdenní compliance mřížky pro rodinu.
Sjednocení Notifikačního centra a Inboxu v aplikaci.
### T16: Interní Alfa testování (Senior-Child Loop)
Validace doručitelnosti eskalací a srozumitelnosti Senior Mode.
### 🟡 Měsíc 5: Kalendářní soukromí a Mapa nároků
Cíl: Bezpečné propojení digitálních životů a navigace v systému.
### T17: Kalendářní integrace & Selective Sync
Google/Apple OAuth integrace.
Vývoj „Privacy Toggles“: Možnost manuálně zvolit, které soukromé události se propíší do rodinného kalendáře.
### T18: Průvodci ZTP/P a Invalidní důchod
Příprava interaktivního obsahu a právní verifikace.
### T19: Průvodce Mobilita a Smart Test nároků
Implementace diagnostického dotazníku generujícího „Mapu nároků“.
Propojení výsledků testu s konkrétními průvodci.
### T20: UX testování a Právní revize
Testování srozumitelnosti návodů u cílové skupiny 45+.
### 🔴 Měsíc 6: Advanced OCR, Chat a Analytika
Cíl: Automatizace vstupu a rodinná exekuce.
### T21: Advanced OCR Engine pro eRecepty
Napojení na NRZIS API a eIdentitu.
Vývoj modulu pro hromadné vytěžování dat z tištěných a digitálních průvodek léků.
Automatické nahrávání vytěžených léků do lékového asistenta k potvrzení.
### T22: Kontextový rodinný chat
Implementace chatových vláken přímo v detailu úkolů, dokumentů a léků.
Systém @zmínek s push notifikací.
### T23: Komplexní Reporting & Anti-hostage Export
Generování měsíčních PDF reportů pro odborné konzultace.
Implementace funkce pro kompletní export dat (ZIP/PDF) pro každého Pečujícího.
### T24: Release a Stabilizace
Regresní testy F1 + F2. Performance audit.
### Public Launch Fáze 2.

### Co v F2 záměrně NENÍ
Integrace na státní registry (eIdentita/NRZIS).
Automatické odesílání formulářů na úřady (pouze generování PDF).
Nativní mobilní aplikace (aplikace zůstává ve formě PWA).


---

# 06 Uživatelské toky f2 v2

Uživatelské toky a User Stories: Rodiče v péči – Fáze 2 (v. 2.0 – FINÁLNÍ)
## Scénáře
### Scénář 1: Ranní připomínka léků
7:00 – Push notifikace s přehledem ranních léků
Uživatel otevře kartu dnešních léků
Potvrdí podání každého léku checkboxem
Eskalace po 30 minutách při nepotvrzení
21:00 – Denní shrnutí s přehledem podání/vynechání
### Scénář 2: Propojení kalendáře
Nastavení → Propojené služby → Přidat kalendář
OAuth autorizace (Google nebo Apple)
Výběr kalendářů k synchronizaci
Automatická synchronizace událostí
Smart propojení – aplikace rozpozná lékařské termíny a nabídne přiřazení k rodiči
### Scénář 3: Test nároků
Klik na „Zjistit nároky“ v sekci Průvodce
8 cílených otázek (věk, diagnóza, příjmy, bydlení...)
Personalizovaný výsledek s konkrétními dávkami a odhadovanými částkami
CTA tlačítko do relevantního průvodce
### Scénář 4: Kontextový chat
Ikona bubliny u konkrétního úkolu/dokumentu/události
Otevření chatového vlákna vázaného na daný prvek
@zmínka konkrétního člena rodiny
Push notifikace pro zmíněného člena
Historie zpráv vázaná na prvek a archivovaná v audit logu
## User Stories
### Epic 7: Notifikace a Léky
US 7.1: Jako pečující chci dostávat push připomínky léků v nastavené časy, abych nezapomněla na podání.
US 7.2: Jako pečující chci eskalaci při nepotvrzení, aby systém připomněl znovu po 30 minutách.
US 7.3: Jako pečující chci vidět týenní přehled compliance, abych měla přehled o pravidelném podávání.
US 7.4: Jako uživatel chci mít notifikační centrum, abych viděl/a všechna upozornění na jednom místě.
### Epic 8: Kalendáře
US 8.1: Jako pečující chci synchronizovat svůj Google/Apple kalendář, aby se termíny péče promítly do mého denního plánu.
US 8.2: Jako pečující chci smart propojení, aby aplikace rozpoznala lékařské termíny a přiřadila je k rodiči.
### Epic 9: Průvodce
US 9.1: Jako pečující chci nové průvodce (ZTP/P, Invalidní důchod, Mobilita, Pomůcky), abych znála všechny nároky.
US 9.2: Jako uživatel chci Test nároků, abych rychle zjistil/a, na co má můj blízký nárok.
US 9.3: Jako uživatel chci cross-linking mezi průvodci, abych snadno přešel/šla na související témata.
### Epic 10: Chat
US 10.1: Jako člen rodiny chci kontextový chat u úkolů a dokumentů, abychom komunikovali přímo v kontextu.
US 10.2: Jako člen rodiny chci @zmínky s push notifikací, aby se relevantní člověk dozvěděl o potřebě akce.
### Epic 11: eRecept a Analytika
US 11.1: Jako pečující chci importovat eRecepty přes eIdentitu, abych měla přehled o předepsaných lécích.
US 11.2: Jako pečující chci měsíční report, abych viděla souhrn aktivity a compliance.
## Technické poznámky
Tichý režim 22:00–7:00 – žádné push notifikace v nočních hodinách (konfigurovatelné)
Offline chat – zprávy se ukládají lokálně a synchronizují při obnovení připojení
OAuth tokeny server-side – refreshovací tokeny uloženy na serveru, klient pracuje jen s krátkodobými access tokeny
Barvy notifikací – fialová (léky), modrá (kalendář), zelená (rodina), šedá (systém)

---

# 07 Design System f2 v2

Design System – rozšíření: Rodiče v péči – Fáze 2 (v. 2.0)
## 1. Nové barvy
Fáze 2 rozšiřuje barevnou paletu o následující barvy:
Název
HEX
Použití
Léky fialová
#7B1FA2
Lékový asistent, připomínky, compliance
Chat teal
#00796B
Chatové bubliny, ikony, notifikace rodiny
Externí šedá
#9E9E9E
Importované kalendářní události, systémové notifikace
Compliance zelená
#43A047
Podáno, synchronizováno, úspěšné akce
Compliance červená
#E53935
Vynecháno, chyba, eskalace
## 2. Nové komponenty
### 2.1 Notifikační badge
Rozměr: 18×18 px
Tvar: Červený kruh (#E53935)
Obsah: bílé číslo (počet nepřečtených notifikací)
Pozice: pravý horní roh ikony zvonečku
Při počtu > 9 zobrazit „9+“
### 2.2 Lékový checkbox karta
Levý pruh: 4px široký, barva #7B1FA2 (fialová)
Stavy karty:
Čekající – bílé pozadí, prázdný checkbox
Podáno – světle zelené pozadí (#E8F5E9), zelený checkbox
Vynecháno – světle červené pozadí (#FFEBEE), červený křížek
### 2.3 Chat bublina
Vlastní zprávy: vpravo, zelené pozadí (#E0F2F1)
Cizí zprávy: vlevo, šedé pozadí (#F5F5F5)
Avatar: 28×28 px, kulatý, vedle bubliny
Max šířka bubliny: 75 % šířky obrazovky
### 2.4 Compliance mřížka
Buňky: 32×32 px
Barevné kódování:
Zelená (#43A047) – všechny léky podány
Červená (#E53935) – alespoň jeden lék vynechán
Šedá (#9E9E9E) – budoucí den nebo žádná data
Osa: Po–Ne (7 sloupců), řádky = týdny
### 2.5 Sync indikátor
Malá tečka (8×8 px) v záhlaví vedle názvu kalendáře:
Zelená – synchronizace aktivní a aktuální
Rotující – probíhá synchronizace (animovaná ikona)
Červená – chyba synchronizace, kliknutí zobrazí detail
## 3. Nové obrazovky
Fáze 2 přidává tři nové hlavní obrazovky:
Notifikační centrum – seznam všech notifikací řazených chronologicky, filtrování podle kategorií
Připomínky léků – denní přehled léků s checkboxy, týenní compliance mřížka, nastavení časů
Test nároků wizard – krok po kroku průchod otázkami, progress bar, výsledková obrazovka s CTA
## 4. Rozšíření interakcí
Haptic feedback – jemná vibrace při potvrzení podání léku (mobilní zařízení)
Swipe notifikace – swipe doleva pro archivaci, swipe doprava pro akci
Pull-to-refresh – ruční synchronizace kalendářů a notifikací tažením dolů

---

# 08 Copywriting f2 v2

## Copywriting pro Fázi 2: Rodiče v péči (v. 2.1)
### 1. Připomínky léků & Senior Mode
### Push texty (U Seniora – Senior Mode):
„Čas na ranní léky: [seznam léků]. Otevřete aplikaci a potvrďte podání.“
### Push texty (U Pečujícího – Eskalace):
Ráno: „Dobré ráno! Čas na ranní léky pro...“ (Smazáno – pečující dostává info až při selhání).
„⚠️ Pozor: Maminka nepotvrdila podání léku: [lék]. Zkuste jí zavolat a ověřit stav.“
„✅ V pořádku: Maminka potvrdila podání ranních léků.“ (Tichá notifikace pro klid v duši).
### Obrazovka Senior Mode (U Seniora):
Nadpis (Obří písmo): „VAŠE LÉKY“
Hlavní tlačítko: „[VZAL JSEM VŠECHNO]“
Vedlejší tlačítko: „[TEĎ NE / JINÝ DŮVOD]“
### 2. Notifikační centrum (Inbox)
Nadpis: „Upozornění“
### Příklady notifikací (Sjednoceno s Design systémem v. 2.1):
🔴 Léky (Medical): „⚠️ Eskalace: Maminka nepotvrdila lék [název].“
🔵 Kalendář (Admin): „Zítra 10:00 – Kontrola u kardiologa.“
🟢 Rodina (Chat): „Bratr Petr vás zmínil v diskuzi u dokumentu Plná moc.“
⚪ Systém: „Průvodce ZTP/P byl aktualizován.“
### 3. Kalendářní synchronizace & Soukromí
Nastavení: „Propojte svůj kalendář. Vy sami si zvolíte, které události nasdílíte rodině.“
### Selektivní sync (U každé události):
„Sdílet s rodinou? [Přepínač ANO/NE]“
Smart Tip: „Rozpoznali jsme návštěvu lékaře. Chcete ji nasdílet ostatním v týmu? [ANO]“
Premium upgrade: „Propojili jste kalendář jednosměrně. Pro obousměrnou synchronizaci (aby se úkoly z aplikace propsaly k vám) aktivujte Premium.“
### 4. Test nároků (Mapa nároků)
Úvod: „Zjistěte, na jaké příspěvky má váš blízký nárok. Vytvoříme vám osobní Mapu nároků.“
Příklad otázky: „Jakou pomoc senior potřebuje při pohybu/hygieně?“
Výsledek: „✅ Váš blízký má pravděpodobně nárok na tyto zdroje:“
Příspěvek na péči – až 12 800 Kč/měsíc.
Průkaz ZTP/P – doprava, parkování, prioritní odbavení.
Příspěvek na mobilitu – 900 Kč/měsíc.
„Chcete vidět kompletní Mapu nároků a získat vzory odvolání? Aktivujte Premium.“
### 5. Rodinný chat (Behaviorální Paywall)
Prázdný stav: „Zatím žádné zprávy. Začněte konverzaci o tomto [dokumentu/úkolu].“
Trial/Free omezení: „Vyčerpali jste 10 zpráv...“ „Vidíte zprávy za posledních 7 dní. Pro přístup k celé historii rodinné domluvy a vyhledávání v archivu přejděte na Premium.“
### 6. Advanced OCR (Magic Entry F2)
„Čtu lékařskou zprávu... Našel jsem 3 nové léky. Chcete je přidat do lékového asistenta?“
„Skenování receptu proběhlo úspěšně. Léky byly přidány do dnešního plánu.“
### 7. Měsíční report (Expert Report)
Předmět: „Report o péči pro lékaře – [Jméno rodiče] – [Únor 2026]“
Úvod: „Vážený uživateli, tento report slouží jako podklad pro vašeho lékaře. Obsahuje compliance medikace, přehled vyšetření a hlášené vedlejší účinky.“


---

# 09 Zadání projektu f2 v2

## Zadání projektu: Rodiče v péči – Fáze 2: Vize (v. 2.3 – SKUTEČNĚ FINÁLNÍ)
### 1. Chytrý lékový asistent (Senior & Child Loop)
Senior Mode: Specifické zjednodušené rozhraní v rámci hlavní aplikace. Obří interaktivní prvky „VZAL JSEM“ / „NEVZAL“.
Logika připomínek: Využití systémových „High-Priority“ notifikací u seniora, které vyžadují interakci. Pokud senior nepotvrdí podání do 30 minut, odchází prioritní push notifikace všem pečujícím členům rodiny (Eskalační smyčka).
Compliance report: Týdenní přehled úspěšnosti podávání léků odesílaný v PDF všem členům týmu.
### 2. Integrace externích kalendářů
Obousměrná synchronizace: Propojení s Google Calendar a Apple Calendar (Premium).
Smart Matching & Privacy: Selektivní synchronizace. Pečující v aplikaci označí své soukromé události jako „Související s péčí“ (např. dovolená, lékař), což je automaticky propíše do rodinného kalendáře pro ostatní, bez nutnosti sdílet celý soukromý kalendář.
Free verze: Pouze jednosměrný import (read-only).
### 3. Rozšířená Mapa nároků
Nové moduly: Průkaz ZTP/P, Invalidní důchod, Příspěvek na mobilitu, Zdravotní pomůcky.
Smart Test: Interaktivní „Test nároků“ na vstupu. Výstupem je vizuální Mapa nároků – přehled potenciálních financí a služeb, na které má rodina nárok, s prioritizací dle naléhavosti.
### 4. Kontextový rodinný chat
Vazba na exekuci: Chatová vlákna jsou integrována přímo do detailu úkolů, událostí v kalendáři a dokumentů (Chat-over-Data).
Transparentnost: Zprávy u konkrétního úkolu jsou viditelné pro všechny členy rodiny s přístupem k profilu rodiče (prevence šumů a informační asymetrie).
Business model: 10 zpráv měsíčně Free verze: Neomezený počet zpráv, ale historie omezena na 7 dní. Premium: Časově neomezená historie a full-text vyhledávání v archivu.
### 5. Medikace přes Advanced OCR
Napojení na NRZIS API skrze Identitu občana.
Funkce: Modul pro hromadné skenování a inteligentní rozpoznávání (OCR) lékařských zpráv a papírových eReceptů. Systém automaticky aktualizuje lékový plán a upozorní pečující na nutnost revize při detekci změn.
### 6. Měsíční analytický reporting (Expert Report)
Obsah: Přehled compliance léků, seznam návštěv lékařů, progres v žádostech o dávky a přehled rodinných aktivit.
Účel: Slouží jako podklad pro odborné lékařské konzultace a jako důkazní materiál pro úřady o intenzitě poskytované péče.


---
