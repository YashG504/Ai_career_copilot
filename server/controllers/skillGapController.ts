import { Request, Response } from 'express';
import Resume from '../models/Resume';
import SkillGap from '../models/SkillGap';
import { analyzeSkillGapAI } from '../services/aiService';

// @desc    Analyze skill gap
// @route   POST /api/skillgap
// @access  Private
export const analyzeSkillGap = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobDescription, jobTitle, resumeId } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
      res.status(400).json({ success: false, message: 'Job description must be at least 50 characters' });
      return;
    }

    let resumeText = '';
    let selectedResumeId = resumeId;

    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user?._id });
      if (!resume) { res.status(404).json({ success: false, message: 'Resume not found' }); return; }
      resumeText = resume.extractedText;
    } else {
      const latest = await Resume.findOne({ user: req.user?._id }).sort({ createdAt: -1 });
      if (!latest) { res.status(400).json({ success: false, message: 'No resume found. Upload one first.' }); return; }
      resumeText = latest.extractedText;
      selectedResumeId = latest._id;
    }

    const analysis = await analyzeSkillGapAI(resumeText, jobDescription, jobTitle || '');

    const skillGap = await SkillGap.create({
      user: req.user?._id,
      resume: selectedResumeId,
      jobDescription,
      jobTitle: jobTitle || '',
      analysis,
    });

    res.status(201).json({ success: true, data: skillGap });
  } catch (error) {
    console.error('Skill gap error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze skill gap' });
  }
};

// @desc    Get all skill gap analyses
// @route   GET /api/skillgap
// @access  Private
export const getSkillGaps = async (req: Request, res: Response): Promise<void> => {
  try {
    const gaps = await SkillGap.find({ user: req.user?._id }).select('-jobDescription -analysis').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: gaps });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single skill gap
// @route   GET /api/skillgap/:id
// @access  Private
export const getSkillGap = async (req: Request, res: Response): Promise<void> => {
  try {
    const gap = await SkillGap.findOne({ _id: req.params.id, user: req.user?._id });
    if (!gap) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    res.status(200).json({ success: true, data: gap });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete skill gap
// @route   DELETE /api/skillgap/:id
// @access  Private
export const deleteSkillGap = async (req: Request, res: Response): Promise<void> => {
  try {
    const gap = await SkillGap.findOne({ _id: req.params.id, user: req.user?._id });
    if (!gap) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    await gap.deleteOne();
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
