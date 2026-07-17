import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Customer } from '../types';

interface OutreachModalProps {
  isOpen: boolean;
  customerId: string;
  customers: Customer[];
  onClose: () => void;
  onSubmit: (data: {
    customerId: string;
    channel: string;
    notes: string;
    status: string;
  }) => void;
  formatIDR: (val: number) => string;
}

export default function OutreachModal({
  isOpen,
  customerId,
  customers,
  onClose,
  onSubmit,
  formatIDR
}: OutreachModalProps) {
  const [channel, setChannel] = useState("Email Campaign");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Contacted");

  const targetCust = customers.find(c => c.id === customerId);

  // Reset fields on open
  useEffect(() => {
    if (isOpen) {
      setChannel("Email Campaign");
      setNotes("");
      setStatus("Contacted");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    onSubmit({
      customerId,
      channel,
      notes,
      status
    });
  };

  const isBulkMode = !customerId;

  return (
    <div className="modal-overlay open" id="outreachModal">
      <div className="modal">
        <div className="modal-header">
          <h3 id="modalTitle">
            {isBulkMode ? "Record Bulk Customer Engagement" : "Record Customer Engagement Action"}
          </h3>
          <button onClick={onClose}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
        <div className="modal-body">
          <div id="modalCustomerDetails" style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: 'var(--r)', marginBottom: '14px', fontSize: '0.82rem' }}>
            {isBulkMode ? (
              <>
                <strong>Target Accounts:</strong> Multiple Selected Portfolios<br />
                <strong>Operation:</strong> Staged Bulk Outreach
              </>
            ) : targetCust ? (
              <>
                <strong>Target Account Name:</strong> {targetCust.name}<br />
                <strong>Monetary Contract Value:</strong> {formatIDR(targetCust.monetary)}<br />
                <strong>Attrition Risk Index:</strong> {targetCust.riskCategory} ({targetCust.riskScore}/100)
              </>
            ) : (
              <strong>No customer selected</strong>
            )}
          </div>
          
          <form id="outreachForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="outreachChannel">Outreach Channel Type</label>
              <select 
                id="outreachChannel" 
                className="form-control" 
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                required
              >
                <option value="Email Campaign">Email Campaign (Product Pitch)</option>
                <option value="Direct Phone Call">Direct Phone Call (Consultation)</option>
                <option value="Strategy Session">Executive Strategy Session (In-Person)</option>
                <option value="Incentive Offer">Incentive / Discount Offer Code</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="outreachNotes">Engagement & Retention Notes (Mandatory - FR-04)</label>
              <textarea 
                id="outreachNotes" 
                className="form-control" 
                style={{ minHeight: '80px' }} 
                placeholder="Identify pain points discussed, contract negotiation terms, or discount metrics..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="outreachStatus">Retention Outcome Status</label>
              <select 
                id="outreachStatus" 
                className="form-control" 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="Contacted">Outreach Complete (Risk Mitigated)</option>
                <option value="In Progress">In Negotiation Progress</option>
                <option value="Declined">Refused Renewal (Lost Account)</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '9px', marginTop: '18px' }}>
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn dark">Log Action & Mitigate Risk</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
