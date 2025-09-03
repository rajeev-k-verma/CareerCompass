import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { geminiAI, JobRecommendation } from '../../services/geminiAI';
import { jobAPI } from '../../services/api';
import { 
  MapPin, 
  DollarSign, 
  Star, 
  Building, 
  Sparkles,
  TrendingUp,
  Filter,
  RefreshCw
} from 'lucide-react';

const AIJobRecommendations: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [userSkills, setUserSkills] = useState<string>('');
  const hasShownNoSkillsNotification = useRef(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [preferences, setPreferences] = useState({
    location: '',
    experienceLevel: 'mid-level',
    industries: '',
    salaryMin: '',
    workMode: 'remote'
  });

  const isDemoUser = user?.email === 'demo@example.com' || user?.isDemo;

  // Initialize user skills from profile
  useEffect(() => {
    if (user?.skills && user.skills.length > 0) {
      setUserSkills(user.skills.join(', '));
    }
    if (user?.location) {
      setPreferences(prev => ({ ...prev, location: user.location }));
    }
  }, [user]);

  const generateRecommendations = useCallback(async () => {
    setLoading(true);
    
    try {
      if (isDemoUser) {
        // Demo user gets static recommendations
        setRecommendations([
          {
            id: 'demo_1',
            title: 'Senior Frontend Developer',
            company: 'TechCorp Inc.',
            matchScore: 95,
            matchReasons: ['React expertise', 'TypeScript experience', 'Remote work preference'],
            salaryRange: '$80,000 - $120,000',
            location: 'Remote',
            aiInsight: 'Perfect match for your frontend skills with modern tech stack and remote flexibility.'
          },
          {
            id: 'demo_2',
            title: 'Full Stack Engineer',
            company: 'StartupXYZ',
            matchScore: 88,
            matchReasons: ['Full stack experience', 'Startup environment fit', 'Node.js skills'],
            salaryRange: '$70,000 - $100,000',
            location: 'San Francisco, CA',
            aiInsight: 'Great opportunity to work with cutting-edge technologies in a fast-paced startup environment.'
          },
          {
            id: 'demo_3',
            title: 'React Developer',
            company: 'Digital Agency Pro',
            matchScore: 82,
            matchReasons: ['React specialization', 'UI/UX focus', 'Client work experience'],
            salaryRange: '$65,000 - $90,000',
            location: 'New York, NY',
            aiInsight: 'Excellent role for developing diverse client projects and expanding your React expertise.'
          }
        ]);
        
        addNotification({
          type: 'success',
          title: 'Demo Recommendations Loaded',
          message: 'Sample job recommendations for demo user.'
        });
      } else {
        // Real users get AI-powered recommendations
        const userProfile = {
          experienceLevel: preferences.experienceLevel,
          location: preferences.location || 'Remote',
          industries: (preferences.industries || '').split(',').map(i => i.trim()).filter(i => i),
          salaryMin: parseInt(preferences.salaryMin) || 0
        };

        const skillsArray = (userSkills || '').split(',').map(skill => skill.trim()).filter(skill => skill);
        
        if (skillsArray.length === 0) {
          // Only show notification once using ref
          if (!hasShownNoSkillsNotification.current) {
            addNotification({
              type: 'warning',
              title: 'Add Your Skills',
              message: 'Please add your skills to get personalized recommendations.'
            });
            hasShownNoSkillsNotification.current = true;
          }
          setLoading(false);
          return;
        }

        const aiRecommendations = await geminiAI.generateJobRecommendations(userProfile, skillsArray);
        setRecommendations(aiRecommendations);
        
        addNotification({
          type: 'success',
          title: 'AI Recommendations Generated',
          message: `Found ${aiRecommendations.length} personalized job recommendations.`
        });
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate recommendations. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [isDemoUser, preferences.experienceLevel, preferences.industries, preferences.location, preferences.salaryMin, userSkills, addNotification]);

  // Auto-load recommendations on component mount (only once)
  useEffect(() => {
    const loadInitialRecommendations = async () => {
      setLoading(true);
      
      try {
        if (isDemoUser) {
          // Demo user gets static recommendations
          setRecommendations([
            {
              id: 'demo_1',
              title: 'Senior Frontend Developer',
              company: 'TechCorp Inc.',
              matchScore: 95,
              matchReasons: ['React expertise', 'TypeScript experience', 'Remote work preference'],
              salaryRange: '$80,000 - $120,000',
              location: 'Remote',
              aiInsight: 'Perfect match for your frontend skills with modern tech stack and remote flexibility.'
            },
            {
              id: 'demo_2',
              title: 'Full Stack Engineer',
              company: 'StartupXYZ',
              matchScore: 88,
              matchReasons: ['Full stack experience', 'Startup environment fit', 'Node.js skills'],
              salaryRange: '$70,000 - $100,000',
              location: 'San Francisco, CA',
              aiInsight: 'Great opportunity to work with cutting-edge technologies in a fast-paced startup environment.'
            },
            {
              id: 'demo_3',
              title: 'React Developer',
              company: 'Digital Agency Pro',
              matchScore: 82,
              matchReasons: ['React specialization', 'UI/UX focus', 'Client work experience'],
              salaryRange: '$65,000 - $90,000',
              location: 'New York, NY',
              aiInsight: 'Excellent role for developing diverse client projects and expanding your React expertise.'
            }
          ]);
          
          addNotification({
            type: 'success',
            title: 'Demo Recommendations Loaded',
            message: 'Sample job recommendations for demo user.'
          });
        } else {
          // For real users, check if they have skills from their profile
          const profileSkills = user?.skills || [];
          const formSkills = (userSkills || '').split(',').map(skill => skill.trim()).filter(skill => skill);
          const allSkills = [...profileSkills, ...formSkills];
          
          if (allSkills.length === 0) {
            // Only show notification once
            if (!hasShownNoSkillsNotification.current) {
              addNotification({
                type: 'warning',
                title: 'Add Your Skills',
                message: 'Please add your skills to get personalized recommendations.'
              });
              hasShownNoSkillsNotification.current = true;
            }
          } else {
            // User has skills, try to generate recommendations
            try {
              const userProfile = {
                experienceLevel: preferences.experienceLevel,
                location: preferences.location || user?.location || 'Remote',
                industries: (preferences.industries || '').split(',').map(i => i.trim()).filter(i => i),
                salaryMin: parseInt(preferences.salaryMin) || 0
              };

              const aiRecommendations = await geminiAI.generateJobRecommendations(userProfile, allSkills);
              setRecommendations(aiRecommendations);
              
              addNotification({
                type: 'success',
                title: 'AI Recommendations Generated',
                message: `Found ${aiRecommendations.length} personalized job recommendations.`
              });
            } catch (error) {
              console.error('Error generating AI recommendations:', error);
              addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to generate AI recommendations. Using manual refresh.'
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading initial recommendations:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load recommendations. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to avoid infinite loop

  const handleRefreshRecommendations = () => {
    hasShownNoSkillsNotification.current = false; // Reset notification flag
    generateRecommendations();
  };

  const handleApplyToJob = async (jobId: string) => {
    try {
      if (isDemoUser) {
        addNotification({
          type: 'info',
          title: 'Demo Mode',
          message: 'This is a demo. In real mode, you would apply to this job.'
        });
        setAppliedJobs(prev => new Set([...prev, jobId]));
        return;
      }
      
      // In real implementation, this would apply to the job
      await jobAPI.applyToJob(jobId);
      setAppliedJobs(prev => new Set([...prev, jobId]));
      addNotification({
        type: 'success',
        title: 'Application Submitted',
        message: 'Your application has been submitted successfully.'
      });
    } catch (error: unknown) {
      console.error('Error applying for job:', error);
      
      if (error instanceof Error) {
        const errorStatus = (error as Error & { status?: number }).status;
        
        if (errorStatus === 400) {
          setAppliedJobs(prev => new Set([...prev, jobId]));
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
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <span>AI Job Recommendations</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Get personalized job recommendations powered by Gemini AI
          </p>
        </div>
        
        <button
          onClick={handleRefreshRecommendations}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{loading ? 'Generating...' : 'Refresh'}</span>
        </button>
      </div>

      {/* User Profile & Preferences */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Preferences</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Skills
            </label>
            <input
              type="text"
              value={userSkills}
              onChange={(e) => setUserSkills(e.target.value)}
              placeholder="React, Node.js, Python, SQL..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Location
            </label>
            <input
              type="text"
              value={preferences.location}
              onChange={(e) => setPreferences(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Remote, San Francisco, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              value={preferences.experienceLevel}
              onChange={(e) => setPreferences(prev => ({ ...prev, experienceLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="entry-level">Entry Level</option>
              <option value="mid-level">Mid Level</option>
              <option value="senior-level">Senior Level</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industries of Interest
            </label>
            <input
              type="text"
              value={preferences.industries}
              onChange={(e) => setPreferences(prev => ({ ...prev, industries: e.target.value }))}
              placeholder="Technology, Healthcare, Finance..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Salary
            </label>
            <input
              type="text"
              value={preferences.salaryMin}
              onChange={(e) => setPreferences(prev => ({ ...prev, salaryMin: e.target.value }))}
              placeholder="$70,000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Job Recommendations */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Generating AI-powered recommendations...</p>
          </div>
        ) : recommendations.length > 0 ? (
          recommendations.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(job.matchScore)}`}>
                      {job.matchScore}% Match
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salaryRange}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insight */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4 border border-purple-200">
                <div className="flex items-start space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-1">AI Insight</h4>
                    <p className="text-purple-800 text-sm">{job.aiInsight}</p>
                  </div>
                </div>
              </div>

              {/* Match Reasons */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Why this matches you:</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.matchReasons.map((reason, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                {appliedJobs.has(job.id) ? (
                  <span className="bg-green-100 text-green-800 px-6 py-2 rounded-lg font-medium flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Applied ✓</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleApplyToJob(job.id)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Apply Now
                  </button>
                )}
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all">
                  Save for Later
                </button>
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                  <Star className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-soft">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-4">
              Add your skills and preferences to get personalized AI recommendations
            </p>
            <button
              onClick={handleRefreshRecommendations}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Generate Recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIJobRecommendations;
