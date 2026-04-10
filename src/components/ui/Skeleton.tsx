import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/5",
        className
      )}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-card flex flex-col overflow-hidden h-[400px]">
      <Skeleton className="h-[200px] w-full rounded-none" />
      <div className="p-5 flex flex-col flex-grow space-y-4">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-auto pt-4">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export function OrderItemSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="space-y-2 hidden md:block">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
}
