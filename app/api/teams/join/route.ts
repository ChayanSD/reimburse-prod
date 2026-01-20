import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  
  try {
    const { token } = await req.json();

    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const invite = await prisma.teamInvite.findUnique({
        where: { token },
        include: { team: true }
    });

    if (!invite) {
        return NextResponse.json({ error: "Invalid invitation" }, { status: 404 });
    }

    if (invite.status !== "pending") {
        return NextResponse.json({ error: "Invitation already accepted or expired" }, { status: 400 });
    }

    if (new Date() > invite.expiresAt) {
        return NextResponse.json({ error: "Invitation expired" }, { status: 400 });
    }

    // Require auth
    if (!session) {
        return NextResponse.json({ error: "Authentication required", redirectTo: `/auth/login?callbackUrl=/join-team?token=${token}` }, { status: 401 });
    }

    // Check if user matches invite email? 
    // Usually strict security requires email match, but for convenience sometimes any user can accept if they have the link. 
    // Let's enforce email match if we want strictness, OR allow any signed-in user to accept it (adding them to the team).
    // Given the previous requirement "user can get link token signup then join", it implies the token carries the permission.
    // Let's verify if the logged-in user is already a member first.
    
    const existingMember = await prisma.teamMember.findUnique({
        where: {
            teamId_userId: {
                teamId: invite.teamId,
                userId: session.id
            }
        }
    });

    if (existingMember) {
        // Just consume the invite if they are already in? Or error?
        // Let's transparently accept update stats and return success
        await prisma.teamInvite.update({
            where: { id: invite.id },
            data: { status: "accepted" }
        });
        return NextResponse.json({ teamId: invite.teamId, message: "You are already a member of this team" });
    }

    // Add user to team
    await prisma.$transaction([
        prisma.teamMember.create({
            data: {
                teamId: invite.teamId,
                userId: session.id,
                role: invite.role, // Use role from invite
            }
        }),
        prisma.teamInvite.update({
            where: { id: invite.id },
            data: { status: "accepted" }
        })
    ]);

    return NextResponse.json({ teamId: invite.teamId });

  } catch (error) {
    console.error("Join team error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    // Validate token details for UI before accepting
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const invite = await prisma.teamInvite.findUnique({
        where: { token },
        include: { 
            team: { select: { name: true } } 
        }
    });

    if (!invite) return NextResponse.json({ error: "Invalid invitation" }, { status: 404 });
    if (invite.status !== "pending") return NextResponse.json({ error: "Invitation no longer valid" }, { status: 400 });
    if (new Date() > invite.expiresAt) return NextResponse.json({ error: "Invitation expired" }, { status: 400 });

    return NextResponse.json({ 
        teamName: invite.team.name,
        inviterEmail: invite.email,
        role: invite.role 
    });
}
