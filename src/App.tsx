import React, { useState, useMemo, useEffect } from 'react';
import { Customer, ActionLog, ScoringConfig } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import StatsSection from './components/StatsSection';
import DashboardView from './components/DashboardView';
import PriorityView from './components/PriorityView';
import AuditLogView from './components/AuditLogView';
import ControlPanelView from './components/ControlPanelView';
import GovernanceView from './components/GovernanceView';
import HelpCenterView from './components/HelpCenterView';
import SystemFeedbackView from './components/SystemFeedbackView';
import OutreachModal from './components/OutreachModal';
import AddCustomerModal from './components/AddCustomerModal';
import Toast from './components/Toast';
import { 
  getCustomers, 
  saveCustomer, 
  deleteCustomer, 
  getActions, 
  saveAction, 
  deleteAction, 
  getConfig, 
  saveConfig 
} from './lib/firebaseService';

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

export default function App() {
  const [currentView, setCurrentView] = useState<string>("dash");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem("worksense_customers");
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch (e) {
      return INITIAL_CUSTOMERS;
    }
  });

  const [actions, setActions] = useState<ActionLog[]>(() => {
    try {
      const saved = localStorage.getItem("worksense_actions");
      return saved ? JSON.parse(saved) : INITIAL_ACTIONS;
    } catch (e) {
      return INITIAL_ACTIONS;
    }
  });

  const [config, setConfig] = useState<ScoringConfig>(() => {
    try {
      const saved = localStorage.getItem("worksense_config");
      return saved ? JSON.parse(saved) : INITIAL_CONFIG;
    } catch (e) {
      return INITIAL_CONFIG;
    }
  });

  // Load data from Firestore on mount to sync with our live database
  useEffect(() => {
    async function loadFirestoreData() {
      try {
        const firestoreCustomers = await getCustomers();
        setCustomers(firestoreCustomers);
      } catch (err) {
        console.error("Failed to load customers from Firestore, using local:", err);
      }

      try {
        const firestoreActions = await getActions();
        setActions(firestoreActions);
      } catch (err) {
        console.error("Failed to load actions from Firestore, using local:", err);
      }

      try {
        const firestoreConfig = await getConfig();
        setConfig(firestoreConfig);
      } catch (err) {
        console.error("Failed to load config from Firestore, using local:", err);
      }
    }
    loadFirestoreData();
  }, []);

  // Automatically save state changes to LocalStorage database simulator
  useEffect(() => {
    try {
      localStorage.setItem("worksense_customers", JSON.stringify(customers));
    } catch (e) {
      console.error("Failed to save customers to localStorage:", e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem("worksense_actions", JSON.stringify(actions));
    } catch (e) {
      console.error("Failed to save actions to localStorage:", e);
    }
  }, [actions]);

  useEffect(() => {
    try {
      localStorage.setItem("worksense_config", JSON.stringify(config));
    } catch (e) {
      console.error("Failed to save config to localStorage:", e);
    }
  }, [config]);
  
  const [selectedIndices, setSelectedIndices] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [segmentFilter, setSegmentFilter] = useState<string>("ALL");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(true);
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: "", show: false });

  // Modal open states
  const [isOutreachOpen, setIsOutreachOpen] = useState<boolean>(false);
  const [outreachCustId, setOutreachCustId] = useState<string>("");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState<boolean>(false);

  const triggerToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Helper formatting IDR currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const formatIDRShort = (amount: number) => {
    if (amount >= 1e9) return 'Rp ' + (amount / 1e9).toFixed(2) + 'B';
    if (amount >= 1e6) return 'Rp ' + (amount / 1e6).toFixed(0) + 'M';
    return formatIDR(amount);
  };

  // 1. Live Recalculate Risk Score & Risk Category for all active customers
  const computedCustomers = useMemo(() => {
    return customers.map(cust => {
      let recencyScore = 1;
      if (cust.recency > config.recencyHigh) {
        recencyScore = 5;
      } else if (cust.recency > config.recencyMed) {
        recencyScore = 3;
      }

      const freqFactor = (5 - cust.freqScore) * config.freqMultiplier * 6;
      const baseScore = (recencyScore * 12) + freqFactor;
      const finalScore = Math.min(Math.round(baseScore), 100);

      let category: "High" | "Medium" | "Low" = "Low";
      if (finalScore >= config.highScoreThreshold) {
        category = "High";
      } else if (finalScore >= 45) {
        category = "Medium";
      }

      return {
        ...cust,
        riskScore: finalScore,
        riskCategory: category
      };
    });
  }, [customers, config]);

  const highRiskCount = useMemo(() => {
    return computedCustomers.filter(c => c.status === "Pending" && c.riskCategory === "High").length;
  }, [computedCustomers]);

  // Recalculate event button click handler
  const handleRecalculate = () => {
    triggerToast("Recalculating scores across all active portfolios!");
  };

  // Keybindings listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('sideSearch');
        if (searchInput) {
          searchInput.focus();
          triggerToast("Search field active. Enter Name or ID.");
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Row selection handler
  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIndices(newSelected);
  };

  const toggleCheckAllVisible = (visibleIds: string[]) => {
    const allSelected = visibleIds.every(id => selectedIndices.has(id));
    const newSelected = new Set(selectedIndices);
    if (allSelected) {
      visibleIds.forEach(id => newSelected.delete(id));
    } else {
      visibleIds.forEach(id => newSelected.add(id));
    }
    setSelectedIndices(newSelected);
  };

  const clearSelection = () => {
    setSelectedIndices(new Set());
  };

  // Open modal for a specific customer or for bulk mode
  const openOutreachModal = (id: string) => {
    if (id === "NEW_MANUAL") {
      setIsAddCustomerOpen(true);
    } else {
      setOutreachCustId(id);
      setIsOutreachOpen(true);
    }
  };

  const handleOutreachSubmit = async (data: {
    customerId: string;
    channel: string;
    notes: string;
    status: string;
  }) => {
    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (data.customerId) {
      // Single Outreach Logger
      const targetCust = computedCustomers.find(c => c.id === data.customerId);
      if (!targetCust) return;

      const actId = `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newAction: ActionLog = {
        id: actId,
        customerId: targetCust.id,
        customerName: targetCust.name,
        timestamp: time,
        type: data.channel,
        notes: data.notes,
        officer: "Ikhsan (Sense)",
        impact: targetCust.monetary,
        status: data.status
      };

      try {
        const updatedCust: Customer = { ...targetCust, status: data.status };
        // Delete ephemeral or calculated fields if they exist in state before saving to match schema
        const custToSave = { ...updatedCust };
        delete custToSave.riskScore;
        delete custToSave.riskCategory;

        await saveAction(newAction);
        await saveCustomer(custToSave);

        setActions(prev => [newAction, ...prev]);
        setCustomers(prev => prev.map(c => c.id === targetCust.id ? updatedCust : c));
        triggerToast(`Engagement logged to Firestore for ${targetCust.name}!`);
      } catch (err) {
        console.error("Failed to save to Firestore:", err);
        triggerToast("Failed to save to live Firestore. Saved locally.");
      }
    } else {
      // Bulk Outreach Logger
      const checkedIds = Array.from(selectedIndices) as string[];
      let counter = 0;

      const newActions: ActionLog[] = [];
      const updatedCustomerIds: Record<string, string> = {};

      for (const id of checkedIds) {
        const targetCust = computedCustomers.find(c => c.id === id);
        if (targetCust && targetCust.status === "Pending") {
          counter++;
          const actId = `ACT-BLK-${Date.now()}-${counter}`;
          const newAction: ActionLog = {
            id: actId,
            customerId: targetCust.id,
            customerName: targetCust.name,
            timestamp: time,
            type: data.channel,
            notes: `[Bulk Action] ${data.notes}`,
            officer: "Ikhsan (Sense)",
            impact: targetCust.monetary,
            status: data.status
          };

          const updatedCust: Customer = { ...targetCust, status: data.status };
          const custToSave = { ...updatedCust };
          delete custToSave.riskScore;
          delete custToSave.riskCategory;

          try {
            await saveAction(newAction);
            await saveCustomer(custToSave);
            newActions.push(newAction);
            updatedCustomerIds[targetCust.id] = data.status;
          } catch (err) {
            console.error(`Failed to save bulk item for ${targetCust.name}:`, err);
          }
        }
      }

      if (newActions.length > 0) {
        setActions(prev => [...newActions, ...prev]);
        setCustomers(prev => prev.map(c => updatedCustomerIds[c.id] ? { ...c, status: updatedCustomerIds[c.id] } : c));
      }

      setSelectedIndices(new Set());
      triggerToast(`Successfully registered bulk actions on ${counter} profiles!`);
    }

    setIsOutreachOpen(false);
  };

  const handleBulkMitigate = async () => {
    const checkedIds = Array.from(selectedIndices) as string[];
    let counter = 0;
    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newActions: ActionLog[] = [];
    const updatedCustomerIds: Record<string, string> = {};

    for (const id of checkedIds) {
      const targetCust = computedCustomers.find(c => c.id === id);
      if (targetCust && targetCust.status === "Pending") {
        counter++;
        const actId = `ACT-BLK-MIT-${Date.now()}-${counter}`;
        const newAction: ActionLog = {
          id: actId,
          customerId: targetCust.id,
          customerName: targetCust.name,
          timestamp: time,
          type: "Bulk Outreach Action",
          notes: "Automated bulk risk mitigation action logged directly through priority workspace selection console.",
          officer: "Ikhsan (Sense)",
          impact: targetCust.monetary,
          status: "Contacted"
        };

        const updatedCust: Customer = { ...targetCust, status: "Contacted" };
        const custToSave = { ...updatedCust };
        delete custToSave.riskScore;
        delete custToSave.riskCategory;

        try {
          await saveAction(newAction);
          await saveCustomer(custToSave);
          newActions.push(newAction);
          updatedCustomerIds[targetCust.id] = "Contacted";
        } catch (err) {
          console.error(`Failed to bulk mitigate for ${targetCust.name}:`, err);
        }
      }
    }

    if (newActions.length > 0) {
      setActions(prev => [...newActions, ...prev]);
      setCustomers(prev => prev.map(c => updatedCustomerIds[c.id] ? { ...c, status: updatedCustomerIds[c.id] } : c));
    }

    setSelectedIndices(new Set());
    triggerToast(`Mitigated risk exposure for ${counter} clients to Firestore!`);
  };

  const handleBulkDelete = async () => {
    const checkedIds = Array.from(selectedIndices) as string[];
    for (const id of checkedIds) {
      try {
        await deleteCustomer(id);
      } catch (err) {
        console.error(`Failed to delete customer ${id} from Firestore:`, err);
      }
    }
    setCustomers(prev => prev.filter(c => !selectedIndices.has(c.id)));
    setSelectedIndices(new Set());
    triggerToast(`Excluded ${checkedIds.length} entries from workspace rosters & Firestore.`);
  };

  const handleAddCustomerSubmit = async (data: {
    name: string;
    segment: string;
    recency: number;
    freqScore: number;
    monetary: number;
  }) => {
    const customId = `CUST-${Date.now().toString().slice(-3)}`;
    const newCust: Customer = {
      id: customId,
      name: data.name,
      segment: data.segment,
      recency: data.recency,
      freqScore: data.freqScore,
      monetary: data.monetary,
      status: "Pending"
    };

    try {
      await saveCustomer(newCust);
      setCustomers(prev => [...prev, newCust]);
      triggerToast(`Successfully staged and saved profile for ${data.name} to Firestore!`);
    } catch (err) {
      console.error("Failed to add customer to Firestore:", err);
      setCustomers(prev => [...prev, newCust]);
      triggerToast(`Staged profile for ${data.name} locally!`);
    }
    setIsAddCustomerOpen(false);
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    let content = "data:text/csv;charset=utf-8,";
    content += "ActionID,CustomerID,CustomerName,Timestamp,ActionChannel,Notes,Operator,ValueSaved,Status\n";

    actions.forEach(act => {
      const cleanNotes = act.notes.replace(/"/g, '""');
      content += `"${act.id}","${act.customerId}","${act.customerName}","${act.timestamp}","${act.type}","${cleanNotes}","${act.officer}",${act.impact},"${act.status}"\n`;
    });

    const encoded = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `Worksense_Retention_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast("Audit Log CSV successfully exported.");
  };

  const handleSaveConfig = async (updated: ScoringConfig) => {
    try {
      await saveConfig(updated);
      setConfig(updated);
      triggerToast("Global scoring rules updated successfully in Firestore!");
    } catch (err) {
      console.error("Failed to save scoring config to Firestore:", err);
      setConfig(updated);
      triggerToast("Scoring rules updated locally.");
    }
  };

  return (
    <div className="frame">
      <div className="app">
        {/* Left Frozen pane Sidebar */}
        <Sidebar 
          currentView={currentView}
          setCurrentView={setCurrentView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          highRiskCount={highRiskCount}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          triggerToast={triggerToast}
        />

        {/* Right workspace panels */}
        <div className="main">
          {/* Main Top Header */}
          <Header 
            currentView={currentView}
            setSidebarOpen={setIsSidebarOpen}
            onRecalculate={handleRecalculate}
            triggerToast={triggerToast}
            onExport={handleExportCSV}
          />

          {/* Dynamic Action Sub-Toolbar */}
          {currentView !== 'help' && currentView !== 'feedback' && (
            <Toolbar 
              currentView={currentView}
              segmentFilter={segmentFilter}
              setSegmentFilter={setSegmentFilter}
              riskLevelFilter={riskLevelFilter}
              setRiskLevelFilter={setRiskLevelFilter}
              showStats={showStats}
              setShowStats={setShowStats}
              onBulkEngage={() => openOutreachModal("")}
              onExportCSV={handleExportCSV}
              onAddCustomerClick={() => setIsAddCustomerOpen(true)}
              triggerToast={triggerToast}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          )}

          {/* Render Subpage Views */}
          {currentView === 'dash' && (
            <DashboardView 
              customers={computedCustomers}
              actions={actions}
              formatIDR={formatIDR}
              formatIDRShort={formatIDRShort}
              openOutreachModal={openOutreachModal}
              triggerToast={triggerToast}
              showStats={showStats}
            />
          )}

          {currentView === 'priority' && (
            <PriorityView 
              customers={computedCustomers}
              searchQuery={searchQuery}
              segmentFilter={segmentFilter}
              riskLevelFilter={riskLevelFilter}
              selectedIndices={selectedIndices}
              toggleRowSelection={toggleRowSelection}
              toggleCheckAllVisible={toggleCheckAllVisible}
              clearSelection={clearSelection}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              openOutreachModal={openOutreachModal}
              onBulkOutreach={() => openOutreachModal("")}
              onBulkMitigate={handleBulkMitigate}
              onBulkDelete={handleBulkDelete}
              formatIDR={formatIDR}
              actions={actions}
              showStats={showStats}
              formatIDRShort={formatIDRShort}
              viewMode={viewMode}
            />
          )}

          {currentView === 'actions' && (
            <AuditLogView 
              actions={actions}
              formatIDR={formatIDR}
              onExportCSV={handleExportCSV}
              customers={computedCustomers}
              showStats={showStats}
              formatIDRShort={formatIDRShort}
            />
          )}

          {currentView === 'control' && (
            <ControlPanelView 
              config={config}
              onSaveConfig={handleSaveConfig}
              customers={computedCustomers}
              actions={actions}
              showStats={showStats}
              formatIDRShort={formatIDRShort}
            />
          )}

          {currentView === 'admin' && (
            <GovernanceView 
              customers={computedCustomers}
              actions={actions}
              showStats={showStats}
              formatIDRShort={formatIDRShort}
            />
          )}

          {currentView === 'help' && (
            <HelpCenterView 
              customers={computedCustomers}
              actions={actions}
              showStats={showStats}
              formatIDRShort={formatIDRShort}
            />
          )}

          {currentView === 'feedback' && (
            <SystemFeedbackView 
              customers={computedCustomers}
              actions={actions}
              showStats={showStats}
              formatIDRShort={formatIDRShort}
              triggerToast={triggerToast}
            />
          )}
        </div>
      </div>

      {/* Global Modals overlay containers */}
      <OutreachModal 
        isOpen={isOutreachOpen}
        customerId={outreachCustId}
        customers={computedCustomers}
        onClose={() => setIsOutreachOpen(false)}
        onSubmit={handleOutreachSubmit}
        formatIDR={formatIDR}
      />

      <AddCustomerModal 
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSubmit={handleAddCustomerSubmit}
      />

      {/* Pop-up system toast box */}
      <Toast message={toast.message} show={toast.show} />
    </div>
  );
}
