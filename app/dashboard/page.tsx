import { cookies } from "next/headers";
import { DashboardShell } from "@/components/dashboard-shell";
import { ACCESS_COOKIE_NAME, getSigningSecret, verifyAccessToken } from "@/lib/lemonsqueezy";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const parsed = verifyAccessToken(token, getSigningSecret());

  return <DashboardShell hasAccess={Boolean(parsed)} unlockedEmail={parsed?.email ?? null} />;
}
