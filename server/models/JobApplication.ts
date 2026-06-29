import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatus = 'applied' | 'oa' | 'interview' | 'offer' | 'rejected';

export interface IJobApplication extends Document {
  user: mongoose.Types.ObjectId;
  company: string;
  role: string;
  location?: string;
  status: ApplicationStatus;
  salary?: string;
  url?: string;
  notes?: string;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, default: '' },
    status: {
      type: String,
      enum: ['applied', 'oa', 'interview', 'offer', 'rejected'],
      default: 'applied',
    },
    salary: { type: String, default: '' },
    url: { type: String, default: '' },
    notes: { type: String, default: '' },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const JobApplication = mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);
export default JobApplication;
