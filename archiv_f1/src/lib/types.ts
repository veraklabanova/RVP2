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
}
