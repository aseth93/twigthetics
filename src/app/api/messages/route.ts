import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { conversations, messages } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";
import { getConversationMessages } from "@/lib/portal/data";

async function getOrCreateConversation(memberId: string, coachId?: string | null) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const existingConversation = await db
    .select()
    .from(conversations)
    .where(eq(conversations.memberId, memberId))
    .limit(1);

  if (existingConversation[0]) {
    return existingConversation[0];
  }

  const insertedConversation = await db
    .insert(conversations)
    .values({
      memberId,
      coachId: coachId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return insertedConversation[0] || null;
}

export async function GET(request: Request) {
  const viewer = await getPortalViewer();

  if (!viewer) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const memberId =
    viewer.profile.role === "coach_admin"
      ? searchParams.get("memberId")?.trim() || ""
      : viewer.profile.id;

  if (!memberId) {
    return NextResponse.json(
      { error: "Choose a client before opening an admin thread." },
      { status: 400 },
    );
  }

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.memberId, memberId))
    .limit(1);

  if (!conversation) {
    return NextResponse.json({
      ok: true,
      conversation: null,
      messages: [],
    });
  }

  const threadMessages = await getConversationMessages({
    conversationId: conversation.id,
  });

  return NextResponse.json({
    ok: true,
    conversation: {
      id: conversation.id,
      memberId: conversation.memberId,
      coachId: conversation.coachId,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    },
    messages: threadMessages,
  });
}

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

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const memberId =
    viewer.profile.role === "coach_admin" ? payload?.memberId?.trim() || "" : viewer.profile.id;

  if (!memberId) {
    return NextResponse.json(
      { error: "Choose a client before sending an admin message." },
      { status: 400 },
    );
  }

  const conversation = await getOrCreateConversation(
    memberId,
    viewer.profile.role === "coach_admin" ? viewer.profile.id : null,
  );

  if (!conversation) {
    return NextResponse.json(
      { error: "Unable to create a conversation thread." },
      { status: 500 },
    );
  }

  const insertedMessages = await db
    .insert(messages)
    .values({
      conversationId: conversation.id,
      senderId: viewer.profile.id,
      body,
      createdAt: new Date(),
    })
    .returning();

  const insertedMessage = insertedMessages[0];

  if (!insertedMessage) {
    return NextResponse.json({ error: "Unable to send the message." }, { status: 500 });
  }

  await db
    .update(conversations)
    .set({
      updatedAt: new Date(),
      coachId: viewer.profile.role === "coach_admin" ? viewer.profile.id : conversation.coachId,
    })
    .where(and(eq(conversations.id, conversation.id), eq(conversations.memberId, memberId)));

  return NextResponse.json({
    ok: true,
    message: {
      id: insertedMessage.id,
      body: insertedMessage.body,
      createdAt: insertedMessage.createdAt.toISOString(),
      readAt: insertedMessage.readAt?.toISOString() || null,
      sender: viewer.profile,
      conversationId: insertedMessage.conversationId,
    },
  });
}
