import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { aiAPI, jobAPI } from '../../services/api';
import { geminiAI } from '../../services/geminiAI';

// Combined interface to handle both API and Gemini AI responses
interface CombinedSkillAnalysis {
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  learningPaths?: {
    skill: string;
    courses: {
      title: string;
      provider: string;
      duration: string;
      rating: number;
      url: string;
    }[];
  }[];
  skillGaps?: {
    skill: string;
    importance: 'high' | 'medium' | 'low';
    timeToLearn: string;
    resources: string[];
  }[];
  learningPath?: string;
  careerAdvice?: string;
}

interface SkillGap {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  timeToLearn: string;
  resources: string[];
}

interface LearningPath {
  skill: string;
  courses: Course[];
}

interface Course {
  title: string;
  provider: string;
  duration: string;
  rating: number;
  url: string;
}
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  Brain, 
  Target, 
  BookOpen, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Star,
  Clock,
  Sparkles,
  Lightbulb,
  Briefcase
} from 'lucide-react';

const SkillAnalysis: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [analysis, setAnalysis] = useState<CombinedSkillAnalysis | null>(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState<CombinedSkillAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [userSkills, setUserSkills] = useState<string>('React, Node.js, JavaScript, CSS, HTML');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobs, setJobs] = useState<{ id: string; title: string; company: string; description: string }[]>([]);
  const jobId = searchParams.get('jobId') || selectedJobId;
  const hasAnalyzedRef = useRef(false);

  const isDemoUser = user?.email === 'demo@example.com' || user?.isDemo;

  // Load available jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobsData = await jobAPI.getJobs();
        setJobs(jobsData?.results || jobsData || []);
      } catch (error) {
        console.error('Error loading jobs:', error);
        // Fallback to demo jobs if API fails
        setJobs([
          { id: 'demo-1', title: 'Senior Frontend Developer', company: 'TechCorp', description: 'Frontend development role' },
          { id: 'demo-2', title: 'UX Designer', company: 'Design Studio', description: 'UX design position' },
          { id: 'demo-3', title: 'Product Manager', company: 'StartupCo', description: 'Product management role' }
        ]);
      }
    };
    loadJobs();
  }, []);

  const handleAnalyze = useCallback(async () => {
    hasAnalyzedRef.current = false; // Reset the ref to allow re-analysis
    setLoading(true);
    
    try {
      if (isDemoUser) {
        // Demo user gets static data
        setAnalysis({
          currentSkills: ['React', 'JavaScript', 'CSS', 'HTML', 'Node.js'],
          requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'Kubernetes'],
          missingSkills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes'],
          learningPaths: [
            {
              skill: 'TypeScript',
              courses: [
                {
                  title: 'TypeScript Complete Course',
                  provider: 'Udemy',
                  duration: '8 hours',
                  rating: 4.8,
                  url: '#'
                }
              ]
            }
          ]
        });
        
        addNotification({
          type: 'success',
          title: 'Demo Analysis Complete',
          message: 'Demo skill gap analysis loaded.'
        });
      } else {
        // Real users get AI-powered analysis
        if (useAI && jobDescription && userSkills) {
          const skillsArray = (userSkills || '').split(',').map(s => s.trim());
          const aiResult = await geminiAI.analyzeSkillGap(skillsArray, jobDescription);
          
          setGeminiAnalysis(aiResult);
          
          // Convert AI result to compatible format
          setAnalysis({
            currentSkills: aiResult.currentSkills,
            requiredSkills: aiResult.requiredSkills,
            missingSkills: aiResult.missingSkills,
            learningPaths: aiResult.skillGaps.map((gap: SkillGap) => ({
              skill: gap.skill,
              courses: gap.resources.map((resource: string) => ({
                title: resource,
                provider: 'AI Recommended',
                duration: gap.timeToLearn,
                rating: 4.5,
                url: '#'
              }))
            }))
          });
          
          addNotification({
            type: 'success',
            title: 'AI Analysis Complete',
            message: 'Your skill gap analysis has been generated using AI.'
          });
        } else if (jobId) {
          // Fallback to traditional analysis
          const result = await aiAPI.analyzeSkillGap(jobId);
          setAnalysis(result);
          
          addNotification({
            type: 'success',
            title: 'Analysis Complete',
            message: 'Your skill gap analysis has been generated successfully.'
          });
        } else {
          addNotification({
            type: 'warning',
            title: 'Missing Information',
            message: 'Please provide your skills and job description for AI analysis.'
          });
        }
      }
    } catch (error) {
      console.error('Skill analysis error:', error);
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: 'Failed to analyze skill gaps. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [isDemoUser, jobId, useAI, userSkills, jobDescription, addNotification]);

  useEffect(() => {
    if (jobId && !hasAnalyzedRef.current) {
      hasAnalyzedRef.current = true;
      
      const runAnalysis = async () => {
        setLoading(true);
        
        try {
          if (isDemoUser) {
            // Demo user gets static data
            setAnalysis({
              currentSkills: ['React', 'JavaScript', 'CSS', 'HTML', 'Node.js'],
              requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'Kubernetes'],
              missingSkills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes'],
              learningPaths: [
                {
                  skill: 'TypeScript',
                  courses: [
                    {
                      title: 'TypeScript Complete Course',
                      provider: 'Udemy',
                      duration: '8 hours',
                      rating: 4.8,
                      url: '#'
                    }
                  ]
                }
              ]
            });
            
            addNotification({
              type: 'success',
              title: 'Demo Analysis Complete',
              message: 'Demo skill gap analysis loaded.'
            });
          } else {
            // Real users get AI-powered analysis
            if (useAI && jobDescription && userSkills) {
              const skillsArray = (userSkills || '').split(',').map(s => s.trim());
              const aiResult = await geminiAI.analyzeSkillGap(skillsArray, jobDescription);
              
              setGeminiAnalysis(aiResult);
              
              // Convert AI result to compatible format
              setAnalysis({
                currentSkills: aiResult.currentSkills,
                requiredSkills: aiResult.requiredSkills,
                missingSkills: aiResult.missingSkills,
                learningPaths: aiResult.skillGaps.map((gap: SkillGap) => ({
                  skill: gap.skill,
                  courses: gap.resources.map((resource: string) => ({
                    title: resource,
                    provider: 'AI Recommended',
                    duration: gap.timeToLearn,
                    rating: 4.5,
                    url: '#'
                  }))
                }))
              });
              
              addNotification({
                type: 'success',
                title: 'AI Analysis Complete',
                message: 'Your skill gap analysis has been generated using AI.'
              });
            } else {
              // Fallback to traditional analysis
              const result = await aiAPI.analyzeSkillGap(jobId);
              setAnalysis(result);
              
              addNotification({
                type: 'success',
                title: 'Analysis Complete',
                message: 'Your skill gap analysis has been generated successfully.'
              });
            }
          }
        } catch (error) {
          console.error('Skill analysis error:', error);
          addNotification({
            type: 'error',
            title: 'Analysis Failed',
            message: 'Failed to analyze skill gaps. Please try again.'
          });
        } finally {
          setLoading(false);
        }
      };
      
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="bg-white rounded-xl p-8 shadow-soft">
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <span>AI Skill Gap Analysis</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Get AI-powered insights to identify missing skills and create your learning path
          </p>
        </div>
      </div>

      {/* Job Selection */}
      {!searchParams.get('jobId') && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Briefcase className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Select a Job</h2>
          </div>
          <p className="text-gray-600 mb-4">Choose a job to analyze skills against:</p>
          
          <div className="grid gap-3">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedJobId === job.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{job.title}</div>
                <div className="text-sm text-gray-600">{job.company}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Controls */}
      <div className="bg-white rounded-xl shadow-soft p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span>AI-Powered Skill Analysis</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Use Gemini AI for comprehensive skill gap analysis and personalized learning paths
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Use AI Analysis</span>
            </label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Current Skills
            </label>
            <textarea
              value={userSkills}
              onChange={(e) => setUserSkills(e.target.value)}
              placeholder="React, Node.js, JavaScript, Python, SQL..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description you're targeting..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          <span>{loading ? 'Analyzing with AI...' : 'Analyze with Gemini AI'}</span>
        </button>
      </div>

      {/* AI Career Advice */}
      {geminiAnalysis && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-soft p-8 border border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Lightbulb className="w-6 h-6 text-purple-600" />
            <span>AI Career Advice</span>
          </h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Learning Path Recommendation</h4>
              <p className="text-gray-700">{geminiAnalysis.learningPath}</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Career Advice</h4>
              <p className="text-gray-700">{geminiAnalysis.careerAdvice}</p>
            </div>
          </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="bg-white rounded-xl shadow-soft p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Analyze Your Skills?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get AI-powered insights into your skill gaps and receive personalized learning recommendations 
            to advance your career and match job requirements better.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={!jobId}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {jobId ? 'Start Analysis' : 'Select a Job First'}
          </button>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Skills Overview */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Current Skills</h3>
                  <p className="text-2xl font-bold text-green-600">{analysis.currentSkills.length}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.currentSkills.slice(0, 6).map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {analysis.currentSkills.length > 6 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    +{analysis.currentSkills.length - 6} more
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Required Skills</h3>
                  <p className="text-2xl font-bold text-blue-600">{analysis.requiredSkills.length}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.requiredSkills.slice(0, 6).map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {analysis.requiredSkills.length > 6 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    +{analysis.requiredSkills.length - 6} more
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Missing Skills</h3>
                  <p className="text-2xl font-bold text-orange-600">{analysis.missingSkills.length}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.slice(0, 6).map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {analysis.missingSkills.length > 6 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    +{analysis.missingSkills.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Learning Paths */}
          <div className="bg-white rounded-xl shadow-soft p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Personalized Learning Paths</h2>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem('savedLearningPlan', JSON.stringify({
                    analysis,
                    savedAt: new Date().toISOString(),
                    jobId
                  }));
                  addNotification({
                    type: 'success',
                    title: 'Learning Plan Saved',
                    message: 'Your personalized learning plan has been saved to your profile.'
                  });
                }}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Save Plan</span>
              </button>
            </div>

            <div className="space-y-8">
              {analysis.learningPaths?.map((path: LearningPath, index: number) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{path.skill}</h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {path.courses.length} courses
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {path.courses.map((course: Course, courseIndex: number) => (
                      <div
                        key={courseIndex}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 flex-1">{course.title}</h4>
                          <ExternalLink className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="font-medium text-blue-600">{course.provider}</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{course.rating}</span>
                          </div>
                        </div>

                        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all text-sm">
                          Start Learning
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant Help */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-6">
                Get personalized career guidance from our AI assistant.
              </p>
              <button
                onClick={() => {
                  const question = prompt('What career question would you like to ask our AI assistant?');
                  if (question) {
                    // For demo, show a mock response
                    setTimeout(() => {
                      addNotification({
                        type: 'info',
                        title: 'AI Assistant Response',
                        message: 'Based on your skills analysis, I recommend focusing on TypeScript and cloud technologies. These are in high demand and align with your current frontend expertise.'
                      });
                    }, 1000);
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2 mx-auto"
              >
                <Lightbulb className="w-5 h-5" />
                <span>Ask AI Assistant</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleAnalyze}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Re-analyze Skills</span>
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all">
              Save Learning Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillAnalysis;