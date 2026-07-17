import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Customer, ActionLog, ScoringConfig } from '../types';

const INITIAL_CUSTOMERS: Customer[] = [
  { id: "CUST-001", name: "PT Astra Internasional, Tbk", segment: "Enterprise", recency: 85, freqScore: 4, monetary: 350000000, status: "Pending" },
  { id: "CUST-002", name: "Indofood CBP Sukses Makmur", segment: "Enterprise", recency: 42, freqScore: 3, monetary: 480000000, status: "Pending" },
  { id: "CUST-003", name: "PT GoTo Gojek Tokopedia", segment: "Enterprise", recency: 12, freqScore: 5, monetary: 750000000, status: "Contacted" },
  { id: "CUST-004", name: "Unilever Indonesia Tbk", segment: "Enterprise", recency: 92, freqScore: 2, monetary: 290000000, status: "Pending" },
  { id: "CUST-005", name: "Kopi Kenangan Sejahtera", segment: "Mid-Market", recency: 68, freqScore: 4, monetary: 120000000, status: "Pending" },
  { id: "CUST-006", name: "Bukalapak Core Office", segment: "Mid-Market", recency: 15, freqScore: 2, monetary: 95000000, status: "Pending" },
  { id: "CUST-007", name: "Bumi Resources Mining", segment: "Mid-Market", recency: 55, freqScore: 1, monetary: 195000000, status: "Pending" },
  { id: "CUST-008", name: "Sinar Mas Land Dev", segment: "Enterprise", recency: 74, freqScore: 5, monetary: 510000000, status: "Pending" },
  { id: "CUST-009", name: "Ruangguru Education Corp", segment: "Mid-Market", recency: 32, freqScore: 3, monetary: 88000000, status: "Pending" },
  { id: "CUST-010", name: "Mitra Adiperkasa Retail", segment: "Enterprise", recency: 5, freqScore: 4, monetary: 420000000, status: "Contacted" },
  { id: "CUST-011", name: "Anteraja Logistics Group", segment: "Mid-Market", recency: 105, freqScore: 2, monetary: 135000000, status: "Pending" },
  { id: "CUST-012", name: "Warung Pintar Solusi", segment: "SMB", recency: 58, freqScore: 2, monetary: 45000000, status: "Pending" },
  { id: "CUST-013", name: "Eiger Adventure Supplies", segment: "SMB", recency: 72, freqScore: 4, monetary: 60000000, status: "Pending" },
  { id: "CUST-014", name: "Kopi Nako Franchise", segment: "SMB", recency: 14, freqScore: 5, monetary: 35000000, status: "Pending" },
  { id: "CUST-015", name: "Hijra Bank Tech", segment: "SMB", recency: 48, freqScore: 3, monetary: 55000000, status: "Pending" },
  { id: "CUST-016", name: "PT Bank Mandiri (Persero) Tbk", segment: "Enterprise", recency: 25, freqScore: 5, monetary: 980000000, status: "Pending" },
  { id: "CUST-017", name: "PT Telkom Indonesia Tbk", segment: "Enterprise", recency: 110, freqScore: 1, monetary: 1200000000, status: "Pending" },
  { id: "CUST-018", name: "Traveloka Indonesia", segment: "Enterprise", recency: 78, freqScore: 4, monetary: 650000000, status: "Pending" },
  { id: "CUST-019", name: "Sicepat Ekspres Indonesia", segment: "Mid-Market", recency: 40, freqScore: 3, monetary: 180000000, status: "Pending" },
  { id: "CUST-020", name: "J&T Express Logistics", segment: "Mid-Market", recency: 95, freqScore: 2, monetary: 220000000, status: "Pending" },
  { id: "CUST-021", name: "BCA Digital (blu)", segment: "Mid-Market", recency: 18, freqScore: 5, monetary: 310000000, status: "Pending" },
  { id: "CUST-022", name: "Kredivo FinTech", segment: "Mid-Market", recency: 35, freqScore: 4, monetary: 270000000, status: "Pending" },
  { id: "CUST-023", name: "Akulaku Finance", segment: "Mid-Market", recency: 82, freqScore: 2, monetary: 240000000, status: "Pending" },
  { id: "CUST-024", name: "Sari Roti (Nippon Indosari)", segment: "Mid-Market", recency: 60, freqScore: 3, monetary: 115000000, status: "Pending" },
  { id: "CUST-025", name: "Gede Rasa Restaurant Group", segment: "SMB", recency: 52, freqScore: 3, monetary: 42000000, status: "Pending" },
  { id: "CUST-026", name: "Fore Coffee Indonesia", segment: "SMB", recency: 20, freqScore: 4, monetary: 78000000, status: "Pending" },
  { id: "CUST-027", name: "Dear Butter Bakery", segment: "SMB", recency: 88, freqScore: 1, monetary: 30000000, status: "Pending" },
  { id: "CUST-028", name: "Kitabisa Crowdfunding", segment: "SMB", recency: 15, freqScore: 5, monetary: 92000000, status: "Pending" },
  { id: "CUST-029", name: "TaniHub Agritech", segment: "SMB", recency: 120, freqScore: 1, monetary: 50000000, status: "Pending" },
  { id: "CUST-030", name: "Sayurbox Delivery", segment: "Mid-Market", recency: 45, freqScore: 4, monetary: 160000000, status: "Pending" }
];

const INITIAL_ACTIONS: ActionLog[] = [
  { id: "ACT-101", customerId: "CUST-003", customerName: "PT GoTo Gojek Tokopedia", timestamp: "2026-07-16 14:32", type: "Strategy Session", notes: "Negotiated new license options for the Q3 pipeline. Risk successfully neutralized.", officer: "Ikhsan (Sense)", impact: 750000000, status: "Contacted" },
  { id: "ACT-102", customerId: "CUST-010", customerName: "Mitra Adiperkasa Retail", timestamp: "2026-07-15 09:12", type: "Direct Phone Call", notes: "Called head of retail operations. Standard verification check. Customer reports stable platform state.", officer: "Ikhsan (Sense)", impact: 420000000, status: "Contacted" },
  { id: "ACT-103", customerId: "CUST-017", customerName: "PT Telkom Indonesia Tbk", timestamp: "2026-07-14 11:45", type: "Executive Meeting", notes: "Discussed unresolved SLA penalties. Client is requesting an updated discount rate to extend their annual agreement.", officer: "Ikhsan (Sense)", impact: 1200000000, status: "In Progress" },
  { id: "ACT-104", customerId: "CUST-004", customerName: "Unilever Indonesia Tbk", timestamp: "2026-07-12 16:20", type: "Email Outreach", notes: "Sent renewal proposal emphasizing customized KPI dashboards. Awaiting response from procurement.", officer: "Anindya (Analyst)", impact: 290000000, status: "Contacted" },
  { id: "ACT-105", customerId: "CUST-011", customerName: "Anteraja Logistics Group", timestamp: "2026-07-11 10:30", type: "Technical Sync", notes: "Resolved platform performance complaints. Client agreed to resume standard operation flow and review the Q3 expansion.", officer: "Taufik (CS)", impact: 135000000, status: "Contacted" },
  { id: "ACT-106", customerId: "CUST-018", customerName: "Traveloka Indonesia", timestamp: "2026-07-10 15:00", type: "Strategy Session", notes: "Presented custom API analytics report showing 15% optimization potential. Traveloka stakeholder confirmed budget allocation.", officer: "Ikhsan (Sense)", impact: 650000000, status: "Contacted" },
  { id: "ACT-107", customerId: "CUST-029", customerName: "TaniHub Agritech", timestamp: "2026-07-09 13:15", type: "Direct Phone Call", notes: "Outreached to discuss severe platform inactivity. Discovered major funding reshuffle. Risk remains high.", officer: "Taufik (CS)", impact: 50000000, status: "In Progress" },
  { id: "ACT-108", customerId: "CUST-001", customerName: "PT Astra Internasional, Tbk", timestamp: "2026-07-08 09:00", type: "Executive Meeting", notes: "High level negotiation with Astra IT Director. Discussed custom security compliance requirements. Proposal drafted.", officer: "Ikhsan (Sense)", impact: 350000000, status: "In Progress" },
  { id: "ACT-109", customerId: "CUST-020", customerName: "J&T Express Logistics", timestamp: "2026-07-07 14:10", type: "Email Outreach", notes: "SLA compliance notice sent. Outlined benefits of upgrading to Worksense enterprise metrics.", officer: "Anindya (Analyst)", impact: 220000000, status: "Contacted" },
  { id: "ACT-110", customerId: "CUST-027", customerName: "Dear Butter Bakery", timestamp: "2026-07-06 11:30", type: "Direct Phone Call", notes: "Spoke with operations lead. Standard billing dispute resolved. Client satisfied with the settlement.", officer: "Taufik (CS)", impact: 30000000, status: "Contacted" },
  { id: "ACT-111", customerId: "CUST-023", customerName: "Akulaku Finance", timestamp: "2026-07-05 16:45", type: "Strategy Session", notes: "Proposed mid-year integration audit. Financial team indicated potential churn risk due to cheaper alternatives.", officer: "Anindya (Analyst)", impact: 240000000, status: "In Progress" },
  { id: "ACT-112", customerId: "CUST-008", customerName: "Sinar Mas Land Dev", timestamp: "2026-07-04 10:15", type: "Technical Sync", notes: "Conducted onboarding webinar for the regional land development analytical dashboard team.", officer: "Taufik (CS)", impact: 510000000, status: "Contacted" },
  { id: "ACT-113", customerId: "CUST-013", customerName: "Eiger Adventure Supplies", timestamp: "2026-07-03 15:40", type: "Email Outreach", notes: "Sent mid-year performance review. Scheduled physical meeting in Bandung for next week.", officer: "Ikhsan (Sense)", impact: 60000000, status: "Contacted" },
  { id: "ACT-114", customerId: "CUST-005", customerName: "Kopi Kenangan Sejahtera", timestamp: "2026-07-02 13:20", type: "Direct Phone Call", notes: "Discussed franchise analytics module. Client requested more custom seat licenses.", officer: "Anindya (Analyst)", impact: 120000000, status: "Contacted" },
  { id: "ACT-115", customerId: "CUST-012", customerName: "Warung Pintar Solusi", timestamp: "2026-07-01 09:30", type: "Technical Sync", notes: "Resolved minor integration bug. Database connection successfully established and verified.", officer: "Taufik (CS)", impact: 45000000, status: "Contacted" }
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

// -----------------------------------------------------------------
// FORCE SEED DATA SERVICE (Inject more data to DB)
// -----------------------------------------------------------------

export async function forceSeedData(): Promise<void> {
  try {
    console.log('Force seeding database with expanded data...');
    const custCol = collection(db, 'customers');
    const actCol = collection(db, 'actions');
    const confRef = doc(db, 'config', 'scoring');

    // Save all customers
    for (const cust of INITIAL_CUSTOMERS) {
      await setDoc(doc(custCol, cust.id), cust);
    }

    // Save all actions
    for (const act of INITIAL_ACTIONS) {
      await setDoc(doc(actCol, act.id), act);
    }

    // Save configuration
    await setDoc(confRef, INITIAL_CONFIG);
  } catch (error) {
    console.error('Error during force data seeding:', error);
    throw error;
  }
}

