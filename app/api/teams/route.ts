import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

const createTeamSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.teamMember.findMany({
    where: { userId: session.id },
    include: { team: true },
  });

  const teams = members.map((m) => ({
    ...m.team,
    role: m.role,
    joinedAt: m.joinedAt,
  }));

  return NextResponse.json({ teams });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check subscription status
  // We need to fetch the full user to check subscription if session doesn't have it fully fresh
  const user = await prisma.authUser.findUnique({
    where: { id: session.id },
    select: { subscriptionTier: true },
  });

  if (!user || ['free', 'pro'].includes(user.subscriptionTier)) {
     return NextResponse.json({ error: "Premium subscription required to create teams" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, slug } = createTeamSchema.parse(body);

    const existingTeam = await prisma.team.findUnique({
      where: { slug },
    });

    if (existingTeam) {
      return NextResponse.json({ error: "Team with this identifier already exists" }, { status: 409 });
    }

    // Transaction to create Team and Member(Owner)
    const team = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name,
          slug,
          ownerId: session.id,
        },
      });

      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId: session.id,
          role: "OWNER",
        },
      });

      return newTeam;
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
