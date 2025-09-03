import React, { useState } from 'react';
import { jobAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const NewJobPosting = () => {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    description: '',
    requirements: [''],
    skills: [''],
    benefits: [''],
    experienceLevel: 'mid-level' as 'entry-level' | 'mid-level' | 'senior-level' | 'executive',
    educationLevel: 'bachelor' as 'high-school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'not-required',
    workMode: 'on-site' as 'remote' | 'hybrid' | 'on-site',
    applicationDeadline: '',
    contactEmail: '',
    department: '',
    reportsTo: '',
    teamSize: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (index: number, value: string, field: 'requirements' | 'skills' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: 'requirements' | 'skills' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (index: number, field: 'requirements' | 'skills' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format data according to backend expectations
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        job_type: formData.type, // Use job_type instead of type
        salary_min: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salary_max: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        salary_currency: formData.currency,
        description: formData.description,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        skills: formData.skills.filter(skill => skill.trim() !== ''),
        benefits: formData.benefits.filter(benefit => benefit.trim() !== ''),
        experience_level: formData.experienceLevel,
        education_level: formData.educationLevel,
        work_mode: formData.workMode,
        application_deadline: formData.applicationDeadline || null,
        contact_email: formData.contactEmail,
        department: formData.department,
        reports_to: formData.reportsTo,
        team_size: formData.teamSize ? parseInt(formData.teamSize) : null,
      };

      // Remove null/empty values to avoid backend validation issues
      const cleanedJobData = Object.fromEntries(
        Object.entries(jobData || {}).filter(([, value]) => 
          value !== null && value !== '' && value !== undefined
        )
      );

      await jobAPI.createJob(cleanedJobData as unknown as Parameters<typeof jobAPI.createJob>[0]); // Type assertion needed due to dynamic filtering
      addNotification({
          message: 'Job posted successfully!', type: 'success',
          title: 'Success'
      });
      
      // Reset form
      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'full-time',
        salaryMin: '',
        salaryMax: '',
        currency: 'USD',
        description: '',
        requirements: [''],
        skills: [''],
        benefits: [''],
        experienceLevel: 'mid-level',
        educationLevel: 'bachelor',
        workMode: 'on-site',
        applicationDeadline: '',
        contactEmail: '',
        department: '',
        reportsTo: '',
        teamSize: '',
      });
    } catch (error: unknown) {
      console.error('Error posting job:', error);
      let errorMessage = 'Error posting job. Please try again.';
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          errorMessage = 'Invalid job data. Please check all required fields.';
        } else if (error.message.includes('401')) {
          errorMessage = 'You need to be logged in to post jobs.';
        } else if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to post jobs.';
        }
      }
      
      addNotification({
          message: errorMessage, type: 'error',
          title: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Post New Job</h1>
          <p className="text-gray-600 mt-1">Create a new job posting to attract qualified candidates</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. San Francisco, CA or Remote"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Engineering, Marketing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Mode *
                </label>
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="on-site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level *
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="entry-level">Entry Level</option>
                  <option value="mid-level">Mid Level</option>
                  <option value="senior-level">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education Level
                </label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="not-required">Not Required</option>
                  <option value="high-school">High School</option>
                  <option value="associate">Associate Degree</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Salary Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Salary
                </label>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Salary
                </label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="80000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Requirements
              </label>
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleArrayInputChange(index, e.target.value, 'requirements')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 3+ years of React experience"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'requirements')}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('requirements')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add Requirement
              </button>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleArrayInputChange(index, e.target.value, 'skills')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. JavaScript, React, Node.js"
                  />
                  {formData.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'skills')}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('skills')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add Skill
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Benefits & Perks</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits
              </label>
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleArrayInputChange(index, e.target.value, 'benefits')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Health insurance, Flexible hours, Remote work"
                  />
                  {formData.benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'benefits')}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('benefits')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add Benefit
              </button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="hr@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reports To
                </label>
                <input
                  type="text"
                  name="reportsTo"
                  value={formData.reportsTo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Engineering Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Size
                </label>
                <input
                  type="number"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 10"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewJobPosting;
