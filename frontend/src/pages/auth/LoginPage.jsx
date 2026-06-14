import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        // Redirect based on user role
        if (data.user.role === 'VENUE_OWNER') {
          navigate('/venue/dashboard');
        } else if (data.user.role === 'ORGANIZER') {
          navigate('/organizer/venues');
        } else {
          navigate('/login'); // Default fallback
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Is the backend running?');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FBF7F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', border: '1px solid #EDE0D9' }}>
        
        <h2 style={{ color: '#6B2D0E', textAlign: 'center', marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>
          Welcome Back
        </h2>

        {error && <div style={{ backgroundColor: '#FDECEA', color: '#C0392B', padding: '10px', borderRadius: '4px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#2C1810', marginBottom: '8px', fontSize: '14px' }}>Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #EDE0D9', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', color: '#2C1810', marginBottom: '8px', fontSize: '14px' }}>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #EDE0D9', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ backgroundColor: '#C4622D', color: '#FFFFFF', padding: '12px', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
          >
            Login to Dashboard
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#8B6555', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#C4622D', textDecoration: 'none', fontWeight: 'bold' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;