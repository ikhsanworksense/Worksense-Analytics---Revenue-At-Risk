import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    segment: string;
    recency: number;
    freqScore: number;
    monetary: number;
  }) => void;
}

export default function AddCustomerModal({
  isOpen,
  onClose,
  onSubmit
}: AddCustomerModalProps) {
  const [name, setName] = useState("");
  const [segment, setSegment] = useState("Enterprise");
  const [recency, setRecency] = useState(10);
  const [freqScore, setFreqScore] = useState(5);
  const [monetary, setMonetary] = useState(500000000);

  // Reset fields on open
  useEffect(() => {
    if (isOpen) {
      setName("");
      setSegment("Enterprise");
      setRecency(10);
      setFreqScore(5);
      setMonetary(500000000);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name,
      segment,
      recency,
      freqScore,
      monetary
    });
  };

  return (
    <div className="modal-overlay open" id="manualAddModal">
      <div className="modal">
        <div className="modal-header">
          <h3>Add New Client Account</h3>
          <button onClick={onClose}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
        <div className="modal-body">
          <form id="manualAddForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="addCustName">Customer / Client Name</label>
              <input 
                type="text" 
                id="addCustName" 
                className="form-control" 
                placeholder="PT Astra Internasional Tbk" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="addCustSegment">Commercial Segment Tier</label>
              <select 
                id="addCustSegment" 
                className="form-control"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                required
              >
                <option value="Enterprise">Enterprise Tier</option>
                <option value="Mid-Market">Mid-Market Tier</option>
                <option value="SMB">SMB Tier</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="addCustRec">Recency (Days of Inactivity)</label>
              <input 
                type="number" 
                id="addCustRec" 
                className="form-control" 
                value={recency}
                onChange={(e) => setRecency(parseInt(e.target.value) || 0)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="addCustFreq">Frequency Score (SLA Compliance 1-5)</label>
              <input 
                type="number" 
                id="addCustFreq" 
                className="form-control" 
                min="1" 
                max="5" 
                value={freqScore}
                onChange={(e) => setFreqScore(parseInt(e.target.value) || 5)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="addCustValue">Monetary Value (IDR Currency)</label>
              <input 
                type="number" 
                id="addCustValue" 
                className="form-control" 
                placeholder="e.g. 500000000" 
                value={monetary}
                onChange={(e) => setMonetary(parseFloat(e.target.value) || 0)}
                required 
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '9px', marginTop: '18px' }}>
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn dark">Add Customer Profile</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
