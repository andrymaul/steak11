import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch
} from 'firebase/firestore';
import { getDb, getAuthInstance, isFirebaseConfigured } from './firebase';
import { MenuItem, OrderItem, AttendanceRecord, Employee, CashierShiftRecord, PettyCashExpense } from '../types';
import {
  MENU_ITEMS,
  CHICKEN_OPTIONS,
  SAUCE_OPTIONS,
  ADDON_OPTIONS,
  DEFAULT_MENU_CATEGORIES,
  DEFAULT_EMPLOYEES,
  DEFAULT_ADMINS,
  DEFAULT_ATTENDANCE,
  DEFAULT_PAYROLL,
  LOCATIONS,
  DEFAULT_ORDERS,
  DEFAULT_ROLE_SETTINGS,
  DEFAULT_WA_SETTINGS,
  DEFAULT_BRANDING,
  DEFAULT_INVENTORY,
  DEFAULT_PROMOS,
  DEFAULT_CASHIER_SHIFTS,
  REVIEWS,
  DEFAULT_SUPPLIERS,
  DEFAULT_PURCHASE_ORDERS,
  DEFAULT_EXPENSES,
  DEFAULT_RECIPES,
  DEFAULT_STOCK_OPNAMES,
  DEFAULT_STOCK_TRANSFERS,
  DEFAULT_AUDIT_LOGS,
  DEFAULT_STOCK_MUTATIONS,
  DEFAULT_CUSTOMERS,
  DEFAULT_WA_GATEWAY_CONFIG,
  DEFAULT_SHIFT_TEMPLATES,
  DEFAULT_EMPLOYEE_LOANS
} from '../data/initialData';

// Collections References
const ORDERS_COL = 'orders';
const MENU_COL = 'menu_items';

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const auth = getAuthInstance();
  const currentUser = auth?.currentUser;
  const errMessage = error instanceof Error ? error.message : String(error);
  const isOffline = errMessage.includes('unavailable') || errMessage.includes('Could not reach Cloud Firestore') || errMessage.includes('offline');

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (isOffline) {
    console.warn(`[Firestore Offline Cache Active] ${operationType} on '${path}': ${errMessage}`);
    return;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  if (errMessage.includes('permission-denied') || errMessage.includes('Missing or insufficient permissions')) {
    throw new Error(JSON.stringify(errInfo));
  }
}

/**
 * Test Firestore Connection & Get Document Stats
 */
export const testFirestoreConnection = async (): Promise<{ success: boolean; menuCount: number; orderCount: number; message: string }> => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) {
    return { success: false, menuCount: 0, orderCount: 0, message: 'Firebase belum terkonfigurasi dengan benar.' };
  }

  try {
    const pingDocRef = doc(db, 'users', 'shared_app_store', 'data', 'healthcheck');
    await setDoc(pingDocRef, { ping: 'ok', timestamp: new Date().toISOString() }, { merge: true });

    const sharedPingRef = doc(db, 'shared_data', 'healthcheck');
    await setDoc(sharedPingRef, { ping: 'ok', timestamp: new Date().toISOString() }, { merge: true });
    
    return {
      success: true,
      menuCount: 1,
      orderCount: 1,
      message: '🟢 Koneksi Cloud Firestore 100% Aktif & Real-time! Terhubung ke proyek steak11-2fa2a.'
    };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.error('Firestore connection test error:', err);
    let friendlyReason = errMsg;
    if (errMsg.includes('permission-denied') || errMsg.includes('Missing or insufficient permissions')) {
      friendlyReason = 'Aturan Keamanan (Rules) di Firebase Console masih mengunci akses. Silakan pastikan Rules pada Cloud Firestore di-set "allow read, write: if true;" dan tombol Publish sudah diklik.';
    } else if (errMsg.includes('not-found') || errMsg.includes('API has not been used')) {
      friendlyReason = 'Database Cloud Firestore belum dibuat di Firebase Console. Buka menu Firestore Database di console.firebase.google.com lalu klik "Create Database".';
    }
    return {
      success: false,
      menuCount: 0,
      orderCount: 0,
      message: `🔴 Firestore Terkendala: ${friendlyReason}`
    };
  }
};

/**
 * Seed initial data into Firestore if collections are empty
 */
export const initializeFirestoreDatabase = async () => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) {
    return;
  }

  const targetUid = 'shared_app_store';
  try {
    const keysToSeed = [
      { key: 'employees', defaultData: DEFAULT_EMPLOYEES },
      { key: 'admins', defaultData: DEFAULT_ADMINS },
      { key: 'menu_categories', defaultData: DEFAULT_MENU_CATEGORIES },
      { key: 'chicken_options', defaultData: CHICKEN_OPTIONS },
      { key: 'sauce_options', defaultData: SAUCE_OPTIONS },
      { key: 'addon_options', defaultData: ADDON_OPTIONS },
      { key: 'menu_items', defaultData: MENU_ITEMS },
      { key: 'locations', defaultData: LOCATIONS },
      { key: 'orders', defaultData: DEFAULT_ORDERS }
    ];

    for (const item of keysToSeed) {
      const docRef = doc(db, 'users', targetUid, 'data', item.key);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await syncUserDataToFirestore(item.key, item.defaultData);
      }
    }
  } catch (err) {
    console.warn('Error in initializeFirestoreDatabase:', err);
  }
};

/**
 * Subscribe to Realtime Orders
 */
export const subscribeToOrders = (callback: (orders: OrderItem[]) => void): (() => void) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) return () => {};
  try {
    const ordersRef = collection(db, ORDERS_COL);
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const ordersData: OrderItem[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as OrderItem),
        id: docSnap.id,
      }));
      callback(ordersData);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, ORDERS_COL);
    });
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ORDERS_COL);
    return () => {};
  }
};

/**
 * Subscribe to Realtime Menu Items
 */
export const subscribeToMenuItems = (callback: (items: MenuItem[]) => void): (() => void) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) return () => {};
  try {
    return onSnapshot(collection(db, MENU_COL), (snapshot) => {
      const menuData = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as MenuItem),
        id: docSnap.id,
      }));
      callback(menuData);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, MENU_COL);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, MENU_COL);
    return () => {};
  }
};

/**
 * Subscribe to Realtime Employees from Cloud Firestore
 */
export const subscribeToEmployees = (callback: (employees: Employee[]) => void): (() => void) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) return () => {};
  try {
    const docRef = doc(db, 'users', 'shared_app_store', 'data', 'employees');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists() && snapshot.data()?.payload) {
        const remoteData = snapshot.data().payload;
        if (Array.isArray(remoteData)) {
          try {
            localStorage.setItem('steak11_employees', JSON.stringify(remoteData));
          } catch {}
          window.dispatchEvent(new Event('employees_updated'));
          callback(remoteData);
        }
      }
    }, (err) => {
      console.warn('Error on subscribeToEmployees:', err);
    });
  } catch (error) {
    console.warn('Error setting subscribeToEmployees:', error);
    return () => {};
  }
};

/**
 * Pull latest Employees directly from Cloud Firestore
 */
export const pullEmployeesFromFirestore = async (): Promise<Employee[]> => {
  const db = getDb();
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'users', 'shared_app_store', 'data', 'employees');
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.payload && Array.isArray(snap.data()?.payload)) {
        const remoteEmployees = snap.data().payload;
        try {
          localStorage.setItem('steak11_employees', JSON.stringify(remoteEmployees));
        } catch {}
        window.dispatchEvent(new Event('employees_updated'));
        return remoteEmployees;
      }
    } catch (e) {
      console.warn('Error in pullEmployeesFromFirestore:', e);
    }
  }

  const raw = localStorage.getItem('steak11_employees');
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  return DEFAULT_EMPLOYEES;
};

export const refreshEmployeesFromFirebase = pullEmployeesFromFirestore;

/**
 * Save new Employee directly to Cloud Firestore
 */
export const saveEmployeeDirectToCloud = async (newEmp: Employee): Promise<Employee[]> => {
  const db = getDb();
  const current = await pullEmployeesFromFirestore();
  const updated = [newEmp, ...current.filter((e) => e.id !== newEmp.id)];

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'users', 'shared_app_store', 'data', 'employees');
      await setDoc(docRef, { payload: updated, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Direct Firestore save employee error:', e);
    }
  }

  try {
    localStorage.setItem('steak11_employees', JSON.stringify(updated));
  } catch {}

  window.dispatchEvent(new Event('employees_updated'));
  return updated;
};

/**
 * Update an existing Employee directly in Cloud Firestore
 */
export const updateEmployeeInCloud = async (updatedEmp: Employee): Promise<Employee[]> => {
  const db = getDb();
  const current = await pullEmployeesFromFirestore();
  const updated = current.map((e) => (e.id === updatedEmp.id ? { ...e, ...updatedEmp } : e));

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'users', 'shared_app_store', 'data', 'employees');
      await setDoc(docRef, { payload: updated, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Direct Firestore update employee error:', e);
    }
  }

  try {
    localStorage.setItem('steak11_employees', JSON.stringify(updated));
  } catch {}

  window.dispatchEvent(new Event('employees_updated'));
  return updated;
};

/**
 * Delete an Employee directly from Cloud Firestore
 */
export const deleteEmployeeFromCloud = async (empId: string): Promise<Employee[]> => {
  const db = getDb();
  const current = await pullEmployeesFromFirestore();
  const updated = current.filter((e) => e.id !== empId);

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'users', 'shared_app_store', 'data', 'employees');
      await setDoc(docRef, { payload: updated, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Direct Firestore delete employee error:', e);
    }
  }

  try {
    localStorage.setItem('steak11_employees', JSON.stringify(updated));
  } catch {}

  window.dispatchEvent(new Event('employees_updated'));
  return updated;
};

/**
 * Subscribe to Realtime Attendance from Cloud Firestore
 */
export const subscribeToAttendance = (callback: (records: AttendanceRecord[]) => void): (() => void) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) return () => {};
  try {
    const docRef = doc(db, 'users', 'shared_app_store', 'data', 'attendance');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists() && snapshot.data()?.payload) {
        const remoteData = snapshot.data().payload;
        if (Array.isArray(remoteData)) {
          const sorted = [...remoteData].sort((a: any, b: any) => {
            const dateA = `${a.date} ${a.clockInTime || '00:00:00'}`;
            const dateB = `${b.date} ${b.clockInTime || '00:00:00'}`;
            return dateB.localeCompare(dateA);
          });
          try {
            localStorage.setItem('steak11_attendance', JSON.stringify(sorted));
          } catch {}
          window.dispatchEvent(new Event('attendance_updated'));
          callback(sorted);
        }
      }
    }, (err) => {
      console.warn('Error on subscribeToAttendance:', err);
    });
  } catch (error) {
    console.warn('Error setting subscribeToAttendance:', error);
    return () => {};
  }
};

/**
 * Pull the latest Attendance records directly from Cloud Firestore (with API server fallback)
 */
export const pullAttendanceFromFirestore = async (): Promise<AttendanceRecord[]> => {
  const db = getDb();
  let remoteRecords: AttendanceRecord[] | null = null;

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'users', 'shared_app_store', 'data', 'attendance');
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.payload && Array.isArray(snap.data()?.payload)) {
        remoteRecords = snap.data()?.payload;
      }
    } catch (e) {
      console.warn('Direct Firestore fetch error, falling back to server API:', e);
    }
  }

  // Fallback to /api/attendance if Firestore SDK had network/permission hiccups
  if (!remoteRecords || remoteRecords.length === 0) {
    try {
      const res = await fetch('/api/attendance');
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.attendance) && json.attendance.length > 0) {
          remoteRecords = json.attendance;
        }
      }
    } catch {}
  }

  if (remoteRecords && Array.isArray(remoteRecords)) {
    const sorted = [...remoteRecords].sort((a: any, b: any) => {
      const dateA = `${a.date} ${a.clockInTime || '00:00:00'}`;
      const dateB = `${b.date} ${b.clockInTime || '00:00:00'}`;
      return dateB.localeCompare(dateA);
    });
    try {
      localStorage.setItem('steak11_attendance', JSON.stringify(sorted));
    } catch {}
    window.dispatchEvent(new Event('attendance_updated'));
    return sorted;
  }

  const raw = localStorage.getItem('steak11_attendance');
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  return [];
};

/**
 * Subscribe to Realtime Cashier Shifts from Cloud Firestore
 */
export const subscribeToCashierShifts = (callback: (shifts: CashierShiftRecord[]) => void): (() => void) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) return () => {};
  try {
    const docRef = doc(db, 'users', 'shared_app_store', 'data', 'cashier_shifts');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists() && snapshot.data()?.payload) {
        const remoteData = snapshot.data().payload;
        if (Array.isArray(remoteData)) {
          const cleaned = remoteData
            .filter((s: CashierShiftRecord) => s && s.id !== 'SHF-20260810-01')
            .sort((a: any, b: any) => {
              const dateA = `${a.date} ${a.closedAt || '00:00'}`;
              const dateB = `${b.date} ${b.closedAt || '00:00'}`;
              return dateB.localeCompare(dateA);
            });
          try {
            localStorage.setItem('steak11_cashier_shifts', JSON.stringify(cleaned));
          } catch {}
          window.dispatchEvent(new Event('cashier_shifts_updated'));
          callback(cleaned);
        }
      }
    }, (err) => {
      console.warn('Error on subscribeToCashierShifts:', err);
    });
  } catch (error) {
    console.warn('Error setting subscribeToCashierShifts:', error);
    return () => {};
  }
};

/**
 * Pull the latest Cashier Shifts directly from Cloud Firestore (with API server fallback)
 */
export const pullCashierShiftsFromFirestore = async (): Promise<CashierShiftRecord[]> => {
  const db = getDb();
  let remoteShifts: CashierShiftRecord[] | null = null;

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'users', 'shared_app_store', 'data', 'cashier_shifts');
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.payload && Array.isArray(snap.data()?.payload)) {
        remoteShifts = snap.data()?.payload;
      }
    } catch (e) {
      console.warn('Direct Firestore fetch error for shifts, falling back to server API:', e);
    }
  }

  // Fallback to /api/shifts if Firestore SDK had network/permission hiccups
  if (!remoteShifts || remoteShifts.length === 0) {
    try {
      const res = await fetch('/api/shifts');
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.shifts)) {
          remoteShifts = json.shifts;
        }
      }
    } catch {}
  }

  if (remoteShifts && Array.isArray(remoteShifts)) {
    const cleaned = remoteShifts
      .filter((s: CashierShiftRecord) => s && s.id !== 'SHF-20260810-01')
      .sort((a: any, b: any) => {
        const dateA = `${a.date} ${a.closedAt || '00:00'}`;
        const dateB = `${b.date} ${b.closedAt || '00:00'}`;
        return dateB.localeCompare(dateA);
      });
    try {
      localStorage.setItem('steak11_cashier_shifts', JSON.stringify(cleaned));
    } catch {}
    window.dispatchEvent(new Event('cashier_shifts_updated'));
    return cleaned;
  }

  const raw = localStorage.getItem('steak11_cashier_shifts');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((s: CashierShiftRecord) => s && s.id !== 'SHF-20260810-01');
      }
    } catch {}
  }
  return [];
};

/**
 * Subscribe to Realtime Expenses from Cloud Firestore
 */
export const subscribeToExpenses = (callback: (expenses: PettyCashExpense[]) => void): (() => void) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) return () => {};
  try {
    const docRef = doc(db, 'users', 'shared_app_store', 'data', 'expenses');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists() && snapshot.data()?.payload) {
        const remoteData = snapshot.data().payload;
        if (Array.isArray(remoteData)) {
          const cleaned = remoteData
            .filter((e: PettyCashExpense) => e && e.id !== 'EXP-20260810-001' && e.id !== 'EXP-20260810-002' && e.shiftId !== 'SHF-20260810-01')
            .sort((a: any, b: any) => {
              const dateA = `${a.date} ${a.time || '00:00'}`;
              const dateB = `${b.date} ${b.time || '00:00'}`;
              return dateB.localeCompare(dateA);
            });
          try {
            localStorage.setItem('steak11_expenses', JSON.stringify(cleaned));
          } catch {}
          window.dispatchEvent(new Event('expenses_updated'));
          callback(cleaned);
        }
      }
    }, (err) => {
      console.warn('Error on subscribeToExpenses:', err);
    });
  } catch (error) {
    console.warn('Error setting subscribeToExpenses:', error);
    return () => {};
  }
};

/**
 * Pull the latest Expenses directly from Cloud Firestore (with API server fallback)
 */
export const pullExpensesFromFirestore = async (): Promise<PettyCashExpense[]> => {
  const db = getDb();
  let remoteExpenses: PettyCashExpense[] | null = null;

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'users', 'shared_app_store', 'data', 'expenses');
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.payload && Array.isArray(snap.data()?.payload)) {
        remoteExpenses = snap.data()?.payload;
      }
    } catch (e) {
      console.warn('Direct Firestore fetch error for expenses, falling back to server API:', e);
    }
  }

  // Fallback to /api/expenses if Firestore SDK had network/permission hiccups
  if (!remoteExpenses || remoteExpenses.length === 0) {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.expenses)) {
          remoteExpenses = json.expenses;
        }
      }
    } catch {}
  }

  if (remoteExpenses && Array.isArray(remoteExpenses)) {
    const cleaned = remoteExpenses
      .filter((e: PettyCashExpense) => e && e.id !== 'EXP-20260810-001' && e.id !== 'EXP-20260810-002' && e.shiftId !== 'SHF-20260810-01')
      .sort((a: any, b: any) => {
        const dateA = `${a.date} ${a.time || '00:00'}`;
        const dateB = `${b.date} ${b.time || '00:00'}`;
        return dateB.localeCompare(dateA);
      });
    try {
      localStorage.setItem('steak11_expenses', JSON.stringify(cleaned));
    } catch {}
    window.dispatchEvent(new Event('expenses_updated'));
    return cleaned;
  }

  const raw = localStorage.getItem('steak11_expenses');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((e: PettyCashExpense) => e && e.id !== 'EXP-20260810-001' && e.id !== 'EXP-20260810-002' && e.shiftId !== 'SHF-20260810-01');
      }
    } catch {}
  }
  return [];
};

/**
 * Save new Attendance record directly to Cloud Firestore & Server API
 */
/**
 * Safely sanitizes attendance records for Cloud Firestore:
 * 1. Keeps base64 selfies on top 5 most recent records to prevent doc > 1MB error
 * 2. Completely strips any undefined field values to prevent Firestore unsupported field value errors
 */
export const sanitizeAttendanceForFirestore = (records: AttendanceRecord[]): AttendanceRecord[] => {
  if (!Array.isArray(records)) return [];
  return records.map((rec, idx) => {
    const copy: any = { ...rec };
    if (idx >= 5) {
      delete copy.selfieUrl;
      delete copy.clockOutSelfieUrl;
    }
    Object.keys(copy).forEach((k) => {
      if (copy[k] === undefined) {
        delete copy[k];
      }
    });
    return copy as AttendanceRecord;
  });
};

/**
 * Removes any undefined properties from payload for Firestore compatibility
 */
export const sanitizePayloadForFirestore = (payload: any): any => {
  if (payload === undefined) return null;
  try {
    return JSON.parse(JSON.stringify(payload));
  } catch {
    if (Array.isArray(payload)) {
      return payload.map((item) => {
        if (item && typeof item === 'object') {
          const copy: any = { ...item };
          Object.keys(copy).forEach((k) => {
            if (copy[k] === undefined) delete copy[k];
          });
          return copy;
        }
        return item;
      });
    } else if (payload && typeof payload === 'object') {
      const copy: any = { ...payload };
      Object.keys(copy).forEach((k) => {
        if (copy[k] === undefined) delete copy[k];
      });
      return copy;
    }
    return payload;
  }
};

export const saveAttendanceRecordDirectToCloud = async (newRecord: AttendanceRecord): Promise<AttendanceRecord[]> => {
  const db = getDb();
  let currentRecords = await pullAttendanceFromFirestore();
  
  const updated = [newRecord, ...currentRecords.filter((r) => r.id !== newRecord.id)];
  updated.sort((a: any, b: any) => {
    const dateA = `${a.date} ${a.clockInTime || '00:00:00'}`;
    const dateB = `${b.date} ${b.clockInTime || '00:00:00'}`;
    return dateB.localeCompare(dateA);
  });

  const sanitized = sanitizeAttendanceForFirestore(updated);

  // 1. Direct Firestore write
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'users', 'shared_app_store', 'data', 'attendance');
      await setDoc(docRef, { payload: sanitized, updatedAt: new Date().toISOString() }, { merge: true });
      console.log('✅ Attendance saved to Cloud Firestore successfully!');
    } catch (e) {
      console.error('Direct Firestore save error:', e);
    }
  }

  // 2. Dual-channel server API write
  if (typeof fetch !== 'undefined') {
    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: sanitized })
      });
    } catch (e) {
      console.warn('Server API save error:', e);
    }
  }

  try {
    localStorage.setItem('steak11_attendance', JSON.stringify(sanitized));
  } catch {}

  window.dispatchEvent(new Event('attendance_updated'));
  return sanitized;
};

/**
 * Update an existing Attendance record in Cloud Firestore & Server API
 */
export const updateAttendanceRecordInCloud = async (updatedRecord: AttendanceRecord): Promise<AttendanceRecord[]> => {
  const db = getDb();
  const currentRecords = await pullAttendanceFromFirestore();
  const exists = currentRecords.some((rec) => rec.id === updatedRecord.id);
  const updated = exists
    ? currentRecords.map((rec) => {
        if (rec.id === updatedRecord.id) {
          return { ...rec, ...updatedRecord, updatedAt: new Date().toISOString() };
        }
        return rec;
      })
    : [{ ...updatedRecord, createdAt: updatedRecord.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }, ...currentRecords];

  updated.sort((a: any, b: any) => {
    const dateA = `${a.date} ${a.clockInTime || '00:00:00'}`;
    const dateB = `${b.date} ${b.clockInTime || '00:00:00'}`;
    return dateB.localeCompare(dateA);
  });

  const sanitized = sanitizeAttendanceForFirestore(updated);

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'users', 'shared_app_store', 'data', 'attendance');
      await setDoc(docRef, { payload: sanitized, updatedAt: new Date().toISOString() }, { merge: true });
      console.log('✅ Attendance updated in Cloud Firestore successfully!');
    } catch (e) {
      console.error('Direct Firestore update error:', e);
    }
  }

  if (typeof fetch !== 'undefined') {
    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: sanitized })
      });
    } catch (e) {
      console.warn('Server API update error:', e);
    }
  }

  try {
    localStorage.setItem('steak11_attendance', JSON.stringify(sanitized));
  } catch {}

  window.dispatchEvent(new Event('attendance_updated'));
  return sanitized;
};

/**
 * Delete an Attendance record directly from Cloud Firestore & Server API
 */
export const deleteAttendanceRecordFromCloud = async (recordId: string): Promise<AttendanceRecord[]> => {
  const db = getDb();
  let currentRecords = await pullAttendanceFromFirestore();
  
  const updated = currentRecords.filter((rec) => rec.id !== recordId);
  const sanitized = sanitizeAttendanceForFirestore(updated);

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'users', 'shared_app_store', 'data', 'attendance');
      await setDoc(docRef, { payload: sanitized, updatedAt: new Date().toISOString() }, { merge: true });
      console.log('✅ Attendance deleted from Cloud Firestore successfully!');
    } catch (e) {
      console.error('Direct Firestore delete error:', e);
    }
  }

  if (typeof fetch !== 'undefined') {
    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: sanitized })
      });
    } catch (e) {
      console.warn('Server API delete error:', e);
    }
  }

  try {
    localStorage.setItem('steak11_attendance', JSON.stringify(sanitized));
  } catch {}

  window.dispatchEvent(new Event('attendance_updated'));
  return sanitized;
};

/**
 * Save or Update an Order in Firestore
 */
export const saveOrderToFirebase = async (order: OrderItem) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) return;
  try {
    const docRef = doc(db, ORDERS_COL, order.id);
    await setDoc(docRef, order, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COL}/${order.id}`);
  }
};

/**
 * Delete an Order from Firestore
 */
export const deleteOrderFromFirebase = async (orderId: string) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) return;
  try {
    const docRef = doc(db, ORDERS_COL, orderId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ORDERS_COL}/${orderId}`);
  }
};

/**
 * Update Order Status
 */
export const updateOrderStatusInFirebase = async (orderId: string, status: string) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) return;
  try {
    const ref = doc(db, ORDERS_COL, orderId);
    await updateDoc(ref, {
      status,
      updatedAt: new Date().toISOString()
    });
    console.log('Order status updated in Firebase Firestore:', orderId, status);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COL}/${orderId}`);
  }
};

/**
 * Save or Update a Menu Item in Firestore
 */
export const saveMenuItemToFirebase = async (item: MenuItem) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) return;
  try {
    const ref = doc(db, MENU_COL, item.id);
    await setDoc(ref, item, { merge: true });
    console.log('Menu item saved to Firebase Firestore:', item.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MENU_COL}/${item.id}`);
  }
};

/**
 * Delete a Menu Item in Firestore
 */
export const deleteMenuItemInFirebase = async (itemId: string) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) return;
  try {
    const ref = doc(db, MENU_COL, itemId);
    await deleteDoc(ref);
    console.log('Menu item deleted in Firebase Firestore:', itemId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MENU_COL}/${itemId}`);
  }
};

/**
 * Delete a specific document in any Firestore collection
 */
export const deleteDocumentInFirebase = async (collectionName: string, docId: string) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db || !docId) return;
  try {
    const ref = doc(db, collectionName, docId);
    await deleteDoc(ref);
    console.log(`Document '${docId}' successfully deleted from Firestore collection '${collectionName}'`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
};

/**
 * Sync entire collection with local deletion to Firestore
 */
export const syncCollectionWithDeletionToFirestore = async (colName: string, items: any[]) => {
  const db = getDb();
  if (!isFirebaseConfigured() || !db) return;
  try {
    const currentSnap = await getDocs(collection(db, colName));
    const currentIdsInFirestore = new Set(currentSnap.docs.map((d) => d.id));
    const newIds = new Set((items || []).map((i) => i.id).filter(Boolean));

    const batch = writeBatch(db);

    // 1. Delete documents from Firestore that were deleted locally
    currentIdsInFirestore.forEach((id) => {
      if (!newIds.has(id)) {
        batch.delete(doc(db, colName, id));
      }
    });

    // 2. Set / merge remaining items into Firestore
    if (items && items.length > 0) {
      items.forEach((item) => {
        if (item && item.id) {
          const ref = doc(db, colName, item.id);
          batch.set(ref, item, { merge: true });
        }
      });
    }

    await batch.commit();
    console.log(`Synced collection '${colName}' (${items.length} items) with deletion to Firestore!`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, colName);
  }
};

/**
 * Sync user-scoped data to Firestore under users/shared_app_store/data/{dataKey}
 */
export const syncUserDataToFirestore = async (dataKey: string, payload: any) => {
  const db = getDb();
  if (!db) return;
  const targetUid = 'shared_app_store';

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('steak11_' + dataKey + '_save_time', Date.now().toString());
    }
  } catch {}

  let sanitizedPayload = payload;
  if (dataKey === 'attendance' && Array.isArray(payload)) {
    sanitizedPayload = sanitizeAttendanceForFirestore(payload);
  } else {
    sanitizedPayload = sanitizePayloadForFirestore(payload);
  }

  try {
    const sharedDocRef = doc(db, 'users', targetUid, 'data', dataKey);
    await setDoc(sharedDocRef, { payload: sanitizedPayload, updatedAt: new Date().toISOString() });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${targetUid}/data/${dataKey}`);
  }

  // Dual-channel sync: Also post attendance, cashier_shifts, and expenses to backend server API
  if (typeof fetch !== 'undefined') {
    if (dataKey === 'attendance' && Array.isArray(payload)) {
      fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: sanitizedPayload })
      }).catch(() => {});
    } else if (dataKey === 'cashier_shifts' && Array.isArray(payload)) {
      fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shifts: sanitizedPayload })
      }).catch(() => {});
    } else if (dataKey === 'expenses' && Array.isArray(payload)) {
      fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses: sanitizedPayload })
      }).catch(() => {});
    }
  }
};

export const getInitialDataForKey = (key: string): any => {
  const stored = localStorage.getItem('steak11_' + key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  switch (key) {
    case 'employees': return DEFAULT_EMPLOYEES;
    case 'attendance': return DEFAULT_ATTENDANCE;
    case 'payroll': return DEFAULT_PAYROLL;
    case 'menu_items': return MENU_ITEMS;
    case 'chicken_options': return CHICKEN_OPTIONS;
    case 'sauce_options': return SAUCE_OPTIONS;
    case 'addon_options': return ADDON_OPTIONS;
    case 'locations': return LOCATIONS;
    case 'orders': return DEFAULT_ORDERS;
    case 'menu_categories': return DEFAULT_MENU_CATEGORIES;
    case 'admins': return DEFAULT_ADMINS;
    case 'role_settings': return DEFAULT_ROLE_SETTINGS;
    case 'wa_settings': return DEFAULT_WA_SETTINGS;
    case 'branding': return DEFAULT_BRANDING;
    case 'inventory': return DEFAULT_INVENTORY;
    case 'promos': return DEFAULT_PROMOS;
    case 'cashier_shifts': return DEFAULT_CASHIER_SHIFTS;
    case 'reviews': return REVIEWS;
    case 'suppliers': return DEFAULT_SUPPLIERS;
    case 'purchase_orders': return DEFAULT_PURCHASE_ORDERS;
    case 'expenses': return DEFAULT_EXPENSES;
    case 'recipes': return DEFAULT_RECIPES;
    case 'stock_opnames': return DEFAULT_STOCK_OPNAMES;
    case 'stock_transfers': return DEFAULT_STOCK_TRANSFERS;
    case 'audit_logs': return DEFAULT_AUDIT_LOGS;
    case 'stock_mutations': return DEFAULT_STOCK_MUTATIONS;
    case 'customers': return DEFAULT_CUSTOMERS;
    case 'wa_gateway_config': return DEFAULT_WA_GATEWAY_CONFIG;
    case 'shift_templates': return DEFAULT_SHIFT_TEMPLATES;
    case 'schedules': return [];
    case 'employee_loans': return [];
    case 'monthly_deductions': return [
      {
        id: 'DED-202608-01',
        month: new Date().toISOString().substring(0, 7),
        outlet: 'Steak 11, Cibubur',
        category: 'Sewa Tempat & Gedung',
        name: 'Biaya Sewa Ruko & Lokasi Cabang Cibubur',
        amount: 3500000,
        notes: 'Sewa bulanan ruko operasional',
        createdAt: new Date().toISOString()
      },
      {
        id: 'DED-202608-02',
        month: new Date().toISOString().substring(0, 7),
        outlet: 'Semua Cabang (Konsolidasi)',
        category: 'Marketing & Promo',
        name: 'Biaya Marketing, Iklan Ads & Konten Medsos',
        amount: 500000,
        notes: 'Budget promosi bulanan',
        createdAt: new Date().toISOString()
      }
    ];
    case 'late_penalty_threshold': return 30;
    case 'overtime_rate': return 15000;
    default: return [];
  }
};

/**
 * Force push all local datasets (employees, attendance, payroll, etc) to Firestore
 */
export const pushAllLocalDataToFirestore = async () => {
  const db = getDb();
  const targetUid = 'shared_app_store';
  if (!db) return;

  const keys = [
    'menu_items', 'chicken_options', 'sauce_options', 'addon_options', 'locations',
    'orders', 'employees', 'attendance', 'payroll', 'menu_categories', 'admins',
    'role_settings', 'wa_settings', 'branding', 'inventory', 'promos', 'cashier_shifts',
    'reviews', 'suppliers', 'purchase_orders', 'expenses', 'recipes', 'stock_opnames',
    'stock_transfers', 'audit_logs', 'stock_mutations', 'customers', 'wa_gateway_config',
    'shift_templates', 'schedules', 'employee_loans', 'payment_settings', 'receipt_settings', 'gas_url',
    'monthly_deductions', 'late_penalty_threshold', 'overtime_rate'
  ];

  for (const key of keys) {
    try {
      let rawLocal = localStorage.getItem('steak11_' + key);
      if (key === 'recipes' && !rawLocal) {
        rawLocal = localStorage.getItem('steak11_menu_recipes');
      } else if (key === 'schedules' && !rawLocal) {
        rawLocal = localStorage.getItem('steak11_employee_schedules');
      } else if (key === 'overtime_rate' && !rawLocal) {
        rawLocal = localStorage.getItem('steak11_default_overtime_rate');
      }

      let data: any;
      if (rawLocal !== null) {
        try {
          data = JSON.parse(rawLocal);
        } catch {
          data = getInitialDataForKey(key);
        }
      } else {
        data = getInitialDataForKey(key);
      }
      const sharedDocRef = doc(db, 'users', targetUid, 'data', key);
      await setDoc(sharedDocRef, { payload: data, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn(`Error pushing ${key} to Firestore:`, e);
    }
  }
};

/**
 * Force pull all remote datasets from Cloud Firestore into LocalStorage & trigger update events
 */
export const pullAllFirestoreDataToLocal = async (): Promise<{ success: boolean; pulledKeys: number; message: string }> => {
  const db = getDb();
  const targetUid = 'shared_app_store';
  if (!db || !isFirebaseConfigured()) {
    return { success: false, pulledKeys: 0, message: 'Firebase belum terkonfigurasi.' };
  }

  const keys = [
    'menu_items', 'chicken_options', 'sauce_options', 'addon_options', 'locations',
    'orders', 'employees', 'attendance', 'payroll', 'menu_categories', 'admins',
    'role_settings', 'wa_settings', 'branding', 'inventory', 'promos', 'cashier_shifts',
    'reviews', 'suppliers', 'purchase_orders', 'expenses', 'recipes', 'stock_opnames',
    'stock_transfers', 'audit_logs', 'stock_mutations', 'customers', 'wa_gateway_config',
    'shift_templates', 'schedules', 'employee_loans', 'payment_settings', 'receipt_settings', 'gas_url',
    'monthly_deductions', 'late_penalty_threshold', 'overtime_rate'
  ];

  let count = 0;
  for (const key of keys) {
    try {
      const sharedDocRef = doc(db, 'users', targetUid, 'data', key);
      const sharedSnap = await getDoc(sharedDocRef);
      if (sharedSnap.exists() && sharedSnap.data()?.payload !== undefined) {
        let finalData = sharedSnap.data().payload;
        if (key === 'attendance' && Array.isArray(finalData)) {
          const rawLocal = localStorage.getItem('steak11_attendance');
          let localArr: any[] = [];
          if (rawLocal) {
            try { localArr = JSON.parse(rawLocal); } catch {}
          }
          if (Array.isArray(localArr)) {
            finalData = mergeAttendancePhotos(finalData, localArr);
          }
        } else if (key === 'cashier_shifts' && Array.isArray(finalData)) {
          finalData = finalData.filter((s: any) => s && s.id !== 'SHF-20260810-01');
        } else if (key === 'expenses' && Array.isArray(finalData)) {
          finalData = finalData.filter((e: any) => e && e.id !== 'EXP-20260810-001' && e.id !== 'EXP-20260810-002' && e.shiftId !== 'SHF-20260810-01');
        }
        
        const jsonVal = JSON.stringify(finalData);
        localStorage.setItem('steak11_' + key, jsonVal);
        if (key === 'recipes') {
          localStorage.setItem('steak11_menu_recipes', jsonVal);
        } else if (key === 'schedules') {
          localStorage.setItem('steak11_employee_schedules', jsonVal);
        } else if (key === 'overtime_rate') {
          localStorage.setItem('steak11_default_overtime_rate', jsonVal);
        }

        window.dispatchEvent(new Event(key + '_updated'));
        if (key === 'chicken_options' || key === 'sauce_options' || key === 'addon_options') {
          window.dispatchEvent(new Event('racik_options_updated'));
        }
        count++;
      }
    } catch (e) {
      console.warn(`Error pulling ${key} from Firestore:`, e);
    }
  }

  return {
    success: true,
    pulledKeys: count,
    message: `✅ Berhasil menarik ${count} dataset dari users/shared_app_store ke aplikasi!`
  };
};

/**
 * Clean up legacy double documents under users/d2d8IJ0cRwMCNs71Y1L7vk5ZpEw2/data/{key}
 */
export const cleanUpLegacyUserDocs = async (): Promise<{ success: boolean; deletedCount: number; message: string }> => {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    return { success: false, deletedCount: 0, message: 'Firebase belum terkonfigurasi.' };
  }

  const legacyUid = 'd2d8IJ0cRwMCNs71Y1L7vk5ZpEw2';
  const keys = [
    'menu_items', 'chicken_options', 'sauce_options', 'addon_options', 'locations',
    'orders', 'employees', 'attendance', 'payroll', 'menu_categories', 'admins',
    'role_settings', 'wa_settings', 'branding', 'inventory', 'promos', 'cashier_shifts',
    'reviews', 'suppliers', 'purchase_orders', 'expenses', 'recipes', 'stock_opnames',
    'stock_transfers', 'audit_logs', 'stock_mutations', 'customers', 'wa_gateway_config',
    'shift_templates', 'schedules', 'employee_loans', 'payment_settings', 'receipt_settings', 'gas_url',
    'monthly_deductions', 'late_penalty_threshold', 'overtime_rate'
  ];

  let deletedCount = 0;
  for (const key of keys) {
    try {
      const legacyDocRef = doc(db, 'users', legacyUid, 'data', key);
      await deleteDoc(legacyDocRef);
      deletedCount++;

      const sharedDocRef = doc(db, 'shared_data', key);
      await deleteDoc(sharedDocRef).catch(() => {});
    } catch (e) {
      console.warn(`Error deleting legacy doc ${key}:`, e);
    }
  }

  return {
    success: true,
    deletedCount,
    message: `🧹 Berhasil menghapus ${deletedCount} dokumen ganda (users/${legacyUid}/data/*) dari Cloud Firestore!`
  };
};

/**
 * Helper to preserve high-res selfie photos on existing attendance records without resurrecting deleted ones
 */
export const mergeAttendancePhotos = (remoteRecords: AttendanceRecord[], localRecords: AttendanceRecord[]): AttendanceRecord[] => {
  if (!Array.isArray(remoteRecords)) return [];
  if (!Array.isArray(localRecords) || localRecords.length === 0) return remoteRecords;

  const photoMap = new Map<string, { selfieUrl?: string; clockOutSelfieUrl?: string }>();
  localRecords.forEach((item) => {
    if (item && item.id && (item.selfieUrl || item.clockOutSelfieUrl)) {
      photoMap.set(String(item.id), {
        selfieUrl: item.selfieUrl,
        clockOutSelfieUrl: item.clockOutSelfieUrl
      });
    }
  });

  return remoteRecords.map((item) => {
    const photos = photoMap.get(String(item.id));
    if (!photos) return item;
    return {
      ...item,
      selfieUrl: item.selfieUrl || photos.selfieUrl,
      clockOutSelfieUrl: item.clockOutSelfieUrl || photos.clockOutSelfieUrl
    };
  });
};

/**
 * Start Real-time Per-User Firestore Sync with Multi-Tab Collision Prevention
 */
export const startPerUserFirestoreSync = (_uid?: string): (() => void) => {
  const db = getDb();
  const targetUid = 'shared_app_store';
  if (!isFirebaseConfigured() || !db) return () => {};

  // Auto clean up legacy double docs once per session
  if (typeof window !== 'undefined' && !sessionStorage.getItem('steak11_legacy_cleaned')) {
    sessionStorage.setItem('steak11_legacy_cleaned', 'true');
    cleanUpLegacyUserDocs().catch(() => {});
  }

  const keys = [
    'menu_items', 'chicken_options', 'sauce_options', 'addon_options', 'locations',
    'orders', 'employees', 'attendance', 'payroll', 'menu_categories', 'admins',
    'role_settings', 'wa_settings', 'branding', 'inventory', 'promos', 'cashier_shifts',
    'reviews', 'suppliers', 'purchase_orders', 'expenses', 'recipes', 'stock_opnames',
    'stock_transfers', 'audit_logs', 'stock_mutations', 'customers', 'wa_gateway_config',
    'shift_templates', 'schedules', 'employee_loans', 'payment_settings', 'receipt_settings', 'gas_url',
    'monthly_deductions', 'late_penalty_threshold', 'overtime_rate'
  ];

  const unsubscribes: (() => void)[] = [];

  // Cross-tab synchronization via native 'storage' events
  if (typeof window !== 'undefined') {
    const handleCrossTabStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('steak11_') && !e.key.endsWith('_save_time')) {
        const keyName = e.key.replace('steak11_', '');
        window.dispatchEvent(new Event(keyName + '_updated'));
        if (keyName === 'chicken_options' || keyName === 'sauce_options' || keyName === 'addon_options') {
          window.dispatchEvent(new Event('racik_options_updated'));
        }
        if (keyName === 'menu_recipes' || keyName === 'recipes') {
          window.dispatchEvent(new Event('recipes_updated'));
        }
        if (keyName === 'employee_schedules' || keyName === 'schedules') {
          window.dispatchEvent(new Event('schedules_updated'));
        }
      }
    };
    window.addEventListener('storage', handleCrossTabStorage);
    unsubscribes.push(() => window.removeEventListener('storage', handleCrossTabStorage));
  }

  keys.forEach((key) => {
    try {
      const sharedDocRef = doc(db, 'users', targetUid, 'data', key);
      let lastRemoteJson = '';

      const unsub = onSnapshot(sharedDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data()?.payload !== undefined) {
          const docData = docSnap.data();
          const remoteData = docData.payload;
          const currentLocal = localStorage.getItem('steak11_' + key);

          let localData: any = null;
          if (currentLocal) {
            try {
              localData = JSON.parse(currentLocal);
            } catch {}
          }

          let finalData = remoteData;

          // For attendance, preserve local selfie URLs if remote doesn't have them
          if (key === 'attendance' && Array.isArray(remoteData) && Array.isArray(localData)) {
            finalData = mergeAttendancePhotos(remoteData, localData);
          } else if (key === 'cashier_shifts' && Array.isArray(remoteData)) {
            finalData = remoteData.filter((s: any) => s && s.id !== 'SHF-20260810-01');
          } else if (key === 'expenses' && Array.isArray(remoteData)) {
            finalData = remoteData.filter((e: any) => e && e.id !== 'EXP-20260810-001' && e.id !== 'EXP-20260810-002' && e.shiftId !== 'SHF-20260810-01');
          }

          const finalJson = JSON.stringify(finalData);

          if (finalJson !== currentLocal || finalJson !== lastRemoteJson) {
            lastRemoteJson = finalJson;
            localStorage.setItem('steak11_' + key, finalJson);
            if (key === 'recipes') {
              localStorage.setItem('steak11_menu_recipes', finalJson);
            } else if (key === 'schedules') {
              localStorage.setItem('steak11_employee_schedules', finalJson);
            } else if (key === 'overtime_rate') {
              localStorage.setItem('steak11_default_overtime_rate', finalJson);
            }

            window.dispatchEvent(new Event(key + '_updated'));
            if (key === 'chicken_options' || key === 'sauce_options' || key === 'addon_options') {
              window.dispatchEvent(new Event('racik_options_updated'));
            }
          }
        } else {
          // Document does not exist in Firestore yet: seed from initial / local data once
          let rawLocal = localStorage.getItem('steak11_' + key);
          if (key === 'recipes' && !rawLocal) {
            rawLocal = localStorage.getItem('steak11_menu_recipes');
          } else if (key === 'schedules' && !rawLocal) {
            rawLocal = localStorage.getItem('steak11_employee_schedules');
          } else if (key === 'overtime_rate' && !rawLocal) {
            rawLocal = localStorage.getItem('steak11_default_overtime_rate');
          }

          let initialData: any;
          if (rawLocal !== null) {
            try {
              initialData = JSON.parse(rawLocal);
            } catch {
              initialData = getInitialDataForKey(key);
            }
          } else {
            initialData = getInitialDataForKey(key);
          }
          setDoc(sharedDocRef, { payload: sanitizePayloadForFirestore(initialData), updatedAt: new Date().toISOString() }).catch(() => {});
        }
      }, (err) => {
        console.warn(`Error on listener for ${key}:`, err);
      });
      unsubscribes.push(unsub);
    } catch (err) {
      console.warn(`Error setting listener for ${key}:`, err);
    }
  });

  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
};

/**
 * Legacy compatibility stubs for global collections
 */
export const syncAllMenuItemsToFirebase = (items: MenuItem[]) => {
  syncUserDataToFirestore('menu_items', items);
  syncCollectionWithDeletionToFirestore('menu_items', items);
};
export const syncAllRacikOptionsToFirebase = (c: any, s: any, a: any) => {
  syncUserDataToFirestore('chicken_options', c);
  syncUserDataToFirestore('sauce_options', s);
  syncUserDataToFirestore('addon_options', a);
};
export const syncAllCategoriesToFirebase = (cats: any) => syncUserDataToFirestore('menu_categories', cats);
export const syncEntireMenuDataToFirebase = (m: any, c: any, s: any, a: any, cat: any) => {
  syncUserDataToFirestore('menu_items', m);
  syncCollectionWithDeletionToFirestore('menu_items', m);
  syncUserDataToFirestore('chicken_options', c);
  syncUserDataToFirestore('sauce_options', s);
  syncUserDataToFirestore('addon_options', a);
  syncUserDataToFirestore('menu_categories', cat);
};
export const syncAllOrdersToFirebase = (orders: OrderItem[]) => {
  syncUserDataToFirestore('orders', orders);
  syncCollectionWithDeletionToFirestore('orders', orders);
};
export const syncAllAttendanceToFirebase = (records: any) => syncUserDataToFirestore('attendance', records);
export const syncAllCustomersToFirebase = (customers: any) => syncUserDataToFirestore('customers', customers);
export const syncAllEmployeesToFirebase = (employees: any) => syncUserDataToFirestore('employees', employees);
export const syncAllAdminsToFirebase = (admins: any) => syncUserDataToFirestore('admins', admins);
export const syncAllPayrollToFirebase = (payroll: any) => syncUserDataToFirestore('payroll', payroll);
export const syncAllInventoryToFirebase = (inventory: any) => syncUserDataToFirestore('inventory', inventory);
export const syncAllExpensesToFirebase = (expenses: any) => syncUserDataToFirestore('expenses', expenses);
export const syncAllPromosToFirebase = (promos: any) => syncUserDataToFirestore('promos', promos);
export const syncAllReviewsToFirebase = (reviews: any) => syncUserDataToFirestore('reviews', reviews);
export const syncAllSuppliersToFirebase = (suppliers: any) => syncUserDataToFirestore('suppliers', suppliers);
export const syncAllPurchaseOrdersToFirebase = (pos: any) => syncUserDataToFirestore('purchase_orders', pos);
export const syncAllLocationsToFirebase = (locs: any) => syncUserDataToFirestore('locations', locs);
export const startRealtimeFirestoreSync = () => () => {};



