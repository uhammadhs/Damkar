
import { createClient } from "@/lib/supabase/server";
import { Search, Users, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AddMemberDialog } from "./add-member-dialog";
import type { Database } from "@/types/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MemberActions } from "./member-actions";

export type Profile = Database['public']['Tables']['profiles']['Row'];

const getAvatarFallback = (name: string | null) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const ITEMS_PER_PAGE = 10;

export default async function AnggotaPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const supabase = createClient();
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let queryBuilder = supabase
    .from("profiles")
    .select(`*`, { count: 'exact' })
    .eq('role', 'anggota')
    .order("name", { ascending: true });

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,nip.ilike.%${query}%,pangkat.ilike.%${query}%`);
  }

  queryBuilder = queryBuilder.range(offset, offset + ITEMS_PER_PAGE - 1);

  const { data: profiles, error, count } = await queryBuilder;

  if (error) {
    console.error("Error fetching profiles:", error);
    return <div>Error loading data.</div>;
  }

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <form className="w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                name="query"
                placeholder="Cari anggota..."
                className="pl-8 sm:w-[300px]"
                defaultValue={query}
              />
            </div>
          </form>
          <AddMemberDialog />
        </div>
      </CardHeader>
      <CardContent>
        {profiles && profiles.length > 0 ? (
           <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="hidden sm:table-cell">NIP</TableHead>
                  <TableHead className="hidden md:table-cell">Pangkat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={profile.avatar_url || ''} alt={profile.name || ''} data-ai-hint="male portrait" />
                          <AvatarFallback>{getAvatarFallback(profile.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="font-medium">{profile.name || 'No Name'}</div>
                          <div className="text-sm text-muted-foreground md:hidden">{profile.pangkat}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{profile.nip}</TableCell>
                    <TableCell className="hidden md:table-cell">{profile.pangkat}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <MemberActions member={profile} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold font-headline">Belum Ada Anggota</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {query ? `Tidak ada anggota yang cocok dengan pencarian "${query}".` : 'Anda belum memiliki anggota. Tambahkan anggota pertama untuk memulai.'}
            </p>
            <div className="mt-6">
              <AddMemberDialog />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
