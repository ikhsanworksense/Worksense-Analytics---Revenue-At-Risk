import React from 'react';
import { 
  ChevronsLeft, 
  Search, 
  LayoutDashboard, 
  TriangleAlert, 
  ClipboardList, 
  Sliders, 
  Shield, 
  LifeBuoy, 
  MessageCircle 
} from 'lucide-react';
import { Customer } from '../types';
import { WORKSENSE_LOGO } from '../logo';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  highRiskCount: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  triggerToast: (msg: string) => void;
}

export default function Sidebar({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  highRiskCount,
  isOpen,
  setIsOpen,
  triggerToast
}: SidebarProps) {
  return (
    <aside id="side" className={`side ${isOpen ? 'open' : ''}`}>
      {/* Frozen Header Section */}
      <div className="side-header">
        <div className="org">
          <div className="logo" style={{ 
            background: 'transparent', 
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            overflow: 'hidden'
          }}>
            <img 
              src={WORKSENSE_LOGO} 
              alt="Worksense Logo" 
              referrerPolicy="no-referrer"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain'
              }} 
            />
          </div>
          <div>
            <div className="name">Worksense Analytics</div>
            <div className="plan">Enterprise Suite</div>
          </div>
          <span className="collapse" id="closeSide" onClick={() => setIsOpen(false)}>
            <ChevronsLeft />
          </span>
        </div>
        
        {/* Live Search Box filtering Priority Table with Cmd+K support */}
        <div className="search">
          <Search />
          <input 
            type="text" 
            id="sideSearch" 
            placeholder="Search account name/ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="kbd">⌘ K</span>
        </div>
      </div>

      {/* Scrollable Navigation Items */}
      <div className="side-scrollable">
        <div className="sec">Main Menu</div>
        <button 
          className={`nav ${currentView === 'dash' ? 'active' : ''}`}
          onClick={() => { setCurrentView('dash'); setIsOpen(false); }}
        >
          <LayoutDashboard /> Executive Dashboard
        </button>
        <button 
          className={`nav ${currentView === 'priority' ? 'active' : ''}`}
          onClick={() => { setCurrentView('priority'); setIsOpen(false); }}
        >
          <TriangleAlert /> Priority Action List 
          <span 
            className="count orange" 
            id="sidebarBadge"
            style={{ display: highRiskCount > 0 ? 'inline-block' : 'none' }}
          >
            {highRiskCount}
          </span>
        </button>
        <button 
          className={`nav ${currentView === 'actions' ? 'active' : ''}`}
          onClick={() => { setCurrentView('actions'); setIsOpen(false); }}
        >
          <ClipboardList /> Retention Audit Log
        </button>
        <button 
          className={`nav ${currentView === 'control' ? 'active' : ''}`}
          onClick={() => { setCurrentView('control'); setIsOpen(false); }}
        >
          <Sliders /> Control Panel & RFM
        </button>

        <div className="sec">Governance</div>
        <button 
          className={`nav ${currentView === 'admin' ? 'active' : ''}`}
          onClick={() => { setCurrentView('admin'); setIsOpen(false); }}
        >
          <Shield /> Security & Systems
        </button>
      </div>

      {/* Frozen Footer Section */}
      <div className="side-footer">
        <button 
          className={`foot-link ${currentView === 'help' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('help'); setIsOpen(false); triggerToast("Membuka Pusat Bantuan & Informasi Worksense..."); }}
          style={{ 
            background: currentView === 'help' ? 'rgba(235, 94, 40, 0.1)' : 'transparent', 
            color: currentView === 'help' ? 'var(--orange-deep)' : 'var(--ink-2)',
            fontWeight: currentView === 'help' ? 600 : 500
          }}
        >
          <LifeBuoy /> Help center
        </button>
        <button 
          className={`foot-link ${currentView === 'feedback' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('feedback'); setIsOpen(false); triggerToast("Membuka Portal Rekomendasi & Feedback Terintegrasi..."); }}
          style={{ 
            background: currentView === 'feedback' ? 'rgba(235, 94, 40, 0.1)' : 'transparent', 
            color: currentView === 'feedback' ? 'var(--orange-deep)' : 'var(--ink-2)',
            fontWeight: currentView === 'feedback' ? 600 : 500
          }}
        >
          <MessageCircle /> System Feedback
        </button>
      </div>
    </aside>
  );
}
