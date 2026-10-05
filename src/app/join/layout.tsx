import type { Metadata } from "next";
import { MembershipShell } from "./shell";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ovrmn.com"),
  title: "OVRMN — Keep your coach",
  description: "Your personal trainer in iMessage. $29/month, renews monthly, cancel anytime.",
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
  alternates: { canonical: null },
  openGraph: {
    title: "OVRMN — Keep your coach",
    description: "Your personal trainer in iMessage. $29/month, renews monthly, cancel anytime.",
    siteName: "OVRMN",
    url: "https://www.ovrmn.com/join",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <MembershipShell>{children}</MembershipShell>;
}
