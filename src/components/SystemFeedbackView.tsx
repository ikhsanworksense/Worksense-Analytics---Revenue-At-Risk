import React, { useState, useEffect } from 'react';
import { Customer, ActionLog } from '../types';
import { 
  MessageSquare, 
  Send, 
  User, 
  Building2, 
  Mail, 
  Star
} from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { saveFeedback } from '../lib/firebaseService';

interface FeedbackItem {
  id: string;
  name: string;
  company: string;
  email: string;
  category: string;
  rating: number;
  content: string;
  timestamp: string;
}

const INITIAL_FEEDBACKS: FeedbackItem[] = [
  {
    id: "FB-101",
    name: "Ikhsan Kamal",
    company: "Worksense Analytics",
    email: "iamikhsank@gmail.com",
    category: "Metode Scoring",
    rating: 5,
    content: "Rekomendasi untuk menambahkan model visualisasi analisis korelasi (Pearson Correlation) antara interval aktivitas komunikasi dengan durasi retensi akun agar model pembobotan RFM menjadi semakin prediktif secara otomatis.",
    timestamp: "2026-07-16 14:32:10"
  },
  {
    id: "FB-102",
    name: "Ahmad Rizky",
    company: "Fintech Nusantara",
    email: "rizky.ahmad@fintech.id",
    category: "Visualisasi Data",
    rating: 4,
    content: "Penambahan visualisasi grafik donat (donut chart) untuk persentase distribusi portofolio risiko berdasarkan nominal kontrak (Monetary Value) sangat memudahkan pelaporan level direksi.",
    timestamp: "2026-07-15 09:12:45"
  },
  {
    id: "FB-103",
    name: "Clara Amalia",
    company: "Logistics Go",
    email: "clara.amalia@logisticsgo.com",
    category: "Usability / Tampilan",
    rating: 5,
    content: "Pilihan rentang waktu dinamis pada tren Revenue-at-Risk sangat responsif. Sangat terbantu dengan visualisasi chart.js yang halus.",
    timestamp: "2026-07-14 11:20:00"
  }
];

interface SystemFeedbackViewProps {
  customers: Customer[];
  actions: ActionLog[];
  showStats: boolean;
  formatIDRShort: (val: number) => string;
  triggerToast: (msg: string) => void;
}

export default function SystemFeedbackView({
  customers,
  actions,
  showStats,
  formatIDRShort,
  triggerToast
}: SystemFeedbackViewProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {
    try {
      const saved = localStorage.getItem("worksense_feedbacks");
      return saved ? JSON.parse(saved) : INITIAL_FEEDBACKS;
    } catch (e) {
      return INITIAL_FEEDBACKS;
    }
  });

  // Load feedbacks from Firestore on mount
  useEffect(() => {
    async function loadFeedbacks() {
      try {
        const colRef = collection(db, 'feedbacks');
        const snapshot = await getDocs(colRef);
        if (snapshot.empty) {
          // Seed initial feedbacks to Firestore
          console.log('Seeding initial feedbacks to Firestore...');
          for (const fb of INITIAL_FEEDBACKS) {
            await saveFeedback(fb);
          }
          setFeedbacks(INITIAL_FEEDBACKS);
        } else {
          const list: FeedbackItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as FeedbackItem);
          });
          setFeedbacks(list.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
        }
      } catch (err) {
        console.error("Failed to load feedbacks from Firestore, using local:", err);
      }
    }
    loadFeedbacks();
  }, []);

  // Save to database simulation whenever feedbacks change
  useEffect(() => {
    try {
      localStorage.setItem("worksense_feedbacks", JSON.stringify(feedbacks));
    } catch (e) {
      console.error("Failed to save feedbacks to localStorage:", e);
    }
  }, [feedbacks]);

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Metode Scoring');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || !email.trim()) {
      triggerToast("Harap isi Nama, Email, dan Detail Rekomendasi Anda.");
      return;
    }

    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newFb: FeedbackItem = {
      id: `FB-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      company: company.trim() || "Independent Developer",
      email: email.trim(),
      category,
      rating,
      content: content.trim(),
      timestamp: time
    };

    try {
      await saveFeedback(newFb);
      setFeedbacks(prev => [newFb, ...prev]);
      triggerToast("Rekomendasi Anda berhasil disimpan ke Firestore & database terintegrasi!");
    } catch (err) {
      console.error("Error saving feedback to Firestore, saving locally only:", err);
      setFeedbacks(prev => [newFb, ...prev]);
      triggerToast("Rekomendasi berhasil disimpan secara lokal!");
    }
    
    // Clear form
    setName('');
    setCompany('');
    setEmail('');
    setContent('');
    setRating(5);
    setCategory('Metode Scoring');
  };

  const categories = [
    "Metode Scoring",
    "Visualisasi Data",
    "Sistem Integrasi",
    "Usability / Tampilan",
    "Lainnya"
  ];

  return (
    <div className="view active" id="v-feedback">
      <div style={{ width: '100%' }}>
        {/* Left Card: Input Feedback Form */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 16px 12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', background: 'rgba(235, 94, 40, 0.1)', borderRadius: '6px', color: 'var(--orange-deep)' }}>
              <MessageSquare size={16} />
            </div>
            <div>
              <div className="card-title" style={{ fontSize: '.95rem', fontWeight: 600 }}>Formulir Rekomendasi Sistem</div>
              <div className="card-sub" style={{ fontSize: '0.76rem' }}>Tuliskan usulan, rekomendasi teknis, atau temuan bug untuk pengembangan sistem</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', padding: '20px 16px 16px 16px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Row 1: Name & Company */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '4px' }}>
                    Nama Lengkap <span style={{ color: 'var(--orange-deep)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Contoh: Ikhsan Kamal"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 32px',
                        fontSize: '0.82rem',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        background: 'var(--surface-2)',
                        color: 'var(--ink)'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '4px' }}>
                    Nama Perusahaan / Instansi
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>
                      <Building2 size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Contoh: Worksense Analytics"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 32px',
                        fontSize: '0.82rem',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        background: 'var(--surface-2)',
                        color: 'var(--ink)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '4px' }}>
                    Alamat Email <span style={{ color: 'var(--orange-deep)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      placeholder="Contoh: iamikhsank@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 32px',
                        fontSize: '0.82rem',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        background: 'var(--surface-2)',
                        color: 'var(--ink)'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '4px' }}>
                    Kategori Rekomendasi
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '0.82rem',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      background: 'var(--surface-2)',
                      color: 'var(--ink)',
                      height: '38px',
                      cursor: 'pointer'
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Satisfaction score with stars clickable */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '4px' }}>
                  Skor Kepuasan Terhadap Sistem
                </label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isSelected = starValue <= rating;
                    return (
                      <button
                        type="button"
                        key={starValue}
                        onClick={() => setRating(starValue)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'inline-flex',
                          color: isSelected ? 'var(--orange-deep)' : 'var(--line)'
                        }}
                      >
                        <Star size={20} fill={isSelected ? "var(--orange-deep)" : "none"} />
                      </button>
                    );
                  })}
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, marginLeft: '6px', color: 'var(--ink-2)' }}>
                    ({rating} dari 5 bintang)
                  </span>
                </div>
              </div>

              {/* Row 4: Recommendation details */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '4px' }}>
                  Detail Rekomendasi & Masukan <span style={{ color: 'var(--orange-deep)' }}>*</span>
                </label>
                <textarea
                  placeholder="Deskripsikan secara lengkap usulan pengembangan fitur, saran visualisasi baru, penyesuaian fungsionalitas, atau bug yang ingin Anda sampaikan..."
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    background: 'var(--surface-2)',
                    color: 'var(--ink)',
                    lineHeight: '1.4',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'var(--orange-deep)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s var(--ease)',
                  marginTop: '6px'
                }}
                className="hover-opacity"
              >
                <Send size={14} />
                <span>Simpan Rekomendasi ke Database</span>
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
