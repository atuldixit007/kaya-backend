require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const { sendEmail } = require('./services/email.service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(hpp());
app.use(cors());
app.use(bodyParser.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.post('/api/send-email', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const result = await sendEmail({ name, email, phone, message });

  if (result.success) {
    console.log(`Email sent from ${email} by ${name}`);
    return res.status(200).json({ message: 'Email sent successfully' });
  } else {
    console.log(`Email was not sent from ${email} by ${name}`);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});