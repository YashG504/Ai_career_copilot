'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/lib/api';
import { Users, FileText, Briefcase, BrainCircuit, Activity, BookOpen, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers()
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Unauthorized. You must be an admin to view this page.');
      } else {
        setError('Failed to load admin data.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-muted-foreground">Loading Admin Dashboard...</div>;
  if (error) return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
      <p className="text-muted-foreground mb-6">{error}</p>
      <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
    </div>
  );
  if (!stats) return <div>No data available</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2"><UserCheck className="w-8 h-8" /> Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System-wide metrics and user management.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Total Users</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"><Users className="w-5 h-5" /></span>
            </div>
            <span className="text-3xl font-bold">{stats.totalUsers}</span>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Total Resumes</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500"><FileText className="w-5 h-5" /></span>
            </div>
            <span className="text-3xl font-bold">{stats.totalResumes}</span>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Job Applications</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500"><Briefcase className="w-5 h-5" /></span>
            </div>
            <span className="text-3xl font-bold">{stats.totalJobApplications}</span>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">AI Generations</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500"><BrainCircuit className="w-5 h-5" /></span>
            </div>
            <span className="text-3xl font-bold">{stats.totalAIGenerations}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* AI Breakdown */}
        <Card className="border-border/50 bg-card/50 md:col-span-1">
          <CardHeader><CardTitle>AI Usage Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
              <div className="flex items-center gap-3"><Briefcase className="w-4 h-4 text-primary" /> <span className="font-medium">Job Matches</span></div>
              <span className="font-bold">{stats.breakdown.jobMatches}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
              <div className="flex items-center gap-3"><Activity className="w-4 h-4 text-primary" /> <span className="font-medium">Interviews</span></div>
              <span className="font-bold">{stats.breakdown.interviews}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
              <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-primary" /> <span className="font-medium">Skill Gaps</span></div>
              <span className="font-bold">{stats.breakdown.skillGaps}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
              <div className="flex items-center gap-3"><BookOpen className="w-4 h-4 text-primary" /> <span className="font-medium">Learning Paths</span></div>
              <span className="font-bold">{stats.breakdown.learningPaths}</span>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-border/50 bg-card/50 md:col-span-2">
          <CardHeader><CardTitle>Registered Users</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 rounded-tr-lg">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={\`px-2 py-1 rounded-full text-xs font-bold \${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}\`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Need to import AlertCircle and Button since they are used in the error state
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
