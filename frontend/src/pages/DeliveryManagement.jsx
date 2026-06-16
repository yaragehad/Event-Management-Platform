import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { VendorSidebar } from '../components/Sidebar';
import { getDeliveries, updateDeliveryStatus } from '../services/api';
import { sendMessage } from '../services/api';

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#FBF7F4' },
  main: { marginLeft: '240px', padding: '30px', flex: 1 },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#2C1810', marginBottom: '24px' },
  card: { backgroundColor: '#FFFFFF', border: '1px solid #EDE0D9', borderRadius: '10px', padding: '20px', marginBottom: '12px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardTitle: { fontWeight: '600', color: '#2C1810', fontSize: '15px' },
  cardMeta: { color: '#8B6555', fontSize: '13px', marginTop: '4px' },
  btnRow: { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' },
  btn: (active) => ({
    padding: '6px 14px',
    backgroundColor: active ? '#C4622D' : '#FFFFFF',
    color: active ? '#FFFFFF' : '#C4622D',
    border: '1px solid #C4622D',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  }),
  notifyBtn: {
    padding: '6px 14px',
    backgroundColor: '#FFFFFF',
    color: '#C0392B',
    border: '1px solid #C0392B',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  badge: (color) => ({
    backgroundColor: color === 'green' ? '#E8F5EE' : color === 'red' ? '#FDECEA' : '#F5EDE8',
    color: color === 'green' ? '#2D7A4F' : color === 'red' ? '#C0392B' : '#C4622D',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  }),
  success: { color: '#2D7A4F', backgroundColor: '#E8F5EE', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' },
  empty: { textAlign: 'center', color: '#8B6555', padding: '40px' },
};

function DeliveryManagement() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.vendorId) {
      getDeliveries({ vendorId: user.vendorId })
        .then(r => setDeliveries(r.data))
        .catch(() => {});
    }
  }, [user]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateDeliveryStatus(id, status);
      setDeliveries(deliveries.map(d => d.id === id ? { ...d, status } : d));
      setSuccess(`Delivery status updated to ${status}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      alert('Failed to update status');
    }
  };

const handleNotify = async (id) => {
  const reason = prompt('Enter reason for delay:');
  if (!reason) return;
  try {
    const delivery = deliveries.find(d => d.id === id);
    console.log('delivery found:', JSON.stringify(delivery));
    const eventId = delivery?.sourcingRequest?.event?.id;
    console.log('eventId:', eventId);
    if (!eventId) {
      alert('Could not find event for this delivery');
      return;
    }
    await sendMessage({
      senderId: user.id,
      content: `Delay notification: ${reason}`,
      eventId: eventId,
    });
    setSuccess(`Organizer notified about delay for delivery #${id}`);
    setTimeout(() => setSuccess(''), 3000);
  } catch {
    alert('Failed to notify organizer');
  }
};

  const handleConfirm = (id) => {
    handleStatusUpdate(id, 'DELIVERED');
  };

  const getStatusColor = (status) => {
    if (status === 'DELIVERED') return 'green';
    if (status === 'OUT_FOR_DELIVERY') return 'orange';
    return 'orange';
  };

  return (
    <div style={styles.container}>
      <VendorSidebar />
      <main style={styles.main}>
        <div style={styles.title}>Delivery Management</div>
        {success && <div style={styles.success}>{success}</div>}
        {deliveries.length === 0 && <div style={styles.empty}>No deliveries found</div>}
        {deliveries.map(d => (
          <div key={d.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                Delivery #{d.id} — {d.sourcingRequest?.event?.name || 'N/A'}
              </div>
              <span style={styles.badge(getStatusColor(d.status))}>{d.status}</span>
            </div>
            <div style={styles.cardMeta}>Vendor: {d.sourcingRequest?.vendor?.companyName || 'N/A'}</div>
            <div style={styles.cardMeta}>Event Date: {d.sourcingRequest?.event?.date ? new Date(d.sourcingRequest.event.date).toLocaleDateString() : 'N/A'}</div>
            <div style={styles.btnRow}>
              <button style={styles.btn(d.status === 'PREPARING')} onClick={() => handleStatusUpdate(d.id, 'PREPARING')}>Preparing</button>
              <button style={styles.btn(d.status === 'OUT_FOR_DELIVERY')} onClick={() => handleStatusUpdate(d.id, 'OUT_FOR_DELIVERY')}>Out for Delivery</button>
              <button style={styles.btn(d.status === 'DELIVERED')} onClick={() => handleConfirm(d.id)}>Log Confirmation</button>
            </div>
            {d.status !== 'DELIVERED' && (
              <button style={styles.notifyBtn} onClick={() => handleNotify(d.id)}>
                ⚠ Notify Organizer of Delay
              </button>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

export default DeliveryManagement;