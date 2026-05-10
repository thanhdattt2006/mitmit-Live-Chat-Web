import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-4">
          <div className="bg-[#141414] border border-neutral-800 p-8 rounded-3xl max-w-2xl w-full text-center shadow-2xl">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
            <p className="text-gray-400 mb-6">The application encountered an unexpected error.</p>
            <details className="text-left bg-neutral-900 p-4 rounded-xl overflow-auto max-h-64 border border-neutral-800 text-sm font-mono text-red-400">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-6 py-3 bg-white text-neutral-900 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
