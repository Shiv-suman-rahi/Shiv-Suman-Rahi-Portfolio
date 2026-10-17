import app from './server.js'

export default function vercelHandler(req, res) {
  return app(req, res)
}