// Stand-in for pages that are migrated in later steps.
export default function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-2xl font-semibold text-brand">{title}</h1>
      <p className="text-gray-600">This page is coming in the next migration step.</p>
    </div>
  );
}
