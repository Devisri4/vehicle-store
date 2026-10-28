import { useLocation, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

// Heart toggle. Logged-out visitors are sent to log in and brought back afterwards.
// variant "overlay" sits on a photo; "button" is a full-size outlined button with a label.
export default function FavoriteButton({ vehicleId, variant = 'overlay', className = '' }) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const saved = Boolean(user) && isFavorite(vehicleId);
  const label = saved ? 'Remove from saved' : 'Save vehicle';

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    toggleFavorite(vehicleId);
  }

  const icon = (
    <Heart
      className={`h-5 w-5 transition ${saved ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
      aria-hidden="true"
    />
  );

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm transition active:scale-[0.98] ${
          saved
            ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
        } ${className}`}
      >
        {icon} {saved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-110 hover:bg-white active:scale-95 ${className}`}
    >
      {icon}
    </button>
  );
}
