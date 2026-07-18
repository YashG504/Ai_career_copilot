import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
const pdfParse = require('pdf-parse-new');
// Use mammoth for DOCX extraction (loaded dynamically to avoid type issues)
const mammoth: any = require('mammoth');
// fetch for downloading cloudinary files
const fetchFn = (global as any).fetch || require('node-fetch');
import Resume from '../models/Resume';
import { analyzeResumeWithAI, analyzeResumeWithAIVision, compareResumesWithAI } from '../services/aiService';

/** Sanitize filename to prevent directory traversal attacks */
function safeFilePath(fileName: string): string {
  const safeName = path.basename(fileName);
  return path.join(__dirname, '..', 'uploads', safeName);
}

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
    const isCloudinary = req.file!.path.startsWith('http');
    
    // Helper to get file buffer either from local disk or URL
    const getFileBuffer = async (): Promise<Buffer> => {
      if (isCloudinary) {
        const res = await fetchFn(req.file!.path);
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
      return await fs.promises.readFile(req.file!.path);
    };

    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = await getFileBuffer();
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (
      req.file!.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      path.extname(req.file!.originalname).toLowerCase() === '.docx'
    ) {
      try {
        if (isCloudinary) {
          const dataBuffer = await getFileBuffer();
          const result = await mammoth.extractRawText({ buffer: dataBuffer });
          extractedText = (result && result.value) ? result.value : '';
        } else {
          const result = await mammoth.extractRawText({ path: req.file!.path });
          extractedText = (result && result.value) ? result.value : '';
        }
      } catch (err) {
        console.warn('DOCX extraction failed:', err);
        extractedText = '';
      }
    } else if (req.file!.mimetype === 'application/msword' || path.extname(req.file!.originalname).toLowerCase() === '.doc') {
      // Legacy .doc files are not reliably supported here
      res.status(400).json({ success: false, message: 'Legacy .doc files are not supported. Please convert to .docx or PDF and try again.' });
      return;
    } else {
      extractedText = '';
    }

    // Calculate version number
    const existingResumes = await Resume.countDocuments({ user: req.user?._id });

    const resume = await Resume.create({
      user: req.user?._id,
      fileName: req.file!.filename,
      originalName: req.file!.originalname,
      fileSize: req.file!.size,
      fileType: req.file!.mimetype,
      extractedText,
      version: existingResumes + 1,
      label: req.body.label || `Resume V${existingResumes + 1}`,
      // Store the path so we know if it's local or cloud
      filePath: req.file!.path
    });

    res.status(201).json({ success: true, data: resume });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload resume', error: error?.message || String(error) });
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

// @desc    Download resume file
// @route   GET /api/resume/:id/download
// @access  Private
export const downloadResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user?._id });

    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    // If the file path is a URL (Cloudinary), redirect to it
    // Note: We'd normally want to cast this or define it in the model, using any for quick access
    const filePath = (resume as any).filePath;
    if (filePath && filePath.startsWith('http')) {
      res.redirect(filePath);
      return;
    }

    const localPath = safeFilePath(resume.fileName);
    if (!fs.existsSync(localPath)) {
      res.status(404).json({ success: false, message: 'File not found on server' });
      return;
    }

    res.download(localPath, resume.originalName);
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

    // Delete file from disk if local
    const filePath = (resume as any).filePath;
    if (!filePath || !filePath.startsWith('http')) {
      const localPath = safeFilePath(resume.fileName);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
    // (Optional: Delete from Cloudinary using Cloudinary API if hosted there)

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

    let analysis;

    if (!resume.extractedText || resume.extractedText.length < 50) {
      // If text extraction failed (e.g. image PDF), use Gemini Vision OCR
      let fileBuffer: Buffer | null = null;
      const filePath = (resume as any).filePath;
      
      if (filePath && filePath.startsWith('http')) {
        const resUrl = await fetchFn(filePath);
        const arrayBuffer = await resUrl.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      } else {
        const localPath = safeFilePath(resume.fileName);
        if (fs.existsSync(localPath)) {
          fileBuffer = await fs.promises.readFile(localPath);
        }
      }

      if (fileBuffer) {
        analysis = await analyzeResumeWithAIVision(fileBuffer, resume.fileType);
      } else {
        res.status(400).json({
          success: false,
          message: 'Resume text could not be extracted and original file is missing.',
        });
        return;
      }
    } else {
      // Use standard text-based analysis
      analysis = await analyzeResumeWithAI(resume.extractedText);
    }

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
