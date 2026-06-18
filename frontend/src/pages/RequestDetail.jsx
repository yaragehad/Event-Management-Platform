import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VendorSidebar } from '../components/Sidebar';
import { getRequestById, updateRequestStatus, sendMessage, getMessages } from '../services/api';

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#FBF7F4' },
  main: { marginLeft: '240px', padding: '30px', flex: 1 },
  backBtn: { background: 'none', border: 'none', color: '#C4622D', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0 },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#2C1810', marginBottom: '24px' },
  card: { backgroundColor: '#FFFFFF', border: '1px solid #EDE0D9', borderRadius: '10px', padding: '30px', maxWidth: '650px', marginBottom: '20px' },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #EDE0D9', paddingBottom: '16px' },
  label: { color: '#8B6555', fontSize: '13px' },
  value: { color: '#2C1810', fontSize: '14px', fontWeight: '500' },
  badge: (color) => ({
    backgroundColor: color === 'green' ? '#E8F5EE' : color === 'red' ? '#FDECEA' : '#F5EDE8',
    color: color === 'green' ? '#2D7A4F' : color === 'red' ? '#C0392B' : '#C4622D',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  }),
  btnRow: { display: 'flex', gap: '12px', marginTop: '20px' },
  acceptBtn: { padding: '10px 24px', backgroundColor: '#2D7A4F', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  declineBtn: { padding: '10px 24px', backgroundColor: '#C0392B', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  messageSection: { backgroundColor: '#FFFFFF', border: '1px solid #EDE0D9', borderRadius: '10px', padding: '30px', maxWidth: '650px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#2C1810', marginBottom: '16px' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #EDE0D9', fontSize: '14px', boxSizing: 'border-box', color: '#2C1810', minHeight: '100px', marginBottom: '12px', resize: 'vertical' },
  sendBtn: { padding: '10px 24px', backgroundColor: '#C4622D', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  success: { color: '#2D7A4F', backgroundColor: '#E8F5EE', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' },
  error: { color: '#C0392B', backgroundColor: '#FDECEA', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' },
  messageBubble: { backgroundColor: '#F5EDE8', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px' },
  messageSender: { fontWeight: '600', fontSize: '12px', color: '#6B2D0E', marginBottom: '4px' },
  messageContent: { fontSize: '14px', color: '#2C1810' },
  messageTime: { fontSize: '11px', color: '#8B6555', marginTop: '4px' },
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