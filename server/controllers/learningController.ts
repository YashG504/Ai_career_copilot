import { Request, Response } from 'express';
import LearningPath from '../models/LearningPath';
import { generateLearningPathAI } from '../services/aiService';

// @desc    Generate a new learning path
// @route   POST /api/learning
// @access  Private
export const generatePath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goal, currentLevel, durationDays } = req.body;

    if (!goal) {
      res.status(400).json({ success: false, message: 'Please provide a learning goal' });
      return;
    }

    const duration = durationDays || 30;
    const level = currentLevel || 'beginner';

    const aiPlan = await generateLearningPathAI(goal, level, duration);

    if (!aiPlan || !aiPlan.days || aiPlan.days.length === 0) {
      res.status(500).json({ success: false, message: 'Failed to generate learning path' });
      return;
    }

    // Initialize all tasks as not completed
    const days = aiPlan.days.map((day: any) => ({
      ...day,
      tasks: day.tasks.map((task: any) => ({ ...task, isCompleted: false })),
    }));

    const learningPath = await LearningPath.create({
      user: req.user?._id,
      goal,
      currentLevel: level,
      durationDays: duration,
      progress: 0,
      days,
    });

    res.status(201).json({ success: true, data: learningPath });
  } catch (error) {
    console.error('Generate learning path error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all learning paths for user
// @route   GET /api/learning
// @access  Private
export const getPaths = async (req: Request, res: Response): Promise<void> => {
  try {
    const paths = await LearningPath.find({ user: req.user?._id })
      .select('goal currentLevel durationDays progress createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: paths });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get a single learning path
// @route   GET /api/learning/:id
// @access  Private
export const getPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const path = await LearningPath.findOne({ _id: req.params.id, user: req.user?._id });

    if (!path) {
      res.status(404).json({ success: false, message: 'Learning path not found' });
      return;
    }

    res.status(200).json({ success: true, data: path });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update task completion status
// @route   PUT /api/learning/:id/task
// @access  Private
export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dayNumber, taskId, isCompleted } = req.body;
    const path = await LearningPath.findOne({ _id: req.params.id, user: req.user?._id });

    if (!path) {
      res.status(404).json({ success: false, message: 'Learning path not found' });
      return;
    }

    const day = path.days.find((d) => d.dayNumber === dayNumber);
    if (!day) {
      res.status(404).json({ success: false, message: 'Day not found in learning path' });
      return;
    }

    const task = day.tasks.find((t) => t._id?.toString() === taskId);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    task.isCompleted = isCompleted;

    // Recalculate progress
    let totalTasks = 0;
    let completedTasks = 0;

    path.days.forEach((d) => {
      d.tasks.forEach((t) => {
        totalTasks++;
        if (t.isCompleted) completedTasks++;
      });
    });

    path.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await path.save();

    res.status(200).json({ success: true, data: path });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a learning path
// @route   DELETE /api/learning/:id
// @access  Private
export const deletePath = async (req: Request, res: Response): Promise<void> => {
  try {
    const path = await LearningPath.findOne({ _id: req.params.id, user: req.user?._id });

    if (!path) {
      res.status(404).json({ success: false, message: 'Learning path not found' });
      return;
    }

    await path.deleteOne();
    res.status(200).json({ success: true, message: 'Learning path deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
