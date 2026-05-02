"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, LogOut } from "lucide-react";
import { MeetingOptimizer } from "@/components/meeting-optimizer";
import { TeamMemberForm } from "@/components/team-member-form";
import type { Team } from "@/lib/types";

type DashboardShellProps = {
  hasAccess: boolean;
  unlockedEmail: string | null;
};

export function DashboardShell({ hasAccess, unlockedEmail }: DashboardShellProps) {
  const [latestTeam, setLatestTeam] = useState<Team | null>(null);
  const [email, setEmail] = useState(unlockedEmail ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const unlock = async () => {
    setUnlocking(true);
    setStatus(null);

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { error?: string; success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Unable to unlock dashboard");
      }

      setStatus(payload.message || "Access granted. Reloading dashboard...");
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unknown unlock error");
    } finally {
      setUnlocking(false);
    }
  };

  const clearAccess = async () => {
    await fetch("/api/access", { method: "DELETE" });
    window.location.reload();
  };

  if (!hasAccess) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-10 md:px-8 md:pt-14">
        <Link href="/" className="text-sm text-zinc-300 underline decoration-zinc-700 underline-offset-4">
          Back to landing page
        </Link>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-8">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-zinc-100">
            <Lock className="h-6 w-6 text-cyan-300" />
            Dashboard Locked
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            This optimizer is available to paying subscribers. Complete checkout first, then unlock with the same email used
            in Stripe.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
              className="rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"
            >
              Buy Access For $8/month
            </a>
            <Link
              href="/"
              className="rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500"
            >
              Review product details
            </Link>
          </div>

          <div className="mt-7 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
            <h2 className="text-sm font-semibold text-zinc-100">Unlock Dashboard</h2>
            <p className="mt-1 text-sm text-zinc-300">Enter the checkout email so we can verify your active purchase.</p>
            <label className="mt-4 block space-y-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
              Purchase Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={unlock}
              disabled={unlocking || !email}
              className="mt-4 rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {unlocking ? "Verifying..." : "Unlock Tool"}
            </button>
            {status ? <p className="mt-3 text-sm text-zinc-300">{status}</p> : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 pb-20 pt-10 md:px-8 md:pt-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 md:text-3xl">Remote Team Optimizer Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-300">
            Configure your team once, then generate ranked meeting slots for upcoming planning cycles.
          </p>
          {unlockedEmail ? <p className="mt-1 text-xs text-zinc-400">Unlocked as {unlockedEmail}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500"
          >
            Landing Page
          </Link>
          <button
            type="button"
            onClick={clearAccess}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500"
          >
            <LogOut className="h-4 w-4" />
            Lock
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <TeamMemberForm onTeamSaved={(team) => setLatestTeam(team)} />
        <MeetingOptimizer latestTeam={latestTeam} />
      </div>
    </main>
  );
}
