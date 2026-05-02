export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type TeamMember = {
  id: string;
  name: string;
  email?: string;
  timezone: string;
  workStart: string; // HH:mm
  workEnd: string; // HH:mm
  preferredStart: string; // HH:mm
  preferredEnd: string; // HH:mm
  availableDays: Weekday[];
  flexibility: number; // 1..5 where 5 is very flexible
};

export type Team = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
};

export type OptimizeMeetingInput = {
  teamId: string;
  durationMinutes: number;
  dateStart: string; // YYYY-MM-DD
  dateEnd: string; // YYYY-MM-DD
  granularityMinutes: number;
};

export type MemberImpact = {
  memberId: string;
  memberName: string;
  timezone: string;
  localStart: string;
  localEnd: string;
  availability: "ideal" | "acceptable" | "outside_hours" | "unavailable_day";
  inconvenienceScore: number; // 0..100
};

export type MeetingSuggestion = {
  startsAtUtc: string;
  endsAtUtc: string;
  score: number;
  expectedAttendancePercent: number;
  averageInconvenience: number;
  impacts: MemberImpact[];
  rationale: string;
};

export type OptimizationResult = {
  bestSuggestions: MeetingSuggestion[];
  scannedCandidates: number;
  generatedAt: string;
};
