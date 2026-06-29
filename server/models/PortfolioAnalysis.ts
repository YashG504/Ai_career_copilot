import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolioAnalysis extends Document {
  user: mongoose.Types.ObjectId;
  githubUsername: string;
  analysis: {
    score: number;
    overallAdvice: string;
    strengths: string[];
    weaknesses: string[];
    repoFeedback: {
      repoName: string;
      feedback: string;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const portfolioAnalysisSchema = new Schema<IPortfolioAnalysis>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    githubUsername: { type: String, required: true },
    analysis: {
      score: { type: Number, required: true },
      overallAdvice: { type: String, required: true },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      repoFeedback: [
        {
          repoName: { type: String, required: true },
          feedback: { type: String, required: true },
        },
      ],
    },
  },
  { timestamps: true }
);

const PortfolioAnalysis = mongoose.model<IPortfolioAnalysis>('PortfolioAnalysis', portfolioAnalysisSchema);
export default PortfolioAnalysis;
