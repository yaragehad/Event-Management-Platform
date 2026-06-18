import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrganizerSidebar } from '../components/Sidebar';
import { getVendorById } from '../services/api';

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#FBF7F4' },
  main: { marginLeft: '240px', padding: '30px', flex: 1 },
  backBtn: { background: 'none', border: 'none', color: '#C4622D', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0 },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#2C1810', marginBottom: '24px' },
  card: { backgroundColor: '#FFFFFF', border: '1px solid #EDE0D9', borderRadius: '10px', padding: '30px', maxWidth: '650px', marginBottom: '20px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#2C1810', marginBottom: '16px' },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #EDE0D9' },
  label: { color: '#8B6555', fontSize: '13px' },
  value: { color: '#2C1810', fontSize: '14px', fontWeight: '500' },
  badge: (color) => ({
    backgroundColor: color === 'green' ? '#E8F5EE' : color === 'red' ? '#FDECEA' : '#F5EDE8',
    color: color === 'green' ? '#2D7A4F' : color === 'red' ? '#C0392B' : '#C4622D',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  }),
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px', borderBottom: '1px solid #EDE0D9', color: '#8B6555', fontSize: '13px' },
  td: { padding: '10px', borderBottom: '1px solid #EDE0D9', color: '#2C1810', fontSize: '14px' },
};

function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    getVendorById(id)
      .then(r => setVendor(r.data))
      .catch(() => {});
  }, [id]);

  if (!vendor) return <div style={{ padding: '40px' }}>Loading...</div>;

  const getStatusColor = (status) => {
    if (['ACCEPTED', 'DELIVERED', 'PAID'].includes(status)) return 'green';
    if (['DECLINED'].includes(status)) return 'red';
    return 'orange';
  };

  return (
    <div style={styles.container}>
      <OrganizerSidebar />
      <main style={styles.main}>
        <button style={styles.backBtn} onClick={() => navigate('/organizer/vendors')}>← Back to Vendors</button>
        <div style={styles.title}>{vendor.companyName}</div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Vendor Details</div>
          <div style={styles.row}>
            <span style={styles.label}>Company Name</span>
            <span style={styles.value}>{vendor.companyName}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Supplies Offered</span>
            <span style={styles.value}>{vendor.suppliesOffered}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Location</span>
            <span style={styles.value}>{vendor.location}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Contact Email</span>
            <span style={styles.value}>{vendor.contactEmail}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Contact Phone</span>
            <span style={styles.value}>{vendor.contactPhone || 'N/A'}</span>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Sourcing Requests</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Delivery Date</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {vendor.requests?.map(r => (
                <tr key={r.id}>
                  <td style={styles.td}>{r.items}</td>
                  <td style={styles.td}>{new Date(r.deliveryDate).toLocaleDateString()}</td>
                  <td style={styles.td}><span style={styles.badge(getStatusColor(r.status))}>{r.status}</span></td>
                </tr>
              ))}
              {(!vendor.requests || vendor.requests.length === 0) && (
                <tr><td style={styles.td} colSpan={3}>No requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default VendorDetail;