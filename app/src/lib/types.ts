export type ParentId = 'mama' | 'tata';

export interface Parent {
  id: ParentId;
  name: string;
  birthYear: number;
  personalId: string;
  insuranceCompany: string;
  bloodType: string;
  allergies: string[];
  criticalDiagnoses: string[];
  medications: Medication[];
  iceContact: ICEContact;
  lastVerified: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  critical: boolean;
  note?: string;
  nightEscalation?: boolean;
  times?: string[];
}

export interface ICEContact {
  name: string;
  relation: string;
  phone: string;
}

export type TaskCategory = 'medical' | 'admin' | 'operational';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  date: string;
  time?: string;
  completed: boolean;
  parentId: ParentId;
  linkedDoc?: string;
}

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface ClaimStep {
  id: string;
  title: string;
  status: 'done' | 'active' | 'pending' | 'locked';
  insiderTip?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'garant' | 'platce' | 'pecujici' | 'ctenar';
  email: string;
  avatar?: string;
}

export type SubscriptionTier = 'trial' | 'standard' | 'duo' | 'family' | 'freezer';

export interface AppState {
  activeParent: ParentId;
  isOnboarded: boolean;
  subscriptionTier: SubscriptionTier;
  trialDaysLeft: number;
  seniorMode: boolean;
  unreadNotifications: number;
}

// === FÁZE 2: Lékový asistent ===

export type MedicationStatus = 'waiting' | 'taken' | 'missed' | 'escalated' | 'confirmed_by_carer';

export interface MedicationScheduleEntry {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  parentId: ParentId;
  scheduledTime: string;
  status: MedicationStatus;
  confirmedAt?: string;
  confirmedBy?: string;
  note?: string;
  offlineConfirmed?: boolean;
}

export interface ComplianceDay {
  date: string;
  entries: MedicationScheduleEntry[];
}

export interface SeniorPairingCode {
  code: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  parentId: ParentId;
}

// === FÁZE 2: Notifikace ===

export type NotificationCategory = 'leky' | 'kalendar' | 'rodina' | 'system';
export type NotificationPriority = 'high' | 'normal' | 'low';

export interface Notification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
  actionUrl?: string;
  linkedEntityId?: string;
  linkedEntityType?: 'task' | 'medication' | 'event' | 'chat' | 'document';
}

// === FÁZE 2: Rodinný chat ===

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  mentions?: string[];
  status?: 'sent' | 'pending' | 'failed';
}

export interface ChatThread {
  id: string;
  contextType: 'task' | 'medication' | 'event' | 'document';
  contextId: string;
  contextLabel: string;
  messages: ChatMessage[];
  lastActivity: string;
}

// === FÁZE 2: Smart Test nároků ===

export interface ClaimTestQuestion {
  id: string;
  text: string;
  options: { value: string; label: string }[];
}

export interface ClaimTestResult {
  claimId: string;
  title: string;
  eligible: boolean;
  estimatedAmount?: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  ctaRoute: string;
  premium?: boolean;
}

// === FÁZE 2: Kalendářní integrace ===

export type SyncStatus = 'synced' | 'error' | 'syncing' | 'none';

export interface CalendarSource {
  id: string;
  provider: 'google' | 'apple';
  email: string;
  connected: boolean;
  syncStatus: SyncStatus;
  lastSynced?: string;
}

export interface ExternalCalendarEvent {
  id: string;
  sourceId: string;
  title: string;
  date: string;
  time?: string;
  isExternal: true;
  sharedWithFamily: boolean;
}

// === FÁZE 2: OCR ===

export interface OCRScanResult {
  id: string;
  scannedAt: string;
  documentType: 'erecept' | 'zprava' | 'lek';
  extractedMedications: Medication[];
  confidence: number;
  applied: boolean;
}

// === FÁZE 2: Měsíční report ===

export interface MonthlyReport {
  id: string;
  month: string;
  parentId: ParentId;
  complianceRate: number;
  generatedAt: string;
  sections: {
    compliance: { taken: number; missed: number; total: number };
    visits: { date: string; doctor: string }[];
    familyActivity: { member: string; actions: number }[];
  };
}
