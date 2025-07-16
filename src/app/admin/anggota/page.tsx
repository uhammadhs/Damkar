
import { createClient } from "@/lib/supabase/server";
import { Plus, Search } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberTable } from "./member-table";
import { AddMemberDialog } from "./add-member-dialog";

// Define a type for the profile data we expect from Supabase
export type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  nip: string | null;
  pangkat: string | null;
  role: string | null;
  avatar_url: string | null;
};

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
    .select(`id, email, name, nip, pangkat, role, avatar_url`)
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
