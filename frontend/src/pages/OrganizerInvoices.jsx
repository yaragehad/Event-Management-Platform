import React, { useEffect, useState } from 'react';
import { OrganizerSidebar } from '../components/Sidebar';
import { getInvoices, updateInvoiceStatus } from '../services/api';

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#FBF7F4' },
  main: { marginLeft: '240px', padding: '30px', flex: 1 },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#2C1810', marginBottom: '24px' },
  filterRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #EDE0D9', fontSize: '14px', color: '#2C1810', backgroundColor: '#FFFFFF' },
  card: { backgroundColor: '#FFFFFF', border: '1px solid #EDE0D9', borderRadius: '10px', padding: '20px', marginBottom: '12px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardTitle: { fontWeight: '600', color: '#2C1810', fontSize: '15px' },
  cardMeta: { color: '#8B6555', fontSize: '13px', marginTop: '4px' },
  badge: (status) => ({
    backgroundColor: status === 'PAID' ? '#E8F5EE' : status === 'APPROVED' ? '#E8F5EE' : '#F5EDE8',
    color: status === 'PAID' ? '#2D7A4F' : status === 'APPROVED' ? '#2D7A4F' : '#C4622D',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  }),
  btnRow: { display: 'flex', gap: '8px', marginTop: '12px' },
  approveBtn: { padding: '6px 14px', backgroundColor: '#2D7A4F', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
  paidBtn: { padding: '6px 14px', backgroundColor: '#C4622D', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
  success: { color: '#2D7A4F', backgroundColor: '#E8F5EE', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' },
  empty: { textAlign: 'center', color: '#8B6555', padding: '40px' },
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