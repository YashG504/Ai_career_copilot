'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { resumeAPI } from '@/lib/api';

interface ResumeItem {
  _id: string;
  originalName: string;
  fileSize: number;
  version: number;
  label: string;
  isAnalyzed: boolean;
  analysis?: any;
  createdAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeCenterPage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'analysis' | 'compare'>('list');
  const [compareIds, setCompareIds] = useState<[string?, string?]>([]);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [comparing, setComparing] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await resumeAPI.getAll();
      setResumes(res.data.data);
    } catch (err) {
      console.error('Failed to fetch resumes', err);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', acceptedFiles[0]!);
      await resumeAPI.upload(formData);
      await fetchResumes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleAnalyze = async (id: string) => {
    setAnalyzing(id);
    try {
      const res = await resumeAPI.analyze(id);
      setSelectedResume(res.data.data);
      setView('analysis');
      await fetchResumes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(null);
    }
  };

  const handleViewAnalysis = async (id: string) => {
    try {
      const res = await resumeAPI.getOne(id);
      setSelectedResume(res.data.data);
      setView('analysis');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await resumeAPI.delete(id);
      await fetchResumes();
      if (selectedResume?._id === id) {
        setSelectedResume(null);
        setView('list');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompare = async () => {
    if (!compareIds[0] || !compareIds[1]) return;
    setComparing(true);
    try {
      const res = await resumeAPI.compare(compareIds[0], compareIds[1]);
      setComparisonResult(res.data.data);
      setView('compare');
    } catch (err) {
      console.error(err);
    } finally {
      setComparing(false);
    }
  };

  const toggleCompareSelection = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id) as [string?, string?];
      if (prev.filter(Boolean).length >= 2) return prev;
      const next = [...prev.filter(Boolean), id] as [string?, string?];
      return next;
    });
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
          <h1 className="text-3xl font-bold tracking-tight">Resume Center</h1>
          <p className="text-muted-foreground mt-1">Upload, analyze, and compare your resumes with AI.</p>
        </div>
        <div className="flex gap-2">
          {view !== 'list' && (
            <Button variant="outline" onClick={() => setView('list')} className="rounded-full">
              ← Back to List
            </Button>
          )}
          {compareIds.filter(Boolean).length === 2 && view === 'list' && (
            <Button onClick={handleCompare} disabled={comparing} className="rounded-full">
              {comparing ? 'Comparing...' : 'Compare Selected'}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Upload Zone */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div
                {...getRootProps()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
                  isDragActive
                    ? 'border-primary bg-primary/10 scale-[1.02]'
                    : 'border-border/50 bg-card/30 hover:border-primary/50 hover:bg-card/50'
                }`}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Uploading your resume...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-5xl">📄</span>
                    <div>
                      <p className="text-lg font-medium">
                        {isDragActive ? 'Drop your resume here!' : 'Drag & drop your resume here'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports PDF and DOCX files up to 10MB
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full mt-2">
                      Or click to browse
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Resume List */}
            {resumes.length === 0 ? (
              <Card className="border-border/50 bg-card/80">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-5xl mb-3">📭</span>
                  <p className="text-lg font-medium mb-1">No resumes uploaded yet</p>
                  <p className="text-muted-foreground text-sm">Upload your first resume to get started with AI analysis.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Your Resumes ({resumes.length})</h2>
                  {resumes.length >= 2 && (
                    <p className="text-xs text-muted-foreground">
                      Select 2 resumes to compare • {compareIds.filter(Boolean).length}/2 selected
                    </p>
                  )}
                </div>
                {resumes.map((resume, i) => (
                  <motion.div
                    key={resume._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card
                      className={`border-border/50 bg-card/80 hover:bg-card transition-all duration-200 ${
                        compareIds.includes(resume._id) ? 'ring-2 ring-primary border-primary/50' : ''
                      }`}
                    >
                      <CardContent className="flex items-center gap-4 py-4">
                        {/* Compare checkbox */}
                        {resumes.length >= 2 && (
                          <button
                            onClick={() => toggleCompareSelection(resume._id)}
                            className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                              compareIds.includes(resume._id)
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-muted-foreground/40 hover:border-primary'
                            }`}
                          >
                            {compareIds.includes(resume._id) && <span className="text-xs">✓</span>}
                          </button>
                        )}

                        {/* File icon */}
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                          📄
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{resume.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {resume.originalName} • {formatFileSize(resume.fileSize)} •{' '}
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* ATS Badge */}
                        {resume.isAnalyzed && resume.analysis && (
                          <div className="shrink-0 flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
                            <span className="text-xs font-medium text-primary">
                              ATS: {resume.analysis.atsScore}/100
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0">
                          {resume.isAnalyzed ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAnalysis(resume._id)}
                              className="rounded-full text-xs"
                            >
                              View Analysis
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleAnalyze(resume._id)}
                              disabled={analyzing === resume._id}
                              className="rounded-full text-xs"
                            >
                              {analyzing === resume._id ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                  Analyzing...
                                </span>
                              ) : (
                                '🧠 Analyze with AI'
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(resume._id)}
                            className="rounded-full text-xs text-destructive hover:bg-destructive/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Analysis View */}
        {view === 'analysis' && selectedResume && <AnalysisView resume={selectedResume} />}

        {/* Compare View */}
        {view === 'compare' && comparisonResult && <CompareView data={comparisonResult} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Analysis View Component ─────────────────────────────────────────────────

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    : score >= 60 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    : 'text-red-400 border-red-500/30 bg-red-500/10';

  return (
    <div className={`flex flex-col items-center gap-1 rounded-2xl border p-5 ${color}`}>
      <span className="text-3xl font-bold">{score}</span>
      <span className="text-xs font-medium opacity-80">{label}</span>
    </div>
  );
}

function AnalysisView({ resume }: { resume: any }) {
  const analysis = resume.analysis;
  if (!analysis) return <p className="text-muted-foreground">No analysis available.</p>;

  return (
    <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreBadge score={analysis.atsScore} label="ATS Score" />
        <ScoreBadge score={analysis.overallScore} label="Overall Score" />
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border/50 bg-card/80 p-5">
          <span className="text-3xl font-bold text-primary">{analysis.technicalSkills?.length || 0}</span>
          <span className="text-xs font-medium text-muted-foreground">Tech Skills</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border/50 bg-card/80 p-5">
          <span className="text-3xl font-bold text-primary">{analysis.experienceLevel}</span>
          <span className="text-xs font-medium text-muted-foreground">Experience</span>
        </div>
      </div>

      {/* Summary */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader><CardTitle className="text-lg">📋 Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground leading-relaxed">{analysis.summary}</p></CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader><CardTitle className="text-lg text-emerald-400">✅ Strengths</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span className="text-muted-foreground">{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader><CardTitle className="text-lg text-red-400">⚠️ Weaknesses</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.weaknesses?.map((w: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span className="text-muted-foreground">{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardHeader><CardTitle className="text-lg">💻 Technical Skills Found</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.technicalSkills?.map((skill: string, i: number) => (
                <span key={i} className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs text-primary">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardHeader><CardTitle className="text-lg">🤝 Soft Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.softSkills?.map((skill: string, i: number) => (
                <span key={i} className="rounded-full bg-chart-2/10 border border-chart-2/20 px-3 py-1 text-xs text-chart-2">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missing Keywords */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader><CardTitle className="text-lg text-amber-400">🔑 Missing Keywords</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords?.map((kw: string, i: number) => (
              <span key={i} className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs text-amber-400">
                + {kw}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvements */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader><CardTitle className="text-lg">🚀 Improvements</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.improvements?.map((imp: string, i: number) => (
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

      {/* Grammar & Formatting */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardHeader><CardTitle className="text-lg">📝 Grammar Issues</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.grammarIssues?.map((g: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>{g}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardHeader><CardTitle className="text-lg">🎨 Formatting Suggestions</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.formattingSuggestions?.map((f: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-chart-2 mt-0.5">•</span>{f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// ─── Compare View Component ──────────────────────────────────────────────────

function CompareView({ data }: { data: any }) {
  const { resume1, resume2, comparison } = data;

  return (
    <motion.div key="compare" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Header */}
      <div className="grid md:grid-cols-3 gap-4 items-center">
        <Card className="border-border/50 bg-card/80 text-center p-4">
          <p className="font-medium">{resume1.label}</p>
          {resume1.analysis && (
            <p className="text-sm text-muted-foreground mt-1">ATS: {resume1.analysis.atsScore}/100</p>
          )}
        </Card>
        <div className="text-center">
          <span className="text-3xl">⚡</span>
          <p className="text-sm text-muted-foreground">vs</p>
        </div>
        <Card className="border-border/50 bg-card/80 text-center p-4">
          <p className="font-medium">{resume2.label}</p>
          {resume2.analysis && (
            <p className="text-sm text-muted-foreground mt-1">ATS: {resume2.analysis.atsScore}/100</p>
          )}
        </Card>
      </div>

      {/* Comparison Result */}
      {comparison && (
        <>
          <Card className={`border-border/50 ${comparison.overallImprovement > 0 ? 'bg-emerald-500/5 border-emerald-500/20' : comparison.overallImprovement < 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-card/80'}`}>
            <CardContent className="text-center py-6">
              <span className={`text-4xl font-bold ${comparison.overallImprovement > 0 ? 'text-emerald-400' : comparison.overallImprovement < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                {comparison.overallImprovement > 0 ? '+' : ''}{comparison.overallImprovement}%
              </span>
              <p className="text-sm text-muted-foreground mt-2">Overall Improvement</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-lg">📋 Summary</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{comparison.summary}</p></CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader><CardTitle className="text-lg text-emerald-400">✅ Improvements</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {comparison.improvements?.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">+</span>{item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg">💡 Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {comparison.recommendations?.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>{item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  );
}
