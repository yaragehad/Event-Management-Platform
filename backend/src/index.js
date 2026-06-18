require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.post('/api/auth/test', (req, res) => res.json({ ok: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const userRoutes = require('./routes/userRoutes')
const venueRoutes = require('./routes/venue')
const bookingRoutes = require('./routes/booking')
const layoutRoutes = require('./routes/layout')
const analyticsRoutes = require('./routes/analytics')
const vendorRoutes = require('./routes/vendorRoutes')
const sourcingRequestRoutes = require('./routes/sourcingRequestRoutes')
const deliveryRoutes = require('./routes/deliveryRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes')
const messageRoutes = require('./routes/messageRoutes')
const organizerRoutes = require('./routes/organizerRoutes')
const notificationRoutes = require('./routes/notification')
const staffRoutes = require('./routes/staff')
const guestRoutes = require('./routes/guestRoutes')
const emailRoutes = require('./routes/emailRoutes')
const eventRoutes = require('./routes/eventRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const directMessageRoutes = require('./routes/directMessageRoutes')

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/users', userRoutes)
app.use('/api/venues', venueRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/layouts', layoutRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/sourcing-requests', sourcingRequestRoutes)
app.use('/api/deliveries', deliveryRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/organizer', organizerRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/guests', guestRoutes)
app.use('/api/email', emailRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/direct-messages', directMessageRoutes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/', (req, res) => {
  res.send('Event Management Platform API')
})

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
