import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ORGANIZER'); // Default to Organizer
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send the dynamically selected role
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        // Log them in
        login({ id: data.userId, name, email, role: data.role }, data.token);
        
        // Traffic Cop: Send them to the right dashboard!
        if (data.role === 'VENUE_OWNER') {
          navigate('/venue/dashboard');
        } else {
          navigate('/organizer/venues');
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Is the backend running?');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fdf4e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(27,15,6,0.12)', width: '100%', maxWidth: '400px', border: '1px solid #f0e3d2' }}>

        <h2 style={{ color: '#1b0f06', textAlign: 'center', marginBottom: '24px', fontSize: '26px', fontWeight: '800', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
          Create an Account
        </h2>

        {error && <div style={{ backgroundColor: '#ffe7dc', color: '#c83e16', padding: '10px', borderRadius: '10px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#241407', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Account Type</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0e3d2', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fffaf3', fontSize: '14px', color: '#241407' }}
            >
              <option value="ORGANIZER">Event Organizer</option>
              <option value="VENUE_OWNER">Venue Owner</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#241407', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0e3d2', outline: 'none', boxSizing: 'border-box', fontSize: '14px', color: '#241407', background: '#fffaf3' }}
            />
          </div>

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
            style={{ backgroundColor: '#ff5a2c', color: '#ffffff', padding: '12px', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}
          >
            Register
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#8a7a68', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#ff5a2c', textDecoration: 'none', fontWeight: '700' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;