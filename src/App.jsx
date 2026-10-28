import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Account from './pages/Account.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Browse from './pages/Browse.jsx';
import EditVehicle from './pages/EditVehicle.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import MyEnquiries from './pages/MyEnquiries.jsx';
import MyVehicles from './pages/MyVehicles.jsx';
import NotFound from './pages/NotFound.jsx';
import PostVehicle from './pages/PostVehicle.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<AppLayout />}>
        {/* Public: visitors can browse and view listings; contacting a seller still needs a login */}
        <Route path="/dashboard" element={<Browse />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />

        {/* Any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<Account />} />
          <Route path="/enquiries" element={<MyEnquiries />} />
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

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
