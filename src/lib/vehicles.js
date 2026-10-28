import { supabase } from './supabase.js';

export const VEHICLE_TYPES = ['Car', 'SUV', 'Bike', 'Scooter', 'Truck', 'Other'];
export const VEHICLE_CONDITIONS = ['Like new', 'Excellent', 'Good', 'Fair', 'Needs repair'];

// Must match the vehicle-images bucket settings and the vehicles_image_paths_max constraint
const BUCKET = 'vehicle-images';
export const MAX_PHOTOS = 4;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // bucket limit, checked after resizing
const MAX_SOURCE_BYTES = 20 * 1024 * 1024; // what we accept from the user before resizing
const MAX_DIMENSION = 1600; // longest side in pixels after resizing
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
  if (file.size > MAX_SOURCE_BYTES) return `"${file.name}" is larger than 20 MB.`;
  return null;
}

// Shrinks large photos in the browser before upload: longest side at most 1600px, saved as JPEG.
// Small photos are uploaded untouched. Falls back to the original file if the browser can't resize it.
export async function resizeImage(file) {
  if (typeof createImageBitmap !== 'function') return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= 1.5 * 1024 * 1024) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  // White background so transparent PNGs don't turn black as JPEG
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}

// Images go in a folder named after the seller's user id; storage policies only allow writing there.
async function uploadVehicleImage(userId, original) {
  const file = await resizeImage(original);
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`"${original.name}" is still larger than 5 MB after resizing.`);
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

// Marks a listing 'sold' or 'available'. RLS only lets the owner change it; returns false if nothing changed.
export async function setVehicleStatus(vehicleId, status) {
  const { data, error } = await supabase.from('vehicles').update({ status }).eq('id', vehicleId).select('id');
  if (error) console.error('Status update failed:', error);
  return !error && data.length > 0;
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
