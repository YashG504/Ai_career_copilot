import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeAnalysis {
  atsScore: number;
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  technicalSkills: string[];
  softSkills: string[];
  grammarIssues: string[];
  formattingSuggestions: string[];
  improvements: string[];
  experienceLevel: string;
  analyzedAt: Date;
}

export interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  extractedText: string;
  version: number;
  label: string;
  analysis?: IResumeAnalysis;
  isAnalyzed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resumeAnalysisSchema = new Schema<IResumeAnalysis>(
  {
    atsScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    summary: { type: String, default: '' },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    missingKeywords: [{ type: String }],
    technicalSkills: [{ type: String }],
    softSkills: [{ type: String }],
    grammarIssues: [{ type: String }],
    formattingSuggestions: [{ type: String }],
    improvements: [{ type: String }],
    experienceLevel: { type: String, default: '' },
    analyzedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const resumeSchema = new Schema<IResume>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    extractedText: { type: String, default: '' },
    version: { type: Number, default: 1 },
    label: { type: String, default: '' },
    analysis: { type: resumeAnalysisSchema },
    isAnalyzed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model<IResume>('Resume', resumeSchema);
export default Resume;
