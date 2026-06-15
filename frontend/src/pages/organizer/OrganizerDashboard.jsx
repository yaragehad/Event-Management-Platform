import { useEffect, useState, useContext, useCallback, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import {
  getDashboardSummary,
  getOrganizerEvents,
  getOrganizerTasks,
  getOrganizerStaff,
  getOrganizerGuests,
  getVendors,
  getEventBudget,
} from '../../services/organizerService'

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

// ─── Nav Sections ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'events', icon: '📅', label: 'Events' },
  { key: 'tasks', icon: '✅', label: 'Tasks' },
  { key: 'budget', icon: '💰', label: 'Budget' },
  { key: 'staff', icon: '👥', label: 'Staff' },
  { key: 'vendors', icon: '🏪', label: 'Vendors' },
  { key: 'guests', icon: '🎟️', label: 'Guests' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const fmtMoney = (n) => `EGP ${Number(n || 0).toLocaleString()}`

function badge(label, bg, color) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 999,
      fontSize: 12, fontWeight: 600, background: bg, color,
    }}>
      {label}
    </span>
  )
}

function statusBadge(status) {
  const map = {
    UPCOMING: [C.accentLight, C.accent],
    ONGOING: [C.greenBg, C.green],
    COMPLETED: ['#EEF2FF', '#3730A3'],
    CANCELLED: [C.redBg, C.red],
    PENDING: ['#FFF8E1', '#B45309'],
    IN_PROGRESS: [C.accentLight, C.accent],
    DONE: [C.greenBg, C.green],
    APPROVED: [C.greenBg, C.green],
    DECLINED: [C.redBg, C.red],
    ATTENDING: [C.greenBg, C.green],
    NOT_ATTENDING: [C.redBg, C.red],
    MAYBE: ['#FFF8E1', '#B45309'],
  }
  const [bg, color] = map[status] || ['#F3F4F6', '#6B7280']
  return badge(status?.replace(/_/g, ' '), bg, color)
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
      padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: 14,
      boxShadow: '0 2px 8px rgba(107,45,14,0.06)',
      transition: 'transform .15s, box-shadow .15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(107,45,14,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(107,45,14,0.06)' }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 12, background: accent || C.accentLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, icon, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{icon}</span> {title}
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${C.accent}, transparent)`, marginTop: 10, borderRadius: 2 }} />
    </div>
  )
}

// ─── Filter Select ────────────────────────────────────────────────────────────
function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
        fontSize: 13, color: C.text, background: C.white, cursor: 'pointer', outline: 'none',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ─── Filter Input ─────────────────────────────────────────────────────────────
function FilterInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
        fontSize: 13, color: C.text, background: C.white, outline: 'none', minWidth: 140,
      }}
    />
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ msg }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>🗂️</div>
      <p style={{ margin: 0, fontSize: 14 }}>{msg}</p>
    </div>
  )
}

// ─── Overview Section ─────────────────────────────────────────────────────────
function OverviewSection({ summary, loading }) {
  if (loading) return <p style={{ color: C.textMuted }}>Loading...</p>
  if (!summary) return <EmptyState msg="No data available." />
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard icon="🗓️" label="Today's Events" value={summary.todayEvents} />
        <StatCard icon="🚀" label="Upcoming Events" value={summary.upcomingEvents} />
        <StatCard icon="⏳" label="Pending Tasks" value={summary.pendingTasks} accent="#FFF8E1" />
        <StatCard icon="🔥" label="Overdue Tasks" value={summary.overdueTasks} accent={C.redBg} />
        <StatCard icon="✅" label="Completed Tasks" value={summary.doneTasks} accent={C.greenBg} />
        <StatCard icon="📬" label="Pending Bookings" value={summary.pendingBookings} />
        <StatCard
          icon="⭐"
          label="Avg Feedback Score"
          value={summary.avgFeedback ? `${summary.avgFeedback}/5` : 'N/A'}
          sub={summary.totalFeedback > 0 ? `👍 ${summary.positiveFeedback} positive · 👎 ${summary.negativeFeedback} negative` : 'No feedback yet'}
        />
      </div>
    </div>
  )
}

// ─── Events Section ───────────────────────────────────────────────────────────
function EventsSection({ organizerId }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getOrganizerEvents(organizerId, {
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      setEvents(res.data)
    } catch { }
    setLoading(false)
  }, [organizerId, statusFilter, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <SectionHeader title="Upcoming Events" icon="📅">
        <FilterSelect value={statusFilter} onChange={setStatusFilter} placeholder="All Statuses"
          options={['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'].map(s => ({ value: s, label: s }))} />
        <FilterInput value={dateFrom} onChange={setDateFrom} placeholder="From date" type="date" />
        <FilterInput value={dateTo} onChange={setDateTo} placeholder="To date" type="date" />
      </SectionHeader>
      {loading ? <p style={{ color: C.textMuted }}>Loading...</p> : events.length === 0 ? <EmptyState msg="No events found." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map(ev => (
            <div key={ev.id} style={{
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
              boxShadow: '0 1px 4px rgba(107,45,14,0.05)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{ev.name}</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 3 }}>
                  📍 {ev.booking?.venue?.name || 'No venue'} &nbsp;·&nbsp; 📆 {fmt(ev.date)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 13, color: C.textMuted }}>
                  👥 {ev._count?.guests} guests &nbsp;·&nbsp;
                  ✅ {ev.tasks?.filter(t => t.status === 'DONE').length}/{ev.tasks?.length} tasks
                </div>
                {statusBadge(ev.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tasks Section ────────────────────────────────────────────────────────────
function TasksSection({ organizerId }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getOrganizerTasks(organizerId, { status: statusFilter || undefined })
      setTasks(res.data)
    } catch { }
    setLoading(false)
  }, [organizerId, statusFilter])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <SectionHeader title="Tasks" icon="✅">
        <FilterSelect value={statusFilter} onChange={setStatusFilter} placeholder="All Statuses"
          options={['PENDING', 'IN_PROGRESS', 'DONE'].map(s => ({ value: s, label: s.replace('_', ' ') }))} />
      </SectionHeader>
      {loading ? <p style={{ color: C.textMuted }}>Loading...</p> : tasks.length === 0 ? <EmptyState msg="No tasks found." /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.cream }}>
                {['Task', 'Event', 'Assigned To', 'Due Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '11px 14px', color: C.text, fontWeight: 500 }}>
                    {t.title}
                    {t.description && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{t.description}</div>}
                  </td>
                  <td style={{ padding: '11px 14px', color: C.textMuted }}>{t.event?.name || '—'}</td>
                  <td style={{ padding: '11px 14px', color: C.textMuted }}>{t.assignee?.user?.name || <span style={{ color: C.border }}>Unassigned</span>}</td>
                  <td style={{ padding: '11px 14px', color: t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE' ? C.red : C.textMuted }}>
                    {fmt(t.dueDate)}
                  </td>
                  <td style={{ padding: '11px 14px' }}>{statusBadge(t.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Budget Section ───────────────────────────────────────────────────────────
function BudgetSection({ organizerId }) {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(true)

  useEffect(() => {
    getOrganizerEvents(organizerId)
      .then(r => { setEvents(r.data); if (r.data[0]) setSelectedEventId(String(r.data[0].id)) })
      .finally(() => setEventsLoading(false))
  }, [organizerId])

  useEffect(() => {
    if (!selectedEventId) return
    setLoading(true)
    setBudget(null)
    getEventBudget(selectedEventId)
      .then(r => setBudget(r.data))
      .catch(() => setBudget(null))
      .finally(() => setLoading(false))
  }, [selectedEventId])

  return (
    <div>
      <SectionHeader title="Budget" icon="💰">
        {!eventsLoading && (
          <FilterSelect value={selectedEventId} onChange={setSelectedEventId} placeholder="Select event"
            options={events.map(e => ({ value: String(e.id), label: e.name }))} />
        )}
      </SectionHeader>
      {loading && <p style={{ color: C.textMuted }}>Loading budget...</p>}
      {!loading && !budget && <EmptyState msg="No budget set for this event." />}
      {!loading && budget && (
        <div>
          {/* Summary bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
            <StatCard icon="📋" label="Planned Budget" value={fmtMoney(budget.totalPlanned)} />
            <StatCard icon="💸" label="Actual Spent" value={fmtMoney(budget.totalActual)} accent={C.redBg} />
            <StatCard icon="📈" label="Remaining" value={fmtMoney(budget.difference)} accent={budget.difference >= 0 ? C.greenBg : C.redBg} />
          </div>

          {/* Progress bar */}
          {budget.totalPlanned > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>
                <span>Budget used</span>
                <span>{Math.min(100, Math.round((budget.totalActual / budget.totalPlanned) * 100))}%</span>
              </div>
              <div style={{ height: 10, background: C.border, borderRadius: 99 }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${Math.min(100, (budget.totalActual / budget.totalPlanned) * 100)}%`,
                  background: budget.totalActual > budget.totalPlanned ? C.red : C.accent,
                  transition: 'width .5s ease',
                }} />
              </div>
            </div>
          )}

          {/* Breakdown table */}
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>Planned Breakdown</h3>
          {budget.items.length === 0 ? <p style={{ color: C.textMuted, fontSize: 14 }}>No budget items.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: C.cream }}>
                    {['Category', 'Description', 'Planned'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {budget.items.map(item => (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text }}>{item.category}</td>
                      <td style={{ padding: '10px 14px', color: C.textMuted }}>{item.description || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.text }}>{fmtMoney(item.plannedAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>Actual Expenses</h3>
          {budget.expenses.length === 0 ? <p style={{ color: C.textMuted, fontSize: 14 }}>No expenses recorded.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: C.cream }}>
                    {['Category', 'Description', 'Amount', 'Date'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {budget.expenses.map(exp => (
                    <tr key={exp.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text }}>{exp.category}</td>
                      <td style={{ padding: '10px 14px', color: C.textMuted }}>{exp.description || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.red, fontWeight: 600 }}>{fmtMoney(exp.amount)}</td>
                      <td style={{ padding: '10px 14px', color: C.textMuted }}>{fmt(exp.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Staff Section ────────────────────────────────────────────────────────────
function StaffSection({ organizerId }) {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getOrganizerStaff(organizerId, {
        employmentType: typeFilter || undefined,
        specialty: specialtyFilter || undefined,
      })
      setStaff(res.data)
    } catch { }
    setLoading(false)
  }, [organizerId, typeFilter, specialtyFilter])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <SectionHeader title="Staff" icon="👥">
        <FilterSelect value={typeFilter} onChange={setTypeFilter} placeholder="All Types"
          options={['part-time', 'full-time'].map(s => ({ value: s, label: s }))} />
        <FilterInput value={specialtyFilter} onChange={setSpecialtyFilter} placeholder="Search specialty" />
      </SectionHeader>
      {loading ? <p style={{ color: C.textMuted }}>Loading...</p> : staff.length === 0 ? <EmptyState msg="No staff found." /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.cream }}>
                {['Name', 'Email', 'Event', 'Type', 'Specialty', 'Status', 'Tasks'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text }}>{s.user?.name}</td>
                  <td style={{ padding: '10px 14px', color: C.textMuted }}>{s.user?.email}</td>
                  <td style={{ padding: '10px 14px', color: C.textMuted }}>{s.event?.name || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {s.employmentType ? badge(s.employmentType, C.accentLight, C.accent) : '—'}
                  </td>
                  <td style={{ padding: '10px 14px', color: C.textMuted }}>{s.specialty || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {s.user?.isActive ? badge('Active', C.greenBg, C.green) : badge('Inactive', C.redBg, C.red)}
                  </td>
                  <td style={{ padding: '10px 14px', color: C.textMuted, fontSize: 13 }}>
                    {s.tasks?.filter(t => t.status === 'DONE').length}/{s.tasks?.length} done
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Vendors Section ──────────────────────────────────────────────────────────
function VendorsSection() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getVendors({ search: search || undefined })
      setVendors(res.data)
    } catch { }
    setLoading(false)
  }, [search])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <SectionHeader title="Vendors" icon="🏪">
        <FilterInput value={search} onChange={setSearch} placeholder="Search vendors..." />
      </SectionHeader>
      {loading ? <p style={{ color: C.textMuted }}>Loading...</p> : vendors.length === 0 ? <EmptyState msg="No vendors found." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {vendors.map(v => (
            <div key={v.id} style={{
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px',
              boxShadow: '0 1px 4px rgba(107,45,14,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{v.companyName}</div>
                {v.user?.isActive ? badge('Active', C.greenBg, C.green) : badge('Inactive', C.redBg, C.red)}
              </div>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>🛒 {v.suppliesOffered}</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>📍 {v.location}</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>✉️ {v.contactEmail}</div>
              {v.contactPhone && <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>📞 {v.contactPhone}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 10, fontSize: 13, color: C.textMuted }}>
                <span>📦 {v.requests?.length} requests</span>
                <span>🧾 {v.invoices?.length} invoices</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Guests Section ───────────────────────────────────────────────────────────
function GuestsSection({ organizerId }) {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rsvpFilter, setRsvpFilter] = useState('')
  const [events, setEvents] = useState([])
  const [eventFilter, setEventFilter] = useState('')

  useEffect(() => {
    getOrganizerEvents(organizerId).then(r => setEvents(r.data))
  }, [organizerId])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getOrganizerGuests(organizerId, {
        search: search || undefined,
        rsvpStatus: rsvpFilter || undefined,
        eventId: eventFilter || undefined,
      })
      setGuests(res.data)
    } catch { }
    setLoading(false)
  }, [organizerId, search, rsvpFilter, eventFilter])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <SectionHeader title="Guests" icon="🎟️">
        <FilterInput value={search} onChange={setSearch} placeholder="Search guests..." />
        <FilterSelect value={eventFilter} onChange={setEventFilter} placeholder="All Events"
          options={events.map(e => ({ value: String(e.id), label: e.name }))} />
        <FilterSelect value={rsvpFilter} onChange={setRsvpFilter} placeholder="All RSVPs"
          options={['ATTENDING', 'NOT_ATTENDING', 'MAYBE', 'PENDING'].map(s => ({ value: s, label: s.replace('_', ' ') }))} />
      </SectionHeader>
      {loading ? <p style={{ color: C.textMuted }}>Loading...</p> : guests.length === 0 ? <EmptyState msg="No guests found." /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.cream }}>
                {['Name', 'Email', 'Dietary Pref.', 'RSVP', 'Check-In'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guests.map(g => (
                <tr key={g.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text }}>{g.user?.name}</td>
                  <td style={{ padding: '10px 14px', color: C.textMuted }}>{g.user?.email}</td>
                  <td style={{ padding: '10px 14px', color: C.textMuted }}>{g.dietaryPreference || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {g.rsvps?.[0] ? statusBadge(g.rsvps[0].status) : badge('No RSVP', '#F3F4F6', '#6B7280')}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {g.checkInStatus ? badge('Checked In', C.greenBg, C.green) : badge('Pending', C.cream, C.textMuted)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function OrganizerDashboard() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [logoHovered, setLogoHovered] = useState(false)
  const [logoOpen, setLogoOpen] = useState(false)
  const closeTimer = useRef(null)

  useEffect(() => {
    if (!user || user.role !== 'ORGANIZER') { navigate('/login'); return }
    setSummaryLoading(true)
    getDashboardSummary(user.id)
      .then(r => setSummary(r.data))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false))
  }, [user, navigate])

  const handleLogout = () => { logout(); navigate('/login') }

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

  const sidebarWidth = sidebarOpen ? '260px' : '0px'

  // derive initials from user name
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'O'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", background: C.cream }}>

      {/* ── Sidebar (fixed) ───────────────────────────────────────────────── */}
      <div style={{
        width: sidebarWidth, minHeight: '100vh', background: C.sidebar,
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, zIndex: 100,
        overflow: 'hidden',
        transition: 'width 0.3s ease',
      }}>
        <div style={{ width: '260px' }}>

          {/* Logo with hover dropdown */}
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
                fontSize: '18px', flexShrink: 0,
              }}>🏛</div>
              <div>
                <div style={{ color: C.white, fontWeight: '700', fontSize: '16px', whiteSpace: 'nowrap' }}>EventHub</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Organizer</div>
              </div>
              <div style={{
                marginLeft: 'auto', color: 'rgba(255,255,255,0.6)', fontSize: '12px',
                transition: 'transform 0.2s',
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>▼</div>
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div
                onMouseEnter={handleLogoMouseEnter}
                onMouseLeave={handleLogoMouseLeave}
                style={{
                  position: 'absolute', top: '100%', left: '1rem', right: '1rem',
                  background: C.white, borderRadius: '10px',
                  border: `1px solid ${C.border}`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 200, overflow: 'hidden',
                }}
              >
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{user?.email}</div>
                </div>
                <div style={{ padding: '6px' }}>
                  {[
                    { icon: '🏛️', label: 'Browse Venues', to: '/organizer/venues' },
                    { icon: '📋', label: 'My Bookings', to: '/organizer/bookings' },
                    { icon: '➕', label: 'New Booking', to: '/organizer/bookings/new' },
                  ].map(item => (
                    <Link key={item.to} to={item.to}
                      onClick={() => { setLogoOpen(false); setLogoHovered(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', color: C.text, textDecoration: 'none',
                        fontSize: 14, borderRadius: 8,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = C.cream}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span>{item.icon}</span> {item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop: `1px solid ${C.border}`, margin: '4px 0' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 14, color: C.red, borderRadius: 8, textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = C.redBg}
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
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.key
              return (
                <div
                  key={item.key}
                  id={`nav-${item.key}`}
                  onClick={() => setActiveSection(item.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.7rem 1rem', borderRadius: '8px', marginBottom: '0.25rem',
                    cursor: 'pointer', color: isActive ? C.white : 'rgba(255,255,255,0.7)',
                    background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                    fontWeight: isActive ? '600' : '400', fontSize: '14px',
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
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

          {/* New Event CTA Button */}
          <div style={{ padding: '1rem' }}>
            <button
              onClick={() => navigate('/organizer/bookings/new')}
              style={{
                width: '100%', padding: '0.85rem', background: C.accent,
                color: C.white, border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', whiteSpace: 'nowrap',
              }}
            >
              + New Booking
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content (shifts with margin) ────────────────────────────── */}
      <div style={{
        marginLeft: sidebarWidth, flex: 1,
        display: 'flex', flexDirection: 'column',
        transition: 'margin-left 0.3s ease',
      }}>

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div style={{
          background: C.white, borderBottom: `1px solid ${C.border}`,
          padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Toggle ◀ / ☰ */}
            <button
              id="sidebar-toggle"
              onClick={() => setSidebarOpen(prev => !prev)}
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                border: `1px solid ${C.border}`, background: C.cream,
                cursor: 'pointer', fontSize: '16px', color: C.text,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {sidebarOpen ? '◀' : '☰'}
            </button>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: C.text }}>
              {NAV_ITEMS.find(n => n.key === activeSection)?.label || 'Dashboard'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '20px', cursor: 'pointer', color: C.textMuted }}>🔔</div>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: C.accent, color: C.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            }}>{initials}</div>
          </div>
        </div>

        {/* ── Page content ─────────────────────────────────────────────────── */}
        <div style={{ padding: '2rem', flex: 1 }}>
          {/* Welcome banner — overview only */}
          {activeSection === 'overview' && (
            <div style={{
              background: `linear-gradient(135deg, ${C.sidebar} 0%, ${C.accent} 100%)`,
              borderRadius: 16, padding: '24px 28px', marginBottom: 28, color: C.white,
              boxShadow: '0 4px 20px rgba(107,45,14,0.25)',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
              </div>
              <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 14, opacity: 0.9 }}>🗓️ <strong>{summary?.todayEvents ?? '…'}</strong> events today</div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>⏳ <strong>{summary?.pendingTasks ?? '…'}</strong> pending tasks</div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>⭐ <strong>{summary?.avgFeedback ?? 'N/A'}</strong> avg rating</div>
              </div>
            </div>
          )}

          {/* Sections */}
          {activeSection === 'overview' && <OverviewSection summary={summary} loading={summaryLoading} />}
          {activeSection === 'events' && <EventsSection organizerId={user?.id} />}
          {activeSection === 'tasks' && <TasksSection organizerId={user?.id} />}
          {activeSection === 'budget' && <BudgetSection organizerId={user?.id} />}
          {activeSection === 'staff' && <StaffSection organizerId={user?.id} />}
          {activeSection === 'vendors' && <VendorsSection />}
          {activeSection === 'guests' && <GuestsSection organizerId={user?.id} />}
        </div>
      </div>
    </div>
  )
}


