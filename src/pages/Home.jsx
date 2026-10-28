import { Link } from 'react-router-dom';
import ConnectionStatus from '../components/ConnectionStatus.jsx';
import { dashboardPath, useAuth } from '../context/AuthContext.jsx';

const buttonBase = 'rounded-lg px-5 py-3 font-semibold text-white transition sm:px-7 sm:py-3.5';

// Port of the original client/index.html landing page
export default function Home() {
  const { profile, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-r from-brand-light to-brand-lighter text-gray-800">
      <header className="bg-brand px-5 py-10 text-center text-white">
        <h1 className="mb-2 text-2xl font-bold sm:text-4xl">🚗 Second-Hand Vehicle Store</h1>
        <p className="text-base sm:text-lg">Buy &amp; Sell Trusted Pre-Owned Cars &amp; Bikes</p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/744/744465.png"
          alt="Vehicle logo"
          className="mb-5 w-60 max-w-full"
        />
        <h2 className="mb-4 text-2xl font-semibold text-brand sm:text-3xl">Your Trusted Vehicle Marketplace</h2>

        <div className="mt-8 flex flex-wrap justify-center gap-5">
          {profile ? (
            <>
              <Link to={dashboardPath(profile.role)} className={`${buttonBase} bg-go hover:bg-go-dark`}>
                🚘 Go to my dashboard
              </Link>
              <button type="button" onClick={signOut} className={`${buttonBase} bg-accent hover:bg-accent-dark`}>
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signup" className={`${buttonBase} bg-go hover:bg-go-dark`}>
                📝 Sign Up
              </Link>
              <Link to="/login" className={`${buttonBase} bg-accent hover:bg-accent-dark`}>
                🔐 Login
              </Link>
            </>
          )}
        </div>
        {profile && (
          <p className="mt-4 text-sm text-gray-600">
            Logged in as <strong>{profile.name}</strong> ({profile.role})
          </p>
        )}

        <ConnectionStatus />
      </main>

      <footer className="bg-brand py-2.5 text-center text-sm text-white">
        &copy; {new Date().getFullYear()} Second-Hand Vehicle Store. All rights reserved.
      </footer>
    </div>
  );
}
