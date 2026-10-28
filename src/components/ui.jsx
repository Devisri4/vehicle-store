// Shared design system: form styles, buttons, cards, badges, headers, empty and loading states.
// Every page builds on these so the whole app looks consistent.

export const inputClass =
  'block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition ' +
  'placeholder:text-gray-400 hover:border-gray-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ' +
  'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100';

export const primaryButtonClass = `${buttonBase} bg-brand-700 text-white shadow-sm hover:bg-brand-800`;

export const secondaryButtonClass = `${buttonBase} border border-gray-300 bg-white text-gray-700 shadow-sm hover:border-gray-400 hover:bg-gray-50`;

export const destructiveButtonClass = `${buttonBase} bg-red-600 text-white shadow-sm hover:bg-red-700`;

export const dangerButtonClass =`${buttonBase} border border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50`;

// Compact variants for row actions (tables, lists)
export const smallButtonClass =
  'inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 ' +
  'transition hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]';

export const smallDangerButtonClass =
  'inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 ' +
  'transition hover:border-red-300 hover:bg-red-50 active:scale-[0.98] disabled:opacity-60';

export const cardClass = 'rounded-2xl border border-gray-200 bg-white shadow-card';

export function Card({ className = '', children }) {
  return <div className={`${cardClass} ${className}`}>{children}</div>;
}

export function CardHeader({ title, description }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  );
}

const BADGE_TONES = {
  neutral: 'bg-gray-100 text-gray-700 ring-gray-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  purple: 'bg-violet-50 text-violet-700 ring-violet-100',
  dark: 'bg-gray-900/70 text-white ring-white/10 backdrop-blur',
  light: 'bg-white/90 text-gray-800 ring-black/5 backdrop-blur',
};

export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Field({ label, id, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input id={id} className={inputClass} {...inputProps} />
    </div>
  );
}

export function FormMessage({ message }) {
  if (!message) return null;
  const styles =
    message.type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';
  return (
    <p role="status" className={`rounded-lg border px-3.5 py-2.5 text-sm ${styles}`}>
      {message.text}
    </p>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      {Icon && (
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-brand-50" aria-hidden="true" />
          <span className="absolute inset-2 rounded-full bg-brand-100/70" aria-hidden="true" />
          <Icon className="relative h-7 w-7 text-brand-700" aria-hidden="true" />
        </div>
      )}
      <h2 className="mt-5 text-base font-semibold text-gray-900">{title}</h2>
      {text && <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-500">{text}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-sm font-semibold text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-gray-500 sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeletons (used instead of plain "Loading…" text)
// ---------------------------------------------------------------------------

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-gray-200/80 ${className}`} aria-hidden="true" />;
}

export function VehicleCardSkeleton() {
  return (
    <div className={`${cardClass} overflow-hidden`} aria-hidden="true">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={`${cardClass} flex flex-col gap-4 p-4 sm:flex-row sm:items-center`}>
          <Skeleton className="aspect-[4/3] w-full sm:w-40" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className={`${cardClass} divide-y divide-gray-100`} role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-1/4 sm:block" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
