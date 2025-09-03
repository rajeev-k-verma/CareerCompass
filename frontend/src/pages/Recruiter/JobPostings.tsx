import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical, Edit, Trash2, Users, MapPin, Calendar, DollarSign, Briefcase } from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  skills: string[];
  posted: string;
  expires?: string;
  status: 'active' | 'paused' | 'closed';
  applications_count: number;
}

const JobPostings: React.FC = () => {
  const { addNotification } = useNotification();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await recruiterAPI.getMyJobs();
      const jobs = response.results || response;
      setJobs(Array.isArray(jobs) ? jobs : []);
    } catch (error: unknown) {
      console.error('Error fetching jobs:', error);
      
      // Don't show error notification for missing endpoints
      if (error instanceof Error && !error.message.includes('404')) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load job postings'
        });
      } else {
        console.warn('Recruiter jobs endpoint not available, showing empty state');
      }
      
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      await recruiterAPI.deleteJob(jobId.toString());
      setJobs(jobs.filter(job => job.id !== jobId));
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Job posting deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete job posting'
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600 mt-1">Manage your job postings and track applications</p>
        </div>
        <Link
          to="/job-postings/new"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search job postings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Job Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-medium text-blue-600">Total Jobs</h3>
          <p className="text-2xl font-bold text-blue-900 mt-1">{jobs.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="text-sm font-medium text-green-600">Active Jobs</h3>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {jobs.filter(job => job.status === 'active').length}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <h3 className="text-sm font-medium text-orange-600">Total Applications</h3>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {jobs.reduce((sum, job) => sum + job.applications_count, 0)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h3 className="text-sm font-medium text-purple-600">Avg Applications</h3>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {jobs.length ? Math.round(jobs.reduce((sum, job) => sum + job.applications_count, 0) / jobs.length) : 0}
          </p>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? "Try adjusting your search criteria" 
                : "Start by creating your first job posting"}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Demo Mode:</strong> Some recruiter features may not be available until backend endpoints are implemented.
                The job posting form is fully functional!
              </p>
            </div>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                to="/job-postings/new"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                <Plus className="w-4 h-4" />
                <span>Post Your First Job</span>
              </Link>
            )}
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-blue-600 font-medium mb-2">{job.company}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Posted {new Date(job.posted).toLocaleDateString()}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {job.salary.currency} {job.salary?.min?.toLocaleString() || 'N/A'} - {job.salary?.max?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/candidates?jobId=${job.id}`}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Users className="w-4 h-4" />
                    <span>{job.applications_count} Applications</span>
                  </Link>
                  <div className="relative">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-gray-600">Skills:</span>
                <div className="flex flex-wrap gap-2">
                  {job.skills.slice(0, 5).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{job.skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/candidates?jobId=${job.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View Applications
                  </Link>
                  <Link
                    to={`/job-postings/${job.id}/edit`}
                    className="text-gray-600 hover:text-gray-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
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
          ))
        )}
      </div>
    </div>
  );
};

export default JobPostings;
