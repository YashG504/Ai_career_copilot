import { Request, Response } from 'express';
import Resume from '../models/Resume';
import JobMatch from '../models/JobMatch';
import { matchJobWithResumeAI } from '../services/aiService';

// @desc    Match a job description against a resume
// @route   POST /api/jobmatch
// @access  Private
export const matchJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobDescription, jobTitle, company, resumeId } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
      res.status(400).json({
        success: false,
        message: 'Please provide a job description (at least 50 characters)',
      });
      return;
    }

    // Get resume text — either from a specific resume or the latest one
    let resumeText = '';
    let selectedResumeId = resumeId;

    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user?._id });
      if (!resume) {
        res.status(404).json({ success: false, message: 'Resume not found' });
        return;
      }
      resumeText = resume.extractedText;
    } else {
      // Use the latest resume
      const latestResume = await Resume.findOne({ user: req.user?._id })
        .sort({ createdAt: -1 });
      if (!latestResume) {
        res.status(400).json({
          success: false,
          message: 'No resume found. Please upload a resume first.',
        });
        return;
      }
      resumeText = latestResume.extractedText;
      selectedResumeId = latestResume._id;
    }

    if (!resumeText || resumeText.length < 50) {
      res.status(400).json({
        success: false,
        message: 'Resume text could not be extracted. Please upload a valid PDF resume.',
      });
      return;
    }

    // Run AI match
    const analysis = await matchJobWithResumeAI(resumeText, jobDescription);

    if (!analysis) {
      res.status(500).json({ success: false, message: 'AI matching failed' });
      return;
    }

    // Save match result
    const jobMatch = await JobMatch.create({
      user: req.user?._id,
      resume: selectedResumeId,
      jobTitle: jobTitle || '',
      company: company || '',
      jobDescription,
      matchScore: analysis.matchScore || 0,
      analysis,
    });

    res.status(201).json({ success: true, data: jobMatch });
  } catch (error) {
    console.error('Job match error:', error);
    res.status(500).json({ success: false, message: 'Failed to match job' });
  }
};

// @desc    Get all job matches for user
// @route   GET /api/jobmatch
// @access  Private
export const getJobMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const matches = await JobMatch.find({ user: req.user?._id })
      .select('-jobDescription -analysis')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single job match
// @route   GET /api/jobmatch/:id
// @access  Private
export const getJobMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await JobMatch.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!match) {
      res.status(404).json({ success: false, message: 'Job match not found' });
      return;
    }

    res.status(200).json({ success: true, data: match });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a job match
// @route   DELETE /api/jobmatch/:id
// @access  Private
export const deleteJobMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await JobMatch.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!match) {
      res.status(404).json({ success: false, message: 'Job match not found' });
      return;
    }

    await match.deleteOne();
    res.status(200).json({ success: true, message: 'Job match deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
