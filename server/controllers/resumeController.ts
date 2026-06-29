import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import Resume from '../models/Resume';
import { analyzeResumeWithAI, compareResumesWithAI } from '../services/aiService';

// @desc    Upload a resume
// @route   POST /api/resume/upload
// @access  Private
export const uploadResumeFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // Extract text from PDF
    let extractedText = '';
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else {
      // For DOCX, store raw — text extraction can be improved later
      extractedText = '[DOCX file — text extraction pending]';
    }

    // Calculate version number
    const existingResumes = await Resume.countDocuments({ user: req.user?._id });

    const resume = await Resume.create({
      user: req.user?._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      extractedText,
      version: existingResumes + 1,
      label: req.body.label || `Resume V${existingResumes + 1}`,
    });

    res.status(201).json({ success: true, data: resume });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload resume' });
  }
};

// @desc    Get all resumes for user
// @route   GET /api/resume
// @access  Private
export const getResumes = async (req: Request, res: Response): Promise<void> => {
  try {
    const resumes = await Resume.find({ user: req.user?._id })
      .select('-extractedText') // Don't send full text in list view
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single resume
// @route   GET /api/resume/:id
// @access  Private
export const getResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resume/:id
// @access  Private
export const deleteResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', 'uploads', resume.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await resume.deleteOne();

    res.status(200).json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Analyze a resume with AI
// @route   POST /api/resume/:id/analyze
// @access  Private
export const analyzeResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    if (!resume.extractedText || resume.extractedText.length < 50) {
      res.status(400).json({
        success: false,
        message: 'Resume text could not be extracted. Please upload a valid PDF.',
      });
      return;
    }

    const analysis = await analyzeResumeWithAI(resume.extractedText);

    if (!analysis) {
      res.status(500).json({ success: false, message: 'AI analysis failed' });
      return;
    }

    resume.analysis = analysis;
    resume.isAnalyzed = true;
    await resume.save();

    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze resume' });
  }
};

// @desc    Compare two resumes
// @route   POST /api/resume/compare
// @access  Private
export const compareResumes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resumeId1, resumeId2 } = req.body;

    if (!resumeId1 || !resumeId2) {
      res.status(400).json({ success: false, message: 'Please provide two resume IDs' });
      return;
    }

    const [resume1, resume2] = await Promise.all([
      Resume.findOne({ _id: resumeId1, user: req.user?._id }),
      Resume.findOne({ _id: resumeId2, user: req.user?._id }),
    ]);

    if (!resume1 || !resume2) {
      res.status(404).json({ success: false, message: 'One or both resumes not found' });
      return;
    }

    const comparison = await compareResumesWithAI(
      resume1.extractedText,
      resume2.extractedText
    );

    res.status(200).json({
      success: true,
      data: {
        resume1: { _id: resume1._id, label: resume1.label, analysis: resume1.analysis },
        resume2: { _id: resume2._id, label: resume2.label, analysis: resume2.analysis },
        comparison,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to compare resumes' });
  }
};
