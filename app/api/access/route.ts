import { NextResponse } from "next/server";
import { z } from "zod";
import { hasPurchase, recordPurchase } from "@/lib/db";
import { ACCESS_COOKIE_NAME, getSigningSecret, signAccessToken } from "@/lib/lemonsqueezy";

const unlockSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = unlockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Provide a valid purchase email." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();

    if (!hasPurchase(email)) {
      if (process.env.NODE_ENV !== "production" && email.endsWith("@example.com")) {
        recordPurchase(email, "manual");
      } else {
        return NextResponse.json(
          {
            error: "No active purchase found for this email. Complete checkout first, then try again.",
          },
          { status: 403 },
        );
      }
    }

    const token = signAccessToken(email, getSigningSecret());
    const response = NextResponse.json({
      success: true,
      message: "Access verified. Dashboard unlocked.",
    });

    response.cookies.set({
      name: ACCESS_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Failed to process unlock request" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    path: "/",
    expires: new Date(0),
  });
  return response;
}
