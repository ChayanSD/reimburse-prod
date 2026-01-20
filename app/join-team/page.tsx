"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Users, AlertCircle } from "lucide-react";
import useUser from "@/utils/useUser";

function JoinTeamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { data: user, loading: userLoading } = useUser();
  const [error, setError] = useState<string | null>(null);

  // Fetch Invite Details
  const { data: invite, isLoading: inviteLoading, error: inviteError } = useQuery({
    queryKey: ['invite', token],
    queryFn: async () => {
      if (!token) throw new Error("No token provided");
      const res = await fetch(`/api/teams/join?token=${token}`);
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Invalid invitation");
      }
      return res.json();
    },
    enabled: !!token,
    retry: false
  });

  // Join Mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
        const res = await fetch("/api/teams/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            if (res.status === 401 && data.redirectTo) {
                // Redirect for auth
                window.location.href = data.redirectTo;
                return; // Stop here
            }
            throw new Error(data.error);
        }
        return data;
    },
    onSuccess: (data) => {
        if (data) {
            toast.success("Successfully joined the team!");
            router.push(`/teams/${data.teamId}/dashboard`);
        }
    },
    onError: (err: Error) => {
        toast.error(err.message);
        setError(err.message);
    }
  });

  if (!token) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                        <AlertCircle size={24} /> Invalid Link
                    </CardTitle>
                    <CardDescription>Missing invitation token.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
  }

  if (inviteLoading || userLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Spinner className="text-blue-600 size-8" />
        </div>
      );
  }

  if (inviteError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
             <Card className="w-full max-w-md border-red-200 bg-red-50">
                <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                        <AlertCircle size={24} /> Invitation Error
                    </CardTitle>
                    <CardDescription className="text-red-600">
                        {error || (inviteError as Error).message}
                    </CardDescription>
                </CardHeader>
                 <CardFooter>
                     <Button variant="outline" onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                 </CardFooter>
            </Card>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
                    <Users className="size-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Join {invite.teamName}</CardTitle>
                <CardDescription>
                    You have been invited to join this team on ReimburseMe.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Team:</span>
                        <span className="font-medium">{invite.teamName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Role:</span>
                        <span className="font-medium capitalize">{invite.role.toLowerCase()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Sent to:</span>
                        <span className="font-medium">{invite.inviterEmail}</span>
                    </div>
                </div>

                {!user && (
                    <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 flex gap-2">
                        <AlertCircle className="size-5 shrink-0" />
                        <p>You need to sign in or create an account to accept this invitation.</p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
                <Button 
                    className="w-full bg-[#2E86DE] hover:bg-[#2574C7] text-white" 
                    size="lg"
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                >
                    {joinMutation.isPending ? "Joining..." : user ? "Accept Invitation" : "Sign in to Accept"}
                </Button>
                {user && (
                    <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard")}>
                        Cancel
                    </Button>
                )}
            </CardFooter>
        </Card>
    </div>
  );
}

export default function JoinTeamPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><Spinner className="text-blue-600 size-8" /></div>}>
      <JoinTeamContent />
    </Suspense>
  );
}
