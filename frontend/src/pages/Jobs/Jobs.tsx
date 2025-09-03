import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI, Job } from '../../services/api';
import { geminiAI } from '../../services/geminiAI';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Search, Filter, MapPin, Clock, Briefcase, ArrowRight, TrendingUp, Heart, Building, X, Wand2 } from 'lucide-react';

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  const isDemo = user?.email === 'demo@example.com' || user?.isDemo;

  // Enhanced demo data for demo users
  const demoJobs: Job[] = useMemo(() => [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'full-time',
      salary: { min: 120000, max: 160000, currency: 'USD' },
      description: 'We are seeking a talented Senior Frontend Developer to join our innovative team. You will be responsible for building scalable web applications using React, TypeScript, and modern development tools. Work with a collaborative team to deliver exceptional user experiences.',
      requirements: ['5+ years React experience', 'TypeScript proficiency', 'Team leadership experience', 'GraphQL knowledge', 'Testing frameworks'],
      skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL', 'Jest', 'Figma'],
      posted: new Date('2024-01-15'),
      expires: new Date('2024-02-15'),
      matchScore: 85,
      applications: 45
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'StartupX',
      location: 'Remote',
      type: 'full-time',
      salary: { min: 90000, max: 130000, currency: 'USD' },
      description: 'Join our fast-growing startup as a Full Stack Engineer. Work on cutting-edge technology and help shape the future of our product. Be part of a dynamic team building the next generation of digital solutions.',
      requirements: ['3+ years full stack experience', 'Python/Django expertise', 'React proficiency', 'Database design', 'API development'],
      skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker', 'Redis', 'Celery'],
      posted: new Date('2024-01-18'),
      expires: new Date('2024-02-18'),
      matchScore: 92,
      applications: 23
    },
    {
      id: '3',
      title: 'AI/ML Engineer',
      company: 'DataTech',
      location: 'New York, NY',
      type: 'full-time',
      salary: { min: 140000, max: 180000, currency: 'USD' },
      description: 'Looking for an experienced AI/ML Engineer to develop cutting-edge machine learning solutions and drive innovation in our AI products. Work with large datasets and implement state-of-the-art algorithms.',
      requirements: ['PhD in CS/ML preferred', 'TensorFlow/PyTorch experience', '5+ years ML experience', 'Research background', 'Statistical analysis'],
      skills: ['Python', 'TensorFlow', 'PyTorch', 'scikit-learn', 'AWS SageMaker', 'Kubernetes', 'MLflow'],
      posted: new Date('2024-01-20'),
      expires: new Date('2024-02-20'),
      matchScore: 78,
      applications: 67
    },
    {
      id: '4',
      title: 'Product Manager',
      company: 'InnovateCorp',
      location: 'Austin, TX',
      type: 'full-time',
      salary: { min: 110000, max: 150000, currency: 'USD' },
      description: 'Drive product strategy and execution for our flagship products. Work cross-functionally with engineering, design, and business teams to deliver innovative solutions that delight customers.',
      requirements: ['5+ years product management', 'Technical background preferred', 'Strong analytical skills', 'Agile methodologies', 'User research'],
      skills: ['Product Strategy', 'Analytics', 'Agile', 'Figma', 'SQL', 'A/B Testing', 'Roadmapping'],
      posted: new Date('2024-01-22'),
      expires: new Date('2024-02-22'),
      matchScore: 70,
      applications: 34
    },
    {
      id: '5',
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'Los Angeles, CA',
      type: 'full-time',
      salary: { min: 85000, max: 115000, currency: 'USD' },
      description: 'Create exceptional user experiences for our digital products. Collaborate with product managers and developers to bring designs to life through user-centered design principles.',
      requirements: ['3+ years UX design experience', 'Portfolio required', 'Figma proficiency', 'User research skills', 'Prototyping'],
      skills: ['Figma', 'Sketch', 'Prototyping', 'User Research', 'Design Systems', 'Adobe Creative Suite', 'Principle'],
      posted: new Date('2024-01-25'),
      expires: new Date('2024-02-25'),
      matchScore: 88,
      applications: 56
    },
    {
      id: '6',
      title: 'DevOps Engineer',
      company: 'CloudFirst',
      location: 'Seattle, WA',
      type: 'full-time',
      salary: { min: 105000, max: 140000, currency: 'USD' },
      description: 'Build and maintain scalable infrastructure and deployment pipelines. Work with cutting-edge cloud technologies and automation tools to ensure high availability and performance.',
      requirements: ['4+ years DevOps experience', 'AWS/Azure expertise', 'Kubernetes knowledge', 'Infrastructure as Code', 'Monitoring'],
      skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Prometheus', 'Grafana'],
      posted: new Date('2024-01-28'),
      expires: new Date('2024-02-28'),
      matchScore: 82,
      applications: 41
    }
  ], []);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        if (isDemo) {
          setJobs(demoJobs);
          setFilteredJobs(demoJobs);
          // Simulate saved jobs for demo
          setSavedJobs(['2', '5']);
          setAppliedJobs(['1']);
        } else {
          const jobsData = await jobAPI.getJobs();
          setJobs(jobsData);
          setFilteredJobs(jobsData);
          
          // Load saved jobs and applications
          const savedJobsData = await jobAPI.getSavedJobs();
          setSavedJobs(savedJobsData.map((job: { id: string }) => job.id));
          
          const applicationsData = await jobAPI.getMyApplications();
          setAppliedJobs(applicationsData.map((app: { job_id: string }) => app.job_id));
        }
      } catch (error) {
        console.error('Failed to load jobs:', error);
        // Only show notification if not already loading to prevent infinite loops
        if (!loading) {
          addNotification({
            type: 'error',
            title: 'Error',
            message: 'Failed to load jobs. Using demo data instead.'
          });
          // Fallback to demo data when API fails
          setJobs(demoJobs);
          setFilteredJobs(demoJobs);
          setSavedJobs(['2', '5']);
          setAppliedJobs(['1']);
        }
      } finally {
        setLoading(false);
      }
    };

    // Only load jobs once when component mounts or when demo status changes
    if (loading) {
      loadJobs();
    }
  }, [isDemo, loading]); // Removed addNotification and demoJobs from dependencies

  useEffect(() => {
    let filtered = jobs;

    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    if (salaryFilter) {
      const [min, max] = salaryFilter.split('-').map(s => parseInt(s.replace(/\D/g, '')));
      filtered = filtered.filter(job => {
        // Safe access to salary properties
        const salaryMin = job.salary?.min || 0;
        const salaryMax = job.salary?.max || 0;
        
        if (max) {
          return salaryMin >= min && salaryMax <= max;
        } else {
          return salaryMin >= min;
        }
      });
    }

    if (experienceFilter) {
      // This would be based on job.experienceLevel if available
      // For now, we'll simulate based on salary ranges
      filtered = filtered.filter(job => {
        // Safe access to salary properties
        const salaryMin = job.salary?.min || 0;
        const salaryMax = job.salary?.max || 0;
        const avgSalary = (salaryMin + salaryMax) / 2;
        switch (experienceFilter) {
          case 'entry':
            return avgSalary < 80000;
          case 'mid':
            return avgSalary >= 80000 && avgSalary < 120000;
          case 'senior':
            return avgSalary >= 120000;
          default:
            return true;
        }
      });
    }

    if (workModeFilter) {
      if (workModeFilter === 'remote') {
        filtered = filtered.filter(job => job.location.toLowerCase().includes('remote'));
      } else if (workModeFilter === 'onsite') {
        filtered = filtered.filter(job => !job.location.toLowerCase().includes('remote'));
      }
    }

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, locationFilter, typeFilter, salaryFilter, experienceFilter, workModeFilter]);

  const handleApply = async (jobId: string) => {
    // Check if user has already applied to this job
    if (appliedJobs.includes(jobId)) {
      addNotification({
        type: 'info',
        title: 'Already Applied',
        message: 'You have already applied to this job.'
      });
      return;
    }

    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    if (isDemo) {
      setAppliedJobs(prev => [...prev, jobId]);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Demo mode: Application submitted successfully!'
      });
      return;
    }

    // Show application modal with cover letter generation
    setSelectedJobForApplication(job);
    setShowApplicationModal(true);
    setCoverLetter('');
  };

  const generateCoverLetter = async () => {
    if (!selectedJobForApplication) return;
    
    setGeneratingCoverLetter(true);
    try {
      const userProfile = {
        name: user?.firstName + ' ' + user?.lastName || 'User',
        experience: user?.experience || '',
        skills: user?.skills || []
      };
      const result = await geminiAI.generateCoverLetter(
        selectedJobForApplication.description,
        userProfile,
        'professional'
      );
      setCoverLetter(result.content);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Cover letter generated successfully!'
      });
    } catch (error) {
      console.error('Error generating cover letter:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate cover letter'
      });
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const submitApplication = async () => {
    if (!selectedJobForApplication) return;
    
    setApplying(selectedJobForApplication.id);
    try {
      await jobAPI.applyToJob(selectedJobForApplication.id, coverLetter);
      setAppliedJobs(prev => [...prev, selectedJobForApplication.id]);
      setShowApplicationModal(false);
      setSelectedJobForApplication(null);
      setCoverLetter('');
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Application submitted successfully!'
      });
    } catch (error: unknown) {
      console.error('Error applying to job:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        const errorStatus = (error as Error & { status?: number }).status;
        
        if (errorStatus === 400) {
          // User has already applied to this job
          setAppliedJobs(prev => [...prev, selectedJobForApplication.id]);
          setShowApplicationModal(false);
          setSelectedJobForApplication(null);
          setCoverLetter('');
          addNotification({
            type: 'info',
            title: 'Already Applied',
            message: error.message || 'You have already applied to this job. Your previous application is still active.'
          });
        } else {
          addNotification({
            type: 'error',
            title: 'Error',
            message: error.message || 'Failed to submit application. Please try again.'
          });
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to submit application. Please try again.'
        });
      }
    } finally {
      setApplying(null);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    if (isDemo) {
      setSavedJobs(prev => 
        prev.includes(jobId) 
          ? prev.filter(id => id !== jobId)
          : [...prev, jobId]
      );
      addNotification({
        type: 'success',
        title: 'Success',
        message: savedJobs.includes(jobId) ? 'Job removed from saved jobs' : 'Job saved successfully!'
      });
      return;
    }

    try {
      await jobAPI.saveJob(jobId);
      setSavedJobs(prev => 
        prev.includes(jobId) 
          ? prev.filter(id => id !== jobId)
          : [...prev, jobId]
      );
      addNotification({
        type: 'success',
        title: 'Success',
        message: savedJobs.includes(jobId) ? 'Job removed from saved jobs' : 'Job saved successfully!'
      });
    } catch (error) {
      console.error('Error saving job:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save job'
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setTypeFilter('');
    setSalaryFilter('');
    setExperienceFilter('');
    setWorkModeFilter('');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex space-x-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-6 bg-gray-200 rounded w-16"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const jobTypes = [
    { value: '', label: 'All Types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ];

  const salaryRanges = [
    { value: '', label: 'Any Salary' },
    { value: '0-50000', label: '$0 - $50k' },
    { value: '50000-75000', label: '$50k - $75k' },
    { value: '75000-100000', label: '$75k - $100k' },
    { value: '100000-150000', label: '$100k - $150k' },
    { value: '150000+', label: '$150k+' }
  ];

  const experienceLevels = [
    { value: '', label: 'Any Level' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' }
  ];

  const workModes = [
    { value: '', label: 'Any Location' },
    { value: 'remote', label: 'Remote Only' },
    { value: 'onsite', label: 'On-site Only' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Search</h1>
          <p className="text-gray-600 mt-1">
            {filteredJobs.length} jobs found • Personalized recommendations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          {(searchQuery || locationFilter || typeFilter || salaryFilter || experienceFilter || workModeFilter) && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {jobTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Additional Filters</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range
                </label>
                <select 
                  value={salaryFilter}
                  onChange={(e) => setSalaryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {salaryRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select 
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Mode
                </label>
                <select 
                  value={workModeFilter}
                  onChange={(e) => setWorkModeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {workModes.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Results */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-soft">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-soft p-6 border border-gray-200 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors group-hover:text-blue-600"
                    >
                      {job.title}
                    </Link>
                    {job.matchScore && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.matchScore >= 90 ? 'bg-green-100 text-green-800' :
                        job.matchScore >= 75 ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      } flex items-center space-x-1`}>
                        <TrendingUp className="w-3 h-3" />
                        <span>{job.matchScore}% match</span>
                      </div>
                    )}
                    {appliedJobs.includes(job.id) && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Applied
                      </span>
                    )}
                  </div>
                  <p className="text-blue-600 font-medium text-lg flex items-center space-x-1">
                    <Building className="w-4 h-4" />
                    <span>{job.company}</span>
                  </p>
                </div>
                <div className="text-right flex items-center space-x-2">
                  <button
                    onClick={() => handleSaveJob(job.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      savedJobs.includes(job.id)
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={savedJobs.includes(job.id) ? 'Remove from saved' : 'Save job'}
                  >
                    {savedJobs.includes(job.id) ? <Heart className="w-4 h-4 fill-current" /> : <Heart className="w-4 h-4" />}
                  </button>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {job.salary?.min && job.salary?.max ? (
                        `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                      ) : (
                        'Salary not specified'
                      )}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{(job.type || 'full-time').replace('-', ' ')}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Posted {new Date(job.posted).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{job.applications} applications</span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">
                {job.description.substring(0, 200)}...
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.slice(0, 6).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 6 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    +{job.skills.length - 6} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Company
                  </Link>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center space-x-2"
                  >
                    <span>View Details</span>
                  </Link>
                  {!appliedJobs.includes(job.id) ? (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applying === job.id}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
                    >
                      <span>{applying === job.id ? 'Applying...' : 'Apply Now'}</span>
                      {applying !== job.id && <ArrowRight className="w-4 h-4" />}
                    </button>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                      Applied ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredJobs.length > 0 && (
        <div className="text-center py-6">
          <button className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 hover:shadow-md transition-all">
            Load More Jobs
          </button>
        </div>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedJobForApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Apply to {selectedJobForApplication.title}</h2>
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setSelectedJobForApplication(null);
                  setCoverLetter('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">{selectedJobForApplication.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedJobForApplication.company}</p>
                <p className="text-sm text-gray-500">{selectedJobForApplication.location}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cover Letter (Optional)
                  </label>
                  <button
                    onClick={generateCoverLetter}
                    disabled={generatingCoverLetter}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4 mr-1" />
                    {generatingCoverLetter ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your cover letter here or generate one using AI..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setSelectedJobForApplication(null);
                    setCoverLetter('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApplication}
                  disabled={applying === selectedJobForApplication.id}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {applying === selectedJobForApplication.id ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;