"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, UsersRound } from "lucide-react";
import { AvailabilityGrid } from "@/components/availability-grid";
import { TimezoneSelector } from "@/components/timezone-selector";
import type { Team, TeamMember } from "@/lib/types";

type TeamMemberFormProps = {
  onTeamSaved: (team: Team) => void;
};

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `member_${Math.random().toString(36).slice(2, 10)}`;
}

function createDefaultMember(name = ""): TeamMember {
  return {
    id: createId(),
    name,
    timezone: "UTC",
    email: "",
    workStart: "09:00",
    workEnd: "17:00",
    preferredStart: "10:00",
    preferredEnd: "16:00",
    availableDays: [1, 2, 3, 4, 5],
    flexibility: 3,
  };
}

export function TeamMemberForm({ onTeamSaved }: TeamMemberFormProps) {
  const [teamName, setTeamName] = useState("Global Product Team");
  const [members, setMembers] = useState<TeamMember[]>([
    createDefaultMember("Ava"),
    { ...createDefaultMember("Lucas"), timezone: "America/New_York" },
    { ...createDefaultMember("Priya"), timezone: "Asia/Kolkata" },
  ]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return teamName.trim().length > 2 && members.length > 1 && members.every((member) => member.name.trim().length > 1);
  }, [teamName, members]);

  const updateMember = (memberId: string, nextMember: TeamMember) => {
    setMembers((current) => current.map((member) => (member.id === memberId ? nextMember : member)));
  };

  const addMember = () => {
    setMembers((current) => [...current, createDefaultMember()]);
  };

  const removeMember = (memberId: string) => {
    setMembers((current) => current.filter((member) => member.id !== memberId));
  };

  const saveTeam = async () => {
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: teamName,
          members,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to save team");
      }

      const payload = (await response.json()) as { team: Team };
      onTeamSaved(payload.team);
      setStatus(`Saved "${payload.team.name}" with ${payload.team.members.length} members.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setStatus(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-[0_0_0_1px_rgba(22,27,34,0.4)]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
          <UsersRound className="h-5 w-5 text-cyan-300" />
          Team Setup
        </h2>
        <button
          type="button"
          onClick={addMember}
          className="inline-flex items-center gap-2 rounded-md border border-cyan-500/60 bg-cyan-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-200 transition hover:bg-cyan-500/20"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      <label className="block space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
        Team Name
        <input
          value={teamName}
          onChange={(event) => setTeamName(event.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
          placeholder="Design + Engineering"
        />
      </label>

      <div className="space-y-4">
        {members.map((member, index) => (
          <article key={member.id} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
                Member Name
                <input
                  value={member.name}
                  onChange={(event) => updateMember(member.id, { ...member, name: event.target.value })}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
                  placeholder={`Member ${index + 1}`}
                />
              </label>

              <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
                Email (Optional)
                <input
                  value={member.email || ""}
                  onChange={(event) => updateMember(member.id, { ...member, email: event.target.value })}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
                  placeholder="person@company.com"
                />
              </label>

              <button
                type="button"
                onClick={() => removeMember(member.id)}
                disabled={members.length <= 2}
                className="self-end rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-300 transition hover:border-rose-400 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Remove ${member.name || "member"}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <TimezoneSelector
              value={member.timezone}
              onChange={(timezone) => updateMember(member.id, { ...member, timezone })}
              label="Timezone"
              id={`tz_${member.id}`}
            />

            <AvailabilityGrid member={member} onChange={(next) => updateMember(member.id, next)} />
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canSubmit || saving}
          onClick={saveTeam}
          className="rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving team..." : "Save Team"}
        </button>

        {status ? <p className="text-sm text-zinc-300">{status}</p> : null}
      </div>
    </section>
  );
}
