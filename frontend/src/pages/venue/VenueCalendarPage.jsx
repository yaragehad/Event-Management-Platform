import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VenueLayout, { COLORS } from './VenueLayout'
import { getVenueById, updateVenue } from '../../services/venueService'

function getDaysInMonth(year, month) {
  const days = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

export default function VenueCalendarPage() {
  const { id } = useParams()
  const [venue, setVenue] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  useEffect(() => {
    getVenueById(id).then(res => {
      setVenue(res.data)
      setAvailableDates(res.data.availableDates?.map(d => d.split('T')[0]) || [])
    })
  }, [id])

  const days = getDaysInMonth(viewYear, viewMonth)
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' })

  const toggleDate = (dateStr) => {
    setSaved(false)
    setAvailableDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    )
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateVenue(id, { availableDates: availableDates.map(d => new Date(d).toISOString()) })
      setSaved(true)
    } catch {
      alert('Failed to save availability')
    } finally {
      setSaving(false)
    }
  }

  if (!venue) return (
    <VenueLayout title="Availability Calendar">
      <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.textMuted }}>Loading...</div>
    </VenueLayout>
  )

  return (
    <VenueLayout title={`Availability — ${venue.name}`}>
      <div style={{ maxWidth: '700px' }}>
        <div style={{
          background: COLORS.white, border: `1px solid ${COLORS.border}`,
          borderRadius: '12px', padding: '2rem'
        }}>

          <p style={{ color: COLORS.textMuted, fontSize: '14px', marginTop: 0, marginBottom: '1.5rem' }}>
            Click a date to mark it as available (green) or unavailable. Organizers will only see available dates.
          </p>

          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <button
              onClick={prevMonth}
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: COLORS.cream, cursor: 'pointer', fontSize: '16px', color: COLORS.text }}
            >◀</button>
            <strong style={{ fontSize: '16px', color: COLORS.text }}>{monthName}</strong>
            <button
              onClick={nextMonth}
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, background: COLORS.cream, cursor: 'pointer', fontSize: '16px', color: COLORS.text }}
            >▶</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '0.5rem' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '700', color: COLORS.textMuted, padding: '0.5rem 0' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '1.5rem' }}>
            {Array(days[0].getDay()).fill(null).map((_, i) => <div key={`e-${i}`} />)}
            {days.map(day => {
              const dateStr = day.toISOString().split('T')[0]
              const isAvailable = availableDates.includes(dateStr)
              const isPast = day < today

              return (
                <div
                  key={dateStr}
                  onClick={() => !isPast && toggleDate(dateStr)}
                  style={{
                    textAlign: 'center', padding: '0.6rem 0', borderRadius: '8px',
                    fontSize: '14px', fontWeight: isAvailable ? '700' : '400',
                    background: isPast ? '#F9F9F9' : isAvailable ? COLORS.greenBg : COLORS.cream,
                    color: isPast ? '#CCC' : isAvailable ? COLORS.green : COLORS.text,
                    border: `1px solid ${isPast ? '#EEE' : isAvailable ? '#86EFAC' : COLORS.border}`,
                    cursor: isPast ? 'not-allowed' : 'pointer',
                    transition: 'all 0.1s'
                  }}
                >
                  {day.getDate()}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: COLORS.textMuted }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: COLORS.greenBg, border: `1px solid #86EFAC` }} />
              Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: COLORS.textMuted }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: COLORS.cream, border: `1px solid ${COLORS.border}` }} />
              Unavailable
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: COLORS.textMuted }}>
              <span style={{ color: COLORS.accent, fontWeight: '700' }}>{availableDates.length}</span> dates marked available
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', padding: '0.85rem', background: saved ? COLORS.green : COLORS.accent,
              color: COLORS.white, border: 'none', borderRadius: '9px',
              cursor: 'pointer', fontSize: '15px', fontWeight: '600', transition: 'background 0.2s'
            }}
          >
            {saving ? 'Saving...' : saved ? '✓ Availability Saved' : 'Save Availability'}
          </button>
        </div>
      </div>
    </VenueLayout>
  )
}