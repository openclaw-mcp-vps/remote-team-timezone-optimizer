"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { Clock3, Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OptimizationResult, Team } from "@/lib/types";

type MeetingOptimizerProps = {
  latestTeam: Team | null;
};

type OptimizeResponse = {
  team: Team;
  result: OptimizationResult;
};

function toDateInput(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function MeetingOptimizer({ latestTeam }: MeetingOptimizerProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(latestTeam?.id ?? "");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [dateStart, setDateStart] = useState(toDateInput(new Date()));
  const [dateEnd, setDateEnd] = useState(toDateInput(addDays(new Date(), 10)));
  const [granularityMinutes, setGranularityMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizeResponse | null>(null);

  useEffect(() => {
    const loadTeams = async () => {
      const response = await fetch("/api/teams", { method: "GET" });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { teams: Team[] };
      setTeams(payload.teams);
      if (!selectedTeamId && payload.teams.length > 0) {
        setSelectedTeamId(payload.teams[0].id);
      }
    };

    loadTeams().catch(() => {
      setError("Could not load teams.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!latestTeam) {
      return;
    }

    setTeams((current) => {
      const exists = current.some((team) => team.id === latestTeam.id);
      if (exists) {
        return current.map((team) => (team.id === latestTeam.id ? latestTeam : team));
      }
      return [latestTeam, ...current];
    });
    setSelectedTeamId(latestTeam.id);
  }, [latestTeam]);

  const selectedTeam = useMemo(() => teams.find((team) => team.id === selectedTeamId) ?? null, [selectedTeamId, teams]);

  const optimize = async () => {
    if (!selectedTeamId) {
      setError("Select a team first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/meetings/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: selectedTeamId,
          durationMinutes,
          dateStart,
          dateEnd,
          granularityMinutes,
        }),
      });

      const payload = (await response.json()) as OptimizeResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to optimize");
      }

      setResult(payload);
    } catch (requestError) {
      setResult(null);
      setError(requestError instanceof Error ? requestError.message : "Unknown optimization error.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result?.result.bestSuggestions[0]?.impacts.map((impact) => ({
    member: impact.memberName,
    inconvenience: impact.inconvenienceScore,
  })) ?? [];

  return (
    <section className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
        <Sparkles className="h-5 w-5 text-emerald-300" />
        Meeting Optimizer
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          Team
          <select
            value={selectedTeamId}
            onChange={(event) => setSelectedTeamId(event.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
          >
            {teams.length === 0 ? <option value="">No teams yet</option> : null}
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          Duration
          <select
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number.parseInt(event.target.value, 10))}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
          >
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
          </select>
        </label>

        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          From
          <input
            type="date"
            value={dateStart}
            onChange={(event) => setDateStart(event.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          To
          <input
            type="date"
            value={dateEnd}
            onChange={(event) => setDateEnd(event.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
          />
        </label>

        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          Scan Step
          <select
            value={granularityMinutes}
            onChange={(event) => setGranularityMinutes(Number.parseInt(event.target.value, 10))}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
          >
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={60}>60 min</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={optimize}
          disabled={loading || !selectedTeam}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Clock3 className="h-4 w-4" />
          {loading ? "Analyzing timezones..." : "Find Best Meeting Times"}
        </button>
        {error ? <span className="text-sm text-rose-300">{error}</span> : null}
      </div>

      {result ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Scanned <strong>{result.result.scannedCandidates}</strong> candidate slots for {result.team.members.length} members.
          </p>

          <div className="grid gap-3">
            {result.result.bestSuggestions.map((suggestion, index) => (
              <article key={suggestion.startsAtUtc} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Option {index + 1}: {new Date(suggestion.startsAtUtc).toUTCString()}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-200">Score {suggestion.score}</span>
                    <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-cyan-200">Attendance {suggestion.expectedAttendancePercent}%</span>
                    <span className="rounded-full bg-amber-500/15 px-2 py-1 text-amber-200">
                      Inconvenience {suggestion.averageInconvenience}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{suggestion.rationale}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {suggestion.impacts.map((impact) => (
                    <div key={impact.memberId} className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
                      <p className="font-semibold text-zinc-100">{impact.memberName}</p>
                      <p>{impact.timezone}</p>
                      <p>{impact.localStart} to {impact.localEnd}</p>
                      <p className="uppercase tracking-wide text-zinc-400">{impact.availability.replace("_", " ")}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {chartData.length > 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-100">Top Option: Inconvenience by Member</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="member" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#f4f4f5" }}
                    />
                    <Bar dataKey="inconvenience" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
