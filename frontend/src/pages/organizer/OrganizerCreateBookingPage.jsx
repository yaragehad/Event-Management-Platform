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
  accent: '#C4622D',
  accentLight: '#F5EDE8',
  cream: '#FBF7F4',
  border: '#EDE0D9',
  text: '#2C1810',
  textMuted: '#8B6555',
  white: '#FFFFFF',
  green: '#2D7A4F',
  greenBg: '#E8F5EE',
  sidebar: '#6B2D0E',
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrganizerCreateBookingPage() {
  const navigate = useNavigate()
  const query = useQuery()
  const { user } = useContext(AuthContext)
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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

  const selectedVenue = venues.find(v => String(v.id) === String(venueId))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!venueId || !eventDate) return

    setSubmitting(true)
    try {
      await createBooking({ venueId: Number(venueId), organizerId: user.id, eventDate, notes, attendeeCount: attendeeCount || null })
      setSubmitted(true)
      setTimeout(() => navigate('/organizer/bookings'), 1800)
    } catch (error) {
      console.error(error)
      alert('Failed to submit booking request.')
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

                  {/* Event date */}
                  <Field label="Event Date" required>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={e => setEventDate(e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      style={inputStyle}
                    />
                  </Field>

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

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                    <Btn type="submit" disabled={submitting || !venueId || !eventDate}>
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
