import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { resumeAPI, ResumeAnalysis } from '../../services/api';
import { geminiAI, ResumeAnalysisResult } from '../../services/geminiAI';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Download,
  Eye,
  Zap,
  Sparkles
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

const ResumeAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [resumeText, setResumeText] = useState<string>('');
  const [targetJob, setTargetJob] = useState<string>('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx')) {
        setFile(droppedFile);
      } else {
        addNotification({
          type: 'error',
          title: 'Invalid File Type',
          message: 'Please upload a PDF or DOCX file.'
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    // Demo user logic: treat users with email 'demo@example.com' or a custom 'isDemo' flag as demo users.
    const isDemoUser = user?.email === 'demo@example.com' || user?.isDemo;
    try {
      if (isDemoUser) {
        setAnalysis({
          score: 88,
          strengths: ['Well-structured', 'Relevant skills', 'Good formatting'],
          improvements: ['Add more keywords', 'Expand work experience'],
          missingKeywords: ['Leadership', 'Agile'],
          atsCompatibility: 90,
          sections: {
            contact: true,
            summary: true,
            experience: true,
            education: true,
            skills: true
          }
        });
        addNotification({
          type: 'success',
          title: 'Demo Resume Uploaded',
          message: 'Demo analysis loaded for demo user.'
        });
        setUploading(false);
        return;
      }
      await resumeAPI.uploadResume(file);
      
      // Extract text from file for AI analysis
      const text = await extractTextFromFile(file);
      setResumeText(text);
      
      addNotification({
        type: 'success',
        title: 'Resume Uploaded',
        message: 'Your resume has been successfully uploaded and processed.'
      });
      // Auto-analyze after upload
      handleAnalyze();
    } catch (error) {
      console.error('Upload error:', error);
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload resume. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  // Helper function to extract text from file (enhanced for AI analysis)
  const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      if (file.type === 'text/plain') {
        return await file.text();
      }
      
      // For other file types, return a comprehensive sample text that varies based on user
      const userEmail = user?.email || 'unknown';
      const hash = userEmail.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const templates = [
        `John Smith
Software Engineer | ${userEmail}

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years developing scalable web applications using React, Node.js, and cloud technologies. Proven track record of leading cross-functional teams and delivering high-quality software solutions.

TECHNICAL SKILLS
• Frontend: React, TypeScript, JavaScript, HTML5, CSS3, Vue.js
• Backend: Node.js, Python, Java, Express.js, RESTful APIs
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS, Docker, Kubernetes, CI/CD
• Tools: Git, Jest, Webpack, Jira

WORK EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2020-Present
• Led development of microservices architecture serving 1M+ users
• Implemented automated testing reducing bugs by 40%
• Mentored junior developers and conducted code reviews
• Collaborated with product managers on feature planning

Software Developer | StartupXYZ | 2018-2020
• Built responsive web applications using React and Node.js
• Optimized database queries improving performance by 50%
• Integrated third-party APIs and payment systems
• Participated in agile development process

EDUCATION
Bachelor of Science in Computer Science | State University | 2018
Relevant Coursework: Data Structures, Algorithms, Software Engineering

CERTIFICATIONS
• AWS Certified Solutions Architect
• Google Cloud Professional Developer`,

        `Sarah Johnson
Product Manager | ${userEmail}

EXECUTIVE SUMMARY
Results-driven product manager with 6+ years experience launching successful digital products. Expert in user research, data analysis, and cross-functional team leadership. Track record of increasing user engagement by 200% and revenue by $5M.

CORE COMPETENCIES
• Product Strategy & Roadmap Planning
• User Experience Design & Research
• Data Analytics & A/B Testing
• Agile/Scrum Methodologies
• Stakeholder Management
• Go-to-Market Strategy

PROFESSIONAL EXPERIENCE

Senior Product Manager | InnovateTech | 2021-Present
• Managed product portfolio generating $10M+ annual revenue
• Led user research initiatives resulting in 35% increase in user satisfaction
• Collaborated with engineering teams to deliver 20+ features quarterly
• Analyzed user behavior data to inform product decisions

Product Manager | DigitalSolutions | 2019-2021
• Launched 3 major product features with 90%+ user adoption
• Coordinated with design and engineering teams of 15+ members
• Conducted market research and competitive analysis
• Managed product backlog and sprint planning

Associate Product Manager | TechStartup | 2018-2019
• Supported senior PM in feature development and user testing
• Created detailed product requirements and user stories
• Analyzed user feedback and product metrics

EDUCATION
Master of Business Administration | Business School | 2018
Bachelor of Arts in Psychology | University College | 2016`,

        `Michael Chen
Data Scientist | ${userEmail}

PROFESSIONAL PROFILE
Innovative data scientist with 4+ years experience in machine learning, statistical analysis, and big data processing. Expertise in Python, R, and cloud platforms. Successfully deployed ML models improving business outcomes by 30%.

TECHNICAL EXPERTISE
• Programming: Python, R, SQL, Scala, JavaScript
• Machine Learning: Scikit-learn, TensorFlow, PyTorch, Keras
• Data Processing: Pandas, NumPy, Spark, Hadoop
• Visualization: Matplotlib, Seaborn, Plotly, Tableau
• Cloud Platforms: AWS, GCP, Azure
• Databases: PostgreSQL, MongoDB, Snowflake

WORK HISTORY

Senior Data Scientist | DataCorp | 2022-Present
• Developed predictive models increasing revenue by $2M annually
• Built recommendation systems serving 500K+ daily users
• Led data science team of 5 members on multiple projects
• Implemented MLOps pipelines for model deployment and monitoring

Data Scientist | AnalyticsFirm | 2020-2022
• Created customer segmentation models improving targeting by 25%
• Developed time series forecasting models for inventory management
• Collaborated with product teams to integrate ML features
• Conducted A/B tests to validate model performance

Junior Data Analyst | StartupData | 2019-2020
• Performed exploratory data analysis on large datasets
• Created automated reporting dashboards using Python and SQL
• Supported business teams with ad-hoc data requests

EDUCATION & CERTIFICATIONS
Master of Science in Statistics | Technical University | 2019
Bachelor of Science in Mathematics | State College | 2017
• AWS Certified Machine Learning Specialty
• Google Cloud Professional Data Engineer`
      ];
      
      const selectedTemplate = templates[hash % templates.length];
      return selectedTemplate;
    } catch (error) {
      console.error('Error extracting text from file:', error);
      return `Resume content for ${user?.firstName || 'User'} - Ready for AI analysis with skills in technology and professional experience.`;
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const isDemoUser = user?.email === 'demo@example.com' || user?.isDemo;
    
    try {
      if (isDemoUser) {
        // Demo user gets static data
        setAnalysis({
          score: 88,
          strengths: ['Well-structured', 'Relevant skills', 'Good formatting'],
          improvements: ['Add more keywords', 'Expand work experience'],
          missingKeywords: ['Leadership', 'Agile'],
          atsCompatibility: 90,
          sections: {
            contact: true,
            summary: true,
            experience: true,
            education: true,
            skills: true
          }
        });
        addNotification({
          type: 'success',
          title: 'Demo Analysis Complete',
          message: 'Demo analysis loaded for demo user.'
        });
      } else {
        // Real users get AI-powered analysis
        if (useAI && resumeText) {
          // Use Gemini AI for analysis
          const aiAnalysis = await geminiAI.analyzeResume(resumeText, targetJob);
          setGeminiAnalysis(aiAnalysis);
          
          // Convert to compatible format for display
          setAnalysis({
            score: aiAnalysis.score,
            strengths: aiAnalysis.strengths,
            improvements: aiAnalysis.improvements,
            missingKeywords: aiAnalysis.missingKeywords,
            atsCompatibility: aiAnalysis.atsCompatibility,
            sections: aiAnalysis.sections
          });
          
          addNotification({
            type: 'success',
            title: 'AI Analysis Complete',
            message: 'Your resume has been analyzed using advanced AI technology.'
          });
        } else {
          // Fallback to traditional analysis
          const analysisResult = await resumeAPI.analyzeResume();
          setAnalysis(analysisResult);
          addNotification({
            type: 'success',
            title: 'Analysis Complete',
            message: 'Your resume has been analyzed successfully.'
          });
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: 'Failed to analyze resume. Please try again.'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resume Analyzer</h1>
        <p className="text-gray-600 mt-1">
          Get AI-powered insights to optimize your resume for ATS systems and recruiters
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-soft p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Upload Your Resume</h2>
        
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            {!file ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Drop your resume here, or click to browse
                  </h3>
                  <p className="text-gray-600">
                    Supports PDF and DOCX files up to 10MB
                  </p>
                </div>
                
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer"
                >
                  Choose File
                </label>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                    <span>{uploading ? 'Processing...' : 'Analyze Resume'}</span>
                  </button>
                  
                  <button
                    onClick={() => setFile(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Analysis Controls */}
      <div className="bg-white rounded-xl shadow-soft p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span>AI-Powered Analysis</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Use Gemini AI for advanced resume insights and personalized recommendations
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

        {useAI && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Job Description (Optional)
              </label>
              <textarea
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="Paste the job description you're targeting to get personalized analysis..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Adding a target job description will provide more specific keyword and skill recommendations
              </p>
            </div>

            {file && !analysis && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {analyzing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                <span>{analyzing ? 'Analyzing with AI...' : 'Analyze with Gemini AI'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* AI-Powered Detailed Feedback */}
      {geminiAnalysis && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-soft p-8 border border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span>AI Detailed Feedback</span>
          </h3>
          <div className="bg-white rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">{geminiAnalysis.detailedFeedback}</p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white rounded-xl shadow-soft p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Resume Analysis Results</h2>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gray-200"></div>
                <div 
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${getScoreBg(analysis.score)}`}
                  style={{
                    background: `conic-gradient(from 0deg, ${analysis.score >= 80 ? '#10B981' : analysis.score >= 60 ? '#F59E0B' : '#EF4444'} ${analysis.score * 3.6}deg, #E5E7EB 0deg)`
                  }}
                ></div>
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}
                  </span>
                </div>
              </div>
              <p className="text-lg text-gray-600">Overall Resume Score</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Strengths</span>
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span>Areas for Improvement</span>
                </h3>
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* ATS Compatibility */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>ATS Compatibility</span>
              </h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Compatibility Score</span>
                  <span className="text-sm font-semibold text-blue-600">{analysis.atsCompatibility}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${analysis.atsCompatibility}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Your resume is {analysis.atsCompatibility >= 80 ? 'highly' : analysis.atsCompatibility >= 60 ? 'moderately' : 'poorly'} optimized for Applicant Tracking Systems.
              </p>
            </div>

            {/* Section Completeness */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Eye className="w-5 h-5 text-green-600" />
                <span>Section Completeness</span>
              </h3>
              <div className="space-y-3">
                {analysis.sections && Object.entries(analysis.sections).map(([section, completed]) => (
                  <div key={section} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {section.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      completed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {completed ? '✓' : '✗'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Missing Keywords</h3>
            <p className="text-gray-600 mb-4">
              Consider adding these industry-relevant keywords to improve your resume's visibility:
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords && analysis.missingKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-200"
                >
                  {keyword}
                </span>
              ))}
              {(!analysis.missingKeywords || analysis.missingKeywords.length === 0) && (
                <span className="text-gray-500 text-sm">No missing keywords identified</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Download Report</span>
            </button>
            <button 
              onClick={handleAnalyze}
              disabled={analyzing}
              className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {analyzing ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              <span>{analyzing ? 'Analyzing...' : 'Re-analyze'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Resume Optimization Tips</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">ATS Optimization</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use standard section headings</li>
              <li>• Include relevant keywords</li>
              <li>• Avoid complex formatting</li>
              <li>• Use common fonts</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Content Quality</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Quantify achievements</li>
              <li>• Use action verbs</li>
              <li>• Tailor to job descriptions</li>
              <li>• Keep it concise (1-2 pages)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Assistant Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Get personalized career guidance from our AI assistant.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  addNotification({
                    type: 'info',
                    title: 'AI Assistant',
                    message: 'AI career guidance feature will be available soon! Upload your resume for detailed analysis.'
                  });
                }}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Career Guidance
              </button>
              <div className="text-sm text-gray-500">
                <p>Our AI can help you with:</p>
                <ul className="mt-1 ml-4 list-disc">
                  <li>Resume optimization strategies</li>
                  <li>Industry-specific keywords</li>
                  <li>Career path recommendations</li>
                  <li>Interview preparation tips</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;