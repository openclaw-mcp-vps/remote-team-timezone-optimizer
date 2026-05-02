import { differenceInCalendarDays, parseISO } from "date-fns";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getTeamById } from "@/lib/db";
import { optimizeMeetingTimes } from "@/lib/meeting-optimizer";

const optimizeSchema = z.object({
  teamId: z.string().min(1),
  durationMinutes: z.number().int().min(15).max(180),
  dateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  granularityMinutes: z.number().int().min(15).max(120),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = optimizeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid optimization input",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { teamId, dateStart, dateEnd } = parsed.data;
    const team = getTeamById(teamId);

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const days = differenceInCalendarDays(parseISO(`${dateEnd}T00:00:00Z`), parseISO(`${dateStart}T00:00:00Z`));

    if (days < 0) {
      return NextResponse.json({ error: "dateEnd must be after dateStart" }, { status: 400 });
    }

    if (days > 45) {
      return NextResponse.json({ error: "Date range is too large. Limit to 45 days." }, { status: 400 });
    }

    const result = optimizeMeetingTimes(team, parsed.data);

    return NextResponse.json({ team, result });
  } catch {
    return NextResponse.json({ error: "Failed to optimize meeting schedule" }, { status: 500 });
  }
}
