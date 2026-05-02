"use client";

import type { TeamMember, Weekday } from "@/lib/types";

type AvailabilityGridProps = {
  member: TeamMember;
  onChange: (member: TeamMember) => void;
};

const WEEKDAYS: Array<{ label: string; value: Weekday }> = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function AvailabilityGrid({ member, onChange }: AvailabilityGridProps) {
  const toggleDay = (day: Weekday) => {
    const exists = member.availableDays.includes(day);
    const nextDays = exists ? member.availableDays.filter((value) => value !== day) : [...member.availableDays, day].sort();
    onChange({ ...member, availableDays: nextDays as Weekday[] });
  };

  return (
    <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/80 p-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Available Days</p>
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((day) => {
            const active = member.availableDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`rounded-md border px-2 py-2 text-xs font-medium transition ${
                  active
                    ? "border-cyan-500 bg-cyan-500/20 text-cyan-200"
                    : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          Work Day Starts
          <input
            type="time"
            value={member.workStart}
            onChange={(event) => onChange({ ...member, workStart: event.target.value })}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          Work Day Ends
          <input
            type="time"
            value={member.workEnd}
            onChange={(event) => onChange({ ...member, workEnd: event.target.value })}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          Preferred Start
          <input
            type="time"
            value={member.preferredStart}
            onChange={(event) => onChange({ ...member, preferredStart: event.target.value })}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          Preferred End
          <input
            type="time"
            value={member.preferredEnd}
            onChange={(event) => onChange({ ...member, preferredEnd: event.target.value })}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
          />
        </label>
      </div>

      <label className="block space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
        Flexibility ({member.flexibility}/5)
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={member.flexibility}
          onChange={(event) => onChange({ ...member, flexibility: Number.parseInt(event.target.value, 10) })}
          className="w-full accent-cyan-400"
        />
      </label>
    </div>
  );
}
