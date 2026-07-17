import React from 'react';
import { Info, ArrowUp, ArrowDown } from 'lucide-react';
import { Customer, ActionLog } from '../types';

interface StatsSectionProps {
  customers: Customer[];
  actions: ActionLog[];
  showStats: boolean;
  formatIDRShort: (val: number) => string;
}

export default function StatsSection({
  customers,
  actions,
  showStats,
  formatIDRShort
}: StatsSectionProps) {
  if (!showStats) return null;

  let totalRevenueAtRisk = 0;
  let highRiskCount = 0;
  let pendingActionsCount = 0;
  let estimatedSavedRevenue = 0;
  let estimatedLostRevenue = 0;

  customers.forEach(cust => {
    if (cust.status === "Pending") {
      pendingActionsCount++;
      if (cust.riskCategory === "High") {
        totalRevenueAtRisk += cust.monetary;
        highRiskCount++;
      }
    }
  });

  actions.forEach(act => {
    if (act.status === "Contacted") {
      estimatedSavedRevenue += act.impact;
    } else if (act.status === "Declined") {
      estimatedLostRevenue += act.impact;
    }
  });

  const completionRate = actions.length > 0 
    ? ((actions.length / (actions.length + pendingActionsCount)) * 100).toFixed(1)
    : "0.0";

  const widgetsData = [
    { label: "Total Revenue at Risk", val: formatIDRShort(totalRevenueAtRisk), desc: "High critical accounts", d: "+4.2% MoM", dir: "up" },
    { label: "High Risk Accounts", val: highRiskCount, desc: `out of ${customers.length} total`, d: "-2.1%", dir: "down" },
    { label: "Revenue Mitigated", val: formatIDRShort(estimatedSavedRevenue), desc: `${completionRate}% mitigation rate`, d: "Progress OK", dir: "up" },
    { label: "Revenue Lost (Declined)", val: formatIDRShort(estimatedLostRevenue), desc: "Lost contracts volume", d: "Attention", dir: "down" }
  ];

  return (
    <div className="stats" style={{ marginBottom: '12px' }}>
      {widgetsData.map((s, idx) => (
        <div className="stat" key={idx}>
          <div className="stat-label">
            {s.label} <Info style={{ width: '13px', height: '13px' }} />
          </div>
          <div className="stat-val tnum">{s.val}</div>
          <div className="stat-foot">
            {s.desc} 
            <span className={`delta ${s.dir === 'down' ? 'down' : ''}`}>
              {s.dir === 'down' ? <ArrowDown /> : <ArrowUp />} {s.d}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
