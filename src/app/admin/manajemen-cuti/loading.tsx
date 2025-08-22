
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid w-full h-10 grid-cols-2 p-1 mb-4 bg-muted rounded-md">
            <Skeleton className="w-full h-full" />
            <Skeleton className="w-full h-full" />
        </div>
        <div className="mt-4 space-y-4 md:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-28 rounded-lg" />
          ))}
        </div>
        <div className="hidden mt-4 md:block">
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center p-2 space-x-4">
                        <div className="flex-1 space-y-2">
                            <Skeleton className="w-3/4 h-4" />
                            <Skeleton className="w-1/2 h-4" />
                        </div>
                        <Skeleton className="w-24 h-10 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
