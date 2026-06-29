'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { skillGapAPI, resumeAPI } from '@/lib/api';
import { Brain, History, FileText, CheckCircle2, AlertTriangle, Map, ChevronRight, Paperclip, GraduationCap, Hammer, Target, X } from 'lucide-react';

interface ResumeOption { _id: string; label: string; }

export default function SkillGapPage() {
  const [view, setView] = useState<'form' | 'result' | 'history'>('form');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    resumeAPI.getAll().then((res) => setResumes(res.data.data)).catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    if (jobDescription.trim().length < 50) { setError('At least 50 characters needed.'); return; }
    setError('');
    setAnalyzing(true);
    try {
      const res = await skillGapAPI.analyze({ jobDescription, jobTitle, resumeId: selectedResumeId || undefined });
      setResult(res.data.data);
      setView('result');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed.');
    } finally { setAnalyzing(false); }
  };

  const fetchHistory = async () => {
    try { const res = await skillGapAPI.getAll(); setHistory(res.data.data); } catch (err) { console.error(err); }
  };

  const viewResult = async (id: string) => {
    try { const res = await skillGapAPI.getOne(id); setResult(res.data.data); setView('result'); } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await skillGapAPI.delete(id); await fetchHistory();
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Gap Analyzer</h1>
          <p className="text-muted-foreground mt-1">Identify your skill gaps and get a personalized learning roadmap.</p>
        </div>
        <div className="flex gap-2">
          {view !== 'form' && <Button variant="outline" onClick={() => setView('form')} className="rounded-full">← New Analysis</Button>}
          {view !== 'history' && <Button variant="outline" onClick={() => { fetchHistory(); setView('history'); }} className="rounded-full flex items-center gap-2"><History className="w-4 h-4" /> History</Button>}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── Form ─── */}
        {view === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid gap-2">
              <Label>Target Role (optional)</Label>
              <Input placeholder="e.g. Senior Full Stack Developer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="bg-input/50" />
            </div>
            {resumes.length > 0 && (
              <div className="grid gap-2">
                <Label>Resume</Label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedResumeId('')} className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${!selectedResumeId ? 'bg-primary text-primary-foreground border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}>Latest</button>
                  {resumes.map((r) => (
                    <button key={r._id} onClick={() => setSelectedResumeId(r._id)} className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${selectedResumeId === r._id ? 'bg-primary text-primary-foreground border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}>{r.label}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Job Description *</Label>
              <textarea rows={10} placeholder="Paste the job description..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                className="flex w-full rounded-xl border border-input bg-input/50 px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
              <p className="text-xs text-muted-foreground">{jobDescription.length} chars {jobDescription.length < 50 && '(min 50)'}</p>
            </div>
            {error && <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <Button onClick={handleAnalyze} disabled={analyzing || jobDescription.trim().length < 50} size="lg" className="rounded-full px-10">
              {analyzing ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />Analyzing...</span> : <span className="flex items-center gap-2"><Brain className="w-5 h-5" /> Analyze Skill Gap</span>}
            </Button>
          </motion.div>
        )}

        {/* ─── Result ─── */}
        {view === 'result' && result?.analysis && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Match Percentage */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className={`border-border/50 bg-card/80`}>
                <CardContent className="text-center py-8">
                  <span className={`text-5xl font-bold text-primary`}>
                    {result.analysis.skillMatchPercentage}%
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">Skill Match</p>
                </CardContent>
              </Card>
              <Card className="md:col-span-2 border-border/50 bg-card/80">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5" /> Summary</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground leading-relaxed">{result.analysis.summary}</p></CardContent>
              </Card>
            </div>

            {/* Skills */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-border/50 bg-card/80">
                <CardHeader><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Your Skills</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-1.5">
                  {result.analysis.currentSkills?.map((s: string, i: number) => (
                    <span key={i} className="rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs text-primary">{s}</span>
                  ))}
                </div></CardContent>
              </Card>
              <Card className="border-border/50 bg-card/80">
                <CardHeader><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Required Skills</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-1.5">
                  {result.analysis.requiredSkills?.map((s: string, i: number) => (
                    <span key={i} className="rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs text-primary">{s}</span>
                  ))}
                </div></CardContent>
              </Card>
              <Card className="border-border/50 bg-card/80">
                <CardHeader><CardTitle className="text-sm text-primary flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-primary" /> Missing Skills</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-1.5">
                  {result.analysis.missingSkills?.map((s: string, i: number) => (
                    <span key={i} className="rounded-full bg-transparent border border-border px-2.5 py-0.5 text-xs text-primary opacity-80 flex items-center gap-1"><X className="w-3 h-3" /> {s}</span>
                  ))}
                </div></CardContent>
              </Card>
            </div>

            {/* 4-Week Learning Roadmap */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Map className="w-5 h-5" /> 4-Week Learning Roadmap</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {result.analysis.learningRoadmap?.map((week: any, i: number) => (
                  <div key={i} className="relative pl-8 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {i < (result.analysis.learningRoadmap.length - 1) && (
                      <div className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-border/50" />
                    )}
                    <div className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      W{week.week}
                    </div>
                    <div className="rounded-xl border border-border/30 bg-muted/10 p-4">
                      <p className="font-medium">{week.title}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {week.skills?.map((s: string, j: number) => (
                          <span key={j} className="rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs text-primary">{s}</span>
                        ))}
                      </div>
                      <ul className="mt-3 space-y-1">
                        {week.tasks?.map((t: string, j: number) => (
                          <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                            <ChevronRight className="w-3 h-3 text-primary mt-0.5" />{t}
                          </li>
                        ))}
                      </ul>
                      {week.resources?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {week.resources.map((r: string, j: number) => (
                            <span key={j} className="rounded bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground flex items-center gap-1"><Paperclip className="w-3 h-3" /> {r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommended Courses */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Recommended Courses</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-3">
                {result.analysis.recommendedCourses?.map((course: any, i: number) => (
                  <a key={i} href={course.url} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-border/30 bg-muted/10 p-3 hover:bg-muted/20 hover:border-primary/30 transition-all">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0"><GraduationCap className="w-5 h-5 text-primary" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.platform} • {course.skill}</p>
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>

            {/* Suggested Projects */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Hammer className="w-5 h-5" /> Suggested Projects</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.analysis.suggestedProjects?.map((proj: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border/30 bg-muted/10 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-primary text-sm font-bold shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-medium">{proj.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{proj.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs rounded-full px-2 py-0.5 border border-border text-primary opacity-80`}>{proj.difficulty}</span>
                          {proj.skills?.map((s: string, j: number) => (
                            <span key={j} className="rounded-full bg-muted border border-border px-2 py-0.5 text-xs text-primary">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── History ─── */}
        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {history.length === 0 ? (
              <Card className="border-border/50 bg-card/80">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Brain className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-lg font-medium mb-1">No analyses yet</p>
                  <p className="text-muted-foreground text-sm">Analyze a job description to see your skill gaps.</p>
                </CardContent>
              </Card>
            ) : (
              history.map((gap, i) => (
                <motion.div key={gap._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-border/50 bg-card/80 hover:bg-card transition-all">
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-lg shrink-0"><Brain className="w-5 h-5 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{gap.jobTitle || 'Untitled Analysis'}</p>
                        <p className="text-xs text-muted-foreground">{new Date(gap.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => viewResult(gap._id)} className="rounded-full text-xs">View</Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(gap._id)} className="rounded-full text-xs text-destructive hover:bg-destructive/10">Delete</Button>
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
