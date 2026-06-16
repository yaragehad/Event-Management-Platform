import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VendorSidebar } from '../components/Sidebar';
import { createInvoice } from '../services/api';

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#FBF7F4' },
  main: { marginLeft: '240px', padding: '30px', flex: 1 },
  backBtn: { background: 'none', border: 'none', color: '#C4622D', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0 },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#2C1810', marginBottom: '24px' },
  card: { backgroundColor: '#FFFFFF', border: '1px solid #EDE0D9', borderRadius: '10px', padding: '30px', maxWidth: '600px' },
  label: { display: 'block', marginBottom: '6px', color: '#2C1810', fontSize: '14px', fontWeight: '500' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #EDE0D9', marginBottom: '16px', fontSize: '14px', boxSizing: 'border-box', color: '#2C1810' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #EDE0D9', marginBottom: '16px', fontSize: '14px', boxSizing: 'border-box', color: '#2C1810', minHeight: '100px', resize: 'vertical' },
  fileInput: { width: '100%', padding: '10px 0', marginBottom: '16px', fontSize: '14px', color: '#2C1810' },
  button: { padding: '10px 24px', backgroundColor: '#C4622D', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  success: { color: '#2D7A4F', backgroundColor: '#E8F5EE', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' },
  error: { color: '#C0392B', backgroundColor: '#FDECEA', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' },
};

function CreateInvoice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ amount: '', description: '' });
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
            <input style={styles.fileInput} type="file" onChange={e => setFile(e.target.files[0])} />
            {file && <div style={{ color: '#8B6555', fontSize: '13px', marginBottom: '16px' }}>Selected: {file.name}</div>}

            <button style={styles.button} type="submit">Submit Invoice</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateInvoice;