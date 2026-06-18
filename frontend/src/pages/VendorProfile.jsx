import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { VendorSidebar } from '../components/Sidebar';
import { getVendorById, updateVendor, updateUserProfile } from '../services/api';

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#fdf4e9',
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
    padding: '12px',
    gap: '12px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    padding: '20px 24px',
    overflowY: 'auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#241407',
    marginBottom: '24px',
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #f0e3d2',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '600px',
    boxShadow: '0 2px 8px rgba(27,15,6,0.06)',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#241407',
    fontSize: '14px',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #f0e3d2',
    marginBottom: '16px',
    fontSize: '14px',
    boxSizing: 'border-box',
    color: '#241407',
    background: '#fffaf3',
  },
  button: {
    padding: '10px 24px',
    backgroundColor: '#ff5a2c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  success: {
    color: '#0f7a44',
    backgroundColor: '#e7f7ee',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  error: {
    color: '#c83e16',
    backgroundColor: '#ffe7dc',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '13px',
  },
};

function VendorProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    companyName: '',
    suppliesOffered: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user?.vendorId) {
      getVendorById(user.vendorId)
        .then(r => {
          const v = r.data;
          setForm({
            companyName: v.companyName || '',
            suppliesOffered: v.suppliesOffered || '',
            location: v.location || '',
            contactEmail: v.contactEmail || '',
            contactPhone: v.contactPhone || '',
          });
        })
        .catch(() => setError('Failed to load profile'));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    try {
      await updateUserProfile({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess('Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await updateVendor(user.vendorId, form);
      setSuccess('Profile updated successfully!');
    } catch {
      setError('Failed to update profile');
    }
  };

  return (
    <div style={styles.container}>
      <VendorSidebar />
      <main style={styles.main}>
        <div style={styles.title}>My Profile</div>
        <div style={styles.card}>
          {success && <div style={styles.success}>{success}</div>}
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Company Name</label>
            <input style={styles.input} name="companyName" value={form.companyName} onChange={handleChange} />

            <label style={styles.label}>Supplies Offered</label>
            <input style={styles.input} name="suppliesOffered" value={form.suppliesOffered} onChange={handleChange} />

            <label style={styles.label}>Location</label>
            <input style={styles.input} name="location" value={form.location} onChange={handleChange} />

            <label style={styles.label}>Contact Email</label>
            <input style={styles.input} name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} />

            <label style={styles.label}>Contact Phone</label>
            <input style={styles.input} name="contactPhone" value={form.contactPhone} onChange={handleChange} />

            <button style={styles.button} type="submit">Save Changes</button>
          </form>
        </div>
        <div style={{ ...styles.card, marginTop: '24px' }}>
          <div style={{ fontSize: '17px', fontWeight: '700', color: '#2C1810', marginBottom: '20px' }}>Change Password</div>
          {pwSuccess && <div style={styles.success}>{pwSuccess}</div>}
          {pwError && <div style={styles.error}>{pwError}</div>}
          <form onSubmit={handlePasswordChange}>
            <label style={styles.label}>Current Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter current password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              required
            />
            <label style={styles.label}>New Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter new password"
              value={pwForm.newPassword}
              onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
              required
            />
            <label style={styles.label}>Confirm New Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Confirm new password"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              required
            />
            <button style={styles.button} type="submit">Update Password</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default VendorProfile;