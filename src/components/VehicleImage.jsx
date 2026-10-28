import { Car } from 'lucide-react';
import { imageUrl } from '../lib/vehicles.js';

export default function VehicleImage({ path, alt, className = '' }) {
  const src = imageUrl(path);
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-300 ${className}`}>
        <Car className="h-12 w-12" aria-hidden="true" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" className={`bg-gray-100 object-cover ${className}`} />;
}
