# RodiceVPeci 2.0 – Kontext projektu pro Claude

> Tento dokument slouží k rychlému navázání práce v nové Claude session.
> Poslední aktualizace: 2026-04-01

---

## 1. O projektu

**RodiceVPeci 2.0** je PWA aplikace pro rodinné pečovatele o seniory.
Pomáhá koordinovat léky, kalendář, dokumenty, komunikaci a nároky na dávky.

| Vlastnost | Hodnota |
|-----------|---------|
| Framework | Next.js 16.1.6 (App Router) |
| React | 19.2.3 |
| CSS | TailwindCSS 4 |
| TypeScript | 5 |
| Testování | Vitest 4.0.18 + @testing-library/react 16 + jsdom 28 |
| Prostředí | Windows, `D:\___DEV\RodiceVPeci_2.0` |
| Node | npm (ne yarn/pnpm) |
| GitHub | https://github.com/veraklabanova/RVP2 |
| Deploy | Vercel (Root Directory: `app`, preset: Next.js) |
| Primární barva | #1A73E8 (modrá, změněna z #1E4620 zelená v PAB revizi) |

---

## 2. Struktura projektu

```
RodiceVPeci_2.0/
├── .claude/                          # Claude Code nastavení
│   └── settings.local.json
├── app/                              # Next.js aplikace (= Vercel Root Directory)
│   ├── src/
│   │   ├── app/                      # Stránky (App Router)
│   │   │   ├── dashboard/page.tsx    # Dashboard: 4 karty (léky, termíny, chat feed, compliance)
│   │   │   ├── leky/page.tsx         # ★ NOVÉ: Lékový asistent (3 taby: Dnes/Plán/Compliance)
│   │   │   ├── chat/page.tsx         # ★ NOVÉ: Chat inbox (seznam vláken)
│   │   │   ├── kalendar/page.tsx     # Kalendář péče + externí sync
│   │   │   ├── nastaveni/            # Nastavení + report
│   │   │   │   ├── page.tsx
│   │   │   │   └── report/page.tsx   # Měsíční analytický report
│   │   │   ├── notifikace/page.tsx   # Notifikační centrum (swipe L/R, pull-to-refresh)
│   │   │   ├── onboarding/page.tsx   # Onboarding flow
│   │   │   ├── pruvodce/             # Průvodce nároky
│   │   │   │   ├── page.tsx          # Hero Smart Test karta + katalog průvodců
│   │   │   │   └── test-naroku/page.tsx  # Smart Test (8 otázek, progress save R6)
│   │   │   ├── senior-mode/page.tsx  # Senior Mode (2-tap 5s, haptic, offline, tab LÉKY/ÚKOLY)
│   │   │   ├── sos/page.tsx          # SOS krizová karta
│   │   │   ├── trezor/              # Trezor (zachováno z F1, ale nav přesměrován na /leky)
│   │   │   │   ├── page.tsx
│   │   │   │   └── ocr/page.tsx     # OCR skenování eReceptů
│   │   │   ├── layout.tsx            # Root layout (themeColor: #1A73E8)
│   │   │   ├── page.tsx             # Root redirect
│   │   │   └── globals.css          # Design tokeny (PAB barvy)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx     # Hlavní wrapper (4 nested Context providery)
│   │   │   │   ├── TopNav.tsx       # Header: avatar+přepínač | sekce | chat+notif
│   │   │   │   └── BottomNav.tsx    # 5 tabů: Dashboard|Léky|Kalendář|Průvodce|Nastavení
│   │   │   └── ui/
│   │   │       ├── ChatBubble.tsx   # Chat bublina (sent/pending/failed stavy R14)
│   │   │       ├── ChatThread.tsx   # Chat overlay (offline R10, audit R12, paywall)
│   │   │       ├── ComplianceGrid.tsx
│   │   │       ├── MedicationCheckboxCard.tsx
│   │   │       ├── NotificationBadge.tsx
│   │   │       └── SyncIndicator.tsx
│   │   ├── data/
│   │   │   └── mock.ts              # Veškerá mock data (~32 KB)
│   │   ├── lib/
│   │   │   ├── types.ts             # Všechny TypeScript typy
│   │   │   ├── store.ts             # AppContext
│   │   │   ├── notification-store.ts
│   │   │   ├── chat-store.ts
│   │   │   └── medication-store.ts
│   │   └── __tests__/               # Testy (157 celkem)
│   ├── vitest.config.ts
│   ├── package.json
│   └── tsconfig.json
├── archiv_f1/                        # Zálohovaný kód Fáze 1
├── dokumentace_f1/                   # Dokumentace Fáze 1
├── dokumentace_f2/                   # Dokumentace Fáze 2
├── PAB_Rodice_v_peci_F2_v1.md       # ★ PAB design dokument (oponentní revize) — zdroj pravdy
├── start.bat                         # Rychlé spuštění
└── CLAUDE_CONTEXT.md                 # ← Tento soubor
```

---

## 3. Architektura

### Context pattern (4 nested providery v AppShell)
```
AppContext → NotificationContext → ChatContext → MedicationContext
```

- **AppContext** (`store.ts`): `activeParent`, `subscriptionTier`, `seniorMode`, `isOnboarded`, `trialDaysLeft`
- **NotificationContext** (`notification-store.ts`): notifications[], markRead, addNotification
- **ChatContext** (`chat-store.ts`): threads[], getThread, getOrCreateThread, sendMessage
- **MedicationContext** (`medication-store.ts`): todaySchedule, weekCompliance, confirmMedication, skipMedication

### Cross-store integrace
- `skipMedication()` → `addNotification()` (eskalace: lék vynechán)
- `sendMessage()` s mentions → `addNotification()` (@zmínka notifikace)

### Subscription tiers a Paywall
| Tier | Chat limit | Report detail |
|------|-----------|---------------|
| trial, standard | 7 dní zpráv | Locked (compliance % viditelné) |
| duo, family | Plný přístup | Plný přístup |
| freezer | 7 dní | Locked |

---

## 4. PAB Oponentní revize (implementováno 2026-04-01)

Zdrojový dokument: `PAB_Rodice_v_peci_F2_v1.md`

### Implementované změny (R1–R15)

| # | Oblast | Co se změnilo | Kde v kódu |
|---|--------|---------------|------------|
| R1 | Senior Mode potvrzení | Timeout 2s → **5s** dvoustupňový tap | `senior-mode/page.tsx` |
| R2 | Lékové karty | Swipe nahrazen **explicitním tlačítkem** "Potvrdit za rodiče" | `leky/page.tsx`, `dashboard/page.tsx` |
| R3 | Tichý režim | Konfigurovatelná **noční eskalace per lék** (toggle, ikona 🌙) | `types.ts` (nightEscalation), `leky/page.tsx` |
| R4 | Senior Mode offline | **Offline banner** + lokální potvrzení | `senior-mode/page.tsx` |
| R5 | Dashboard multi-profil | **Přepínač profilů** v headeru (avatar + dropdown) | `TopNav.tsx` |
| R6 | Smart Test | **Ukládání progressu** do localStorage + resume dialog | `test-naroku/page.tsx` |
| R7 | Haptic feedback | **Vibrace 100ms** při potvrzení léku (Vibration API) | `senior-mode/page.tsx` |
| R8 | Pull-to-refresh | **Ruční sync** indikátor na notifikacích | `notifikace/page.tsx` |
| R9 | Swipe notifikace | **Swipe doprava** → kontextová primární akce | `notifikace/page.tsx` |
| R10 | Offline chat | **Offline stav** + fronta zpráv | `ChatThread.tsx` |
| R11 | Compliance legenda | **Legenda barev** pod mřížkou | `leky/page.tsx`, `dashboard/page.tsx` |
| R12 | Chat audit trail | **Info banner** o permanenci zpráv (dismiss jednou) | `ChatThread.tsx` |
| R13 | Párování expirace | Chybový stav pro expirovaný kód | `senior-mode/pairing/page.tsx` |
| R14 | Chat failed stav | **Stav "neodeslána"** + retry tlačítko | `ChatBubble.tsx` |

### Hlavní strukturální změny
- **Navigace**: Trezor tab → **Léky tab** (`/leky`), přidán **Chat inbox** (`/chat`)
- **Barvy**: Primární #1E4620 (zelená) → **#1A73E8 (modrá)**
- **BottomNav**: Dashboard | **Léky** | Kalendář | Průvodce | Nastavení + badge na Léky
- **TopNav**: [Avatar+Přepínač] | Název sekce | [💬 Chat] [🔔 Notif]
- **Dashboard**: 4 karty — Dnešní léky (P0), Termíny (P1), Chat Quick-Feed (P1), Compliance mini (P0)
- **Typy rozšířeny**: `MedicationStatus` += `escalated` | `confirmed_by_carer`, `Medication` += `note` | `nightEscalation` | `times`, `ChatMessage` += `status` (sent/pending/failed)

---

## 5. Navigační mapa

### Bottom Tab Bar
| Pozice | Label | Route | Ikona |
|--------|-------|-------|-------|
| 1 | Dashboard | /dashboard | 🏠 |
| 2 | Léky | /leky | 💊 (+ badge nepotvrzených) |
| 3 | Kalendář | /kalendar | 📅 |
| 4 | Průvodce | /pruvodce | 🧭 |
| 5 | Nastavení | /nastaveni | ⚙️ |

### Skryté routy (bez bottom nav)
- `/onboarding` — Onboarding flow
- `/sos` — SOS krizová karta
- `/senior-mode` — Senior Mode
- `/chat` — Chat inbox (přístupný z header ikony)
- `/notifikace` — Notifikační centrum (přístupné z header ikony)

---

## 6. Design tokeny (globals.css)

| Token | HEX | Použití |
|-------|-----|---------|
| --color-primary | #1A73E8 | Navigace, aktivní prvky, odkazy |
| --color-medication | #7B1FA2 | Léky, compliance, připomínky |
| --color-chat | #00796B | Chat bubliny, rodinná komunikace |
| --color-compliance-ok | #43A047 | Podáno, úspěch |
| --color-compliance-miss | #E53935 | Vynecháno, eskalace, chyba |
| --color-offline | #FFF9C4 | Offline bannery |
| --color-chat-own | #E0F2F1 | Vlastní chat bubliny |
| --color-chat-other | #F5F5F5 | Cizí chat bubliny |

---

## 7. Příkazy

```bash
# Vývoj
cd D:\___DEV\RodiceVPeci_2.0\app
npm run dev          # Next.js dev server (port 3000)
npm run build        # Produkční build
npm run test         # Všechny testy (vitest run)
npm run test:watch   # Testy v watch mode

# Git
cd D:\___DEV\RodiceVPeci_2.0
git add ... && git commit && git push   # Auto-deploy na Vercel
```

---

## 8. Deploy (Vercel)

| Nastavení | Hodnota |
|-----------|---------|
| GitHub repo | veraklabanova/RVP2 |
| Root Directory | `app` (MUSÍ být nastaveno v UI při vytváření projektu) |
| Framework Preset | Next.js |
| Branch | main |
| Auto-deploy | Ano (při push na main) |

**Pozor:** `rootDirectory` v `vercel.json` NEFUNGUJE — musí se nastavit v Vercel dashboard UI při importu projektu.

---

## 9. Co dělat dál (možné další kroky)

1. **Testy aktualizovat**: Stávající testy (157) se mohou rozbít kvůli změnám v navigaci (Trezor → Léky) a dashboard layout
2. **Refactor ChatThread**: Opravit `getOrCreateThread` volání v renderování → přesunout do `useEffect`
3. **Přidat lék formulář**: `/leky/pridat` — formulář dle PAB doc (název, dávkování, frekvence, časy, poznámka, noční eskalace toggle)
4. **Detail léku**: `/leky/[id]` — kompletní info + mini compliance + kontextový chat
5. **Senior Mode Denní shrnutí**: Obrazovka ve 21:00 s přehledem dne
6. **Správa sync kalendáře**: OAuth propojení Google Calendar
7. **Mrazák screen**: Soft paywall overlay při Premium funkci
8. **E2E testy**: Playwright/Cypress
9. **Backend integrace**: Nahradit mock data API
10. **PWA manifest**: Service worker, push notifikace

---

## 10. Důležité poznámky pro Claude

- **Path**: Vždy používej `D:/___DEV/RodiceVPeci_2.0/app` pro bash příkazy
- **Windows**: Projekt běží na Windows
- **Mock data**: Všechna data v `mock.ts` — datumy jsou z ledna 2024
- **Paywall testy**: Mock zprávy jsou z 2024 → pro trial/standard jsou vždy za paywallem (>7 dní)
- **Senior Mode**: `activeParent` default je `'mama'` → 3 waiting léky (ms-2, ms-3, ms-4)
- **Import alias**: `@/` = `app/src/` (konfigurováno v tsconfig.json i vitest.config.ts)
- **Jazyk**: UI je v češtině, kód a komentáře mix CZ/EN
- **PAB dokument**: `PAB_Rodice_v_peci_F2_v1.md` je zdroj pravdy pro UI/UX design — obsahuje kompletní specifikaci všech obrazovek, stavů, interakcí a design tokenů
- **Stará route /trezor**: Stále existuje v kódu (zachována), ale v navigaci je nahrazena /leky
