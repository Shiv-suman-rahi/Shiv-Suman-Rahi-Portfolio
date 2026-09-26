import express from 'express'
import { mkdir, rename, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import PortfolioContent from '../models/PortfolioContent.js'
import { portfolioData } from '../../src/data/portfolioData.js'

const router = express.Router()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const resumePath = fileURLToPath(new URL('../uploads/resume.pdf', import.meta.url))

router.get('/resume', (_req, res) => {
  res.download(resumePath, 'resume.pdf', (error) => {
    if (error && !res.headersSent) {
      res.status(error.code === 'ENOENT' ? 404 : 500).json({
        success: false,
        message: error.code === 'ENOENT' ? 'No resume has been uploaded yet.' : 'Unable to download the resume.',
      })
    }
  })
})

router.post('/resume', express.raw({ type: ['application/pdf', 'application/octet-stream'], limit: '10mb' }), async (req, res) => {
  if (req.get('x-admin-password') !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid admin password.' })
  }

  if (!Buffer.isBuffer(req.body) || req.body.length < 5 || req.body.subarray(0, 5).toString() !== '%PDF-') {
    return res.status(400).json({ success: false, message: 'Please upload a valid PDF file.' })
  }

  const temporaryPath = join(dirname(resumePath), `resume-${randomUUID()}.tmp`)

  try {
    await mkdir(dirname(resumePath), { recursive: true })
    await writeFile(temporaryPath, req.body)
    await rename(temporaryPath, resumePath)

    return res.json({ success: true, resumeUrl: '/api/admin/resume' })
  } catch (error) {
    console.error('Resume upload failed:', error)
    return res.status(500).json({ success: false, message: 'Unable to upload the resume right now.' })
  }
})

const getPortfolioSeed = () => ({
  ...portfolioData,
  socialLinks: Array.isArray(portfolioData.socialLinks) ? portfolioData.socialLinks : [],
  skills: Array.isArray(portfolioData.skills) ? portfolioData.skills : [],
  projects: Array.isArray(portfolioData.projects) ? portfolioData.projects : [],
  experience: Array.isArray(portfolioData.experience) ? portfolioData.experience : [],
  education: Array.isArray(portfolioData.education) ? portfolioData.education : [],
  certifications: Array.isArray(portfolioData.certifications) ? portfolioData.certifications : [],
  leadership: Array.isArray(portfolioData.leadership) ? portfolioData.leadership : [],
})

const ensurePortfolio = async () => {
  const existing = await PortfolioContent.findOne()

  if (existing) {
    return existing.content
  }

  const created = await PortfolioContent.create({
    content: getPortfolioSeed(),
  })

  return created.content
}

router.post('/login', (req, res) => {
  const { password } = req.body || {}

  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin password.',
    })
  }

  return res.json({
    success: true,
    message: 'Admin access granted.',
  })
})

router.get('/portfolio', async (_req, res) => {
  try {
    const content = await ensurePortfolio()

    return res.json({
      success: true,
      data: content,
    })
  } catch (error) {
    console.error('Load portfolio content failed:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load portfolio content right now.',
    })
  }
})

router.put('/portfolio', async (req, res) => {
  try {
    const { password, data } = req.body || {}

    if (!password || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password.',
      })
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Portfolio data is required.',
      })
    }

    const payload = {
      ...getPortfolioSeed(),
      ...data,
      hero: {
        ...getPortfolioSeed().hero,
        ...(data.hero || {}),
      },
      about: {
        ...getPortfolioSeed().about,
        ...(data.about || {}),
      },
      socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : getPortfolioSeed().socialLinks,
      skills: Array.isArray(data.skills) ? data.skills : getPortfolioSeed().skills,
      projects: Array.isArray(data.projects) ? data.projects : getPortfolioSeed().projects,
      experience: Array.isArray(data.experience) ? data.experience : getPortfolioSeed().experience,
      education: Array.isArray(data.education) ? data.education : getPortfolioSeed().education,
      certifications: Array.isArray(data.certifications) ? data.certifications : getPortfolioSeed().certifications,
      leadership: Array.isArray(data.leadership) ? data.leadership : getPortfolioSeed().leadership,
    }

    const saved = await PortfolioContent.findOneAndUpdate(
      {},
      { content: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    return res.json({
      success: true,
      message: 'Portfolio content updated successfully.',
      data: saved.content,
    })
  } catch (error) {
    console.error('Update portfolio content failed:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to save portfolio content right now.',
    })
  }
})

export default router
