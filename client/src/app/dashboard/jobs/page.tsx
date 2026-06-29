'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { jobMatchAPI, resumeAPI } from '@/lib/api';

interface MatchResult {
  _id: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  analysis: {
    summary: string;
    matchScore: number;
    matchingSkills: string[];
    missingSkills: string[];
    suggestedProjects: { title: string; description: string; skills: string[] }[];
    resumeImprovements: string[];
    keywordMatch: { found: string[]; missing: string[] };
    experienceFit: string;
    cultureFit: string;
  };
  createdAt: string;
}

interface ResumeOption {
  _id: string;
  label: string;
  originalName: string;
}

export default function JobMatchPage() {
  const [view, setView] = useState<'form' | 'result' | 'history'>('form');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [history, setHistory] = useState<MatchResult[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await resumeAPI.getAll();
        setResumes(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResumes();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await jobMatchAPI.getAll();
      setHistory(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMatch = async () => {
    if (jobDescription.trim().length < 50) {
      setError('Please paste a job description with at least 50 characters.');
      return;
    }
    setError('');
    setMatching(true);
    try {
      const res = await jobMatchAPI.match({
        jobDescription,
        jobTitle,
        company,
        resumeId: selectedResumeId || undefined,
      });
      setResult(res.data.data);
      setView('result');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Matching failed. Please try again.');
    } finally {
      setMatching(false);
    }
  };

  const handleViewHistory = async () => {
    await fetchHistory();
    setView('history');
  };

  const handleViewResult = async (id: string) => {
    try {
      const res = await jobMatchAPI.getOne(id);
      setResult(res.data.data);
      setView('result');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this match?')) return;
    try {
      await jobMatchAPI.delete(id);
      await fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Match Center</h1>
          <p className="text-muted-foreground mt-1">
            Paste a job description and see how your resume matches.
          </p>
        </div>
        <div className="flex gap-2">
          {view !== 'form' && (
            <Button variant="outline" onClick={() => setView('form')} className="rounded-full">
              ← New Match
            </Button>
          )}
          {view !== 'history' && (
            <Button variant="outline" onClick={handleViewHistory} className="rounded-full">
              📜 History
            </Button>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── Form View ─── */}
        {view === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Optional fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="jobTitle">Job Title (optional)</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. Frontend Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="bg-input/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company (optional)</Label>
                <Input
                  id="company"
                  placeholder="e.g. Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-input/50"
                />
              </div>
            </div>

            {/* Resume Selection */}
            {resumes.length > 0 && (
              <div className="grid gap-2">
                <Label>Select Resume</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedResumeId('')}
                    className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
                      selectedResumeId === ''
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border/50 text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    Latest Resume
                  </button>
                  {resumes.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => setSelectedResumeId(r._id)}
                      className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
                        selectedResumeId === r._id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border/50 text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Job Description textarea */}
            <div className="grid gap-2">
              <Label htmlFor="jd">Job Description *</Label>
              <textarea
                id="jd"
                rows={12}
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="flex w-full rounded-xl border border-input bg-input/50 px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {jobDescription.length} characters {jobDescription.length < 50 && '(min 50)'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <Button
              onClick={handleMatch}
              disabled={matching || jobDescription.trim().length < 50}
              className="rounded-full px-8"
              size="lg"
            >
              {matching ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Analyzing Match...
                </span>
              ) : (
                '🎯 Match with AI'
              )}
            </Button>

            {/* No resume warning */}
            {resumes.length === 0 && (
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="flex items-center gap-3 py-4">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-amber-400">No resumes uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      Upload a resume in the Resume Center first to get accurate match results.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* ─── Result View ─── */}
        {view === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Match Score Hero */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className={`md:col-span-1 border-border/50 ${
                result.analysis.matchScore >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' :
                result.analysis.matchScore >= 60 ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-red-500/10 border-red-500/30'
              }`}>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <span className={`text-6xl font-bold ${
                    result.analysis.matchScore >= 80 ? 'text-emerald-400' :
                    result.analysis.matchScore >= 60 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {result.analysis.matchScore}%
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">Match Score</p>
                  {result.jobTitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.jobTitle} {result.company && `@ ${result.company}`}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-border/50 bg-card/80">
                <CardHeader><CardTitle className="text-lg">📋 Summary</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground leading-relaxed">{result.analysis.summary}</p>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Experience Fit</p>
                      <p className="font-medium mt-0.5">{result.analysis.experienceFit}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Culture Fit</p>
                    <p className="text-sm mt-0.5">{result.analysis.cultureFit}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Matching vs Missing Skills */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardHeader><CardTitle className="text-lg text-emerald-400">✅ Matching Skills ({result.analysis.matchingSkills?.length || 0})</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.matchingSkills?.map((skill: string, i: number) => (
                      <span key={i} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-500/20 bg-red-500/5">
                <CardHeader><CardTitle className="text-lg text-red-400">❌ Missing Skills ({result.analysis.missingSkills?.length || 0})</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.missingSkills?.map((skill: string, i: number) => (
                      <span key={i} className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs text-red-400">
                        ✗ {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Keyword Match */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg">🔑 Keyword Analysis</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Found in Resume</p>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.keywordMatch?.found?.map((kw: string, i: number) => (
                      <span key={i} className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs text-primary">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Missing from Resume</p>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.keywordMatch?.missing?.map((kw: string, i: number) => (
                      <span key={i} className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs text-amber-400">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Projects */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg">🛠️ Suggested Projects to Build</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {result.analysis.suggestedProjects?.map((project, i: number) => (
                  <div key={i} className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {project.skills?.map((skill: string, j: number) => (
                            <span key={j} className="rounded-full bg-chart-2/10 border border-chart-2/20 px-2.5 py-0.5 text-xs text-chart-2">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resume Improvements */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg">🚀 Resume Improvements for This Job</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.analysis.resumeImprovements?.map((imp: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{imp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── History View ─── */}
        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {history.length === 0 ? (
              <Card className="border-border/50 bg-card/80">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-5xl mb-3">📭</span>
                  <p className="text-lg font-medium mb-1">No matches yet</p>
                  <p className="text-muted-foreground text-sm">Paste a job description to get your first AI match analysis.</p>
                </CardContent>
              </Card>
            ) : (
              history.map((match, i) => (
                <motion.div
                  key={match._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-border/50 bg-card/80 hover:bg-card transition-all duration-200">
                    <CardContent className="flex items-center gap-4 py-4">
                      {/* Score */}
                      <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold shrink-0 ${
                        match.matchScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                        match.matchScore >= 60 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {match.matchScore}%
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {match.jobTitle || 'Untitled Position'}
                          {match.company && <span className="text-muted-foreground font-normal"> @ {match.company}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(match.createdAt).toLocaleDateString()} • Match Score: {match.matchScore}%
                        </p>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResult(match._id)}
                          className="rounded-full text-xs"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(match._id)}
                          className="rounded-full text-xs text-destructive hover:bg-destructive/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
