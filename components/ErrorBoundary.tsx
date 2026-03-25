
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6 text-center" dir="rtl">
          <div className="max-w-md w-full space-y-6 bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl backdrop-blur-xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">אופס! משהו השתבש</h2>
              <p className="text-zinc-400">המערכת נתקלה בשגיאה לא צפויה. אנחנו מצטערים על אי הנוחות.</p>
            </div>
            {this.state.error && (
              <div className="p-4 bg-black/40 rounded-lg border border-zinc-800 text-left overflow-auto max-h-40">
                <code className="text-xs text-red-400 font-mono">{this.state.error.message}</code>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              רענן את הדף
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
