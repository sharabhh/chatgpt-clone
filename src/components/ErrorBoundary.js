"use client";

import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and any error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report to error reporting service if available
    if (typeof window !== 'undefined' && window.reportError) {
      window.reportError(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212] text-[#111] dark:text-[#e5e5e5]">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 dark:bg-red-900 rounded-full">
              <svg 
                className="w-8 h-8 text-red-600 dark:text-red-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            
            <h1 className="text-xl font-semibold mb-2">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We apologize for the inconvenience. An unexpected error occurred.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#111] dark:bg-white text-white dark:text-[#111] rounded-lg hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111] dark:focus:ring-white"
                aria-label="Try again"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                aria-label="Go to home page"
              >
                Go Home
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
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
