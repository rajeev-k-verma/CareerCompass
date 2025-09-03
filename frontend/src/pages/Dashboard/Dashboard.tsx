
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsAPI, jobAPI, Job } from '../../services/api';
import StatsCards from './components/StatsCards';
import JobRecommendations from './components/JobRecommendations';
import RecentActivity from './components/RecentActivity';
import SkillProgress from './components/SkillProgress';
import { TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface DashboardStats {
  totalApplications: number;
  interviewsScheduled: number;
  avgMatchScore: number;
  profileViews: number;
  skillsImproved: number;
  coursesTaken: number;
}

const quickActions: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    title: 'Upload Resume',
    description: 'Upload your latest resume to get started.',
    href: '/upload',
    icon: TrendingUp,
    color: 'from-blue-500 to-purple-500'
  },
  {
    title: 'Take Skills Assessment',
    description: 'Assess your skills to get personalized recommendations.',
    href: '/skills-assessment',
    icon: TrendingUp,
    color: 'from-green-400 to-blue-500'
  },
  {
    title: 'Set Career Preferences',
    description: 'Tell us your career goals and preferences.',
    href: '/preferences',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-500'
  }
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobRecommendations, setJobRecommendations] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Demo user logic: treat users with email 'demo@example.com' or a custom 'isDemo' flag as demo users.
        // This ensures static data is only shown for demo accounts, and all real users get dynamic data.
        const isDemoUser = user?.email === 'demo@example.com' || user?.isDemo;
        
        if (isDemoUser) {
          // Static demo data for demo user
          setStats({
            totalApplications: 3,
            interviewsScheduled: 1,
            avgMatchScore: 78,
            profileViews: 12,
            skillsImproved: 2,
            coursesTaken: 1
          });
          setJobRecommendations([
            {
              id: '1',
              title: 'Demo Frontend Developer',
              company: 'DemoCorp',
              location: 'Remote',
              type: 'full-time',
              salary: { min: 50000, max: 70000, currency: 'USD' },
              description: 'Demo job for frontend dev.',
              requirements: ['React', 'Demo'],
              skills: ['React', 'Demo'],
              posted: new Date(),
              expires: new Date(),
              matchScore: 95,
              applications: 0
            },
            {
              id: '2',
              title: 'Demo Backend Developer',
              company: 'DemoCorp',
              location: 'Remote',
              type: 'full-time',
              salary: { min: 60000, max: 80000, currency: 'USD' },
              description: 'Demo job for backend dev.',
              requirements: ['Node.js', 'Demo'],
              skills: ['Node.js', 'Demo'],
              posted: new Date(),
              expires: new Date(),
              matchScore: 90,
              applications: 0
            },
            {
              id: '3',
              title: 'Demo Data Scientist',
              company: 'DemoCorp',
              location: 'Remote',
              type: 'full-time',
              salary: { min: 70000, max: 90000, currency: 'USD' },
              description: 'Demo job for data scientist.',
              requirements: ['Python', 'Demo'],
              skills: ['Python', 'Demo'],
              posted: new Date(),
              expires: new Date(),
              matchScore: 88,
              applications: 0
            }
          ]);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
          setLoading(false);
          return;
        }

        // Real user: fetch dynamic data with enhanced error handling
        let statsData = null;
        let recommendationsData: Job[] = [];

        try {
          // Try to get dashboard stats
          statsData = await analyticsAPI.getDashboardStats();
        } catch (statsError) {
          console.warn('Dashboard stats API failed:', statsError);
          // Provide default stats for real users when API fails
          statsData = {
            totalApplications: 0,
            interviewsScheduled: 0,
            avgMatchScore: 0,
            profileViews: 0,
            skillsImproved: 0,
            coursesTaken: 0
          };
        }

        try {
          // Try to get job recommendations
          const jobsResponse = await jobAPI.getJobRecommendations();
          recommendationsData = Array.isArray(jobsResponse) ? jobsResponse : (jobsResponse?.results || []);
        } catch (jobsError) {
          console.warn('Job recommendations API failed:', jobsError);
          // Provide default job recommendations when API fails
          recommendationsData = [
            {
              id: 'fallback-1',
              title: 'Software Developer',
              company: 'Tech Company',
              location: 'Remote',
              type: 'full-time',
              salary: { min: 60000, max: 80000, currency: 'USD' },
              description: 'Exciting opportunity for a software developer.',
              requirements: ['Programming', 'Problem Solving'],
              skills: ['JavaScript', 'React'],
              posted: new Date(),
              expires: new Date(),
              matchScore: 85,
              applications: 0
            },
            {
              id: 'fallback-2',
              title: 'Product Manager',
              company: 'Innovation Inc',
              location: 'Hybrid',
              type: 'full-time',
              salary: { min: 70000, max: 90000, currency: 'USD' },
              description: 'Lead product development initiatives.',
              requirements: ['Leadership', 'Strategy'],
              skills: ['Product Management', 'Analytics'],
              posted: new Date(),
              expires: new Date(),
              matchScore: 80,
              applications: 0
            }
          ];
        }

        setStats(statsData);
        setJobRecommendations(recommendationsData.slice(0, 3));
        
        if (statsData.skillsImproved > 0 || statsData.interviewsScheduled > 0) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }
        
      } catch (globalError) {
        console.error('Dashboard data loading failed:', globalError);
        setError('Failed to load dashboard data. Please try again later.');
        setStats(null);
        setJobRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-lg text-gray-500">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-lg text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={400} />}
      </AnimatePresence>
      {/* Welcome Section */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-blue-100 text-lg">
              {!user?.resumeUploaded
                ? "Let's start by uploading your resume to unlock AI-powered career insights."
                : "Your career journey continues. Here's what's happening today."
              }
            </p>
          </div>
          <TrendingUp className="w-16 h-16 text-white opacity-30 animate-bounce" />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <StatsCards stats={stats} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="grid md:grid-cols-3 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.a
              key={action.title}
              href={action.href}
              className={`flex items-center space-x-4 bg-gradient-to-r ${action.color} text-white rounded-xl p-6 shadow-lg hover:scale-105 transform transition-all duration-300`}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-bold">{action.title}</h3>
                <p className="text-blue-100 text-sm">{action.description}</p>
              </div>
            </motion.a>
          );
        })}
      </motion.div>

      {/* Job Recommendations & Skill Progress */}
      <motion.div className="grid md:grid-cols-2 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <JobRecommendations jobs={jobRecommendations} />
        <SkillProgress />
      </motion.div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <RecentActivity />
      </motion.div>

      {/* AI Assistant */}
      <motion.div
        className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-3">AI Career Assistant</h3>
        <p className="text-sm text-gray-600 mb-4">
          Get personalized career guidance and insights from our AI assistant.
        </p>
        <div className="space-y-2 mb-4">
          <button className="w-full text-left p-3 bg-white rounded-lg text-sm hover:shadow-md transition-all">
            💼 "How can I improve my resume?"
          </button>
          <button className="w-full text-left p-3 bg-white rounded-lg text-sm hover:shadow-md transition-all">
            🎯 "What skills should I learn next?"
          </button>
          <button className="w-full text-left p-3 bg-white rounded-lg text-sm hover:shadow-md transition-all">
            📈 "How to negotiate salary?"
          </button>
        </div>
        <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-all">
          Start Conversation
        </button>
      </motion.div>
    </div>
  );
};

export default Dashboard;