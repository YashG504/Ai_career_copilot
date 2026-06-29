'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { learningAPI } from '@/lib/api';
import { CheckCircle2, Circle, PlayCircle, BookOpen, Clock, Target, History } from 'lucide-react';

type View = 'form' | 'roadmap' | 'history';

export default function LearningCenterPage() {
  const [view, setView] = useState<View>('form');
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('beginner');
  const [duration, setDuration] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [path, setPath] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!goal.trim()) {
      setError('Please enter a learning goal.');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const res = await learningAPI.generate({
        goal,
        currentLevel: level,
        durationDays: duration,
      });
      setPath(res.data.data);
      setView('roadmap');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate learning path.');
    } finally {
      setGenerating(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await learningAPI.getAll();
      setHistory(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const viewPath = async (id: string) => {
    try {
      const res = await learningAPI.getOne(id);
      setPath(res.data.data);
      setView('roadmap');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this learning path?')) return;
    try {
      await learningAPI.delete(id);
      if (path && path._id === id) {
        setPath(null);
        setView('form');
      }
      await fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTask = async (dayNumber: number, taskId: string, isCompleted: boolean) => {
    try {
      // Optimistic update
      const updatedPath = { ...path };
      const dayIndex = updatedPath.days.findIndex((d: any) => d.dayNumber === dayNumber);
      const taskIndex = updatedPath.days[dayIndex].tasks.findIndex((t: any) => t._id === taskId);
      updatedPath.days[dayIndex].tasks[taskIndex].isCompleted = !isCompleted;
      
      // Recalculate progress locally
      let total = 0;
      let completed = 0;
      updatedPath.days.forEach((d: any) => {
        d.tasks.forEach((t: any) => {
          total++;
          if (t.isCompleted) completed++;
        });
      });
      updatedPath.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      setPath(updatedPath);

      // Server update
      await learningAPI.updateTask(path._id, {
        dayNumber,
        taskId,
        isCompleted: !isCompleted,
      });
    } catch (err) {
      console.error('Failed to update task', err);
      // Revert on failure
      viewPath(path._id);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Learning Center</h1>
          <p className="text-muted-foreground mt-1">
            Generate personalized, day-by-day learning roadmaps to achieve your career goals.
          </p>
        </div>
        <div className="flex gap-2">
          {view !== 'form' && (
            <Button variant="outline" onClick={() => setView('form')} className="rounded-full">
              ← New Goal
            </Button>
          )}
          {view !== 'history' && (
            <Button variant="outline" onClick={() => { fetchHistory(); setView('history'); }} className="rounded-full flex items-center gap-2">
              <History className="w-4 h-4" /> My Paths
            </Button>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── Form View ─── */}
        {view === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-base font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> What do you want to learn?
                  </Label>
                  <Input
                    id="goal"
                    placeholder="e.g., Become a Backend Developer, Master System Design, Learn Rust"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="h-14 text-lg bg-background/50"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="font-medium">Current Skill Level</Label>
                    <div className="flex gap-3">
                      {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setLevel(lvl)}
                          className={`flex-1 capitalize py-2.5 rounded-xl border transition-all ${
                            level === lvl
                              ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                              : 'border-border/50 bg-background/50 hover:border-primary/50 text-muted-foreground'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-medium">Timeline</Label>
                    <div className="flex gap-3">
                      {[15, 30, 60].map((days) => (
                        <button
                          key={days}
                          onClick={() => setDuration(days)}
                          className={`flex-1 py-2.5 rounded-xl border transition-all ${
                            duration === days
                              ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                              : 'border-border/50 bg-background/50 hover:border-primary/50 text-muted-foreground'
                          }`}
                        >
                          {days} Days
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={generating || !goal.trim()}
                  className="w-full h-14 text-lg rounded-xl mt-4"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Crafting your personalized roadmap...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><Target className="w-5 h-5" /> Generate Learning Path</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Roadmap View ─── */}
        {view === 'roadmap' && path && (
          <motion.div key="roadmap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            {/* Progress Hero */}
            <Card className="border-primary/20 bg-primary/5 shadow-lg shadow-primary/5 overflow-hidden relative">
              <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full">
                <motion.div 
                  className="h-full bg-primary" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${path.progress}%` }} 
                  transition={{ duration: 1, type: 'spring' }}
                />
              </div>
              <CardContent className="pt-8 pb-8 flex flex-col md:flex-row items-center gap-8">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" className="stroke-muted/30" strokeWidth="12" fill="none" />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="stroke-primary"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="351.8"
                      initial={{ strokeDashoffset: 351.8 }}
                      animate={{ strokeDashoffset: 351.8 - (351.8 * path.progress) / 100 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{path.progress}%</span>
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                    <Target className="w-3.5 h-3.5" />
                    {path.durationDays}-Day Goal
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{path.goal}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 capitalize"><BookOpen className="w-4 h-4" /> {path.currentLevel} Level</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {path.durationDays} Days Total</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Days Timeline */}
            <div className="space-y-6">
              {path.days?.map((day: any, i: number) => {
                const isDayComplete = day.tasks.every((t: any) => t.isCompleted);
                
                return (
                  <motion.div 
                    key={day.dayNumber}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.1, 1) }}
                    className="relative pl-12 md:pl-16"
                  >
                    {/* Timeline Line */}
                    {i !== path.days.length - 1 && (
                      <div className="absolute left-6 md:left-8 top-12 bottom-0 w-0.5 bg-border -translate-x-1/2 translate-y-4" />
                    )}
                    
                    {/* Day Node */}
                    <div className={`absolute left-6 md:left-8 top-4 flex items-center justify-center w-8 h-8 rounded-full -translate-x-1/2 ring-4 ring-background ${
                      isDayComplete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border-2 border-border'
                    }`}>
                      <span className="text-xs font-bold">{day.dayNumber}</span>
                    </div>

                    <Card className={`border-border/50 transition-colors ${isDayComplete ? 'bg-card/30 border-primary/20' : 'bg-card/80 hover:border-primary/30'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className={`text-lg ${isDayComplete ? 'text-muted-foreground line-through' : ''}`}>
                            Day {day.dayNumber}: {day.theme}
                          </CardTitle>
                          {isDayComplete && <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">Completed</span>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        
                        {/* Tasks */}
                        <div className="space-y-3">
                          {day.tasks?.map((task: any) => (
                            <div 
                              key={task._id} 
                              className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50 ${
                                task.isCompleted ? 'bg-muted/30 border-primary/20' : 'bg-background border-border/50'
                              }`}
                              onClick={() => toggleTask(day.dayNumber, task._id, task.isCompleted)}
                            >
                              <button className={`mt-0.5 shrink-0 ${task.isCompleted ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                                {task.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                              </button>
                              <div>
                                <p className={`font-medium text-sm ${task.isCompleted ? 'text-muted-foreground line-through' : ''}`}>
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className={`text-xs mt-1 ${task.isCompleted ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Resources */}
                        {day.resources && day.resources.length > 0 && (
                          <div className="pt-4 border-t border-border/50">
                            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Resources</p>
                            <div className="flex flex-wrap gap-2">
                              {day.resources.map((res: any, idx: number) => (
                                <a
                                  key={idx}
                                  href={res.url.startsWith('http') ? res.url : `https://www.google.com/search?q=${encodeURIComponent(res.url)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-medium border border-border/50"
                                >
                                  {res.type === 'video' ? <PlayCircle className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                                  {res.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── History View ─── */}
        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {history.length === 0 ? (
              <Card className="border-border/50 bg-card/80">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Target className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-medium mb-1">No learning paths yet</p>
                  <p className="text-muted-foreground text-sm">Generate your first 30-day roadmap to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {history.map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-border/50 bg-card/80 hover:bg-card hover:border-primary/30 transition-all cursor-pointer group" onClick={() => viewPath(p._id)}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">{p.goal}</h3>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">{p.currentLevel} • {p.durationDays} Days</p>
                          </div>
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                            {p.progress}%
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-4">
                          <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }} className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10">
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
      </AnimatePresence>
    </div>
  );
}
