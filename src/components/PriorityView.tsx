import React from 'react';
import { Check, Star, Headset, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, Mail, CheckCircle2, Trash2, X, Plus } from 'lucide-react';
import { Customer, ActionLog } from '../types';
import StatsSection from './StatsSection';

interface PriorityViewProps {
  customers: Customer[];
  searchQuery: string;
  segmentFilter: string;
  riskLevelFilter: string;
  selectedIndices: Set<string>;
  toggleRowSelection: (id: string) => void;
  toggleCheckAllVisible: (visibleIds: string[]) => void;
  clearSelection: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  openOutreachModal: (id: string) => void;
  onBulkOutreach: () => void;
  onBulkMitigate: () => void;
  onBulkDelete: () => void;
  formatIDR: (val: number) => string;
  actions: ActionLog[];
  showStats: boolean;
  formatIDRShort: (val: number) => string;
  viewMode: 'list' | 'grid';
}

export default function PriorityView({
  customers,
  searchQuery,
  segmentFilter,
  riskLevelFilter,
  selectedIndices,
  toggleRowSelection,
  toggleCheckAllVisible,
  clearSelection,
  currentPage,
  setCurrentPage,
  pageSize,
  openOutreachModal,
  onBulkOutreach,
  onBulkMitigate,
  onBulkDelete,
  formatIDR,
  actions,
  showStats,
  formatIDRShort,
  viewMode
}: PriorityViewProps) {
  // 1. Filter customers
  const filtered = customers.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase()) || cust.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment = segmentFilter === "ALL" || cust.segment === segmentFilter;
    const matchesRisk = riskLevelFilter === "ALL" || cust.riskCategory === riskLevelFilter;
    return matchesSearch && matchesSegment && matchesRisk;
  });

  // 2. Pagination calculation
  const totalItems = filtered.length;
  const maxPage = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Guard current page
  const pageToRender = Math.min(currentPage, maxPage);
  const startIndex = (pageToRender - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

  const paginatedIds = paginatedData.map(c => c.id);
  const allPaginatedSelected = paginatedIds.length > 0 && paginatedIds.every(id => selectedIndices.has(id));

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0 && val <= maxPage) {
      setCurrentPage(val);
    }
  };

  const handleCheckboxClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRowSelection(id);
  };

  const handleCheckAllClick = () => {
    toggleCheckAllVisible(paginatedIds);
  };

  const handleAddCustomerClick = () => {
    // Stage custom customer
    openOutreachModal(""); // wait, can open customer modal
  };

  return (
    <div className="view active" id="v-priority">
      {showStats && (
        <StatsSection 
          customers={customers}
          actions={actions}
          showStats={showStats}
          formatIDRShort={formatIDRShort}
        />
      )}
      {viewMode === 'grid' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Select all on page utility bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 'var(--r)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <span 
                className={`check ${allPaginatedSelected ? 'on' : ''}`} 
                onClick={handleCheckAllClick}
              >
                <Check style={{ width: '10px', height: '10px' }} />
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-2)' }}>Select All on This Page</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--ink-3)' }}>
              Showing {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} of {totalItems} matches
            </span>
          </div>

          {/* Grid Layout Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }} id="priorityGrid">
            {paginatedData.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: 'var(--ink-3)', border: '1px dashed var(--line)', borderRadius: 'var(--r-lg)', background: 'var(--surface)' }}>
                No account profiles match active segment or search criteria.
              </div>
            ) : (
              paginatedData.map((cust) => {
                const isSelected = selectedIndices.has(cust.id);
                let badgeClass = "pill green";
                if (cust.riskCategory === "Medium") badgeClass = "pill amber";
                if (cust.riskCategory === "High") badgeClass = "pill red";

                const isContacted = cust.status === "Contacted";
                const isDeclined = cust.status === "Declined";

                return (
                  <div 
                    key={cust.id}
                    className={`card ${isSelected ? 'sel' : ''}`}
                    style={{ 
                      cursor: 'pointer', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between', 
                      position: 'relative',
                      transition: 'transform 0.2s var(--ease), border-color 0.2s var(--ease)',
                      border: isSelected ? '1px solid var(--orange)' : '1px solid var(--line)',
                    }}
                    onClick={() => toggleRowSelection(cust.id)}
                  >
                    {/* Top Row Header */}
                    <div style={{ display: 'flex', justifySelf: 'start', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span 
                          className={`check ${isSelected ? 'on' : ''}`} 
                          onClick={(e) => handleCheckboxClick(cust.id, e)}
                        >
                          <Check style={{ width: '10px', height: '10px' }} />
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{cust.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>ID: {cust.id}</div>
                        </div>
                      </div>
                      <span className={badgeClass} style={{ flexShrink: 0 }}>{cust.riskCategory}</span>
                    </div>

                    {/* Middle Content Details Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)', padding: '10px 0', margin: '8px 0', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--ink-3)' }}>Segment:</span>
                        <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{cust.segment}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--ink-3)' }}>Recency:</span>
                        <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{cust.recency} Days</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--ink-3)' }}>Frequency (SLA):</span>
                        <span className="rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i}
                              style={{ 
                                width: '12px', 
                                height: '12px', 
                                ...(i < cust.freqScore 
                                  ? { fill: 'var(--orange)', color: 'var(--orange)' } 
                                  : { color: 'var(--line)' })
                              }} 
                            />
                          ))}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--ink-3)' }}>Risk Score:</span>
                        <span style={{ fontWeight: 700, color: 'var(--orange-deep)' }}>{cust.riskScore}/100</span>
                      </div>
                    </div>

                    {/* Bottom Row Footer & Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div>
                        <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '0.05em' }}>Monetary Value</div>
                        <div className="tnum" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{formatIDR(cust.monetary)}</div>
                      </div>
                      <div>
                        {isContacted ? (
                          <span className="pill green" style={{ fontSize: '11px', padding: '2px 8px' }}>
                            <Check style={{ width: '12px', height: '12px', marginRight: '4px' }} /> Logged
                          </span>
                        ) : isDeclined ? (
                          <span className="pill red" style={{ fontSize: '11px', padding: '2px 8px' }}>
                            <X style={{ width: '12px', height: '12px', marginRight: '4px' }} /> Lost
                          </span>
                        ) : (
                          <button 
                            className="btn" 
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={(e) => { e.stopPropagation(); openOutreachModal(cust.id); }}
                          >
                            <Headset style={{ width: '12px', height: '12px', marginRight: '4px' }} /> Engage
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Direct Stage profile add card helper */}
            <div 
              className="card" 
              onClick={() => openOutreachModal("NEW_MANUAL")}
              style={{ 
                border: '1.5px dashed var(--line)', 
                borderRadius: 'var(--r-lg)',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '24px', 
                cursor: 'pointer',
                minHeight: '160px',
                background: 'transparent',
                transition: 'background 0.2s var(--ease)',
                color: 'var(--ink-3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Plus style={{ width: '22px', height: '22px', marginBottom: '6px' }} />
              <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Stage New Customer Profile</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="tablewrap">
          <table id="priorityTable">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '11px' }}>
                    <span 
                      className={`check ${allPaginatedSelected ? 'on' : ''}`} 
                      id="checkAll"
                      onClick={handleCheckAllClick}
                    >
                      <Check style={{ width: '10px', height: '10px' }} />
                    </span> 
                    Customer Name
                  </span>
                </th>
                <th>Segment</th>
                <th className="num">Recency (Days)</th>
                <th className="num">Frequency (SLA)</th>
                <th className="num">Monetary Value</th>
                <th style={{ textAlign: 'center' }}>Calculated Risk</th>
                <th>Outreach Status</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody id="priorityRows">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)' }}>
                    No account profiles match active segment or search criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((cust) => {
                  const isSelected = selectedIndices.has(cust.id);
                  let badgeClass = "pill green";
                  if (cust.riskCategory === "Medium") badgeClass = "pill amber";
                  if (cust.riskCategory === "High") badgeClass = "pill red";

                  const isContacted = cust.status === "Contacted";
                  const isDeclined = cust.status === "Declined";
                  
                  return (
                    <tr className={isSelected ? 'sel' : ''} key={cust.id}>
                      <td>
                        <div className="cell-prod">
                          <span 
                            className={`check ${isSelected ? 'on' : ''}`} 
                            onClick={(e) => handleCheckboxClick(cust.id, e)}
                          >
                            <Check style={{ width: '10px', height: '10px' }} />
                          </span>
                          <div>
                            <div style={{ fontWeight: 700 }}>{cust.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--ink-3)', fontWeight: 400 }}>ID: {cust.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="muted">{cust.segment}</td>
                      <td className="num" style={{ fontWeight: 600 }}>{cust.recency} Days</td>
                      <td className="num">
                        <span className="rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i}
                              style={{ 
                                width: '12px', 
                                height: '12px', 
                                ...(i < cust.freqScore 
                                  ? { fill: 'var(--orange)', color: 'var(--orange)' } 
                                  : { color: 'var(--line)' })
                              }} 
                            />
                          ))}
                        </span>
                      </td>
                      <td className="num" style={{ fontWeight: 700 }}>{formatIDR(cust.monetary)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={badgeClass}>{cust.riskCategory} ({cust.riskScore}/100)</span>
                      </td>
                      <td>
                        <span className={`pill ${isContacted ? 'green' : isDeclined ? 'red' : 'amber'}`}>{cust.status}</span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {isContacted ? (
                          <span className="pill green" style={{ fontSize: '11px', padding: '2px 8px' }}>
                            <Check style={{ width: '12px', height: '12px', marginRight: '4px' }} /> Logged
                          </span>
                        ) : isDeclined ? (
                          <span className="pill red" style={{ fontSize: '11px', padding: '2px 8px' }}>
                            <X style={{ width: '12px', height: '12px', marginRight: '4px' }} /> Lost
                          </span>
                        ) : (
                          <button 
                            className="btn" 
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => openOutreachModal(cust.id)}
                          >
                            <Headset style={{ width: '12px', height: '12px', marginRight: '4px' }} /> Engage
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="addcol" onClick={() => openOutreachModal("NEW_MANUAL")}><Plus /> Stage New Customer Profile</div>
        </div>
      )}

      {/* Floating Bottom action drawer */}
      {selectedIndices.size > 0 && (
        <div className="floatbar" style={{ display: 'flex' }}>
          <div className="inner">
            <span className="selcount">{selectedIndices.size} Selected</span>
            <button className="fb-btn" onClick={onBulkOutreach}><Mail /> Bulk Outreach Action</button>
            <button className="fb-btn" onClick={onBulkMitigate}><CheckCircle2 /> Mitigate Selected</button>
            <button className="fb-btn danger" onClick={onBulkDelete}><Trash2 /> Exclude Accounts</button>
            <div className="fb-div"></div>
            <button className="fb-btn" onClick={clearSelection}><X /></button>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="pager">
        <div className="perpage">
          Showing per page <span className="selectbox">{pageSize} <ChevronDown /></span>
        </div>
        <div className="pages">
          <button 
            className="pg arrow" 
            onClick={() => setCurrentPage(Math.max(1, pageToRender - 1))}
            disabled={pageToRender === 1}
            style={pageToRender === 1 ? { opacity: 0.4, cursor: 'default' } : {}}
          >
            <ChevronLeft width={15} height={15} />
          </button>
          
          {Array.from({ length: maxPage }, (_, i) => i + 1).map(pageNum => (
            <button 
              key={pageNum}
              className={`pg ${pageNum === pageToRender ? 'on' : ''}`}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          <button 
            className="pg arrow" 
            onClick={() => setCurrentPage(Math.min(maxPage, pageToRender + 1))}
            disabled={pageToRender === maxPage}
            style={pageToRender === maxPage ? { opacity: 0.4, cursor: 'default' } : {}}
          >
            <ChevronRight width={15} height={15} />
          </button>
        </div>
        <div className="goto">
          Go to page 
          <input 
            type="number" 
            value={pageToRender} 
            onChange={handlePageInputChange}
            min={1} 
            max={maxPage} 
          /> 
          <span className="go" onClick={() => setCurrentPage(pageToRender)}>
            Go <ArrowRight style={{ width: '12px', height: '12px' }} />
          </span>
        </div>
      </div>
    </div>
  );
}
