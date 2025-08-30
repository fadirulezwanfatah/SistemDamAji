import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-navy text-lightest-slate flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-light-navy rounded-lg p-6 text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gold mb-4">Ralat Sistem</h2>
            <p className="text-light-slate mb-6">
              Maaf, berlaku ralat yang tidak dijangka. Sila muat semula halaman atau hubungi pentadbir sistem.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gold hover:opacity-90 text-navy font-bold py-2 px-4 rounded transition-colors"
              >
                Muat Semula Halaman
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="w-full bg-slate hover:bg-light-slate text-navy font-bold py-2 px-4 rounded transition-colors"
              >
                Cuba Lagi
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-red-400 font-semibold">
                  Butiran Ralat (Development)
                </summary>
                <pre className="mt-2 text-xs bg-navy p-3 rounded overflow-auto text-red-300">
                  {this.state.error.stack}
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
