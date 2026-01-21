"use client"; // Can be server component if passed data, but let's make it accept props

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ActivityLogProps {
  logs: {
    id: string;
    eventType: string;
    details?: any;
    createdAt: Date;
    user?: {
      email: string | null;
    } | null;
  }[];
}

export function ActivityLog({ logs }: ActivityLogProps) {
  return (
    <div className="space-y-8">
      {logs.map((log) => (
        <div key={log.id} className="flex items-center">
          <Avatar className="h-9 w-9">
             <AvatarImage src={`https://avatar.vercel.sh/${log.user?.email || "system"}`} alt="Avatar" />
            <AvatarFallback>
              {log.user?.email?.[0]?.toUpperCase() || "S"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {formatEventType(log.eventType)}
            </p>
            <p className="text-xs text-muted-foreground">
              {log.user?.email || "System"} • {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatEventType(type: string) {
  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}
