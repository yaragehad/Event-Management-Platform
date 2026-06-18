import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VendorSidebar } from '../components/Sidebar';
import { createInvoice } from '../services/api';

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#fdf4e9', fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: '12px', gap: '12px', boxSizing: 'border-box', overflow: 'hidden' },
  main: { flex: 1, padding: '20px 24px', overflowY: 'auto' },
  backBtn: { background: 'none', border: 'none', color: '#ff5a2c', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0, fontWeight: '600' },
  title: { fontSize: '24px', fontWeight: '800', color: '#241407', marginBottom: '24px', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" },
  card: { backgroundColor: '#ffffff', border: '1px solid #f0e3d2', borderRadius: '16px', padding: '30px', maxWidth: '600px', boxShadow: '0 2px 8px rgba(27,15,6,0.05)' },
  label: { display: 'block', marginBottom: '6px', color: '#241407', fontSize: '14px', fontWeight: '600' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0e3d2', marginBottom: '16px', fontSize: '14px', boxSizing: 'border-box', color: '#241407', background: '#fffaf3' },
  textarea: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0e3d2', marginBottom: '16px', fontSize: '14px', boxSizing: 'border-box', color: '#241407', minHeight: '100px', resize: 'vertical', background: '#fffaf3' },
  fileInput: { width: '100%', padding: '10px 0', marginBottom: '16px', fontSize: '14px', color: '#241407' },
  button: { padding: '10px 24px', backgroundColor: '#ff5a2c', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  success: { color: '#0f7a44', backgroundColor: '#e7f7ee', padding: '10px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' },
  error: { color: '#c83e16', backgroundColor: '#ffe7dc', padding: '10px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' },
};

function CreateInvoice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ amount: '', description: '' });
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      e.target.value = '';
      return;
    }
    setError('');
    setFile(selected);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setSuccess('');
  setError('');
  if (!form.amount) {
    setError('Amount is required');
    return;
  }
  try {
    let documentName = null;
    let documentData = null;

    if (file) {
      documentName = file.name;
      documentData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    await createInvoice({
      vendorId: user.vendorId,
      amount: form.amount,
      description: form.description,
      documentName,
      documentData,
    });
    setSuccess('Invoice submitted successfully!');
    setTimeout(() => navigate('/vendor/invoices'), 1500);
  } catch {
    setError('Failed to submit invoice');
  }
};

  return (
    <div style={styles.container}>
      <VendorSidebar />
      <main style={styles.main}>
        <button style={styles.backBtn} onClick={() => navigate('/vendor/invoices')}>← Back to Invoices</button>
        <div style={styles.title}>Create Invoice</div>
        <div style={styles.card}>
          {success && <div style={styles.success}>{success}</div>}
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Amount ($)</label>
            <input style={styles.input} name="amount" type="number" placeholder="0.00" value={form.amount} onChange={handleChange} />

            <label style={styles.label}>Description</label>
            <textarea style={styles.textarea} name="description" placeholder="Describe the invoice items..." value={form.description} onChange={handleChange} />

            <label style={styles.label}>Attach Supporting Document</label>
            <input style={styles.fileInput} type="file" onChange={handleFileChange} />
            {file && <div style={{ color: '#8B6555', fontSize: '13px', marginBottom: '16px' }}>Selected: {file.name}</div>}

            <button style={styles.button} type="submit">Submit Invoice</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateInvoice;