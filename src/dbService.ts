import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  addDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db, isMockFirebase, handleFirestoreError, OperationType } from './firebase';
import { Patient, Appointment, MedicalRecord, Psychologist, FinancialTransaction, HealthReceipt } from './types';

// Helper for generating custom IDs
export function generateUUID(): string {
  return 'id_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper to remove any fields where value is undefined to prevent Firestore "Unsupported field value: undefined" error
export function cleanUndefined<T extends object>(obj: T): T {
  const cleaned = { ...obj } as any;
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
}

// FALLBACK LOCAL STORAGE PERSISTENCE ENGINE (FOR SANDBOX PREVIEWS)
const LOCAL_STORAGE_KEYS = {
  PROFILE: 'nexpsi_profile',
  PATIENTS: 'nexpsi_patients',
  APPOINTMENTS: 'nexpsi_appointments',
  RECORDS: 'nexpsi_records',
  TRANSACTIONS: 'nexpsi_transactions',
  RECEIPTS: 'nexpsi_receipts',
};

const OLD_KEYS_MAP: Record<string, string> = {
  'nexpsi_profile': 'psiflow_profile',
  'nexpsi_patients': 'psiflow_patients',
  'nexpsi_appointments': 'psiflow_appointments',
  'nexpsi_records': 'psiflow_records',
  'nexpsi_transactions': 'psiflow_transactions',
  'nexpsi_receipts': 'psiflow_receipts',
};

const getLocalStorageItemWithMigration = (key: string): string | null => {
  let val = localStorage.getItem(key);
  if (!val) {
    const oldKey = OLD_KEYS_MAP[key];
    if (oldKey) {
      val = localStorage.getItem(oldKey);
      if (val) {
        localStorage.setItem(key, val); // Migrate to new key
      }
    }
  }
  return val;
};

const getLocalData = <T>(key: string): T[] => {
  const data = getLocalStorageItemWithMigration(key);
  return data ? JSON.parse(data) : [];
};

const saveLocalData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// 1. PSYCHOLOGIST PROFILE FUNCTIONS
export async function getPsychologistProfile(userId: string): Promise<Psychologist | null> {
  const path = `psychologists/${userId}`;
  if (isMockFirebase || !db) {
    const localProfile = getLocalStorageItemWithMigration(LOCAL_STORAGE_KEYS.PROFILE);
    if (localProfile) {
      const parsed = JSON.parse(localProfile) as Psychologist;
      if (parsed.userId === userId) return parsed;
    }
    // Return a beautiful default profile if none exists
    const defaultProfile: Psychologist = {
      userId,
      name: "Dr(a). Flávia Barros",
      email: "santosflaviabarros@gmail.com",
      crp: "CRP 04/194852-MG",
      specialties: "Terapia Cognitivo-Comportamental (TCC), Psicologia Clínica, Ansiedade e Depressão",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(defaultProfile));
    return defaultProfile;
  }

  try {
    const docRef = doc(db, 'psychologists', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Psychologist;
    }
    return null;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function savePsychologistProfile(profile: Psychologist): Promise<void> {
  const path = `psychologists/${profile.userId}`;
  if (isMockFirebase || !db) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    // Trigger storage event for same-window syncing if needed
    window.dispatchEvent(new Event('storage'));
    return;
  }

  try {
    const docRef = doc(db, 'psychologists', profile.userId);
    await setDoc(docRef, cleanUndefined(profile));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 2. PATIENTS OPERATIONS
export function subscribePatients(userId: string, callback: (patients: Patient[]) => void): () => void {
  const path = 'patients';
  if (isMockFirebase || !db) {
    // Initial fetch
    const fetchLocal = () => {
      const list = getLocalData<Patient>(LOCAL_STORAGE_KEYS.PATIENTS);
      // Filter by current psychologistId to simulate clean multi-tenant security
      callback(list.filter(p => p.psychologistId === userId));
    };
    fetchLocal();
    // Respond to custom storage events
    const handleStorageChange = () => fetchLocal();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }

  try {
    const q = query(collection(db, 'patients'), where('psychologistId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Patient));
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function addPatient(patient: Omit<Patient, 'id'>): Promise<string> {
  const path = 'patients';
  const newId = generateUUID();
  const fullPatient: Patient = { ...patient, id: newId };

  if (isMockFirebase || !db) {
    const list = getLocalData<Patient>(LOCAL_STORAGE_KEYS.PATIENTS);
    list.push(fullPatient);
    saveLocalData(LOCAL_STORAGE_KEYS.PATIENTS, list);
    window.dispatchEvent(new Event('storage'));
    return newId;
  }

  try {
    await setDoc(doc(db, 'patients', newId), cleanUndefined(fullPatient));
    return newId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `${path}/${newId}`);
  }
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<void> {
  const path = `patients/${id}`;
  if (isMockFirebase || !db) {
    const list = getLocalData<Patient>(LOCAL_STORAGE_KEYS.PATIENTS);
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      saveLocalData(LOCAL_STORAGE_KEYS.PATIENTS, list);
      window.dispatchEvent(new Event('storage'));
    }
    return;
  }

  try {
    const docRef = doc(db, 'patients', id);
    await updateDoc(docRef, cleanUndefined(updates) as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePatient(id: string): Promise<void> {
  const path = `patients/${id}`;
  if (isMockFirebase || !db) {
    const list = getLocalData<Patient>(LOCAL_STORAGE_KEYS.PATIENTS);
    const filtered = list.filter(p => p.id !== id);
    saveLocalData(LOCAL_STORAGE_KEYS.PATIENTS, filtered);
    // Also cleanup appointments and records of this deleted patient
    const appts = getLocalData<Appointment>(LOCAL_STORAGE_KEYS.APPOINTMENTS).filter(a => a.patientId !== id);
    saveLocalData(LOCAL_STORAGE_KEYS.APPOINTMENTS, appts);
    const recs = getLocalData<MedicalRecord>(LOCAL_STORAGE_KEYS.RECORDS).filter(r => r.patientId !== id);
    saveLocalData(LOCAL_STORAGE_KEYS.RECORDS, recs);
    window.dispatchEvent(new Event('storage'));
    return;
  }

  try {
    await deleteDoc(doc(db, 'patients', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. APPOINTMENTS OPERATIONS
export function subscribeAppointments(userId: string, callback: (appointments: Appointment[]) => void): () => void {
  const path = 'appointments';
  if (isMockFirebase || !db) {
    const fetchLocal = () => {
      const list = getLocalData<Appointment>(LOCAL_STORAGE_KEYS.APPOINTMENTS);
      callback(list.filter(a => a.psychologistId === userId));
    };
    fetchLocal();
    const handleStorageChange = () => fetchLocal();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }

  try {
    const q = query(collection(db, 'appointments'), where('psychologistId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function addAppointment(appt: Omit<Appointment, 'id'>): Promise<string> {
  const path = 'appointments';
  const newId = generateUUID();
  const fullAppt: Appointment = { ...appt, id: newId };

  if (isMockFirebase || !db) {
    const list = getLocalData<Appointment>(LOCAL_STORAGE_KEYS.APPOINTMENTS);
    list.push(fullAppt);
    saveLocalData(LOCAL_STORAGE_KEYS.APPOINTMENTS, list);
    window.dispatchEvent(new Event('storage'));
    return newId;
  }

  try {
    await setDoc(doc(db, 'appointments', newId), cleanUndefined(fullAppt));
    return newId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `${path}/${newId}`);
  }
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<void> {
  const path = `appointments/${id}`;
  if (isMockFirebase || !db) {
    const list = getLocalData<Appointment>(LOCAL_STORAGE_KEYS.APPOINTMENTS);
    const index = list.findIndex(a => a.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      saveLocalData(LOCAL_STORAGE_KEYS.APPOINTMENTS, list);
      window.dispatchEvent(new Event('storage'));
    }
    return;
  }

  try {
    const docRef = doc(db, 'appointments', id);
    await updateDoc(docRef, cleanUndefined(updates) as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  const path = `appointments/${id}`;
  if (isMockFirebase || !db) {
    const list = getLocalData<Appointment>(LOCAL_STORAGE_KEYS.APPOINTMENTS);
    const filtered = list.filter(a => a.id !== id);
    saveLocalData(LOCAL_STORAGE_KEYS.APPOINTMENTS, filtered);
    window.dispatchEvent(new Event('storage'));
    return;
  }

  try {
    await deleteDoc(doc(db, 'appointments', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const path = `appointments/${id}`;
  if (isMockFirebase || !db) {
    const list = getLocalData<Appointment>(LOCAL_STORAGE_KEYS.APPOINTMENTS);
    return list.find(a => a.id === id) || null;
  }

  try {
    const docRef = doc(db, 'appointments', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Appointment;
    }
    return null;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
  const path = 'appointments';
  if (isMockFirebase || !db) {
    const list = getLocalData<Appointment>(LOCAL_STORAGE_KEYS.APPOINTMENTS);
    return list.filter(a => a.patientId === patientId);
  }

  try {
    const q = query(collection(db, 'appointments'), where('patientId', '==', patientId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path) || [];
  }
}


// 4. MEDICAL RECORDS OPERATIONS (SECURE DIGITAL PRONTUÁRIOS)
export function subscribeMedicalRecords(userId: string, callback: (records: MedicalRecord[]) => void): () => void {
  const path = 'medical_records';
  if (isMockFirebase || !db) {
    const fetchLocal = () => {
      const list = getLocalData<MedicalRecord>(LOCAL_STORAGE_KEYS.RECORDS);
      callback(list.filter(r => r.psychologistId === userId));
    };
    fetchLocal();
    const handleStorageChange = () => fetchLocal();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }

  try {
    const q = query(collection(db, 'medical_records'), where('psychologistId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MedicalRecord));
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function addMedicalRecord(record: Omit<MedicalRecord, 'id'>): Promise<string> {
  const path = 'medical_records';
  const newId = generateUUID();
  const fullRecord: MedicalRecord = { ...record, id: newId };

  if (isMockFirebase || !db) {
    const list = getLocalData<MedicalRecord>(LOCAL_STORAGE_KEYS.RECORDS);
    list.push(fullRecord);
    saveLocalData(LOCAL_STORAGE_KEYS.RECORDS, list);
    window.dispatchEvent(new Event('storage'));
    return newId;
  }

  try {
    await setDoc(doc(db, 'medical_records', newId), cleanUndefined(fullRecord));
    return newId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `${path}/${newId}`);
  }
}

export async function updateMedicalRecord(id: string, updates: Partial<MedicalRecord>): Promise<void> {
  const path = `medical_records/${id}`;
  if (isMockFirebase || !db) {
    const list = getLocalData<MedicalRecord>(LOCAL_STORAGE_KEYS.RECORDS);
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      saveLocalData(LOCAL_STORAGE_KEYS.RECORDS, list);
      window.dispatchEvent(new Event('storage'));
    }
    return;
  }

  try {
    const docRef = doc(db, 'medical_records', id);
    await updateDoc(docRef, cleanUndefined(updates) as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  const path = `medical_records/${id}`;
  if (isMockFirebase || !db) {
    const list = getLocalData<MedicalRecord>(LOCAL_STORAGE_KEYS.RECORDS);
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
      const filtered = list.filter(r => r.id !== id);
      saveLocalData(LOCAL_STORAGE_KEYS.RECORDS, filtered);
      window.dispatchEvent(new Event('storage'));
    }
    return;
  }

  try {
    await deleteDoc(doc(db, 'medical_records', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 5. FINANCIAL TRANSACTIONS OPERATIONS
export function subscribeTransactions(userId: string, callback: (transactions: FinancialTransaction[]) => void): () => void {
  const path = 'transactions';
  if (isMockFirebase || !db) {
    const fetchLocal = () => {
      const list = getLocalData<FinancialTransaction>(LOCAL_STORAGE_KEYS.TRANSACTIONS);
      callback(list.filter(t => t.psychologistId === userId));
    };
    fetchLocal();
    const handleStorageChange = () => fetchLocal();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }

  try {
    const q = query(collection(db, 'transactions'), where('psychologistId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FinancialTransaction));
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function addTransaction(transaction: Omit<FinancialTransaction, 'id'>): Promise<string> {
  const path = 'transactions';
  const newId = generateUUID();
  const fullTransaction: FinancialTransaction = { ...transaction, id: newId };

  if (isMockFirebase || !db) {
    const list = getLocalData<FinancialTransaction>(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    list.push(fullTransaction);
    saveLocalData(LOCAL_STORAGE_KEYS.TRANSACTIONS, list);
    window.dispatchEvent(new Event('storage'));
    return newId;
  }

  try {
    await setDoc(doc(db, 'transactions', newId), cleanUndefined(fullTransaction));
    return newId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `${path}/${newId}`);
  }
}

export async function updateTransaction(id: string, updates: Partial<FinancialTransaction>): Promise<void> {
  const path = `transactions/${id}`;
  if (isMockFirebase || !db) {
    const list = getLocalData<FinancialTransaction>(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    const index = list.findIndex(t => t.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      saveLocalData(LOCAL_STORAGE_KEYS.TRANSACTIONS, list);
      window.dispatchEvent(new Event('storage'));
    }
    return;
  }

  try {
    const docRef = doc(db, 'transactions', id);
    await updateDoc(docRef, cleanUndefined(updates) as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const path = `transactions/${id}`;
  if (isMockFirebase || !db) {
    const list = getLocalData<FinancialTransaction>(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    const filtered = list.filter(t => t.id !== id);
    saveLocalData(LOCAL_STORAGE_KEYS.TRANSACTIONS, filtered);
    window.dispatchEvent(new Event('storage'));
    return;
  }

  try {
    await deleteDoc(doc(db, 'transactions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 6. HEALTH RECEIPTS AND PRECRIPTIONS OPERATIONS
export function subscribeReceipts(userId: string, callback: (receipts: HealthReceipt[]) => void): () => void {
  const path = 'health_receipts';
  if (isMockFirebase || !db) {
    const fetchLocal = () => {
      const list = getLocalData<HealthReceipt>(LOCAL_STORAGE_KEYS.RECEIPTS);
      callback(list.filter(r => r.psychologistId === userId));
    };
    fetchLocal();
    const handleStorageChange = () => fetchLocal();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }

  try {
    const q = query(collection(db, 'health_receipts'), where('psychologistId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HealthReceipt));
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function addReceipt(receipt: Omit<HealthReceipt, 'id'>): Promise<string> {
  const path = 'health_receipts';
  const newId = generateUUID();
  const fullReceipt: HealthReceipt = { ...receipt, id: newId };

  if (isMockFirebase || !db) {
    const list = getLocalData<HealthReceipt>(LOCAL_STORAGE_KEYS.RECEIPTS);
    list.push(fullReceipt);
    saveLocalData(LOCAL_STORAGE_KEYS.RECEIPTS, list);
    window.dispatchEvent(new Event('storage'));
    return newId;
  }

  try {
    await setDoc(doc(db, 'health_receipts', newId), cleanUndefined(fullReceipt));
    return newId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `${path}/${newId}`);
  }
}

export async function updateReceipt(id: string, updates: Partial<HealthReceipt>): Promise<void> {
  const path = `health_receipts/${id}`;
  if (isMockFirebase || !db) {
    const list = getLocalData<HealthReceipt>(LOCAL_STORAGE_KEYS.RECEIPTS);
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      saveLocalData(LOCAL_STORAGE_KEYS.RECEIPTS, list);
      window.dispatchEvent(new Event('storage'));
    }
    return;
  }

  try {
    const docRef = doc(db, 'health_receipts', id);
    await updateDoc(docRef, cleanUndefined(updates) as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteReceipt(id: string): Promise<void> {
  const path = `health_receipts/${id}`;
  if (isMockFirebase || !db) {
    const list = getLocalData<HealthReceipt>(LOCAL_STORAGE_KEYS.RECEIPTS);
    const filtered = list.filter(r => r.id !== id);
    saveLocalData(LOCAL_STORAGE_KEYS.RECEIPTS, filtered);
    window.dispatchEvent(new Event('storage'));
    return;
  }

  try {
    await deleteDoc(doc(db, 'health_receipts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// SEED DB WITH DEFAULT DATA FOR PREVIEW SESSIONS (ONLY if DB is empty)
export function checkAndSeedInitialSandboxData(userId: string) {
  // Check patients
  const currentPatients = getLocalData<Patient>(LOCAL_STORAGE_KEYS.PATIENTS)
    .filter(p => p.psychologistId === userId);

  if (currentPatients.length === 0) {
    console.log("Seeding sandbox data for psychologist ID:", userId);
    
    // Seed Patients
    const p1Id = generateUUID();
    const p2Id = generateUUID();
    const p3Id = generateUUID();

    const samplePatients: Patient[] = [
      {
        id: p1Id,
        psychologistId: userId,
        name: "Ana Silva Santos",
        email: "ana.santo@gmail.com",
        phone: "(11) 98765-4321",
        birthDate: "1994-05-12",
        cpf: "123.456.789-00",
        notes: "Gosta de agendamentos no final da tarde. Tratando queixas de ansiedade generalizada.",
        status: "active",
        financialStatus: "paid",
        createdAt: new Date().toISOString()
      },
      {
        id: p2Id,
        psychologistId: userId,
        name: "Carlos Eduardo Ramos",
        email: "carlos.edu.ramos@outlook.com",
        phone: "(21) 99911-2233",
        birthDate: "1988-11-23",
        cpf: "987.654.321-11",
        notes: "Transição de carreira profissional. Processo focado em inteligência emocional e metas corporativas.",
        status: "active",
        financialStatus: "pending",
        createdAt: new Date().toISOString()
      },
      {
        id: p3Id,
        psychologistId: userId,
        name: "Juliana Mendes Garcia",
        email: "juliana.mendes@uol.com.br",
        phone: "(31) 98111-2222",
        birthDate: "2001-08-30",
        cpf: "555.444.333-22",
        notes: "Estudante universitária. Transtorno do pânico leve recorrente.",
        status: "active",
        financialStatus: "exempt",
        createdAt: new Date().toISOString()
      }
    ];

    const allPatients = getLocalData<Patient>(LOCAL_STORAGE_KEYS.PATIENTS);
    allPatients.push(...samplePatients);
    saveLocalData(LOCAL_STORAGE_KEYS.PATIENTS, allPatients);

    // Seed Appointments (Calendar schedules)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const d1 = today;
    const d2 = new Date(Date.now() + 86400000).toISOString().split('T')[0]; // Tomorrow
    const d3 = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]; // Day after tomorrow

    const sampleAppointments: Appointment[] = [
      {
        id: generateUUID(),
        psychologistId: userId,
        patientId: p1Id,
        patientName: "Ana Silva Santos",
        date: d1,
        time: "14:00",
        duration: 50,
        type: "online",
        status: "completed",
        notes: "Sessão focada na técnica de respiração diafragmática para crises agudas.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateUUID(),
        psychologistId: userId,
        patientId: p2Id,
        patientName: "Carlos Eduardo Ramos",
        date: d2,
        time: "10:00",
        duration: 50,
        type: "online",
        status: "scheduled",
        notes: "Feedback sobre a planilha de auto-monitoramento emocional enviada como tarefa terapêutica.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateUUID(),
        psychologistId: userId,
        patientId: p3Id,
        patientName: "Juliana Mendes Garcia",
        date: d3,
        time: "16:30",
        duration: 50,
        type: "presential",
        status: "scheduled",
        notes: "Acompanhamento da exposição psicossocial estruturada.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const allAppointments = getLocalData<Appointment>(LOCAL_STORAGE_KEYS.APPOINTMENTS);
    allAppointments.push(...sampleAppointments);
    saveLocalData(LOCAL_STORAGE_KEYS.APPOINTMENTS, allAppointments);

    // Seed Medical Records (Prontuários Digitais Seguros)
    const sampleRecords: MedicalRecord[] = [
      {
        id: generateUUID(),
        psychologistId: userId,
        patientId: p1Id,
        patientName: "Ana Silva Santos",
        sessionDate: d1,
        title: "Sessão 3 - Manejo de Ansiedade e Reestruturação Cognitiva",
        sessionSummary: "Paciente reportou alta carga de estresse no ambiente de trabalho durante a última semana, culminando em insônia moderada.",
        clinicalObservations: "Nível visível de inquietação psicomotora. Pensamentos automáticos disfuncionais detectados: 'Eu preciso resolver tudo perfeitamente ou serei demitida'. Uso satisfatório de questionamento socrático durante a consulta.",
        therapeuticPlan: "Tarefa de casa: Diário de Registros de Pensamentos Disfuncionais (RPD). Foco na flexibilização da distorção cognitiva de catastrofização.",
        isLocked: true,
        lockedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateUUID(),
        psychologistId: userId,
        patientId: p2Id,
        patientName: "Carlos Eduardo Ramos",
        sessionDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
        title: "Sessão de Triagem - Alinhamento Vocacional",
        sessionSummary: "Sessão inicial para identificação de objetivos profissionais na transição de analista financeiro para gestor de produtos.",
        clinicalObservations: "Forte autocrítica profissional. Excelente comunicação verbal e cognitiva. Ausência de indicadores psicopatológicos.",
        therapeuticPlan: "Aplicação do teste de forças pessoais VIA na próxima sessão.",
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const allRecords = getLocalData<MedicalRecord>(LOCAL_STORAGE_KEYS.RECORDS);
    allRecords.push(...sampleRecords);
    saveLocalData(LOCAL_STORAGE_KEYS.RECORDS, allRecords);

    // Seed Sample Transactions (Financials)
    const sampleTransactions: FinancialTransaction[] = [
      {
        id: generateUUID(),
        psychologistId: userId,
        patientId: p1Id,
        patientName: "Ana Silva Santos",
        type: "income",
        amount: 150.00,
        date: d1,
        category: "Sessão Individual",
        description: "Sessão terapêutica presencial regular.",
        paymentMethod: "pix",
        status: "paid",
        createdAt: new Date().toISOString()
      },
      {
        id: generateUUID(),
        psychologistId: userId,
        patientId: p2Id,
        patientName: "Carlos Eduardo Ramos",
        type: "income",
        amount: 180.00,
        date: d2,
        category: "Sessão Individual",
        description: "Sessão terapêutica de transição profissional online.",
        paymentMethod: "pix",
        status: "pending",
        createdAt: new Date().toISOString()
      },
      {
        id: generateUUID(),
        psychologistId: userId,
        type: "expense",
        amount: 850.00,
        date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
        category: "Aluguel de Consultório",
        description: "Aluguel da sala clínica - Mensal sublocação.",
        paymentMethod: "transfer",
        status: "paid",
        createdAt: new Date().toISOString()
      },
      {
        id: generateUUID(),
        psychologistId: userId,
        type: "expense",
        amount: 89.90,
        date: new Date(Date.now() - 86450000).toISOString().split('T')[0],
        category: "Plataforma / Outros",
        description: "Assinatura mensal do prontuário eletrônico NexPsi Pro.",
        paymentMethod: "credit_card",
        status: "paid",
        createdAt: new Date().toISOString()
      },
      {
        id: generateUUID(),
        psychologistId: userId,
        type: "income",
        amount: 300.00,
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        category: "Supervisão Clínica",
        description: "Atendimento de supervisão de psicólogo júnior.",
        paymentMethod: "transfer",
        status: "paid",
        createdAt: new Date().toISOString()
      }
    ];

    const allTransactions = getLocalData<FinancialTransaction>(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    allTransactions.push(...sampleTransactions);
    saveLocalData(LOCAL_STORAGE_KEYS.TRANSACTIONS, allTransactions);

    // Seed Sample Receipts and Health clinical prescriptions/materials
    const sampleReceipts: HealthReceipt[] = [
      {
        id: generateUUID(),
        psychologistId: userId,
        patientId: p1Id,
        patientName: "Ana Silva Santos",
        patientCpf: "123.456.789-00",
        patientEmail: "ana.santo@gmail.com",
        date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
        type: "payment_receipt",
        value: 150.00,
        description: "Recibo de honorários profissionais referente a 1 (uma) sessão de consulta psicológica clínica individual realizada de forma online no dia " + d1 + ".",
        signatureLocked: true,
        createdAt: new Date().toISOString()
      },
      {
        id: generateUUID(),
        psychologistId: userId,
        patientId: p2Id,
        patientName: "Carlos Eduardo Ramos",
        patientCpf: "987.654.321-11",
        patientEmail: "carlos.edu.ramos@outlook.com",
        date: d1,
        type: "therapeutic_prescription",
        value: 0,
        description: "Receita terapêutica e guia de manejo cognitivo para ansiedade: Praticar respiração diafragmática 4-2-4 por dez minutos após acordar; Registar pensamentos automáticos disfuncionais no módulo de anotações diárias.",
        signatureLocked: false,
        createdAt: new Date().toISOString()
      }
    ];

    const allReceipts = getLocalData<HealthReceipt>(LOCAL_STORAGE_KEYS.RECEIPTS);
    allReceipts.push(...sampleReceipts);
    saveLocalData(LOCAL_STORAGE_KEYS.RECEIPTS, allReceipts);

    // Refresh pages
    window.dispatchEvent(new Event('storage'));
  }
}
