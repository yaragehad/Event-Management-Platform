import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VendorSidebar } from '../components/Sidebar';
import { getInvoices } from '../services/api';

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#fdf4e9', fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: '12px', gap: '12px', boxSizing: 'border-box', overflow: 'hidden' },
  main: { flex: 1, padding: '20px 24px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#241407', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" },
  createBtn: { padding: '10px 20px', backgroundColor: '#ff5a2c', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  filterRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #f0e3d2', fontSize: '14px', color: '#241407', backgroundColor: '#fffaf3' },
  card: { backgroundColor: '#ffffff', border: '1px solid #f0e3d2', borderRadius: '14px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(27,15,6,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardTitle: { fontWeight: '700', color: '#241407', fontSize: '15px' },
  cardMeta: { color: '#8a7a68', fontSize: '13px', marginTop: '4px' },
  badge: (status) => ({
    backgroundColor: status === 'PAID' ? '#e7f7ee' : status === 'APPROVED' ? '#e7f7ee' : status === 'PENDING_REVIEW' ? '#ffe7dc' : '#ffe7dc',
    color: status === 'PAID' ? '#0f7a44' : status === 'APPROVED' ? '#0f7a44' : status === 'PENDING_REVIEW' ? '#ff5a2c' : '#c83e16',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  }),
  empty: { textAlign: 'center', color: '#8a7a68', padding: '40px' },
  notification: { backgroundColor: '#e7f7ee', border: '1px solid #0f7a44', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', color: '#0f7a44', fontSize: '13px' },
};

function InvoiceList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (user?.vendorId) {
      getInvoices({ vendorId: user.vendorId })
        .then(r => setInvoices(r.data))
        .catch(() => {});
    }
  }, [user]);

  const filtered = filter === 'ALL' ? invoices : invoices.filter(i => i.status === filter);
  const recentlyReviewed = invoices.filter(i => i.status === 'APPROVED' || i.status === 'PAID');

  return (
    <div style={styles.container}>
      <VendorSidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div style={styles.title}>My Invoices</div>
          <button style={styles.createBtn} onClick={() => navigate('/vendor/invoices/create')}>+ Create Invoice</button>
        </div>

        {recentlyReviewed.length > 0 && (
          <div style={styles.notification}>
            🔔 {recentlyReviewed.length} invoice(s) have been reviewed by the organizer
          </div>
        )}

        <div style={styles.filterRow}>
          <select style={styles.select} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">All Invoices</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        {filtered.length === 0 && <div style={styles.empty}>No invoices found</div>}

        {filtered.map(i => (
          <div key={i.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>Invoice #{i.id} — ${i.amount}</div>
              <span style={styles.badge(i.status)}>{i.status.replace('_', ' ')}</span>
            </div>
            {i.description && <div style={styles.cardMeta}>{i.description}</div>}
            {i.documentName && (
              <div style={{ marginTop: '8px' }}>
                <a
                  href={i.documentData}
                  download={i.documentName}
                  style={{ color: '#C4622D', fontSize: '13px', textDecoration: 'none' }}
                >
                  📎 {i.documentName}
                </a>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

export default InvoiceList;