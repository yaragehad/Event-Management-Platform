const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const vendorRoutes = require('./routes/vendorRoutes');
const sourcingRequestRoutes = require('./routes/sourcingRequestRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/messages', messageRoutes);

app.use('/api/vendors', vendorRoutes);
app.use('/api/sourcing-requests', sourcingRequestRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/invoices', invoiceRoutes);

app.get('/', (req, res) => {
  res.send('Event Management Platform API');
});

app.post('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ ok: true });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});