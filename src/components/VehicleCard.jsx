import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { formatPrice } from '../lib/vehicles.js';
import VehicleImage from './VehicleImage.jsx';

export default function VehicleCard({ vehicle }) {
  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <VehicleImage path={vehicle.image_path} alt={vehicle.title} className="aspect-[4/3] w-full" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-semibold text-gray-900 group-hover:text-brand-700">{vehicle.title}</h3>
          <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {vehicle.type}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {vehicle.year} · {vehicle.condition}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-lg font-bold text-brand-700">{formatPrice(vehicle.price)}</span>
          <span className="flex min-w-0 items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{vehicle.location}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
