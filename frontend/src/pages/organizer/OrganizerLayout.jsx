import { Link } from 'react-router-dom'

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f7fb',
    color: '#1f2937',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '1.25rem'
  },
  nav: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1rem',
    flexWrap: 'wrap'
  },
  navLink: {
    textDecoration: 'none',
    background: '#ffffff',
    border: '1px solid #dbe3ef',
    borderRadius: '8px',
    padding: '0.5rem 0.9rem',
    color: '#2a3b53',
    fontWeight: 600,
    fontSize: '14px'
  },
  card: {
    background: '#ffffff',
    border: '1px solid #dbe3ef',
    borderRadius: '12px',
    padding: '1.25rem'
  },
  title: {
    margin: 0,
    marginBottom: '0.3rem'
  },
  subtitle: {
    margin: 0,
    color: '#5f6f87',
    fontSize: '14px'
  }
}

export default function OrganizerLayout({ title, subtitle, children }) {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.nav}>
          <Link to="/organizer/venues" style={styles.navLink}>Venue Search</Link>
          <Link to="/organizer/bookings/new" style={styles.navLink}>Create Booking</Link>
          <Link to="/organizer/bookings" style={styles.navLink}>My Booking Requests</Link>
        </div>

        <div style={styles.card}>
          <h2 style={styles.title}>{title}</h2>
          {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
          <div style={{ marginTop: '1rem' }}>{children}</div>
        </div>
      </div>
    </div>
  )
}
