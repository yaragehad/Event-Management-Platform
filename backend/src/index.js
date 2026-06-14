require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 3001;
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(cors())
app.use(express.json());

const venueRoutes = require('./routes/venue')
const bookingRoutes = require('./routes/booking')
const layoutRoutes = require('./routes/layout')
const analyticsRoutes = require('./routes/analytics')
const vendorRoutes = require('./routes/vendorRoutes')
const sourcingRequestRoutes = require('./routes/sourcingRequestRoutes')
const deliveryRoutes = require('./routes/deliveryRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes')

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vendors', vendorRoutes)
app.use('/api/sourcing-requests', sourcingRequestRoutes)
app.use('/api/deliveries', deliveryRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/venues', venueRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/layouts', layoutRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use(cors())

app.get('/', (req, res) => {
  res.send('Event Management Platform API');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


