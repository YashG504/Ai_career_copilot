import mongoose, { Schema, Document } from 'mongoose';

export interface ITask {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface IResource {
  _id?: mongoose.Types.ObjectId;
  title: string;
  url: string;
  type: string;
}

export interface IDayPlan {
  dayNumber: number;
  theme: string;
  tasks: ITask[];
  resources: IResource[];
}

export interface ILearningPath extends Document {
  user: mongoose.Types.ObjectId;
  goal: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  durationDays: number;
  progress: number;
  days: IDayPlan[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
  }
);

const resourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    url: { type: String, default: '' },
    type: { type: String, default: 'article' },
  }
);

const dayPlanSchema = new Schema<IDayPlan>(
  {
    dayNumber: { type: Number, required: true },
    theme: { type: String, required: true },
    tasks: [taskSchema],
    resources: [resourceSchema],
  },
  { _id: false }
);

const learningPathSchema = new Schema<ILearningPath>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goal: { type: String, required: true },
    currentLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    durationDays: { type: Number, default: 30 },
    progress: { type: Number, default: 0 },
    days: [dayPlanSchema],
  },
  { timestamps: true }
);

const LearningPath = mongoose.model<ILearningPath>('LearningPath', learningPathSchema);
export default LearningPath;
