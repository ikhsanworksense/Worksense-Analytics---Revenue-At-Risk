import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Customer, ActionLog, ScoringConfig } from '../types';

const INITIAL_CUSTOMERS: Customer[] = [
  { id: "CUST-001", name: "PT Astra Internasional, Tbk", segment: "Enterprise", recency: 85, freqScore: 4, monetary: 350000000, status: "Pending" },
  { id: "CUST-002", name: "Indofood CBP Sukses Makmur", segment: "Enterprise", recency: 42, freqScore: 3, monetary: 480000000, status: "Pending" },
  { id: "CUST-003", name: "PT GoTo Gojek Tokopedia", segment: "Enterprise", recency: 12, freqScore: 5, monetary: 750000000, status: "Pending" },
  { id: "CUST-004", name: "Unilever Indonesia Tbk", segment: "Enterprise", recency: 92, freqScore: 2, monetary: 290000000, status: "Pending" },
  { id: "CUST-005", name: "Kopi Kenangan Sejahtera", segment: "Mid-Market", recency: 68, freqScore: 4, monetary: 120000000, status: "Pending" },
  { id: "CUST-006", name: "Bukalapak Core Office", segment: "Mid-Market", recency: 15, freqScore: 2, monetary: 95000000, status: "Pending" },
  { id: "CUST-007", name: "Bumi Resources Mining", segment: "Mid-Market", recency: 55, freqScore: 1, monetary: 195000000, status: "Pending" },
  { id: "CUST-008", name: "Sinar Mas Land Dev", segment: "Enterprise", recency: 74, freqScore: 5, monetary: 510000000, status: "Pending" },
  { id: "CUST-009", name: "Ruangguru Education Corp", segment: "Mid-Market", recency: 32, freqScore: 3, monetary: 88000000, status: "Pending" },
  { id: "CUST-010", name: "Mitra Adiperkasa Retail", segment: "Enterprise", recency: 5, freqScore: 4, monetary: 420000000, status: "Pending" },
  { id: "CUST-011", name: "Anteraja Logistics Group", segment: "Mid-Market", recency: 105, freqScore: 2, monetary: 135000000, status: "Pending" },
  { id: "CUST-012", name: "Warung Pintar Solusi", segment: "SMB", recency: 58, freqScore: 2, monetary: 45000000, status: "Pending" },
  { id: "CUST-013", name: "Eiger Adventure Supplies", segment: "SMB", recency: 72, freqScore: 4, monetary: 60000000, status: "Pending" },
  { id: "CUST-014", name: "Kopi Nako Franchise", segment: "SMB", recency: 14, freqScore: 5, monetary: 35000000, status: "Pending" },
  { id: "CUST-015", name: "Hijra Bank Tech", segment: "SMB", recency: 48, freqScore: 3, monetary: 55000000, status: "Pending" }
];

const INITIAL_ACTIONS: ActionLog[] = [
  { id: "ACT-101", customerId: "CUST-003", customerName: "PT GoTo Gojek Tokopedia", timestamp: "2026-07-16 14:32", type: "Strategy Session", notes: "Negotiated new license options for the Q3 pipeline. Risk successfully neutralized.", officer: "Ikhsan (Sense)", impact: 750000000, status: "Contacted" },
  { id: "ACT-102", customerId: "CUST-010", customerName: "Mitra Adiperkasa Retail", timestamp: "2026-07-15 09:12", type: "Direct Phone Call", notes: "Called head of retail operations. Standard verification check. Customer reports stable platform state.", officer: "Ikhsan (Sense)", impact: 420000000, status: "Contacted" }
];

const INITIAL_CONFIG: ScoringConfig = {
  recencyMed: 30,
  recencyHigh: 60,
  freqMultiplier: 1.5,
  highScoreThreshold: 70
};

// -----------------------------------------------------------------
// CUSTOMER SERVICES
// -----------------------------------------------------------------

export async function getCustomers(): Promise<Customer[]> {
  try {
    const colRef = collection(db, 'customers');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      // Seeding database on first load
      console.log('Seeding initial customers to Firestore...');
      for (const cust of INITIAL_CUSTOMERS) {
        await setDoc(doc(colRef, cust.id), cust);
      }
      return INITIAL_CUSTOMERS;
    }
    const list: Customer[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Customer);
    });
    // Ensure correct sorting or mapping if required
    return list.sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    console.error('Error fetching customers from Firestore:', error);
    throw error;
  }
}

export async function saveCustomer(customer: Customer): Promise<void> {
  try {
    const docRef = doc(db, 'customers', customer.id);
    await setDoc(docRef, customer);
  } catch (error) {
    console.error('Error saving customer to Firestore:', error);
    throw error;
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'customers', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting customer from Firestore:', error);
    throw error;
  }
}

// -----------------------------------------------------------------
// ACTIONS LOG SERVICES
// -----------------------------------------------------------------

export async function getActions(): Promise<ActionLog[]> {
  try {
    const colRef = collection(db, 'actions');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('Seeding initial actions to Firestore...');
      for (const act of INITIAL_ACTIONS) {
        await setDoc(doc(colRef, act.id), act);
      }
      return INITIAL_ACTIONS;
    }
    const list: ActionLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as ActionLog);
    });
    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (error) {
    console.error('Error fetching actions from Firestore:', error);
    throw error;
  }
}

export async function saveAction(action: ActionLog): Promise<void> {
  try {
    const docRef = doc(db, 'actions', action.id);
    await setDoc(docRef, action);
  } catch (error) {
    console.error('Error saving action to Firestore:', error);
    throw error;
  }
}

export async function deleteAction(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'actions', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting action from Firestore:', error);
    throw error;
  }
}

// -----------------------------------------------------------------
// CONFIG SERVICES
// -----------------------------------------------------------------

export async function getConfig(): Promise<ScoringConfig> {
  try {
    const docRef = doc(db, 'config', 'scoring');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.log('Seeding initial config to Firestore...');
      await setDoc(docRef, INITIAL_CONFIG);
      return INITIAL_CONFIG;
    }
    return docSnap.data() as ScoringConfig;
  } catch (error) {
    console.error('Error fetching config from Firestore:', error);
    throw error;
  }
}

export async function saveConfig(config: ScoringConfig): Promise<void> {
  try {
    const docRef = doc(db, 'config', 'scoring');
    await setDoc(docRef, config);
  } catch (error) {
    console.error('Error saving config to Firestore:', error);
    throw error;
  }
}

// -----------------------------------------------------------------
// FEEDBACK SERVICES
// -----------------------------------------------------------------

export async function saveFeedback(feedback: any): Promise<void> {
  try {
    const docRef = doc(db, 'feedbacks', feedback.id);
    await setDoc(docRef, feedback);
  } catch (error) {
    console.error('Error saving feedback to Firestore:', error);
    throw error;
  }
}
