
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';

export default function Loading() {
    return (
        <>
            {/* Mobile Skeleton */}
            <div className="space-y-4 md:hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="text-right space-y-2">
                                <Skeleton className="h-4 w-20 ml-auto" />
                                <Skeleton className="h-5 w-16 ml-auto" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t space-y-2">
                           <Skeleton className="h-4 w-28" />
                           <Skeleton className="h-4 w-28" />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Desktop Skeleton */}
            <div className="hidden md:block">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                    <TableHead className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableHead>
                    <TableHead className="text-center"><Skeleton className="h-5 w-24 mx-auto" /></TableHead>
                    <TableHead className="text-center"><Skeleton className="h-5 w-24 mx-auto" /></TableHead>
                    <TableHead className="text-center"><Skeleton className="h-5 w-24 mx-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </>
    );
}
