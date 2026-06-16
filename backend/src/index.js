require('dotenv').config()
console.log('>>> EMAIL_USER AT RUNTIME:', process.env.EMAIL_USER)
const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3001

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}))
app.use(express.json())

const venueRoutes = require('./routes/venue')
const bookingRoutes = require('./routes/booking')
const layoutRoutes = require('./routes/layout')
const analyticsRoutes = require('./routes/analytics')
const vendorRoutes = require('./routes/vendorRoutes')
const sourcingRequestRoutes = require('./routes/sourcingRequestRoutes')
const deliveryRoutes = require('./routes/deliveryRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes')
const guestRoutes = require('./routes/guestRoutes')
const emailRoutes = require('./routes/emailRoutes')
const eventRoutes = require('./routes/eventRoutes')

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/venues', venueRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/layouts', layoutRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/sourcing-requests', sourcingRequestRoutes)
app.use('/api/deliveries', deliveryRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/guests', guestRoutes)
app.use('/api/email', emailRoutes)
app.use('/api/events', eventRoutes)

app.get('/', (req, res) => {
  res.send('Event Management Platform API')
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})