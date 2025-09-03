import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Calendar,
  Target,
  Award,
  Eye,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsStats {
  totalApplications: number;
  interviewsScheduled: number;
  avgMatchScore: number;
  profileViews: number;
  skillsImproved: number;
  coursesTaken: number;
}

interface TrendData {
  month: string;
  applications: number;
  interviews: number;
}

interface SkillData {
  skill: string;
  current: number;
  target: number;
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [applicationTrends, setApplicationTrends] = useState<TrendData[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [statsData, trendsData, skillsData] = await Promise.all([
          analyticsAPI.getDashboardStats(),
          analyticsAPI.getApplicationTrends(),
          analyticsAPI.getSkillProgress()
        ]);
        
        setStats(statsData);
        setApplicationTrends(trendsData);
        setSkillProgress(skillsData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-soft">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-soft">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Applications Sent', value: stats?.totalApplications || 0, color: '#3B82F6' },
    { name: 'Interviews', value: stats?.interviewsScheduled || 0, color: '#8B5CF6' },
    { name: 'Profile Views', value: Math.floor((stats?.profileViews || 0) / 10), color: '#10B981' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your career progress and job search performance</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Applications</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats?.totalApplications || 0}</p>
              <p className="text-sm text-blue-600 mt-1">+12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Interviews Scheduled</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats?.interviewsScheduled || 0}</p>
              <p className="text-sm text-purple-600 mt-1">+25% from last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg Match Score</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats?.avgMatchScore || 0}%</p>
              <p className="text-sm text-green-600 mt-1">+8% from last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Profile Views</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats?.profileViews || 0}</p>
              <p className="text-sm text-orange-600 mt-1">+18% from last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Application Trends */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Application Trends</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={applicationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="applications" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="interviews" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Distribution */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Activity Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Progress Chart */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Award className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Skill Development Progress</h2>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={skillProgress} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="skill" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="current" fill="#3B82F6" name="Current Level" />
            <Bar dataKey="target" fill="#E5E7EB" name="Target Level" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Skills</h3>
          <div className="space-y-3">
            {skillProgress.slice(0, 3).map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{skill.skill}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(skill.current / skill.target) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{skill.current}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Resume Score Improved</p>
                <p className="text-sm text-gray-600">Increased to 85%</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">New Skill Added</p>
                <p className="text-sm text-gray-600">React Advanced</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Match Score Boost</p>
                <p className="text-sm text-gray-600">Average increased by 8%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-900 text-sm">Optimize Resume</p>
              <p className="text-blue-700 text-xs mt-1">Add more industry keywords to improve ATS compatibility</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="font-medium text-purple-900 text-sm">Skill Development</p>
              <p className="text-purple-700 text-xs mt-1">Focus on GraphQL and AWS to match more jobs</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium text-green-900 text-sm">Network Building</p>
              <p className="text-green-700 text-xs mt-1">Connect with 5 new professionals this week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;