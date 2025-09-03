import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Job } from '../../../services/api';

interface JobRecommendationsProps {
  jobs: Job[];
}

const JobRecommendations: React.FC<JobRecommendationsProps> = ({ jobs }) => {
  if (!jobs?.length) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Job Recommendations</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations yet</h3>
          <p className="text-gray-600 mb-4">Upload your resume to get personalized job matches</p>
          <Link
            to="/resume-analyzer"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <span>Upload Resume</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Top Job Matches</h2>
        <Link
          to="/jobs"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Link
                  to={`/jobs/${job.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors group-hover:text-blue-600"
                >
                  {job.title}
                </Link>
                <p className="text-blue-600 font-medium">{job.company}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  (job.matchScore || 0) >= 90 ? 'bg-green-100 text-green-800' :
                  (job.matchScore || 0) >= 75 ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {job.matchScore}% match
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(job.posted).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">
                {job.salary?.min && job.salary?.max ? (
                  `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                ) : (
                  'Salary not specified'
                )}
              </span>
              <Link
                to={`/jobs/${job.id}`}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <span>View Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobRecommendations;