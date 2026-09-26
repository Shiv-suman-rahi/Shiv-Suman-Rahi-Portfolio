import mongoose from 'mongoose'

const resumeFileSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: 'current',
    },
    data: {
      type: Buffer,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      default: 'application/pdf',
    },
  },
  {
    timestamps: true,
  }
)

const ResumeFile = mongoose.model('ResumeFile', resumeFileSchema)

export default ResumeFile