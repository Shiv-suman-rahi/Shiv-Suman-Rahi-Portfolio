import mongoose from 'mongoose'
import { portfolioData } from '../../src/data/portfolioData.js'

const portfolioContentSchema = new mongoose.Schema(
  {
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: portfolioData,
    },
  },
  {
    timestamps: true,
  }
)

const PortfolioContent = mongoose.model('PortfolioContent', portfolioContentSchema)

export default PortfolioContent
