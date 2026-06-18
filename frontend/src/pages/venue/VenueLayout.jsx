import { useState, useRef, useContext, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getNotifications, markNotificationRead, markAllNotificationsRead, getBookings } from '../../services/venueService'

const COLORS = {
  sidebar: '#1b0f06',
  accent: '#ff5a2c',
  accentLight: '#ffe7dc',
  cream: '#fdf4e9',
  border: '#f0e3d2',
  borderFaint: '#f6ecdf',
  text: '#241407',
  textMuted: '#8a7a68',
  textFaint: '#b3a290',
  white: '#ffffff',
  surface: '#fffaf3',
  green: '#0f7a44',
  greenBg: '#e7f7ee',
  greenFill: '#1f9e6a',
  red: '#c83e16',
  redBg: '#ffe7dc',
  gold: '#ffc93c',
  goldBg: '#fff2d6',
  goldText: '#9a6700',
}

const searchRoutes = [
  { keywords: ['dashboard', 'home', 'overview'], path: '/venue/dashboard', label: 'Dashboard', icon: '⊞' },
  { keywords: ['booking', 'bookings', 'request', 'requests', 'pending'], path: '/venue/bookings', label: 'Bookings', icon: '📅' },
  { keywords: ['venue', 'venues', 'listing', 'listings', 'spaces', 'space', 'my venues'], path: '/venue/listings', label: 'My Venues', icon: '🏛' },
  { keywords: ['analytics', 'reports', 'revenue', 'performance', 'stats', 'statistics'], path: '/venue/analytics', label: 'Analytics', icon: '📊' },
  { keywords: ['profile', 'account', 'settings', 'my profile'], path: '/venue/profile', label: 'My Profile', icon: '👤' },
  { keywords: ['create', 'new listing', 'add venue', 'new venue', 'add'], path: '/venue/create', label: 'New Listing', icon: '➕' },
  { keywords: ['calendar', 'schedule'], path: '/venue/calendar', label: 'Calendar', icon: '📆' },
]

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
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: 42, height: 42, borderRadius: 12,
          border: `1px solid ${COLORS.border}`, background: COLORS.white,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', flexShrink: 0
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 7, right: 7, width: 8, height: 8,
            background: COLORS.accent, borderRadius: '50%', border: '2px solid white'
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '360px', maxHeight: '420px',
          background: COLORS.white, borderRadius: '12px', border: `1px solid ${COLORS.border}`,
          boxShadow: '0 12px 32px rgba(27,15,6,0.18)', zIndex: 300, overflow: 'hidden',
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
                onMouseEnter={e => e.currentTarget.style.background = n.isRead ? COLORS.cream : '#f0d9d0'}
                onMouseLeave={e => e.currentTarget.style.background = n.isRead ? COLORS.white : COLORS.accentLight}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                  background: n.isRead ? 'transparent' : COLORS.accent
                }} />
                <div>
                  <div style={{ fontWeight: n.isRead ? '500' : '700', fontSize: '13px', color: COLORS.text }}>{n.title}</div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: '11px', color: COLORS.textFaint, marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
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

function getInitials(name) {
  if (!name) return 'V'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function VenueLayout({ children, title, subtitle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [logoOpen, setLogoOpen] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [totalBookings, setTotalBookings] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const closeTimer = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return
    const loadStats = () => {
      getBookings({ ownerId: user.id })
        .then(res => {
          const all = res.data
          setPendingCount(all.filter(b => b.status === 'PENDING').length)
          setApprovedCount(all.filter(b => b.status === 'APPROVED').length)
          setTotalBookings(all.length)
        })
        .catch(() => {})
    }
    loadStats()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [user?.id])

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

  const handleSearchChange = (e) => {
    const q = e.target.value
    setSearchQuery(q)
    if (q.trim().length < 2) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }
    const lower = q.toLowerCase()
    const matches = searchRoutes.filter(r =>
      r.keywords.some(k => k.includes(lower) || lower.includes(k))
    )
    setSearchSuggestions(matches)
    setShowSuggestions(matches.length > 0)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchSuggestions.length > 0) {
      navigate(searchSuggestions[0].path)
      setSearchQuery('')
      setShowSuggestions(false)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const showDropdown = logoHovered || logoOpen
  const initials = getInitials(user?.name)

  return (
    <div style={{
      display: 'flex', height: '100vh',
      fontFamily: "'Hanken Grotesk', 'Segoe UI', system-ui, sans-serif",
      background: COLORS.cream, overflow: 'hidden',
      padding: 12, gap: 12, boxSizing: 'border-box'
    }}>

      {/* Sidebar — floating rounded card */}
      <div style={{
        width: sidebarOpen ? 250 : 0,
        flexShrink: 0,
        borderRadius: 20, overflow: 'hidden',
        transition: 'width 0.3s ease',
      }}>
        <div style={{
          width: 250, height: '100%',
          background: COLORS.sidebar,
          display: 'flex', flexDirection: 'column',
          padding: '24px 18px', overflowY: 'auto',
          boxSizing: 'border-box',
        }}>

          {/* Logo block */}
          <div
            style={{ marginBottom: 20, position: 'relative', flexShrink: 0 }}
            onMouseEnter={handleLogoMouseEnter}
            onMouseLeave={handleLogoMouseLeave}
          >
            <div
              onClick={() => setLogoOpen(prev => !prev)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            >
              <div style={{
                width: 40, height: 40, background: COLORS.accent, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <span style={{ color: COLORS.sidebar, fontWeight: 800, fontSize: 20, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>V</span>
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 19, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", whiteSpace: 'nowrap', lineHeight: 1.2 }}>Venuely</div>
                <div style={{ color: '#8a7466', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Venue Owner</div>
              </div>
              <div style={{
                marginLeft: 'auto', color: 'rgba(255,255,255,0.35)', fontSize: 10,
                transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>▼</div>
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div
                onMouseEnter={handleLogoMouseEnter}
                onMouseLeave={handleLogoMouseLeave}
                style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
                  background: COLORS.white, borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: '0 8px 24px rgba(27,15,6,0.2)',
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
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', color: COLORS.text, textDecoration: 'none', fontSize: 14, borderRadius: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = COLORS.cream}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span>{item.icon}</span> {item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop: `1px solid ${COLORS.border}`, margin: '4px 0' }} />
                  <button
                    onClick={() => { logout(); navigate('/login') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: COLORS.red, borderRadius: 8, textAlign: 'left', fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.redBg}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    🚪 Log out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu label */}
          <div style={{ color: '#6b574a', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, flexShrink: 0 }}>
            Menu
          </div>

          {/* Nav items */}
          <nav style={{ flexShrink: 0 }}>
            {navItems.map(item => {
              const isActive = location.pathname === item.path
              return (
                <div
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 13,
                    padding: '11px 14px', borderRadius: 13, marginBottom: 3,
                    cursor: 'pointer',
                    color: isActive ? '#ffffff' : '#c9b9a8',
                    background: isActive ? COLORS.accent : 'transparent',
                    fontWeight: isActive ? 600 : 500, fontSize: 15,
                    transition: 'all 0.15s', whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                  {item.path === '/venue/bookings' && pendingCount > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      background: isActive ? 'rgba(255,255,255,0.25)' : COLORS.accent,
                      color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      padding: '2px 7px', minWidth: 18, textAlign: 'center'
                    }}>{pendingCount}</span>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Promo card with real stats */}
          <div style={{
            background: '#2a1810', borderRadius: 16, padding: 16,
            marginTop: 'auto', marginBottom: 14, flexShrink: 0
          }}>
            <div style={{ color: COLORS.gold, fontSize: 13, fontWeight: 700, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Live Stats
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#a8917f', fontSize: 12 }}>Total bookings</span>
                <span style={{ color: '#e8d5c4', fontSize: 14, fontWeight: 700 }}>{totalBookings}</span>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#a8917f', fontSize: 12 }}>Confirmed</span>
                <span style={{ color: COLORS.greenFill, fontSize: 14, fontWeight: 700 }}>{approvedCount}</span>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#a8917f', fontSize: 12 }}>Awaiting you</span>
                <span style={{ color: COLORS.accent, fontSize: 14, fontWeight: 700 }}>{pendingCount}</span>
              </div>
            </div>
          </div>

          {/* User chip — clickable, goes to profile */}
          <div
            onClick={() => navigate('/venue/profile')}
            style={{ borderTop: '1px solid #2e1d12', paddingTop: 14, flexShrink: 0, cursor: 'pointer' }}
            title="My Profile"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: COLORS.gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, color: COLORS.sidebar, flexShrink: 0
              }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ color: '#e8d5c4', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name}
                </div>
                <div style={{ color: '#8a7466', fontSize: 11 }}>Venue owner · View profile →</div>
              </div>
            </div>
          </div>

          {/* New Listing button */}
          <button
            onClick={() => navigate('/venue/create')}
            style={{
              width: '100%', padding: '0.85rem', background: COLORS.accent,
              color: '#ffffff', border: 'none', borderRadius: 11,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, whiteSpace: 'nowrap', marginTop: 10, flexShrink: 0,
              boxShadow: '0 6px 16px rgba(255,90,44,.32)', fontFamily: 'inherit'
            }}
          >
            + New Listing
          </button>
        </div>
      </div>

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header — floats on cream, no box background */}
        <div style={{
          height: 72, flexShrink: 0,
          padding: '0 8px 0 0', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              style={{
                width: 36, height: 36, borderRadius: 9,
                border: `1px solid ${COLORS.border}`, background: COLORS.white,
                cursor: 'pointer', fontSize: 15, color: COLORS.textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}
            >
              {sidebarOpen ? '◀' : '☰'}
            </button>
            <div>
              <h1 style={{
                margin: 0, fontSize: 25, fontWeight: 800, color: COLORS.text, lineHeight: 1.1,
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
              }}>{title}</h1>
              {subtitle && (
                <div style={{ fontSize: 13.5, color: COLORS.textMuted, marginTop: 2 }}>{subtitle}</div>
              )}
            </div>
          </div>

          {/* Right cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search with suggestions */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={COLORS.textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                placeholder="Search pages…"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => { if (searchQuery.length >= 2 && searchSuggestions.length > 0) setShowSuggestions(true) }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                style={{
                  width: 230, height: 40, paddingLeft: 32, paddingRight: 12,
                  background: COLORS.white, border: `1px solid ${COLORS.border}`,
                  borderRadius: 12, fontSize: 13.5, color: COLORS.text, outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              {showSuggestions && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  background: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`,
                  boxShadow: '0 8px 24px rgba(27,15,6,0.15)', zIndex: 400, overflow: 'hidden'
                }}>
                  {searchSuggestions.map(s => (
                    <div
                      key={s.path}
                      onMouseDown={() => { navigate(s.path); setSearchQuery(''); setShowSuggestions(false) }}
                      style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13.5, color: COLORS.text, display: 'flex', alignItems: 'center', gap: 10 }}
                      onMouseEnter={e => e.currentTarget.style.background = COLORS.cream}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: 15 }}>{s.icon}</span>
                      <span style={{ fontWeight: 500 }}>{s.label}</span>
                      <span style={{ marginLeft: 'auto', color: COLORS.textFaint, fontSize: 11 }}>↵ Enter</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <NotificationBell userId={user?.id} />
            <button
              onClick={() => navigate('/venue/create')}
              style={{
                height: 40, padding: '0 18px',
                background: COLORS.accent, color: '#ffffff',
                border: 'none', borderRadius: 12,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(255,90,44,.32)',
                display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap', fontFamily: 'inherit'
              }}
            >
              + New Listing
            </button>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 8px 24px 0' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export { COLORS }
