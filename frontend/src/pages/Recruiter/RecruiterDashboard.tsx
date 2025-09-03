import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { recruiterAPI } from '../../services/api';

interface RecruiterStats {
  activeJobs: number;
  totalApplications: number;
  interviewsScheduled: number;
  candidatesHired: number;
}

interface RecentJob {
  id: string;
  title: string;
  company?: string;
  location?: string;
  posted?: string;
  status?: string;
  applications: number;
  applications_count?: number;
  views: number;
}

interface RecentCandidate {
  id: string;
  name: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  position: string;
  current_role?: string;
  role?: string;
  status: string;
  match_score?: number;
  matchScore?: number;
  experience_years?: number;
  experience?: string;
  location?: string;
  application?: {
    status: string;
  };
}

const RecruiterDashboard: React.FC = () => {

  // TODO: Replace with real API calls
  const [stats, setStats] = useState<RecruiterStats>({
    activeJobs: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    candidatesHired: 0
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidate[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Try to fetch dashboard stats from API
        const dashboardStats = await recruiterAPI.getDashboardStats();
        setStats(dashboardStats);

        // Try to fetch recent jobs
        const jobsResponse = await recruiterAPI.getMyJobs();
        const jobs = jobsResponse.results || jobsResponse;
        setRecentJobs(Array.isArray(jobs) ? jobs.slice(0, 3) : []);

        // Try to fetch recent candidates (from all jobs)
        const candidatesResponse = await recruiterAPI.getAllCandidates({ limit: 3 });
        const candidates = candidatesResponse.results || candidatesResponse;
        setRecentCandidates(Array.isArray(candidates) ? candidates : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        
        // Provide fallback data if all API calls fail
        setStats({
          activeJobs: 0,
          totalApplications: 0,
          interviewsScheduled: 0,
          candidatesHired: 0
        });
        setRecentJobs([]);
        setRecentCandidates([]);
        
        // Don't show error to user for missing endpoints, just log
        console.warn('Using fallback data due to missing backend endpoints');
      }
    };
    fetchDashboard();
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'interview_scheduled': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your job postings and candidates</p>
        </div>
        <Link
          to="/job-postings/new"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Active Jobs</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.activeJobs}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Applications</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Interviews Scheduled</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.interviewsScheduled}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Candidates Hired</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.candidatesHired}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Job Postings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Job Postings</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                <Search className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-blue-600 font-medium">{job.company}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                      {(job.status || 'active').replace('_', ' ')}
                    </span>
                    <button className="p-1 rounded hover:bg-gray-100">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Posted {job.posted}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{job.applications_count || job.applications} applications</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Applications
                    </button>
                    <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                      Edit Job
                    </button>
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              to="/job-postings"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Job Postings →
            </Link>
          </div>
        </div>

        {/* Top Candidates */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Candidates</h2>
            <Link
              to="/candidates"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentCandidates.map((candidate) => (
              <div key={candidate.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {candidate.user?.firstName?.[0] && candidate.user?.lastName?.[0] ? 
                          `${candidate.user.firstName[0]}${candidate.user.lastName[0]}` :
                          candidate.name ? candidate.name.split(' ').map((n: string) => n[0]).join('') : 'N/A'
                        }
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {candidate.user?.firstName && candidate.user?.lastName ? 
                          `${candidate.user.firstName} ${candidate.user.lastName}` :
                          candidate.name || 'Unknown'
                        }
                      </h3>
                      <p className="text-sm text-gray-600">{candidate.current_role || candidate.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{candidate.match_score || candidate.matchScore}%</div>
                    <div className="text-xs text-gray-500">match</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>{candidate.experience_years ? `${candidate.experience_years} years` : candidate.experience} experience</span>
                  <span>{candidate.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.application?.status || candidate.status)}`}>
                    {(candidate.application?.status || candidate.status).replace('_', ' ')}
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <Link
            to="/job-postings/new"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-all"
          >
            <Plus className="w-8 h-8 text-blue-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Post New Job</h4>
              <p className="text-sm text-gray-600">Create a new job posting</p>
            </div>
          </Link>

          <Link
            to="/candidates"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-all"
          >
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Browse Candidates</h4>
              <p className="text-sm text-gray-600">Search candidate database</p>
            </div>
          </Link>

          <Link
            to="/interviews"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-all"
          >
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Schedule Interview</h4>
              <p className="text-sm text-gray-600">Manage interview calendar</p>
            </div>
          </Link>

          <Link
            to="/analytics"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-all"
          >
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div>
              <h4 className="font-semibold text-gray-900">View Analytics</h4>
              <p className="text-sm text-gray-600">Recruitment insights</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;