import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FBF7F4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(107,45,14,0.1)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #EDE0D9',
  },
  logo: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#6B2D0E',
    textAlign: 'center',
    marginBottom: '8px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#8B6555',
    marginBottom: '30px',
    fontSize: '14px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#2C1810',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #EDE0D9',
    marginBottom: '16px',
    fontSize: '14px',
    boxSizing: 'border-box',
    color: '#2C1810',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #EDE0D9',
    marginBottom: '20px',
    fontSize: '14px',
    boxSizing: 'border-box',
    color: '#2C1810',
    backgroundColor: '#FFFFFF',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#C4622D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  error: {
    color: '#C0392B',
    backgroundColor: '#FDECEA',
    padding: '10px',
    borderRadius: '6px',
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
        <div style={styles.logo}>🏢 VenueHub</div>
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