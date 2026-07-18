import { Request, Response } from 'express';
import JobApplication from '../models/JobApplication';

// @desc    Create a new job application
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { company, role, location, status, salary, url, notes, appliedAt } = req.body;

    if (!company || !role) {
      res.status(400).json({ success: false, message: 'Company and Role are required' });
      return;
    }

    const job = await JobApplication.create({
      user: req.user?._id,
      company,
      role,
      location,
      status: status || 'applied',
      salary,
      url,
      notes,
      appliedAt: appliedAt || new Date(),
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all job applications
// @route   GET /api/jobs
// @access  Private
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await JobApplication.find({ user: req.user?._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a job application status
// @route   PUT /api/jobs/:id/status
// @access  Private
export const updateJobStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    
    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required' });
      return;
    }

    const job = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a job application
// @route   PUT /api/jobs/:id
// @access  Private
export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    // Whitelist allowed fields to prevent mass assignment attacks
    const allowedFields = ['company', 'role', 'location', 'status', 'salary', 'url', 'notes', 'appliedAt'];
    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const job = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a job application
// @route   DELETE /api/jobs/:id
// @access  Private
export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await JobApplication.findOneAndDelete({ _id: req.params.id, user: req.user?._id });

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
