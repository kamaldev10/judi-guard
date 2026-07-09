import { cn } from '@/lib/utils/index';

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200/80 dark:bg-gray-700/50', className)}
      {...props}
    />
  );
}

export { Skeleton };
