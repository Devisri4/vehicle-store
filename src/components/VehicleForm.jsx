import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Star, X } from 'lucide-react';
import { IMAGE_TYPES, MAX_PHOTOS, VEHICLE_CONDITIONS, VEHICLE_TYPES, validateImage } from '../lib/vehicles.js';
import { FormMessage, inputClass, primaryButtonClass, secondaryButtonClass } from './ui.jsx';
import VehicleImage from './VehicleImage.jsx';

const EMPTY = { title: '', price: '', year: '', location: '', type: 'Car', condition: 'Good', description: '' };
const MAX_YEAR = new Date().getFullYear() + 1;

// Keeps an unusual existing value (e.g. "Used" from the old site) selectable when editing
const withCurrent = (options, current) => (current && !options.includes(current) ? [current, ...options] : options);

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
      {children}
    </label>
  );
}

// Shared by Post Vehicle and Edit Vehicle. onSubmit(values, photos) should navigate away or throw.
// photos is the ordered list shown to the user: existing { path } or new { file }; the first is the cover.
export default function VehicleForm({ initial, existingImagePaths = [], submitLabel, cancelTo, onSubmit }) {
  const [values, setValues] = useState({ ...EMPTY, ...initial });
  const [photos, setPhotos] = useState(() => existingImagePaths.map((path) => ({ id: path, path })));
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const previews = useRef(new Set());

  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const update = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  function handleFiles(e) {
    const chosen = Array.from(e.target.files ?? []);
    e.target.value = '';
    const problems = [];
    const room = MAX_PHOTOS - photos.length;
    if (chosen.length > room) problems.push(`You can add up to ${MAX_PHOTOS} photos.`);

    const added = [];
    for (const file of chosen.slice(0, room)) {
      const problem = validateImage(file);
      if (problem) {
        problems.push(problem);
        continue;
      }
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      added.push({ id: preview, file, preview });
    }
    setPhotos([...photos, ...added]);
    setMessage(problems.length ? { type: 'error', text: problems.join(' ') } : null);
  }

  function removePhoto(photo) {
    if (photo.preview) {
      URL.revokeObjectURL(photo.preview);
      previews.current.delete(photo.preview);
    }
    setPhotos(photos.filter((p) => p.id !== photo.id));
  }

  const makeCover = (photo) => setPhotos([photo, ...photos.filter((p) => p.id !== photo.id)]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (photos.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one photo of the vehicle.' });
      return;
    }
    setMessage(null);
    setSubmitting(true);
    try {
      await onSubmit(values, photos);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err?.message || 'Something went wrong. Please try again.' });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
        <h2 className="text-base font-semibold text-gray-900">Vehicle details</h2>
        <div>
          <Label htmlFor="title">Title</Label>
          <input
            id="title"
            className={inputClass}
            placeholder="e.g. Honda City VX 2019"
            required
            maxLength={100}
            value={values.title}
            onChange={update('title')}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Price (₹)</Label>
            <input
              id="price"
              type="number"
              min="0"
              step="1"
              className={inputClass}
              placeholder="650000"
              required
              value={values.price}
              onChange={update('price')}
            />
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <input
              id="year"
              type="number"
              min="1900"
              max={MAX_YEAR}
              className={inputClass}
              placeholder="2019"
              required
              value={values.year}
              onChange={update('year')}
            />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <select id="type" className={inputClass} value={values.type} onChange={update('type')}>
              {withCurrent(VEHICLE_TYPES, values.type).map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="condition">Condition</Label>
            <select id="condition" className={inputClass} value={values.condition} onChange={update('condition')}>
              {withCurrent(VEHICLE_CONDITIONS, values.condition).map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <input
            id="location"
            className={inputClass}
            placeholder="e.g. Hyderabad"
            required
            maxLength={100}
            value={values.location}
            onChange={update('location')}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={5}
            className={inputClass}
            placeholder="Mileage, service history, ownership, any issues…"
            required
            maxLength={5000}
            value={values.description}
            onChange={update('description')}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-gray-900">Photos</h2>
            <span className="text-xs text-gray-500">
              {photos.length} / {MAX_PHOTOS}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-gray-200">
                {photo.preview ? (
                  <img src={photo.preview} alt={`Photo ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <VehicleImage path={photo.path} alt={`Photo ${index + 1}`} className="aspect-[4/3] w-full" />
                )}
                {index === 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded bg-brand-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(photo)}
                    className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700 shadow hover:bg-white"
                  >
                    <Star className="h-3 w-3" aria-hidden="true" /> Make cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(photo)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-gray-700 shadow hover:bg-white hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <label
                htmlFor="images"
                className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-center transition hover:border-brand-400 ${
                  photos.length === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-[4/3]'
                }`}
              >
                <ImagePlus className="h-6 w-6 text-gray-400" aria-hidden="true" />
                <span className="text-xs font-medium text-brand-700">
                  {photos.length === 0 ? 'Click to add photos' : 'Add photo'}
                </span>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept={IMAGE_TYPES.join(',')}
                  className="sr-only"
                  onChange={handleFiles}
                />
              </label>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Up to {MAX_PHOTOS} photos · JPG, PNG or WebP · max 5 MB each. The first photo is the cover.
          </p>
        </div>

        <FormMessage message={message} />
        <div className="flex gap-3">
          <Link to={cancelTo} className={`${secondaryButtonClass} flex-1`}>
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className={`${primaryButtonClass} flex-1`}>
            {submitting ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
