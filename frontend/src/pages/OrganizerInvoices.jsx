import React, { useEffect, useState } from 'react';
import { OrganizerSidebar } from '../components/Sidebar';
import { getInvoices, updateInvoiceStatus } from '../services/api';

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#fdf4e9', fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: '12px', gap: '12px', boxSizing: 'border-box', overflow: 'hidden' },
  main: { flex: 1, padding: '20px 24px', overflowY: 'auto' },
  title: { fontSize: '24px', fontWeight: '800', color: '#241407', marginBottom: '24px', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" },
  filterRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #f0e3d2', fontSize: '14px', color: '#241407', backgroundColor: '#fffaf3' },
  card: { backgroundColor: '#ffffff', border: '1px solid #f0e3d2', borderRadius: '14px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(27,15,6,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardTitle: { fontWeight: '700', color: '#241407', fontSize: '15px' },
  cardMeta: { color: '#8a7a68', fontSize: '13px', marginTop: '4px' },
  badge: (status) => ({
    backgroundColor: status === 'PAID' ? '#e7f7ee' : status === 'APPROVED' ? '#e7f7ee' : '#ffe7dc',
    color: status === 'PAID' ? '#0f7a44' : status === 'APPROVED' ? '#0f7a44' : '#ff5a2c',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  }),
  btnRow: { display: 'flex', gap: '8px', marginTop: '12px' },
  approveBtn: { padding: '6px 14px', backgroundColor: '#0f7a44', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  paidBtn: { padding: '6px 14px', backgroundColor: '#ff5a2c', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  success: { color: '#0f7a44', backgroundColor: '#e7f7ee', padding: '10px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' },
  empty: { textAlign: 'center', color: '#8a7a68', padding: '40px' },
};

function OrganizerInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getInvoices()
      .then(r => setInvoices(r.data))
      .catch(() => {});
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateInvoiceStatus(id, status);
      setInvoices(invoices.map(i => i.id === id ? { ...i, status } : i));
      setSuccess(`Invoice #${id} marked as ${status}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      alert('Failed to update invoice status');
    }
  };

  const filtered = filter === 'ALL' ? invoices : invoices.filter(i => i.status === filter);

  return (
    <div style={styles.container}>
      <OrganizerSidebar />
      <main style={styles.main}>
        <div style={styles.title}>Vendor Invoices</div>
        {success && <div style={styles.success}>{success}</div>}

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
            <div style={styles.cardMeta}>Vendor: {i.vendor?.companyName}</div>
            <div style={styles.cardMeta}>Contact: {i.vendor?.contactEmail}</div>
           {i.description && <div style={styles.cardMeta}>Description: {i.description}</div>}
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
            {i.status === 'PENDING_REVIEW' && (
              <div style={styles.btnRow}>
                <button style={styles.approveBtn} onClick={() => handleStatusUpdate(i.id, 'APPROVED')}>✓ Approve</button>
                <button style={styles.paidBtn} onClick={() => handleStatusUpdate(i.id, 'PAID')}>Mark as Paid</button>
              </div>
            )}
            {i.status === 'APPROVED' && (
              <div style={styles.btnRow}>
                <button style={styles.paidBtn} onClick={() => handleStatusUpdate(i.id, 'PAID')}>Mark as Paid</button>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

export default OrganizerInvoices;