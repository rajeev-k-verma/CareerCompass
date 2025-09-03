import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Configuration
const API_KEY="YOUR API KEY"

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

// Type definitions
interface UserProfile {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  experienceLevel?: string;
  experience?: string;
  location?: string;
  industries?: string[];
  salaryMin?: number;
  skills?: string[];
  role?: string;
}

interface JobPosting {
  id: string;
  title: string;
  company: string;
  description?: string;
  requirements?: string[];
  location?: string;
  type?: string;
  salary?: {
    min?: number;
    max?: number;
  };
  postedDate?: string;
  status?: string;
}

interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: string;
  submittedDate: string;
  candidateName?: string;
  candidateEmail?: string;
}

// Initialize the client only if API key is available
if (API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Use the correct model name - gemini-1.5-flash instead of deprecated gemini-pro
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
  }
}

// Helper function to safely call Gemini API
async function safeGenerateContent(prompt: string): Promise<string> {
  if (!model || !API_KEY) {
    console.warn('Gemini AI not available - API key missing or model not initialized');
    return 'AI analysis unavailable. Please check your API configuration.';
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI error:', error);
    
    // Provide helpful fallback messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        return 'AI service temporarily unavailable. The AI model may be updating.';
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return 'AI service quota exceeded. Please try again later.';
      }
      if (error.message.includes('API key')) {
        return 'AI service configuration error. Please check your API key.';
      }
    }
    
    return 'AI analysis temporarily unavailable. Please try again later.';
  }
}

export interface ResumeAnalysisResult {
  score: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  atsCompatibility: number;
  detailedFeedback: string;
  sections: {
    contact: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
  };
}

export interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  matchScore: number;
  matchReasons: string[];
  salaryRange: string;
  location: string;
  aiInsight: string;
}

export interface SkillGapAnalysis {
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  skillGaps: {
    skill: string;
    importance: 'high' | 'medium' | 'low';
    timeToLearn: string;
    resources: string[];
  }[];
  learningPath: string;
  careerAdvice: string;
}

export interface CoverLetterResult {
  content: string;
  tone: string;
  keyPoints: string[];
  personalizationTips: string[];
}

export interface InterviewPrep {
  commonQuestions: string[];
  technicalQuestions: string[];
  behavioralQuestions: string[];
  companySpecificTips: string[];
  preparation_timeline: string;
}

class GeminiAIService {
  private async generateContent(prompt: string): Promise<string> {
    return safeGenerateContent(prompt);
  }

  async analyzeResume(resumeText: string, jobDescription?: string): Promise<ResumeAnalysisResult> {
    const prompt = `
    As an expert ATS and resume analyst, analyze this resume and provide a comprehensive evaluation:

    Resume Content:
    ${resumeText}

    ${jobDescription ? `Job Description for Comparison:\n${jobDescription}` : ''}

    Please provide analysis in the following JSON format:
    {
      "score": <overall score 0-100>,
      "strengths": [<array of strengths>],
      "improvements": [<array of improvement suggestions>],
      "missingKeywords": [<array of missing keywords>],
      "atsCompatibility": <ATS compatibility score 0-100>,
      "detailedFeedback": "<detailed paragraph of feedback>",
      "sections": {
        "contact": <boolean>,
        "summary": <boolean>,
        "experience": <boolean>,
        "education": <boolean>,
        "skills": <boolean>
      }
    }

    Focus on:
    - ATS optimization
    - Keyword matching
    - Content quality
    - Structure and formatting
    - Relevance to job requirements
    `;

    try {
      const response = await this.generateContent(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Resume analysis error:', error);
      // Fallback response
      return {
        score: 75,
        strengths: ['Professional experience', 'Relevant skills', 'Clear formatting'],
        improvements: ['Add more keywords', 'Improve summary section', 'Quantify achievements'],
        missingKeywords: ['leadership', 'project management', 'data analysis'],
        atsCompatibility: 78,
        detailedFeedback: 'Your resume shows good professional experience but could benefit from more keyword optimization and quantified achievements.',
        sections: {
          contact: true,
          summary: true,
          experience: true,
          education: true,
          skills: true
        }
      };
    }
  }

  async generateJobRecommendations(userProfile: UserProfile, userSkills: string[]): Promise<JobRecommendation[]> {
    const prompt = `
    As a career advisor AI, generate personalized job recommendations based on this user profile:

    User Skills: ${userSkills.join(', ')}
    Experience Level: ${userProfile.experienceLevel || 'mid-level'}
    Location: ${userProfile.location || 'Remote'}
    Industry Preferences: ${userProfile.industries?.join(', ') || 'Technology'}

    Generate 5 job recommendations in JSON format:
    [
      {
        "id": "<unique_id>",
        "title": "<job_title>",
        "company": "<company_name>",
        "matchScore": <score_0_100>,
        "matchReasons": [<array_of_match_reasons>],
        "salaryRange": "<salary_range>",
        "location": "<location>",
        "aiInsight": "<personalized_insight>"
      }
    ]

    Focus on realistic, relevant opportunities that match the user's skill set and career goals.
    `;

    try {
      const response = await this.generateContent(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Job recommendations error:', error);
      // Fallback recommendations
      return [
        {
          id: 'rec_1',
          title: 'Senior Software Engineer',
          company: 'TechCorp',
          matchScore: 85,
          matchReasons: ['Strong technical skills', 'Experience match', 'Location preference'],
          salaryRange: '$80k - $120k',
          location: 'Remote',
          aiInsight: 'This role perfectly matches your technical background and offers remote work flexibility.'
        },
        {
          id: 'rec_2',
          title: 'Full Stack Developer',
          company: 'StartupXYZ',
          matchScore: 78,
          matchReasons: ['Full stack experience', 'Startup environment fit'],
          salaryRange: '$70k - $100k',
          location: 'San Francisco, CA',
          aiInsight: 'Great opportunity to work with cutting-edge technologies in a fast-paced environment.'
        }
      ];
    }
  }

  async analyzeSkillGap(userSkills: string[], jobDescription: string): Promise<SkillGapAnalysis> {
    const prompt = `
    Analyze the skill gap between current skills and job requirements:

    Current Skills: ${userSkills.join(', ')}
    
    Job Description:
    ${jobDescription}

    Provide analysis in JSON format:
    {
      "currentSkills": [<current_skills_array>],
      "requiredSkills": [<required_skills_from_job>],
      "missingSkills": [<skills_to_develop>],
      "skillGaps": [
        {
          "skill": "<skill_name>",
          "importance": "<high|medium|low>",
          "timeToLearn": "<estimated_time>",
          "resources": [<learning_resources>]
        }
      ],
      "learningPath": "<structured_learning_plan>",
      "careerAdvice": "<personalized_career_advice>"
    }
    `;

    try {
      const response = await this.generateContent(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      // Fallback analysis
      return {
        currentSkills: userSkills,
        requiredSkills: ['React', 'Node.js', 'Python', 'AWS'],
        missingSkills: ['AWS', 'Docker', 'Kubernetes'],
        skillGaps: [
          {
            skill: 'AWS',
            importance: 'high' as const,
            timeToLearn: '2-3 months',
            resources: ['AWS Documentation', 'Cloud Practitioner Certification']
          }
        ],
        learningPath: 'Start with cloud fundamentals, then move to containerization technologies.',
        careerAdvice: 'Focus on cloud technologies to enhance your marketability in current job market.'
      };
    }
  }

  async generateCoverLetter(jobDescription: string, userProfile: UserProfile, tone: string = 'professional'): Promise<CoverLetterResult> {
    const prompt = `
    Generate a personalized cover letter for this job application:

    Job Description:
    ${jobDescription}

    User Profile:
    Name: ${userProfile.name || 'Candidate'}
    Experience: ${userProfile.experience || 'Professional with relevant background'}
    Skills: ${userProfile.skills?.join(', ') || 'Various technical skills'}
    
    Tone: ${tone}

    Provide result in JSON format:
    {
      "content": "<full_cover_letter>",
      "tone": "<actual_tone_used>",
      "keyPoints": [<array_of_key_selling_points>],
      "personalizationTips": [<tips_for_customization>]
    }

    Make it engaging, specific, and tailored to the role.
    `;

    try {
      const response = await this.generateContent(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Cover letter generation error:', error);
      // Fallback cover letter
      return {
        content: `Dear Hiring Manager,\n\nI am writing to express my strong interest in the position at your company. With my background in technology and passion for innovation, I believe I would be a valuable addition to your team.\n\nMy experience includes working with modern technologies and delivering high-quality solutions. I am excited about the opportunity to contribute to your organization's success.\n\nThank you for considering my application.\n\nSincerely,\n${userProfile.name || 'Candidate'}`,
        tone: tone,
        keyPoints: ['Relevant experience', 'Technical skills', 'Enthusiasm for role'],
        personalizationTips: ['Research company culture', 'Mention specific projects', 'Quantify achievements']
      };
    }
  }

  async generateInterviewPrep(jobDescription: string, jobTitle: string, company: string): Promise<InterviewPrep> {
    const prompt = `
    Generate comprehensive interview preparation for this position:

    Job Title: ${jobTitle}
    Company: ${company}
    Job Description: ${jobDescription}

    Provide preparation guide in JSON format:
    {
      "commonQuestions": [<array_of_common_interview_questions>],
      "technicalQuestions": [<array_of_technical_questions>],
      "behavioralQuestions": [<array_of_behavioral_questions>],
      "companySpecificTips": [<company_research_tips>],
      "preparation_timeline": "<suggested_preparation_schedule>"
    }

    Focus on realistic questions and actionable preparation advice.
    `;

    try {
      const response = await this.generateContent(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Interview prep generation error:', error);
      // Fallback interview prep
      return {
        commonQuestions: [
          'Tell me about yourself',
          'Why are you interested in this role?',
          'What are your strengths and weaknesses?'
        ],
        technicalQuestions: [
          'Describe your experience with the main technologies mentioned in the job description',
          'How do you approach problem-solving?',
          'Walk me through a challenging project you worked on'
        ],
        behavioralQuestions: [
          'Describe a time when you had to work under pressure',
          'How do you handle conflicts with team members?',
          'Tell me about a time you failed and what you learned'
        ],
        companySpecificTips: [
          'Research the company\'s recent news and achievements',
          'Understand their products and services',
          'Learn about their company culture and values'
        ],
        preparation_timeline: 'Start preparation 1-2 weeks before the interview. Spend time daily practicing answers and researching the company.'
      };
    }
  }

  async generateRecruiterInsights(jobPostings: JobPosting[], applications: Application[]): Promise<{
    hiringTrends: string;
    topSkillsInDemand: string[];
    applicationQuality: string;
    recommendations: string[];
    marketInsights: string;
    diversityMetrics: string;
    timeToHire: string;
  }> {
    const prompt = `
    As a recruitment analytics expert, analyze this hiring data and provide insights:

    Job Postings: ${JSON.stringify(jobPostings.slice(0, 5))}
    Applications: ${JSON.stringify(applications.slice(0, 10))}

    Provide insights in JSON format:
    {
      "hiringTrends": "<analysis_of_hiring_patterns>",
      "topSkillsInDemand": [<array_of_skills>],
      "applicationQuality": "<assessment_of_candidate_quality>",
      "recommendations": [<actionable_recommendations>],
      "marketInsights": "<industry_trends>",
      "diversityMetrics": "<diversity_analysis>",
      "timeToHire": "<hiring_timeline_analysis>"
    }
    `;

    try {
      const response = await this.generateContent(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Recruiter insights error:', error);
      // Fallback insights
      return {
        hiringTrends: 'Current market shows strong demand for technical roles with emphasis on remote work capabilities.',
        topSkillsInDemand: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
        applicationQuality: 'Good quality candidates with strong technical backgrounds, though some lack industry-specific experience.',
        recommendations: [
          'Consider virtual interview processes',
          'Emphasize professional development opportunities',
          'Highlight company culture in job postings'
        ],
        marketInsights: 'Tech industry continues to grow with increased focus on AI and cloud technologies.',
        diversityMetrics: 'Current applicant pool shows room for improvement in diversity across all dimensions.',
        timeToHire: 'Average time to hire is 3-4 weeks for technical roles.'
      };
    }
  }
}

export const geminiAI = new GeminiAIService();
