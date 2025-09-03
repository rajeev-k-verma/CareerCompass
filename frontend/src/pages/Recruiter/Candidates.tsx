import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Search, MapPin, Briefcase, Calendar } from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

interface Candidate {
  id: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  location: string;
  experience_years: number;
  skills: string[];
  education: string;
  current_role: string;
  match_score?: number;
  application?: {
    id: number;
    status: string;
    applied_date: string;
    cover_letter?: string;
  };
}

const Candidates: React.FC = () => {
  const { addNotification } = useNotification();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, [jobId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      let response;
      if (jobId) {
        response = await recruiterAPI.getJobApplicants(jobId);
      } else {
        response = await recruiterAPI.getAllCandidates();
      }
      const candidates = response.results || response;
      // Ensure we have valid candidate objects and filter out any invalid ones
      const validCandidates = Array.isArray(candidates) ? 
        candidates.filter(candidate => 
          candidate && 
          typeof candidate === 'object' && 
          candidate.user &&
          typeof candidate.user === 'object'
        ) : [];
      setCandidates(validCandidates);
    } catch (error: unknown) {
      console.error('Error fetching candidates:', error);
      
      // Don't show error notification for missing endpoints
      if (error instanceof Error && !error.message.includes('404')) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load candidates'
        });
      } else {
        console.warn('Recruiter candidates endpoint not available, showing empty state');
      }
      
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    // Safe access to user properties
    if (!candidate.user || !candidate.user.firstName || !candidate.user.lastName) {
      return false;
    }
    const fullName = `${candidate.user.firstName} ${candidate.user.lastName}`.toLowerCase();
    const currentRole = candidate.current_role || '';
    return fullName.includes(searchTerm.toLowerCase()) ||
           currentRole.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {jobId ? 'Job Applicants' : 'All Candidates'}
          </h1>
          <p className="text-gray-600 mt-1">
            {jobId ? 'Manage applications for this job posting' : 'Browse and manage all candidates'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600 mb-4">No candidates have applied to this job yet</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Demo Mode:</strong> Candidate management features will be available once backend endpoints are implemented.
                The UI is ready for full functionality!
              </p>
            </div>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {candidate.user?.firstName?.[0] || '?'}{candidate.user?.lastName?.[0] || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {candidate.user?.firstName || 'Unknown'} {candidate.user?.lastName || 'User'}
                    </h3>
                    <p className="text-blue-600 font-medium">{candidate.current_role || 'No role specified'}</p>
                    <p className="text-sm text-gray-600">{candidate.user?.email || 'No email'}</p>
                  </div>
                </div>
                
                {candidate.match_score && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {candidate.match_score}%
                    </div>
                    <div className="text-xs text-gray-500">match</div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{candidate.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{candidate.experience_years} years experience</span>
                </div>
                {candidate.application && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Applied {new Date(candidate.application.applied_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-gray-600">Skills:</span>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.slice(0, 6).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{candidate.skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View Profile
                  </button>
                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                    Message
                  </button>
                </div>
                {candidate.application && (
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {(candidate.application?.status || 'pending').replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Candidates;