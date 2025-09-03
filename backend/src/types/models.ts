export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'job_seeker' | 'recruiter' | 'admin';
  phone?: string;
  location?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead';
  bio?: string;
  profilePicture?: string;
  skills: string[];
  resumeUploaded: boolean;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  education: EducationEntry[];
  workExperience: WorkExperienceEntry[];
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
}

export interface WorkExperienceEntry {
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate?: string;
  technologies?: string[];
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  dateIssued: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface LanguageEntry {
  language: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  isRemote: boolean;
  experienceLevel: string;
  skills: string[];
  benefits?: string[];
  recruiterId: string;
  status: 'draft' | 'published' | 'closed';
  applicationsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  resumeId?: string;
  coverLetter?: string;
  status: 'applied' | 'reviewing' | 'shortlisted' | 'interview_scheduled' | 'rejected' | 'hired';
  appliedAt: Date;
  lastStatusUpdate: Date;
}

export interface Resume {
  id: string;
  userId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  extractedText?: string;
  analysisResults?: ResumeAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeAnalysis {
  skillsDetected: string[];
  experienceYears: number;
  educationLevel: string;
  overallScore: number;
  recommendations: string[];
  strengthsAndWeaknesses: {
    strengths: string[];
    weaknesses: string[];
  };
}

export interface Interview {
  id: string;
  jobId: string;
  candidateId: string;
  recruiterId: string;
  scheduledAt: Date;
  duration: number; // in minutes
  type: 'phone' | 'video' | 'in_person';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'rescheduled';
  meetingLink?: string;
  notes?: string;
  feedback?: InterviewFeedback;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewFeedback {
  rating: number; // 1-5 scale
  technicalSkills: number;
  communication: number;
  culturalFit: number;
  comments: string;
  recommendation: 'hire' | 'reject' | 'further_interview';
}

export interface AIGeneratedContent {
  id: string;
  userId: string;
  type: 'cover_letter' | 'cold_email' | 'skill_analysis' | 'career_guidance';
  jobId?: string;
  content: string;
  metadata?: any;
  createdAt: Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface DashboardStats {
  id: string;
  userId: string;
  totalApplications: number;
  activeApplications: number;
  interviewsScheduled: number;
  profileViews: number;
  resumeViews: number;
  lastUpdated: Date;
}
