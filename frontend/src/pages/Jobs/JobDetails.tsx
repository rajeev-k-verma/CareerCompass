import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobAPI, Job } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Heart, 
  Share2, 
  CheckCircle,
  Building,
  FileText,
  X
} from 'lucide-react';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);

  const isDemo = user?.email === 'demo@example.com' || user?.isDemo;

  useEffect(() => {
    const loadJobAndApplicationStatus = async () => {
      if (!id) return;
      
      try {
        // Load job details
        const jobData = await jobAPI.getJob(id);
        setJob(jobData);
        
        // Load application status
        if (!isDemo) {
          try {
            const applicationsData = await jobAPI.getMyApplications();
            const hasUserApplied = applicationsData.some((app: { job_id: string }) => app.job_id === id);
            setHasApplied(hasUserApplied);
          } catch (error) {
            console.error('Failed to load application status:', error);
            // Don't fail the whole page if we can't load application status
          }
        } else {
          // For demo users, simulate that they've applied to job with id "1"
          setHasApplied(id === '1');
        }
      } catch (error) {
        console.error('Failed to load job:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobAndApplicationStatus();
  }, [id, isDemo]);

  const handleApply = async () => {
    if (!job) return;

    // Check if user has already applied
    if (hasApplied) {
      addNotification({
        type: 'info',
        title: 'Already Applied',
        message: 'You have already applied to this job.'
      });
      return;
    }

    // Show cover letter modal first
    setShowCoverLetterModal(true);
  };

  const handleDirectApply = async () => {
    if (!job) return;

    setShowCoverLetterModal(false);
    setApplying(true);
    try {
      if (isDemo) {
        setHasApplied(true);
        addNotification({
          type: 'success',
          title: 'Application Submitted!',
          message: 'Demo mode: Your application has been sent successfully.'
        });
      } else {
        await jobAPI.applyToJob(job.id);
        setHasApplied(true);
        addNotification({
          type: 'success',
          title: 'Application Submitted!',
          message: 'Your application has been sent successfully.'
        });
      }
    } catch (error: unknown) {
      console.error('Error applying to job:', error);
      
      if (error instanceof Error) {
        const errorStatus = (error as Error & { status?: number }).status;
        
        if (errorStatus === 400) {
          setHasApplied(true);
          addNotification({
            type: 'info',
            title: 'Already Applied',
            message: error.message || 'You have already applied to this job.'
          });
        } else {
          addNotification({
            type: 'error',
            title: 'Application Failed',
            message: error.message || 'Failed to submit application. Please try again.'
          });
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Application Failed',
          message: 'Failed to submit application. Please try again.'
        });
      }
    } finally {
      setApplying(false);
    }
  };

  const handleBookmark = async () => {
    if (!job) return;

    try {
      await jobAPI.saveJob(job.id);
      addNotification({
        type: 'success',
        title: 'Job Saved!',
        message: 'Job has been saved to your bookmarks.'
      });
    } catch (error) {
      console.error('Error bookmarking job:', error);
      addNotification({
        type: 'error',
        title: 'Bookmark Failed',
        message: 'Failed to save job. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Job Not Found</h2>
        <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or may have been removed.</p>
        <Link
          to="/jobs"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/jobs"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
          
          <div className="flex space-x-3">
            <button
              onClick={handleBookmark}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center text-gray-600 space-x-4 mb-4">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Posted recently</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                    {(job.type || 'full-time').replace('-', ' ')}
                  </span>
                  {job.salary && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      ${job.salary.min}k - ${job.salary.max}k
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Job Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.floor(Math.random() * 50) + 10}
                </div>
                <div className="text-sm text-gray-600">Applicants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {job.matchScore || Math.floor(Math.random() * 30) + 70}%
                </div>
                <div className="text-sm text-gray-600">Match</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.floor(Math.random() * 20) + 5}
                </div>
                <div className="text-sm text-gray-600">Days Left</div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {job.description || 'We are looking for a talented professional to join our team. This is an exciting opportunity to work with cutting-edge technologies and make a significant impact on our products and services.'}
              </p>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
            <ul className="space-y-2">
              {job.requirements?.map((req, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{req}</span>
                </li>
              )) || [
                'Bachelor\'s degree in relevant field',
                '3+ years of professional experience',
                'Strong problem-solving skills',
                'Excellent communication abilities'
              ].map((req, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Apply */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Apply</h3>
            
            {!hasApplied ? (
              <button
                onClick={handleApply}
                disabled={applying}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 mb-3"
              >
                {applying ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Apply Now'
                )}
              </button>
            ) : (
              <div className="w-full bg-green-100 text-green-800 py-3 px-4 rounded-lg font-medium mb-3 text-center flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Applied ✓</span>
              </div>
            )}

            <Link
              to={`/cover-letter?jobId=${job.id}`}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-all text-center block"
            >
              Generate Cover Letter
            </Link>
          </div>

          {/* Match Analysis */}
          {job.matchScore && (
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Match Analysis</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Match</span>
                    <span className="text-sm font-semibold text-blue-600">{job.matchScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${job.matchScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Skills Match</span>
                    <span className="text-xs text-green-600 font-medium">Strong</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Experience</span>
                    <span className="text-xs text-yellow-600 font-medium">Good</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Location</span>
                    <span className="text-xs text-green-600 font-medium">Perfect</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Company Info */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">About Company</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Company Profile</span>
                  <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </div>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">More Jobs at {job.company}</span>
                  <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Cover Letter Modal */}
      {showCoverLetterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Apply to Job</h3>
              <button
                onClick={() => setShowCoverLetterModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Would you like to generate a cover letter for this position to improve your application?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowCoverLetterModal(false);
                  navigate(`/cover-letter?jobId=${job?.id}`);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>Generate Cover Letter First</span>
              </button>
              
              <button
                onClick={handleDirectApply}
                disabled={applying}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                {applying ? (
                  <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Apply Without Cover Letter'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobDetails;
