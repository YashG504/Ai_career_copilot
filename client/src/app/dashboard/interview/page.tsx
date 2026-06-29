'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { interviewAPI } from '@/lib/api';
import { Monitor, Server, Database, Coffee, Code2, Cloud, Terminal, Users, Puzzle, Mic, History, CheckCircle2, AlertTriangle, FileText, Search, TrendingUp, ChevronRight } from 'lucide-react';

const DOMAINS = [
  { id: 'frontend', label: 'Frontend', icon: <Monitor className="w-6 h-6" />, desc: 'React, CSS, DOM, TypeScript' },
  { id: 'backend', label: 'Backend', icon: <Server className="w-6 h-6" />, desc: 'Node.js, APIs, Databases' },
  { id: 'mern', label: 'MERN Stack', icon: <Database className="w-6 h-6" />, desc: 'MongoDB, Express, React, Node' },
  { id: 'java', label: 'Java', icon: <Coffee className="w-6 h-6" />, desc: 'OOP, Spring, JVM' },
  { id: 'python', label: 'Python', icon: <Code2 className="w-6 h-6" />, desc: 'Django, Flask, Data Structures' },
  { id: 'devops', label: 'DevOps', icon: <Cloud className="w-6 h-6" />, desc: 'Docker, CI/CD, AWS, K8s' },
];

const TYPES = [
  { id: 'technical', label: 'Technical', icon: <Terminal className="w-6 h-6" />, desc: 'Concepts & system design' },
  { id: 'hr', label: 'HR / Behavioral', icon: <Users className="w-6 h-6" />, desc: 'STAR method questions' },
  { id: 'coding', label: 'Coding', icon: <Puzzle className="w-6 h-6" />, desc: 'Problem solving' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', color: 'text-primary border-border bg-muted/10' },
  { id: 'medium', label: 'Medium', color: 'text-primary border-border bg-muted/30' },
  { id: 'hard', label: 'Hard', color: 'text-primary border-border bg-muted/50' },
];

type View = 'setup' | 'session' | 'report' | 'history';

export default function InterviewCenterPage() {
  const [view, setView] = useState<View>('setup');
  const [domain, setDomain] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [starting, setStarting] = useState(false);
  const [interview, setInterview] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleStart = async () => {
    if (!domain || !type) return;
    setStarting(true);
    try {
      const res = await interviewAPI.start({ type, domain, difficulty, totalQuestions: 5 });
      setInterview(res.data.data);
      setAnswer('');
      setView('session');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !interview) return;
    setSubmitting(true);
    try {
      const res = await interviewAPI.submitAnswer(interview._id, answer);
      setInterview(res.data.data);
      setAnswer('');
      if (res.data.data.status === 'completed') {
        setView('report');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await interviewAPI.getAll();
      setHistory(res.data.data);
    } catch (err) { console.error(err); }
  };

  const viewReport = async (id: string) => {
    try {
      const res = await interviewAPI.getOne(id);
      setInterview(res.data.data);
      setView('report');
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this interview?')) return;
    await interviewAPI.delete(id);
    await fetchHistory();
  };

  const currentQ = interview?.questions?.[interview?.currentQuestionIndex];
  const progress = interview ? (interview.currentQuestionIndex / interview.totalQuestions) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Center</h1>
          <p className="text-muted-foreground mt-1">Practice AI-powered mock interviews and get instant feedback.</p>
        </div>
        <div className="flex gap-2">
          {view !== 'setup' && <Button variant="outline" onClick={() => setView('setup')} className="rounded-full">← New Interview</Button>}
          {view !== 'history' && <Button variant="outline" onClick={() => { fetchHistory(); setView('history'); }} className="rounded-full flex items-center gap-2"><History className="w-4 h-4" /> History</Button>}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── Setup View ─── */}
        {view === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            {/* Domain Selection */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Choose Domain</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DOMAINS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDomain(d.id)}
                    className={`group text-left rounded-xl border p-4 transition-all duration-200 ${
                      domain === d.id
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                        : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80'
                    }`}
                  >
                    <span className="text-primary mb-2 inline-block">{d.icon}</span>
                    <p className="font-medium mt-2">{d.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Type Selection */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Interview Type</h2>
              <div className="grid grid-cols-3 gap-3">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`text-left rounded-xl border p-4 transition-all duration-200 ${
                      type === t.id
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                        : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80'
                    }`}
                  >
                    <span className="text-primary mb-2 inline-block">{t.icon}</span>
                    <p className="font-medium mt-2">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Difficulty</h2>
              <div className="flex gap-3">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`rounded-full border px-6 py-2 text-sm font-medium transition-all ${
                      difficulty === d.id ? d.color + ' ring-2 ring-offset-2 ring-offset-background' : 'border-border/50 text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStart}
              disabled={!domain || !type || starting}
              size="lg"
              className="rounded-full px-10"
            >
              {starting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Generating Questions...
                </span>
              ) : (
                <span className="flex items-center gap-2"><Mic className="w-5 h-5" /> Start Interview</span>
              )}
            </Button>
          </motion.div>
        )}

        {/* ─── Session View ─── */}
        {view === 'session' && interview && currentQ && (
          <motion.div key="session" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Question {interview.currentQuestionIndex + 1} of {interview.totalQuestions}</span>
                <span className="text-primary font-medium">{Math.round(progress)}% complete</span>
              </div>
              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Question Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                    Q{interview.currentQuestionIndex + 1}
                  </span>
                  <CardTitle className="text-base">Question</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed">{currentQ.question}</p>
              </CardContent>
            </Card>

            {/* Answer Input */}
            <div className="space-y-3">
              <textarea
                rows={8}
                placeholder="Type your answer here... Be thorough and specific."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="flex w-full rounded-xl border border-input bg-input/50 px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{answer.length} characters</p>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || submitting}
                  className="rounded-full px-8"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Evaluating...
                    </span>
                  ) : interview.currentQuestionIndex === interview.totalQuestions - 1 ? (
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Submit & Finish</span>
                  ) : (
                    <span className="flex items-center gap-2">Submit & Next <ChevronRight className="w-4 h-4" /></span>
                  )}
                </Button>
              </div>
            </div>

            {/* Previous Evaluations */}
            {interview.questions.filter((q: any) => q.evaluation).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Previous Answers</h3>
                {interview.questions.filter((q: any) => q.evaluation).map((q: any, i: number) => (
                  <Card key={i} className="border-border/30 bg-card/50">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Q{i + 1}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border border-border text-primary`}>{q.evaluation.score}/100</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{q.question}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Report View ─── */}
        {view === 'report' && interview && interview.report && (
          <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Score Hero */}
            <Card className={`border-border/50 bg-muted/20`}>
              <CardContent className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  {interview.domain} • {interview.type} • {interview.difficulty}
                </p>
                <span className={`text-6xl font-bold text-primary`}>
                  {interview.report.overallScore}/100
                </span>
                <p className="text-sm text-muted-foreground mt-2">Overall Interview Score</p>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5" /> Summary</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground leading-relaxed">{interview.report.summary}</p></CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border bg-card">
                <CardHeader><CardTitle className="text-lg text-primary flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Strengths</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">{interview.report.strengths?.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{s}</li>
                  ))}</ul>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader><CardTitle className="text-lg text-primary flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Weaknesses</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">{interview.report.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{w}</li>
                  ))}</ul>
                </CardContent>
              </Card>
            </div>

            {/* Topic Breakdown */}
            {interview.report.topicBreakdown?.length > 0 && (
              <Card className="border-border/50 bg-card/80">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Search className="w-5 h-5" /> Topic Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {interview.report.topicBreakdown.map((topic: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{topic.topic}</span>
                        <span className={`font-medium text-primary`}>{topic.score}/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                        <div className={`h-full rounded-full bg-primary`} style={{ width: `${topic.score}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{topic.feedback}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Question Review */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Search className="w-5 h-5" /> Question Review</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {interview.questions.map((q: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium">Q{i + 1}: {q.question}</p>
                      {q.evaluation && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 border border-border text-primary`}>{q.evaluation.score}/100</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground"><strong>Your Answer:</strong> {q.userAnswer}</p>
                    {q.evaluation && <p className="text-xs text-primary">{q.evaluation.feedback}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Improvement Roadmap */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Improvement Roadmap</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {interview.report.roadmap?.map((step: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-primary text-xs font-bold shrink-0">{i + 1}</span>
                      <span className="text-muted-foreground">{step}</span>
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
                  <Mic className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-lg font-medium mb-1">No interviews yet</p>
                  <p className="text-muted-foreground text-sm">Start your first mock interview to practice!</p>
                </CardContent>
              </Card>
            ) : (
              history.map((iv, i) => (
                <motion.div key={iv._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-border/50 bg-card/80 hover:bg-card transition-all">
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold shrink-0 bg-muted border border-border text-primary`}>
                        {iv.report?.overallScore || '—'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium capitalize">{iv.domain} • {iv.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {iv.difficulty} • {new Date(iv.createdAt).toLocaleDateString()} • {iv.status}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {iv.status === 'completed' && (
                          <Button variant="outline" size="sm" onClick={() => viewReport(iv._id)} className="rounded-full text-xs">View Report</Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleDelete(iv._id)} className="rounded-full text-xs text-destructive hover:bg-destructive/10">Delete</Button>
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
