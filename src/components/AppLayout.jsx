import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

// Shared frame for every page except Home, Login and Sign Up
export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-r from-brand-light to-brand-lighter text-gray-800">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-brand py-2.5 text-center text-sm text-white">
        &copy; {new Date().getFullYear()} Second-Hand Vehicle Store. All rights reserved.
      </footer>
    </div>
  );
}
