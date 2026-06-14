const express = require('express');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

const vendorRoutes = require('./routes/vendorRoutes')
const sourcingRequestRoutes = require('./routes/sourcingRequestRoutes')
const deliveryRoutes = require('./routes/deliveryRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes')
const guestRoutes = require('./routes/guestRoutes')

app.use('/api/vendors', vendorRoutes)
app.use('/api/sourcing-requests', sourcingRequestRoutes)
app.use('/api/deliveries', deliveryRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/guests', guestRoutes)

app.get('/', (req, res) => {
  res.send('Event Management Platform API');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
