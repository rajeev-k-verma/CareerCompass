import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Edit3, 
  Save, 
  X,
  Plus
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { addNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    location: user?.location || '',
    experience: user?.experience || '',
    skills: user?.skills || [],
    bio: ''
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        location: user.location,
        experience: user.experience,
        skills: user.skills,
        bio: ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.'
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      location: user?.location || '',
      experience: user?.experience || '',
      skills: user?.skills || [],
      bio: ''
    });
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-soft p-8">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            {!isEditing ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <div className="flex items-center space-x-4 mt-2 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  {user?.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="capitalize">{user?.experience} Level</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-3 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, State"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience Level
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Level</option>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                      <option value="lead">Lead/Principal</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Skills</h3>
          {isEditing && (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <button
                onClick={addSkill}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {formData.skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full border border-blue-200"
            >
              <span className="font-medium">{skill}</span>
              {isEditing && (
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-blue-600 hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {formData.skills.length === 0 && (
            <p className="text-gray-500 italic">No skills added yet</p>
          )}
        </div>
      </div>

      {/* Profile Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Profile Views</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Skills Verified</p>
              <p className="text-2xl font-bold text-gray-900">{formData.skills.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Profile Score</p>
              <p className="text-2xl font-bold text-gray-900">85%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Status */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Resume Status</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${user?.resumeUploaded ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span className="font-medium text-gray-900">
              {user?.resumeUploaded ? 'Resume Uploaded' : 'No Resume Uploaded'}
            </span>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            {user?.resumeUploaded ? 'Update Resume' : 'Upload Resume'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;