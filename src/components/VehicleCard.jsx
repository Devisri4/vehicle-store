import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Images, MapPin } from 'lucide-react';
import { formatPrice } from '../lib/vehicles.js';
import FavoriteButton from './FavoriteButton.jsx';
import { Badge } from './ui.jsx';
import VehicleImage from './VehicleImage.jsx';

export default function VehicleCard({ vehicle }) {
  const photoCount = vehicle.image_paths.length;
  const sold = vehicle.status === 'sold';

  return (
    // The heart sits beside the link (not inside it) so the card stays valid, accessible HTML
    <div className="group relative">
      <Link
        to={`/vehicles/${vehicle.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-card-hover"
      >
        <div className="relative overflow-hidden">
          <VehicleImage
            path={vehicle.image_paths[0]}
            alt={vehicle.title}
            className={`aspect-[4/3] w-full transition duration-500 ease-out group-hover:scale-105 ${
              sold ? 'opacity-60 grayscale' : ''
            }`}
          />
          <Badge tone="light" className="absolute left-3 top-3">
            {vehicle.type}
          </Badge>
          {sold && (
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-gray-900/75 py-2 text-center text-sm font-bold uppercase tracking-widest text-white">
              Sold
            </span>
          )}
          {photoCount > 1 && (
            <Badge tone="dark" className="absolute bottom-3 right-3">
              <Images className="h-3.5 w-3.5" aria-hidden="true" /> {photoCount}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-xl font-bold tracking-tight text-gray-900">{formatPrice(vehicle.price)}</p>
          <h3 className="mt-1 line-clamp-1 font-semibold text-gray-800 transition group-hover:text-brand-700">
            {vehicle.title}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" /> {vehicle.year}
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{vehicle.location}</span>
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
            <Badge tone="neutral">{vehicle.condition}</Badge>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
              View details
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
      <FavoriteButton vehicleId={vehicle.id} className="absolute right-3 top-3 z-10" />
    </div>
  );
}
