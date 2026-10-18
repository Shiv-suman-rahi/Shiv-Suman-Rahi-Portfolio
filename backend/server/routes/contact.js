import express from 'express'
import nodemailer from 'nodemailer'
import twilio from 'twilio'
import ContactMessage from '../models/ContactMessage.js'
import env from "dotenv"
env.config();

const router = express.Router()

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]))

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
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
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
    const { name, email, message } = req.body || {}

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof message !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and message are required.',
      })
    }

    const cleanName = name.trim()
    const cleanEmail = email.trim()
    const cleanMessage = message.trim()

    if (cleanName.length > 100 || cleanEmail.length > 150 || cleanMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, or message exceeds the allowed length.',
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      })
    }

    // Save message to MongoDB
    const contact = await ContactMessage.create({
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
    })

    const notificationResults = await Promise.allSettled([
      sendEmailNotification({ name: cleanName, email: cleanEmail, message: cleanMessage }),
      sendWhatsAppNotification({ name: cleanName, email: cleanEmail, message: cleanMessage }),
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