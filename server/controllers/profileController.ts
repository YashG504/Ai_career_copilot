import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const allowedFields = [
      'name', 'phone', 'location', 'bio', 'avatar',
      'skills', 'experience', 'education', 'preferences',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({ success: false, message: messages.join(', ') });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/profile/dashboard
// @access  Private
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // For now, return placeholder stats. These will be populated as we build more modules.
    const stats = {
      resumeScore: 0,
      jobApplications: 0,
      activeInterviews: 0,
      interviewScore: 0,
      atsScore: 0,
      aiCreditsUsed: 0,
      weeklyProgress: 0,
      profileCompletion: calculateProfileCompletion(user),
      recentActivities: [],
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper: Calculate profile completion percentage
function calculateProfileCompletion(user: any): number {
  let score = 0;
  const total = 7;

  if (user.name) score++;
  if (user.email) score++;
  if (user.phone) score++;
  if (user.bio) score++;
  if (user.skills?.length > 0) score++;
  if (user.experience?.length > 0) score++;
  if (user.education?.length > 0) score++;

  return Math.round((score / total) * 100);
}
