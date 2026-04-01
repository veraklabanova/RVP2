PLÁN INTEGRAČNÍCH TESTŮ (FÁZE 2)
1. Kapitola 1: Integrační strategie a metodika
Obecný přístup
Zvolíme strategii Sandwich Integration.
Bottom-up: Ověření datové integrity a API kontraktů (OCR -> DB, Calendar Webhooks -> DB).
Top-down: Ověření uživatelských toků napříč zařízeními (Senior Mode -> Server Worker -> Pečující).
Focus: Primární zaměření na „Edge Cases“ spojené s asynchronními ději (Redis jobs) a ztrátou konektivity.
Testovací prostředí a data
Prostředí: Staging prostředí identické s produkcí (PWA v sandboxu, Redis instance pro joby).
Mockování: Simulace Google/Apple Calendar API (včetně zasílání webhooků) a simulace OCR engine (vstřikování připravených JSONů s různým confidence_score).
Testovací data: Sady lékařských zpráv (validní, nečitelné, duplicitní) a uživatelské profily s různými stavy předplatného (Free/Premium).
Doporučené nástroje
Postman/Newman: Testování API kontraktů a flow mezi endpointy.
Playwright / MSW (Mock Service Worker): Simulace offline stavů PWA a testování Senior Mode.
Redis Insight: Monitorování stavu a delayů eskalačních jobů.
K6: Zátěžové testy pro simultánní eskalace (např. ranní špička v 07:00).
2. Kapitola 2: Integrační scénáře – Medikace a Eskalace
Scénář 2.1: Uzavření eskalační smyčky (Server-side Worker)
Cíl: Ověřit, že server správně spravuje eskalační job nezávisle na stavu klienta.
Testované objekty: API Medikace, Redis Queue, Notification Service.
Flow:
Uživatel (Pečující) nastaví lék.
Server vytvoří záznam v DB a „Eskalační job“ v Redis s delayem 30 min.
Varianta A: Senior potvrdí -> API Medikace -> Smazání jobu z Redis.
Varianta B: Senior nepotvrdí/je offline -> Čas vyprší -> Worker vyvolá Push notifikaci rodině.
Success criteria: Notifikace rodině odejde přesně v T+30 min, pokud neexistuje příznak confirmed.
Automatizace: Vysoká. Lze testovat na úrovni backendu (API + Redis stav).
Scénář 2.2: Senior Mode – Silent Re-auth a Offline SOS
Cíl: Ověřit, že senior není nikdy odhlášen a má přístup k datům i bez sítě.
Testované objekty: Auth Service (Refresh Token), PWA Service Worker (IndexedDB).
Vstupní data: Expirovaný Access Token, aktivní Refresh Token.
Očekávaný výstup: Transparentní obnova tokenu na pozadí. Při simulovaném 401/500 chybovém kódu z API musí aplikace zůstat funkční nad lokální cache (SOS data).
Success criteria: UI nezobrazí login screen; SOS data jsou čitelná v offline režimu.
Automatizace: Střední. Vyžaduje simulaci síťových chyb v Playwright.
3. Kapitola 3: Integrační scénáře – Advanced OCR a Data Integrity
Scénář 3.1: OCR Conflict Resolution (Human-in-the-loop)
Cíl: Zabránit duplicitám léků při opakovaném skenování.
Testované objekty: OCR Processor, Medication Service, UI Revision Module.
Payload (OCR JSON): {"drug_name": "Warfarin", "dosage": "5mg", "confidence_score": 0.98}.
Stav systému: Lék "Warfarin" již v DB existuje s dávkováním "3mg".
Očekávaný výstup: Systém nevytvoří nový záznam, ale změní stav medikace na PENDING_REVISION. Koordinátorovi se v Inboxu objeví úkol k porovnání verzí.
Success criteria: V DB existuje pouze jeden záznam léku s příznakem konfliktu do doby manuálního potvrzení.
Automatizace: Vysoká. Klíčové pro stabilitu datového modelu.
4. Kapitola 4: Integrační scénáře – Kalendář a Webhooky
Scénář 4.1: Synchronizace a distribuce změn (Webhook Propagation)
Cíl: Ověřit, že změna v externím kalendáři se propíše rodině.
Testované objekty: Calendar Webhook Receiver, Sync Service, Notification Dispatcher.
Vstup: Příchozí Webhook z Google (změna času události ID: 123).
Očekávaný výstup:
Aktualizace start_time v interní DB.
Trigger push notifikace pro všechny členy rodiny připojené k profilu seniora.
Success criteria: Časová prodleva mezi přijetím webhooku a odesláním interní notifikace < 2 sekundy.
Automatizace: Vysoká. Lze simulovat mock-webhookem.
5. Kapitola 5: Integrační scénáře – Rodinný chat a Paywall
Scénář 5.1: Referenční integrita při mazání objektů
Cíl: Ověřit, že smazání léku/úkolu nezpůsobí pád chatového modulu.
Testované objekty: Medication Service, Chat Service, Audit Log.
Akce: Smazání (Soft delete) objektu Medication_ID_789.
Očekávaný výstup: Chat k ID 789 je označen jako archived. UI chatu při pokusu o zobrazení historie starého objektu (přes audit log) nesmí skončit chybou 404, ale zobrazit read-only historii.
Success criteria: API vrátí historii chatu i pro neexistující (archived) rodičovský objekt.
Automatizace: Střední.
Scénář 5.2: Dynamický Paywall (Frozen Data)
Cíl: Ověřit, že přechod Premium -> Free správně omezuje viditelnost dat.
Testované objekty: Subscription Service, Chat API, Frontend Renderer.
Stav: Předplatné vypršelo (T-1 den).
Vstupní data: Dotaz na historii chatu (stáří zpráv 10 dní).
Očekávaný výstup: API vrátí zprávy, ale s příznakem restricted: true. Frontend nahradí text zprávy (blurred placeholder).
Success criteria: Uživatel bez Premium nevidí čitelný text zpráv starších 7 dní, ale vidí jejich existenci.
Automatizace: Vysoká.
6. Kapitola 6: Akceptační kritéria a seznam automatizace
Technická akceptační kritéria (DoR - Definition of Ready for Release)
Eskalační spolehlivost: 100 % eskalačních jobů musí být v Redis vytvořeno/zrušeno v souladu se stavem potvrzení.
Datová integrita: Žádná operace (mazání, OCR import) nesmí zanechat "osiřelé" (orphaned) záznamy v chatu nebo v kalendáři.
Sync Latency: Změna v externím kalendáři musí být v aplikaci viditelná (včetně notifikace) do 5 minut (při využití polling fallbacku) nebo do 30 sekund (při webhooku).
Auth Persistence: Senior Mode musí udržet relaci (session) po dobu min. 180 dní bez nutnosti manuálního re-loginu.
Prioritizovaný seznam k okamžité automatizaci
P0: Eskalační logika (Scénář 2.1) – Jádro aplikace, nejvyšší riziko pro business.
P0: OCR Schema & Conflict (Scénář 3.1) – Ochrana proti poškození lékového plánu.
P1: Auth Refresh Flow (Scénář 2.2) – Kritické pro UX seniora.
P1: Calendar Webhook Handler (Scénář 4.1) – Klíčové pro koordinaci rodiny.
P2: Paywall Logic (Scénář 5.2) – Ochrana business modelu.