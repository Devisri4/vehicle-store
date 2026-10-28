import { Link } from 'react-router-dom';

// Stand-in for pages that are migrated in later steps.
export default function Placeholder({ title }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-light p-6 text-center">
      <h1 className="text-2xl font-semibold text-brand">{title}</h1>
      <p className="text-gray-600">This page is coming in the next migration step.</p>
      <Link to="/" className="text-brand underline">
        ← Back to Home
      </Link>
    </div>
  );
}
