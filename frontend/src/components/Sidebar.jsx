import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SB = {
  wrapper: {
    borderRadius: '20px',
    overflow: 'hidden',
    height: 'calc(100vh - 24px)',
    width: '240px',
    flexShrink: 0,
  },
  inner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1b0f06',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    boxSizing: 'border-box',
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
    overflowY: 'auto',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,90,44,0.25)',
    marginBottom: '20px',
    flexShrink: 0,
  },
  logoIcon: {
    width: 36, height: 36,
    background: '#ff5a2c',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 18, color: '#1b0f06',
    flexShrink: 0,
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '18px',
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
    whiteSpace: 'nowrap',
  },
  menuLabel: {
    color: '#6b574a',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '8px',
    flexShrink: 0,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flexShrink: 0,
  },
  logoutBtn: {
    marginTop: 'auto',
    padding: '11px 14px',
    backgroundColor: '#ff5a2c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(255,90,44,.35)',
    fontFamily: 'inherit',
    flexShrink: 0,
    marginTop: 16,
  },
};

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      style={{
        display: 'block',
        padding: '11px 14px',
        color: isActive ? '#ffffff' : '#c9b9a8',
        textDecoration: 'none',
        fontSize: '15px',
        borderRadius: '12px',
        fontWeight: isActive ? 600 : 500,
        background: isActive ? '#ff5a2c' : 'transparent',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </Link>
  );
}

const VendorSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={SB.wrapper}>
      <div style={SB.inner}>
        <div style={SB.logoRow}>
          <div style={SB.logoIcon}>V</div>
          <div style={SB.logoText}>VendorHub</div>
        </div>
        <div style={SB.menuLabel}>Menu</div>
        <nav style={SB.nav}>
          <NavLink to="/vendor/dashboard">Dashboard</NavLink>
          <NavLink to="/vendor/profile">My Profile</NavLink>
          <NavLink to="/vendor/requests">Sourcing Requests</NavLink>
          <NavLink to="/vendor/deliveries">Deliveries</NavLink>
          <NavLink to="/vendor/invoices">Invoices</NavLink>
        </nav>
        <button style={SB.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Logout</button>
      </div>
    </div>
  );
};

const OrganizerSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={SB.wrapper}>
      <div style={SB.inner}>
        <div style={SB.logoRow}>
          <div style={SB.logoIcon}>O</div>
          <div style={SB.logoText}>OrganizerHub</div>
        </div>
        <div style={SB.menuLabel}>Menu</div>
        <nav style={SB.nav}>
          <NavLink to="/organizer/vendors">Vendors</NavLink>
          <NavLink to="/organizer/invoices">Invoices</NavLink>
          <NavLink to="/organizer/venues">Venue Search</NavLink>
          <NavLink to="/organizer/bookings">My Bookings</NavLink>
        </nav>
        <button style={SB.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Logout</button>
      </div>
    </div>
  );
};

export { VendorSidebar, OrganizerSidebar };