import { LoaderOne } from '../components/LoaderOne';

// Affiché pendant le chargement d'une page.
export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center bg-[#070709]">
      <LoaderOne />
    </div>
  );
}
