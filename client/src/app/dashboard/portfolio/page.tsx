'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { portfolioAPI } from '@/lib/api';
import { GitBranch, Code2, AlertTriangle, Lightbulb, Trash2, History, CheckCircle2 } from 'lucide-react';

export default function PortfolioAnalyzerPage() {
  const [view, setView] = useState<'form' | 'result' | 'history'>('form');
  const [username, setUsername] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!username.trim()) return;
    setError('');
    setAnalyzing(true);
    try {
      const res = await portfolioAPI.analyze(username);
      setResult(res.data.data);
      setView('result');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze portfolio. Ensure the username is correct.');
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await portfolioAPI.getAll();
      setHistory(res.data.data);
    } catch (err) { console.error(err); }
  };

  const viewResult = async (id: string) => {
    try {
      const res = await portfolioAPI.getOne(id);
      setResult(res.data.data);
      setView('result');
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this analysis?')) return;
    await portfolioAPI.delete(id);
    await fetchHistory();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Analyzer</h1>
          <p className="text-muted-foreground mt-1">Get an AI-powered technical critique of your GitHub repositories.</p>
        </div>
        <div className="flex gap-2">
          {view !== 'form' && <Button variant="outline" onClick={() => setView('form')} className="rounded-full">← New Analysis</Button>}
          {view !== 'history' && <Button variant="outline" onClick={() => { fetchHistory(); setView('history'); }} className="rounded-full flex items-center gap-2"><History className="w-4 h-4" /> History</Button>}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── Form View ─── */}
        {view === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-10 pb-10 flex flex-col items-center text-center max-w-md mx-auto space-y-6">
                <GitBranch className="w-16 h-16 text-muted-foreground/50" />
                <div className="space-y-2 w-full">
                  <Label htmlFor="github" className="text-lg">GitHub Username</Label>
                  <Input
                    id="github"
                    placeholder="e.g. torvalds"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 text-lg text-center bg-background/50"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || !username.trim()}
                  className="w-full h-14 text-lg rounded-xl"
                >
                  {analyzing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Analyzing Repositories...
                    </span>
                  ) : (
                    'Analyze Portfolio'
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Result View ─── */}
        {view === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Score Hero */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className={`border-border/50 shadow-lg bg-muted/20`}>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center h-full">
                  <span className={`text-6xl font-bold text-primary`}>
                    {result.analysis.score}/100
                  </span>
                  <p className="text-sm text-muted-foreground mt-2 font-medium">Portfolio Score</p>
                  <p className="text-xs text-muted-foreground mt-1">github.com/{result.githubUsername}</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-border/50 bg-card/80">
                <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" /> Overall Advice</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-lg">{result.analysis.overallAdvice}</p>
                </CardContent>
              </Card>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border bg-card">
                <CardHeader><CardTitle className="text-primary flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Strengths</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.analysis.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader><CardTitle className="text-primary flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Areas to Improve</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.analysis.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Repository Feedback */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="flex items-center gap-2"><Code2 className="w-5 h-5 text-primary" /> Specific Repository Feedback</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {result.analysis.repoFeedback.map((repo: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl border border-border/50 bg-background/50">
                    <h4 className="font-bold text-lg text-primary mb-2">{repo.repoName}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{repo.feedback}</p>
                  </div>
                ))}
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
                  <Github className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-medium mb-1">No portfolios analyzed</p>
                  <p className="text-muted-foreground text-sm">Analyze a GitHub profile to see history.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {history.map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-border/50 bg-card/80 hover:bg-card hover:border-primary/50 transition-all cursor-pointer group" onClick={() => viewResult(p._id)}>
                      <CardContent className="p-5 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
                            <Github className="w-5 h-5" /> {p.githubUsername}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-xl font-bold text-primary`}>
                            {p.analysis.score}
                          </span>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
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
      </AnimatePresence>
    </div>
  );
}
