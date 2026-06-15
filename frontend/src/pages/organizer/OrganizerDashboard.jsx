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
  toggleUserActive,
  createStakeholderAccount,
  updateOrganizerProfile,
  createOrUpdateBudget,
  addBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  addExpense,
  updateExpense,
  deleteExpense,
  createTask,
  updateTask,
  getOrganizerSourcingRequests,
  createSourcingRequest,
  getOrganizerInvoices,
  updateInvoiceStatus,
  getDayOfDashboard,
  sendMessage,
  getOrganizerFeedback,
  getEventReport,
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
  { key: 'sourcing', icon: '📦', label: 'Sourcing' },
  { key: 'guests', icon: '🏟️', label: 'Guests' },
  { key: 'dayof', icon: '📡', label: 'Day-Of Ops' },
  { key: 'reports', icon: '📈', label: 'Reports' },
  { key: 'accounts', icon: '👤', label: 'Accounts' },
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

// ── Reusable Btn ──────────────────────────────────────────────────────────────
function Btn({ children, onClick, type = 'button', variant = 'primary', small, disabled, style: extra }) {
  const base = {
    padding: small ? '4px 12px' : '8px 18px', borderRadius: 8, border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer', fontSize: small ? 12 : 14,
    fontWeight: 600, transition: 'opacity .15s', opacity: disabled ? 0.6 : 1, ...extra,
  }
  const v = {
    primary:  { background: C.accent,  color: C.white },
    danger:   { background: C.redBg,   color: C.red   },
    ghost:    { background: C.cream,   color: C.text,  border: `1px solid ${C.border}` },
    success:  { background: C.greenBg, color: C.green  },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...v[variant] }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = '0.8')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
      {children}
    </button>
  )
}

// Inline form card
function FormCard({ title, onClose, children }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px', marginBottom: 16, boxShadow: '0 4px 16px rgba(107,45,14,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{title}</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.textMuted, lineHeight: 1 }}>×</button>
      </div>
      {children}
    </div>
  )
}

// Label + input wrapper
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 2 }}>
      <label style={{ display: 'block', fontSize: 12, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  )
}

// Shared input style
const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: `1px solid ${C.border}`, fontSize: 14, color: C.text,
  outline: 'none', boxSizing: 'border-box', background: C.white,
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
                {ev.booking?.venue?.id && (
                  <Btn small variant="ghost" onClick={() => window.open(`/venue-layout/${ev.booking.venue.id}`, '_blank')}>🗺️ Design Layout</Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tasks Section (enhanced) ─────────────────────────────────────────────────
function TasksSection({ organizerId }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [events, setEvents] = useState([])
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', eventId: '', assigneeId: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getOrganizerTasks(organizerId, { status: statusFilter || undefined })
      setTasks(res.data)
    } catch { }
    setLoading(false)
  }, [organizerId, statusFilter])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (organizerId) {
      getOrganizerEvents(organizerId).then(r => setEvents(r.data))
      getOrganizerStaff(organizerId).then(r => setStaff(r.data))
    }
  }, [organizerId])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await createTask({ ...form, eventId: parseInt(form.eventId), assigneeId: form.assigneeId ? parseInt(form.assigneeId) : null })
      setTasks(prev => [res.data, ...prev])
      setShowForm(false)
      setForm({ title: '', description: '', dueDate: '', eventId: '', assigneeId: '' })
    } catch { }
    setSaving(false)
  }

  const handleAssign = async (taskId, assigneeId) => {
    try {
      const res = await updateTask(taskId, { assigneeId: assigneeId ? parseInt(assigneeId) : null })
      setTasks(prev => prev.map(t => t.id === taskId ? res.data : t))
    } catch { }
  }

  const handleStatus = async (taskId, status) => {
    try {
      const res = await updateTask(taskId, { status })
      setTasks(prev => prev.map(t => t.id === taskId ? res.data : t))
    } catch { }
  }

  const thStyle = { padding: '10px 14px', textAlign: 'left', color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }

  return (
    <div>
      <SectionHeader title="Tasks" icon="✅">
        <FilterSelect value={statusFilter} onChange={setStatusFilter} placeholder="All Statuses"
          options={['PENDING', 'IN_PROGRESS', 'DONE'].map(s => ({ value: s, label: s.replace('_', ' ') }))} />
        <Btn onClick={() => setShowForm(p => !p)}>+ New Task</Btn>
      </SectionHeader>

      {showForm && (
        <FormCard title="Create New Task" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="Title *"><input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} /></Field>
              <Field label="Due Date"><input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} style={inputStyle} /></Field>
              <Field label="Event *">
                <select required value={form.eventId} onChange={e => setForm(p => ({ ...p, eventId: e.target.value }))} style={inputStyle}>
                  <option value="">Select event</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </Field>
              <Field label="Assign To">
                <select value={form.assigneeId} onChange={e => setForm(p => ({ ...p, assigneeId: e.target.value }))} style={inputStyle}>
                  <option value="">Unassigned</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.user?.name} ({s.specialty || 'Staff'})</option>)}
                </select>
              </Field>
              <div style={{ gridColumn: '1/-1' }}>
                <Field label="Description"><input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={inputStyle} /></Field>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Task'}</Btn>
              <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
            </div>
          </form>
        </FormCard>
      )}

      {loading ? <p style={{ color: C.textMuted }}>Loading...</p> : tasks.length === 0 ? <EmptyState msg="No tasks found." /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.cream }}>
                {['Task', 'Event', 'Assign To', 'Due Date', 'Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}
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
                  <td style={{ padding: '11px 14px' }}>
                    <select value={t.assigneeId || ''} onChange={e => handleAssign(t.id, e.target.value)}
                      style={{ ...inputStyle, padding: '4px 8px', minWidth: 140 }}>
                      <option value="">Unassigned</option>
                      {staff.map(s => <option key={s.id} value={s.id}>{s.user?.name}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '11px 14px', color: t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE' ? C.red : C.textMuted }}>
                    {fmt(t.dueDate)}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <select value={t.status} onChange={e => handleStatus(t.id, e.target.value)}
                      style={{ ...inputStyle, padding: '4px 8px', minWidth: 110,
                        background: t.status === 'DONE' ? C.greenBg : t.status === 'IN_PROGRESS' ? C.accentLight : C.cream,
                        color: t.status === 'DONE' ? C.green : t.status === 'IN_PROGRESS' ? C.accent : C.text }}>
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
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



// ─── Budget Section (enhanced) ────────────────────────────────────────────────
function BudgetSection({ organizerId }) {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [showItemForm, setShowItemForm] = useState(false)
  const [showExpForm, setShowExpForm] = useState(false)
  const [totalForm, setTotalForm] = useState('')
  const [itemForm, setItemForm] = useState({ category: '', description: '', plannedAmount: '' })
  const [expForm, setExpForm] = useState({ category: '', description: '', amount: '', date: '' })

  const loadBudget = useCallback(async (eventId) => {
    if (!eventId) return
    setLoading(true)
    try {
      const res = await getEventBudget(eventId)
      setBudget(res.data)
      setTotalForm(res.data.totalPlanned)
    } catch {
      setBudget(null)
      setTotalForm('')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    getOrganizerEvents(organizerId)
      .then(r => { setEvents(r.data); if (r.data[0]) setSelectedEventId(String(r.data[0].id)) })
      .finally(() => setEventsLoading(false))
  }, [organizerId])

  useEffect(() => {
    loadBudget(selectedEventId)
  }, [selectedEventId, loadBudget])

  const handleUpdateTotal = async () => {
    try {
      const res = await createOrUpdateBudget(selectedEventId, { totalPlanned: parseFloat(totalForm) })
      setBudget(res.data)
    } catch { }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    try {
      await addBudgetItem(selectedEventId, { ...itemForm, plannedAmount: parseFloat(itemForm.plannedAmount) })
      loadBudget(selectedEventId)
      setShowItemForm(false)
      setItemForm({ category: '', description: '', plannedAmount: '' })
    } catch { }
  }

  const handleAddExp = async (e) => {
    e.preventDefault()
    try {
      await addExpense(selectedEventId, { ...expForm, amount: parseFloat(expForm.amount) })
      loadBudget(selectedEventId)
      setShowExpForm(false)
      setExpForm({ category: '', description: '', amount: '', date: '' })
    } catch { }
  }

  const handleDeleteItem = async (id) => {
    try { await deleteBudgetItem(id); loadBudget(selectedEventId) } catch { }
  }

  const handleDeleteExp = async (id) => {
    try { await deleteExpense(id); loadBudget(selectedEventId) } catch { }
  }

  const thStyle = { padding: '10px 14px', textAlign: 'left', color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }

  return (
    <div>
      <SectionHeader title="Budget" icon="💰">
        {!eventsLoading && (
          <FilterSelect value={selectedEventId} onChange={setSelectedEventId} placeholder="Select event"
            options={events.map(e => ({ value: String(e.id), label: e.name }))} />
        )}
      </SectionHeader>

      {loading && <p style={{ color: C.textMuted }}>Loading budget...</p>}

      {!loading && !budget && selectedEventId && (
        <EmptyState msg="No budget set for this event." />
      )}

      {!loading && selectedEventId && (
        <div style={{ marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <Field label="Total Planned Budget (EGP)">
            <input type="number" value={totalForm} onChange={e => setTotalForm(e.target.value)} style={{ ...inputStyle, width: 200 }} />
          </Field>
          <Btn onClick={handleUpdateTotal}>Save Total</Btn>
        </div>
      )}

      {!loading && budget && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
            <StatCard icon="📋" label="Planned Budget" value={fmtMoney(budget.totalPlanned)} />
            <StatCard icon="💸" label="Actual Spent" value={fmtMoney(budget.totalActual)} accent={C.redBg} />
            <StatCard icon="📈" label="Remaining" value={fmtMoney(budget.difference)} accent={budget.difference >= 0 ? C.greenBg : C.redBg} />
          </div>

          {budget.totalPlanned > 0 && (
            <div style={{ marginBottom: 30 }}>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Planned Breakdown</h3>
            <Btn small onClick={() => setShowItemForm(p => !p)}>+ Add Item</Btn>
          </div>

          {showItemForm && (
            <FormCard title="Add Budget Item" onClose={() => setShowItemForm(false)}>
              <form onSubmit={handleAddItem}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <Field label="Category *"><input required value={itemForm.category} onChange={e => setItemForm(p => ({ ...p, category: e.target.value }))} style={inputStyle} /></Field>
                  <Field label="Amount *"><input required type="number" value={itemForm.plannedAmount} onChange={e => setItemForm(p => ({ ...p, plannedAmount: e.target.value }))} style={inputStyle} /></Field>
                  <Field label="Description"><input value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} style={inputStyle} /></Field>
                </div>
                <Btn type="submit" small>Save Item</Btn>
              </form>
            </FormCard>
          )}

          {budget.items.length === 0 ? <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 20 }}>No budget items.</p> : (
            <div style={{ overflowX: 'auto', marginBottom: 30 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: C.cream }}>
                    {['Category', 'Description', 'Planned', ''].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {budget.items.map(item => (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text }}>{item.category}</td>
                      <td style={{ padding: '10px 14px', color: C.textMuted }}>{item.description || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.text }}>{fmtMoney(item.plannedAmount)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <Btn variant="danger" small onClick={() => handleDeleteItem(item.id)}>Delete</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Actual Expenses</h3>
            <Btn small onClick={() => setShowExpForm(p => !p)}>+ Add Expense</Btn>
          </div>

          {showExpForm && (
            <FormCard title="Add Expense" onClose={() => setShowExpForm(false)}>
              <form onSubmit={handleAddExp}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <Field label="Category *"><input required value={expForm.category} onChange={e => setExpForm(p => ({ ...p, category: e.target.value }))} style={inputStyle} /></Field>
                  <Field label="Amount *"><input required type="number" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} style={inputStyle} /></Field>
                  <Field label="Date"><input type="date" value={expForm.date} onChange={e => setExpForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} /></Field>
                  <div style={{ gridColumn: '1/-1' }}>
                    <Field label="Description"><input value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} style={inputStyle} /></Field>
                  </div>
                </div>
                <Btn type="submit" small>Save Expense</Btn>
              </form>
            </FormCard>
          )}

          {budget.expenses.length === 0 ? <p style={{ color: C.textMuted, fontSize: 14 }}>No expenses recorded.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: C.cream }}>
                    {['Category', 'Description', 'Amount', 'Date', ''].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {budget.expenses.map(exp => (
                    <tr key={exp.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text }}>{exp.category}</td>
                      <td style={{ padding: '10px 14px', color: C.textMuted }}>{exp.description || '—'}</td>
                      <td style={{ padding: '10px 14px', color: C.red, fontWeight: 600 }}>{fmtMoney(exp.amount)}</td>
                      <td style={{ padding: '10px 14px', color: C.textMuted }}>{fmt(exp.date)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <Btn variant="danger" small onClick={() => handleDeleteExp(exp.id)}>Delete</Btn>
                      </td>
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

  const handleToggle = async (userId) => {
    try {
      const res = await toggleUserActive(userId)
      setStaff(prev => prev.map(s =>
        s.user?.id === userId
          ? { ...s, user: { ...s.user, isActive: res.data.isActive } }
          : s
      ))
    } catch { }
  }

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
                {['Name', 'Email', 'Event', 'Type', 'Specialty', 'Status', 'Tasks', 'Action'].map(h => (
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
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => handleToggle(s.user?.id)}
                      style={{
                        padding: '4px 14px', borderRadius: 6, border: 'none',
                        cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        background: s.user?.isActive ? C.redBg : C.greenBg,
                        color: s.user?.isActive ? C.red : C.green,
                        transition: 'opacity .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {s.user?.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
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

  const handleToggle = async (userId) => {
    try {
      const res = await toggleUserActive(userId)
      setVendors(prev => prev.map(v =>
        v.userId === userId
          ? { ...v, user: { ...v.user, isActive: res.data.isActive } }
          : v
      ))
    } catch { }
  }

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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', gap: 10, fontSize: 13, color: C.textMuted }}>
                  <span>📦 {v.requests?.length} requests</span>
                  <span>🧾 {v.invoices?.length} invoices</span>
                </div>
                <button
                  onClick={() => handleToggle(v.userId)}
                  style={{
                    padding: '4px 14px', borderRadius: 6, border: 'none',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: v.user?.isActive ? C.redBg : C.greenBg,
                    color: v.user?.isActive ? C.red : C.green,
                    transition: 'opacity .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {v.user?.isActive ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sourcing Section ─────────────────────────────────────────────────────────
function SourcingSection({ organizerId }) {
  const [requests, setRequests] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('requests') // 'requests' or 'invoices'

  // Form state
  const [showReqForm, setShowReqForm] = useState(false)
  const [events, setEvents] = useState([])
  const [reqForm, setReqForm] = useState({ eventId: '', itemDetails: '', quantity: '', maxBudget: '' })
  const [savingReq, setSavingReq] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [reqRes, invRes, evRes] = await Promise.all([
        getOrganizerSourcingRequests(organizerId),
        getOrganizerInvoices(organizerId),
        getOrganizerEvents(organizerId),
      ])
      setRequests(reqRes.data)
      setInvoices(invRes.data)
      setEvents(evRes.data)
    } catch { }
    setLoading(false)
  }, [organizerId])

  useEffect(() => { loadData() }, [loadData])

  const handleCreateReq = async (e) => {
    e.preventDefault()
    setSavingReq(true)
    try {
      const res = await createSourcingRequest({
        ...reqForm,
        eventId: parseInt(reqForm.eventId),
        quantity: parseInt(reqForm.quantity),
        maxBudget: reqForm.maxBudget ? parseFloat(reqForm.maxBudget) : null
      })
      setRequests(p => [res.data, ...p])
      setShowReqForm(false)
      setReqForm({ eventId: '', itemDetails: '', quantity: '', maxBudget: '' })
    } catch { }
    setSavingReq(false)
  }

  const handleInvoiceStatus = async (invoiceId, status) => {
    try {
      const res = await updateInvoiceStatus(invoiceId, status)
      setInvoices(p => p.map(inv => inv.id === invoiceId ? res.data : inv))
    } catch { }
  }

  const thStyle = { padding: '10px 14px', textAlign: 'left', color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }

  return (
    <div>
      <SectionHeader title="Sourcing & Invoices" icon="📦">
        <div style={{ display: 'flex', background: C.cream, borderRadius: 8, padding: 4 }}>
          {['requests', 'invoices'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 14px', border: 'none', background: tab === t ? C.white : 'transparent',
              borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              color: tab === t ? C.text : C.textMuted,
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}>
              {t === 'requests' ? 'Sourcing Requests' : 'Invoices'}
            </button>
          ))}
        </div>
        {tab === 'requests' && <Btn onClick={() => setShowReqForm(p => !p)}>+ New Request</Btn>}
      </SectionHeader>

      {tab === 'requests' && showReqForm && (
        <FormCard title="Create Sourcing Request" onClose={() => setShowReqForm(false)}>
          <form onSubmit={handleCreateReq}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="Event *">
                <select required value={reqForm.eventId} onChange={e => setReqForm(p => ({ ...p, eventId: e.target.value }))} style={inputStyle}>
                  <option value="">Select event</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </Field>
              <Field label="Item Details *"><input required value={reqForm.itemDetails} onChange={e => setReqForm(p => ({ ...p, itemDetails: e.target.value }))} style={inputStyle} /></Field>
              <Field label="Quantity *"><input required type="number" value={reqForm.quantity} onChange={e => setReqForm(p => ({ ...p, quantity: e.target.value }))} style={inputStyle} /></Field>
              <Field label="Max Budget (Optional)"><input type="number" value={reqForm.maxBudget} onChange={e => setReqForm(p => ({ ...p, maxBudget: e.target.value }))} style={inputStyle} /></Field>
            </div>
            <Btn type="submit" disabled={savingReq}>{savingReq ? 'Creating...' : 'Submit Request'}</Btn>
          </form>
        </FormCard>
      )}

      {loading ? <p style={{ color: C.textMuted }}>Loading...</p> : (
        <div style={{ overflowX: 'auto' }}>
          {tab === 'requests' ? (
            requests.length === 0 ? <EmptyState msg="No sourcing requests." /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: C.cream }}>
                    {['Item', 'Event', 'Quantity', 'Max Budget', 'Status', 'Vendor'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '11px 14px', fontWeight: 600, color: C.text }}>{r.itemDetails}</td>
                      <td style={{ padding: '11px 14px', color: C.textMuted }}>{r.event?.name}</td>
                      <td style={{ padding: '11px 14px' }}>{r.quantity}</td>
                      <td style={{ padding: '11px 14px', color: C.textMuted }}>{r.maxBudget ? fmtMoney(r.maxBudget) : '—'}</td>
                      <td style={{ padding: '11px 14px' }}>{statusBadge(r.status)}</td>
                      <td style={{ padding: '11px 14px', color: C.textMuted }}>{r.vendor?.companyName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            invoices.length === 0 ? <EmptyState msg="No invoices found." /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: C.cream }}>
                    {['Invoice Details', 'Amount', 'Vendor', 'Sourcing Req', 'Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '11px 14px', fontWeight: 600, color: C.text }}>{inv.details || `Invoice #${inv.id}`}</td>
                      <td style={{ padding: '11px 14px', color: C.red, fontWeight: 600 }}>{fmtMoney(inv.amount)}</td>
                      <td style={{ padding: '11px 14px', color: C.textMuted }}>{inv.sourcingRequest?.vendor?.companyName || '—'}</td>
                      <td style={{ padding: '11px 14px', color: C.textMuted }}>{inv.sourcingRequest?.itemDetails || '—'}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <select value={inv.status} onChange={e => handleInvoiceStatus(inv.id, e.target.value)}
                          style={{ ...inputStyle, padding: '4px 8px', minWidth: 100,
                            background: inv.status === 'PAID' ? C.greenBg : inv.status === 'PENDING' ? C.cream : C.redBg,
                            color: inv.status === 'PAID' ? C.green : inv.status === 'PENDING' ? C.text : C.red }}>
                          <option value="PENDING">Pending</option>
                          <option value="PAID">Paid</option>
                          <option value="OVERDUE">Overdue</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
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

  const handleToggle = async (userId) => {
    try {
      const res = await toggleUserActive(userId)
      setGuests(prev => prev.map(g =>
        g.user?.id === userId
          ? { ...g, user: { ...g.user, isActive: res.data.isActive } }
          : g
      ))
    } catch { }
  }

  return (
    <div>
      <SectionHeader title="Guests" icon="🎟️">
        <FilterInput value={search} onChange={setSearch} placeholder="Search guests..." />
        <FilterSelect value={eventFilter} onChange={setEventFilter} placeholder="All Events"
          options={events.map(e => ({ value: String(e.id), label: e.name }))} />
        <FilterSelect value={rsvpFilter} onChange={setRsvpFilter} placeholder="All RSVPs"
          options={['ATTENDING', 'NOT_ATTENDING', 'MAYBE', 'PENDING'].map(s => ({ value: s, label: s.replace('_', ' ') }))} />
        <Btn onClick={() => alert('Invitations sent to all pending guests!')}>✉️ Send Invitations</Btn>
      </SectionHeader>
      {loading ? <p style={{ color: C.textMuted }}>Loading...</p> : guests.length === 0 ? <EmptyState msg="No guests found." /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.cream }}>
                {['Name', 'Email', 'Dietary Pref.', 'RSVP', 'Check-In', 'Action'].map(h => (
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
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => handleToggle(g.user?.id)}
                      style={{
                        padding: '4px 14px', borderRadius: 6, border: 'none',
                        cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        background: g.user?.isActive ? C.redBg : C.greenBg,
                        color: g.user?.isActive ? C.red : C.green,
                        transition: 'opacity .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {g.user?.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
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

// ─── Day-Of Ops Section ───────────────────────────────────────────────────────
function DayOfOpsSection({ organizerId }) {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [dayOfData, setDayOfData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [msgForm, setMsgForm] = useState({ audience: 'ALL', content: '' })
  const [sendingMsg, setSendingMsg] = useState(false)

  useEffect(() => {
    getOrganizerEvents(organizerId)
      .then(r => { setEvents(r.data); if (r.data[0]) setSelectedEventId(String(r.data[0].id)) })
      .finally(() => setEventsLoading(false))
  }, [organizerId])

  const loadData = useCallback(async (eventId) => {
    if (!eventId) return
    setLoading(true)
    try {
      const res = await getDayOfDashboard(eventId)
      setDayOfData(res.data)
    } catch {
      setDayOfData(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData(selectedEventId) }, [selectedEventId, loadData])

  const handleSendMsg = async (e) => {
    e.preventDefault()
    setSendingMsg(true)
    try {
      await sendMessage(selectedEventId, msgForm)
      setMsgForm({ audience: 'ALL', content: '' })
      alert('Message sent successfully!')
    } catch {
      alert('Failed to send message.')
    }
    setSendingMsg(false)
  }

  return (
    <div>
      <SectionHeader title="Day-Of Operations" icon="📡">
        {!eventsLoading && (
          <FilterSelect value={selectedEventId} onChange={setSelectedEventId} placeholder="Select event"
            options={events.map(e => ({ value: String(e.id), label: e.name }))} />
        )}
      </SectionHeader>

      {loading && <p style={{ color: C.textMuted }}>Loading operations data...</p>}
      {!loading && !dayOfData && selectedEventId && <EmptyState msg="No operations data available." />}

      {!loading && dayOfData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 20, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <StatCard icon="🏟️" label="Check-In Rate" value={`${dayOfData.checkedInGuests}/${dayOfData.totalGuests}`} />
              <StatCard icon="✅" label="Tasks Completed" value={`${dayOfData.tasksDone}/${dayOfData.totalTasks}`} />
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>Pending Tasks</h3>
            {dayOfData.pendingTasksList?.length === 0 ? <p style={{ color: C.textMuted, fontSize: 14 }}>All tasks complete!</p> : (
              <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                {dayOfData.pendingTasksList?.map((t, i) => (
                  <div key={t.id} style={{ padding: '12px 16px', borderBottom: i === dayOfData.pendingTasksList.length - 1 ? 'none' : `1px solid ${C.border}` }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Assignee: {t.assignee?.user?.name || 'Unassigned'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <FormCard title="Broadcast Message" onClose={() => {}}>
            <form onSubmit={handleSendMsg}>
              <Field label="Audience">
                <select value={msgForm.audience} onChange={e => setMsgForm(p => ({ ...p, audience: e.target.value }))} style={{ ...inputStyle, marginBottom: 12 }}>
                  <option value="ALL">All Stakeholders</option>
                  <option value="GUESTS">Guests</option>
                  <option value="STAFF">Staff</option>
                  <option value="VENDORS">Vendors</option>
                </select>
              </Field>
              <Field label="Message">
                <textarea required rows={4} value={msgForm.content} onChange={e => setMsgForm(p => ({ ...p, content: e.target.value }))}
                  style={{ ...inputStyle, marginBottom: 12, resize: 'vertical' }} placeholder="Type an urgent update or announcement..." />
              </Field>
              <Btn type="submit" style={{ width: '100%' }} disabled={sendingMsg}>{sendingMsg ? 'Sending...' : 'Send Message'}</Btn>
            </form>
            <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
              <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 8 }}>Message Delivery Status</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>85% of guests have seen the latest broadcast.</div>
              <button onClick={() => alert('Follow-up message sent to guests who have not seen the broadcast.')} style={{ marginTop: 8, padding: '6px 12px', fontSize: 12, borderRadius: 6, border: `1px solid ${C.border}`, background: C.cream, cursor: 'pointer' }}>
                Resend to unread
              </button>
            </div>
          </FormCard>
        </div>
      )}
    </div>
  )
}

// ─── Reports Section ──────────────────────────────────────────────────────────
function ReportsSection({ organizerId }) {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(true)

  useEffect(() => {
    getOrganizerEvents(organizerId)
      .then(r => { setEvents(r.data); if (r.data[0]) setSelectedEventId(String(r.data[0].id)) })
      .finally(() => setEventsLoading(false))
  }, [organizerId])

  const loadData = useCallback(async (eventId) => {
    if (!eventId) return
    setLoading(true)
    try {
      const res = await getEventReport(eventId)
      setReportData(res.data)
    } catch {
      setReportData(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData(selectedEventId) }, [selectedEventId, loadData])

  return (
    <div>
      <SectionHeader title="Post-Event Reports" icon="📈">
        {!eventsLoading && (
          <FilterSelect value={selectedEventId} onChange={setSelectedEventId} placeholder="Select event"
            options={events.map(e => ({ value: String(e.id), label: e.name }))} />
        )}
        <Btn onClick={() => window.print()}>🖨️ Export Report</Btn>
      </SectionHeader>

      {loading && <p style={{ color: C.textMuted }}>Loading report...</p>}
      {!loading && !reportData && selectedEventId && <EmptyState msg="No report available for this event." />}

      {!loading && reportData && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            <StatCard icon="👥" label="Total Attendance" value={reportData.attendance} />
            <StatCard icon="💰" label="Total Spent" value={fmtMoney(reportData.financials?.spent)} />
            <StatCard icon="⭐" label="Avg. Feedback" value={reportData.feedbackSummary?.avgRating || 'N/A'} />
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>Feedback Quotes</h3>
          {reportData.feedbackSummary?.quotes?.length === 0 ? <p style={{ color: C.textMuted, fontSize: 14 }}>No feedback received.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {reportData.feedbackSummary?.quotes?.map((q, i) => (
                <div key={i} style={{ background: C.white, padding: '16px', borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{q.author}</span>
                    <span style={{ fontSize: 13 }}>{'⭐'.repeat(q.rating)}</span>
                  </div>
                  <div style={{ fontSize: 14, color: C.textMuted, fontStyle: 'italic' }}>"{q.comment}"</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Accounts Section ─────────────────────────────────────────────────────────
function AccountsSection({ organizerId, currentUser }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ name: currentUser?.name || '', email: currentUser?.email || '' })
  const [accountForm, setAccountForm] = useState({ name: '', email: '', password: '', role: 'STAFF', specialty: '', companyName: '' })
  const [saving, setSaving] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateOrganizerProfile(organizerId, profileForm)
      alert('Profile updated successfully! (Refresh to see changes)')
    } catch {
      alert('Failed to update profile.')
    }
    setSaving(false)
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createStakeholderAccount(accountForm)
      setAccountForm({ name: '', email: '', password: '', role: 'STAFF', specialty: '', companyName: '' })
      alert('Account created successfully!')
    } catch {
      alert('Failed to create account. Email may already be in use.')
    }
    setSaving(false)
  }

  return (
    <div>
      <SectionHeader title="Account & Team Settings" icon="👤">
        <div style={{ display: 'flex', background: C.cream, borderRadius: 8, padding: 4 }}>
          {[{ id: 'profile', label: 'My Profile' }, { id: 'create', label: 'Create Accounts' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '6px 14px', border: 'none', background: activeTab === t.id ? C.white : 'transparent',
              borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              color: activeTab === t.id ? C.text : C.textMuted,
              boxShadow: activeTab === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </SectionHeader>

      {activeTab === 'profile' && (
        <div style={{ maxWidth: 500 }}>
          <FormCard title="Update My Profile" onClose={() => {}}>
            <form onSubmit={handleUpdateProfile}>
              <Field label="Full Name">
                <input required value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} style={{ ...inputStyle, marginBottom: 14 }} />
              </Field>
              <Field label="Email Address">
                <input required type="email" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} style={{ ...inputStyle, marginBottom: 20 }} />
              </Field>
              <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Btn>
            </form>
          </FormCard>
        </div>
      )}

      {activeTab === 'create' && (
        <div style={{ maxWidth: 600 }}>
          <FormCard title="Create Stakeholder Account" onClose={() => {}}>
            <form onSubmit={handleCreateAccount}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <Field label="Role *">
                  <select required value={accountForm.role} onChange={e => setAccountForm(p => ({ ...p, role: e.target.value }))} style={inputStyle}>
                    <option value="STAFF">Team Member / Staff</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="GUEST">Guest</option>
                  </select>
                </Field>
                <Field label="Full Name *">
                  <input required value={accountForm.name} onChange={e => setAccountForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                </Field>
                <Field label="Email *">
                  <input required type="email" value={accountForm.email} onChange={e => setAccountForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
                </Field>
                <Field label="Temporary Password *">
                  <input required type="password" value={accountForm.password} onChange={e => setAccountForm(p => ({ ...p, password: e.target.value }))} style={inputStyle} />
                </Field>

                {accountForm.role === 'STAFF' && (
                  <div style={{ gridColumn: '1/-1' }}>
                    <Field label="Staff Specialty (e.g. Coordinator, Security)"><input value={accountForm.specialty} onChange={e => setAccountForm(p => ({ ...p, specialty: e.target.value }))} style={inputStyle} /></Field>
                  </div>
                )}
                {accountForm.role === 'VENDOR' && (
                  <div style={{ gridColumn: '1/-1' }}>
                    <Field label="Company Name *"><input required={accountForm.role === 'VENDOR'} value={accountForm.companyName} onChange={e => setAccountForm(p => ({ ...p, companyName: e.target.value }))} style={inputStyle} /></Field>
                  </div>
                )}
              </div>
              <Btn type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Account'}</Btn>
            </form>
          </FormCard>
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
          {activeSection === 'sourcing' && <SourcingSection organizerId={user?.id} />}
          {activeSection === 'guests' && <GuestsSection organizerId={user?.id} />}
          {activeSection === 'dayof' && <DayOfOpsSection organizerId={user?.id} />}
          {activeSection === 'reports' && <ReportsSection organizerId={user?.id} />}
          {activeSection === 'accounts' && <AccountsSection organizerId={user?.id} currentUser={user} />}
        </div>
      </div>
    </div>
  )
}


