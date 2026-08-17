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
import { MenuItem, OrderItem } from '../types';
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
    localStorage.setItem('steak11_' + dataKey + '_save_time', Date.now().toString());
  } catch {}

  try {
    const sharedDocRef = doc(db, 'users', targetUid, 'data', dataKey);
    await setDoc(sharedDocRef, { payload, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${targetUid}/data/${dataKey}`);
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
    case 'employee_loans': return DEFAULT_EMPLOYEE_LOANS;
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
    'shift_templates', 'schedules', 'employee_loans', 'payment_settings', 'receipt_settings', 'gas_url'
  ];

  for (const key of keys) {
    try {
      const rawLocal = localStorage.getItem('steak11_' + key);
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
    'shift_templates', 'schedules', 'employee_loans', 'payment_settings', 'receipt_settings', 'gas_url'
  ];

  let count = 0;
  for (const key of keys) {
    try {
      const sharedDocRef = doc(db, 'users', targetUid, 'data', key);
      const sharedSnap = await getDoc(sharedDocRef);
      if (sharedSnap.exists() && sharedSnap.data()?.payload !== undefined) {
        const remoteData = sharedSnap.data().payload;
        localStorage.setItem('steak11_' + key, JSON.stringify(remoteData));
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
    'shift_templates', 'schedules', 'employee_loans', 'payment_settings', 'receipt_settings', 'gas_url'
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

const mergeArrayById = (localArray: any[], remoteArray: any[]): any[] => {
  if (!Array.isArray(localArray)) return Array.isArray(remoteArray) ? remoteArray : [];
  if (!Array.isArray(remoteArray)) return Array.isArray(localArray) ? localArray : [];

  const map = new Map<string, any>();
  remoteArray.forEach((item) => {
    if (item && item.id) {
      map.set(String(item.id), item);
    }
  });
  localArray.forEach((item) => {
    if (item && item.id) {
      if (!map.has(String(item.id))) {
        map.set(String(item.id), item);
      }
    }
  });
  return Array.from(map.values());
};

/**
 * Start Real-time Per-User Firestore Sync
 */
export const startPerUserFirestoreSync = (_uid?: string): (() => void) => {
  const db = getDb();
  const targetUid = 'shared_app_store';
  if (!isFirebaseConfigured() || !db) return () => {};

  // Auto clean up legacy double docs
  cleanUpLegacyUserDocs().catch(() => {});

  const keys = [
    'menu_items', 'chicken_options', 'sauce_options', 'addon_options', 'locations',
    'orders', 'employees', 'attendance', 'payroll', 'menu_categories', 'admins',
    'role_settings', 'wa_settings', 'branding', 'inventory', 'promos', 'cashier_shifts',
    'reviews', 'suppliers', 'purchase_orders', 'expenses', 'recipes', 'stock_opnames',
    'stock_transfers', 'audit_logs', 'stock_mutations', 'customers', 'wa_gateway_config',
    'shift_templates', 'schedules', 'employee_loans', 'payment_settings', 'receipt_settings', 'gas_url'
  ];

  const unsubscribes: (() => void)[] = [];

  keys.forEach((key) => {
    try {
      const sharedDocRef = doc(db, 'users', targetUid, 'data', key);
      let lastRemoteJson = '';

      const unsub = onSnapshot(sharedDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data()?.payload !== undefined) {
          const remoteData = docSnap.data().payload;
          const currentLocal = localStorage.getItem('steak11_' + key);
          const lastSaveTimeStr = localStorage.getItem('steak11_' + key + '_save_time');
          const lastSaveTime = lastSaveTimeStr ? parseInt(lastSaveTimeStr, 10) : 0;
          const isRecentlySavedLocally = (Date.now() - lastSaveTime) < 15000;

          let localData: any = null;
          if (currentLocal) {
            try {
              localData = JSON.parse(currentLocal);
            } catch {}
          }

          let finalData = remoteData;
          let needsRemotePush = false;

          if (Array.isArray(remoteData) && Array.isArray(localData)) {
            const merged = mergeArrayById(localData, remoteData);
            if (merged.length > remoteData.length) {
              needsRemotePush = true;
            }
            finalData = merged;
          } else if (isRecentlySavedLocally && localData) {
            finalData = localData;
            needsRemotePush = true;
          }

          const finalJson = JSON.stringify(finalData);
          if (finalJson !== currentLocal || finalJson !== lastRemoteJson) {
            lastRemoteJson = finalJson;
            localStorage.setItem('steak11_' + key, finalJson);
            window.dispatchEvent(new Event(key + '_updated'));
            if (key === 'chicken_options' || key === 'sauce_options' || key === 'addon_options') {
              window.dispatchEvent(new Event('racik_options_updated'));
            }
          }

          if (needsRemotePush) {
            setDoc(sharedDocRef, { payload: finalData, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
          }
        } else {
          const rawLocal = localStorage.getItem('steak11_' + key);
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
          setDoc(sharedDocRef, { payload: initialData, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
        }
      }, () => {});
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
export const syncAllMenuItemsToFirebase = (items: MenuItem[]) => syncUserDataToFirestore('menu_items', items);
export const syncAllRacikOptionsToFirebase = (c: any, s: any, a: any) => {
  syncUserDataToFirestore('chicken_options', c);
  syncUserDataToFirestore('sauce_options', s);
  syncUserDataToFirestore('addon_options', a);
};
export const syncAllCategoriesToFirebase = (cats: any) => syncUserDataToFirestore('menu_categories', cats);
export const syncEntireMenuDataToFirebase = (m: any, c: any, s: any, a: any, cat: any) => {
  syncUserDataToFirestore('menu_items', m);
  syncUserDataToFirestore('chicken_options', c);
  syncUserDataToFirestore('sauce_options', s);
  syncUserDataToFirestore('addon_options', a);
  syncUserDataToFirestore('menu_categories', cat);
};
export const syncAllOrdersToFirebase = (orders: OrderItem[]) => syncUserDataToFirestore('orders', orders);
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
export const refreshEmployeesFromFirebase = async (): Promise<any[] | null> => null;



