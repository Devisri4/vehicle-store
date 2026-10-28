import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui.jsx';
import VehicleForm from '../components/VehicleForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { removeVehicleImages, resolvePhotoPaths, toVehicleRow } from '../lib/vehicles.js';

// Replaces the original client/post-vehicle.html. seller_id is set by the database to the logged-in user.
export default function PostVehicle() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(values, photos) {
    const { paths, uploaded } = await resolvePhotoPaths(user.id, photos);
    const { error } = await supabase.from('vehicles').insert({ ...toVehicleRow(values), image_paths: paths });
    if (error) {
      await removeVehicleImages(uploaded);
      throw error;
    }
    navigate('/seller', { state: { flash: 'Your vehicle has been posted.' } });
  }

  return (
    <>
      <PageHeader title="Post a vehicle" description="Add photos and details so buyers can find your vehicle." />
      <VehicleForm submitLabel="Post vehicle" cancelTo="/seller" onSubmit={handleSubmit} />
    </>
  );
}
