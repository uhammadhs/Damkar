
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';

export default function Loading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                <CardDescription>
                    <Skeleton className="h-4 w-80 mt-2" />
                </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Skeleton className="h-10 w-full sm:w-[250px]" />
                <Skeleton className="h-10 w-full sm:w-[180px]" />
            </div>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
