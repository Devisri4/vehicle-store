import { Wrench } from 'lucide-react';
import { PageHeader } from '../components/ui.jsx';

// Stand-in for pages that are migrated in later steps.
export default function Placeholder({ title, description }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Wrench className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-gray-900">Coming soon</h2>
        <p className="mt-1 text-sm text-gray-500">This section is being migrated and will be available shortly.</p>
      </div>
    </>
  );
}
