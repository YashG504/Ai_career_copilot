'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { jobTrackerAPI } from '@/lib/api';
import { Plus, GripVertical, Building, MapPin, DollarSign, Trash2 } from 'lucide-react';

const COLUMNS = [
  { id: 'applied', label: 'Applied', color: 'bg-muted/30 border-border text-primary' },
  { id: 'oa', label: 'Online Assessment', color: 'bg-muted/50 border-border text-primary' },
  { id: 'interview', label: 'Interviewing', color: 'bg-muted/70 border-border text-primary' },
  { id: 'offer', label: 'Offer', color: 'bg-muted border-border text-primary font-medium' },
  { id: 'rejected', label: 'Rejected', color: 'bg-transparent border-border text-muted-foreground' },
];

export default function JobTrackerPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ company: '', role: '', location: '', status: 'applied', salary: '', url: '' });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await jobTrackerAPI.getAll();
      setJobs(res.data.data);
    } catch (error) { console.error(error); }
  };

  const handleCreate = async () => {
    try {
      await jobTrackerAPI.create(formData);
      setShowForm(false);
      setFormData({ company: '', role: '', location: '', status: 'applied', salary: '', url: '' });
      fetchJobs();
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job?')) return;
    try {
      await jobTrackerAPI.delete(id);
      fetchJobs();
    } catch (error) { console.error(error); }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('jobId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    if (!jobId) return;

    // Optimistic UI update
    setJobs(jobs.map(j => j._id === jobId ? { ...j, status } : j));
    
    try {
      await jobTrackerAPI.updateStatus(jobId, status);
    } catch (error) {
      console.error(error);
      fetchJobs(); // Revert on error
    }
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Tracker</h1>
          <p className="text-muted-foreground mt-1">Manage your job applications with a Kanban board.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-full">
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Job</>}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="shrink-0">
          <Card className="border-border/50 bg-card/50 mb-6">
            <CardContent className="pt-6 grid md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Company *</Label><Input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="e.g. Google" /></div>
              <div className="space-y-2"><Label>Role *</Label><Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Frontend Engineer" /></div>
              <div className="space-y-2"><Label>Location</Label><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Remote" /></div>
              <div className="space-y-2"><Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Salary</Label><Input value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="e.g. $120k" /></div>
              <div className="flex items-end">
                <Button onClick={handleCreate} disabled={!formData.company || !formData.role} className="w-full">Save Job</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {COLUMNS.map(col => {
          const colJobs = jobs.filter(j => j.status === col.id);
          return (
            <div 
              key={col.id} 
              className="flex-1 min-w-[300px] flex flex-col bg-muted/20 rounded-xl border border-border/50 overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className={`px-4 py-3 border-b flex items-center justify-between ${col.color} bg-opacity-20`}>
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <span className="text-xs font-bold bg-background/50 px-2 py-0.5 rounded-full">{colJobs.length}</span>
              </div>

              {/* Column Body */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colJobs.map(job => (
                  <Card 
                    key={job._id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, job._id)}
                    className="border-border/50 bg-card/80 hover:bg-card hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing group shadow-sm"
                  >
                    <CardContent className="p-4 relative">
                      <GripVertical className="absolute top-4 right-2 w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="pr-6">
                        <h4 className="font-bold text-sm line-clamp-1">{job.role}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Building className="w-3.5 h-3.5" />
                          <span className="line-clamp-1 font-medium">{job.company}</span>
                        </div>
                        {job.location && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="line-clamp-1">{job.location}</span>
                          </div>
                        )}
                        {job.salary && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{job.salary}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/30">
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                          <button onClick={() => handleDelete(job._id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
