"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Settings, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./MobileNav";

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const teamId = params.teamId as string;

  const isActive = (path: string) => pathname?.includes(path);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b bg-card px-6 py-3 flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-4 gap-2">
            <Link href="/teams">
                <ChevronLeft className="h-4 w-4" />
                All Teams
            </Link>
        </Button>
        <span className="font-semibold">Team Workspace</span>
        <div className="ml-auto md:hidden">
            <MobileNav teamId={teamId} />
        </div>
      </div>
      <div className="flex flex-1">
        <aside className="w-64 border-r bg-muted/20 hidden md:block">
            <nav className="p-4 space-y-2">
                <Button 
                    variant="ghost" 
                    className={`w-full justify-start gap-2 ${isActive(`/${teamId}/dashboard`) ? "bg-[#2E86DE]/10 text-[#2E86DE]" : ""}`} 
                    asChild
                >
                    <Link href={`/teams/${teamId}/dashboard`}>
                        <LayoutDashboard className="h-4 w-4" />
                        Overview
                    </Link>
                </Button>
                <Button 
                    variant="ghost" 
                    className={`w-full justify-start gap-2 ${isActive(`/${teamId}/members`) ? "bg-[#2E86DE]/10 text-[#2E86DE]" : ""}`} 
                    asChild
                >
                    <Link href={`/teams/${teamId}/members`}>
                        <Users className="h-4 w-4" />
                        Members
                    </Link>
                </Button>
                <Button 
                    variant="ghost" 
                    className={`w-full justify-start gap-2 ${isActive(`/${teamId}/receipts`) ? "bg-[#2E86DE]/10 text-[#2E86DE]" : ""}`} 
                    asChild
                >
                    <Link href={`/teams/${teamId}/receipts`}>
                        <CreditCard className="h-4 w-4" />
                        Receipts
                    </Link>
                </Button>
                <Button 
                    variant="ghost" 
                    className={`w-full justify-start gap-2 ${isActive(`/${teamId}/settings`) ? "bg-[#2E86DE]/10 text-[#2E86DE]" : ""}`} 
                    asChild
                >
                    <Link href={`/teams/${teamId}/settings`}>
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                </Button>

            </nav>
        </aside>
        <main className="flex-1 p-6">
            {children}
        </main>
      </div>
    </div>
  );
}
