import { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import OrganizerLayout from './OrganizerLayout'
import { createBooking, getAllVenues } from '../../services/venueService'
import { AuthContext } from '../../context/AuthContext'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
  accent: '#ff5a2c',
  accentLight: '#ffe7dc',
  cream: '#fdf4e9',
  border: '#f0e3d2',
  text: '#241407',
  textMuted: '#8a7a68',
  white: '#ffffff',
  green: '#0f7a44',
  greenBg: '#e7f7ee',
  greenBorder: '#86EFAC',
  sidebar: '#1b0f06',
  red: '#b91c1c',
  redBg: '#fef2f2',
  redBorder: '#fca5a5',
}

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  fontSize: 14,
  color: C.text,
  background: C.white,
  outline: 'none',
  boxSizing: 'border-box',
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}{required && <span style={{ color: C.accent }}> *</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Btn component ────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = 'primary', disabled, type = 'button' }) {
  const variants = {
    primary: { background: C.accent, color: C.white },
    ghost:   { background: C.cream, color: C.text, border: `1px solid ${C.border}` },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 22px', borderRadius: 8, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 14, fontWeight: 600,
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity .15s',
        ...variants[variant],
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.8' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
    >
      {children}
    </button>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function getDaysInMonth(year, month) {
  const days = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

// ─── Availability Mini-Calendar ───────────────────────────────────────────────
function AvailabilityCalendar({ availableDates, selectedDate, onSelect }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewYear, setViewYear] = useState(() => {
    // Jump to the month of the first upcoming available date, or today
    const firstUpcoming = availableDates
      .map(d => new Date(d))
      .filter(d => d >= today)
      .sort((a, b) => a - b)[0]
    return firstUpcoming ? firstUpcoming.getFullYear() : today.getFullYear()
  })
  const [viewMonth, setViewMonth] = useState(() => {
    const firstUpcoming = availableDates
      .map(d => new Date(d))
      .filter(d => d >= today)
      .sort((a, b) => a - b)[0]
    return firstUpcoming ? firstUpcoming.getMonth() : today.getMonth()
  })

  const days = getDaysInMonth(viewYear, viewMonth)
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' })

  const availableSet = new Set(
    availableDates.map(d => new Date(d).toISOString().split('T')[0])
  )

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div style={{
      background: C.cream, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: '1.25rem',
    }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={prevMonth}
          style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', fontSize: 14, color: C.text }}
        >◀</button>
        <strong style={{ fontSize: 14, color: C.text }}>{monthName}</strong>
        <button
          type="button"
          onClick={nextMonth}
          style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', fontSize: 14, color: C.text }}
        >▶</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.textMuted, paddingBottom: 4 }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {Array(days[0].getDay()).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const dateStr = day.toISOString().split('T')[0]
          const isPast = day < today
          const isAvail = availableSet.has(dateStr)
          const isSelected = selectedDate === dateStr

          let bg = C.white
          let color = '#CCC'
          let border = '#EEE'
          let cursor = 'not-allowed'
          let fontWeight = '400'

          if (!isPast && isAvail) {
            bg = isSelected ? C.green : C.greenBg
            color = isSelected ? C.white : C.green
            border = isSelected ? C.green : C.greenBorder
            cursor = 'pointer'
            fontWeight = '700'
          } else if (!isPast && !isAvail) {
            bg = C.white
            color = '#CBD5E1'
            border = '#E2E8F0'
            cursor = 'not-allowed'
          }

          return (
            <div
              key={dateStr}
              title={!isPast && isAvail ? `Select ${dateStr}` : isPast ? 'Past date' : 'Not available'}
              onClick={() => !isPast && isAvail && onSelect(dateStr)}
              style={{
                textAlign: 'center',
                padding: '0.5rem 0',
                borderRadius: 7,
                fontSize: 13,
                fontWeight,
                background: bg,
                color,
                border: `1px solid ${border}`,
                cursor,
                transition: 'all 0.1s',
                userSelect: 'none',
              }}
            >
              {day.getDate()}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textMuted }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: C.greenBg, border: `1px solid ${C.greenBorder}` }} />
          Available
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textMuted }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: C.green, border: `1px solid ${C.green}` }} />
          Selected
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textMuted }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: C.white, border: '1px solid #E2E8F0' }} />
          Unavailable
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrganizerCreateBookingPage() {
  const navigate = useNavigate()
  const query = useQuery()
  const { user } = useContext(AuthContext)
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [venueId, setVenueId] = useState(query.get('venueId') || '')
  const [eventDate, setEventDate] = useState('')
  const [notes, setNotes] = useState('')
  const [attendeeCount, setAttendeeCount] = useState('')

  useEffect(() => {
    async function loadVenues() {
      try {
        const res = await getAllVenues({})
        setVenues(res.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadVenues()
  }, [])

  // Reset selected date when venue changes
  useEffect(() => { setEventDate('') }, [venueId])

  const selectedVenue = venues.find(v => String(v.id) === String(venueId))

  const availableDates = selectedVenue?.availableDates || []
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const upcomingAvailable = availableDates.filter(d => new Date(d) >= today)
  const hasAvailableDates = upcomingAvailable.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!venueId || !eventDate) return
    setSubmitError('')
    setSubmitting(true)
    try {
      await createBooking({ venueId: Number(venueId), organizerId: user.id, eventDate, notes, attendeeCount: attendeeCount || null })
      setSubmitted(true)
      setTimeout(() => navigate('/organizer/bookings'), 1800)
    } catch (error) {
      const msg = error?.response?.data?.error || 'Failed to submit booking request.'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <OrganizerLayout
      title="Create Booking Request"
      subtitle="Submit a new venue booking request for your event."
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* ── Success state ──────────────────────────────────────────────── */}
        {submitted && (
          <div style={{
            background: '#E8F5EE', border: '1px solid #A7D9B5',
            borderRadius: 14, padding: '24px 28px', textAlign: 'center',
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: C.green }}>Booking request submitted!</div>
            <div style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Redirecting to your booking requests...</div>
          </div>
        )}

        {/* ── Form card ──────────────────────────────────────────────────── */}
        {!submitted && (
          <div style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(107,45,14,0.08)',
            overflow: 'hidden',
          }}>
            {/* Card header */}
            <div style={{
              background: `linear-gradient(135deg, ${C.sidebar} 0%, ${C.accent} 100%)`,
              padding: '22px 28px',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>📋 Booking Details</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                Fill in the details below to submit your venue booking request.
              </div>
            </div>

            {/* Form body */}
            <div style={{ padding: '28px' }}>
              {loading ? (
                <p style={{ color: C.textMuted }}>Loading venues...</p>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Venue select */}
                  <Field label="Venue" required>
                    <select
                      value={venueId}
                      onChange={e => setVenueId(e.target.value)}
                      required
                      style={inputStyle}
                    >
                      <option value="">— Select a venue —</option>
                      {venues.map(venue => (
                        <option key={venue.id} value={venue.id}>
                          {venue.name} — {venue.city}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* Selected venue preview */}
                  {selectedVenue && (
                    <div style={{
                      background: C.accentLight,
                      borderRadius: 10,
                      padding: '14px 18px',
                      display: 'flex', gap: 20, flexWrap: 'wrap',
                      borderLeft: `3px solid ${C.accent}`,
                    }}>
                      <div style={{ fontSize: 13, color: C.text }}>
                        📍 <strong>{selectedVenue.location}</strong>
                      </div>
                      <div style={{ fontSize: 13, color: C.text }}>
                        👥 Capacity: <strong>{selectedVenue.capacity?.toLocaleString()}</strong>
                      </div>
                      <div style={{ fontSize: 13, color: C.text }}>
                        💰 <strong style={{ color: C.accent }}>EGP {Number(selectedVenue.pricePerDay || 0).toLocaleString()}</strong>/day
                      </div>
                    </div>
                  )}

                  {/* ── Availability Calendar ─────────────────────────── */}
                  {selectedVenue && (
                    <Field label="Event Date" required>
                      {!hasAvailableDates ? (
                        /* No available dates warning */
                        <div style={{
                          background: C.redBg,
                          border: `1px solid ${C.redBorder}`,
                          borderRadius: 10,
                          padding: '14px 18px',
                          display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                          <span style={{ fontSize: 22 }}>🚫</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: C.red }}>No available dates</div>
                            <div style={{ fontSize: 13, color: '#78350f', marginTop: 3 }}>
                              The venue owner hasn't marked any upcoming dates as available yet. Please check back later or contact them directly.
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Interactive calendar */
                        <div>
                          <p style={{ margin: '0 0 8px', fontSize: 13, color: C.textMuted }}>
                            🗓 Select a date below — only dates marked available by the venue owner can be booked.
                          </p>
                          <AvailabilityCalendar
                            availableDates={availableDates}
                            selectedDate={eventDate}
                            onSelect={setEventDate}
                          />
                          {eventDate && (
                            <div style={{
                              marginTop: 10,
                              background: C.greenBg,
                              border: `1px solid ${C.greenBorder}`,
                              borderRadius: 8,
                              padding: '8px 14px',
                              fontSize: 13,
                              color: C.green,
                              fontWeight: 600,
                            }}>
                              ✓ Selected: {new Date(eventDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                          )}
                        </div>
                      )}
                    </Field>
                  )}

                  {/* Attendee count */}
                  <Field label="Expected Attendees">
                    <input
                      type="number"
                      min="0"
                      value={attendeeCount}
                      onChange={e => setAttendeeCount(e.target.value)}
                      placeholder="e.g. 150"
                      style={inputStyle}
                    />
                  </Field>

                  {/* Notes */}
                  <Field label="Notes (optional)">
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Any special requirements or details..."
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                    />
                  </Field>

                  {/* Submit error */}
                  {submitError && (
                    <div style={{
                      background: C.redBg, border: `1px solid ${C.redBorder}`,
                      borderRadius: 8, padding: '10px 14px',
                      fontSize: 13, color: C.red, fontWeight: 600,
                    }}>
                      ⚠️ {submitError}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                    <Btn type="submit" disabled={submitting || !venueId || !eventDate || !hasAvailableDates}>
                      {submitting ? '⏳ Submitting...' : '🚀 Submit Booking Request'}
                    </Btn>
                    <Btn variant="ghost" onClick={() => navigate('/organizer/venues')}>
                      Cancel
                    </Btn>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  )
}
