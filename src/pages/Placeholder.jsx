import { Wrench } from 'lucide-react';
import { EmptyState, PageHeader } from '../components/ui.jsx';

// Stand-in for pages that are migrated in later steps.
export default function Placeholder({ title, description }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={Wrench}
        title="Coming soon"
        text="This section is being migrated and will be available shortly."
      />
    </>
  );
}
