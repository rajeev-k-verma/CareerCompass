import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { Settings, MapPin, Briefcase, DollarSign, Save } from 'lucide-react';

const Preferences: React.FC = () => {
  const { addNotification } = useNotification();
  const [preferences, setPreferences] = useState({
    location: '',
    experienceLevel: 'mid-level',
    industries: '',
    salaryMin: '',
    workMode: 'hybrid',
    jobType: 'full-time',
    skills: '',
    careerGoals: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to backend
      // For now, just show success message
      addNotification({
        type: 'success',
        title: 'Preferences Saved',
        message: 'Your career preferences have been updated successfully.'
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save preferences. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Career Preferences</h1>
        </div>
        <p className="text-gray-600">
          Set your career preferences to get personalized job recommendations and better matches.
        </p>
      </div>

      {/* Preferences Form */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Location Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Preferred Location
            </label>
            <input
              type="text"
              value={preferences.location}
              onChange={(e) => setPreferences(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., San Francisco, Remote, New York"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Experience Level
            </label>
            <select
              value={preferences.experienceLevel}
              onChange={(e) => setPreferences(prev => ({ ...prev, experienceLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="entry-level">Entry Level (0-2 years)</option>
              <option value="mid-level">Mid Level (3-5 years)</option>
              <option value="senior-level">Senior Level (6-10 years)</option>
              <option value="executive">Executive (10+ years)</option>
            </select>
          </div>

          {/* Industries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industries of Interest
            </label>
            <input
              type="text"
              value={preferences.industries}
              onChange={(e) => setPreferences(prev => ({ ...prev, industries: e.target.value }))}
              placeholder="e.g., Technology, Healthcare, Finance"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple industries with commas</p>
          </div>

          {/* Salary Expectation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Minimum Salary Expectation
            </label>
            <input
              type="text"
              value={preferences.salaryMin}
              onChange={(e) => setPreferences(prev => ({ ...prev, salaryMin: e.target.value }))}
              placeholder="e.g., 80000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Annual salary in USD</p>
          </div>

          {/* Work Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Mode Preference
            </label>
            <select
              value={preferences.workMode}
              onChange={(e) => setPreferences(prev => ({ ...prev, workMode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-site</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type Preference
            </label>
            <select
              value={preferences.jobType}
              onChange={(e) => setPreferences(prev => ({ ...prev, jobType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key Skills
          </label>
          <textarea
            value={preferences.skills}
            onChange={(e) => setPreferences(prev => ({ ...prev, skills: e.target.value }))}
            placeholder="e.g., React, Node.js, Python, Project Management, Data Analysis"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">List your primary skills, separated by commas</p>
        </div>

        {/* Career Goals */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Career Goals
          </label>
          <textarea
            value={preferences.careerGoals}
            onChange={(e) => setPreferences(prev => ({ ...prev, careerGoals: e.target.value }))}
            placeholder="Describe your career objectives and what you're looking for in your next role..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Better Recommendations</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Be specific about your location preferences (city, state, or "Remote")</li>
          <li>• Include both technical and soft skills in your skills list</li>
          <li>• Update your preferences regularly as your career goals evolve</li>
          <li>• Use industry-standard terms that recruiters commonly search for</li>
        </ul>
      </div>
    </div>
  );
};

export default Preferences;
