export interface Psychologist {
  userId: string;
  name: string;
  email: string;
  crp: string;
  specialties: string;
  createdAt: string;
}

export type PatientStatus = 'active' | 'inactive';
export type PatientFinancialStatus = 'paid' | 'pending' | 'overdue' | 'exempt';

export interface Patient {
  id: string;
  psychologistId: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  cpf?: string;
  notes?: string;
  status: PatientStatus;
  financialStatus?: PatientFinancialStatus;
  paymentLink?: string;
  createdAt: string;
}

export type AppointmentType = 'presential' | 'online';
export type AppointmentStatus = 'scheduled' | 'completed' | 'canceled';

export interface Appointment {
  id: string;
  psychologistId: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // in minutes
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  patientConfirmed?: boolean;
  patientComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  psychologistId: string;
  patientId: string;
  patientName: string;
  sessionDate: string; // YYYY-MM-DD
  title: string;
  sessionSummary: string; // Subjective assessment
  clinicalObservations: string; // Objective clinical findings
  therapeuticPlan: string; // Planning & interventions
  isLocked: boolean; // Cannot edit anymore once true
  lockedAt?: string; // Date ISO string when signed
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'paid' | 'pending';

export interface FinancialTransaction {
  id: string;
  psychologistId: string;
  patientId?: string; // Optional patient link
  patientName?: string; // Denormalized name for easier search and listing
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string; // e.g. "Sessão Individual", "Supervisão", "Aluguel", "Impostos/CRP", "Material Didático", "Outros"
  description?: string;
  paymentMethod?: 'pix' | 'credit_card' | 'bank_slip' | 'cash' | 'transfer' | 'other';
  status: TransactionStatus;
  createdAt: string;
}

export type HealthDocumentType = 'payment_receipt' | 'health_report' | 'therapeutic_prescription';

export interface HealthReceipt {
  id: string;
  psychologistId: string;
  patientId: string;
  patientName: string;
  patientCpf: string;
  patientEmail?: string;
  date: string; // YYYY-MM-DD
  type: HealthDocumentType;
  value: number; // For receipts
  description: string; // Prescription text, certificate text, or invoice summary
  signatureLocked: boolean; // Lock document upon signing
  createdAt: string;
}
