import React, { useEffect, useState } from 'react';
import { authAPI } from '../../services/api';

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
}

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await authAPI.getProfile();
        setProfile(data);
      } catch {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    setError(null);
    try {
      await authAPI.updateProfile(profile);
    } catch {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : !profile ? (
        <div>No profile data found.</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={profile.firstName || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={profile.lastName || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              disabled
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-all"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Settings;
