import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { AlertOctagon, X, CheckCircle, Info, Star } from 'lucide-react';
import { Customer, ActionLog } from '../types';
import StatsSection from './StatsSection';

Chart.register(...registerables);

interface DashboardViewProps {
  customers: Customer[];
  actions: ActionLog[];
  formatIDR: (val: number) => string;
  formatIDRShort: (val: number) => string;
  openOutreachModal: (id: string) => void;
  triggerToast: (msg: string) => void;
  showStats: boolean;
}

const PALETTE = {
  blue: '#3b82f6', // oklch(58% 0.11 250)
  red: '#ef4444',  // oklch(64% 0.19 22)
  amber: '#f59e0b', // oklch(74% 0.13 82)
  green: '#10b981', // oklch(64% 0.15 150)
  grid: '#e5e7eb',
  text: '#6b7280'
};

export default function DashboardView({
  customers,
  actions,
  formatIDR,
  formatIDRShort,
  openOutreachModal,
  triggerToast,
  showStats
}: DashboardViewProps) {
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const trendCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const distCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trendChartRef = useRef<Chart | null>(null);
  const distChartRef = useRef<Chart | null>(null);

  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('30D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filterOptions = [
    {
      label: 'Today',
      date: formatDate(new Date()),
    },
    {
      label: '7D',
      date: `${formatDate(new Date(new Date().setDate(new Date().getDate() - 7)))} – ${formatDate(new Date())}`,
    },
    {
      label: '30D',
      date: `${formatDate(new Date(new Date().setDate(new Date().getDate() - 30)))} – ${formatDate(new Date())}`,
    },
    {
      label: '3M',
      date: `${formatDate(new Date(new Date().setMonth(new Date().getMonth() - 3)))} – ${formatDate(new Date())}`,
    },
    {
      label: '6M',
      date: `${formatDate(new Date(new Date().setMonth(new Date().getMonth() - 6)))} – ${formatDate(new Date())}`,
    },
  ];

  // 1. Calculate Live Exposure & Saved Metrics
  let totalSaved = 0;
  let totalActiveAtRisk = 0;

  customers.forEach(cust => {
    if (cust.status === "Pending" && cust.riskCategory === "High") {
      totalActiveAtRisk += cust.monetary;
    }
  });

  actions.forEach(act => {
    if (act.status === "Contacted") {
      totalSaved += act.impact;
    }
  });

  // 2. Filter Urgent Threats
  const urgentThreats = [...customers]
    .filter(c => c.status === "Pending" && c.riskCategory === "High")
    .sort((a, b) => b.monetary - a.monetary)
    .slice(0, 5);

  // 3. Segment Risk Tables Data
  const segments = ["Enterprise", "Mid-Market", "SMB"];
  let totalSegmentRiskValue = 0;
  const segmentStats = segments.map(segName => {
    let valueAtRisk = 0;
    customers.forEach(c => {
      if (c.status === "Pending" && c.segment === segName) {
        valueAtRisk += c.monetary;
      }
    });
    totalSegmentRiskValue += valueAtRisk;
    return { name: segName, value: valueAtRisk };
  });

  // 4. Distribution Breakdown for Doughnut Chart
  let highRiskVal = 0;
  let mediumRiskVal = 0;
  let lowRiskVal = 0;

  customers.forEach(cust => {
    if (cust.status === "Pending") {
      if (cust.riskCategory === "High") highRiskVal += cust.monetary;
      else if (cust.riskCategory === "Medium") mediumRiskVal += cust.monetary;
      else lowRiskVal += cust.monetary;
    }
  });

  const totalRiskValue = highRiskVal + mediumRiskVal + lowRiskVal;

  // Render / Update Charts
  useEffect(() => {
    // ---- TREND LINE CHART ----
    if (trendCanvasRef.current) {
      if (trendChartRef.current) {
        trendChartRef.current.destroy();
      }

      const scaleAndRound = (val: number, factor: number) => Math.round(val * factor);
      
      let labels: string[] = [];
      let riskProjectionData: number[] = [];
      let mitigatedProjectionData: number[] = [];

      if (selectedTimeframe === 'Today') {
        labels = ['09:00', '11:00', '13:00', '15:00', '17:00 (Live)'];
        mitigatedProjectionData = [
          scaleAndRound(totalSaved, 0.45),
          scaleAndRound(totalSaved, 0.6),
          scaleAndRound(totalSaved, 0.8),
          scaleAndRound(totalSaved, 0.95),
          totalSaved
        ];
        riskProjectionData = [
          scaleAndRound(totalActiveAtRisk, 1.05),
          scaleAndRound(totalActiveAtRisk, 1.03),
          scaleAndRound(totalActiveAtRisk, 1.02),
          scaleAndRound(totalActiveAtRisk, 1.01),
          totalActiveAtRisk
        ];
      } else if (selectedTimeframe === '7D') {
        labels = ['6 days ago', '4 days ago', '2 days ago', 'Today (Live)'];
        mitigatedProjectionData = [
          scaleAndRound(totalSaved, 0.3),
          scaleAndRound(totalSaved, 0.5),
          scaleAndRound(totalSaved, 0.8),
          totalSaved
        ];
        riskProjectionData = [
          scaleAndRound(totalActiveAtRisk, 1.15),
          scaleAndRound(totalActiveAtRisk, 1.1),
          scaleAndRound(totalActiveAtRisk, 1.05),
          totalActiveAtRisk
        ];
      } else if (selectedTimeframe === '30D') {
        labels = ['4 weeks ago', '3 weeks ago', '2 weeks ago', 'This Week (Live)'];
        mitigatedProjectionData = [
          scaleAndRound(totalSaved, 0.15),
          scaleAndRound(totalSaved, 0.4),
          scaleAndRound(totalSaved, 0.7),
          totalSaved
        ];
        riskProjectionData = [
          scaleAndRound(totalActiveAtRisk, 1.25),
          scaleAndRound(totalActiveAtRisk, 1.18),
          scaleAndRound(totalActiveAtRisk, 1.08),
          totalActiveAtRisk
        ];
      } else if (selectedTimeframe === '3M') {
        labels = ['May 2026', 'June 2026', 'July 2026 (Live)'];
        mitigatedProjectionData = [
          scaleAndRound(totalSaved, 0.1),
          scaleAndRound(totalSaved, 0.35),
          totalSaved
        ];
        riskProjectionData = [
          scaleAndRound(totalActiveAtRisk, 1.32),
          scaleAndRound(totalActiveAtRisk, 1.15),
          totalActiveAtRisk
        ];
      } else { // 6M
        labels = ['Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026 (Live)'];
        mitigatedProjectionData = [
          scaleAndRound(totalSaved, 0.05),
          scaleAndRound(totalSaved, 0.1),
          scaleAndRound(totalSaved, 0.2),
          scaleAndRound(totalSaved, 0.45),
          scaleAndRound(totalSaved, 0.75),
          totalSaved
        ];
        riskProjectionData = [
          scaleAndRound(totalActiveAtRisk, 1.45),
          scaleAndRound(totalActiveAtRisk, 1.38),
          scaleAndRound(totalActiveAtRisk, 1.32),
          scaleAndRound(totalActiveAtRisk, 1.25),
          scaleAndRound(totalActiveAtRisk, 1.15),
          totalActiveAtRisk
        ];
      }

      trendChartRef.current = new Chart(trendCanvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Mitigated Value',
              data: mitigatedProjectionData,
              borderColor: PALETTE.blue,
              backgroundColor: 'rgba(59, 130, 246, 0.06)',
              fill: true,
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
            },
            {
              label: 'Active Revenue-at-Risk',
              data: riskProjectionData,
              borderColor: PALETTE.red,
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              fill: true,
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 24
            }
          },
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { 
              grid: { display: false },
              ticks: { color: PALETTE.text }
            },
            y: {
              grid: { color: PALETTE.grid, drawTicks: false },
              border: { display: false },
              ticks: {
                color: PALETTE.text,
                callback: function(value) {
                  const valNum = Number(value);
                  if (valNum >= 1e9) return 'Rp ' + (valNum / 1e9).toFixed(1) + 'B';
                  if (valNum >= 1e6) return 'Rp ' + (valNum / 1e6).toFixed(0) + 'M';
                  return 'Rp ' + valNum;
                }
              }
            }
          }
        }
      });
    }

    // ---- DOUGHNUT CHART ----
    if (distCanvasRef.current) {
      if (distChartRef.current) {
        distChartRef.current.destroy();
      }

      distChartRef.current = new Chart(distCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: ['High Risk Exposure', 'Medium Risk Exposure', 'Healthy Accounts'],
          datasets: [{
            data: [highRiskVal, mediumRiskVal, lowRiskVal],
            backgroundColor: [PALETTE.red, PALETTE.amber, PALETTE.green],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          layout: {
            padding: {
              top: 12,
              bottom: 4
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const rawValue = Number(context.raw || 0);
                  return ' ' + label + ': ' + formatIDRShort(rawValue);
                }
              }
            }
          }
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (trendChartRef.current) trendChartRef.current.destroy();
      if (distChartRef.current) distChartRef.current.destroy();
    };
  }, [totalActiveAtRisk, totalSaved, highRiskVal, mediumRiskVal, lowRiskVal, selectedTimeframe]);

  const collapseFR03Banner = () => {
    setIsBannerDismissed(true);
  };

  const distLegends = [
    { name: 'High Risk Exposure', amount: highRiskVal, color: PALETTE.red, share: totalRiskValue > 0 ? ((highRiskVal / totalRiskValue) * 100).toFixed(1) + '%' : '0%' },
    { name: 'Medium Risk Exposure', amount: mediumRiskVal, color: PALETTE.amber, share: totalRiskValue > 0 ? ((mediumRiskVal / totalRiskValue) * 100).toFixed(1) + '%' : '0%' },
    { name: 'Healthy Accounts', amount: lowRiskVal, color: PALETTE.green, share: totalRiskValue > 0 ? ((lowRiskVal / totalRiskValue) * 100).toFixed(1) + '%' : '0%' }
  ];

  return (
    <div className="view active" id="v-dash" style={{ paddingTop: '8px' }}>
      {showStats && (
        <StatsSection 
          customers={customers}
          actions={actions}
          showStats={showStats}
          formatIDRShort={formatIDRShort}
        />
      )}
      {/* Banner */}
      {!isBannerDismissed && (
        <div 
          className="banner" 
          id="fr03Banner" 
          style={{ 
            marginBottom: '12px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            width: '100%', 
            transition: 'all 0.25s var(--ease)', 
            overflow: 'hidden' 
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="banner-ico"><AlertOctagon /></div>
            <div className="banner-content" style={{ paddingTop: '1px' }}>
              <strong>System Alert (FR-03 Compliance):</strong> Customer attrition risk calculated dynamically from transactional Recency, Frequency, and Monetary metrics. Action items completed below affect overall risk indexes immediately.
            </div>
          </div>
          <button 
            onClick={collapseFR03Banner} 
            style={{ color: 'var(--orange-deep)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' }} 
            title="Dismiss alert"
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid g-2-1" style={{ marginBottom: '12px' }}>
        {/* Trend Timeline */}
        <div className="card" style={{ padding: '0', overflow: 'visible' }}>
          <div style={{ padding: '16px 16px 12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="card-title" style={{ fontSize: '.95rem', fontWeight: 600 }}>Revenue-at-Risk Trend Timeline (FR-06)</div>
              <div className="card-sub" style={{ fontSize: '0.76rem', color: 'var(--ink-3)' }}>Real-time monitoring of active business risk exposure vs. validated mitigations</div>
            </div>
            {/* Dynamic timeframe selector */}
            <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--surface-2)', paddingLeft: '0px', paddingRight: '0px', paddingTop: '2px', paddingBottom: '2px', marginTop: '0px', position: 'relative', zIndex: 10 }}>
              {filterOptions.map((item, index) => {
                const isSelected = selectedTimeframe === item.label;
                return (
                  <div key={item.label} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedTimeframe(item.label)}
                      style={{
                        border: 'none',
                        background: isSelected ? 'var(--orange-deep)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--ink-2)',
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s var(--ease)',
                      }}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {item.label}
                    </button>
                    {hoveredIndex === index && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%) translateY(-6px)',
                        background: 'var(--ink)',
                        color: 'var(--surface)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        whiteSpace: 'nowrap',
                        zIndex: 100,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        border: '1px solid var(--line-soft)',
                        pointerEvents: 'none'
                      }}>
                        {item.date}
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '0',
                          height: '0',
                          borderLeft: '4px solid transparent',
                          borderRight: '4px solid transparent',
                          borderTop: '4px solid var(--ink)',
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--line)', padding: '36px 16px 16px 16px' }}>
            <ul role="list" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px', listStyle: 'none', marginBottom: '16px', padding: '0' }}>
              <li>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '11px', height: '11px', flexShrink: 0, borderRadius: '3px', background: PALETTE.blue }} aria-hidden="true"></span>
                  <p className="tnum" style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0' }}>{formatIDRShort(totalSaved)}</p>
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--ink-3)', margin: '0' }}>Mitigated Revenue (Saved)</p>
              </li>
              <li>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '11px', height: '11px', flexShrink: 0, borderRadius: '3px', background: PALETTE.red }} aria-hidden="true"></span>
                  <p className="tnum" style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0' }}>{formatIDRShort(totalActiveAtRisk)}</p>
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--ink-3)', margin: '0' }}>Active Revenue-at-Risk</p>
              </li>
            </ul>
            <div className="chart-box" style={{ height: '210px' }}>
              <canvas ref={trendCanvasRef}></canvas>
            </div>
          </div>
        </div>

        {/* Urgent Retention Alerts */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 16px 12px 16px' }}>
            <div className="card-title">Urgent Retention Alerts</div>
            <div className="card-sub">Highest monetary value accounts requiring urgent outreach</div>
          </div>
          <div style={{ borderTop: '1px solid var(--line)', padding: '16px' }}>
            <div className="feed" id="urgentThreatsFeed">
              {urgentThreats.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  <CheckCircle style={{ width: '28px', height: '28px', color: 'var(--green)', margin: '0 auto 10px', display: 'block' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.84rem' }}>Clean Desk Status</span>
                  <div style={{ fontSize: '0.72rem', marginTop: '2px' }}>No urgent customer risk alerts found!</div>
                </div>
              ) : (
                urgentThreats.map(cust => {
                  const initials = cust.name
                    .split(' ')
                    .filter(w => !['PT', 'Tbk', 'Tbk,', ',', 'and', 'Ltd', 'Corp'].includes(w))
                    .map(w => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'CU';

                  return (
                    <div className="alert" style={{ alignItems: 'center', padding: '10px 0' }} key={cust.id}>
                      <div className="alert-badge-container">
                        <div className="alert-avatar" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}>{initials}</div>
                        <span className="alert-status-dot"></span>
                      </div>
                      <div style={{ flex: 1, marginLeft: '4px' }}>
                        <div className="alert-title" style={{ fontSize: '0.84rem', fontWeight: 700 }}>{cust.name}</div>
                        <div className="alert-meta" style={{ fontSize: '0.74rem', marginTop: '1px' }}>
                          {cust.segment} • Recency: <strong>{cust.recency} Days</strong> • exposure: <strong style={{ color: 'var(--red-ink)' }}>{formatIDRShort(cust.monetary)}</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '4px 10px', fontSize: '0.76rem', fontWeight: 600 }}
                          onClick={() => openOutreachModal(cust.id)}
                        >
                          Engage
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Doughnut and Commercial Tables */}
      <div className="grid g-2-1">
        {/* Attrition Risk Segment Breakdown */}
        <div className="card flex flex-col justify-between" style={{ padding: '0', overflow: 'hidden' }}>
          <div>
            <div style={{ padding: '16px 16px 12px 16px' }}>
              <div className="card-title">Attrition Risk Segment Breakdown</div>
              <div className="card-sub">Calculated using live configuration thresholds</div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--line)', padding: '24px 16px 16px 16px' }}>
              <div className="donut-split-grid" style={{ alignItems: 'center' }}>
                {/* Left Column: Pure Circle Donut */}
                <div className="chart-box sm" style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <canvas ref={distCanvasRef}></canvas>
                </div>
                
                {/* Right Column: Vertical list */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
                  <ul id="c_dist_list" style={{ listStyle: 'none', padding: '0', margin: '0', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {distLegends.map((item, idx) => (
                      <li className="flex" style={{ gap: '12px', alignItems: 'flex-start' }} key={idx}>
                        <span style={{ backgroundColor: item.color, width: '10px', height: '10px', borderRadius: '3px', flexShrink: 0, marginTop: '4px' }} aria-hidden="true"></span>
                        <div>
                          <p className="tnum" style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0', lineHeight: '1.2' }}>
                            {formatIDRShort(item.amount)} <span style={{ fontWeight: 500, fontSize: '0.78rem', color: 'var(--ink-3)' }}>({item.share})</span>
                          </p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', margin: '4px 0 0 0' }}>{item.name}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Profile Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 16px 12px 16px' }}>
            <div className="card-title">Risk Profile by Business Segment</div>
            <div className="card-sub">At-risk volumes categorized by commercial tiers</div>
          </div>
          <div style={{ borderTop: '1px solid var(--line)', padding: '12px 16px 16px 16px' }}>
            <table style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 10px' }}>Segment Tier</th>
                  <th style={{ width: '40%', padding: '8px 10px' }}>Risk Exposure Heatmap</th>
                  <th className="num" style={{ padding: '8px 10px' }}>Revenue-at-Risk</th>
                </tr>
              </thead>
              <tbody>
                {segmentStats.map(seg => {
                  const percentage = totalSegmentRiskValue > 0 ? ((seg.value / totalSegmentRiskValue) * 100) : 0;
                  let barColor = PALETTE.green;
                  if (seg.name === "Mid-Market") barColor = PALETTE.amber;
                  if (seg.name === "Enterprise") barColor = PALETTE.red; // original maps to --orange which is indigo/blue, wait, let's look at the color maps.
                  // In original: "Enterprise" -> P.orange (actually rich blue), "Mid-Market" -> P.amber, "SMB" (or other) -> P.green. Let's make it exactly match!
                  if (seg.name === "Enterprise") barColor = 'var(--orange)'; // This matches the CSS variable '--orange' color!
                  if (seg.name === "Mid-Market") barColor = 'var(--amber)';
                  if (seg.name === "SMB") barColor = 'var(--green)';

                  return (
                    <tr key={seg.name}>
                      <td style={{ fontWeight: 600, padding: '10px 12px' }}>{seg.name} Contracts</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div className="heat">
                          <i style={{ width: `${percentage}%`, backgroundColor: barColor }}></i>
                        </div>
                      </td>
                      <td className="num" style={{ fontWeight: 700, padding: '10px 12px' }}>{formatIDRShort(seg.value)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
