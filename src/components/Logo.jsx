import { Car } from 'lucide-react';

export default function Logo({ inverted = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ${
          inverted ? 'bg-white text-brand-700' : 'bg-gradient-to-br from-brand-600 to-brand-800 text-white'
        }`}
      >
        <Car className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className={`text-lg font-bold tracking-tight ${inverted ? 'text-white' : 'text-gray-900'}`}>
        Vehicle<span className={inverted ? 'text-brand-200' : 'text-brand-600'}>Store</span>
      </span>
    </span>
  );
}
