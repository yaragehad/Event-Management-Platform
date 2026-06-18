import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VendorSidebar } from '../components/Sidebar';
import { getRequestById, updateRequestStatus, sendMessage, getMessages } from '../services/api';

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#fdf4e9', fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: '12px', gap: '12px', boxSizing: 'border-box', overflow: 'hidden' },
  main: { flex: 1, padding: '20px 24px', overflowY: 'auto' },
  backBtn: { background: 'none', border: 'none', color: '#ff5a2c', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0, fontWeight: '600' },
  title: { fontSize: '24px', fontWeight: '800', color: '#241407', marginBottom: '24px', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" },
  card: { backgroundColor: '#ffffff', border: '1px solid #f0e3d2', borderRadius: '16px', padding: '30px', maxWidth: '650px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(27,15,6,0.05)' },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f0e3d2', paddingBottom: '16px' },
  label: { color: '#8a7a68', fontSize: '13px' },
  value: { color: '#241407', fontSize: '14px', fontWeight: '500' },
  badge: (color) => ({
    backgroundColor: color === 'green' ? '#e7f7ee' : color === 'red' ? '#ffe7dc' : '#ffe7dc',
    color: color === 'green' ? '#0f7a44' : color === 'red' ? '#c83e16' : '#ff5a2c',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  }),
  btnRow: { display: 'flex', gap: '12px', marginTop: '20px' },
  acceptBtn: { padding: '10px 24px', backgroundColor: '#0f7a44', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  declineBtn: { padding: '10px 24px', backgroundColor: '#c83e16', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  messageSection: { backgroundColor: '#ffffff', border: '1px solid #f0e3d2', borderRadius: '16px', padding: '30px', maxWidth: '650px', boxShadow: '0 2px 8px rgba(27,15,6,0.05)' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#241407', marginBottom: '16px' },
  textarea: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0e3d2', fontSize: '14px', boxSizing: 'border-box', color: '#241407', minHeight: '100px', marginBottom: '12px', resize: 'vertical', background: '#fffaf3' },
  sendBtn: { padding: '10px 24px', backgroundColor: '#ff5a2c', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  success: { color: '#0f7a44', backgroundColor: '#e7f7ee', padding: '10px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' },
  error: { color: '#c83e16', backgroundColor: '#ffe7dc', padding: '10px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' },
  messageBubble: { backgroundColor: '#ffe7dc', padding: '10px 14px', borderRadius: '10px', marginBottom: '8px' },
  messageSender: { fontWeight: '700', fontSize: '12px', color: '#1b0f06', marginBottom: '4px' },
  messageContent: { fontSize: '14px', color: '#241407' },
  messageTime: { fontSize: '11px', color: '#8a7a68', marginTop: '4px' },
};

function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getRequestById(id)
      .then(r => {
        setRequest(r.data);
        if (r.data.eventId) {
          getMessages(r.data.eventId)
            .then(m => setMessages(m.data))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      await updateRequestStatus(id, status);
      setRequest({ ...request, status });
      setSuccess(`Request ${status.toLowerCase()} successfully!`);
    } catch {
      setError('Failed to update status');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      await sendMessage({
        senderId: user.id,
        content: message,
        eventId: request.eventId,
      });
      setSuccess('Message sent to organizer!');
      setMessage('');
      getMessages(request.eventId).then(m => setMessages(m.data)).catch(() => {});
    } catch {
      setError('Failed to send message');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'ACCEPTED') return 'green';
    if (status === 'DECLINED') return 'red';
    return 'orange';
  };

  if (!request) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <VendorSidebar />
      <main style={styles.main}>
        <button style={styles.backBtn} onClick={() => navigate('/vendor/requests')}>← Back to Requests</button>
        <div style={styles.title}>Request Details</div>

        {success && <div style={styles.success}>{success}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.card}>
          <div style={styles.row}>
            <span style={styles.label}>Event</span>
            <span style={styles.value}>{request.event?.name || 'N/A'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Items Requested</span>
            <span style={styles.value}>{request.items}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Quantity</span>
            <span style={styles.value}>{request.quantity}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Delivery Date</span>
            <span style={styles.value}>{new Date(request.deliveryDate).toLocaleDateString()}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Notes</span>
            <span style={styles.value}>{request.notes || 'None'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Status</span>
            <span style={styles.badge(getStatusColor(request.status))}>{request.status}</span>
          </div>

          {request.status === 'PENDING' && (
            <div style={styles.btnRow}>
              <button style={styles.acceptBtn} onClick={() => handleStatusUpdate('ACCEPTED')}>✓ Accept Request</button>
              <button style={styles.declineBtn} onClick={() => handleStatusUpdate('DECLINED')}>✗ Decline Request</button>
            </div>
          )}
        </div>

        <div style={styles.messageSection}>
          <div style={styles.sectionTitle}>Messages with Organizer</div>

          {messages.length === 0 && (
            <div style={{ color: '#8B6555', fontSize: '13px', marginBottom: '16px' }}>No messages yet</div>
          )}

          {messages.map(m => (
            <div key={m.id} style={styles.messageBubble}>
              <div style={styles.messageSender}>User #{m.senderId}</div>
              <div style={styles.messageContent}>{m.content}</div>
              <div style={styles.messageTime}>{new Date(m.sentAt).toLocaleString()}</div>
            </div>
          ))}

          <textarea
            style={{ ...styles.textarea, marginTop: '16px' }}
            placeholder="Type your message or clarification note..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <button style={styles.sendBtn} onClick={handleSendMessage}>Send Message</button>
        </div>
      </main>
    </div>
  );
}

export default RequestDetail;