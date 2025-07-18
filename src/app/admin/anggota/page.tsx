
import { createClient } from "@/lib/supabase/server";
import { Search } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MemberTable } from "./member-table";
import { AddMemberDialog } from "./add-member-dialog";
import type { Database } from "@/types/supabase";

// Define a type for the profile data we expect from Supabase
export type Profile = Database['public']['Tables']['profiles']['Row'];

export default async function AnggotaPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const supabase = createClient();
  const query = searchParams?.query || "";

  let queryBuilder = supabase
    .from("profiles")
    .select(`*`) // Select all columns to match the Profile type
    .eq('role', 'anggota') // Hanya tampilkan pengguna dengan peran 'anggota'
    .order("name", { ascending: true });

  if (query) {
    // A simple search across multiple fields
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,nip.ilike.%${query}%,pangkat.ilike.%${query}%`);
  }

  const { data: profiles, error } = await queryBuilder;

  if (error) {
    console.error("Error fetching profiles:", error);
    // Handle error appropriately
    return <div>Error loading data.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          {/* We will need to implement search functionality with server components */}
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
        <MemberTable profiles={profiles || []} />
      </CardContent>
    </Card>
  );
}
