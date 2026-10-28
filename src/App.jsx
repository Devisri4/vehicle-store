import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Browse from './pages/Browse.jsx';
import EditVehicle from './pages/EditVehicle.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import MyVehicles from './pages/MyVehicles.jsx';
import Placeholder from './pages/Placeholder.jsx';
import PostVehicle from './pages/PostVehicle.jsx';
import SellerMessages from './pages/SellerMessages.jsx';
import Signup from './pages/Signup.jsx';
import VehicleDetail from './pages/VehicleDetail.jsx';

// Routes mirror the original pages (see README for the mapping).
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<AppLayout />}>
        <Route path="/vehicles/:id" element={<VehicleDetail />} />

        {/* Any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Browse />} />
        </Route>

        <Route element={<ProtectedRoute roles={['seller']} />}>
          <Route path="/seller" element={<MyVehicles />} />
          <Route path="/seller/messages" element={<SellerMessages />} />
          <Route path="/post" element={<PostVehicle />} />
          <Route path="/vehicles/:id/edit" element={<EditVehicle />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Route>
    </Routes>
  );
}
