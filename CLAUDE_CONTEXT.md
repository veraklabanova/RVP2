# RodiceVPeci 2.0 – Kontext projektu pro Claude

> Tento dokument slouží k rychlému navázání práce v nové Claude session.
> Poslední aktualizace: 2026-02-23

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

---

## 2. Struktura projektu

```
RodiceVPeci_2.0/
├── .claude/                          # Claude Code nastavení
│   └── settings.local.json
├── app/                              # Next.js aplikace
│   ├── src/
│   │   ├── app/                      # Stránky (App Router)
│   │   │   ├── dashboard/page.tsx    # Hlavní nástěnka
│   │   │   ├── kalendar/page.tsx     # Kalendář péče + externí sync
│   │   │   ├── nastaveni/            # Nastavení + report
│   │   │   │   ├── page.tsx
│   │   │   │   └── report/page.tsx   # Měsíční analytický report
│   │   │   ├── notifikace/page.tsx   # Notifikační centrum
│   │   │   ├── onboarding/page.tsx   # Onboarding flow
│   │   │   ├── pruvodce/             # Průvodce nároky
│   │   │   │   ├── page.tsx
│   │   │   │   └── test-naroku/page.tsx  # Smart Test (8 otázek)
│   │   │   ├── senior-mode/page.tsx  # Zjednodušený UI pro seniory
│   │   │   ├── sos/page.tsx          # SOS krizová karta
│   │   │   ├── trezor/              # Trezor (léky + dokumenty)
│   │   │   │   ├── page.tsx
│   │   │   │   └── ocr/page.tsx     # OCR skenování eReceptů
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Root redirect
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx     # Hlavní wrapper (4 nested Context providery)
│   │   │   │   ├── TopNav.tsx
│   │   │   │   └── BottomNav.tsx
│   │   │   └── ui/
│   │   │       ├── ChatBubble.tsx
│   │   │       ├── ChatThread.tsx    # Chat overlay s paywall logikou
│   │   │       ├── ComplianceGrid.tsx
│   │   │       ├── MedicationCheckboxCard.tsx
│   │   │       ├── NotificationBadge.tsx
│   │   │       └── SyncIndicator.tsx
│   │   ├── data/
│   │   │   └── mock.ts              # Veškerá mock data (~32 KB)
│   │   ├── lib/
│   │   │   ├── types.ts             # Všechny TypeScript typy
│   │   │   ├── store.ts             # AppContext (activeParent, tier, seniorMode)
│   │   │   ├── notification-store.ts
│   │   │   ├── chat-store.ts
│   │   │   └── medication-store.ts
│   │   └── __tests__/               # Testy (157 celkem, 0 selhání)
│   │       ├── setup.ts             # scrollIntoView mock, jest-dom
│   │       ├── types.test.ts        # 12 testů – typová kompatibilita
│   │       ├── stores.test.ts       # 2 testy – výchozí hodnoty stores
│   │       ├── mock-data.test.ts    # 42 testů – integrita mock dat
│   │       ├── components.test.tsx  # 21 testů – UI komponenty
│   │       ├── pages.test.tsx       # 21 testů – renderování stránek
│   │       ├── integration.test.tsx # 24 testů – integrační (SC 2.1–5.2)
│   │       └── uat.test.tsx         # 35 testů – UAT (SC 2.1–5.1 + AC 1–8)
│   ├── vitest.config.ts
│   ├── package.json
│   └── tsconfig.json
├── archiv_f1/                        # Zálohovaný kód Fáze 1
├── dokumentace_f1/                   # Dokumentace Fáze 1
├── dokumentace_f2/                   # Dokumentace Fáze 2
│   ├── *.docx (8 souborů)           # Původní specifikace
│   ├── dokumentace_f2_komplet.md    # Sloučený markdown všech docx
│   └── testy/
│       ├── IntAutTesty.md           # Specifikace integračních testů
│       └── UATesty.md               # Specifikace UAT testů
├── start.bat                         # Rychlé spuštění (npm install + kill port + dev)
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

### Senior Mode
- Zjednodušené UI bez navigace
- Pouze VZAL/A JSEM + TEĎ NE tlačítka
- Žádné editační funkce

---

## 4. Fáze implementace

### Fáze 1 (dokončena, archivována v `archiv_f1/`)
- Základní PWA: dashboard, trezor, kalendář, průvodce, SOS, onboarding
- 5 stránek, základní layout, mock data

### Fáze 2 (dokončena, 7 KROKů)
| KROK | Feature | Stav |
|------|---------|------|
| 0 | Typy + Mock data (Phase 2 rozšíření) | ✅ |
| 1 | Lékový asistent (MedicationCheckboxCard, ComplianceGrid) | ✅ |
| 2 | Notifikační centrum (kategorie, filtry, archivace) | ✅ |
| 3 | Rodinný chat (ChatThread, ChatBubble, @zmínky, paywall) | ✅ |
| 4 | Smart Test nároků (8 otázek, výsledky, premium lock) | ✅ |
| 5 | Kalendářní integrace (externí toggle, SyncIndicator) | ✅ |
| 6 | OCR skenování (scan → review → confirm, confidence score) | ✅ |
| 7 | Měsíční report (compliance graf, návštěvy, aktivita, export) | ✅ |

**Entry points:**
- Dashboard → Smart Test CTA karta
- Trezor → ComplianceGrid + OCR tlačítko
- Nastavení → Propojené kalendáře + Report link

**Build:** ✅ 15 routes zkompilováno, 0 chyb

---

## 5. Testování

### Testovací stack
```bash
npm run test        # vitest run (jednorázový běh)
npm run test:watch  # vitest (watch mode)
```

### Výsledky (2026-02-23)
```
7 souborů | 157 testů | 0 selhání | ~4.4s
```

| Soubor | Testů | Zaměření |
|--------|-------|----------|
| types.test.ts | 12 | Compile-time typová kompatibilita |
| stores.test.ts | 2 | Výchozí hodnoty stores |
| mock-data.test.ts | 42 | Integrita všech mock dat |
| components.test.tsx | 21 | NotificationBadge, MedicationCheckboxCard, ComplianceGrid, SyncIndicator, ChatBubble |
| pages.test.tsx | 21 | Renderování: Dashboard, Notifikace, Kalendar, Trezor, Nastaveni, Smart Test |
| integration.test.tsx | 24 | SC 2.1 Eskalace, SC 2.2 Senior, SC 3.1 OCR, SC 4.1 Calendar, SC 5.1 Chat, SC 5.2 Paywall |
| uat.test.tsx | 35 | UAT 2.1 Snooze, UAT 2.2 Krizová eskalace, UAT 2.3 Offline, UAT 3.1–3.2 Kalendář, UAT 4.1 OCR, UAT 5.1 Retention, AC 1–8 |

### Známé stderr varování (neblokující)
```
Cannot update a component (`IntegrationWrapper`/`UATWrapper`) while rendering
a different component (`ChatThread`).
```
→ Způsobeno `getOrCreateThread` voláním `setChatThreads` během renderování ChatThread.
  Testy prochází, chování je korektní. Oprava vyžaduje refactor do useEffect.

### Testovací vzory
- **IntegrationWrapper / UATWrapper**: Plná replika AppShell kontextové logiky (~200 řádků)
- **View toggle pattern**: `useState<'view1' | 'view2'>` uvnitř wrapperu pro cross-view testy (sdílí stav)
- **Fake timers**: `vi.useFakeTimers()` + `vi.advanceTimersByTime()` pro OCR a Smart Test setTimeout
- **Mock scrollIntoView**: `Element.prototype.scrollIntoView = () => {}` v setup.ts (jsdom limitation)

---

## 6. Klíčové soubory pro editaci

| Soubor | Proč je důležitý |
|--------|-----------------|
| `app/src/data/mock.ts` | Centrální zdroj dat (parents, tasks, meds, notifications, chat, OCR, report) |
| `app/src/lib/types.ts` | Všechny TypeScript interface |
| `app/src/components/layout/AppShell.tsx` | Hlavní wrapper s 4 context providery |
| `app/src/components/ui/ChatThread.tsx` | Chat overlay + paywall logika (7-day filter) |
| `app/src/app/senior-mode/page.tsx` | Senior Mode UI (VZAL/A JSEM, TEĎ NE) |
| `app/src/app/trezor/ocr/page.tsx` | OCR flow (ready → scanning → results → applied) |
| `app/vitest.config.ts` | Vitest konfigurace (@/ alias, jsdom, react plugin) |

---

## 7. Příkazy

```bash
# Vývoj
cd D:\___DEV\RodiceVPeci_2.0\app
npm run dev          # Next.js dev server (port 3000)
npm run build        # Produkční build
npm run test         # Všechny testy (vitest run)
npm run test:watch   # Testy v watch mode

# Rychlý start (Windows)
D:\___DEV\RodiceVPeci_2.0\start.bat
```

---

## 8. Co dělat dál (možné další kroky)

1. **Refactor ChatThread**: Opravit `getOrCreateThread` volání v renderování → přesunout do `useEffect` (odstraní stderr warning)
2. **E2E testy**: Přidat Playwright/Cypress pro end-to-end testování
3. **Backend integrace**: Nahradit mock data skutečným API
4. **PWA manifest**: Service worker, offline podpora, push notifikace
5. **Accessibility audit**: ARIA labels, keyboard navigation, screen reader
6. **Performance**: React.memo, useMemo pro velké seznamy, lazy loading stránek

---

## 9. Důležité poznámky pro Claude

- **Path**: Vždy používej `/d/___DEV/RodiceVPeci_2.0/app` (forward slashes) pro bash příkazy
- **Windows**: Projekt běží na Windows, ale bash přes Git Bash/WSL
- **Mock data**: Všechna data v `mock.ts` – datumy jsou z ledna 2024
- **Paywall testy**: Mock zprávy jsou z 2024 → pro trial/standard jsou vždy za paywallem (>7 dní)
- **Senior Mode**: `activeParent` default je `'mama'` → 3 waiting léky (ms-2, ms-3, ms-4)
- **Import alias**: `@/` = `app/src/` (konfigurováno v tsconfig.json i vitest.config.ts)
- **Jazyk**: UI je v češtině, kód a komentáře mix CZ/EN
