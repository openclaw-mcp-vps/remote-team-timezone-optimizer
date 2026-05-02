import { NextResponse } from "next/server";
import { z } from "zod";
import { createTeam, listTeams } from "@/lib/db";
import type { TeamMember } from "@/lib/types";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);

const teamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  timezone: z.string().min(3),
  workStart: timeSchema,
  workEnd: timeSchema,
  preferredStart: timeSchema,
  preferredEnd: timeSchema,
  availableDays: z.array(z.number().int().min(0).max(6)).min(1),
  flexibility: z.number().int().min(1).max(5),
});

const teamSchema = z.object({
  name: z.string().min(3),
  members: z.array(teamMemberSchema).min(2),
});

export async function GET() {
  return NextResponse.json({ teams: listTeams() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = teamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid team payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const team = createTeam({
      name: parsed.data.name,
      members: parsed.data.members.map((member) => ({
        ...member,
        availableDays: member.availableDays as TeamMember["availableDays"],
      })),
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
