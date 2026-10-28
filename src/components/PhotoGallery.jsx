import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import VehicleImage from './VehicleImage.jsx';

const arrowClass =
  'absolute top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow transition hover:bg-white';

export default function PhotoGallery({ paths, title }) {
  const [index, setIndex] = useState(0);
  const count = paths.length;
  const step = (delta) => setIndex((index + delta + count) % count);

  return (
    <div>
      <div className="relative">
        <VehicleImage
          path={paths[index]}
          alt={count > 1 ? `${title} — photo ${index + 1} of ${count}` : title}
          className="aspect-[4/3] w-full rounded-2xl border border-gray-200"
        />
        {count > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={`${arrowClass} left-3`}>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next photo" className={`${arrowClass} right-3`}>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {paths.map((path, i) => (
            <button
              key={path}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`overflow-hidden rounded-lg border-2 transition ${
                i === index ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'
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
