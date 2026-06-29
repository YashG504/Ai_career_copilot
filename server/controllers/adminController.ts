import { Request, Response } from 'express';
import User from '../models/User';
import Resume from '../models/Resume';
import JobMatch from '../models/JobMatch';
import Interview from '../models/Interview';
import SkillGap from '../models/SkillGap';
import LearningPath from '../models/LearningPath';
import JobApplication from '../models/JobApplication';

// @desc    Get system wide stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResumes = await Resume.countDocuments();
    const totalJobMatches = await JobMatch.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const totalSkillGaps = await SkillGap.countDocuments();
    const totalLearningPaths = await LearningPath.countDocuments();
    const totalJobApplications = await JobApplication.countDocuments();

    const totalAIGenerations = totalJobMatches + totalInterviews + totalSkillGaps + totalLearningPaths;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalResumes,
        totalJobApplications,
        totalAIGenerations,
        breakdown: {
          jobMatches: totalJobMatches,
          interviews: totalInterviews,
          skillGaps: totalSkillGaps,
          learningPaths: totalLearningPaths
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
