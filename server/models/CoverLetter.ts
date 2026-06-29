import mongoose, { Schema, Document } from 'mongoose';

export interface ICoverLetter extends Document {
  user: mongoose.Types.ObjectId;
  jobTitle: string;
  companyName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const coverLetterSchema = new Schema<ICoverLetter>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const CoverLetter = mongoose.model<ICoverLetter>('CoverLetter', coverLetterSchema);
export default CoverLetter;
