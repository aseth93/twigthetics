import { NextResponse } from "next/server";

const applicationEndpoint =
  process.env.NEXT_PUBLIC_APPLICATION_ENDPOINT?.trim() || "";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | Record<string, string>
    | null;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { error: "Invalid application payload." },
      { status: 400 },
    );
  }

  if (!applicationEndpoint) {
    return NextResponse.json(
      {
        error:
          "Application submissions are not connected yet. Add NEXT_PUBLIC_APPLICATION_ENDPOINT to activate the form.",
      },
      { status: 503 },
    );
  }

  try {
    const upstreamResponse = await fetch(applicationEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        source: "twigthetics-site",
        submittedAt: new Date().toISOString(),
        ...payload,
      }),
      cache: "no-store",
    });

    if (!upstreamResponse.ok) {
      const message = await upstreamResponse.text();

      return NextResponse.json(
        {
          error:
            message.slice(0, 180) ||
            "The application endpoint rejected the submission.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the application endpoint right now." },
      { status: 502 },
    );
  }
}
