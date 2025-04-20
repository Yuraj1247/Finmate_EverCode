import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"

export default function EmotionInsightsLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20 mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex space-x-2 mb-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
