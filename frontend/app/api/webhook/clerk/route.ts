import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const eventType = payload.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const user = payload.data;
    const email =
      user.email_addresses?.find(
        (e: { id: string }) => e.id === user.primary_email_address_id
      )?.email_address || "";

    try {
      const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || "User";
      await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user.id,
          email,
          name,
          avatar_url: user.image_url || "",
          auth_provider: "clerk",
          signup_source: "web",
        }),
      });
    } catch {
      // Log but don't fail the webhook
    }
  }

  return NextResponse.json({ received: true });
}
