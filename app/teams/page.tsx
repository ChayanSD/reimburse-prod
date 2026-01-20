"use client";

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, ArrowRight, Settings, LogOut, Menu, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import useUser from "@/utils/useUser";

interface Team {
  id: number;
  name: string;
  slug: string;
  role: string;
  _count?: {
      members: number;
  }
}

export default function TeamsPage() {
  const { data: user } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamSlug, setNewTeamSlug] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      if (!res.ok) throw new Error("Failed to fetch teams");
      const data = await res.json();
      setTeams(data.teams);
    } catch (error) {
      console.error(error);
      toast.error("Could not load teams");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName, slug: newTeamSlug }),
      });

      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create team");
      }

      const data = await res.json();
      toast.success("Team created!");
      setTeams([...teams, { ...data.team, role: "OWNER" }]); // Optimistic update
      setIsCreating(false);
      setNewTeamName("");
      setNewTeamSlug("");
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error.message);
        } else {
            toast.error("An unknown error occurred");
        }
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
           <Spinner className="size-8 text-[#2E86DE]" />
           <p className="text-sm text-muted-foreground animate-pulse">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
        {/* Header */}
         <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 relative sticky top-0 z-50">
           <div className="max-w-7xl mx-auto flex items-center justify-between">
             <div className="flex items-center space-x-3 flex-1 min-w-0">
               <Image
                 src="https://ucarecdn.com/6b43f5cf-10b4-4838-b2ba-397c0a896734/-/format/auto/"
                 alt="ReimburseMe Logo"
                 className="w-8 h-8 sm:w-10 sm:h-10 shrink-0"
                 height={40}
                 width={40}
               />
               <Link href="/dashboard" className="min-w-0 flex-1 hover:opacity-80 transition-opacity">
                 <h1
                   className="text-lg sm:text-xl font-bold text-gray-900"
                   style={{ fontFamily: "Poppins, sans-serif" }}
                 >
                   ReimburseMe
                 </h1>
               </Link>
             </div>

             {/* Desktop Navigation */}
             <div className="hidden md:flex items-center space-x-4 shrink-0">
               <Link
                 href="/dashboard"
                 className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium text-base"
               >
                 <Home size={18} />
                 Dashboard
               </Link>
               <Link
                 href="/company-settings"
                 className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium text-base"
               >
                 <Settings size={18} />
                 Company Settings
               </Link>
               <Link
                 href="/account/logout"
                 className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium text-base"
               >
                 <LogOut size={18} />
                 Sign Out
               </Link>
             </div>

             {/* Mobile Burger Menu Button */}
             <button
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
               aria-label="Toggle menu"
             >
               {mobileMenuOpen ? (
                 <X size={24} />
               ) : (
                 <Menu size={24} />
               )}
             </button>
           </div>

           {/* Mobile Menu Dropdown */}
           {mobileMenuOpen && (
             <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
               <div className="px-4 py-3 space-y-2">
                 <Link
                   href="/dashboard"
                   onClick={() => setMobileMenuOpen(false)}
                   className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-lg transition-colors"
                 >
                   <Home size={20} />
                   Dashboard
                 </Link>
                 <Link
                   href="/company-settings"
                   onClick={() => setMobileMenuOpen(false)}
                   className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-lg transition-colors"
                 >
                   <Settings size={20} />
                   Company Settings
                 </Link>
                 <Link
                   href="/account/logout"
                   onClick={() => setMobileMenuOpen(false)}
                   className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-lg transition-colors"
                 >
                   <LogOut size={20} />
                   Sign Out
                 </Link>
               </div>
             </div>
           )}
         </header>

      <div className="container mx-auto py-10 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground">Manage your workspace and collaborators.</p>
            </div>
            <Button 
                onClick={() => setIsCreating(!isCreating)}
                className="bg-[#2E86DE] hover:bg-[#2574C7] text-white w-full sm:w-auto"
            >
                {isCreating ? "Cancel" : "Create Team"}
            </Button>
        </div>

      {isCreating && (
        <Card className="mb-8 max-w-md">
            <CardHeader>
                <CardTitle>Create New Team</CardTitle>
                <CardDescription>Start a new workspace for your organization.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input 
                            id="name" 
                            value={newTeamName} 
                            onChange={(e) => {
                                setNewTeamName(e.target.value);
                                setNewTeamSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                            }}
                            placeholder="Acme Corp"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Team URL Slug</Label>
                        <Input 
                            id="slug" 
                            value={newTeamSlug} 
                            onChange={(e) => setNewTeamSlug(e.target.value)} 
                            placeholder="acme-corp"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full bg-[#2E86DE] hover:bg-[#2574C7] text-white">Create Team</Button>
                </form>
            </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.length === 0 && !isCreating ? (
            <div className="col-span-full text-center py-12 border border-dashed rounded-lg">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No teams yet</h3>
                <p className="text-muted-foreground">Create a team to start collaborating.</p>
            </div>
        ) : (
            teams.map((team) => (
                <Link href={`/teams/${team.id}/dashboard`} key={team.id} className="block group">
                    <Card className="h-full transition-shadow hover:shadow-md">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="group-hover:text-primary transition-colors">{team.name}</CardTitle>
                                    <CardDescription>/{team.slug}</CardDescription>
                                </div>
                                <span className="text-xs bg-secondary px-2 py-1 rounded-full font-medium uppercase text-secondary-foreground">
                                    {team.role}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="mr-2 h-4 w-4" />
                                <span>Manage Team</span>
                                <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                             </div>
                        </CardContent>
                    </Card>
                </Link>
            ))
        )}
      </div>
    </div>
    </div>
  );
}
