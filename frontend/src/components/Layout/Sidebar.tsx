import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Brain,
  Mail,
  BarChart3,
  Users,
  Settings,
  Server,
  Sparkles,
  ClipboardList
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const jobSeekerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Briefcase, label: 'Jobs', href: '/jobs' },
    { icon: Sparkles, label: 'AI Recommendations', href: '/ai-job-recommendations' },
    { icon: FileText, label: 'Resume Analyzer', href: '/resume-analyzer' },
    { icon: Brain, label: 'Skill Analysis', href: '/skill-analysis' },
    { icon: Mail, label: 'Cover Letters', href: '/cover-letter' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: ClipboardList, label: 'My Applications', href: '/applications' },
  ];

  const recruiterMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/recruiter' },
    { icon: Users, label: 'Candidates', href: '/candidates' },
    { icon: Briefcase, label: 'Job Postings', href: '/job-postings' },
    { icon: BarChart3, label: 'Analytics', href: '/recruiter-analytics' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: Server, label: 'Backend Status', href: '/backend-status' },
  ];

  const menuItems = user?.role === 'recruiter' ? recruiterMenuItems : jobSeekerMenuItems;

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside className="w-64 bg-white shadow-soft border-r border-gray-100 min-h-[calc(100vh-4rem)] flex flex-col">
      <nav className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-colorful'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
          <p className="text-sm text-gray-600 mb-3">
            Get personalized career guidance from our AI assistant.
          </p>
          <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
            Ask AI Assistant
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;