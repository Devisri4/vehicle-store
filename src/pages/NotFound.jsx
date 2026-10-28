import { Link } from 'react-router-dom';
import { ArrowLeft, MapPinOff } from 'lucide-react';
import { EmptyState, primaryButtonClass } from '../components/ui.jsx';

export default function NotFound() {
  return (
    <div className="py-8">
      <EmptyState
        icon={MapPinOff}
        title="Page not found"
        text="The page you are looking for does not exist or has been moved."
        action={
          <Link to="/" className={primaryButtonClass}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
          </Link>
        }
      />
    </div>
  );
}
