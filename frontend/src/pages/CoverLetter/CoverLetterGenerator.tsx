import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { aiAPI, jobAPI } from '../../services/api';
import { geminiAI } from '../../services/geminiAI';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  FileText, 
  Mail, 
  Wand2, 
  Copy, 
  Download, 
  Send,
  Settings,
  Sparkles,
  Briefcase
} from 'lucide-react';

const CoverLetterGenerator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [contentType, setContentType] = useState<'cover-letter' | 'cold-email'>('cover-letter');
  const [tone, setTone] = useState('professional');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useAI] = useState(true);
  const [jobDescription] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobs, setJobs] = useState<{ id: string; title: string; company: string; description: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  const [userProfile] = useState({
    name: user?.firstName + ' ' + user?.lastName || 'Your Name',
    experience: '',
    skills: ''
  });
  
  const jobId = searchParams.get('jobId') || selectedJobId;
  const type = searchParams.get('type');
  const isDemoUser = user?.email === 'demo@example.com' || user?.isDemo;

  // Load available jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobsData = await jobAPI.getJobs();
        setJobs(jobsData?.results || jobsData || []);
      } catch {
        // Fallback to demo jobs if API fails
        setJobs([
          { id: 'demo-1', title: 'Senior Frontend Developer', company: 'TechCorp', description: 'Frontend development role' },
          { id: 'demo-2', title: 'UX Designer', company: 'Design Studio', description: 'UX design role' },
          { id: 'demo-3', title: 'Product Manager', company: 'StartupCo', description: 'Product management role' }
        ]);
      }
    };
    loadJobs();
  }, []);

  React.useEffect(() => {
    if (type === 'email') {
      setContentType('cold-email');
    }
  }, [type]);

  const handleGenerate = async () => {
    setGenerating(true);
    
    try {
      if (isDemoUser) {
        // Demo user gets static content
        const selectedJob = jobs.find(j => j.id === jobId);
        const userSkills = user?.skills?.join(', ') || 'React, Node.js, JavaScript, TypeScript, Python';
        const userName = userProfile.name || 'Demo User';
        
        const demoContent = contentType === 'cover-letter' 
          ? `Dear Hiring Manager,

I am writing to express my strong interest in the ${selectedJob?.title || '[Position Title]'} role at ${selectedJob?.company || '[Company Name]'}. With my background in software development and passion for creating innovative solutions, I believe I would be a valuable addition to your team.

My experience includes:
• 3+ years of full-stack development
• Proficiency in ${userSkills}
• Strong problem-solving and communication skills

${selectedJob?.description ? `The role's focus on ${selectedJob.description.split('.')[0].toLowerCase()} particularly aligns with my career goals and expertise. ` : ''}

I am excited about the opportunity to contribute to your team's success and would welcome the chance to discuss how my skills align with your needs.

Thank you for your consideration.

Sincerely,
${userName}`
          : `Subject: ${selectedJob?.title || '[Position Title]'} Opportunity - Interest from ${userName}

Dear Hiring Manager,

I hope this email finds you well. I recently discovered the ${selectedJob?.title || '[Position Title]'} position at ${selectedJob?.company || '[Company Name]'} and was immediately drawn to the role.

${tone === 'enthusiastic' 
  ? `I am genuinely excited about the opportunity to contribute to ${selectedJob?.company || '[Company Name]'}'s mission. ` 
  : tone === 'confident' 
    ? `With my proven experience in ${userSkills}, I am confident I can make a significant impact at ${selectedJob?.company || '[Company Name]'}. `
    : `With my background in ${userSkills}, I believe I could bring valuable expertise to your team. `
}

I would love to learn more about this opportunity and discuss how my skills might contribute to ${selectedJob?.company || '[Company Name]'}'s continued success.

Would you be available for a brief conversation to explore this position further?

Best regards,
${userName}
${user?.email || 'demo@example.com'}`;

        setGeneratedContent(demoContent);
        
        // Generate email format for both types
        if (contentType === 'cover-letter') {
          setEmailSubject(`Application for ${selectedJob?.title || '[Position Title]'} - ${userProfile.name}`);
          setGeneratedEmail(`Dear Hiring Manager,

Please find attached my cover letter and resume for the ${selectedJob?.title || '[Position Title]'} position at ${selectedJob?.company || '[Company Name]'}.

I am very interested in this opportunity and would welcome the chance to discuss how my skills and experience align with your team's needs.

Thank you for your consideration.

Best regards,
${userProfile.name}`);
        } else {
          setEmailSubject(`Interest in ${selectedJob?.title || '[Position Title]'} Opportunity`);
          setGeneratedEmail(demoContent);
        }
        
        setShowResults(true);
        
        // Scroll to results section after a short delay to ensure DOM is updated
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
        }, 300);
        
        addNotification({
          type: 'success',
          title: 'Demo Content Generated',
          message: `Demo ${contentType.replace('-', ' ')} loaded.`
        });
      } else {
        // Real users get AI-powered content
        if (useAI && jobDescription) {
          const profileForAI = {
            ...userProfile,
            skills: userProfile.skills ? userProfile.skills.split(',').map(s => s.trim()) : []
          };
          const result = await geminiAI.generateCoverLetter(jobDescription, profileForAI, tone);
          setGeneratedContent(result.content);
          
          // Generate corresponding email
          const selectedJob = jobs.find(j => j.id === jobId);
          if (contentType === 'cover-letter') {
            setEmailSubject(`Application for ${selectedJob?.title || '[Position Title]'} - ${userProfile.name}`);
            setGeneratedEmail(`Dear Hiring Manager,

Please find attached my cover letter and resume for the ${selectedJob?.title || '[Position Title]'} position at ${selectedJob?.company || '[Company Name]'}.

I am very interested in this opportunity and would welcome the chance to discuss how my skills and experience align with your team's needs.

Thank you for your consideration.

Best regards,
${userProfile.name}`);
          } else {
            setEmailSubject(result.keyPoints?.[0] || `Interest in ${selectedJob?.title || '[Position Title]'} Opportunity`);
            setGeneratedEmail(result.content);
          }
          
          setShowResults(true);
          
          // Scroll to results section after a short delay to ensure DOM is updated
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center'
            });
          }, 300);
          
          addNotification({
            type: 'success',
            title: 'AI Content Generated',
            message: `Your ${contentType.replace('-', ' ')} has been generated using AI.`
          });
        } else if (jobId) {
          // Fallback to traditional API with error handling
          let content;
          try {
            if (contentType === 'cover-letter') {
              content = await aiAPI.generateCoverLetter(jobId, tone);
            } else {
              // Try backend API first
              content = await aiAPI.generateColdEmail(jobId, 'recruiter@company.com');
            }
          } catch (apiError) {
            console.error('Backend API failed, using Gemini AI fallback:', apiError);
            
            // Fallback to Gemini AI for cold email generation
            if (contentType === 'cold-email') {
              const selectedJob = jobs.find(j => j.id === jobId);
              if (selectedJob) {
                // Generate intelligent cold email content based on job and user profile
                const userSkills = user?.skills?.join(', ') || 'technology professional';
                const userName = userProfile.name || 'Professional';

                content = `Subject: ${selectedJob.title} Opportunity - Interest from ${userName}

Dear Hiring Manager,

I hope this email finds you well. I recently discovered the ${selectedJob.title} position at ${selectedJob.company} and was immediately drawn to the role.

${tone === 'enthusiastic' 
  ? `I am genuinely excited about the opportunity to contribute to ${selectedJob.company}'s mission. ` 
  : tone === 'confident' 
    ? `With my proven track record in ${userSkills}, I am confident I can make a significant impact at ${selectedJob.company}. `
    : `With my background in ${userSkills}, I believe I could bring valuable expertise to your team. `
}

${selectedJob.description 
  ? `The role's focus on ${selectedJob.description.split('.')[0].toLowerCase()} particularly resonates with my experience and career goals. ` 
  : ''
}

I would welcome the opportunity to discuss how my skills in ${userSkills} align with your team's needs and contribute to ${selectedJob.company}'s continued success.

Would you be available for a brief conversation to explore this opportunity further?

Thank you for your time and consideration.

Best regards,
${userName}
${user?.email || '[Your Email]'}`;
                
                addNotification({
                  type: 'success',
                  title: 'Smart Template Used',
                  message: 'Generated using intelligent template due to server issues.'
                });
              }
            } else {
              // For cover letter, just throw the error to be handled by outer catch
              throw apiError;
            }
          }
          
          setGeneratedContent(content);
          
          // Generate corresponding email
          const selectedJob = jobs.find(j => j.id === jobId);
          if (contentType === 'cover-letter') {
            setEmailSubject(`Application for ${selectedJob?.title || '[Position Title]'} - ${userProfile.name}`);
            setGeneratedEmail(`Dear Hiring Manager,

Please find attached my cover letter and resume for the ${selectedJob?.title || '[Position Title]'} position at ${selectedJob?.company || '[Company Name]'}.

I am very interested in this opportunity and would welcome the chance to discuss how my skills and experience align with your team's needs.

Thank you for your consideration.

Best regards,
${userProfile.name}`);
          } else {
            setEmailSubject(`Interest in ${selectedJob?.title || '[Position Title]'} Opportunity`);
            setGeneratedEmail(content);
          }
          
          setShowResults(true);
          
          // Scroll to results section after a short delay to ensure DOM is updated
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center'
            });
          }, 300);
          
          addNotification({
            type: 'success',
            title: 'Content Generated',
            message: `Your ${contentType.replace('-', ' ')} has been generated successfully.`
          });
        } else {
          addNotification({
            type: 'warning',
            title: 'Missing Information',
            message: 'Please provide job description for AI generation or select a job.'
          });
        }
      }
    } catch {
      console.error('Generation error');
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate content. Please try again.'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    addNotification({
      type: 'success',
      title: 'Copied!',
      message: 'Content copied to clipboard.'
    });
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${contentType}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendEmail = () => {
    if (!recipientEmail) {
      addNotification({
        type: 'warning',
        title: 'Email Required',
        message: 'Please enter the recipient email address.'
      });
      return;
    }

    // Create mailto link with pre-filled content
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(generatedEmail)}`;
    window.open(mailtoLink);
    
    addNotification({
      type: 'success',
      title: 'Email Opened',
      message: 'Your default email client has been opened with the pre-filled content.'
    });
  };

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic and passionate' },
    { value: 'confident', label: 'Confident', description: 'Assertive and self-assured' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Content Generator</h1>
        <p className="text-gray-600 mt-1">
          Generate personalized cover letters and cold emails with AI
        </p>
      </div>

      {/* Job Selection */}
      {!searchParams.get('jobId') && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Briefcase className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Select a Job</h2>
          </div>
          <p className="text-gray-600 mb-4">Choose a job to generate personalized content for:</p>
          
          <div className="grid gap-3">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedJobId === job.id
                    ? 'border-blue-500 bg-blue-50'
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

      {/* Content Type Selection */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">What would you like to generate?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setContentType('cover-letter')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              contentType === 'cover-letter'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cover Letter</h3>
            </div>
            <p className="text-gray-600">
              Professional cover letter tailored to the specific job posting and your experience.
            </p>
          </button>

          <button
            onClick={() => setContentType('cold-email')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              contentType === 'cold-email'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Mail className="w-8 h-8 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cold Email</h3>
            </div>
            <p className="text-gray-600">
              Personalized outreach email to recruiters and hiring managers.
            </p>
          </button>
        </div>
      </div>

      {/* Customization Options */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Customization Options</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tone & Style
            </label>
            <div className="space-y-2">
              {toneOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTone(option.value)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    tone === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Instructions (Optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add any specific requirements or information you'd like to include..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={generating || !jobId}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-colorful transition-all disabled:opacity-50 flex items-center space-x-3 mx-auto"
        >
          {generating ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Wand2 className="w-6 h-6" />
          )}
          <span>
            {generating 
              ? 'Generating...' 
              : `Generate ${contentType === 'cover-letter' ? 'Cover Letter' : 'Cold Email'}`
            }
          </span>
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Generated Content */}
      {showResults && (
        <div 
          ref={resultsRef} 
          className="space-y-6 animate-in fade-in duration-500 border-t-4 border-blue-500 pt-8 mt-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📄 Generated Content</h2>
            <p className="text-gray-600">Your {contentType === 'cover-letter' ? 'cover letter' : 'cold email'} is ready! You can edit, copy, or send it below.</p>
          </div>
          
          {/* Cover Letter/Content Results */}
          {generatedContent && (
            <div className="bg-white rounded-xl shadow-soft p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Generated {contentType === 'cover-letter' ? 'Cover Letter' : 'Cold Email'}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full h-96 bg-transparent border-none resize-none focus:outline-none text-gray-800 leading-relaxed"
                  placeholder="Generated content will appear here..."
                />
              </div>
            </div>
          )}

          {/* Email Preview */}
          {generatedEmail && (
            <div className="bg-white rounded-xl shadow-soft p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>📧 Email Preview & Send</span>
              </h3>
            </div>

            <div className="space-y-4">
              {/* Recipient Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recruiter@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Email Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Body
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <textarea
                    value={generatedEmail}
                    onChange={(e) => setGeneratedEmail(e.target.value)}
                    className="w-full h-48 bg-transparent border-none resize-none focus:outline-none text-gray-800 leading-relaxed"
                    placeholder="Email content will appear here..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={handleGenerate}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Wand2 className="w-5 h-5" />
                <span>Regenerate</span>
              </button>
              <button 
                onClick={handleSendEmail}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Open in Email</span>
              </button>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Writing Tips</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Cover Letter Best Practices</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Address the hiring manager by name when possible</li>
              <li>• Highlight specific achievements with numbers</li>
              <li>• Show enthusiasm for the company and role</li>
              <li>• Keep it concise (3-4 paragraphs max)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Cold Email Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Research the recipient and company</li>
              <li>• Keep subject line clear and compelling</li>
              <li>• Provide value or insight in your message</li>
              <li>• Include a clear call-to-action</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;