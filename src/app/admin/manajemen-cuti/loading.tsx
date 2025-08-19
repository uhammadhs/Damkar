
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid w-full grid-cols-2 p-1 bg-muted rounded-md mb-4 h-10">
          <Skeleton className="h-8 w-full m-auto" />
          <Skeleton className="h-8 w-full m-auto" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-2">
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
