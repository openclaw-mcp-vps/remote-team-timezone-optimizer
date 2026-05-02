import Link from "next/link";
import { ArrowRight, CalendarClock, Globe2, TimerReset, Zap } from "lucide-react";

const stats = [
  { label: "Hours saved weekly", value: "5+" },
  { label: "Timezone combinations analyzed", value: "10,000+" },
  { label: "Average attendance improvement", value: "24%" },
];

const faqs = [
  {
    question: "How does the optimizer choose a meeting time?",
    answer:
      "Each candidate slot is scored against every teammate's local working hours, preferred windows, and flexibility settings. You get ranked options with attendance and inconvenience metrics.",
  },
  {
    question: "Do team members need accounts?",
    answer:
      "No. One manager account can set up the team, define each member's timezone and constraints, and generate schedules that can be shared in Slack or email.",
  },
  {
    question: "Can I update schedules as the team changes?",
    answer:
      "Yes. Add or edit members anytime, then rerun optimization for the next sprint, quarterly planning, or recurring syncs.",
  },
  {
    question: "How does billing work?",
    answer:
      "It is a simple monthly subscription at $8/month through Stripe hosted checkout. After purchase, unlock access with the purchase email on the dashboard.",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 md:px-8 md:pt-16">
      <header className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-7 shadow-[0_20px_70px_rgba(0,0,0,0.35)] md:p-12">
        <p className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Team Coordination
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-zinc-50 md:text-6xl">
          Find optimal meeting times across global timezones
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 md:text-lg">
          Remote Team Timezone Optimizer analyzes team locations, availability, and meeting constraints to suggest slots that
          minimize inconvenience and maximize attendance. Replace timezone guesswork with ranked, data-backed options.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"
          >
            Start For $8/Month
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500"
          >
            Open Dashboard
            <CalendarClock className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-3xl font-semibold text-emerald-300">{stat.value}</p>
              <p className="mt-1 text-sm text-zinc-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="mt-12 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <TimerReset className="h-5 w-5 text-rose-300" />
          <h2 className="mt-3 text-lg font-semibold text-zinc-100">The Problem</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Remote managers lose more than five hours each week in timezone back-and-forth. Calendar invites bounce between
            regions, and someone is always waking up early or joining at midnight.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <Globe2 className="h-5 w-5 text-cyan-300" />
          <h2 className="mt-3 text-lg font-semibold text-zinc-100">The Solution</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Model each teammate's working hours, preferred windows, and flexibility. The optimizer scans hundreds of slots and
            returns the best options with transparent tradeoffs.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <Zap className="h-5 w-5 text-amber-300" />
          <h2 className="mt-3 text-lg font-semibold text-zinc-100">The Outcome</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Schedule faster, reduce missed attendance, and avoid recurring resentment from unfair meeting times. Your team gains
            consistency without endless scheduling threads.
          </p>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-zinc-100">Simple Pricing</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">
          One plan for distributed teams that want better scheduling discipline. No seat math, no usage surprises.
        </p>
        <div className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-6 md:flex md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.15em] text-cyan-200">Remote Team Plan</p>
            <p className="mt-2 text-4xl font-semibold text-zinc-50">$8<span className="text-lg text-zinc-300">/month</span></p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-200">
              <li>Timezone-aware meeting optimization engine</li>
              <li>Team member constraints and preferences</li>
              <li>Ranked suggestions with attendance forecasts</li>
              <li>Cookie-based dashboard access after purchase</li>
            </ul>
          </div>
          <a
            href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 md:mt-0"
          >
            Buy With Stripe
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-zinc-100">FAQ</h2>
        <div className="mt-5 space-y-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <h3 className="text-sm font-semibold text-zinc-100">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
