import { useState, useRef, useEffect, useCallback, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/venueService'

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
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
  { to: '/organizer/venues',       icon: '🏛️', label: 'Venue Search'        },
  { to: '/organizer/bookings/new', icon: '➕', label: 'Create Booking'       },
  { to: '/organizer/bookings',     icon: '📋', label: 'My Booking Requests'  },
  { to: '/organizer/dashboard',    icon: '📊', label: 'Back to Dashboard'    },
]

export default function OrganizerLayout({ title, subtitle, children }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'OG'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.cream, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: 240,
        background: C.sidebar,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        boxShadow: '4px 0 20px rgba(107,45,14,0.25)',
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: 'rgba(255,255,255,0.1) 1px solid',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.white, letterSpacing: '-0.5px' }}>
            📅 EventHub
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>
            Venue Management
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_LINKS.map(({ to, icon, label }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                  background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: active ? C.white : 'rgba(255,255,255,0.7)',
                  fontWeight: active ? 700 : 500, fontSize: 14,
                  transition: 'background 0.15s, color 0.15s',
                  borderLeft: active ? `3px solid ${C.accent}` : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 16 }}>{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', justifyContent: 'center'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 8, transition: 'background 0.15s, color 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.white; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'transparent' }}
          >
            ← Go Back
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Top bar */}
        <div style={{
          background: C.white,
          borderBottom: `1px solid ${C.border}`,
          padding: '1rem 2rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 50,
          boxShadow: '0 1px 4px rgba(107,45,14,0.07)',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>{title}</h1>
            {subtitle && <p style={{ margin: '2px 0 0', fontSize: 13, color: C.textMuted }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationBell userId={user?.id} />
            <div
              onClick={() => navigate('/organizer/dashboard')}
              title={user?.name}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: C.accent, color: C.white,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >{initials}</div>
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
