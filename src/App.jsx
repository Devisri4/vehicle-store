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
        <Route path="/vehicles/:id" element={<Placeholder title="Vehicle details" />} />

        {/* Any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Placeholder title="Available vehicles" description="Explore pre-owned vehicles from trusted sellers." />}
          />
        </Route>

        <Route element={<ProtectedRoute roles={['seller']} />}>
          <Route
            path="/seller"
            element={<Placeholder title="My vehicles" description="Manage the vehicles you have listed for sale." />}
          />
          <Route
            path="/seller/messages"
            element={<Placeholder title="Messages" description="Enquiries from buyers about your vehicles." />}
          />
          <Route
            path="/post"
            element={<Placeholder title="Post a vehicle" description="Add a new vehicle listing with a photo." />}
          />
          <Route path="/vehicles/:id/edit" element={<Placeholder title="Edit vehicle" />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route
            path="/admin"
            element={<Placeholder title="Admin panel" description="Manage all users and vehicle listings." />}
          />
        </Route>

        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Route>
    </Routes>
  );
}
