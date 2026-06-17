import { useState, useRef, useContext, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getNotifications, markNotificationRead, markAllNotificationsRead, getBookings } from '../../services/venueService'

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

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function NotificationBell({ userId }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  const load = useCallback(() => {
    if (!userId) return
    getNotifications(userId).then(res => setNotifications(res.data)).catch(() => {})
  }, [userId])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000) // poll for new notifications
    return () => clearInterval(interval)
  }, [load])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      try {
        await markNotificationRead(n.id)
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))
      } catch {}
    }
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(userId)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {}
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(prev => !prev)}
        style={{ fontSize: '20px', cursor: 'pointer', color: COLORS.textMuted, position: 'relative' }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -8, background: COLORS.red, color: COLORS.white,
            borderRadius: '999px', fontSize: '10px', fontWeight: '700', padding: '1px 5px',
            minWidth: '16px', textAlign: 'center', lineHeight: '14px'
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '360px', maxHeight: '420px',
          background: COLORS.white, borderRadius: '12px', border: `1px solid ${COLORS.border}`,
          boxShadow: '0 12px 32px rgba(0,0,0,0.18)', zIndex: 300, overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: COLORS.text }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: COLORS.accent, fontWeight: '600' }}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: COLORS.textMuted, fontSize: '13px' }}>
                No notifications yet.
              </div>
            )}
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}`,
                  cursor: 'pointer', background: n.isRead ? COLORS.white : COLORS.accentLight,
                  display: 'flex', gap: '10px', alignItems: 'flex-start'
                }}
                onMouseEnter={e => e.currentTarget.style.background = n.isRead ? COLORS.cream : '#F0E2D6'}
                onMouseLeave={e => e.currentTarget.style.background = n.isRead ? COLORS.white : COLORS.accentLight}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                  background: n.isRead ? 'transparent' : COLORS.accent
                }} />
                <div>
                  <div style={{ fontWeight: n.isRead ? '500' : '700', fontSize: '13px', color: COLORS.text }}>{n.title}</div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const navItems = [
  { label: 'Dashboard', path: '/venue/dashboard', icon: '⊞' },
  { label: 'My Venues', path: '/venue/listings', icon: '🏛' },
  { label: 'Bookings', path: '/venue/bookings', icon: '📅' },
  { label: 'Analytics', path: '/venue/analytics', icon: '📊' },
  { label: 'My Profile', path: '/venue/profile', icon: '👤' },
]

export default function VenueLayout({ children, title }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [logoOpen, setLogoOpen] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const closeTimer = useRef(null)

  useEffect(() => {
    if (!user?.id) return
    const loadPending = () => {
      getBookings({ ownerId: user.id, status: 'PENDING' })
        .then(res => setPendingCount(res.data.length))
        .catch(() => {})
    }
    loadPending()
    const interval = setInterval(loadPending, 30000)
    return () => clearInterval(interval)
  }, [user?.id])

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
                <div style={{ color: COLORS.white, fontWeight: '700', fontSize: '16px', whiteSpace: 'nowrap' }}>VenueHub</div>
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
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 14 }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{user?.email}</div>
                </div>
                <div style={{ padding: '6px' }}>
                  {[
                    { icon: '🏛', label: 'My Venues', to: '/venue/listings' },
                    { icon: '📅', label: 'My Bookings', to: '/venue/bookings' },
                    { icon: '➕', label: 'New Listing', to: '/venue/create' },
                  ].map(item => (
                    <Link key={item.to} to={item.to}
                      onClick={() => { setLogoOpen(false); setLogoHovered(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', color: COLORS.text, textDecoration: 'none',
                        fontSize: 14, borderRadius: 8,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = COLORS.cream}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span>{item.icon}</span> {item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop: `1px solid ${COLORS.border}`, margin: '4px 0' }} />
                  <button
                    onClick={() => { logout(); navigate('/login') }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 14, color: COLORS.red, borderRadius: 8, textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.redBg}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    🚪 Log out
                  </button>
                </div>
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
                  {item.path === '/venue/bookings' && pendingCount > 0 && (
                    <span style={{
                      marginLeft: 'auto', background: COLORS.accent, color: COLORS.white,
                      borderRadius: '999px', fontSize: '11px', fontWeight: '700',
                      padding: '1px 7px', minWidth: '18px', textAlign: 'center'
                    }}>{pendingCount}</span>
                  )}
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
            <NotificationBell userId={user?.id} />
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