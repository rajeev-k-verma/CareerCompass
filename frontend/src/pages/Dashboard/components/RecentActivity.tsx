
import React, { useEffect, useState } from 'react';
import { Clock, FileText, Briefcase, TrendingUp, Eye, LucideIcon } from 'lucide-react';
import { analyticsAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

interface Activity {
  id: number;
  type: string;
  title: string;
  time: string;
}

const iconMap: Record<string, LucideIcon> = {
  application: Briefcase,
  resume: FileText,
  skill: TrendingUp,
  view: Eye
};

const colorMap: Record<string, string> = {
  application: 'text-blue-600 bg-blue-100',
  resume: 'text-green-600 bg-green-100',
  skill: 'text-purple-600 bg-purple-100',
  view: 'text-orange-600 bg-orange-100'
};

const demoActivities = [
  {
    id: 1,
    type: 'application',
    title: 'Applied to Senior Frontend Developer at TechCorp',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'resume',
    title: 'Resume analyzed - Score improved to 85%',
    time: '5 hours ago',
  },
  {
    id: 3,
    type: 'skill',
    title: 'Completed React Advanced course',
    time: '1 day ago',
  },
  {
    id: 4,
    type: 'view',
    title: 'Profile viewed by 3 recruiters',
    time: '2 days ago',
  }
];

const RecentActivity: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      const isDemoUser = user?.email === 'demo@example.com' || user?.isDemo;
      if (isDemoUser) {
        setActivities(demoActivities);
        setLoading(false);
        return;
      }
      try {
        const data = await analyticsAPI.getRecentActivity();
        setActivities(data);
      } catch {
        setError('Failed to load recent activity.');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity: Activity) => {
          const Icon = iconMap[activity.type] || Briefcase;
          const color = colorMap[activity.type] || 'text-blue-600 bg-blue-100';
          return (
            <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all">
        View All Activity
      </button>
    </div>
  );
};

export default RecentActivity;