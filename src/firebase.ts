import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import localConfig from './firebase-applet-config.json';

// Use environment variables if set (e.g. on Vercel), falling back to local json values
const metaEnv = (import.meta as any).env || {};
const cfg = (localConfig || {}) as any;
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || cfg.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || cfg.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || cfg.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || cfg.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || cfg.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || cfg.appId,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || cfg.firestoreDatabaseId || '(default)'
};

// Validate configurations - check if placeholder is being used
export const isMockFirebase = (() => {
  const key = firebaseConfig.apiKey;
  if (!key) return true;
  if (typeof key !== 'string') return true;
  const k = key.trim().toLowerCase();
  if (k === '' || k === 'undefined' || k === 'null') return true;
  if (k.includes('placeholder') || k.includes('your-') || k.includes('your_') || k.includes('<') || k.includes('>')) return true;
  if (key.length < 20) return true;
  // Google Cloud API keys (used by Firebase) always start with AIzaSy
  if (!key.startsWith('AIzaSy')) return true;
  return false;
})();

let firebaseApp;
let firestoreDb: Firestore | null = null;
let firebaseAuth: any = null;

if (!isMockFirebase) {
  try {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    // CRITICAL: The app will break without this line
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    firebaseAuth = getAuth(firebaseApp);

    // CRITICAL CONSTRAINT: When the application initially boots, test the live connection
    const testConnection = async () => {
      if (firestoreDb) {
        try {
          await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
          console.log("Firebase connection established successfully.");
        } catch (error) {
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration. Client is offline.");
          }
        }
      }
    };
    testConnection();
  } catch (err) {
    console.warn("Firebase failed to initialize. Falling back to sandbox storage.", err);
  }
}

export const db = firestoreDb;
export const auth = firebaseAuth;

// Error handlers conforming exactly to target schema
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
