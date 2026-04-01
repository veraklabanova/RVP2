Testovací strategie a uživatelské scénáře: Rodiče v péči (Fáze 2)
Kapitola 1: Metodické pokyny a obecné instrukce
Úvod do domény
Testování systému „Rodiče v péči“ ve Fázi 2 se zaměřuje na kritickou cestu záchrany života (medikační smyčka) a integritu rodinné koordinace. Na rozdíl od běžných aplikací zde selhání notifikace nebo chybná interpretace dat z OCR nepředstavuje pouze „bug“, ale reálné riziko pro zdraví seniora.
Pokyny pro testery
Role-based Testing: Testy vyžadují simultánní zapojení dvou rolí: Senior (zařízení se Senior Mode) a Koordinátor (standardní rozhraní).
Hardware: Vzhledem k využití Hybridního Wrapperu musí testy probíhat na fyzických zařízeních (zejména iOS), nikoliv v emulátorech, aby bylo možné validovat „Critical Alerts“ a chování při zhasnutém displeji.
Negativní testování: Zaměřte se na stavy „No signal“, „Kill app“ a „Low battery“. Systém musí tyto stavy reportovat jako technickou chybu, nikoliv jako ignorování léků seniorem.
Terminologie
Eskalační smyčka: Automatizovaný proces upozornění rodiny při nečinnosti seniora.
Senior Mode: Zjednodušené UI s vysokým kontrastem a omezenou funkčností pro seniory.
Garant/Koordinátor: Člen rodiny s právem editace léků a správy týmu.
Smart Matching: Algoritmus identifikující lékařské události v externích kalendářích.
Kapitola 2: Chytrý lékový asistent a Senior Mode
Scénář 2.1: Kompletní eskalační cesta „Snooze“
Cíl: Ověřit, že opakované odkládání (Snooze) vede k eskalaci typu „Aktivní odklad“.
Pre-conditions: Senior má naplánovaný lék na 10:00. Zařízení jsou spárována.
Postup:
V 10:00 vyvolat notifikaci u seniora.
Senior klikne na „TEĎ NE“ (1. odklad).
Počkat 15 minut na opakovanou výzvu.
Senior klikne podruhé na „TEĎ NE“ (2. odklad).
Hodnotící kritéria:
Ihned po druhém kliknutí obdrží Koordinátor push notifikaci: „⚠️ Aktivní odklad: Maminka opakovaně odložila medikaci [Název léku]“.
V compliance reportu je záznam označen jako „Odloženo/Rizikové“.
Rizika: Selhání timeru na pozadí wrapperu.
Scénář 2.2: Okamžitá krizová eskalace (Nevolnost)
Cíl: Ověřit rychlou reakci při nahlášení problému seniorem.
Pre-conditions: Aktivní výzva k léku na displeji seniora.
Postup:
Senior klikne na „JINÝ DŮVOD“.
Senior vybere z rychlé volby „Nevolnost“.
Hodnotící kritéria:
Koordinátor obdrží High-Priority notifikaci (se zvukem i v tichém režimu) s textem: „🚨 Urgentní: Maminka si nevzala lék z důvodu: Nevolnost.“
Rizika: Nesprávné zobrazení důvodu v notifikaci u pečujícího.
Scénář 2.3: Detekce „Tiché smrti“ (Offline stav)
Cíl: Ověřit, že systém pozná rozdíl mezi ignorováním aplikace a technickým výpadkem.
Pre-conditions: Plánovaný lék za 5 minut.
Postup:
Na zařízení seniora zapnout „Režim letadlo“ (simulace ztráty signálu/vybití).
Počkat na čas plánované medikace + 5 minut (Server TTL).
Hodnotící kritéria:
Koordinátor obdrží notifikaci: „⚠️ Ztráta spojení se zařízením seniora (vybitý telefon / bez signálu)“.
Systém nehlásí „nepotvrzení léku“, ale „technickou nedostupnost“.
Rizika: Příliš agresivní TTL vedoucí k falešným poplachům při krátkém výpadku 4G/5G.
Kapitola 3: Kalendář a ochrana soukromí
Scénář 3.1: Selektivní synchronizace a smazání zdroje
Cíl: Ověřit integritu dat při smazání události v původním Google/Apple kalendáři.
Pre-conditions: Úspěšně napojený externí kalendář Koordinátora.
Postup:
V Google kalendáři vytvořit událost „Kontrola kardiologie“.
V aplikaci „Rodiče v péči“ označit tuto událost přepínačem „Sdílet s rodinou“.
V Google kalendáři událost smazat.
Počkat 60 sekund (Webhook).
Hodnotící kritéria:
V rodinném kalendáři aplikace událost nezmizí úplně, ale změní stav na „Původní termín zrušen – prověřte změnu“.
Událost je vizuálně odlišena (např. přeškrtnutí nebo ikona varování).
Scénář 3.2: Smart Matching a odhlášení falešné shody
Cíl: Ověřit, že uživatel může korigovat chybnou detekci algoritmu.
Pre-conditions: Externí kalendář obsahuje událost s názvem „Oběd s MUDr. Novákem“ (společenská akce, ne prohlídka).
Postup:
Systém nabídne Smart Tip: „Rozpoznali jsme návštěvu lékaře. Chcete ji nasdílet?“.
Uživatel klikne na „Nenabízet pro tuto událost“.
Hodnotící kritéria:
Událost zmizí z nabídky ke sdílení.
Při následné synchronizaci se tato událost již nikdy nenabízí jako Smart Tip.
Kapitola 4: Advanced OCR a správa medikace
Scénář 4.1: Konflikt v dávkování (Update léku)
Cíl: Ověřit, že systém nevytváří duplicity, ale vynucuje revizi člověkem.
Pre-conditions: V systému je zaveden lék „Warfarin 5mg“ s dávkováním 1-0-0.
Postup:
Koordinátor vyfotí nový eRecept, kde je „Warfarin 5mg“ s novým dávkováním 1-0-1.
Proběhne OCR vytěžení.
Hodnotící kritéria:
Systém nesmí automaticky přepsat starý plán.
Na Dashboardu se objeví červený widget: „⚠️ Změna v medikaci: Lékař upravil Warfarin.“
Až do manuálního potvrzení Koordinátorem musí Senior Mode stále zobrazovat staré schéma (1-0-0), aby nedošlo k nekontrolované změně.
Kapitola 5: Rodinný chat a Business Model
Scénář 5.1: Retention Logic u uzavřených úkolů (Free verze)
Cíl: Ověřit, že zprávy u aktivních úkolů nezmizí, ale po uzavření se spustí 7denní lhůta.
Pre-conditions: Uživatel s verzí Free. Existuje úkol „Koupit vozík“ se 14 dní starou diskuzí.
Postup:
Ověřit, že diskuze je stále viditelná (protože úkol je aktivní).
Nastavit úkol jako „Hotovo“.
Simulovat posun času o 8 dní.
Hodnotící kritéria:
Po 8 dnech od uzavření úkolu je diskuze skryta za Paywall („Přejděte na Premium pro zobrazení historie“).
Metadata úkolu (kdo jej splnil a kdy) zůstávají viditelná i ve Free verzi.
Kapitola 6: Seznam akceptačních kritérií (UAT Summary)
Pro úspěšné převzetí Fáze 2 musí být splněny následující podmínky:
ID	Akceptační kritérium	Stav (splněno/nesplněno)
AC 1	Eskalace rodině proběhne nejpozději do 45 min od první výzvy, pokud senior nereaguje.	
AC 2	Kritické notifikace (Léky) na iOS obcházejí tichý režim (skrze Hybrid Wrapper).	
AC 3	Systém prokazatelně rozliší mezi „Senior nepotvrdil“ a „Zařízení je offline“.	
AC 4	OCR proces neprovádí automatické zápisy do medikačního plánu bez validace pečujícím.	
AC 5	Změna v externím kalendáři (smazání) nezpůsobí tiché zmizení dat z rodinného kalendáře.	
AC 6	Uživatel s rolí „Senior“ nemá technickou možnost měnit dávkování léků.	
AC 7	Free uživatel má přístup ke zprávám u všech otevřených úkolů bez časového omezení.	
AC 8	Generovaný PDF report pro lékaře obsahuje kompletní mřížku compliance za daný měsíc.	