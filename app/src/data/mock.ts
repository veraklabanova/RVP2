import type {
  Parent,
  Task,
  AuditEntry,
  ClaimStep,
  FamilyMember,
  Medication,
  MedicationScheduleEntry,
  ComplianceDay,
  Notification,
  ChatMessage,
  ChatThread,
  ClaimTestQuestion,
  ClaimTestResult,
  CalendarSource,
  ExternalCalendarEvent,
  OCRScanResult,
  MonthlyReport,
  SeniorPairingCode,
} from '@/lib/types';

// ============================================================================
// EXISTING DATA (Phase 1)
// ============================================================================

export const parents: Record<string, Parent> = {
  mama: {
    id: 'mama',
    name: 'Jana Nováková',
    birthYear: 1946,
    personalId: '465215/1234',
    insuranceCompany: 'VZP (111)',
    bloodType: 'A+',
    allergies: ['Penicilin', 'Ibuprofen'],
    criticalDiagnoses: ['Diabetes II. typu', 'Hypertenze', 'Osteoporóza'],
    medications: [
      { id: '1', name: 'Metformin', dosage: '500 mg', frequency: '2x denně', critical: true, note: 'Brát s jídlem', times: ['08:00', '20:00'] },
      { id: '2', name: 'Ramipril', dosage: '5 mg', frequency: '1x denně', critical: true, times: ['08:00'] },
      { id: '3', name: 'Calcium + D3', dosage: '1000 mg', frequency: '1x denně', critical: false, times: ['12:00'] },
      { id: '4', name: 'Warfarin', dosage: '3 mg', frequency: '1x denně', critical: true, note: 'Nedrťte tabletu', times: ['20:00'], nightEscalation: true },
    ],
    iceContact: { name: 'Petr Novák', relation: 'Syn', phone: '+420 777 123 456' },
    lastVerified: '2024-01-15T14:30:00',
  },
  tata: {
    id: 'tata',
    name: 'František Novák',
    birthYear: 1943,
    personalId: '430812/5678',
    insuranceCompany: 'VOZP (201)',
    bloodType: 'O-',
    allergies: ['Aspirin'],
    criticalDiagnoses: ['Kardiostimulátor', 'CHOPN', 'Alzheimer – počáteční stadium'],
    medications: [
      { id: '5', name: 'Donepezil', dosage: '10 mg', frequency: '1x denně', critical: true, note: 'Brát večer', times: ['08:00'] },
      { id: '6', name: 'Spiriva', dosage: '18 mcg', frequency: '1x denně', critical: true, note: 'Inhalace', times: ['08:00'] },
      { id: '7', name: 'Atorvastatin', dosage: '20 mg', frequency: '1x denně', critical: false, times: ['20:00'] },
    ],
    iceContact: { name: 'Petr Novák', relation: 'Syn', phone: '+420 777 123 456' },
    lastVerified: '2024-01-10T09:15:00',
  },
};

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Kardiologie (MUDr. Dvořák)',
    description: 'V aplikaci máte připnutou poslední zprávu.',
    category: 'medical',
    date: '2024-01-20',
    time: '14:00',
    completed: false,
    parentId: 'mama',
    linkedDoc: 'zprava-kardiologie-2024.pdf',
  },
  {
    id: '2',
    title: 'Vyzvednout léky',
    description: 'E-recepty jsou uloženy v Trezoru.',
    category: 'medical',
    date: '2024-01-20',
    completed: false,
    parentId: 'mama',
  },
  {
    id: '3',
    title: 'Sociální šetření',
    description: 'Připravte se na návštěvu úředníka. Podívejte se na našeho průvodce.',
    category: 'admin',
    date: '2024-01-22',
    time: '10:00',
    completed: false,
    parentId: 'mama',
  },
  {
    id: '4',
    title: 'Kontrola u neurologa',
    description: 'Pravidelná kontrola stavu.',
    category: 'medical',
    date: '2024-01-25',
    time: '09:30',
    completed: false,
    parentId: 'tata',
  },
  {
    id: '5',
    title: 'Nákup hygienických potřeb',
    category: 'operational',
    date: '2024-01-21',
    completed: true,
    parentId: 'mama',
  },
];

export const auditLog: AuditEntry[] = [
  {
    id: '1',
    user: 'Petr',
    action: 'zobrazil SOS kartu',
    target: 'tatínka',
    timestamp: '2024-01-20T12:30:00',
  },
  {
    id: '2',
    user: 'Vláďa',
    action: 'zobrazil osobní údaje (OP)',
    target: 'maminky',
    timestamp: '2024-01-20T14:20:00',
  },
  {
    id: '3',
    user: 'Marie',
    action: 'upravila seznam léků',
    target: 'maminky',
    timestamp: '2024-01-19T18:45:00',
  },
  {
    id: '4',
    user: 'Petr',
    action: 'stáhnul plnou moc (lékař)',
    target: 'tatínka',
    timestamp: '2024-01-18T10:00:00',
  },
];

export const claimSteps: ClaimStep[] = [
  {
    id: '1',
    title: 'Podání žádosti',
    status: 'done',
  },
  {
    id: '2',
    title: 'Sociální šetření',
    status: 'active',
    insiderTip: 'Rodiče se před úředníky často přeceňují. Upozorněte na realitu laskavě, ale pravdivě – jde o zajištění důstojné péče.',
  },
  {
    id: '3',
    title: 'Posudkový lékař',
    status: 'pending',
  },
  {
    id: '4',
    title: 'Rozhodnutí',
    status: 'pending',
    insiderTip: 'Co když nás odmítnou? Připravili jsme pro vás vzor odvolání, který zvýší vaše šance.',
  },
];

export const familyMembers: FamilyMember[] = [
  { id: '1', name: 'Marie Nováková', role: 'garant', email: 'marie@email.cz' },
  { id: '2', name: 'Petr Novák', role: 'pecujici', email: 'petr@email.cz' },
  { id: '3', name: 'Vladimír Novák', role: 'ctenar', email: 'vlada@email.cz' },
];

export const calendarEvents = [
  { id: '1', title: 'Kardiologie', date: '2024-01-20', time: '14:00', category: 'medical' as const, parentId: 'mama' as const },
  { id: '2', title: 'Sociální šetření', date: '2024-01-22', time: '10:00', category: 'admin' as const, parentId: 'mama' as const },
  { id: '3', title: 'Neurolog', date: '2024-01-25', time: '09:30', category: 'medical' as const, parentId: 'tata' as const },
  { id: '4', title: 'Vyzvednout léky', date: '2024-01-20', time: '', category: 'medical' as const, parentId: 'mama' as const },
  { id: '5', title: 'Oprava zábradlí', date: '2024-01-23', time: '15:00', category: 'operational' as const, parentId: 'tata' as const },
  { id: '6', title: 'Kontrola u praktika', date: '2024-01-28', time: '11:00', category: 'medical' as const, parentId: 'mama' as const },
  { id: '7', title: 'Podání formuláře ZTP', date: '2024-01-29', time: '', category: 'admin' as const, parentId: 'tata' as const },
];

// ============================================================================
// PHASE 2: Lékový asistent – Denní rozvrh
// ============================================================================

export const medicationSchedule: MedicationScheduleEntry[] = [
  // Mama – 4 entries
  {
    id: 'ms-1',
    medicationId: '1',
    medicationName: 'Metformin',
    dosage: '500 mg',
    parentId: 'mama',
    scheduledTime: '08:00',
    status: 'taken',
    confirmedAt: '2024-01-20T08:05:00',
    confirmedBy: 'Marie Nováková',
    note: 'Brát s jídlem',
  },
  {
    id: 'ms-2',
    medicationId: '2',
    medicationName: 'Ramipril',
    dosage: '5 mg',
    parentId: 'mama',
    scheduledTime: '08:00',
    status: 'waiting',
  },
  {
    id: 'ms-3',
    medicationId: '3',
    medicationName: 'Calcium + D3',
    dosage: '1000 mg',
    parentId: 'mama',
    scheduledTime: '12:00',
    status: 'waiting',
  },
  {
    id: 'ms-4',
    medicationId: '4',
    medicationName: 'Warfarin',
    dosage: '3 mg',
    parentId: 'mama',
    scheduledTime: '20:00',
    status: 'waiting',
  },
  // Tata – 3 entries
  {
    id: 'ms-5',
    medicationId: '5',
    medicationName: 'Donepezil',
    dosage: '10 mg',
    parentId: 'tata',
    scheduledTime: '08:00',
    status: 'taken',
    confirmedAt: '2024-01-20T08:12:00',
    confirmedBy: 'Petr Novák',
  },
  {
    id: 'ms-6',
    medicationId: '6',
    medicationName: 'Spiriva',
    dosage: '18 mcg',
    parentId: 'tata',
    scheduledTime: '08:00',
    status: 'taken',
    confirmedAt: '2024-01-20T08:15:00',
    confirmedBy: 'Petr Novák',
  },
  {
    id: 'ms-7',
    medicationId: '7',
    medicationName: 'Atorvastatin',
    dosage: '20 mg',
    parentId: 'tata',
    scheduledTime: '20:00',
    status: 'waiting',
  },
];

// ============================================================================
// PHASE 2: Lékový asistent – Týdenní compliance
// ============================================================================

export const complianceWeek: ComplianceDay[] = [
  {
    date: '2024-01-15',
    entries: [
      { id: 'cw-1-1', medicationId: '1', medicationName: 'Metformin', dosage: '500 mg', parentId: 'mama', scheduledTime: '08:00', status: 'taken', confirmedAt: '2024-01-15T08:10:00', confirmedBy: 'Marie Nováková' },
      { id: 'cw-1-2', medicationId: '2', medicationName: 'Ramipril', dosage: '5 mg', parentId: 'mama', scheduledTime: '08:00', status: 'taken', confirmedAt: '2024-01-15T08:10:00', confirmedBy: 'Marie Nováková' },
      { id: 'cw-1-3', medicationId: '3', medicationName: 'Calcium + D3', dosage: '1000 mg', parentId: 'mama', scheduledTime: '12:00', status: 'taken', confirmedAt: '2024-01-15T12:20:00', confirmedBy: 'Marie Nováková' },
      { id: 'cw-1-4', medicationId: '4', medicationName: 'Warfarin', dosage: '3 mg', parentId: 'mama', scheduledTime: '20:00', status: 'taken', confirmedAt: '2024-01-15T20:05:00', confirmedBy: 'Petr Novák' },
    ],
  },
  {
    date: '2024-01-16',
    entries: [
      { id: 'cw-2-1', medicationId: '1', medicationName: 'Metformin', dosage: '500 mg', parentId: 'mama', scheduledTime: '08:00', status: 'taken', confirmedAt: '2024-01-16T08:30:00', confirmedBy: 'Marie Nováková' },
      { id: 'cw-2-2', medicationId: '2', medicationName: 'Ramipril', dosage: '5 mg', parentId: 'mama', scheduledTime: '08:00', status: 'taken', confirmedAt: '2024-01-16T08:30:00', confirmedBy: 'Marie Nováková' },
      { id: 'cw-2-3', medicationId: '3', medicationName: 'Calcium + D3', dosage: '1000 mg', parentId: 'mama', scheduledTime: '12:00', status: 'missed' },
      { id: 'cw-2-4', medicationId: '4', medicationName: 'Warfarin', dosage: '3 mg', parentId: 'mama', scheduledTime: '20:00', status: 'taken', confirmedAt: '2024-01-16T20:15:00', confirmedBy: 'Petr Novák' },
    ],
  },
  {
    date: '2024-01-17',
    entries: [
      { id: 'cw-3-1', medicationId: '1', medicationName: 'Metformin', dosage: '500 mg', parentId: 'mama', scheduledTime: '08:00', status: 'taken', confirmedAt: '2024-01-17T08:05:00', confirmedBy: 'Marie Nováková' },
      { id: 'cw-3-2', medicationId: '2', medicationName: 'Ramipril', dosage: '5 mg', parentId: 'mama', scheduledTime: '08:00', status: 'missed' },
      { id: 'cw-3-3', medicationId: '3', medicationName: 'Calcium + D3', dosage: '1000 mg', parentId: 'mama', scheduledTime: '12:00', status: 'taken', confirmedAt: '2024-01-17T12:10:00', confirmedBy: 'Marie Nováková' },
      { id: 'cw-3-4', medicationId: '4', medicationName: 'Warfarin', dosage: '3 mg', parentId: 'mama', scheduledTime: '20:00', status: 'taken', confirmedAt: '2024-01-17T20:00:00', confirmedBy: 'Marie Nováková' },
    ],
  },
  {
    date: '2024-01-18',
    entries: [
      { id: 'cw-4-1', medicationId: '1', medicationName: 'Metformin', dosage: '500 mg', parentId: 'mama', scheduledTime: '08:00', status: 'taken', confirmedAt: '2024-01-18T08:20:00', confirmedBy: 'Petr Novák' },
      { id: 'cw-4-2', medicationId: '2', medicationName: 'Ramipril', dosage: '5 mg', parentId: 'mama', scheduledTime: '08:00', status: 'taken', confirmedAt: '2024-01-18T08:20:00', confirmedBy: 'Petr Novák' },
      { id: 'cw-4-3', medicationId: '3', medicationName: 'Calcium + D3', dosage: '1000 mg', parentId: 'mama', scheduledTime: '12:00', status: 'taken', confirmedAt: '2024-01-18T12:45:00', confirmedBy: 'Marie Nováková' },
      { id: 'cw-4-4', medicationId: '4', medicationName: 'Warfarin', dosage: '3 mg', parentId: 'mama', scheduledTime: '20:00', status: 'missed' },
    ],
  },
  {
    date: '2024-01-19',
    entries: [
      { id: 'cw-5-1', medicationId: '1', medicationName: 'Metformin', dosage: '500 mg', parentId: 'mama', scheduledTime: '08:00', status: 'taken', confirmedAt: '2024-01-19T08:00:00', confirmedBy: 'Marie Nováková' },
      { id: 'cw-5-2', medicationId: '2', medicationName: 'Ramipril', dosage: '5 mg', parentId: 'mama', scheduledTime: '08:00', status: 'taken', confirmedAt: '2024-01-19T08:00:00', confirmedBy: 'Marie Nováková' },
      { id: 'cw-5-3', medicationId: '3', medicationName: 'Calcium + D3', dosage: '1000 mg', parentId: 'mama', scheduledTime: '12:00', status: 'missed' },
      { id: 'cw-5-4', medicationId: '4', medicationName: 'Warfarin', dosage: '3 mg', parentId: 'mama', scheduledTime: '20:00', status: 'taken', confirmedAt: '2024-01-19T20:30:00', confirmedBy: 'Vladimír Novák' },
    ],
  },
  {
    date: '2024-01-20',
    entries: [
      { id: 'cw-6-1', medicationId: '1', medicationName: 'Metformin', dosage: '500 mg', parentId: 'mama', scheduledTime: '08:00', status: 'taken', confirmedAt: '2024-01-20T08:05:00', confirmedBy: 'Marie Nováková' },
      { id: 'cw-6-2', medicationId: '2', medicationName: 'Ramipril', dosage: '5 mg', parentId: 'mama', scheduledTime: '08:00', status: 'waiting' },
      { id: 'cw-6-3', medicationId: '3', medicationName: 'Calcium + D3', dosage: '1000 mg', parentId: 'mama', scheduledTime: '12:00', status: 'waiting' },
      { id: 'cw-6-4', medicationId: '4', medicationName: 'Warfarin', dosage: '3 mg', parentId: 'mama', scheduledTime: '20:00', status: 'waiting' },
    ],
  },
  {
    date: '2024-01-21',
    entries: [
      { id: 'cw-7-1', medicationId: '1', medicationName: 'Metformin', dosage: '500 mg', parentId: 'mama', scheduledTime: '08:00', status: 'waiting' },
      { id: 'cw-7-2', medicationId: '2', medicationName: 'Ramipril', dosage: '5 mg', parentId: 'mama', scheduledTime: '08:00', status: 'waiting' },
      { id: 'cw-7-3', medicationId: '3', medicationName: 'Calcium + D3', dosage: '1000 mg', parentId: 'mama', scheduledTime: '12:00', status: 'waiting' },
      { id: 'cw-7-4', medicationId: '4', medicationName: 'Warfarin', dosage: '3 mg', parentId: 'mama', scheduledTime: '20:00', status: 'waiting' },
    ],
  },
];

// ============================================================================
// PHASE 2: Notifikace
// ============================================================================

export const notifications: Notification[] = [
  // leky
  {
    id: 'notif-1',
    category: 'leky',
    priority: 'high',
    title: 'Nepotvrzený lék',
    body: 'Maminka nepotvrdila lék Warfarin (20:00). Zkontrolujte prosím.',
    timestamp: '2024-01-20T20:45:00',
    read: false,
    archived: false,
    actionUrl: '/leky/mama',
    linkedEntityId: '4',
    linkedEntityType: 'medication',
  },
  {
    id: 'notif-2',
    category: 'leky',
    priority: 'normal',
    title: 'Léky podány v pořádku',
    body: 'Všechny ranní léky tatínka byly potvrzeny.',
    timestamp: '2024-01-20T08:20:00',
    read: true,
    archived: false,
    linkedEntityType: 'medication',
  },
  // kalendar
  {
    id: 'notif-3',
    category: 'kalendar',
    priority: 'normal',
    title: 'Připomínka schůzky',
    body: 'Zítra 10:00 – Kontrola u kardiologa (maminka)',
    timestamp: '2024-01-19T18:00:00',
    read: false,
    archived: false,
    actionUrl: '/kalendar',
    linkedEntityId: '1',
    linkedEntityType: 'event',
  },
  {
    id: 'notif-4',
    category: 'kalendar',
    priority: 'high',
    title: 'Chyba synchronizace',
    body: 'Chyba synchronizace kalendáře Google. Zkontrolujte připojení.',
    timestamp: '2024-01-20T06:00:00',
    read: false,
    archived: false,
    actionUrl: '/nastaveni/kalendar',
  },
  // rodina
  {
    id: 'notif-5',
    category: 'rodina',
    priority: 'normal',
    title: 'Zmínka v diskuzi',
    body: 'Petr vás zmínil v diskuzi u dokumentu Plná moc.',
    timestamp: '2024-01-20T11:00:00',
    read: false,
    archived: false,
    actionUrl: '/chat/thread-3',
    linkedEntityId: 'thread-3',
    linkedEntityType: 'chat',
  },
  {
    id: 'notif-6',
    category: 'rodina',
    priority: 'normal',
    title: 'Nová zpráva',
    body: 'Nová zpráva od Marie v diskuzi ke Kardiologii.',
    timestamp: '2024-01-19T16:30:00',
    read: true,
    archived: false,
    actionUrl: '/chat/thread-1',
    linkedEntityId: 'thread-1',
    linkedEntityType: 'chat',
  },
  // system
  {
    id: 'notif-7',
    category: 'system',
    priority: 'low',
    title: 'Průvodce aktualizován',
    body: 'Průvodce ZTP/P byl aktualizován podle nejnovější legislativy.',
    timestamp: '2024-01-18T09:00:00',
    read: true,
    archived: false,
    actionUrl: '/pruvodce/ztp',
  },
  {
    id: 'notif-8',
    category: 'system',
    priority: 'normal',
    title: 'Expirace průkazu',
    body: 'Expirace průkazu ZTP za 30 dní. Nezapomeňte na včasné prodloužení.',
    timestamp: '2024-01-20T07:00:00',
    read: false,
    archived: false,
    actionUrl: '/dokumenty/ztp',
    linkedEntityId: 'doc-ztp',
    linkedEntityType: 'document',
  },
  {
    id: 'notif-9',
    category: 'system',
    priority: 'low',
    title: 'Legislativní změna',
    body: 'Nová legislativa: Zvýšení příspěvku na péči od 1. 7. 2024.',
    timestamp: '2024-01-17T10:00:00',
    read: true,
    archived: false,
    actionUrl: '/pruvodce/pnp',
  },
  {
    id: 'notif-10',
    category: 'system',
    priority: 'normal',
    title: 'Report připraven',
    body: 'Compliance report za leden 2024 je připraven ke stažení.',
    timestamp: '2024-01-20T00:05:00',
    read: false,
    archived: false,
    actionUrl: '/reporty/leden-2024',
  },
];

// ============================================================================
// PHASE 2: Rodinný chat
// ============================================================================

export const chatThreads: ChatThread[] = [
  {
    id: 'thread-1',
    contextType: 'task',
    contextId: '1',
    contextLabel: 'Kardiologie (MUDr. Dvořák)',
    lastActivity: '2024-01-20T14:45:00',
    messages: [
      {
        id: 'msg-1-1',
        threadId: 'thread-1',
        senderId: '1',
        senderName: 'Marie Nováková',
        text: 'Objednala jsem maminku na kardiologii na 20. 1. ve 14:00. Kdo ji tam doveze?',
        timestamp: '2024-01-18T10:00:00',
      },
      {
        id: 'msg-1-2',
        threadId: 'thread-1',
        senderId: '2',
        senderName: 'Petr Novák',
        text: 'Já to vezmu. Mám ten den volno. Potřebuje s sebou nějaké dokumenty?',
        timestamp: '2024-01-18T10:30:00',
      },
      {
        id: 'msg-1-3',
        threadId: 'thread-1',
        senderId: '1',
        senderName: 'Marie Nováková',
        text: 'Ano, vezmi poslední kardiologickou zprávu a seznam léků. Obojí je v Trezoru.',
        timestamp: '2024-01-18T11:15:00',
        mentions: ['2'],
      },
      {
        id: 'msg-1-4',
        threadId: 'thread-1',
        senderId: '3',
        senderName: 'Vladimír Novák',
        text: 'Díky @Petr, že to bereš. Dej vědět, jak to dopadlo.',
        timestamp: '2024-01-18T12:00:00',
        mentions: ['2'],
      },
    ],
  },
  {
    id: 'thread-2',
    contextType: 'medication',
    contextId: '4',
    contextLabel: 'Warfarin (maminka)',
    lastActivity: '2024-01-20T09:30:00',
    messages: [
      {
        id: 'msg-2-1',
        threadId: 'thread-2',
        senderId: '1',
        senderName: 'Marie Nováková',
        text: 'Maminka včera zapomněla vzít Warfarin. Je to třetí vynechání tento měsíc. Měli bychom to probrat s doktorem?',
        timestamp: '2024-01-19T08:00:00',
      },
      {
        id: 'msg-2-2',
        threadId: 'thread-2',
        senderId: '2',
        senderName: 'Petr Novák',
        text: 'Souhlasím, u Warfarinu je to dost kritické. Zavolám MUDr. Dvořákovi jestli to neovlivní INR hodnoty.',
        timestamp: '2024-01-19T08:45:00',
      },
      {
        id: 'msg-2-3',
        threadId: 'thread-2',
        senderId: '1',
        senderName: 'Marie Nováková',
        text: 'Dobrý nápad. Možná by pomohla připomínka přímo na telefon maminky. Zkusím nastavit senior režim.',
        timestamp: '2024-01-20T09:30:00',
      },
    ],
  },
  {
    id: 'thread-3',
    contextType: 'document',
    contextId: 'doc-plnamoc',
    contextLabel: 'Plná moc',
    lastActivity: '2024-01-20T11:00:00',
    messages: [
      {
        id: 'msg-3-1',
        threadId: 'thread-3',
        senderId: '2',
        senderName: 'Petr Novák',
        text: '@Marie, plná moc pro lékaře je hotová. Potřebujeme ji ještě ověřit na CzechPointu.',
        timestamp: '2024-01-20T10:30:00',
        mentions: ['1'],
      },
      {
        id: 'msg-3-2',
        threadId: 'thread-3',
        senderId: '1',
        senderName: 'Marie Nováková',
        text: 'Super, díky Petře. Zajdu tam zítra dopoledne. Je to jen pro maminku nebo i pro tatínka?',
        timestamp: '2024-01-20T11:00:00',
      },
    ],
  },
];

// ============================================================================
// PHASE 2: Smart Test nároků
// ============================================================================

export const claimTestQuestions: ClaimTestQuestion[] = [
  {
    id: 'q1',
    text: 'Jaký je věk seniora?',
    options: [
      { value: 'pod65', label: 'Pod 65 let' },
      { value: '65-75', label: '65–75 let' },
      { value: '75-85', label: '75–85 let' },
      { value: 'nad85', label: 'Nad 85 let' },
    ],
  },
  {
    id: 'q2',
    text: 'Jaká je hlavní diagnóza seniora?',
    options: [
      { value: 'chronicke', label: 'Chronické onemocnění' },
      { value: 'demence', label: 'Demence' },
      { value: 'pohybove', label: 'Pohybové omezení' },
      { value: 'jine', label: 'Jiné' },
    ],
  },
  {
    id: 'q3',
    text: 'Jak je na tom senior s mobilitou?',
    options: [
      { value: 'sam', label: 'Chodí sám bez pomoci' },
      { value: 'pomoc', label: 'Chodí s pomocí (hůl, chodítko)' },
      { value: 'vozik', label: 'Používá invalidní vozík' },
      { value: 'lezici', label: 'Ležící pacient' },
    ],
  },
  {
    id: 'q4',
    text: 'Jak zvládá senior osobní hygienu?',
    options: [
      { value: 'sam', label: 'Zvládá sám bez potíží' },
      { value: 'castecne', label: 'Částečně – potřebuje dohled' },
      { value: 'pomoc', label: 'Potřebuje fyzickou pomoc' },
      { value: 'zavislost', label: 'Úplná závislost na pomoci druhé osoby' },
    ],
  },
  {
    id: 'q5',
    text: 'Jaké jsou měsíční příjmy seniora?',
    options: [
      { value: 'do10', label: 'Do 10 000 Kč' },
      { value: '10-15', label: '10 000–15 000 Kč' },
      { value: '15-20', label: '15 000–20 000 Kč' },
      { value: 'nad20', label: 'Nad 20 000 Kč' },
    ],
  },
  {
    id: 'q6',
    text: 'Kde senior bydlí?',
    options: [
      { value: 'dum', label: 'Vlastní dům/byt' },
      { value: 'byt', label: 'Nájemní byt' },
      { value: 'rodina', label: 'U rodiny' },
      { value: 'instituce', label: 'Instituce (domov pro seniory)' },
    ],
  },
  {
    id: 'q7',
    text: 'Jaký je kognitivní stav seniora?',
    options: [
      { value: 'bezproblemu', label: 'Bez problémů' },
      { value: 'mirne', label: 'Mírné výpadky paměti' },
      { value: 'stredni', label: 'Středně těžká demence' },
      { value: 'tezka', label: 'Těžká demence' },
    ],
  },
  {
    id: 'q8',
    text: 'Jakou péči senior aktuálně využívá?',
    options: [
      { value: 'zadna', label: 'Žádnou' },
      { value: 'rodina', label: 'Péče rodiny' },
      { value: 'pecovatel', label: 'Profesionální pečovatel' },
      { value: 'kombinace', label: 'Kombinace rodiny a pečovatele' },
    ],
  },
];

export const claimTestResults: ClaimTestResult[] = [
  {
    claimId: 'pnp',
    title: 'Příspěvek na péči (PnP)',
    eligible: true,
    estimatedAmount: 'až 19 200 Kč/měsíc',
    priority: 'high',
    description: 'Na základě odpovědí máte vysokou šanci na přiznání příspěvku na péči. Doporučujeme podat žádost co nejdříve.',
    ctaRoute: '/pruvodce',
  },
  {
    claimId: 'ztp',
    title: 'Průkaz ZTP/P',
    eligible: true,
    estimatedAmount: 'doprava, parkování, slevy',
    priority: 'medium',
    description: 'Senior pravděpodobně splňuje podmínky pro průkaz ZTP/P. Průkaz přináší řadu výhod v dopravě a dalších oblastech.',
    ctaRoute: '/pruvodce',
    premium: false,
  },
  {
    claimId: 'oid',
    title: 'Invalidní důchod',
    eligible: true,
    estimatedAmount: 'až 12 000 Kč/měsíc',
    priority: 'medium',
    description: 'Na základě zdravotního stavu může mít senior nárok na invalidní důchod. Detailní analýza je k dispozici v prémiovém plánu.',
    ctaRoute: '/pruvodce',
    premium: true,
  },
  {
    claimId: 'mobilita',
    title: 'Příspěvek na mobilitu',
    eligible: true,
    estimatedAmount: '900 Kč/měsíc',
    priority: 'low',
    description: 'Příspěvek na mobilitu je určen pro osoby s těžkým postižením pohyblivosti. Kompletní průvodce žádostí je součástí prémia.',
    ctaRoute: '/pruvodce',
    premium: true,
  },
  {
    claimId: 'pomucky',
    title: 'Zdravotní pomůcky',
    eligible: true,
    estimatedAmount: 'dle potřeby',
    priority: 'low',
    description: 'Pojišťovna hradí širokou škálu zdravotních pomůcek. Zjistěte, na co máte nárok a jak požádat.',
    ctaRoute: '/pruvodce',
    premium: true,
  },
];

// ============================================================================
// PHASE 2: Kalendářní integrace
// ============================================================================

export const calendarSources: CalendarSource[] = [
  {
    id: 'cal-google',
    provider: 'google',
    email: 'marie@gmail.com',
    connected: true,
    syncStatus: 'synced',
    lastSynced: '2024-01-20T06:00:00',
  },
  {
    id: 'cal-apple',
    provider: 'apple',
    email: '',
    connected: false,
    syncStatus: 'none',
  },
];

export const externalCalendarEvents: ExternalCalendarEvent[] = [
  {
    id: 'ext-1',
    sourceId: 'cal-google',
    title: 'Schůzka v práci',
    date: '2024-01-22',
    time: '09:00',
    isExternal: true,
    sharedWithFamily: false,
  },
  {
    id: 'ext-2',
    sourceId: 'cal-google',
    title: 'Dovolená',
    date: '2024-01-26',
    isExternal: true,
    sharedWithFamily: true,
  },
  {
    id: 'ext-3',
    sourceId: 'cal-google',
    title: 'Dentista',
    date: '2024-01-23',
    time: '15:00',
    isExternal: true,
    sharedWithFamily: true,
  },
  {
    id: 'ext-4',
    sourceId: 'cal-google',
    title: 'Porada týmu',
    date: '2024-01-24',
    time: '14:00',
    isExternal: true,
    sharedWithFamily: false,
  },
  {
    id: 'ext-5',
    sourceId: 'cal-google',
    title: 'Fyzioterapie maminky',
    date: '2024-01-25',
    time: '10:00',
    isExternal: true,
    sharedWithFamily: true,
  },
];

// ============================================================================
// PHASE 2: OCR skeny
// ============================================================================

export const ocrScanResults: OCRScanResult[] = [
  {
    id: 'ocr-1',
    scannedAt: '2024-01-19T14:00:00',
    documentType: 'erecept',
    extractedMedications: [
      { id: 'ocr-med-1', name: 'Metformin', dosage: '500 mg', frequency: '2x denně', critical: true },
      { id: 'ocr-med-2', name: 'Enalapril', dosage: '10 mg', frequency: '1x denně', critical: true },
      { id: 'ocr-med-3', name: 'Furosemid', dosage: '40 mg', frequency: '1x denně', critical: true },
    ],
    confidence: 0.94,
    applied: true,
  },
  {
    id: 'ocr-2',
    scannedAt: '2024-01-20T10:30:00',
    documentType: 'zprava',
    extractedMedications: [
      { id: 'ocr-med-4', name: 'Bisoprolol', dosage: '5 mg', frequency: '1x denně', critical: false },
    ],
    confidence: 0.87,
    applied: false,
  },
];

// ============================================================================
// PHASE 2: Měsíční reporty
// ============================================================================

export const monthlyReports: MonthlyReport[] = [
  {
    id: 'report-2024-01',
    month: '2024-01',
    parentId: 'mama',
    complianceRate: 82,
    generatedAt: '2024-02-01T00:05:00',
    sections: {
      compliance: {
        taken: 140,
        missed: 30,
        total: 170,
      },
      visits: [
        { date: '2024-01-10', doctor: 'MUDr. Svobodová (praktik)' },
        { date: '2024-01-15', doctor: 'MUDr. Dvořák (kardiolog)' },
        { date: '2024-01-22', doctor: 'MUDr. Benešová (endokrinolog)' },
      ],
      familyActivity: [
        { member: 'Marie Nováková', actions: 45 },
        { member: 'Petr Novák', actions: 28 },
        { member: 'Vladimír Novák', actions: 12 },
      ],
    },
  },
];

// ============================================================================
// PHASE 2: Senior párování
// ============================================================================

export const seniorPairingCode: SeniorPairingCode = {
  code: '847291',
  createdBy: 'Marie Nováková',
  createdAt: '2024-01-20T09:00:00',
  expiresAt: '2024-01-20T09:30:00',
  parentId: 'mama',
};

// ============================================================================
// PHASE 2: Průvodci nároky (rozšířeno)
// ============================================================================

export const claimGuides: Record<string, ClaimStep[]> = {
  pnp: claimSteps,
  ztp: [
    {
      id: 'ztp-1',
      title: 'Sběr dokumentace',
      status: 'done',
      insiderTip: 'Získejte od praktického lékaře co nejpodrobnější vyjádření. Čím více omezení je zdokumentováno, tím vyšší šance na přiznání.',
    },
    {
      id: 'ztp-2',
      title: 'Podání žádosti na Úřad práce',
      status: 'active',
      insiderTip: 'Žádost lze podat i elektronicky přes datovou schránku. Ušetříte cestu na úřad.',
    },
    {
      id: 'ztp-3',
      title: 'Posouzení zdravotního stavu',
      status: 'pending',
    },
    {
      id: 'ztp-4',
      title: 'Vydání průkazu ZTP/P',
      status: 'pending',
      insiderTip: 'Průkaz vydává Úřad práce do 30 dnů od rozhodnutí. Zatím můžete používat potvrzení o podání žádosti.',
    },
  ],
  oid: [
    {
      id: 'oid-1',
      title: 'Žádost o posudek na OSSZ',
      status: 'done',
      insiderTip: 'Přiložte veškerou zdravotní dokumentaci – čím více, tím lépe. Posudkový lékař pracuje hlavně s papíry.',
    },
    {
      id: 'oid-2',
      title: 'Lékařský posudek',
      status: 'active',
      insiderTip: 'Posudkový lékař obvykle nenavštíví seniora osobně. Proto je klíčové, aby dokumentace přesně popisovala skutečný stav.',
    },
    {
      id: 'oid-3',
      title: 'Rozhodnutí ČSSZ',
      status: 'pending',
    },
    {
      id: 'oid-4',
      title: 'Výplata invalidního důchodu',
      status: 'pending',
      insiderTip: 'Důchod se vyplácí zpětně od data podání žádosti. Proto neprodlužujte podání.',
    },
  ],
  mobilita: [
    {
      id: 'mob-1',
      title: 'Test mobility a zdravotní posouzení',
      status: 'active',
      insiderTip: 'Test provádí posudkový lékař OSSZ. Buďte konkrétní v popisu každodenních obtíží – nestačí říct „špatně chodí".',
    },
    {
      id: 'mob-2',
      title: 'Podání žádosti na Úřad práce',
      status: 'pending',
    },
    {
      id: 'mob-3',
      title: 'Schválení a výplata příspěvku',
      status: 'pending',
      insiderTip: 'Příspěvek na mobilitu se vyplácí měsíčně. Při změně zdravotního stavu lze požádat o přehodnocení.',
    },
  ],
  pomucky: [
    {
      id: 'pom-1',
      title: 'Předpis od ošetřujícího lékaře',
      status: 'active',
      insiderTip: 'Některé pomůcky předepisuje specialista, jiné praktik. Ověřte si předem, kdo má oprávnění předepsat konkrétní pomůcku.',
    },
    {
      id: 'pom-2',
      title: 'Výběr dodavatele a pomůcky',
      status: 'pending',
      insiderTip: 'Nemusíte brát první nabízenou variantu. Máte právo na výběr dodavatele a můžete doplatit za lepší provedení.',
    },
    {
      id: 'pom-3',
      title: 'Schválení pojišťovnou',
      status: 'pending',
    },
  ],
};
