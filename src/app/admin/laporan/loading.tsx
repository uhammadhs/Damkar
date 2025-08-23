
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';

// This loading component now ONLY renders the skeleton for the table content,
// because the Card and Header skeletons are part of the main layout now.
export default function Loading() {
    return (
        <div className="overflow-x-auto">
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
    );
}
