const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const vendorRoutes = require('./routes/vendorRoutes');
const sourcingRequestRoutes = require('./routes/sourcingRequestRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

app.use('/api/vendors', vendorRoutes);
app.use('/api/sourcing-requests', sourcingRequestRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/invoices', invoiceRoutes);

app.get('/', (req, res) => {
  res.send('Event Management Platform API');
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});