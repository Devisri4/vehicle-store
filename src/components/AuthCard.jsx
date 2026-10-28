import { Link } from 'react-router-dom';

// Shared white card used by the Login and Sign Up pages (same look as the original pages)
export default function AuthCard({ background, title, subtitle, children, footer }) {
  return (
    <div className={`flex min-h-screen items-center justify-center p-4 ${background}`}>
      <div className="w-full max-w-md rounded-2xl bg-white px-5 py-8 text-center shadow-lg sm:px-8 sm:py-10">
        <img
          src="https://cdn-icons-png.flaticon.com/512/744/744465.png"
          alt="Vehicle logo"
          className="mx-auto mb-4 w-20"
        />
        <h2 className="mb-1 text-2xl font-semibold text-[#34495e]">{title}</h2>
        <p className="mb-6 text-sm text-gray-500">{subtitle}</p>
        {children}
        <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600">
          {footer}
          <Link to="/" className="hover:text-brand">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const inputClass =
  'mb-3 w-full rounded-lg border border-gray-300 px-3 py-3 text-[15px] focus:border-brand focus:outline-none';

export function FormMessage({ message }) {
  if (!message) return null;
  const color = message.type === 'error' ? 'text-red-600' : 'text-green-700';
  return (
    <p role="status" className={`mt-3 font-semibold ${color}`}>
      {message.text}
    </p>
  );
}
