import { useNavigate, useLocation } from 'react-router-dom'

const COLORS = {
  sidebar: '#6B2D0E',
  sidebarHover: '#7D3510',
  sidebarActive: '#8B3A10',
  accent: '#C4622D',
  accentLight: '#F5EDE8',
  cream: '#FBF7F4',
  border: '#EDE0D9',
  text: '#2C1810',
  textMuted: '#8B6555',
  white: '#FFFFFF',
  green: '#2D7A4F',
  greenBg: '#E8F5EE',
  red: '#C0392B',
  redBg: '#FDECEA',
}

const navItems = [
  { label: 'Dashboard', path: '/venue/dashboard', icon: '⊞' },
  { label: 'My Venues', path: '/venue/listings', icon: '🏛' },
  { label: 'Bookings', path: '/venue/bookings', icon: '📅' },
  { label: 'Layout Designer', path: '/venue/layout', icon: '✏️' },
]

export default function VenueLayout({ children, title }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", background: COLORS.cream }}>

      {/* Sidebar */}
      <div style={{
        width: '260px', minHeight: '100vh', background: COLORS.sidebar,
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px', height: '38px', background: 'rgba(255,255,255,0.15)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
            }}>🏛</div>
            <div>
              <div style={{ color: COLORS.white, fontWeight: '700', fontSize: '16px' }}>VenueHub</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Manager</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.7rem 1rem', borderRadius: '8px', marginBottom: '0.25rem',
                  cursor: 'pointer', color: isActive ? COLORS.white : 'rgba(255,255,255,0.7)',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  fontWeight: isActive ? '600' : '400', fontSize: '14px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </div>
            )
          })}
        </nav>

        {/* New Listing Button */}
        <div style={{ padding: '1rem' }}>
          <button
            onClick={() => navigate('/venue/create')}
            style={{
              width: '100%', padding: '0.85rem', background: COLORS.accent,
              color: COLORS.white, border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            + New Listing
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`,
          padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 50
        }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: COLORS.text }}>{title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '20px', cursor: 'pointer', color: COLORS.textMuted }}>🔔</div>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: COLORS.accent, color: COLORS.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer'
            }}>YG</div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '2rem', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export { COLORS }