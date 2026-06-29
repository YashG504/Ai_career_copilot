import { Request, Response } from 'express';
import Interview from '../models/Interview';
import { generateInterviewQuestionsAI, evaluateAnswerAI, generateInterviewReportAI } from '../services/aiService';

// @desc    Start a new interview
// @route   POST /api/interview/start
// @access  Private
export const startInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, domain, difficulty, totalQuestions } = req.body;

    if (!type || !domain) {
      res.status(400).json({ success: false, message: 'Please provide interview type and domain' });
      return;
    }

    const count = totalQuestions || 5;
    const questionTexts = await generateInterviewQuestionsAI(domain, type, difficulty || 'medium', count);

    const questions = questionTexts.map((q) => ({
      question: q,
      userAnswer: '',
      evaluation: null,
    }));

    const interview = await Interview.create({
      user: req.user?._id,
      type,
      domain,
      difficulty: difficulty || 'medium',
      questions,
      totalQuestions: count,
    });

    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ success: false, message: 'Failed to start interview' });
  }
};

// @desc    Submit answer for current question
// @route   POST /api/interview/:id/answer
// @access  Private
export const submitAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { answer } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user?._id });

    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }

    if (interview.status !== 'in-progress') {
      res.status(400).json({ success: false, message: 'Interview is already completed' });
      return;
    }

    const idx = interview.currentQuestionIndex;
    if (idx >= interview.questions.length) {
      res.status(400).json({ success: false, message: 'All questions answered' });
      return;
    }

    const currentQ = interview.questions[idx]!;
    currentQ.userAnswer = answer || '';
    currentQ.answeredAt = new Date();

    // Evaluate answer with AI
    const evaluation = await evaluateAnswerAI(currentQ.question, answer, interview.domain, interview.type);
    currentQ.evaluation = evaluation;

    interview.currentQuestionIndex = idx + 1;

    // Check if all questions are answered
    if (interview.currentQuestionIndex >= interview.totalQuestions) {
      interview.status = 'completed';
      // Generate report
      const report = await generateInterviewReportAI(interview.questions, interview.domain, interview.type);
      if (report) interview.report = report;
    }

    await interview.save();
    res.status(200).json({ success: true, data: interview });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit answer' });
  }
};

// @desc    Get all interviews for user
// @route   GET /api/interview
// @access  Private
export const getInterviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const interviews = await Interview.find({ user: req.user?._id })
      .select('-questions')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single interview
// @route   GET /api/interview/:id
// @access  Private
export const getInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user?._id });
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }
    res.status(200).json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete interview
// @route   DELETE /api/interview/:id
// @access  Private
export const deleteInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user?._id });
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }
    await interview.deleteOne();
    res.status(200).json({ success: true, message: 'Interview deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
