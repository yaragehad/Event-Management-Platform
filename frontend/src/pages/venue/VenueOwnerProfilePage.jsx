import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VenueLayout, { COLORS } from './VenueLayout'
import { AuthContext } from '../../context/AuthContext'
import { getUserProfile, updateUserProfile } from '../../services/venueService'

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 0', borderBottom: `1px solid ${COLORS.border}` }}>
      <span style={{ width: '160px', fontSize: '13px', color: COLORS.textMuted, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text }}>{value}</span>
    </div>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div style={{
      flex: 1, background: COLORS.cream, border: `1px solid ${COLORS.border}`,
      borderRadius: '12px', padding: '1.25rem', textAlign: 'center'
    }}>
      <div style={{ fontSize: '28px', marginBottom: '0.4rem' }}>{icon}</div>
      <div style={{ fontSize: '26px', fontWeight: '800', color: COLORS.text }}>{value}</div>
      <div style={{ fontSize: '13px', color: COLORS.textMuted, marginTop: '0.2rem' }}>{label}</div>
    </div>
  )
}

export default function VenueOwnerProfilePage() {
  const { user: authUser, login } = useContext(AuthContext)
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    getUserProfile()
      .then(res => {
        setProfile(res.data)
        setForm(f => ({ ...f, name: res.data.name, email: res.data.email }))
      })
      .catch(() => setFeedback({ type: 'error', msg: 'Could not load profile.' }))
      .finally(() => setLoading(false))
  }, [])

  const initials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const handleSave = async () => {
    setFeedback(null)
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return setFeedback({ type: 'error', msg: 'New passwords do not match.' })
    }
    if (form.newPassword && form.newPassword.length < 6) {
      return setFeedback({ type: 'error', msg: 'New password must be at least 6 characters.' })
    }

    setSaving(true)
    try {
      const payload = { name: form.name, email: form.email }
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword
        payload.newPassword = form.newPassword
      }

      const res = await updateUserProfile(payload)
      const updated = res.data.user
      setProfile(p => ({ ...p, ...updated }))
      login(updated, localStorage.getItem('token'))
      setEditing(false)
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }))
      setFeedback({ type: 'success', msg: 'Profile updated successfully.' })
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Failed to save changes.' })
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.85rem', border: `1px solid ${COLORS.border}`,
    borderRadius: '8px', fontSize: '14px', color: COLORS.text,
    background: COLORS.white, outline: 'none', boxSizing: 'border-box'
  }

  const labelStyle = { fontSize: '13px', fontWeight: '600', color: COLORS.textMuted, marginBottom: '0.35rem', display: 'block' }

  if (loading) {
    return (
      <VenueLayout title="My Profile">
        <div style={{ textAlign: 'center', padding: '4rem', color: COLORS.textMuted }}>Loading profile...</div>
      </VenueLayout>
    )
  }

  return (
    <VenueLayout title="My Profile">
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Header card */}
        <div style={{
          background: COLORS.white, border: `1px solid ${COLORS.border}`,
          borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '1.5rem'
        }}>
          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: COLORS.accent, color: COLORS.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '700', flexShrink: 0
          }}>
            {initials(profile?.name)}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: COLORS.text }}>{profile?.name}</div>
            <div style={{ fontSize: '14px', color: COLORS.textMuted, marginTop: '0.2rem' }}>{profile?.email}</div>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{
                padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                background: COLORS.accentLight, color: COLORS.accent
              }}>
                {profile?.role?.replace('_', ' ')}
              </span>
              <span style={{
                padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                background: COLORS.greenBg, color: COLORS.green
              }}>
                Active
              </span>
            </div>
          </div>

          <button
            onClick={() => { setEditing(e => !e); setFeedback(null) }}
            style={{
              padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', border: `1px solid ${COLORS.border}`,
              background: editing ? COLORS.cream : COLORS.accent,
              color: editing ? COLORS.text : COLORS.white
            }}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard icon="🏛" value={profile?._count?.ownedVenues ?? 0} label="Total Venues" />
          <StatCard icon="📅" value={profile?._count?.bookingRequests ?? 0} label="Booking Requests" />
          <StatCard icon="📆" value={profile?.createdAt ? formatDate(profile.createdAt) : '—'} label="Member Since" />
        </div>

        {/* Account Info */}
        <div style={{
          background: COLORS.white, border: `1px solid ${COLORS.border}`,
          borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '16px', fontWeight: '700', color: COLORS.text }}>Account Information</h2>

          {!editing ? (
            <>
              <InfoRow label="Full Name" value={profile?.name} />
              <InfoRow label="Email Address" value={profile?.email} />
              <InfoRow label="Role" value={profile?.role?.replace('_', ' ')} />
              <InfoRow label="Member Since" value={profile?.createdAt ? formatDate(profile.createdAt) : '—'} />
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 0' }}>
                <span style={{ width: '160px', fontSize: '13px', color: COLORS.textMuted, flexShrink: 0 }}>Password</span>
                <span style={{ fontSize: '14px', color: COLORS.textMuted }}>••••••••</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>

              {feedback && (
                <div style={{
                  padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '14px',
                  background: feedback.type === 'error' ? COLORS.redBg : COLORS.greenBg,
                  color: feedback.type === 'error' ? COLORS.red : COLORS.green,
                  border: `1px solid ${feedback.type === 'error' ? COLORS.red : COLORS.green}`,
                }}>
                  {feedback.msg}
                </div>
              )}

              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>

              <hr style={{ border: 'none', borderTop: `1px solid ${COLORS.border}`, margin: '0.5rem 0' }} />
              <p style={{ margin: 0, fontSize: '13px', color: COLORS.textMuted }}>Leave password fields blank to keep your current password.</p>

              <div>
                <label style={labelStyle}>Current Password</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={form.currentPassword}
                  onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label style={labelStyle}>New Password</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={form.newPassword}
                  onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Min. 6 characters"
                />
              </div>

              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  onClick={() => { setEditing(false); setFeedback(null) }}
                  style={{
                    padding: '0.65rem 1.25rem', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                    cursor: 'pointer', border: `1px solid ${COLORS.border}`, background: COLORS.cream, color: COLORS.text
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '0.65rem 1.5rem', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer', border: 'none',
                    background: saving ? COLORS.border : COLORS.accent, color: COLORS.white
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Success feedback when not in edit mode */}
        {!editing && feedback?.type === 'success' && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '14px',
            background: COLORS.greenBg, color: COLORS.green,
            border: `1px solid ${COLORS.green}`, marginBottom: '1.5rem'
          }}>
            {feedback.msg}
          </div>
        )}

        {/* Danger zone */}
        <div style={{
          background: COLORS.white, border: `1px solid ${COLORS.redBg}`,
          borderRadius: '16px', padding: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '16px', fontWeight: '700', color: COLORS.red }}>Danger Zone</h2>
          <p style={{ margin: '0 0 1rem', fontSize: '13px', color: COLORS.textMuted }}>
            Log out of your account on this device.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', border: `1px solid ${COLORS.red}`, background: COLORS.redBg, color: COLORS.red
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </VenueLayout>
  )
}
