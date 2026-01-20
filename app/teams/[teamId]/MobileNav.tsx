"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function MobileNav({ teamId }: { teamId: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname?.includes(path);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>
      <DialogContent className="fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm rounded-none left-auto top-0 translate-x-0 translate-y-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-left-0 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-top-0">
        <DialogTitle className="sr-only">Mobile Navigation</DialogTitle>
        <div className="flex flex-col space-y-4 py-4">
          <div className="font-semibold mb-4">Team Menu</div>
          <nav className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 ${isActive(`/${teamId}/dashboard`) ? "bg-[#2E86DE]/10 text-[#2E86DE]" : ""}`}
              asChild
              onClick={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
            >
              <Link href={`/teams/${teamId}/settings`}>
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>

          </nav>
        </div>
      </DialogContent>
    </Dialog>
  );
}
