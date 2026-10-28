import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CarFront } from 'lucide-react';
import { EmptyState, PageHeader, primaryButtonClass } from '../components/ui.jsx';
import VehicleForm from '../components/VehicleForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { removeVehicleImage, toVehicleRow, uploadVehicleImage } from '../lib/vehicles.js';

// Replaces the original client/edit-vehicle.html; the photo can now be replaced too.
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

  async function handleSubmit(values, file) {
    const newImagePath = file ? await uploadVehicleImage(user.id, file) : null;
    const row = toVehicleRow(values);
    if (newImagePath) row.image_path = newImagePath;

    const { data, error } = await supabase.from('vehicles').update(row).eq('id', vehicle.id).select('id');
    if (error || data.length === 0) {
      await removeVehicleImage(newImagePath);
      throw error ?? new Error('You can only edit your own vehicles.');
    }
    if (newImagePath) await removeVehicleImage(vehicle.image_path);
    navigate('/seller', { state: { flash: 'Vehicle updated.' } });
  }

  if (status === 'loading') return <p className="py-24 text-center text-sm text-gray-500">Loading…</p>;
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
        existingImagePath={vehicle.image_path}
        submitLabel="Save changes"
        cancelTo="/seller"
        onSubmit={handleSubmit}
      />
    </>
  );
}
