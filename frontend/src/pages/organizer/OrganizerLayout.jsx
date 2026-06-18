import { useState, useRef, useEffect, useCallback, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/venueService'

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
  sidebar: '#1b0f06',
  accent: '#ff5a2c',
  accentLight: '#ffe7dc',
  cream: '#fdf4e9',
  border: '#f0e3d2',
  text: '#241407',
  textMuted: '#8a7a68',
  white: '#ffffff',
  green: '#0f7a44',
  greenBg: '#e7f7ee',
  red: '#c83e16',
  redBg: '#ffe7dc',
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
    const interval = setInterval(load, 30000)
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
        style={{ fontSize: '20px', cursor: 'pointer', color: C.textMuted, position: 'relative' }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -8, background: C.red, color: C.white,
            borderRadius: '999px', fontSize: '10px', fontWeight: '700', padding: '1px 5px',
            minWidth: '16px', textAlign: 'center', lineHeight: '14px'
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '360px', maxHeight: '420px',
          background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`,
          boxShadow: '0 12px 32px rgba(0,0,0,0.18)', zIndex: 300, overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: C.text }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: C.accent, fontWeight: '600' }}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: C.textMuted, fontSize: '13px' }}>
                No notifications yet.
              </div>
            )}
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
                  cursor: 'pointer', background: n.isRead ? C.white : C.accentLight,
                  display: 'flex', gap: '10px', alignItems: 'flex-start'
                }}
                onMouseEnter={e => e.currentTarget.style.background = n.isRead ? C.cream : '#F0E2D6'}
                onMouseLeave={e => e.currentTarget.style.background = n.isRead ? C.white : C.accentLight}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                  background: n.isRead ? 'transparent' : C.accent
                }} />
                <div>
                  <div style={{ fontWeight: n.isRead ? '500' : '700', fontSize: '13px', color: C.text }}>{n.title}</div>
                  <div style={{ fontSize: '12px', color: C.textMuted, marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: '11px', color: C.textMuted, marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const NAV_LINKS = [
  { to: '/organizer/venues',       icon: '🏛️', label: 'Venue Search',       exact: false },
  { to: '/organizer/bookings/new', icon: '➕', label: 'Create Booking',      exact: true  },
  { to: '/organizer/bookings',     icon: '📋', label: 'My Booking Requests', exact: true  },
  { to: '/organizer/dashboard',    icon: '📊', label: 'Back to Dashboard',   exact: false },
]

export default function OrganizerLayout({ title, subtitle, children }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'OG'

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: C.cream,
      fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      padding: 12, gap: 12, boxSizing: 'border-box', overflow: 'hidden',
    }}>

      {/* ── Sidebar — floating rounded card ──────────────────────────────── */}
      <div style={{ borderRadius: 20, overflow: 'hidden', height: '100%', width: 240, flexShrink: 0 }}>
        <aside style={{
          width: '100%', height: '100%',
          background: C.sidebar,
          display: 'flex', flexDirection: 'column',
          padding: '24px 16px', boxSizing: 'border-box',
          overflowY: 'auto',
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            paddingBottom: 20, borderBottom: '1px solid rgba(255,90,44,0.25)',
            marginBottom: 20, flexShrink: 0,
          }}>
            <div style={{
              width: 36, height: 36, background: C.accent, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 18, color: C.sidebar, flexShrink: 0,
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
            }}>E</div>
            <div>
              <div style={{ color: C.white, fontWeight: 800, fontSize: 18, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", whiteSpace: 'nowrap' }}>EventHub</div>
              <div style={{ color: '#8a7466', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Organizer</div>
            </div>
          </div>

          {/* Menu label */}
          <div style={{ color: '#6b574a', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, flexShrink: 0 }}>
            Menu
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
            {NAV_LINKS.map(({ to, icon, label, exact }) => {
              const active = exact ? pathname === to : (pathname === to || pathname.startsWith(to + '/'))
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px', borderRadius: 12, textDecoration: 'none',
                    background: active ? C.accent : 'transparent',
                    color: active ? C.white : '#c9b9a8',
                    fontWeight: active ? 600 : 500, fontSize: 15,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* User chip */}
          <div style={{ borderTop: '1px solid #2e1d12', paddingTop: 14, marginTop: 'auto', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, color: C.white, flexShrink: 0,
              }}>{initials}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#e8d5c4', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ color: '#8a7466', fontSize: 11 }}>Organizer</div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: 10, padding: '11px 14px',
              background: C.accent, color: C.white,
              border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255,90,44,.35)', fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            ← Go Back
          </button>
        </aside>
      </div>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{
          height: 64, flexShrink: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 8px',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>{title}</h1>
            {subtitle && <p style={{ margin: '2px 0 0', fontSize: 13, color: C.textMuted }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationBell userId={user?.id} />
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 8px 24px 0' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
