import { addMinutes, isAfter, parseISO } from "date-fns";
import {
  formatUtcForTimezone,
  getLocalSlot,
  isRangeInsideWindow,
  parseClockToMinutes,
} from "@/lib/timezone-calculator";
import type {
  MeetingSuggestion,
  MemberImpact,
  OptimizationResult,
  OptimizeMeetingInput,
  Team,
  TeamMember,
} from "@/lib/types";

function calculateMemberImpact(member: TeamMember, slotStartUtc: Date, durationMinutes: number): MemberImpact {
  const local = getLocalSlot(slotStartUtc, durationMinutes, member.timezone);
  const workStart = parseClockToMinutes(member.workStart);
  const workEnd = parseClockToMinutes(member.workEnd);
  const preferredStart = parseClockToMinutes(member.preferredStart);
  const preferredEnd = parseClockToMinutes(member.preferredEnd);

  const dayAllowed = member.availableDays.includes(local.weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6);
  const inWorkHours = isRangeInsideWindow(local.startMinute, local.endMinute, workStart, workEnd);
  const inPreferredWindow = isRangeInsideWindow(local.startMinute, local.endMinute, preferredStart, preferredEnd);

  let availability: MemberImpact["availability"] = "outside_hours";
  let inconvenienceScore = 75;

  if (!dayAllowed) {
    availability = "unavailable_day";
    inconvenienceScore = 100;
  } else if (inPreferredWindow) {
    availability = "ideal";
    inconvenienceScore = Math.max(4, 18 - member.flexibility * 2);
  } else if (inWorkHours) {
    availability = "acceptable";
    inconvenienceScore = Math.max(15, 46 - member.flexibility * 3);
  } else {
    availability = "outside_hours";
    inconvenienceScore = Math.min(100, 78 + (5 - member.flexibility) * 4);
  }

  return {
    memberId: member.id,
    memberName: member.name,
    timezone: member.timezone,
    localStart: local.startLabel,
    localEnd: local.endLabel,
    availability,
    inconvenienceScore,
  };
}

function toAttendanceWeight(availability: MemberImpact["availability"]): number {
  if (availability === "ideal") {
    return 1;
  }

  if (availability === "acceptable") {
    return 0.85;
  }

  if (availability === "outside_hours") {
    return 0.35;
  }

  return 0;
}

function buildRationale(impacts: MemberImpact[]): string {
  const ideal = impacts.filter((item) => item.availability === "ideal").length;
  const acceptable = impacts.filter((item) => item.availability === "acceptable").length;
  const outside = impacts.filter((item) => item.availability === "outside_hours").length;
  const unavailable = impacts.filter((item) => item.availability === "unavailable_day").length;

  if (outside === 0 && unavailable === 0) {
    return `${ideal} ideal and ${acceptable} acceptable local-time fits; no one is outside working hours.`;
  }

  if (unavailable > 0) {
    return `${ideal} ideal, ${acceptable} acceptable, ${outside} outside-hours, ${unavailable} unavailable-day impacts.`;
  }

  return `${ideal} ideal and ${acceptable} acceptable fits, with ${outside} outside-hours tradeoffs.`;
}

function scoreCandidate(slotStartUtc: Date, durationMinutes: number, team: Team): MeetingSuggestion {
  const impacts = team.members.map((member) => calculateMemberImpact(member, slotStartUtc, durationMinutes));

  const attendanceWeight = impacts.reduce((acc, impact) => acc + toAttendanceWeight(impact.availability), 0);
  const averageAttendance = attendanceWeight / Math.max(impacts.length, 1);

  const totalInconvenience = impacts.reduce((acc, impact) => acc + impact.inconvenienceScore, 0);
  const averageInconvenience = totalInconvenience / Math.max(impacts.length, 1);

  const score = averageAttendance * 75 + (100 - averageInconvenience) * 0.25;

  return {
    startsAtUtc: slotStartUtc.toISOString(),
    endsAtUtc: addMinutes(slotStartUtc, durationMinutes).toISOString(),
    score: Number(score.toFixed(2)),
    expectedAttendancePercent: Number((averageAttendance * 100).toFixed(1)),
    averageInconvenience: Number(averageInconvenience.toFixed(1)),
    impacts,
    rationale: buildRationale(impacts),
  };
}

function removeNearDuplicates(suggestions: MeetingSuggestion[]): MeetingSuggestion[] {
  const selected: MeetingSuggestion[] = [];

  for (const candidate of suggestions) {
    const start = new Date(candidate.startsAtUtc).getTime();
    const overlapsExisting = selected.some((item) => {
      const itemStart = new Date(item.startsAtUtc).getTime();
      const diffMinutes = Math.abs(start - itemStart) / (60 * 1000);
      return diffMinutes < 90;
    });

    if (!overlapsExisting) {
      selected.push(candidate);
    }

    if (selected.length >= 6) {
      break;
    }
  }

  return selected;
}

export function optimizeMeetingTimes(team: Team, input: OptimizeMeetingInput): OptimizationResult {
  const startWindowUtc = parseISO(`${input.dateStart}T00:00:00.000Z`);
  const endWindowUtc = parseISO(`${input.dateEnd}T23:30:00.000Z`);

  const candidateScores: MeetingSuggestion[] = [];

  let cursor = startWindowUtc;
  while (!isAfter(cursor, endWindowUtc)) {
    candidateScores.push(scoreCandidate(cursor, input.durationMinutes, team));
    cursor = addMinutes(cursor, input.granularityMinutes);
  }

  const sorted = candidateScores
    .filter((candidate) => candidate.expectedAttendancePercent >= 45)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.averageInconvenience - b.averageInconvenience;
    });

  return {
    bestSuggestions: removeNearDuplicates(sorted),
    scannedCandidates: candidateScores.length,
    generatedAt: new Date().toISOString(),
  };
}

export function summarizeSuggestionForTeamZones(suggestion: MeetingSuggestion, team: Team): string {
  const teamExamples = team.members
    .slice(0, 3)
    .map((member) => `${member.name}: ${formatUtcForTimezone(new Date(suggestion.startsAtUtc), member.timezone)}`)
    .join(" | ");

  return teamExamples;
}
