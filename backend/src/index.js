require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Auth & Users
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Vendor routes (Member 3)
const vendorRoutes = require('./routes/vendorRoutes');
const sourcingRequestRoutes = require('./routes/sourcingRequestRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/vendors', vendorRoutes);
app.use('/api/sourcing-requests', sourcingRequestRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/messages', messageRoutes);

// Other routes
app.use('/api/venues', require('./routes/venue'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/layouts', require('./routes/layout'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/organizer', require('./routes/organizerRoutes'));
app.use('/api/notifications', require('./routes/notification'));

app.get('/', (req, res) => {
  res.send('Event Management Platform API');
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});