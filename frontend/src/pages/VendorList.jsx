import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganizerSidebar } from '../components/Sidebar';
import { getVendors } from '../services/api';

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#FBF7F4' },
  main: { marginLeft: '240px', padding: '30px', flex: 1 },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#2C1810', marginBottom: '24px' },
  searchRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  searchInput: { flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #EDE0D9', fontSize: '14px', color: '#2C1810' },
  searchBtn: { padding: '10px 20px', backgroundColor: '#C4622D', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' },
  card: { backgroundColor: '#FFFFFF', border: '1px solid #EDE0D9', borderRadius: '10px', padding: '20px', marginBottom: '12px', cursor: 'pointer' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardTitle: { fontWeight: '600', color: '#2C1810', fontSize: '15px' },
  cardMeta: { color: '#8B6555', fontSize: '13px', marginTop: '4px' },
  viewBtn: { padding: '6px 16px', backgroundColor: '#F5EDE8', color: '#C4622D', border: '1px solid #C4622D', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#8B6555', padding: '40px' },
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