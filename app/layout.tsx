import type { Metadata } from "next";
import { Fira_Code, Space_Grotesk, Geist } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Remote Team Timezone Optimizer | Find Global Meeting Times Fast",
  description:
    "Suggest the best meeting windows across global timezones by balancing attendance probability and local-time convenience.",
  keywords: [
    "timezone meeting planner",
    "remote team scheduling",
    "global meeting optimizer",
    "distributed team coordination",
  ],
  openGraph: {
    title: "Remote Team Timezone Optimizer",
    description:
      "Cut timezone scheduling waste by ranking the best meeting slots for distributed teams.",
    type: "website",
    url: "https://remote-team-timezone-optimizer.com",
    siteName: "Remote Team Timezone Optimizer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remote Team Timezone Optimizer",
    description: "Find meeting times that work across timezones without endless back-and-forth.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body className={`${spaceGrotesk.variable} ${firaCode.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
