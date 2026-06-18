import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fdf4e9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(27,15,6,0.10)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #f0e3d2',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1b0f06',
    textAlign: 'center',
    marginBottom: '8px',
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
  },
  subtitle: {
    textAlign: 'center',
    color: '#8a7a68',
    marginBottom: '30px',
    fontSize: '14px',
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
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #f0e3d2',
    marginBottom: '20px',
    fontSize: '14px',
    boxSizing: 'border-box',
    color: '#241407',
    backgroundColor: '#fffaf3',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#ff5a2c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
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

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VENDOR');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Simulate login - in real app this would call the auth API
    const userData = {
      id: 1,
      name: email.split('@')[0],
      email,
      role,
      vendorId: role === 'VENDOR' ? 1 : null,
    };

    login(userData);

    if (role === 'VENDOR') {
      navigate('/vendor/dashboard');
    } else {
      navigate('/organizer/vendors');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🏢 VendorHub</div>
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

          <label style={styles.label}>Login as</label>
          <select
            style={styles.select}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="VENDOR">Vendor</option>
            <option value="ORGANIZER">Organizer</option>
          </select>

          <button style={styles.button} type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;