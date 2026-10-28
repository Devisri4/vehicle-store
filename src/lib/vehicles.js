import { supabase } from './supabase.js';

export const VEHICLE_TYPES = ['Car', 'SUV', 'Bike', 'Scooter', 'Truck', 'Other'];
export const VEHICLE_CONDITIONS = ['Like new', 'Excellent', 'Good', 'Fair', 'Needs repair'];

// Must match the vehicle-images bucket settings in the database
const BUCKET = 'vehicle-images';
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatPrice = (value) => priceFormatter.format(Number(value));

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function imageUrl(path) {
  if (!path || !supabase) return null;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export function validateImage(file) {
  if (!IMAGE_TYPES.includes(file.type)) return 'Please choose a JPG, PNG or WebP image.';
  if (file.size > MAX_IMAGE_BYTES) return 'The image must be 5 MB or smaller.';
  return null;
}

// Images go in a folder named after the seller's user id; storage policies only allow writing there.
export async function uploadVehicleImage(userId, file) {
  const path = `${userId}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export async function removeVehicleImage(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error('Failed to remove image:', error);
}

// Only the columns a seller is allowed to write (matches the column grants in the database)
export function toVehicleRow(values) {
  return {
    title: values.title.trim(),
    price: Number(values.price),
    year: Number(values.year),
    location: values.location.trim(),
    type: values.type,
    condition: values.condition,
    description: values.description.trim(),
  };
}
