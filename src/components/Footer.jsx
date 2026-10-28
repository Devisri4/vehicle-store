import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <Logo />
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Second-Hand Vehicle Store. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
