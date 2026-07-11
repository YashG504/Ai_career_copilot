'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { FileText, Target, Mic, LayoutDashboard, Brain, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: <FileText className="w-8 h-8" />,
    title: 'AI Resume Analysis',
    description: 'Get ATS scores, keyword suggestions, and formatting tips powered by AI.',
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: 'Job Match Scoring',
    description: 'Paste a job description and instantly see your match score and gaps.',
  },
  {
    icon: <Mic className="w-8 h-8" />,
    title: 'AI Mock Interviews',
    description: 'Practice with AI-powered technical, behavioral, and coding interviews.',
  },
  {
    icon: <LayoutDashboard className="w-8 h-8" />,
    title: 'Smart Dashboard',
    description: 'Track applications, scores, progress, and AI usage in one place.',
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: 'Skill Gap Analyzer',
    description: 'Compare your resume against job requirements and get a learning roadmap.',
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'Career Analytics',
    description: 'Visualize your growth with charts for applications, scores, and skills.',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-grid-pattern">
      {/* Navigation */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 glass px-6 lg:px-12 h-16 flex items-center"
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            AC
          </div>
          <span className="font-bold text-lg tracking-tight">AI Career Copilot</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5")}>
            Get Started Free
          </Link>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 md:py-36 lg:py-44">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto"
            >
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                AI-Powered Career Platform
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Land Your{' '}
                <span className="text-primary underline decoration-2 underline-offset-4">
                  Dream Job
                </span>
                <br />
                Faster with AI
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="max-w-[650px] text-lg text-muted-foreground md:text-xl"
              >
                Optimize your resume, ace mock interviews, track every application,
                and close your skill gaps — all in one intelligent platform.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 text-base animate-pulse-glow")}>
                  Start Free — No Credit Card
                </Link>
                <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8 text-base")}>
                  Sign In →
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50 mt-4"
              >
                {[
                  { value: '10K+', label: 'Resumes Analyzed' },
                  { value: '95%', label: 'ATS Pass Rate' },
                  { value: '5K+', label: 'Interviews Aced' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.h2
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold tracking-tight md:text-4xl"
              >
                Everything You Need to{' '}
                <span className="text-primary">Accelerate</span> Your Career
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="mt-4 text-muted-foreground max-w-[600px] mx-auto"
              >
                From resume optimization to mock interviews, we have got every step of your job search covered.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  transition={{ duration: 0.5 }}
                  className="group relative rounded-2xl border border-border/50 bg-card/50 p-6 hover:bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-muted/30 border border-border p-12 md:p-20 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
                Ready to Transform Your Job Search?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-[500px] mx-auto relative z-10">
                Join thousands of professionals who landed their dream jobs with AI Career Copilot.
              </p>
              <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-10 text-base relative z-10")}>
                Get Started for Free
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6 lg:px-12">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 AI Career Copilot. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
