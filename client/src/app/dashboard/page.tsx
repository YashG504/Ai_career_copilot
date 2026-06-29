'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { profileAPI } from '@/lib/api';

interface DashboardStats {
  resumeScore: number;
  jobApplications: number;
  activeInterviews: number;
  interviewScore: number;
  atsScore: number;
  aiCreditsUsed: number;
  weeklyProgress: number;
  profileCompletion: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await profileAPI.getDashboardStats();
        setStats(response.data.data);
      } catch (error) {
        // If API is not connected, show placeholder stats
        setStats({
          resumeScore: 0,
          jobApplications: 0,
          activeInterviews: 0,
          interviewScore: 0,
          atsScore: 0,
          aiCreditsUsed: 0,
          weeklyProgress: 0,
          profileCompletion: 29,
        });
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Resume Score',
      value: stats ? `${stats.resumeScore}/100` : '—',
      description: 'Upload your resume to get scored',
      icon: '📄',
      color: 'from-violet-500/20 to-purple-500/10',
    },
    {
      title: 'Job Applications',
      value: stats ? `${stats.jobApplications}` : '—',
      description: `${stats?.activeInterviews || 0} active interviews`,
      icon: '💼',
      color: 'from-blue-500/20 to-cyan-500/10',
    },
    {
      title: 'Interview Score',
      value: stats ? `${stats.interviewScore}/100` : '—',
      description: 'Practice to improve',
      icon: '🎤',
      color: 'from-emerald-500/20 to-green-500/10',
    },
    {
      title: 'ATS Score',
      value: stats ? `${stats.atsScore}%` : '—',
      description: 'Applicant Tracking System',
      icon: '🎯',
      color: 'from-orange-500/20 to-amber-500/10',
    },
    {
      title: 'Profile Completion',
      value: stats ? `${stats.profileCompletion}%` : '—',
      description: 'Complete your profile',
      icon: '👤',
      color: 'from-pink-500/20 to-rose-500/10',
    },
    {
      title: 'AI Credits Used',
      value: stats ? `${stats.aiCreditsUsed}` : '—',
      description: 'Credits consumed',
      icon: '🧠',
      color: 'from-indigo-500/20 to-blue-500/10',
    },
  ];

  const quickActions = [
    { label: 'Upload Resume', href: '/dashboard/resume', icon: '📄', desc: 'Get AI analysis' },
    { label: 'Mock Interview', href: '/dashboard/interview', icon: '🎤', desc: 'Practice now' },
    { label: 'Match Job', href: '/dashboard/jobs', icon: '🎯', desc: 'Paste a JD' },
    { label: 'Track Jobs', href: '/dashboard/tracker', icon: '📋', desc: 'Kanban board' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'there'}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your career progress at a glance.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {statCards.map((card) => (
          <motion.div key={card.title} variants={fadeInUp} transition={{ duration: 0.4 }}>
            <Card className="relative overflow-hidden border-border/50 bg-card/80 hover:bg-card hover:border-primary/20 transition-all duration-300 group">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <span className="text-2xl">{card.icon}</span>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-card/50 p-4 hover:bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl group-hover:bg-primary/20 transition-colors">
                {action.icon}
              </div>
              <div>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl mb-3">🚀</span>
              <p className="text-muted-foreground">No activity yet. Start by uploading your resume!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
