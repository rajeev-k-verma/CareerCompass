import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BrainCircuit, 
  Zap, 
  Target, 
  TrendingUp, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Landing: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to their profile
    if (!loading && user) {
      navigate('/profile', { replace: true });
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: BrainCircuit,
      title: 'AI-Powered Job Matching',
      description: 'Get personalized job recommendations with match scores based on your skills and experience.'
    },
    {
      icon: Target,
      title: 'Resume Optimization',
      description: 'Analyze your resume against job requirements and get actionable improvement suggestions.'
    },
    {
      icon: Zap,
      title: 'Instant Cover Letters',
      description: 'Generate professional cover letters and cold emails tailored to specific job postings.'
    },
    {
      icon: TrendingUp,
      title: 'Skill Gap Analysis',
      description: 'Identify missing skills and get personalized learning paths to advance your career.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Jobs Matched' },
    { number: '5K+', label: 'Resumes Analyzed' },
    { number: '95%', label: 'Match Accuracy' },
    { number: '3x', label: 'Faster Job Search' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CareerAI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find Your Dream Job with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}AI-Powered
              </span>
              <br />Career Intelligence
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your job search with cutting-edge AI. Get personalized job matches, 
              optimize your resume, and accelerate your career growth with intelligent insights.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-colorful transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Start Free Today</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="text-gray-600 font-semibold text-lg hover:text-gray-900 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse-soft"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-20 animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Intelligent Career Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leverage the power of AI to accelerate your career growth and land your dream job faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100 hover:shadow-colorful transition-all duration-300 group"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How CareerAI Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to accelerate your career
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Your Resume',
                description: 'Our AI analyzes your skills, experience, and career goals to create your professional profile.'
              },
              {
                step: '2',
                title: 'Get AI Recommendations',
                description: 'Receive personalized job matches with detailed explanations of why each role fits your profile.'
              },
              {
                step: '3',
                title: 'Apply with Confidence',
                description: 'Generate tailored cover letters and optimize your applications for maximum success.'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 text-lg">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have accelerated their careers with CareerAI
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-2 text-blue-100">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">CareerAI</span>
            </div>
            <div className="text-gray-400">
              © 2024 CareerAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;