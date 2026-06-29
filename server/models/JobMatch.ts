import mongoose, { Schema, Document } from 'mongoose';

export interface IJobMatch extends Document {
  user: mongoose.Types.ObjectId;
  resume?: mongoose.Types.ObjectId;
  jobTitle: string;
  company: string;
  jobDescription: string;
  matchScore: number;
  analysis: {
    summary: string;
    matchScore: number;
    matchingSkills: string[];
    missingSkills: string[];
    suggestedProjects: {
      title: string;
      description: string;
      skills: string[];
    }[];
    resumeImprovements: string[];
    keywordMatch: {
      found: string[];
      missing: string[];
    };
    experienceFit: string;
    cultureFit: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const jobMatchSchema = new Schema<IJobMatch>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resume: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
    },
    jobTitle: { type: String, default: '' },
    company: { type: String, default: '' },
    jobDescription: { type: String, required: true },
    matchScore: { type: Number, default: 0 },
    analysis: {
      summary: { type: String, default: '' },
      matchScore: { type: Number, default: 0 },
      matchingSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      suggestedProjects: [
        {
          title: { type: String },
          description: { type: String },
          skills: [{ type: String }],
        },
      ],
      resumeImprovements: [{ type: String }],
      keywordMatch: {
        found: [{ type: String }],
        missing: [{ type: String }],
      },
      experienceFit: { type: String, default: '' },
      cultureFit: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const JobMatch = mongoose.model<IJobMatch>('JobMatch', jobMatchSchema);
export default JobMatch;
