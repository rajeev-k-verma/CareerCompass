import React from 'react';
import { Briefcase, Calendar, TrendingUp, Eye } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalApplications: number;
    interviewsScheduled: number;
    avgMatchScore: number;
    profileViews: number;
  } | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Interviews Scheduled',
      value: stats.interviewsScheduled,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100'
    },
    {
      title: 'Avg Match Score',
      value: `${stats.avgMatchScore}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100'
    },
    {
      title: 'Profile Views',
      value: stats.profileViews,
      icon: Eye,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100'
    }
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className={`bg-gradient-to-br ${card.bgColor} rounded-xl p-6 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;