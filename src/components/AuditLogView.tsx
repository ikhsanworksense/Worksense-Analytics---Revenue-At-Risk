import React from 'react';
import { Download, MessageSquare } from 'lucide-react';
import { Customer, ActionLog } from '../types';
import StatsSection from './StatsSection';

interface AuditLogViewProps {
  actions: ActionLog[];
  formatIDR: (val: number) => string;
  onExportCSV: () => void;
  customers: Customer[];
  showStats: boolean;
  formatIDRShort: (val: number) => string;
}

export default function AuditLogView({
  actions,
  formatIDR,
  onExportCSV,
  customers,
  showStats,
  formatIDRShort
}: AuditLogViewProps) {
  return (
    <div className="view active" id="v-actions">
      {showStats && (
        <StatsSection 
          customers={customers}
          actions={actions}
          showStats={showStats}
          formatIDRShort={formatIDRShort}
        />
      )}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title">Historical Retention Audit Log (FR-05)</div>
            <div className="card-sub">Append-only transactional trail containing communications, feedback notes, and calculated financial impact</div>
          </div>
          <button className="btn" onClick={onExportCSV}>
            <Download /> Export Historical Audit Trail
          </button>
        </div>
        <div className="tablewrap" style={{ border: 'none', borderTop: '1px solid var(--line)' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Timestamp</th>
                <th>Customer Account</th>
                <th>Outreach Channel</th>
                <th>Retention Notes & Action Details</th>
                <th>Agent Assigned</th>
                <th className="num">Mitigated Revenue</th>
              </tr>
            </thead>
            <tbody>
              {actions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>
                    No recorded client engagement actions found in the system log.
                  </td>
                </tr>
              ) : (
                actions.map(act => {
                  const isDeclined = act.status === "Declined";
                  const statusPill = isDeclined 
                    ? <span className="pill red" style={{ fontSize: '0.72rem' }}>Declined</span>
                    : act.status === "Contacted" 
                      ? <span className="pill green" style={{ fontSize: '0.72rem' }}>Mitigated</span>
                      : <span className="pill amber" style={{ fontSize: '0.72rem' }}>In Progress</span>;

                  const impactPrefix = isDeclined ? "-" : "+";
                  const impactColor = isDeclined ? "var(--red)" : "var(--green)";

                  return (
                    <tr key={act.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.76rem' }} className="muted">
                        {act.timestamp}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{act.customerName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--ink-3)' }}>{act.customerId}</div>
                      </td>
                      <td>
                        <span className="pill blue" style={{ fontSize: '0.72rem' }}>
                          <MessageSquare style={{ width: '11px', height: '11px', marginRight: '4px' }} /> {act.type}
                        </span>
                        <div style={{ marginTop: '4px' }}>{statusPill}</div>
                      </td>
                      <td style={{ fontStyle: 'italic', maxWidth: '320px', fontSize: '0.8rem', lineHeight: '1.3' }} title={act.notes}>
                        "{act.notes}"
                      </td>
                      <td className="muted">{act.officer}</td>
                      <td className="num tnum" style={{ fontWeight: 700, color: impactColor }}>
                        {impactPrefix} {formatIDR(act.impact)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
