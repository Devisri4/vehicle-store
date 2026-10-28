import { supabase } from './supabase.js';

export const VEHICLE_TYPES = ['Car', 'SUV', 'Bike', 'Scooter', 'Truck', 'Other'];
export const VEHICLE_CONDITIONS = ['Like new', 'Excellent', 'Good', 'Fair', 'Needs repair'];

// Must match the vehicle-images bucket settings and the vehicles_image_paths_max constraint
const BUCKET = 'vehicle-images';
export const MAX_PHOTOS = 4;
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
  if (!IMAGE_TYPES.includes(file.type)) return `"${file.name}" is not a JPG, PNG or WebP image.`;
  if (file.size > MAX_IMAGE_BYTES) return `"${file.name}" is larger than 5 MB.`;
  return null;
}

// Images go in a folder named after the seller's user id; storage policies only allow writing there.
async function uploadVehicleImage(userId, file) {
  const path = `${userId}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export async function removeVehicleImages(paths) {
  if (!paths?.length) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) console.error('Failed to remove images:', error);
}

// Turns the form's photo list (existing { path } or new { file }) into storage paths, in display order.
// Returns the newly uploaded paths too, so callers can clean them up if saving the vehicle fails.
export async function resolvePhotoPaths(userId, photos) {
  const uploaded = [];
  try {
    const paths = [];
    for (const photo of photos) {
      if (photo.path) {
        paths.push(photo.path);
      } else {
        const path = await uploadVehicleImage(userId, photo.file);
        uploaded.push(path);
        paths.push(path);
      }
    }
    return { paths, uploaded };
  } catch (err) {
    await removeVehicleImages(uploaded);
    throw err;
  }
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
