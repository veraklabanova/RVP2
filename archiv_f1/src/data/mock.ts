import type { Parent, Task, AuditEntry, ClaimStep, FamilyMember } from '@/lib/types';

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
      { id: '1', name: 'Metformin', dosage: '500 mg', frequency: '2x denně', critical: true },
      { id: '2', name: 'Ramipril', dosage: '5 mg', frequency: '1x denně', critical: true },
      { id: '3', name: 'Calcium + D3', dosage: '1000 mg', frequency: '1x denně', critical: false },
      { id: '4', name: 'Warfarin', dosage: '3 mg', frequency: '1x denně', critical: true },
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
      { id: '5', name: 'Donepezil', dosage: '10 mg', frequency: '1x denně', critical: true },
      { id: '6', name: 'Spiriva', dosage: '18 mcg', frequency: '1x denně', critical: true },
      { id: '7', name: 'Atorvastatin', dosage: '20 mg', frequency: '1x denně', critical: false },
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
