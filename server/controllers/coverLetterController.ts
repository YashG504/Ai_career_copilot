import { Request, Response } from 'express';
import CoverLetter from '../models/CoverLetter';
import Resume from '../models/Resume';
import { generateCoverLetterAI } from '../services/aiService';

// @desc    Generate Cover Letter
// @route   POST /api/coverletter
// @access  Private
export const generateCoverLetter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resumeId, jobDescription, companyName, jobTitle } = req.body;

    if (!resumeId || !jobDescription || !companyName || !jobTitle) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    // Fetch Resume
    const resume = await Resume.findOne({ _id: resumeId, user: req.user?._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    // Generate AI Cover Letter
    const content = await generateCoverLetterAI(
      resume.extractedText || 'No resume text available',
      jobDescription,
      companyName,
      jobTitle
    );

    // Save to DB
    const coverLetter = await CoverLetter.create({
      user: req.user?._id,
      jobTitle,
      companyName,
      content
    });

    res.status(201).json({ success: true, data: coverLetter });
  } catch (error) {
    console.error('Generate cover letter error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all cover letters
// @route   GET /api/coverletter
// @access  Private
export const getCoverLetters = async (req: Request, res: Response): Promise<void> => {
  try {
    const coverLetters = await CoverLetter.find({ user: req.user?._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: coverLetters });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single cover letter
// @route   GET /api/coverletter/:id
// @access  Private
export const getCoverLetter = async (req: Request, res: Response): Promise<void> => {
  try {
    const coverLetter = await CoverLetter.findOne({ _id: req.params.id, user: req.user?._id });
    if (!coverLetter) {
      res.status(404).json({ success: false, message: 'Cover letter not found' });
      return;
    }
    res.status(200).json({ success: true, data: coverLetter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update cover letter content
// @route   PUT /api/coverletter/:id
// @access  Private
export const updateCoverLetter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const coverLetter = await CoverLetter.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      { content },
      { new: true }
    );
    if (!coverLetter) {
      res.status(404).json({ success: false, message: 'Cover letter not found' });
      return;
    }
    res.status(200).json({ success: true, data: coverLetter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete cover letter
// @route   DELETE /api/coverletter/:id
// @access  Private
export const deleteCoverLetter = async (req: Request, res: Response): Promise<void> => {
  try {
    const coverLetter = await CoverLetter.findOneAndDelete({ _id: req.params.id, user: req.user?._id });
    if (!coverLetter) {
      res.status(404).json({ success: false, message: 'Cover letter not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Cover letter deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
