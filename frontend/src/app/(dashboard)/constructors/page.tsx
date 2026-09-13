import { ConstructorsGrid } from "@/components/constructors/constructors-grid";
import { getConstructors } from "@/lib/api/constructors";

export default async function ConstructorsPage() {
  const constructors = await getConstructors();
  const sortedConstructors = [...constructors].sort(
    (a, b) => b.championships - a.championships || b.wins - a.wins
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Constructors</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          {constructors.length} teams · championship history and recent form.
        </p>
      </div>

      <ConstructorsGrid constructors={sortedConstructors} />
    </div>
  );
}
