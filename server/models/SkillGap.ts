import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillGap extends Document {
  user: mongoose.Types.ObjectId;
  resume?: mongoose.Types.ObjectId;
  jobDescription: string;
  jobTitle: string;
  analysis: {
    summary: string;
    currentSkills: string[];
    requiredSkills: string[];
    missingSkills: string[];
    skillMatchPercentage: number;
    learningRoadmap: {
      week: number;
      title: string;
      skills: string[];
      tasks: string[];
      resources: string[];
    }[];
    recommendedCourses: {
      title: string;
      platform: string;
      url: string;
      skill: string;
    }[];
    suggestedProjects: {
      title: string;
      description: string;
      skills: string[];
      difficulty: string;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const skillGapSchema = new Schema<ISkillGap>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume' },
    jobDescription: { type: String, required: true },
    jobTitle: { type: String, default: '' },
    analysis: {
      summary: { type: String, default: '' },
      currentSkills: [{ type: String }],
      requiredSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      skillMatchPercentage: { type: Number, default: 0 },
      learningRoadmap: [
        {
          week: { type: Number },
          title: { type: String },
          skills: [{ type: String }],
          tasks: [{ type: String }],
          resources: [{ type: String }],
        },
      ],
      recommendedCourses: [
        {
          title: { type: String },
          platform: { type: String },
          url: { type: String },
          skill: { type: String },
        },
      ],
      suggestedProjects: [
        {
          title: { type: String },
          description: { type: String },
          skills: [{ type: String }],
          difficulty: { type: String },
        },
      ],
    },
  },
  { timestamps: true }
);

const SkillGap = mongoose.model<ISkillGap>('SkillGap', skillGapSchema);
export default SkillGap;
