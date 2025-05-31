// Load environment variables from .env
require('dotenv').config();

// Core dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');

// Custom service
const { sendEmail } = require('./services/email.service');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());      // Secure headers
app.use(hpp());         // Prevent HTTP parameter pollution
app.use(cors());        // Enable CORS

// Body parser
app.use(bodyParser.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // Limit each IP to 100 requests
});
app.use(limiter);

// === Routes ===
app.post('/api/send-email', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await sendEmail({ name, email, phone, message });

    if (result.success) {
      console.log(`✅ Email sent from ${email} by ${name}`);
      return res.status(200).json({ message: 'Email sent successfully' });
    } else {
      console.error(`❌ Failed to send email from ${email}`);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

// === Health check / default route ===
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
});
