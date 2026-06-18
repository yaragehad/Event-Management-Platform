import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    backgroundColor: '#6B2D0E',
    color: '#FBF7F4',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    position: 'fixed',
    top: 0,
    left: 0,
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    padding: '0 20px 20px',
    borderBottom: '1px solid #C4622D',
    color: '#FBF7F4',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '20px',
  },
  link: {
    padding: '12px 20px',
    color: '#F5EDE8',
    textDecoration: 'none',
    fontSize: '15px',
    borderLeft: '3px solid transparent',
  },
  logoutBtn: {
    margin: '20px',
    padding: '10px',
    backgroundColor: '#C4622D',
    color: '#FBF7F4',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: 'auto',
  },
};

const VendorSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>🏢 VendorHub</div>
      <nav style={styles.nav}>
        <Link style={styles.link} to="/vendor/dashboard">Dashboard</Link>
        <Link style={styles.link} to="/vendor/profile">My Profile</Link>
        <Link style={styles.link} to="/vendor/requests">Sourcing Requests</Link>
        <Link style={styles.link} to="/vendor/deliveries">Deliveries</Link>
        <Link style={styles.link} to="/vendor/invoices">Invoices</Link>
      </nav>
      <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
    </div>
  );
};

const OrganizerSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>🏢 VendorHub</div>
      <nav style={styles.nav}>
        <Link style={styles.link} to="/organizer/vendors">Vendors</Link>
        <Link style={styles.link} to="/organizer/invoices">Invoices</Link>
      </nav>
      <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
    </div>
  );
};

export { VendorSidebar, OrganizerSidebar };