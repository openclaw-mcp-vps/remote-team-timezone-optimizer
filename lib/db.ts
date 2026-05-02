import "server-only";

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { Team, TeamMember } from "@/lib/types";

type PurchaseRecord = {
  email: string;
  purchasedAt: string;
  source: "stripe" | "manual";
};

type Store = {
  teams: Team[];
  purchases: PurchaseRecord[];
};

const STORE_PATH = join(process.cwd(), "data", "store.json");

function ensureStore(): void {
  const dir = dirname(STORE_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  if (!existsSync(STORE_PATH)) {
    const initial: Store = { teams: [], purchases: [] };
    writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

function readStore(): Store {
  ensureStore();
  const raw = readFileSync(STORE_PATH, "utf-8");
  return JSON.parse(raw) as Store;
}

function writeStore(store: Store): void {
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function normalizeMember(member: Omit<TeamMember, "id"> & { id?: string }): TeamMember {
  return {
    ...member,
    id: member.id ?? randomUUID(),
  };
}

export function listTeams(): Team[] {
  return readStore().teams;
}

export function getTeamById(teamId: string): Team | null {
  const store = readStore();
  return store.teams.find((team) => team.id === teamId) ?? null;
}

export function createTeam(input: { name: string; members: Array<Omit<TeamMember, "id"> & { id?: string }> }): Team {
  const now = new Date().toISOString();
  const team: Team = {
    id: randomUUID(),
    name: input.name,
    members: input.members.map(normalizeMember),
    createdAt: now,
    updatedAt: now,
  };

  const store = readStore();
  store.teams.push(team);
  writeStore(store);

  return team;
}

export function replaceTeam(teamId: string, input: { name: string; members: Array<Omit<TeamMember, "id"> & { id?: string }> }): Team | null {
  const store = readStore();
  const index = store.teams.findIndex((team) => team.id === teamId);
  if (index === -1) {
    return null;
  }

  const current = store.teams[index];
  const updated: Team = {
    ...current,
    name: input.name,
    members: input.members.map(normalizeMember),
    updatedAt: new Date().toISOString(),
  };

  store.teams[index] = updated;
  writeStore(store);

  return updated;
}

export function recordPurchase(email: string, source: "stripe" | "manual" = "stripe"): void {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return;
  }

  const store = readStore();
  const existing = store.purchases.find((entry) => entry.email === normalizedEmail);

  if (existing) {
    existing.purchasedAt = new Date().toISOString();
    existing.source = source;
  } else {
    store.purchases.push({
      email: normalizedEmail,
      purchasedAt: new Date().toISOString(),
      source,
    });
  }

  writeStore(store);
}

export function hasPurchase(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  const store = readStore();
  return store.purchases.some((entry) => entry.email === normalizedEmail);
}
