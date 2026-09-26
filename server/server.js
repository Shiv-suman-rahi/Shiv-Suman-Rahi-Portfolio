import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import dns from 'node:dns'

import contactRouter from './routes/contact.js'
import adminRouter from './routes/admin.js'

// DNS configuration
dns.setServers(['8.8.8.8', '1.1.1.1'])

const app = express()

const port = Number(process.env.PORT) || 5000

const allowedOrigins =
  process.env.CLIENT_ORIGIN
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) || []

const isAllowedOrigin = (origin) => {
  if (!origin) return true

  if (allowedOrigins.length) {
    return allowedOrigins.includes(origin)
  }

  return /^(http:\/\/localhost(:\d+)?|http:\/\/127\.0\.0\.1(:\d+)?|https:\/\/localhost(:\d+)?)$/.test(origin)
}

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin))
    },
    credentials: true,
  })
)

// JSON middleware
app.use(express.json({ limit: '20kb' }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Contact API is running',
  })
})

// Contact API
app.use('/api/contact', contactRouter)

// Admin API
app.use('/api/admin', adminRouter)

// Error handler
app.use((error, _req, res, _next) => {
  console.error(error)

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Request body must be valid JSON.',
    })
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Uploaded file must be 10 MB or smaller.',
    })
  }

  return res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
  })
})

// Start server
export async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is required to start the server.'
    )
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI)

    console.log('MongoDB connected successfully')

    app.listen(port, () => {
      console.log(`Contact API listening on port ${port}`)
    })
  } catch (error) {
    console.error('MongoDB connection error:')
    console.error(error.message)

    process.exitCode = 1
  }
}

// Start automatically
if (process.env.NODE_ENV !== 'test') {
  startServer()
}

export default app