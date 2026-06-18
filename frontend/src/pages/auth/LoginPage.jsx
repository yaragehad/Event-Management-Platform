import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:3001';

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#FBF7F4', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(107,45,14,0.1)', width: '100%', maxWidth: '400px', border: '1px solid #EDE0D9' },
  logo: { fontSize: '28px', fontWeight: 'bold', color: '#6B2D0E', textAlign: 'center', marginBottom: '8px' },
  subtitle: { textAlign: 'center', color: '#8B6555', marginBottom: '30px', fontSize: '14px' },
  label: { display: 'block', marginBottom: '6px', color: '#2C1810', fontSize: '14px', fontWeight: '500' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #EDE0D9', marginBottom: '16px', fontSize: '14px', boxSizing: 'border-box', color: '#2C1810' },
  button: { width: '100%', padding: '12px', backgroundColor: '#C4622D', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  error: { color: '#C0392B', backgroundColor: '#FDECEA', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' },
};

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      // Save the logged-in user + token in context
      login(data.user, data.token);

      // Route based on role
      const role = data.user.role;
      if (role === 'GUEST') {
        // Guests need their guestId for the dashboard URL
        try {
          const gRes = await fetch(`${API}/api/guests/by-user/${data.user.id}`);
          const gData = await gRes.json();
          if (gRes.ok && gData.guestId) {
            navigate(`/my-events?guestId=${gData.guestId}`);
          } else {
            setError('No guest profile found for this account.');
            setLoading(false);
          }
        } catch {
          setError('Could not load your guest profile.');
          setLoading(false);
        }
      } else if (role === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else if (role === 'ORGANIZER') {
        navigate('/organizer/dashboard');
      } else if (role === 'VENUE_OWNER') {
        navigate('/venue/dashboard');
      } else if (role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Could not connect to the server.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🎟️ VenueHub</div>
        <div style={styles.subtitle}>Event Management Platform</div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;