import { NextResponse } from "next/server";
import { getPortalViewer } from "@/lib/portal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPortalRuntime } from "@/lib/portal/env";

export async function POST(request: Request) {
  const viewer = await getPortalViewer();

  if (!viewer) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        body?: string;
        memberId?: string;
      }
    | null;

  const body = payload?.body?.trim();

  if (!body) {
    return NextResponse.json({ error: "Message body is required." }, { status: 400 });
  }

  const runtime = getPortalRuntime();

  if (!runtime.supabaseConfigured || viewer.mode === "demo") {
    return NextResponse.json({
      ok: true,
      message: {
        id: `demo-${Date.now()}`,
        body,
        createdAt: new Date().toISOString(),
        readAt: null,
        sender: viewer.profile,
        conversationId: payload?.memberId || viewer.profile.id,
      },
    });
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const memberId =
    viewer.profile.role === "coach_admin" ? payload?.memberId?.trim() : viewer.profile.id;

  if (!memberId) {
    return NextResponse.json(
      { error: "Choose a client before sending an admin message." },
      { status: 400 },
    );
  }

  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("member_id", memberId)
    .maybeSingle();

  let conversationId = existingConversation?.id as string | undefined;

  if (!conversationId) {
    const { data: insertedConversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        member_id: memberId,
        coach_id: viewer.profile.role === "coach_admin" ? viewer.profile.id : null,
      })
      .select("id")
      .single();

    if (conversationError || !insertedConversation) {
      return NextResponse.json(
        { error: "Unable to create a conversation thread." },
        { status: 500 },
      );
    }

    conversationId = insertedConversation.id;
  }

  const { data: insertedMessage, error: messageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: viewer.profile.id,
      body,
    })
    .select("id, body, created_at, read_at, conversation_id")
    .single();

  if (messageError || !insertedMessage) {
    return NextResponse.json({ error: "Unable to send the message." }, { status: 500 });
  }

  await supabase
    .from("conversations")
    .update({
      updated_at: new Date().toISOString(),
      coach_id: viewer.profile.role === "coach_admin" ? viewer.profile.id : null,
    })
    .eq("id", conversationId);

  return NextResponse.json({
    ok: true,
    message: {
      id: insertedMessage.id,
      body: insertedMessage.body,
      createdAt: insertedMessage.created_at,
      readAt: insertedMessage.read_at,
      sender: viewer.profile,
      conversationId: insertedMessage.conversation_id,
    },
  });
}
