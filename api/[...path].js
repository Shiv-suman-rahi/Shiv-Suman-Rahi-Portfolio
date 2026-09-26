import app, { connectDatabase } from '../server/server.js'

export default async function handler(req, res) {
  try {
    await connectDatabase()
    return app(req, res)
  } catch (error) {
    console.error('API request failed:', error)
    return res.status(500).json({
      success: false,
      message: 'Unable to connect to the API database.',
    })
  }
}