import React from 'react';
import { Menu, Share2, Bell, RotateCw } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setSidebarOpen: (isOpen: boolean) => void;
  onRecalculate: () => void;
  triggerToast: (msg: string) => void;
  onExport: () => void;
}

const VIEW_TITLES: Record<string, string> = {
  dash: "Executive Dashboard",
  priority: "Priority Action List (FR-03)",
  actions: "Retention Audit Log (FR-05)",
  control: "Control Panel & Engine (FR-02)",
  admin: "Governance & Security Systems",
  help: "Help Center & Documentation",
  feedback: "System Feedback & Recommendations"
};

export default function Header({
  currentView,
  setSidebarOpen,
  onRecalculate,
  triggerToast,
  onExport
}: HeaderProps) {
  const title = VIEW_TITLES[currentView] || "Executive Dashboard";

  return (
    <div className="head">
      <button 
        className="menu-btn icon-btn" 
        id="menuBtn"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu />
      </button>
      <div className="page-title" id="ptitle">{title}</div>
      <div className="head-actions">
        <button className="icon-btn" onClick={onExport}>
          <Share2 />
        </button>
        <button className="icon-btn" onClick={() => triggerToast("Connection Active: Production Staging Sync stable.")}>
          <Bell />
        </button>
        <div className="avatars">
          <div className="av">IS</div>
          <div className="av more">+3</div>
        </div>
        <button className="btn" onClick={onRecalculate}>
          <RotateCw /> Recalculate Scores
        </button>
      </div>
    </div>
  );
}
