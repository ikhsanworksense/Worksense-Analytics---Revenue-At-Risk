import React, { useEffect, useState } from 'react';
import { Save, Database } from 'lucide-react';
import { ScoringConfig, Customer, ActionLog } from '../types';
import StatsSection from './StatsSection';

interface ControlPanelViewProps {
  config: ScoringConfig;
  onSaveConfig: (updated: ScoringConfig) => void;
  customers: Customer[];
  actions: ActionLog[];
  showStats: boolean;
  formatIDRShort: (val: number) => string;
}

export default function ControlPanelView({
  config,
  onSaveConfig,
  customers,
  actions,
  showStats,
  formatIDRShort
}: ControlPanelViewProps) {
  const [localConfig, setLocalConfig] = useState<ScoringConfig>({ ...config });

  // Sync state if prop changes
  useEffect(() => {
    setLocalConfig({ ...config });
  }, [config]);

  // Compute live relative weight inferences
  const maxRecencyScore = 5;
  const maxRecencyImpact = maxRecencyScore * 12; // 60 pts
  const minFrequencyScore = 1;
  const maxFrequencyImpact = (5 - minFrequencyScore) * localConfig.freqMultiplier * 6;
  const totalPossible = maxRecencyImpact + maxFrequencyImpact;

  const recencyPercentage = totalPossible > 0 ? Math.round((maxRecencyImpact / totalPossible) * 100) : 60;
  const frequencyPercentage = 100 - recencyPercentage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(localConfig);
  };

  const handleInputChange = (field: keyof ScoringConfig, val: number) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: val
    }));
  };

  return (
    <div className="view active" id="v-control">
      {showStats && (
        <StatsSection 
          customers={customers}
          actions={actions}
          showStats={showStats}
          formatIDRShort={formatIDRShort}
        />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', width: '100%', margin: '0 0 12px' }}>
        {/* Left Column: Form */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '380px' }}>
          <div>
            <div style={{ padding: '16px 20px 12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="card-title">Scoring Engine Formulation Parameters (FR-02)</div>
                <div className="card-sub">Adjust global mathematical weights evaluated on transactional triggers</div>
              </div>
              <span className="pill green tnum" style={{ fontSize: '0.72rem', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                DB Connected
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', padding: '20px' }}>
              <div style={{ 
                background: 'var(--surface-2)', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                fontSize: '0.72rem', 
                color: 'var(--ink-2)', 
                marginBottom: '16px', 
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Database size={12} style={{ color: '#10b981', flexShrink: 0 }} />
                <span>Memuat data langsung dari Database (LocalStorage: <code>worksense_config</code>)</span>
              </div>
              <form id="scoringConfigForm" onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="cfg_recency_med">Medium Risk Threshold</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        id="cfg_recency_med" 
                        className="form-control" 
                        style={{ paddingRight: '42px', fontWeight: 600 }}
                        value={localConfig.recencyMed}
                        onChange={(e) => handleInputChange('recencyMed', parseInt(e.target.value) || 0)}
                        required 
                      />
                      <span style={{ position: 'absolute', right: '10px', fontSize: '0.72rem', color: 'var(--ink-3)', fontWeight: 600, pointerEvents: 'none' }}>Days</span>
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="cfg_recency_high">High Risk Threshold</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        id="cfg_recency_high" 
                        className="form-control" 
                        style={{ paddingRight: '42px', fontWeight: 600 }}
                        value={localConfig.recencyHigh}
                        onChange={(e) => handleInputChange('recencyHigh', parseInt(e.target.value) || 0)}
                        required 
                      />
                      <span style={{ position: 'absolute', right: '10px', fontSize: '0.72rem', color: 'var(--ink-3)', fontWeight: 600, pointerEvents: 'none' }}>Days</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="cfg_freq_multiplier">Frequency Penalty Mult.</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        step="0.1" 
                        id="cfg_freq_multiplier" 
                        className="form-control" 
                        style={{ paddingRight: '28px', fontWeight: 600 }}
                        value={localConfig.freqMultiplier}
                        onChange={(e) => handleInputChange('freqMultiplier', parseFloat(e.target.value) || 0)}
                        required 
                      />
                      <span style={{ position: 'absolute', right: '10px', fontSize: '0.72rem', color: 'var(--ink-3)', fontWeight: 600, pointerEvents: 'none' }}>x</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="cfg_high_score">Critical Score Boundary</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        id="cfg_high_score" 
                        className="form-control" 
                        style={{ paddingRight: '34px', fontWeight: 600 }}
                        value={localConfig.highScoreThreshold}
                        onChange={(e) => handleInputChange('highScoreThreshold', parseInt(e.target.value) || 0)}
                        required 
                      />
                      <span style={{ position: 'absolute', right: '10px', fontSize: '0.72rem', color: 'var(--ink-3)', fontWeight: 600, pointerEvents: 'none' }}>Pts</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 20px', borderTop: '1px solid var(--line-soft)', background: 'var(--surface-2)' }}>
            <button 
              onClick={handleSubmit} 
              className="btn dark" 
              style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Save style={{ width: '14px', height: '14px' }} /> Save Configuration & Re-Calculate Engine
            </button>
          </div>
        </div>

        {/* Right Column: Weight Inferences */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '380px' }}>
          <div>
            <div style={{ padding: '16px 20px 12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="card-title">Relative Weight Inferences</div>
                <div className="card-sub">Dynamic weight impact calculated from formulation boundaries</div>
              </div>
              <span className="pill green tnum" style={{ fontSize: '0.72rem', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Database size={11} style={{ color: '#10b981' }} />
                DB Synced
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="weight-row">
                <div className="weight-label" style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--ink-2)' }}>Recency (Inactivity days score)</span>
                  <span className="tnum" style={{ color: 'var(--orange)' }}>{recencyPercentage}%</span>
                </div>
                <div className="weight-bar" style={{ height: '8px', background: 'var(--line-soft)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div className="weight-bar-fill" style={{ width: `${recencyPercentage}%`, height: '100%', background: 'var(--orange)', borderRadius: '99px', transition: 'width 0.3s var(--ease)' }}></div>
                </div>
              </div>

              <div className="weight-row">
                <div className="weight-label" style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--ink-2)' }}>Frequency (SLA rating variance)</span>
                  <span className="tnum" style={{ color: 'var(--blue-ink)' }}>{frequencyPercentage}%</span>
                </div>
                <div className="weight-bar" style={{ height: '8px', background: 'var(--line-soft)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div className="weight-bar-fill" style={{ width: `${frequencyPercentage}%`, height: '100%', background: 'var(--blue-ink)', borderRadius: '99px', transition: 'width 0.3s var(--ease)' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: 'var(--r)', fontSize: '0.76rem', border: '1px dashed var(--line)' }}>
              <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>Inference Logic</div>
              <p className="muted" style={{ lineHeight: 1.35 }}>
                The engine automatically maps inactivity days (Recency) alongside client SLA ranking (Frequency) to calculate overall customer risk. Adjusting multipliers dynamically balances risk priority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
