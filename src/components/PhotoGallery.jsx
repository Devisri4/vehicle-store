import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import VehicleImage from './VehicleImage.jsx';

const arrowClass =
  'absolute top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-gray-800 shadow-lg ring-1 ring-black/5 ' +
  'backdrop-blur transition hover:scale-105 hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100';

export default function PhotoGallery({ paths, title }) {
  const [index, setIndex] = useState(0);
  const count = paths.length;
  const step = (delta) => setIndex((index + delta + count) % count);

  return (
    <div>
      <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-card">
        <VehicleImage
          path={paths[index]}
          alt={count > 1 ? `${title} — photo ${index + 1} of ${count}` : title}
          className="aspect-[4/3] w-full sm:aspect-[16/10]"
        />
        {count > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={`${arrowClass} left-4`}>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next photo" className={`${arrowClass} right-4`}>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="absolute bottom-4 right-4 rounded-full bg-gray-900/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {paths.map((path, i) => (
            <button
              key={path}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`overflow-hidden rounded-xl ring-2 ring-offset-2 transition ${
                i === index ? 'ring-brand-600' : 'opacity-60 ring-transparent hover:opacity-100'
              }`}
            >
              <VehicleImage path={path} alt="" className="aspect-[4/3] w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
