import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VendorSidebar } from '../components/Sidebar';
import { getInvoices } from '../services/api';

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#FBF7F4' },
  main: { marginLeft: '240px', padding: '30px', flex: 1 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#2C1810' },
  createBtn: { padding: '10px 20px', backgroundColor: '#C4622D', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  filterRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #EDE0D9', fontSize: '14px', color: '#2C1810', backgroundColor: '#FFFFFF' },
  card: { backgroundColor: '#FFFFFF', border: '1px solid #EDE0D9', borderRadius: '10px', padding: '20px', marginBottom: '12px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardTitle: { fontWeight: '600', color: '#2C1810', fontSize: '15px' },
  cardMeta: { color: '#8B6555', fontSize: '13px', marginTop: '4px' },
  badge: (status) => ({
    backgroundColor: status === 'PAID' ? '#E8F5EE' : status === 'APPROVED' ? '#E8F5EE' : status === 'PENDING_REVIEW' ? '#F5EDE8' : '#FDECEA',
    color: status === 'PAID' ? '#2D7A4F' : status === 'APPROVED' ? '#2D7A4F' : status === 'PENDING_REVIEW' ? '#C4622D' : '#C0392B',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  }),
  empty: { textAlign: 'center', color: '#8B6555', padding: '40px' },
  notification: { backgroundColor: '#E8F5EE', border: '1px solid #2D7A4F', borderRadius: '6px', padding: '10px 16px', marginBottom: '16px', color: '#2D7A4F', fontSize: '13px' },
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