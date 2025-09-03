import React, { useEffect, useState } from 'react';
// TODO: Replace with real API when available
// import { analyticsAPI } from '../../services/api';

interface AnalyticsData {
  totalViews: number;
  totalApplications: number;
  interviewsScheduled: number;
  jobsPosted: number;
}

const mockAnalytics: AnalyticsData = {
  totalViews: 1234,
  totalApplications: 248,
  interviewsScheduled: 18,
  jobsPosted: 12
};

const RecruiterAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace with real API call
        // const data = await analyticsAPI.getRecruiterAnalytics();
        // setAnalytics(data);
        setAnalytics(mockAnalytics);
      } catch {
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Recruiter Analytics</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : !analytics ? (
        <div>No analytics data found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-3xl font-bold text-blue-600">{analytics.jobsPosted}</div>
            <div className="text-gray-600 mt-2">Jobs Posted</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-3xl font-bold text-green-600">{analytics.totalApplications}</div>
            <div className="text-gray-600 mt-2">Applications</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-3xl font-bold text-purple-600">{analytics.interviewsScheduled}</div>
            <div className="text-gray-600 mt-2">Interviews Scheduled</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <div className="text-3xl font-bold text-orange-600">{analytics.totalViews}</div>
            <div className="text-gray-600 mt-2">Profile Views</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterAnalytics;
