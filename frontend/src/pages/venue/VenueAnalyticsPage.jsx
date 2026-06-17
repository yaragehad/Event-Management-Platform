import { useEffect, useState, useContext } from 'react'
import VenueLayout, { COLORS } from './VenueLayout'
import { getVenueAnalytics } from '../../services/venueService'
import { AuthContext } from '../../context/AuthContext'

function MetricCard({ icon, value, label, sub, color }) {
  return (
    <div style={{
      background: COLORS.white, border: `1px solid ${COLORS.border}`,
      borderRadius: '12px', padding: '1.25rem 1.5rem', flex: 1
    }}>
      <div style={{
        width: '40px', height: '40px', background: color || COLORS.accentLight,
        borderRadius: '8px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '18px', marginBottom: '0.75rem'
      }}>{icon}</div>
      <div style={{ fontSize: '26px', fontWeight: '800', color: COLORS.text, marginBottom: '0.2rem' }}>{value}</div>
      <div style={{ fontSize: '14px', color: COLORS.textMuted }}>{label}</div>
      {sub && <div style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

export default function VenueAnalyticsPage() {
  const { user } = useContext(AuthContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getVenueAnalytics(user.id).then(res => {
      setData(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user?.id])

  const exportToCSV = (rows, filename) => {
    if (!rows.length) return
    const headers = Object.keys(rows[0]).join(',')
    const body = rows.map(r => Object.values(r).join(',')).join('\n')
    const blob = new Blob([headers + '\n' + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportVenueReport = () => {
    if (!data) return
    exportToCSV(data.venueBreakdown, 'venue-performance-report.csv')
  }

  const exportMonthlyReport = () => {
    if (!data) return
    const rows = Object.entries(data.monthlyData).map(([month, d]) => ({
      Month: month,
      'Total Bookings': d.bookings,
      'Approved': d.approved,
      'Revenue (EGP)': d.revenue
    }))
    if (rows.length === 0) {
    alert('No monthly booking data to export yet. Create and approve some bookings first.')
    return
  }
    exportToCSV(rows, 'monthly-bookings-report.csv')
  }

  const exportSummary = () => {
    if (!data) return
    exportToCSV([data.summary], 'business-summary.csv')
  }

  if (loading) return (
    <VenueLayout title="Analytics & Reports">
      <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.textMuted }}>Loading analytics...</div>
    </VenueLayout>
  )

  if (!data) return (
    <VenueLayout title="Analytics & Reports">
      <div style={{ textAlign: 'center', padding: '3rem', color: COLORS.textMuted }}>No data available yet.</div>
    </VenueLayout>
  )

  const { summary, monthlyData, venueBreakdown } = data

  return (
    <VenueLayout title="Analytics & Reports">

      {/* Export buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', justifyContent: 'flex-end' }}>
        {[
          { label: '⬇ Export Summary', fn: exportSummary },
          { label: '⬇ Monthly Report', fn: exportMonthlyReport },
          { label: '⬇ Venue Performance', fn: exportVenueReport },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.fn}
            style={{
              padding: '0.6rem 1.1rem', background: COLORS.white,
              border: `1px solid ${COLORS.border}`, borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              color: COLORS.text, display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = COLORS.accentLight; e.currentTarget.style.borderColor = COLORS.accent }}
            onMouseLeave={e => { e.currentTarget.style.background = COLORS.white; e.currentTarget.style.borderColor = COLORS.border }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Summary Metrics */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricCard icon="🏛" value={summary.activeVenues} label="Active Venues" sub={`of ${summary.totalVenues} total`} />
        <MetricCard icon="📅" value={summary.totalBookings} label="Total Bookings" sub={`${summary.pendingBookings} pending`} />
        <MetricCard icon="📈" value={`${summary.conversionRate}%`} label="Conversion Rate" sub="Requests → Approved" color="#E8F5EE" />
        <MetricCard icon="💰" value={`EGP ${summary.estimatedRevenue.toLocaleString()}`} label="Est. Revenue" sub="From approved bookings" color="#FEF9C3" />
      </div>

      {/* Booking breakdown */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Approved', value: summary.approvedBookings, color: COLORS.greenBg, text: COLORS.green },
          { label: 'Pending', value: summary.pendingBookings, color: '#FEF9C3', text: '#92400E' },
          { label: 'Declined', value: summary.declinedBookings, color: COLORS.redBg, text: COLORS.red },
        ].map((item, i) => (
          <div key={i} style={{
            flex: 1, background: item.color, border: `1px solid ${COLORS.border}`,
            borderRadius: '10px', padding: '1rem 1.5rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: item.text }}>{item.value}</div>
            <div style={{ fontSize: '13px', color: item.text, fontWeight: '600' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Per Venue Breakdown */}
      <div style={{
        background: COLORS.white, border: `1px solid ${COLORS.border}`,
        borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem'
      }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '16px', fontWeight: '700', color: COLORS.text }}>Venue Performance</h2>
        {venueBreakdown.length === 0 && <p style={{ color: COLORS.textMuted }}>No venues yet.</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
              {['Venue', 'City', 'Price/Day', 'Total Bookings', 'Approved', 'Pending', 'Revenue (EGP)'].map(h => (
                <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: COLORS.textMuted, fontWeight: '600', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {venueBreakdown.map(v => (
              <tr key={v.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '0.75rem', fontWeight: '600', color: COLORS.text }}>{v.name}</td>
                <td style={{ padding: '0.75rem', color: COLORS.textMuted }}>{v.city}</td>
                <td style={{ padding: '0.75rem', color: COLORS.textMuted }}>{v.pricePerDay.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{v.totalBookings}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center', color: COLORS.green, fontWeight: '600' }}>{v.approved}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center', color: '#92400E' }}>{v.pending}</td>
                <td style={{ padding: '0.75rem', fontWeight: '700', color: COLORS.text }}>{v.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly History */}
      <div style={{
        background: COLORS.white, border: `1px solid ${COLORS.border}`,
        borderRadius: '12px', padding: '1.5rem'
      }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '16px', fontWeight: '700', color: COLORS.text }}>Historical Booking Data</h2>
        {Object.keys(monthlyData).length === 0 && <p style={{ color: COLORS.textMuted }}>No booking history yet.</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
              {['Month', 'Total Bookings', 'Approved', 'Revenue (EGP)'].map(h => (
                <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: COLORS.textMuted, fontWeight: '600', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(monthlyData).map(([month, d]) => (
              <tr key={month} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '0.75rem', fontWeight: '600', color: COLORS.text }}>{month}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{d.bookings}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center', color: COLORS.green, fontWeight: '600' }}>{d.approved}</td>
                <td style={{ padding: '0.75rem', fontWeight: '700', color: COLORS.text }}>{d.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VenueLayout>
  )
}