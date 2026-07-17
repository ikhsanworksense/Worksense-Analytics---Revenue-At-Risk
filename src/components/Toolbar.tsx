import React, { useState, useRef, useEffect } from 'react';
import { Table, ChevronDown, SlidersHorizontal, Upload, Plus, LayoutGrid, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToolbarProps {
  currentView: string;
  segmentFilter: string;
  setSegmentFilter: (seg: string) => void;
  riskLevelFilter: string;
  setRiskLevelFilter: (risk: string) => void;
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  onBulkEngage: () => void;
  onExportCSV: () => void;
  onAddCustomerClick: () => void;
  triggerToast: (msg: string) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
}

const ACTION_BUTTON_TEXTS: Record<string, string> = {
  dash: "Add Custom KPI",
  priority: "Staged Bulk Segment",
  actions: "Export Data File",
  control: "Add Client Account",
  admin: "Review Audit Logs",
  help: "Kirim Email Dukungan",
  feedback: "Kirim Feedback Baru"
};

export default function Toolbar({
  currentView,
  segmentFilter,
  setSegmentFilter,
  riskLevelFilter,
  setRiskLevelFilter,
  showStats,
  setShowStats,
  onBulkEngage,
  onExportCSV,
  onAddCustomerClick,
  triggerToast,
  viewMode,
  setViewMode
}: ToolbarProps) {
  const addLabel = ACTION_BUTTON_TEXTS[currentView] || "Add Customer";

  const [isSegmentOpen, setIsSegmentOpen] = useState(false);
  const [isRiskOpen, setIsRiskOpen] = useState(false);

  const segmentRef = useRef<HTMLDivElement>(null);
  const riskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (segmentRef.current && !segmentRef.current.contains(event.target as Node)) {
        setIsSegmentOpen(false);
      }
      if (riskRef.current && !riskRef.current.contains(event.target as Node)) {
        setIsRiskOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddClick = () => {
    if (currentView === 'priority' || currentView === 'control') {
      onAddCustomerClick();
    } else if (currentView === 'help') {
      window.open("mailto:iamikhsank@gmail.com", "_blank");
    } else if (currentView === 'feedback') {
      triggerToast("Silakan isi formulir di layar untuk menyimpan masukan Anda ke database.");
    } else {
      triggerToast(`Feature "${addLabel}" is simulated inside sandbox.`);
    }
  };

  return (
    <div className="toolbar">
      <button className="btn" onClick={() => {
        const nextMode = viewMode === 'list' ? 'grid' : 'list';
        setViewMode(nextMode);
        triggerToast(`Switched workspace to ${nextMode === 'grid' ? 'Grid Cards' : 'Table List'} view.`);
      }}>
        {viewMode === 'list' ? (
          <>
            <Table /> Table View <ChevronDown />
          </>
        ) : (
          <>
            <LayoutGrid style={{ width: '14px', height: '14px' }} /> Grid View <ChevronDown />
          </>
        )}
      </button>
      
      {/* Segment Dropdown select */}
      <div ref={segmentRef} style={{ position: 'relative' }}>
        <select 
          id="segmentFilter" 
          style={{ display: 'none' }}
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
        >
          <option value="ALL">All Segments</option>
          <option value="Enterprise">Enterprise Only</option>
          <option value="Mid-Market">Mid-Market Only</option>
          <option value="SMB">SMB Only</option>
        </select>

        <button 
          type="button"
          onClick={() => {
            setIsSegmentOpen(!isSegmentOpen);
            setIsRiskOpen(false);
          }}
          className={`btn select-trigger ${isSegmentOpen ? 'active-dropdown' : ''}`}
          style={{ 
            paddingRight: '32px',
            position: 'relative',
            border: isSegmentOpen ? '1px solid var(--orange)' : '1px solid var(--line)',
            boxShadow: isSegmentOpen ? '0 0 0 3px oklch(52% 0.22 262 / 0.15)' : 'none',
            transition: 'all 0.2s ease',
            minWidth: '130px',
            justifyContent: 'space-between'
          }}
        >
          <span>
            {segmentFilter === 'ALL' && 'All Segments'}
            {segmentFilter === 'Enterprise' && 'Enterprise Only'}
            {segmentFilter === 'Mid-Market' && 'Mid-Market Only'}
            {segmentFilter === 'SMB' && 'SMB Only'}
          </span>
          <ChevronDown 
            style={{ 
              position: 'absolute', 
              right: '10px', 
              top: '10px', 
              width: '14px', 
              height: '14px', 
              pointerEvents: 'none', 
              color: isSegmentOpen ? 'var(--orange)' : 'var(--ink-3)',
              transform: isSegmentOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease, color 0.2s ease'
            }} 
          />
        </button>

        <AnimatePresence>
          {isSegmentOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                zIndex: 50,
                minWidth: '180px',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-lg)',
                boxShadow: 'var(--shadow-pop)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              {[
                { value: 'ALL', label: 'All Segments' },
                { value: 'Enterprise', label: 'Enterprise Only' },
                { value: 'Mid-Market', label: 'Mid-Market Only' },
                { value: 'SMB', label: 'SMB Only' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSegmentFilter(opt.value);
                    setIsSegmentOpen(false);
                    triggerToast(`Segment filter changed to: ${opt.label}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: segmentFilter === opt.value ? '600' : '500',
                    color: segmentFilter === opt.value ? 'var(--orange-deep)' : 'var(--ink-2)',
                    background: segmentFilter === opt.value ? 'var(--orange-soft)' : 'transparent',
                    textAlign: 'left',
                    transition: 'all 0.12s ease'
                  }}
                  className="dropdown-item-btn"
                >
                  <span>{opt.label}</span>
                  {segmentFilter === opt.value && (
                    <Check style={{ width: '13px', height: '13px', color: 'var(--orange)' }} />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Risk Level dropdown select */}
      <div ref={riskRef} style={{ position: 'relative' }}>
        <select 
          id="riskLevelFilter" 
          style={{ display: 'none' }}
          value={riskLevelFilter}
          onChange={(e) => setRiskLevelFilter(e.target.value)}
        >
          <option value="ALL">All Risk Levels</option>
          <option value="High">High Risk Only</option>
          <option value="Medium">Medium Risk Only</option>
          <option value="Low">Low Risk Only</option>
        </select>

        <button 
          type="button"
          onClick={() => {
            setIsRiskOpen(!isRiskOpen);
            setIsSegmentOpen(false);
          }}
          className={`btn select-trigger ${isRiskOpen ? 'active-dropdown' : ''}`}
          style={{ 
            paddingRight: '32px',
            position: 'relative',
            border: isRiskOpen ? '1px solid var(--orange)' : '1px solid var(--line)',
            boxShadow: isRiskOpen ? '0 0 0 3px oklch(52% 0.22 262 / 0.15)' : 'none',
            transition: 'all 0.2s ease',
            minWidth: '140px',
            justifyContent: 'space-between'
          }}
        >
          <span>
            {riskLevelFilter === 'ALL' && 'All Risk Levels'}
            {riskLevelFilter === 'High' && 'High Risk Only'}
            {riskLevelFilter === 'Medium' && 'Medium Risk Only'}
            {riskLevelFilter === 'Low' && 'Low Risk Only'}
          </span>
          <ChevronDown 
            style={{ 
              position: 'absolute', 
              right: '10px', 
              top: '10px', 
              width: '14px', 
              height: '14px', 
              pointerEvents: 'none', 
              color: isRiskOpen ? 'var(--orange)' : 'var(--ink-3)',
              transform: isRiskOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease, color 0.2s ease'
            }} 
          />
        </button>

        <AnimatePresence>
          {isRiskOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                zIndex: 50,
                minWidth: '180px',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-lg)',
                boxShadow: 'var(--shadow-pop)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              {[
                { value: 'ALL', label: 'All Risk Levels' },
                { value: 'High', label: 'High Risk Only' },
                { value: 'Medium', label: 'Medium Risk Only' },
                { value: 'Low', label: 'Low Risk Only' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setRiskLevelFilter(opt.value);
                    setIsRiskOpen(false);
                    triggerToast(`Risk Level filter changed to: ${opt.label}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: riskLevelFilter === opt.value ? '600' : '500',
                    color: riskLevelFilter === opt.value ? 'var(--orange-deep)' : 'var(--ink-2)',
                    background: riskLevelFilter === opt.value ? 'var(--orange-soft)' : 'transparent',
                    textAlign: 'left',
                    transition: 'all 0.12s ease'
                  }}
                  className="dropdown-item-btn"
                >
                  <span>{opt.label}</span>
                  {riskLevelFilter === opt.value && (
                    <Check style={{ width: '13px', height: '13px', color: 'var(--orange)' }} />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="toggle" id="statToggle" onClick={() => setShowStats(!showStats)}>
        Show Statistics <span className={`switch ${showStats ? '' : 'off'}`} id="statSwitch"></span>
      </div>
      
      <div className="tb-right">
        <button className="btn" onClick={onBulkEngage}>
          <SlidersHorizontal /> Bulk Engage
        </button>
        <button className="btn" onClick={onExportCSV}>
          <Upload /> Export CSV
        </button>
        <button className="btn dark" onClick={handleAddClick}>
          <Plus /> <span id="addLabel">{addLabel}</span>
        </button>
      </div>
    </div>
  );
}
