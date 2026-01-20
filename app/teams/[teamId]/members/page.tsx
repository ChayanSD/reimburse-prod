"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Adjust path
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"; // Adjust path
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // Adjust path
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";

interface Member {
  id: number;
  userId: number;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  joinedAt: string;
  user: {
      id: number;
      email: string;
      firstName: string | null;
      lastName: string | null;
  }
}

interface Invite {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  status: string;
}

export default function MembersPage() {
  const { teamId } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMembers(data.members);
      setInvites(data.invites || []);
    } catch (error) {
       console.error(error);
       toast.error("Failed to load members");
    } finally {
        setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await fetch(`/api/teams/${teamId}/members`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
          });
          
          if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || "Failed to invite");
          }

          toast.success("Member invited!");
          setIsInviteOpen(false);
          setInviteEmail("");
          fetchMembers(); // Refresh list
      } catch (error: unknown) {
          if (error instanceof Error) {
              toast.error(error.message);
          } else {
              toast.error("Failed to invite");
          }
      }
  };

  const handleRemove = async (userId: number) => {
      try {
          const res = await fetch(`/api/teams/${teamId}/members/${userId}`, {
              method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed");
          toast.success("Member removed");
          setMembers(members.filter(m => m.user.id !== userId));
      } catch (error) {
          console.error(error);
          toast.error("Failed to remove member");
      }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
      try {
           const res = await fetch(`/api/teams/${teamId}/members/${userId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: newRole }),
          });
          if (!res.ok) throw new Error("Failed");
          toast.success("Role updated");
          setMembers(members.map(m => m.user.id === userId ? { ...m, role: newRole as "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" } : m));
      } catch (error) {
          console.error(error);
          toast.error("Failed to update role");
      }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E86DE]"></div>
    </div>
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
                <p className="text-muted-foreground">Manage who has access to this workspace.</p>
            </div>
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-[#2E86DE] hover:bg-[#2E86DE]/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Invite Member
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>Add a new member to your team workspace.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div className="space-y-2">
                             <Label>Email Address</Label>
                             <Input 
                                type="email" 
                                value={inviteEmail} 
                                onChange={e => setInviteEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                required
                             />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="MEMBER">Member</SelectItem>
                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Admins can manage members and settings. Members can upload and view all receipts. Viewers can only view.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-[#2E86DE] hover:bg-[#2E86DE]/90">Send Invite</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[300px]">User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead className="text-right">Manage</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <TableRow key={member.id} className="group">
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">
                                        {member.user.firstName || 'User'} {member.user.lastName || ''}
                                    </span>
                                    <span className="text-sm text-muted-foreground">{member.user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {member.role === 'OWNER' ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#2E86DE]/10 text-[#2E86DE] border border-[#2E86DE]/20">
                                        Owner
                                    </span>
                                ) : (
                                    <Select 
                                        defaultValue={member.role} 
                                        onValueChange={(val) => handleRoleChange(member.user.id, val)}
                                    >
                                        <SelectTrigger className="w-[110px] h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                            <SelectItem value="MEMBER">Member</SelectItem>
                                            <SelectItem value="VIEWER">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {new Date(member.joinedAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </TableCell>
                            <TableCell className="text-right">
                                {member.role !== 'OWNER' && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to remove <strong>{member.user.email}</strong> from this team? 
                                                    They will immediately lose access to all team receipts and reports.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleRemove(member.user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    Remove Member
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        {invites.length > 0 && (
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Pending Invites</h3>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Sent</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invites.map((invite) => (
                                <TableRow key={invite.id}>
                                    <TableCell>{invite.email}</TableCell>
                                    <TableCell className="capitalize">{invite.role}</TableCell>
                                    <TableCell>{new Date(invite.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Pending
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}
    </div>
  );
}
