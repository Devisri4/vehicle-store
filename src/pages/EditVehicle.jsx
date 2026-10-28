import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CarFront } from 'lucide-react';
import { EmptyState, PageHeader, Skeleton, primaryButtonClass } from '../components/ui.jsx';
import VehicleForm from '../components/VehicleForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { removeVehicleImages, resolvePhotoPaths, toVehicleRow } from '../lib/vehicles.js';

// Replaces the original client/edit-vehicle.html; photos can now be changed too.
export default function EditVehicle() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('Failed to load vehicle:', error);
        setVehicle(data ?? null);
        // Database policies block editing other sellers' vehicles anyway; this just explains it
        setStatus(!data || data.seller_id !== user.id ? 'unavailable' : 'ready');
      });
  }, [id, user.id]);

  async function handleSubmit(values, photos) {
    const { paths, uploaded } = await resolvePhotoPaths(user.id, photos);
    const { data, error } = await supabase
      .from('vehicles')
      .update({ ...toVehicleRow(values), image_paths: paths })
      .eq('id', vehicle.id)
      .select('id');
    if (error || data.length === 0) {
      await removeVehicleImages(uploaded);
      throw error ?? new Error('You can only edit your own vehicles.');
    }
    // Delete photos the seller removed
    await removeVehicleImages(vehicle.image_paths.filter((path) => !paths.includes(path)));
    navigate('/seller', { state: { flash: 'Vehicle updated.' } });
  }

  if (status === 'loading') {
    return (
      <div className="space-y-6" role="status" aria-label="Loading vehicle">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="h-[32rem] rounded-2xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }
  if (status === 'unavailable') {
    return (
      <EmptyState
        icon={CarFront}
        title="Vehicle not available"
        text="It does not exist or belongs to another seller."
        action={
          <Link to="/seller" className={primaryButtonClass}>
            Back to my vehicles
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PageHeader title="Edit vehicle" description={vehicle.title} />
      <VehicleForm
        initial={{
          title: vehicle.title,
          price: String(vehicle.price),
          year: String(vehicle.year),
          location: vehicle.location,
          type: vehicle.type,
          condition: vehicle.condition,
          description: vehicle.description,
        }}
        existingImagePaths={vehicle.image_paths}
        submitLabel="Save changes"
        cancelTo="/seller"
        onSubmit={handleSubmit}
      />
    </>
  );
}
