"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";

export default function TeamDashboardPage() {
  const { teamId } = useParams();
  const [team, setTeam] = useState<{ team: { name: string; id: number }; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTeamDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTeam(data); // includes team object and role
    } catch (error) {
       console.error(error);
       toast.error("Failed to load team");
    } finally {
        setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeamDetails();
  }, [fetchTeamDetails]);

  if (loading) return <div>Loading...</div>;
  if (!team) return <div>Team not found</div>;

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{team.team.name}</h1>
            <p className="text-muted-foreground">Workspace overview</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Role</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{team.role}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team ID</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="text-2xl font-bold font-mono text-muted-foreground">#{team.team.id}</div>
                </CardContent>
            </Card>
            {/* Add more stats here like Total Spend etc if backend provides it */}
        </div>
    </div>
  );
}
