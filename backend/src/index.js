const express = require('express');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Event Management Platform API');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
