'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { coverLetterAPI, resumeAPI } from '@/lib/api';
import { FileText, Copy, Check, Trash2, PenTool } from 'lucide-react';

export default function CoverLetterPage() {
  const [view, setView] = useState<'form' | 'result' | 'history'>('form');
  const [resumes, setResumes] = useState<any[]>([]);
  const [formData, setFormData] = useState({ resumeId: '', jobTitle: '', companyName: '', jobDescription: '' });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    resumeAPI.getAll().then((res) => setResumes(res.data.data)).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    if (!formData.resumeId || !formData.jobTitle || !formData.companyName || formData.jobDescription.length < 50) {
      setError('Please fill all fields. Job Description must be at least 50 chars.');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const res = await coverLetterAPI.generate(formData);
      setResult(res.data.data);
      setEditableContent(res.data.data.content);
      setView('result');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate cover letter.');
    } finally {
      setGenerating(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await coverLetterAPI.getAll();
      setHistory(res.data.data);
    } catch (err) { console.error(err); }
  };

  const viewResult = async (id: string) => {
    try {
      const res = await coverLetterAPI.getOne(id);
      setResult(res.data.data);
      setEditableContent(res.data.data.content);
      setView('result');
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cover letter?')) return;
    await coverLetterAPI.delete(id);
    await fetchHistory();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await coverLetterAPI.update(result._id, editableContent);
      setResult(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cover Letter Generator</h1>
          <p className="text-muted-foreground mt-1">Generate highly tailored cover letters in seconds.</p>
        </div>
        <div className="flex gap-2">
          {view !== 'form' && <Button variant="outline" onClick={() => setView('form')} className="rounded-full">← New Letter</Button>}
          {view !== 'history' && <Button variant="outline" onClick={() => { fetchHistory(); setView('history'); }} className="rounded-full">📜 History</Button>}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── Form View ─── */}
        {view === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-8 space-y-6">
                
                <div className="space-y-3">
                  <Label className="text-base font-semibold">1. Select Resume Profile</Label>
                  <div className="flex flex-wrap gap-3">
                    {resumes.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No resumes uploaded yet. Please upload a resume first.</p>
                    ) : (
                      resumes.map(r => (
                        <button
                          key={r._id}
                          onClick={() => setFormData({ ...formData, resumeId: r._id })}
                          className={\`px-5 py-2.5 rounded-xl border transition-all text-sm font-medium \${
                            formData.resumeId === r._id
                              ? 'bg-primary text-primary-foreground border-primary shadow-md'
                              : 'border-border/50 bg-background/50 hover:border-primary/50 text-muted-foreground'
                          }\`}
                        >
                          {r.label || r.fileName}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Target Job Title</Label>
                    <Input 
                      placeholder="e.g. Senior Frontend Engineer" 
                      value={formData.jobTitle} 
                      onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Company</Label>
                    <Input 
                      placeholder="e.g. OpenAI" 
                      value={formData.companyName} 
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Job Description</Label>
                  <textarea 
                    rows={8} 
                    placeholder="Paste the full job description here..."
                    value={formData.jobDescription}
                    onChange={e => setFormData({ ...formData, jobDescription: e.target.value })}
                    className="flex w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{formData.jobDescription.length} chars (min 50)</p>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button 
                  onClick={handleGenerate} 
                  disabled={generating || !formData.resumeId || !formData.jobTitle || !formData.companyName || formData.jobDescription.length < 50}
                  className="w-full h-14 text-lg rounded-xl"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Crafting Cover Letter...
                    </span>
                  ) : (
                    <><PenTool className="w-5 h-5 mr-2" /> Generate Cover Letter</>
                  )}
                </Button>

              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Result View ─── */}
        {view === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card className="border-border/50 shadow-lg bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/30">
                <div>
                  <CardTitle className="text-xl">To: {result.companyName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Applying for: <span className="font-medium text-foreground">{result.jobTitle}</span></p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSave} disabled={saving} className="rounded-md">
                    {saving ? 'Saving...' : 'Save Edits'}
                  </Button>
                  <Button onClick={handleCopy} size="sm" className="rounded-md flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="w-full h-[60vh] p-8 bg-transparent text-foreground leading-relaxed focus:outline-none resize-none"
                  style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem' }}
                />
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
                  <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-medium mb-1">No cover letters generated</p>
                  <p className="text-muted-foreground text-sm">Create your first highly tailored cover letter.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {history.map((cl, i) => (
                  <motion.div key={cl._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-border/50 bg-card/80 hover:bg-card hover:border-primary/50 transition-all cursor-pointer group" onClick={() => viewResult(cl._id)}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{cl.companyName}</h3>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(cl._id); }} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">{cl.jobTitle}</p>
                        <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/30">
                          {new Date(cl.createdAt).toLocaleDateString()}
                        </p>
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
