'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, FileText, Target, Mic, Brain, BookOpen, Kanban, LineChart, Briefcase, User, LogOut } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/dashboard/resume', label: 'Resume Center', icon: <FileText className="w-5 h-5" /> },
  { href: '/dashboard/jobs', label: 'Job Matcher', icon: <Target className="w-5 h-5" /> },
  { href: '/dashboard/interview', label: 'Interview Center', icon: <Mic className="w-5 h-5" /> },
  { href: '/dashboard/skills', label: 'Skill Gap', icon: <Brain className="w-5 h-5" /> },
  { href: '/dashboard/learning', label: 'Learning', icon: <BookOpen className="w-5 h-5" /> },
  { href: '/dashboard/tracker', label: 'Job Tracker', icon: <Kanban className="w-5 h-5" /> },
  { href: '/dashboard/analytics', label: 'Analytics', icon: <LineChart className="w-5 h-5" /> },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: <Briefcase className="w-5 h-5" /> },
  { href: '/dashboard/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 flex flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm">
          AC
        </div>
        <span className="font-bold text-base text-sidebar-foreground tracking-tight">Career Copilot</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-sidebar-accent border border-sidebar-primary/20"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center">{item.icon}</span>
                  <span className="relative z-10">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-semibold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sidebar-foreground/50 hover:text-destructive transition-colors text-lg"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
