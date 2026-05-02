"use client";

import { useMemo } from "react";

type TimezoneSelectorProps = {
  value: string;
  onChange: (timezone: string) => void;
  id?: string;
  label?: string;
};

const FALLBACK_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function TimezoneSelector({ value, onChange, id, label }: TimezoneSelectorProps) {
  const timezones = useMemo(() => {
    if (typeof Intl.supportedValuesOf === "function") {
      return Intl.supportedValuesOf("timeZone").slice().sort((a, b) => a.localeCompare(b));
    }
    return FALLBACK_TIMEZONES;
  }, []);

  return (
    <div className="space-y-2">
      {label ? <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-zinc-300">{label}</label> : null}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
      >
        {timezones.map((timezone) => (
          <option key={timezone} value={timezone}>
            {timezone}
          </option>
        ))}
      </select>
    </div>
  );
}
