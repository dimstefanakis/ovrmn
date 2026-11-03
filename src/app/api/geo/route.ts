import { visitorCountry } from "@/lib/pt-waitlist";

// Per request: the answer depends on who is asking. Nothing is logged or stored.
export const dynamic = "force-dynamic";

/** The country code the signup form should preselect, from the visitor's IP (Vercel). */
export function GET(request: Request) {
  return Response.json(
    { country: visitorCountry(request.headers) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
