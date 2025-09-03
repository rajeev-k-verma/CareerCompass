// API service for Django backend integration
import demoUserService from './demoUserService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://silver-space-waffle-4j7gqvwww662q9vq-8000.app.github.dev/api';

// Type definitions for API responses and requests
interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthResponse {
  tokens: AuthTokens;
  user: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    profile_picture?: string;
    profilePicture?: string;
    skills?: string[];
    experience?: string;
    location?: string;
    resume_uploaded?: boolean;
    resumeUploaded?: boolean;
    profile_complete?: boolean;
    profileComplete?: boolean;
  };
}

interface UserProfileData {
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  skills?: string[];
  experience?: string;
  location?: string;
  profile_picture?: string;
  profilePicture?: string;
  resume_uploaded?: boolean;
  resumeUploaded?: boolean;
  profile_complete?: boolean;
  profileComplete?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'job_seeker' | 'recruiter';
}

interface JobFilters {
  [key: string]: string | number | undefined;
  location?: string;
  type?: string;
  salary_min?: number;
  salary_max?: number;
  skills?: string;
  company?: string;
}

interface JobData {
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  skills: string[];
}

interface LearningPath {
  skill: string;
  courses: unknown[];
}

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Create axios-like request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // If response is not JSON, keep the generic error message
    }
    
    const error = new Error(errorMessage) as Error & { status: number };
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  skills: string[];
  posted: Date;
  expires: Date;
  matchScore?: number;
  applications: number;
}

export interface ResumeAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  atsCompatibility: number;
  sections: {
    contact: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
  };
}

export interface SkillGapAnalysis {
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  learningPaths: {
    skill: string;
    courses: {
      title: string;
      provider: string;
      duration: string;
      rating: number;
      url: string;
    }[];
  }[];
}


export const authAPI = {
  async login(email: string, password: string) {
    // Check if this is a demo user first
    if (demoUserService.isDemoUser(email)) {
      return demoUserService.demoLogin(email);
    }

    try {
      const response = await apiRequest('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username: email, password }),
      });

      // Store tokens
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('token', response.tokens.access); // For AuthContext compatibility

      // Return properly formatted response for AuthContext
      return {
        token: response.tokens.access,
        user: {
          id: response.user.id.toString(),
          email: response.user.email,
          firstName: response.user.first_name || response.user.firstName || '',
          lastName: response.user.last_name || response.user.lastName || '',
          role: response.user.role || 'job_seeker',
          profilePicture: response.user.profile_picture || response.user.profilePicture,
          skills: response.user.skills || [],
          experience: response.user.experience || '',
          location: response.user.location || '',
          resumeUploaded: response.user.resume_uploaded || response.user.resumeUploaded || false,
          profileComplete: response.user.profile_complete || response.user.profileComplete || false,
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // If there's a CORS or network error, treat any login as demo
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('Network error detected, treating as demo user');
        
        // For network errors, force create a demo user even if email doesn't match patterns
        try {
          const result = demoUserService.demoLogin(email);
          // Add a flag to indicate this was a network fallback
          return { ...result, networkFallback: true };
        } catch {
          // If not a recognized demo email, create a temporary demo user
          console.log('Creating temporary demo user for network error fallback');
          const result = demoUserService.createTemporaryDemoUser(email);
          // Add a flag to indicate this was a network fallback
          return { ...result, networkFallback: true };
        }
      }
      
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  },

  async register(userData: RegisterData) {
    // Check if this is a demo user email first
    if (demoUserService.isDemoUser(userData.email)) {
      return demoUserService.demoRegister(userData);
    }

    try {
      const response: AuthResponse = await apiRequest('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          username: userData.email,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          password: userData.password,
          confirm_password: userData.password,
          role: userData.role,
        }),
      });

      // Store tokens
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('token', response.tokens.access); // For AuthContext compatibility

      // Return properly formatted response for AuthContext
      return {
        token: response.tokens.access,
        user: {
          id: response.user.id.toString(),
          email: response.user.email,
          firstName: response.user.first_name || response.user.firstName || '',
          lastName: response.user.last_name || response.user.lastName || '',
          role: response.user.role || userData.role,
          profilePicture: response.user.profile_picture || response.user.profilePicture,
          skills: response.user.skills || [],
          experience: response.user.experience || '',
          location: response.user.location || '',
          resumeUploaded: response.user.resume_uploaded || response.user.resumeUploaded || false,
          profileComplete: response.user.profile_complete || response.user.profileComplete || false,
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      // If there's a CORS or network error, treat any registration as demo
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('Network error detected, treating as demo registration');
        return demoUserService.demoRegister(userData);
      }
      
      throw new Error('Registration failed. Please try again.');
    }
  },

  async getProfile() {
    // Check if this is a demo session
    if (demoUserService.isCurrentSessionDemo()) {
      return demoUserService.getDemoProfile();
    }

    try {
      const response = await apiRequest('/auth/profile/');
      
      // Return properly formatted user for AuthContext
      return {
        id: response.id.toString(),
        email: response.email,
        firstName: response.first_name || response.firstName || '',
        lastName: response.last_name || response.lastName || '',
        role: response.role || 'job_seeker',
        profilePicture: response.profile_picture || response.profilePicture,
        skills: response.skills || [],
        experience: response.experience || '',
        location: response.location || '',
        resumeUploaded: response.resume_uploaded || response.resumeUploaded || false,
        profileComplete: response.profile_complete || response.profileComplete || false,
      };
    } catch (error) {
      console.error('Get profile error:', error);
      // If the profile endpoint doesn't exist (404), treat as endpoint not implemented
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('Profile endpoint not implemented on backend, treating as demo user');
        return demoUserService.getDemoProfile();
      }
      throw error;
    }
  },

  async updateProfile(data: UserProfileData) {
    try {
      const response: UserProfileData = await apiRequest('/auth/profile/update/', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      // Return properly formatted user for AuthContext
      return {
        id: (response.id ?? 0).toString(),
        email: response.email ?? '',
        firstName: response.first_name || response.firstName || '',
        lastName: response.last_name || response.lastName || '',
        role: response.role || 'job_seeker',
        profilePicture: response.profile_picture || response.profilePicture,
        skills: response.skills || [],
        experience: response.experience || '',
        location: response.location || '',
        resumeUploaded: response.resume_uploaded || response.resumeUploaded || false,
        profileComplete: response.profile_complete || response.profileComplete || false,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiRequest('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with cleanup even if API call fails
    } finally {
      // Always clean up local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token');
    }
  }
};

export const jobAPI = {
  async getJobs(filters?: JobFilters) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/jobs/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest(endpoint);
    return response.results || response;
  },

  async getJob(id: string) {
    return await apiRequest(`/jobs/${id}/`);
  },

  async createJob(jobData: JobData) {
    // jobData should include title, company, location, type, salary, description, requirements, skills, etc.
    return await apiRequest('/jobs/', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  async applyToJob(jobId: string, coverLetter?: string) {
    return await apiRequest(`/jobs/${jobId}/apply/`, {
      method: 'POST',
      body: JSON.stringify({ cover_letter: coverLetter }),
    });
  },

  async getJobRecommendations() {
    try {
      return await apiRequest('/jobs/recommendations/');
    } catch (error) {
      console.warn('Job recommendations API not available:', error);
      // Return fallback job recommendations
      return {
        results: [
          {
            id: 'fallback-1',
            title: 'Software Developer',
            company: 'Tech Company',
            location: 'Remote',
            type: 'full-time',
            salary: { min: 60000, max: 80000, currency: 'USD' },
            description: 'Exciting opportunity for a software developer.',
            requirements: ['Programming', 'Problem Solving'],
            skills: ['JavaScript', 'React'],
            posted: new Date().toISOString(),
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            matchScore: 85,
            applications: 0
          },
          {
            id: 'fallback-2',
            title: 'Product Manager',
            company: 'Innovation Inc',
            location: 'Hybrid',
            type: 'full-time',
            salary: { min: 70000, max: 90000, currency: 'USD' },
            description: 'Lead product development initiatives.',
            requirements: ['Leadership', 'Strategy'],
            skills: ['Product Management', 'Analytics'],
            posted: new Date().toISOString(),
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            matchScore: 80,
            applications: 0
          }
        ]
      };
    }
  },

  async saveJob(jobId: string) {
    return await apiRequest(`/jobs/${jobId}/save/`, {
      method: 'POST',
    });
  },

  async getSavedJobs() {
    return await apiRequest('/jobs/saved/');
  },

  async getMyApplications() {
    return await apiRequest('/jobs/my-applications/');
  }
};

// Recruiter-specific job API
export const recruiterAPI = {
  // Get all jobs posted by the recruiter
  async getMyJobs() {
    try {
      return await apiRequest('/recruiter/jobs/');
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('404')) {
        // Fallback to regular jobs endpoint if recruiter endpoint doesn't exist
        console.warn('Recruiter jobs endpoint not available, falling back to general jobs');
        return await jobAPI.getJobs();
      }
      throw error;
    }
  },

  // Get applicants for a specific job
  async getJobApplicants(jobId: string) {
    try {
      return await apiRequest(`/recruiter/jobs/${jobId}/applicants/`);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('Recruiter applicants endpoint not available, returning empty result');
        return { results: [] };
      }
      throw error;
    }
  },

  // Update application status (shortlist, interview, reject, hire)
  async updateApplicationStatus(applicationId: string, status: string) {
    try {
      return await apiRequest(`/recruiter/applications/${applicationId}/status/`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('Application status update endpoint not available');
        return { success: false, message: 'Endpoint not implemented' };
      }
      throw error;
    }
  },

  // Get all candidates in the system
  async getAllCandidates(filters?: JobFilters) {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      const endpoint = `/recruiter/candidates/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiRequest(endpoint);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('Recruiter candidates endpoint not available, returning empty result');
        return { results: [] };
      }
      throw error;
    }
  },

  // Delete a job posting
  async deleteJob(jobId: string) {
    try {
      return await apiRequest(`/recruiter/jobs/${jobId}/delete/`, {
        method: 'DELETE',
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('Delete job endpoint not available');
        return { success: false, message: 'Endpoint not implemented' };
      }
      throw error;
    }
  },

  // Update a job posting
  async updateJob(jobId: string, jobData: JobData) {
    try {
      return await apiRequest(`/recruiter/jobs/${jobId}/update/`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('Update job endpoint not available');
        return { success: false, message: 'Endpoint not implemented' };
      }
      throw error;
    }
  },

  // Get recruiter dashboard stats
  async getDashboardStats() {
    try {
      return await apiRequest('/recruiter/dashboard/stats/');
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('Dashboard stats endpoint not available, returning mock data');
        return {
          activeJobs: 0,
          totalApplications: 0,
          interviewsScheduled: 0,
          candidatesHired: 0
        };
      }
      throw error;
    }
  }
};

export const resumeAPI = {
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/resumes/upload/`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async analyzeResume(jobId?: string): Promise<ResumeAnalysis> {
    const response = await apiRequest('/resumes/analyze/', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId }),
    });

    return {
      score: response.overall_score,
      strengths: response.strengths,
      improvements: response.improvements,
      missingKeywords: response.missing_keywords,
      atsCompatibility: response.ats_score,
      sections: response.section_scores
    };
  },

  async getResume() {
    return await apiRequest('/resumes/');
  },

  async getResumeAnalyses() {
    return await apiRequest('/resumes/analyses/');
  }
};

export const aiAPI = {
  async generateCoverLetter(jobId: string, tone: string = 'professional') {
    const response = await apiRequest('/resumes/generate-cover-letter/', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, tone }),
    });
    return response.generated_content;
  },

  async generateColdEmail(jobId: string, recruiteremail: string) {
    const response = await apiRequest('/ai/generate-cold-email/', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, recruiter_email: recruiteremail }),
    });
    return response.generated_content;
  },

  async analyzeSkillGap(jobId: string): Promise<SkillGapAnalysis> {
    const response = await apiRequest('/ai/skill-gap-analysis/', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId }),
    });

    return {
      currentSkills: response.current_skills,
      requiredSkills: response.required_skills,
      missingSkills: response.missing_skills,
      learningPaths: response.learning_paths.map((path: LearningPath) => ({
        skill: path.skill,
        courses: path.courses
      }))
    };
  },

  async getMyContent() {
    return await apiRequest('/ai/my-content/');
  },

  async getMyAnalyses() {
    return await apiRequest('/ai/my-analyses/');
  }
};

export const analyticsAPI = {
  async getDashboardStats() {
    try {
      const response = await apiRequest('/analytics/dashboard-stats/');
      return {
        totalApplications: response.total_applications || 0,
        interviewsScheduled: response.interviews_scheduled || 0,
        avgMatchScore: response.avg_match_score || 0,
        profileViews: response.profile_views || 0,
        skillsImproved: response.skills_improved || 0,
        coursesTaken: response.courses_taken || 0
      };
    } catch (error: unknown) {
      console.warn('Analytics dashboard stats API not available:', error);
      // Return default stats when API is not available
      return {
        totalApplications: 0,
        interviewsScheduled: 0,
        avgMatchScore: 0,
        profileViews: 0,
        skillsImproved: 0,
        coursesTaken: 0
      };
    }
  },

  async getApplicationTrends() {
    try {
      return await apiRequest('/analytics/application-trends/');
    } catch (error) {
      console.warn('Application trends API not available:', error);
      return [];
    }
  },

  async getSkillProgress() {
    try {
      return await apiRequest('/analytics/skill-progress/');
    } catch (error) {
      console.warn('Skill progress API not available:', error);
      return [];
    }
  },

  async getRecentActivity() {
    try {
      return await apiRequest('/analytics/recent-activity/');
    } catch (error) {
      console.warn('Recent activity API not available:', error);
      return [];
    }
  },

  async logActivity(activityType: string, description: string, metadata?: Record<string, unknown>) {
    return await apiRequest('/analytics/log-activity/', {
      method: 'POST',
      body: JSON.stringify({
        activity_type: activityType,
        description,
        metadata: metadata || {}
      }),
    });
  },

  async trackJobView(jobId: string) {
    return await apiRequest('/analytics/track-job-view/', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId }),
    });
  }
};