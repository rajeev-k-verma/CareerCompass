// Demo user service for handling demo authentication
export const demoUserService = {
  // Demo users data
  demoUsers: {
    'demo@example.com': {
      id: 'demo_job_seeker',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'Job Seeker',
      role: 'job_seeker' as const,
      skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'Python'],
      experience: 'Mid-level',
      location: 'Remote',
      resumeUploaded: true,
      profileComplete: true,
      isDemo: true
    },
    'recruiter@demo.com': {
      id: 'demo_recruiter',
      email: 'recruiter@demo.com',
      firstName: 'Demo',
      lastName: 'Recruiter',
      role: 'recruiter' as const,
      skills: ['Talent Acquisition', 'HR Management', 'Interviewing'],
      experience: 'Senior-level',
      location: 'San Francisco, CA',
      resumeUploaded: false,
      profileComplete: true,
      isDemo: true
    },
    'demo@jobseeker.com': {
      id: 'demo_job_seeker_2',
      email: 'demo@jobseeker.com',
      firstName: 'Demo',
      lastName: 'JobSeeker',
      role: 'job_seeker' as const,
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      experience: '3 years',
      location: 'San Francisco, CA',
      resumeUploaded: true,
      profileComplete: true,
      isDemo: true
    },
    'demo@recruiter.com': {
      id: 'demo_recruiter_2',
      email: 'demo@recruiter.com',
      firstName: 'Demo',
      lastName: 'Recruiter',
      role: 'recruiter' as const,
      skills: ['Talent Acquisition', 'HR Management'],
      experience: 'Senior-level',
      location: 'New York, NY',
      resumeUploaded: false,
      profileComplete: true,
      isDemo: true
    }
  },

  // Check if email is a demo user (enhanced for production)
  isDemoUser(email: string): boolean {
    // Check exact matches first
    if (email in this.demoUsers) {
      return true;
    }
    
    // Check for demo patterns (case insensitive)
    const lowerEmail = email.toLowerCase();
    const demoPatterns = [
      'demo',
      'test',
      'example',
      '@demo.',
      '@test.',
      '@example.',
      'demo@',
      'test@',
      'example@'
    ];
    
    return demoPatterns.some(pattern => lowerEmail.includes(pattern));
  },

  // Get demo user data or create generic one
  getDemoUser(email: string) {
    // Return exact match if exists
    if (email in this.demoUsers) {
      return this.demoUsers[email as keyof typeof this.demoUsers];
    }
    
    // Create generic demo user based on email pattern
    const isRecruiter = email.toLowerCase().includes('recruiter');
    
    return {
      id: `demo_${isRecruiter ? 'recruiter' : 'job_seeker'}_${Date.now()}`,
      email: email,
      firstName: 'Demo',
      lastName: isRecruiter ? 'Recruiter' : 'User',
      role: isRecruiter ? 'recruiter' : 'job_seeker',
      skills: isRecruiter ? ['Talent Acquisition', 'HR Management'] : ['Demo Skills'],
      experience: isRecruiter ? 'Senior-level' : 'Demo Experience',
      location: 'Demo Location',
      resumeUploaded: !isRecruiter,
      profileComplete: true,
      isDemo: true
    };
  },

  // Demo login (accepts any password for demo users)
  demoLogin(email: string) {
    if (!this.isDemoUser(email)) {
      throw new Error('Not a demo user');
    }

    const demoToken = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = this.getDemoUser(email);

    // Store demo tokens and flag
    localStorage.setItem('token', demoToken);
    localStorage.setItem('access_token', demoToken);
    localStorage.setItem('refresh_token', demoToken);
    localStorage.setItem('demo_user', JSON.stringify(user));
    localStorage.setItem('demo_mode', 'true');

    return {
      token: demoToken,
      user: user
    };
  },

  // Create temporary demo user for network error fallback
  createTemporaryDemoUser(email: string) {
    const demoToken = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine role based on email or default to job_seeker
    const isRecruiter = email.toLowerCase().includes('recruiter');
    
    const user = {
      id: `temp_demo_${isRecruiter ? 'recruiter' : 'job_seeker'}_${Date.now()}`,
      email: email,
      firstName: 'Demo',
      lastName: isRecruiter ? 'Recruiter' : 'User',
      role: isRecruiter ? 'recruiter' : 'job_seeker',
      skills: isRecruiter ? ['Talent Acquisition', 'HR Management'] : ['JavaScript', 'React', 'Node.js'],
      experience: isRecruiter ? 'Senior-level' : 'Mid-level',
      location: 'Remote',
      resumeUploaded: !isRecruiter,
      profileComplete: true,
      isDemo: true
    };

    // Store demo tokens and flag
    localStorage.setItem('token', demoToken);
    localStorage.setItem('access_token', demoToken);
    localStorage.setItem('refresh_token', demoToken);
    localStorage.setItem('demo_user', JSON.stringify(user));
    localStorage.setItem('demo_mode', 'true');

    return {
      token: demoToken,
      user: user
    };
  },

  // Demo register
  demoRegister(userData: { email: string; firstName: string; lastName: string; role: string }) {
    const demoToken = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user = {
      id: `demo_${userData.role}_${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      skills: [],
      experience: '',
      location: '',
      resumeUploaded: false,
      profileComplete: false,
      isDemo: true
    };

    // Store demo tokens and flag
    localStorage.setItem('token', demoToken);
    localStorage.setItem('access_token', demoToken);
    localStorage.setItem('refresh_token', demoToken);
    localStorage.setItem('demo_user', JSON.stringify(user));
    localStorage.setItem('demo_mode', 'true');

    return {
      token: demoToken,
      user: user
    };
  },

  // Get demo profile
  getDemoProfile() {
    const demoUserData = localStorage.getItem('demo_user');
    if (demoUserData) {
      return JSON.parse(demoUserData);
    }
    
    // Fallback to default demo user
    return this.demoUsers['demo@example.com'];
  },

  // Check if current session is demo
  isCurrentSessionDemo(): boolean {
    const token = localStorage.getItem('token');
    const demoMode = localStorage.getItem('demo_mode');
    return (token && token.startsWith('demo_token_')) || demoMode === 'true';
  },

  // Logout demo user
  logoutDemo() {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_mode');
  }
};

export default demoUserService;
