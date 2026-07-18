import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewQuestion {
  question: string;
  userAnswer: string;
  evaluation: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  } | null;
  answeredAt?: Date;
}

export interface IInterviewReport {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  roadmap: string[];
  topicBreakdown: {
    topic: string;
    score: number;
    feedback: string;
  }[];
  generatedAt: Date;
}

export interface IInterview extends Document {
  user: mongoose.Types.ObjectId;
  type: 'technical' | 'hr' | 'coding';
  domain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'in-progress' | 'completed' | 'abandoned';
  questions: IInterviewQuestion[];
  currentQuestionIndex: number;
  totalQuestions: number;
  report?: IInterviewReport;
  createdAt: Date;
  updatedAt: Date;
}

const interviewQuestionSchema = new Schema<IInterviewQuestion>(
  {
    question: { type: String, required: true },
    userAnswer: { type: String, default: '' },
    evaluation: {
      score: { type: Number },
      feedback: { type: String },
      strengths: [{ type: String }],
      improvements: [{ type: String }],
    },
    answeredAt: { type: Date },
  },
  { _id: false }
);

const interviewReportSchema = new Schema<IInterviewReport>(
  {
    overallScore: { type: Number, default: 0 },
    summary: { type: String, default: '' },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    roadmap: [{ type: String }],
    topicBreakdown: [
      {
        topic: { type: String },
        score: { type: Number },
        feedback: { type: String },
      },
    ],
    generatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const interviewSchema = new Schema<IInterview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['technical', 'hr', 'coding'],
      required: true,
    },
    domain: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    questions: [interviewQuestionSchema],
    currentQuestionIndex: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 5 },
    report: interviewReportSchema,
  },
  { timestamps: true }
);

interviewSchema.index({ user: 1, createdAt: -1 });

const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
export default Interview;
