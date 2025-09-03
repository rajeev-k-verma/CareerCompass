import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import Preferences from './pages/Profile/Preferences';
import Jobs from './pages/Jobs/Jobs';
import JobDetails from './pages/Jobs/JobDetails';
import ResumeAnalyzer from './pages/Resume/ResumeAnalyzer';
import SkillAnalysis from './pages/Skills/SkillAnalysis';
import CoverLetterGenerator from './pages/CoverLetter/CoverLetterGenerator';
import RecruiterDashboard from './pages/Recruiter/RecruiterDashboard';
import Candidates from './pages/Recruiter/Candidates';
import JobPostings from './pages/Recruiter/JobPostings';
import RecruiterAnalytics from './pages/Recruiter/RecruiterAnalytics';
import Settings from './pages/Recruiter/Settings';
import NewJobPosting from './pages/Recruiter/NewJobPosting';
import Interviews from './pages/Recruiter/Interviews';
import Analytics from './pages/Analytics/Analytics';
import BackendStatus from './pages/BackendStatus';
import AIJobRecommendations from './pages/Jobs/AIJobRecommendations';
import './App.css';
import Applications from './pages/Candidate/Applications';

// Component to handle route persistence and error redirection
function RouteManager() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    // Save current route to localStorage for refresh persistence
    if (location.pathname !== '/login' && location.pathname !== '/register') {
      localStorage.setItem('lastRoute', location.pathname + location.search);
    }

    // Check for unhandled errors and redirect if necessary
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // If it's a network error or 404, show notification and potentially redirect
      if (event.reason?.status === 404 || event.reason?.message?.includes('404')) {
        addNotification({
          type: 'error',
          title: 'Page Not Found',
          message: 'The requested page could not be found. Redirecting to home...'
        });
        
        setTimeout(() => {
          if (user) {
            navigate('/profile');
          } else {
            navigate('/');
          }
        }, 3000);
      } else if (event.reason?.message?.includes('Network')) {
        addNotification({
          type: 'warning',
          title: 'Network Error',
          message: 'Connection issues detected. Some features may be limited.'
        });
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [location, navigate, addNotification, user]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return !user ? <>{children}</> : <Navigate to="/dashboard" />;
}

// Component to handle initial route restoration
function RouteRestorer() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user) {
      // Try to restore the last route after login
      const lastRoute = localStorage.getItem('lastRoute');
      if (lastRoute && lastRoute !== '/login' && lastRoute !== '/register' && lastRoute !== '/') {
        navigate(lastRoute, { replace: true });
        localStorage.removeItem('lastRoute'); // Clean up
      }
    }
  }, [user, loading, navigate]);
  
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <RouteManager />
            <RouteRestorer />
            <div className="App">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/preferences"
                  element={
                    <ProtectedRoute>
                      <Preferences />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs"
                  element={
                    <ProtectedRoute>
                      <Jobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/:id"
                  element={
                    <ProtectedRoute>
                      <JobDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resume-analyzer"
                  element={
                    <ProtectedRoute>
                      <ResumeAnalyzer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/skill-analysis"
                  element={
                    <ProtectedRoute>
                      <SkillAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cover-letter"
                  element={
                    <ProtectedRoute>
                      <CoverLetterGenerator />
                    </ProtectedRoute>
                  }
                />
                <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
                <Route path="/recruiter" element={<ProtectedRoute><RecruiterDashboard /></ProtectedRoute>} />
                <Route path="/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
                <Route path="/job-postings" element={<ProtectedRoute><JobPostings /></ProtectedRoute>} />
                <Route path="/job-postings/new" element={<ProtectedRoute><NewJobPosting /></ProtectedRoute>} />
                <Route path="/recruiter-analytics" element={<ProtectedRoute><RecruiterAnalytics /></ProtectedRoute>} />
                <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/ai-job-recommendations" element={<ProtectedRoute><AIJobRecommendations /></ProtectedRoute>} />
                <Route path="/backend-status" element={<ProtectedRoute><BackendStatus /></ProtectedRoute>} />
                {/* 404 catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
