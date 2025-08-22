
import { createClient } from "@/lib/supabase/server";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AddMemberDialog } from "./add-member-dialog";
import type { Database } from "@/types/supabase";
import { MemberTable } from "./member-table";
import { Suspense } from "react";
import Loading from "./loading";

export const revalidate = 60; // Cache for 60 seconds
export type Profile = Database['public']['Tables']['profiles']['Row'];

const ITEMS_PER_PAGE = 10;

async function MemberList({ query, currentPage }: { query: string, currentPage: number }) {
  const supabase = createClient();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let queryBuilder = supabase
    .from("profiles")
    .select(`*`, { count: 'exact' })
    .eq('role', 'anggota')
    .order("name", { ascending: true });

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,id_pjlp.ilike.%${query}%,phone.ilike.%${query}%`);
  }

  queryBuilder = queryBuilder.range(offset, offset + ITEMS_PER_PAGE - 1);

  const { data: profiles, error, count } = await queryBuilder;

  if (error) {
    console.error("Error fetching profiles:", error);
    // Fallback UI or error message
    return <div>Gagal memuat data anggota. Silakan coba lagi nanti.</div>;
  }
  
  // const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return <MemberTable profiles={profiles || []} query={query} />
}

export default async function AnggotaPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

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
                placeholder="Cari anggota (nama, id pjlp)..."
                className="pl-8 sm:w-[300px]"
                defaultValue={query}
              />
            </div>
          </form>
          <div className="w-full sm:w-auto">
             <AddMemberDialog />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Suspense key={query + currentPage} fallback={<Loading />}>
          <MemberList query={query} currentPage={currentPage} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
