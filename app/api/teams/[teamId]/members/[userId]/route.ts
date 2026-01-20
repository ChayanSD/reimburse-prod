import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { can, getTeamMember } from "@/lib/permissions";

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

// PATCH - Update role
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ teamId: string; userId: string }> }
) {
  const { teamId, userId } = await context.params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tid = parseInt(teamId);
  const targetUserId = parseInt(userId);
  if (isNaN(tid) || isNaN(targetUserId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const currentUser = await getTeamMember(session.id, tid);
  if (!currentUser || !can(currentUser.role, "update_member_role")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Prevent modifying own role to lock oneself out? or Owner cannot become member unless they transfer ownership first?
  // For now, simplify: Owner cannot change their own role here (since they are OWNER).
  if (currentUser.userId === targetUserId) {
     return NextResponse.json({ error: "Cannot change your own role here" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { role } = updateRoleSchema.parse(body);

    const targetMember = await getTeamMember(targetUserId, tid);
    if (!targetMember) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    // Cannot change OWNER via this route
    if (targetMember.role === "OWNER") {
         return NextResponse.json({ error: "Cannot modify Owner role" }, { status: 403 });
    }

    const updated = await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId: tid,
          userId: targetUserId,
        },
      },
      data: { role },
    });

    return NextResponse.json({ member: updated });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// DELETE - Remove member
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ teamId: string; userId: string }> }
) {
  const { teamId, userId } = await context.params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tid = parseInt(teamId);
  const targetUserId = parseInt(userId);
  if (isNaN(tid) || isNaN(targetUserId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const currentUser = await getTeamMember(session.id, tid);
  if (!currentUser || !can(currentUser.role, "remove_member")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (currentUser.userId === targetUserId) {
    return NextResponse.json({ error: "Cannot remove yourself here. Leave team instead." }, { status: 400 });
  }

  const targetMember = await getTeamMember(targetUserId, tid);
  if (!targetMember) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  if (targetMember.role === "OWNER") {
     return NextResponse.json({ error: "Cannot remove Owner" }, { status: 403 });
  }

  await prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId: tid,
        userId: targetUserId,
      },
    },
  });

  return NextResponse.json({ success: true });
}
