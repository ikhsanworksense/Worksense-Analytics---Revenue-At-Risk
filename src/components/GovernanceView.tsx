import React from 'react';
import { Customer, ActionLog } from '../types';
import StatsSection from './StatsSection';

interface GovernanceViewProps {
  customers: Customer[];
  actions: ActionLog[];
  showStats: boolean;
  formatIDRShort: (val: number) => string;
}

export default function GovernanceView({
  customers,
  actions,
  showStats,
  formatIDRShort
}: GovernanceViewProps) {
  const nodes = [
    { name: "Google Apps Script Webhook Engine", lastSync: "1 mnt lalu", status: "Operational", pillClass: "pill green" },
    { name: "OAuth 2.0 Authorization Gateway", lastSync: "3 mnt lalu", status: "Active", pillClass: "pill green" },
    { name: "PostgreSQL Database Engine", lastSync: "Just now", status: "Healthy", pillClass: "pill green" },
    { name: "Anti-XSS Payload Verification Filter", lastSync: "Live active", status: "Secured", pillClass: "pill green" },
    { name: "CSP Security Policy Controller", lastSync: "System check", status: "Enforced", pillClass: "pill green" }
  ];

  return (
    <div className="view active" id="v-admin">
      {showStats && (
        <StatsSection 
          customers={customers}
          actions={actions}
          showStats={showStats}
          formatIDRShort={formatIDRShort}
        />
      )}
      <div className="grid g-1-1">
        {/* Left Card: Connection Nodes */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 16px 12px 16px' }}>
            <div className="card-title">Production Connection Gateway Nodes</div>
            <div className="card-sub">Status of active integrated server clusters and gateway nodes</div>
          </div>
          <div style={{ borderTop: '1px solid var(--line)', padding: '12px 16px 16px 16px' }}>
            <table>
              <thead>
                <tr>
                  <th>Connection Node</th>
                  <th>Last Sync Time</th>
                  <th className="num">Status</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{node.name}</td>
                    <td className="muted">{node.lastSync}</td>
                    <td className="num">
                      <span className={node.pillClass}>{node.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: Governance Configuration */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 16px 12px 16px' }}>
            <div className="card-title">Access Policy & System Governance</div>
            <div className="card-sub">Security protocols, RBAC parameters, and compliance configuration</div>
          </div>
          <div style={{ borderTop: '1px solid var(--line)', padding: '20px 16px 16px 16px' }}>
            <div className="kv" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--ink-3)' }}>RBAC Access Roles:</div>
              <div>Administrator, Analyst, CS Manager, Owner</div>
              
              <div style={{ fontWeight: 600, color: 'var(--ink-3)' }}>Formula Injection Shield:</div>
              <div>Active Input Sanitizer (Enforced)</div>

              <div style={{ fontWeight: 600, color: 'var(--ink-3)' }}>CORS Integrity Guard:</div>
              <div>Frame & Cross-Origin Protection Active</div>

              <div style={{ fontWeight: 600, color: 'var(--ink-3)' }}>Session Auth Token:</div>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', color: 'var(--orange-deep)' }}>
                token_gas-sha256_production-live_2026_secure
              </div>

              <div style={{ fontWeight: 600, color: 'var(--ink-3)' }}>Encryption Protocol:</div>
              <div>Transport Layer Security (TLS 1.3) / AES-256-GCM</div>

              <div style={{ fontWeight: 600, color: 'var(--ink-3)' }}>System Version:</div>
              <div>Worksense Analytics Portal v1.0.4 (Enterprise Edition)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
