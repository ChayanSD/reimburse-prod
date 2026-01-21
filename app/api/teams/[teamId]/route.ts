import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { can, getTeamMember } from "@/lib/permissions";

const updateTeamSchema = z.object({
  name: z.string().min(3).optional(),
  default_currency: z.string().length(3).optional(),
});

// GET /api/teams/[teamId] - Get team details
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await context.params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tid = parseInt(teamId);
  if (isNaN(tid)) {
    return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
  }

  const member = await getTeamMember(session.id, tid);
  if (!member) {
    return NextResponse.json({ error: "Team not found or access denied" }, { status: 404 });
  }

  // Everyone in team can view team details? Yes, usually.
  
  return NextResponse.json({ team: member.team, role: member.role });
}

// PATCH /api/teams/[teamId] - Update team settings
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await context.params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tid = parseInt(teamId);
  if (isNaN(tid)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const member = await getTeamMember(session.id, tid);
  if (!member || !can(member.role, "manage_team")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, default_currency } = updateTeamSchema.parse(body);

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (default_currency !== undefined) updateData.defaultCurrency = default_currency;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const updatedTeam = await prisma.team.update({
      where: { id: tid },
      data: updateData,
    });

    return NextResponse.json({ team: updatedTeam });
  } catch (error: any) {
    console.error("PATCH /api/teams/[teamId] error:", error);
    return NextResponse.json({ 
      error: "Failed to update team",
      details: error.message || String(error)
    }, { status: 500 });
  }
}

// DELETE /api/teams/[teamId] - Delete team
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await context.params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tid = parseInt(teamId);
  if (isNaN(tid)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const member = await getTeamMember(session.id, tid);
  // Only OWNER can delete
  if (!member || member.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.team.delete({
    where: { id: tid },
  });

  return NextResponse.json({ success: true });
}
