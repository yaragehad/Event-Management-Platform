import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const COLORS = {
  sidebar: '#6B2D0E',
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
  { label: 'Analytics', path: '/venue/analytics', icon: '📊' },
  { label: 'My Profile', path: '/venue/profile', icon: '👤' },
]

export default function VenueLayout({ children, title }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [logoOpen, setLogoOpen] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)
  const closeTimer = useRef(null)

  const sidebarWidth = sidebarOpen ? '260px' : '0px'

  const handleLogoMouseEnter = () => {
    clearTimeout(closeTimer.current)
    setLogoHovered(true)
  }

  const handleLogoMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setLogoHovered(false)
      setLogoOpen(false)
    }, 300)
  }

  const showDropdown = logoHovered || logoOpen

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", background: COLORS.cream }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarWidth, minHeight: '100vh', background: COLORS.sidebar,
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, zIndex: 100,
        overflow: 'hidden',
        transition: 'width 0.3s ease'
      }}>
        <div style={{ width: '260px' }}>

          {/* Logo with dropdown */}
          <div
            style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}
            onMouseEnter={handleLogoMouseEnter}
            onMouseLeave={handleLogoMouseLeave}
          >
            <div
              onClick={() => setLogoOpen(prev => !prev)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            >
              <div style={{
                width: '38px', height: '38px', background: 'rgba(255,255,255,0.15)',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0
              }}>🏛</div>
              <div>
                <div style={{ color: COLORS.white, fontWeight: '700', fontSize: '16px', whiteSpace: 'nowrap' }}>EventHub</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Manager</div>
              </div>
              <div style={{
                marginLeft: 'auto', color: 'rgba(255,255,255,0.6)', fontSize: '12px',
                transition: 'transform 0.2s',
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>▼</div>
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div
                onMouseEnter={handleLogoMouseEnter}
                onMouseLeave={handleLogoMouseLeave}
                style={{
                  position: 'absolute', top: '100%', left: '1rem', right: '1rem',
                  background: COLORS.white, borderRadius: '10px',
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 200, overflow: 'hidden'
                }}
              >
              </div>
            )}
          </div>

          {/* Nav items */}
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
                    transition: 'all 0.15s', whiteSpace: 'nowrap'
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
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', whiteSpace: 'nowrap'
              }}
            >
              + New Listing
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        marginLeft: sidebarWidth, flex: 1,
        display: 'flex', flexDirection: 'column',
        transition: 'margin-left 0.3s ease'
      }}>

        {/* Top bar */}
        <div style={{
          background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`,
          padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', position: 'sticky', top: 0, zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Toggle button */}
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                border: `1px solid ${COLORS.border}`, background: COLORS.cream,
                cursor: 'pointer', fontSize: '16px', color: COLORS.text,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {sidebarOpen ? '◀' : '☰'}
            </button>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: COLORS.text }}>{title}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '20px', cursor: 'pointer', color: COLORS.textMuted }}>🔔</div>
            <div
              onClick={() => navigate('/venue/profile')}
              title="My Profile"
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: COLORS.accent, color: COLORS.white,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', cursor: 'pointer'
              }}
            >👤</div>
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