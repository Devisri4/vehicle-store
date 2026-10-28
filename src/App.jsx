import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Placeholder from './pages/Placeholder.jsx';
import Signup from './pages/Signup.jsx';

// Routes mirror the original pages (see README for the mapping).
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<AppLayout />}>
        <Route path="/vehicles/:id" element={<Placeholder title="Vehicle Details" />} />

        {/* Any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Placeholder title="Available Vehicles" />} />
        </Route>

        <Route element={<ProtectedRoute roles={['seller']} />}>
          <Route path="/seller" element={<Placeholder title="Seller Dashboard" />} />
          <Route path="/seller/messages" element={<Placeholder title="Seller Messages" />} />
          <Route path="/post" element={<Placeholder title="Post Vehicle" />} />
          <Route path="/vehicles/:id/edit" element={<Placeholder title="Edit Vehicle" />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<Placeholder title="Admin Panel" />} />
        </Route>

        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Route>
    </Routes>
  );
}
