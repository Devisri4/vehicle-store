import { Component } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { primaryButtonClass, secondaryButtonClass } from './ui.jsx';

// Shows a friendly screen instead of a blank page if any component throws while rendering.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unexpected error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-card">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <TriangleAlert className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-xl font-bold tracking-tight text-gray-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-500">
            An unexpected error occurred. Reloading the page usually fixes it.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => window.location.reload()} className={primaryButtonClass}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Reload page
            </button>
            {/* A full page load, so the app starts fresh */}
            <a href="/" className={secondaryButtonClass}>
              Go to home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
