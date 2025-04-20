import { Skeleton } from "@/components/ui/skeleton"

export default function ExpensesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-5 w-2/3 mb-8" />
      </div>

      {/* Expense Form Skeleton */}
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-12 w-1/4 ml-auto" />
      </div>

      {/* Expenses Table Skeleton */}
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="overflow-x-auto">
          <div className="grid grid-cols-5 gap-4 mb-4 p-4 bg-muted rounded-md">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
          {Array(5)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 p-4 border-b">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
        </div>
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-card rounded-lg shadow-md p-6">
          <Skeleton className="h-8 w-1/3 mb-6" />
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
        <div className="bg-card rounded-lg shadow-md p-6">
          <Skeleton className="h-8 w-1/3 mb-6" />
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
