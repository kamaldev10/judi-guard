import { cn } from "@/lib/utils";

export default function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full bg-opacity-10",
            colorClass,
          )}
        >
          {Icon && <Icon size={24} />}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}
