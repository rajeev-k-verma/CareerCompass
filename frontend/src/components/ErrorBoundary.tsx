import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  redirectCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private redirectTimer: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      redirectCount: 10
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(_error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Start auto-redirect countdown
    this.startRedirectCountdown();
  }

  componentWillUnmount() {
    if (this.redirectTimer) {
      clearInterval(this.redirectTimer);
    }
  }

  startRedirectCountdown = () => {
    this.redirectTimer = window.setInterval(() => {
      this.setState(prevState => {
        const newCount = prevState.redirectCount - 1;
        if (newCount <= 0) {
          this.redirectToHome();
          return prevState;
        }
        return { 
          ...prevState,
          redirectCount: newCount 
        };
      });
    }, 1000);
  };

  redirectToHome = () => {
    if (this.redirectTimer) {
      clearInterval(this.redirectTimer);
    }
    
    // Check if user is logged in to determine redirect destination
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      // User is logged in, redirect to profile
      window.location.href = '/profile';
    } else {
      // User is not logged in, redirect to landing page
      window.location.href = '/';
    }
  };

  handleReset = () => {
    if (this.redirectTimer) {
      clearInterval(this.redirectTimer);
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      redirectCount: 10
    });
  };

  handleGoHome = () => {
    this.redirectToHome();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
            
            <p className="text-gray-600 mb-4">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                🏠 Redirecting to home page in <span className="font-bold">{this.state.redirectCount}</span> seconds...
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Go Home Now</span>
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                Refresh Page
              </button>
            </div>
            
            {/* Development error details */}
            {import.meta.env?.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-gray-100 rounded-lg p-4 text-xs font-mono overflow-auto max-h-32">
                  <div className="text-red-600 font-semibold mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
