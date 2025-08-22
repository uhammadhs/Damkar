
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
    return (
        <Card>
            <CardHeader>
                <CardTitle><Skeleton className="h-7 w-32" /></CardTitle>
                <CardDescription>
                    <Skeleton className="h-4 w-64" />
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <div className="flex-1 w-full space-y-8 text-left">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-6 w-40" />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2 pt-6 border-t sm:flex-row">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
