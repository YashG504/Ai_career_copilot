import { Request, Response } from 'express';
import PortfolioAnalysis from '../models/PortfolioAnalysis';
import { analyzePortfolioAI } from '../services/aiService';

// @desc    Analyze GitHub portfolio
// @route   POST /api/portfolio
// @access  Private
export const analyzePortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { githubUsername } = req.body;

    if (!githubUsername) {
      res.status(400).json({ success: false, message: 'GitHub username is required' });
      return;
    }

    // Fetch public repos from GitHub API
    // Use global fetch if available, otherwise fall back to node-fetch
    const fetchFn = (global as any).fetch || require('node-fetch');
    const githubRes = await fetchFn(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AI-Career-Copilot'
      }
    });

    if (!githubRes.ok) {
      res.status(400).json({ success: false, message: 'Failed to fetch GitHub profile or user not found' });
      return;
    }

    const repos = await githubRes.json();

    // Extract relevant data for AI
    const repoDataForAI = repos.map((repo: any) => ({
      name: repo.name,
      description: repo.description || 'No description',
      language: repo.language || 'Unknown',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      hasPages: repo.has_pages,
      topics: repo.topics || [],
      updatedAt: repo.updated_at
    }));

    // Analyze with AI
    const analysis = await analyzePortfolioAI(repoDataForAI);

    // Save to DB
    const portfolioAnalysis = await PortfolioAnalysis.create({
      user: req.user?._id,
      githubUsername,
      analysis
    });

    res.status(201).json({ success: true, data: portfolioAnalysis });
  } catch (error) {
    console.error('Analyze portfolio error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all portfolio analyses
// @route   GET /api/portfolio
// @access  Private
export const getPortfolios = async (req: Request, res: Response): Promise<void> => {
  try {
    const portfolios = await PortfolioAnalysis.find({ user: req.user?._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: portfolios });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single portfolio analysis
// @route   GET /api/portfolio/:id
// @access  Private
export const getPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const portfolio = await PortfolioAnalysis.findOne({ _id: req.params.id, user: req.user?._id });
    if (!portfolio) {
      res.status(404).json({ success: false, message: 'Analysis not found' });
      return;
    }
    res.status(200).json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete portfolio analysis
// @route   DELETE /api/portfolio/:id
// @access  Private
export const deletePortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const portfolio = await PortfolioAnalysis.findOneAndDelete({ _id: req.params.id, user: req.user?._id });
    if (!portfolio) {
      res.status(404).json({ success: false, message: 'Analysis not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Analysis deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
