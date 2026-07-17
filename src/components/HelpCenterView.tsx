import React, { useState } from 'react';
import { Customer, ActionLog } from '../types';
import StatsSection from './StatsSection';
import { 
  Mail, 
  Phone, 
  HelpCircle, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface HelpCenterViewProps {
  customers: Customer[];
  actions: ActionLog[];
  showStats: boolean;
  formatIDRShort: (val: number) => string;
}

export default function HelpCenterView({
  customers,
  actions,
  showStats,
  formatIDRShort
}: HelpCenterViewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "Bagaimana cara kerja perhitungan Revenue-at-Risk?",
      answer: "Revenue-at-Risk dihitung berdasarkan nilai kontrak bulanan (Monetary) dari akun yang berada dalam status 'High Risk'. Kategori risiko ini dievaluasi secara dinamis berdasarkan parameter Bobot Recency (Hari Sejak Interaksi Terakhir) dan Penalty SLA Rating (Frequency) yang dikonfigurasi pada Control Panel."
    },
    {
      question: "Bagaimana cara memperbarui status retensi pelanggan?",
      answer: "Masuk ke menu 'Priority Action List', pilih salah satu pelanggan, lalu klik tombol 'Engage' atau gunakan aksi massal (Bulk Action). Anda dapat mencatat interaksi baru dan mengubah status pelanggan menjadi 'Contacted' atau 'Mitigated'. Seluruh riwayat akan tercatat secara permanen pada Retention Audit Log."
    },
    {
      question: "Apakah data konfigurasi penilaian aman jika halaman dimuat ulang?",
      answer: "Ya! Aplikasi ini telah dilengkapi dengan sistem integrasi database lokal (LocalStorage Engine) yang secara otomatis menyimpan seluruh data pelanggan, audit log penjangkauan, dan parameter konfigurasi bobot penilaian agar tetap aman dan tidak hilang saat Anda memuat ulang browser."
    },
    {
      question: "Bagaimana cara mengekspor data audit log ke spreadsheet?",
      answer: "Buka halaman 'Retention Audit Log' atau klik tombol 'Export Audit CSV' di bagian atas layar. File CSV yang kompatibel dengan Microsoft Excel atau Google Sheets akan langsung diunduh secara instan."
    }
  ];

  return (
    <div className="view active" id="v-help">
      {/* Grid Layout */}
      <div className="grid g-2-1" style={{ gap: '16px', alignItems: 'start' }}>
        {/* Left Column: Documentation & FAQs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Welcome Card */}
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05 }}>
              <BookOpen size={180} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', background: 'rgba(235, 94, 40, 0.1)', borderRadius: '8px', color: 'var(--orange-deep)' }}>
                <ShieldCheck size={24} />
              </div>
              <span className="pill orange" style={{ fontSize: '0.7rem' }}>Bantuan & Panduan</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--ink)' }}>
              Pusat Dukungan & Bantuan Worksense
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-3)', lineHeight: '1.5', maxWidth: '600px' }}>
              Temukan panduan praktis untuk mengoptimalkan manajemen retensi pelanggan, menyesuaikan parameter model scoring, dan berinteraksi secara real-time dengan portofolio bisnis Anda.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 16px 12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} style={{ color: 'var(--orange-deep)' }} />
              <div>
                <div className="card-title" style={{ fontSize: '.95rem', fontWeight: 600 }}>Pertanyaan yang Sering Diajukan (FAQ)</div>
                <div className="card-sub" style={{ fontSize: '0.76rem' }}>Jawaban cepat seputar mekanisme kalkulasi scoring dan operasional portal</div>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--line)', padding: '8px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div 
                    key={index} 
                    style={{ 
                      border: '1px solid var(--line)', 
                      borderRadius: '8px', 
                      overflow: 'hidden',
                      background: isOpen ? 'var(--surface-2)' : 'transparent',
                      transition: 'all 0.15s var(--ease)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'var(--ink)',
                        fontWeight: 600,
                        fontSize: '0.84rem'
                      }}
                    >
                      <span>{faq.question}</span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isOpen && (
                      <div style={{ 
                        padding: '0 16px 12px 16px', 
                        fontSize: '0.8rem', 
                        color: 'var(--ink-2)', 
                        lineHeight: '1.5',
                        borderTop: '1px solid var(--line-soft)',
                        paddingTop: '10px',
                        marginTop: '2px'
                      }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Developer Info & Contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Property Branding & Info Card */}
          <div className="card" style={{ padding: '20px', border: '1px solid var(--orange-light)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Zap size={18} style={{ color: 'var(--orange-deep)' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', tracking: '0.05em', color: 'var(--orange-deep)' }}>
                System Information
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--ink-3)', marginBottom: '4px' }}>Property Owner:</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>Ikhsan Kamal & Worksense Analytics</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--ink-3)', marginBottom: '4px' }}>Platform Status:</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#10b981' }}>
                <CheckCircle2 size={14} /> Terkoneksi & Terintegrasi
              </div>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '0.78rem', color: 'var(--ink-2)', lineHeight: '1.4' }}>
              Aplikasi ini didesain khusus sebagai dashboard analitik kelas enterprise untuk mendeteksi risiko kehilangan pendapatan secara proaktif.
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', fontStyle: 'italic' }}>
                © 2026 Worksense Analytics. Hak Cipta Dilindungi Undang-Undang.
              </div>
            </div>
          </div>

          {/* Direct Support Contacts */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 16px 12px 16px' }}>
              <div className="card-title" style={{ fontSize: '.95rem', fontWeight: 600 }}>Hubungi Tim Dukungan</div>
              <div className="card-sub" style={{ fontSize: '0.76rem' }}>Butuh bantuan kustomisasi model scoring atau integrasi API? Hubungi kami langsung.</div>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Email Link */}
              <a 
                href="mailto:iamikhsank@gmail.com" 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface-2)',
                  textDecoration: 'none',
                  color: 'var(--ink)',
                  transition: 'all 0.15s var(--ease)'
                }}
                className="hover-card-action"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', background: 'rgba(235, 94, 40, 0.1)', color: 'var(--orange-deep)', borderRadius: '6px' }}>
                    <Mail size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Kirim Email Resmi</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>iamikhsank@gmail.com</div>
                  </div>
                </div>
                <ExternalLink size={14} style={{ color: 'var(--ink-3)' }} />
              </a>

              {/* Whatsapp Link */}
              <a 
                href="https://wa.me/6282126574799" 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface-2)',
                  textDecoration: 'none',
                  color: 'var(--ink)',
                  transition: 'all 0.15s var(--ease)'
                }}
                className="hover-card-action"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '6px' }}>
                    <Phone size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>WhatsApp Instan</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>+62 821-2657-4799</div>
                  </div>
                </div>
                <ExternalLink size={14} style={{ color: 'var(--ink-3)' }} />
              </a>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
