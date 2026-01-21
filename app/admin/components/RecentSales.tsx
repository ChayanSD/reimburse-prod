"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RecentProps {
  users: {
    id: number;
    name: string | null;
    email: string;
    subscriptionTier: string | null;
  }[];
}

export function RecentSales({ users }: RecentProps) {
  return (
    <div className="space-y-8">
      {users.map((user) => (
        <div key={user.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt="Avatar" />
            <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || "Unknown Name"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="ml-auto font-medium">
            {user.subscriptionTier === "premium" ? "+$20.00" : user.subscriptionTier === "pro" ? "+$10.00" : "+$0.00"}
          </div>
        </div>
      ))}
    </div>
  );
}
