import express from 'express'
import mongoose from 'mongoose'
import PortfolioContent from '../models/PortfolioContent.js'
import ResumeFile from '../models/ResumeFile.js'
import { portfolioData } from '../data/portfolioData.js'

const router = express.Router()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

router.get('/resume', async (_req, res) => {
  try {
    const resume = await ResumeFile.findById('current')

    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume has been uploaded yet.' })
    }

    res.set({
      'Content-Type': resume.contentType || 'application/pdf',
      'Content-Disposition': 'attachment; filename="resume.pdf"',
      'Content-Length': resume.data.length,
      'Cache-Control': 'no-store',
    })
    return res.send(resume.data)
  } catch (error) {
    console.error('Resume download failed:', error)
    return res.status(500).json({ success: false, message: 'Unable to download the resume.' })
  }
})

router.post('/resume', express.raw({ type: ['application/pdf', 'application/octet-stream'], limit: '10mb' }), async (req, res) => {
  if (req.get('x-admin-password') !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid admin password.' })
  }

  if (!Buffer.isBuffer(req.body) || req.body.length < 5 || req.body.subarray(0, 5).toString() !== '%PDF-') {
    return res.status(400).json({ success: false, message: 'Please upload a valid PDF file.' })
  }

  try {
    await ResumeFile.findByIdAndUpdate(
      'current',
      { data: req.body, contentType: 'application/pdf' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    const portfolio = await ensurePortfolio()
    portfolio.content = { ...portfolio.content, resumeUrl: '/api/admin/resume' }
    portfolio.markModified('content')
    await portfolio.save()

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

const PORTFOLIO_DOCUMENT_ID = new mongoose.Types.ObjectId('000000000000000000000001')

const ensurePortfolio = async () => {
  const current = await PortfolioContent.findById(PORTFOLIO_DOCUMENT_ID)

  if (current) {
    return current
  }

  const existing = await PortfolioContent.findOne().sort({ updatedAt: -1, _id: -1 })

  try {
    return await PortfolioContent.create({
      _id: PORTFOLIO_DOCUMENT_ID,
      content: existing?.content || getPortfolioSeed(),
    })
  } catch (error) {
    if (error.code !== 11000) {
      throw error
    }

    const concurrentInsert = await PortfolioContent.findById(PORTFOLIO_DOCUMENT_ID)
    if (!concurrentInsert) {
      throw error
    }

    return concurrentInsert
  }
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
    const portfolio = await ensurePortfolio()

    return res.json({
      success: true,
      data: portfolio.content,
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

    await ensurePortfolio()
    const saved = await PortfolioContent.findByIdAndUpdate(
      PORTFOLIO_DOCUMENT_ID,
      { content: payload },
      { new: true, runValidators: true }
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
