import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganizerSidebar } from '../components/Sidebar';
import { getVendors } from '../services/api';

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#fdf4e9', fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: '12px', gap: '12px', boxSizing: 'border-box', overflow: 'hidden' },
  main: { flex: 1, padding: '20px 24px', overflowY: 'auto' },
  title: { fontSize: '24px', fontWeight: '800', color: '#241407', marginBottom: '24px', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" },
  searchRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  searchInput: { flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0e3d2', fontSize: '14px', color: '#241407', background: '#fffaf3' },
  searchBtn: { padding: '10px 20px', backgroundColor: '#ff5a2c', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  card: { backgroundColor: '#ffffff', border: '1px solid #f0e3d2', borderRadius: '14px', padding: '20px', marginBottom: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(27,15,6,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardTitle: { fontWeight: '700', color: '#241407', fontSize: '15px' },
  cardMeta: { color: '#8a7a68', fontSize: '13px', marginTop: '4px' },
  viewBtn: { padding: '6px 16px', backgroundColor: '#ffe7dc', color: '#ff5a2c', border: '1px solid #ff5a2c', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#8a7a68', padding: '40px' },
};

function VendorList() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getVendors()
      .then(r => setVendors(r.data))
      .catch(() => {});
  }, []);

  const handleSearch = () => {
    getVendors(search)
      .then(r => setVendors(r.data))
      .catch(() => {});
  };

  return (
    <div style={styles.container}>
      <OrganizerSidebar />
      <main style={styles.main}>
        <div style={styles.title}>Vendors</div>
        <div style={styles.searchRow}>
          <input
            style={styles.searchInput}
            placeholder="Search by name, supplies, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button style={styles.searchBtn} onClick={handleSearch}>Search</button>
        </div>

        {vendors.length === 0 && <div style={styles.empty}>No vendors found</div>}

        {vendors.map(v => (
          <div key={v.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>{v.companyName}</div>
              <button style={styles.viewBtn} onClick={() => navigate(`/organizer/vendors/${v.id}`)}>View Details</button>
            </div>
            <div style={styles.cardMeta}>📦 {v.suppliesOffered}</div>
            <div style={styles.cardMeta}>📍 {v.location}</div>
            <div style={styles.cardMeta}>✉ {v.contactEmail}</div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default VendorList;