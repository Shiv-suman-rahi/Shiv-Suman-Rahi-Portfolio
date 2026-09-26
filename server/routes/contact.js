import express from 'express'
import nodemailer from 'nodemailer'
import twilio from 'twilio'
import ContactMessage from '../models/ContactMessage.js'
import env from "dotenv"
env.config();

const router = express.Router()

const sendEmailNotification = async ({ name, email, message }) => {
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const notifyEmail = process.env.NOTIFY_EMAIL

  if (!smtpUser || !smtpPass || !notifyEmail) {
    return
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT || 587) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  await transporter.sendMail({
    from: `"Portfolio Contact" <${smtpUser}>`,
    to: notifyEmail,
    subject: `New message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h3>New portfolio contact message</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br />')}</p>
    `,
  })
}

const sendWhatsAppNotification = async ({ name, email, message }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM
  const whatsappTo = process.env.NOTIFY_WHATSAPP_TO

  if (!accountSid || !authToken || !whatsappFrom || !whatsappTo) {
    return
  }

  const client = twilio(accountSid, authToken)

  await client.messages.create({
    from: whatsappFrom,
    to: whatsappTo,
    body: `New portfolio message from ${name} (${email})\n\n${message}`,
  })
}

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and message are required.',
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      })
    }

    // Save message to MongoDB
    const contact = await ContactMessage.create({
      name,
      email,
      message,
    })

    const notificationResults = await Promise.allSettled([
      sendEmailNotification({ name, email, message }),
      sendWhatsAppNotification({ name, email, message }),
    ])

    notificationResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Notification ${index === 0 ? 'email' : 'whatsapp'} failed:`,
          result.reason
        )
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully.',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        message: contact.message,
      },
    })
  } catch (error) {
    console.error('Contact API Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to send your message. Please try again later.',
    })
  }
})

export default router