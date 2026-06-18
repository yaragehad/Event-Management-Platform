import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:3001';

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
    <div style={{ minHeight: '100vh', backgroundColor: '#fdf4e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(27,15,6,0.12)', width: '100%', maxWidth: '400px', border: '1px solid #f0e3d2' }}>

        <h2 style={{ color: '#1b0f06', textAlign: 'center', marginBottom: '24px', fontSize: '26px', fontWeight: '800', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
          Welcome Back
        </h2>

        {error && <div style={{ backgroundColor: '#ffe7dc', color: '#c83e16', padding: '10px', borderRadius: '10px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#241407', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0e3d2', outline: 'none', boxSizing: 'border-box', fontSize: '14px', color: '#241407', background: '#fffaf3' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#241407', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0e3d2', outline: 'none', boxSizing: 'border-box', fontSize: '14px', color: '#241407', background: '#fffaf3' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#ff5a2c', color: '#ffffff', padding: '12px', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}
          >
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#8a7a68', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#ff5a2c', textDecoration: 'none', fontWeight: '700' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;