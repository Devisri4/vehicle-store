import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import { IMAGE_TYPES, VEHICLE_CONDITIONS, VEHICLE_TYPES, validateImage } from '../lib/vehicles.js';
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

// Shared by Post Vehicle and Edit Vehicle. onSubmit(values, file) should navigate away or throw.
export default function VehicleForm({ initial, existingImagePath, requireImage, submitLabel, cancelTo, onSubmit }) {
  const [values, setValues] = useState({ ...EMPTY, ...initial });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const update = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  function handleFile(e) {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    const problem = validateImage(chosen);
    if (problem) {
      setMessage({ type: 'error', text: problem });
      e.target.value = '';
      return;
    }
    setMessage(null);
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (requireImage && !file) {
      setMessage({ type: 'error', text: 'Please add a photo of the vehicle.' });
      return;
    }
    setMessage(null);
    setSubmitting(true);
    try {
      await onSubmit(values, file);
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
          <h2 className="mb-4 text-base font-semibold text-gray-900">Photo</h2>
          <label
            htmlFor="image"
            className="block cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-brand-400"
          >
            {preview ? (
              <img src={preview} alt="Selected vehicle" className="aspect-[4/3] w-full object-cover" />
            ) : existingImagePath ? (
              <VehicleImage path={existingImagePath} alt="Current vehicle photo" className="aspect-[4/3] w-full" />
            ) : (
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 p-6 text-center">
                <ImagePlus className="h-8 w-8 text-gray-400" aria-hidden="true" />
                <span className="text-sm font-medium text-brand-700">Click to upload a photo</span>
                <span className="text-xs text-gray-500">JPG, PNG or WebP, up to 5 MB</span>
              </div>
            )}
            <input id="image" type="file" accept={IMAGE_TYPES.join(',')} className="sr-only" onChange={handleFile} />
          </label>
          {(preview || existingImagePath) && (
            <p className="mt-2 text-center text-xs text-gray-500">Click the photo to choose a different one.</p>
          )}
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
