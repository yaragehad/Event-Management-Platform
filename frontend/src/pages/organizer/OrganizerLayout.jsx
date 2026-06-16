import { Link, useLocation } from 'react-router-dom'

// ─── Color Palette (matches OrganizerDashboard) ───────────────────────────────
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

const NAV_LINKS = [
  { to: '/organizer/venues',       icon: '🏛️', label: 'Venue Search'        },
  { to: '/organizer/bookings/new', icon: '➕', label: 'Create Booking'       },
  { to: '/organizer/bookings',     icon: '📋', label: 'My Booking Requests'  },
  { to: '/organizer/dashboard',    icon: '📊', label: 'Back to Dashboard'    },
]

export default function OrganizerLayout({ title, subtitle, children }) {
  const { pathname } = useLocation()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.cream, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>

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
            🎪 EventFlow
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
          fontSize: 11, color: 'rgba(255,255,255,0.35)',
          textAlign: 'center',
        }}>
          © 2025 EventFlow Platform
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
            <div style={{ fontSize: 20, cursor: 'pointer', color: C.textMuted }}>🔔</div>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: C.accent, color: C.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>OG</div>
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
