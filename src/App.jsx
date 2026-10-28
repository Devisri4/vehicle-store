import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Placeholder from './pages/Placeholder.jsx';

// Routes mirror the original pages (see README for the mapping).
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Placeholder title="Login" />} />
      <Route path="/signup" element={<Placeholder title="Sign Up" />} />
      <Route path="/dashboard" element={<Placeholder title="Available Vehicles" />} />
      <Route path="/vehicles/:id" element={<Placeholder title="Vehicle Details" />} />
      <Route path="/vehicles/:id/edit" element={<Placeholder title="Edit Vehicle" />} />
      <Route path="/post" element={<Placeholder title="Post Vehicle" />} />
      <Route path="/seller" element={<Placeholder title="Seller Dashboard" />} />
      <Route path="/seller/messages" element={<Placeholder title="Seller Messages" />} />
      <Route path="/admin" element={<Placeholder title="Admin Panel" />} />
      <Route path="*" element={<Placeholder title="Page not found" />} />
    </Routes>
  );
}
