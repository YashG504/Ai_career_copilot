import { Request, Response } from 'express';
import JobApplication from '../models/JobApplication';
import Interview from '../models/Interview';
import Resume from '../models/Resume';
import JobMatch from '../models/JobMatch';
import SkillGap from '../models/SkillGap';
import LearningPath from '../models/LearningPath';
import { getFromCache, setInCache } from '../utils/cache';

// @desc    Get all analytics data for dashboard
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const cacheKey = `analytics_${userId}`;
    const cachedData = getFromCache(cacheKey);

    if (cachedData) {
      res.status(200).json({ success: true, data: cachedData, cached: true });
      return;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Run all 8 queries in parallel to drastically improve performance
    const [
      jobs,
      recentJobs,
      interviews,
      latestResume,
      matchCount,
      skillGapCount,
      learningPathCount,
      interviewCount
    ] = await Promise.all([
      JobApplication.find({ user: userId }),
      JobApplication.find({ user: userId, createdAt: { $gte: sevenDaysAgo } }),
      Interview.find({ user: userId, status: 'completed' }).sort({ createdAt: -1 }).limit(10),
      Resume.findOne({ user: userId }).sort({ createdAt: -1 }),
      JobMatch.countDocuments({ user: userId }),
      SkillGap.countDocuments({ user: userId }),
      LearningPath.countDocuments({ user: userId }),
      Interview.countDocuments({ user: userId })
    ]);

    // 1. Job Applications Status Counts
    const jobStats = {
      applied: 0,
      oa: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      total: jobs.length,
    };
    jobs.forEach(job => {
      if (job.status in jobStats) {
        jobStats[job.status as keyof typeof jobStats]++;
      }
    });

    // 2. Weekly Job Applications (Last 7 days)
    // Create array of last 7 dates
    const weeklyData: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      weeklyData[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
    }

    recentJobs.forEach(job => {
      const dayName = job.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
      if (weeklyData[dayName] !== undefined) {
        weeklyData[dayName]++;
      }
    });

    const weeklyApplications = Object.keys(weeklyData).map(day => ({
      day,
      applications: weeklyData[day]
    }));

    // 3. Interview Scores
    let avgInterviewScore = 0;
    let interviewData: any[] = [];
    if (interviews.length > 0) {
      const totalScore = interviews.reduce((sum, iv) => sum + (iv.report?.overallScore || 0), 0);
      avgInterviewScore = Math.round(totalScore / interviews.length);
      
      interviewData = interviews.reverse().map((iv, index) => ({
        name: `Mock ${index + 1}`,
        score: iv.report?.overallScore || 0,
        domain: iv.domain
      }));
    }

    // 4. Latest Resume Score
    const resumeScore = latestResume?.analysis?.atsScore || 0;

    // 5. AI Usage Counts
    
    const aiUsage = [
      { name: 'Job Matches', value: matchCount },
      { name: 'Interviews', value: interviewCount },
      { name: 'Skill Gaps', value: skillGapCount },
      { name: 'Learning Paths', value: learningPathCount },
    ];

    const responseData = {
      jobStats,
      weeklyApplications,
      avgInterviewScore,
      interviewData,
      resumeScore,
      aiUsage
    };

    // Cache the compiled data for 5 minutes (300 seconds)
    setInCache(cacheKey, responseData, 300);

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
