const axios = require('axios');

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

/**
 * Sends an email using SendGrid API.
 * @param {Object} param0 - Contact form details.
 * @param {string} param0.name - Sender's name.
 * @param {string} param0.email - Sender's email.
 * @param {string} param0.phone - Sender's phone number.
 * @param {string} param0.message - Message content.
 * @returns {Object} - { success: true } or { success: false, error: '...' }
 */
/**
 * Sends an email using SendGrid with the provided contact form details.
 *
 * @async
 * @function
 * @param {Object} params - The contact form submission details.
 * @param {string} params.name - The name of the person submitting the form.
 * @param {string} params.email - The email address of the person submitting the form.
 * @param {string} params.phone - The phone number of the person submitting the form.
 * @param {string} params.message - The message from the person submitting the form.
 * @returns {Promise<Object>} Resolves with an object indicating success or failure.
 * @returns {boolean} return.success - Indicates if the email was sent successfully.
 * @returns {string} [return.error] - Error message if the email could not be sent.
 *
 * @throws Will not throw, but logs errors and returns a failure object if sending fails.
 */
async function sendEmail({ name, email, phone, message }) {
  if (!name || !email || !phone || !message) {
    return { success: false, error: 'Missing required fields' };
  }

  const fromEmail = process.env.FROM_EMAIL;
  const toEmails = (process.env.TO_EMAILS || '')
    .split(',')
    .map(email => ({ email: email.trim() }))
    .filter(entry => entry.email); // avoid empty strings

  if (!process.env.SENDGRID_API_KEY || !fromEmail || toEmails.length === 0) {
    return { success: false, error: 'Email configuration is missing' };
  }

  const data = {
    personalizations: [
      {
        to: toEmails,
        subject: 'New Contact Us Submission',
      },
    ],
    from: { email: fromEmail },
    content: [
      {
        type: 'text/html',
        value: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong><br>${message}</p>
        `,
      },
    ],
  };

  try {
    await axios.post(SENDGRID_API_URL, data, {
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error.response?.data || error.message);
    return { success: false, error: 'Failed to send email' };
  }
}

module.exports = { sendEmail };
