import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminConversation,
  AdminDashboardData,
  BillingAccount,
  ConversationMessage,
  ConversationThread,
  MemberDashboardData,
  PlanAssignment,
  PortalDocument,
  PortalPlan,
  PortalProfile,
  PortalViewer,
} from "@/types/portal";
import { getPortalRuntime } from "./env";
import { demoAdminDashboard, demoMemberDashboard } from "./mock-data";

function mapProfileRow(row: Record<string, unknown>): PortalProfile {
  return {
    id: String(row.user_id),
    role: row.role === "coach_admin" ? "coach_admin" : "member",
    fullName: String(row.full_name || "Twigthetics Member"),
    email: String(row.email || ""),
    instagramHandle:
      typeof row.instagram_handle === "string" ? row.instagram_handle : null,
    avatarUrl: typeof row.avatar_url === "string" ? row.avatar_url : null,
    joinedAt: typeof row.joined_at === "string" ? row.joined_at : null,
  };
}

function mapPlanRow(row: Record<string, unknown>): PortalPlan {
  return {
    id: String(row.id),
    title: String(row.title || "Untitled plan"),
    summary: String(row.summary || ""),
    cadence: String(row.cadence || ""),
    body: String(row.body || ""),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || row.created_at || new Date().toISOString()),
  };
}

function mapAssignmentRow(row: Record<string, unknown>): PlanAssignment {
  return {
    id: String(row.id),
    memberId: String(row.member_id),
    status: row.status === "archived" ? "archived" : "active",
    startsOn: typeof row.starts_on === "string" ? row.starts_on : null,
    notes: typeof row.notes === "string" ? row.notes : null,
    plan: mapPlanRow((row.plan || {}) as Record<string, unknown>),
  };
}

function mapDocumentRow(row: Record<string, unknown>): PortalDocument {
  return {
    id: String(row.id),
    title: String(row.title || "Untitled document"),
    description: typeof row.description === "string" ? row.description : null,
    fileName: String(row.file_name || ""),
    mimeType: typeof row.mime_type === "string" ? row.mime_type : null,
    sizeBytes:
      typeof row.size_bytes === "number" ? row.size_bytes : Number(row.size_bytes || 0),
    bucket: String(row.bucket || "member-documents"),
    path: String(row.path || ""),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

function mapConversationRow(row: Record<string, unknown>): ConversationThread {
  return {
    id: String(row.id),
    memberId: String(row.member_id),
    coachId: typeof row.coach_id === "string" ? row.coach_id : null,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || row.created_at || new Date().toISOString()),
  };
}

function mapMessageRow(
  row: Record<string, unknown>,
  senders: Map<string, PortalProfile>,
): ConversationMessage {
  const senderId = String(row.sender_id || "");

  return {
    id: String(row.id),
    body: String(row.body || ""),
    createdAt: String(row.created_at || new Date().toISOString()),
    readAt: typeof row.read_at === "string" ? row.read_at : null,
    sender:
      senders.get(senderId) ||
      ({
        id: senderId,
        role: "member",
        fullName: "Twigthetics User",
        email: "",
      } satisfies PortalProfile),
    conversationId: String(row.conversation_id || ""),
  };
}

function mapBillingRow(row: Record<string, unknown>): BillingAccount {
  return {
    id: String(row.id),
    memberId: String(row.member_id),
    stripeCustomerId:
      typeof row.stripe_customer_id === "string" ? row.stripe_customer_id : null,
    stripeSubscriptionId:
      typeof row.stripe_subscription_id === "string"
        ? row.stripe_subscription_id
        : null,
    status: String(row.status || "inactive"),
    planName: String(row.plan_name || "Twigthetics Coaching"),
    currentPeriodEnd:
      typeof row.current_period_end === "string" ? row.current_period_end : null,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

async function getSenderMap(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  senderIds: string[],
) {
  if (senderIds.length === 0) {
    return new Map<string, PortalProfile>();
  }

  const { data } = await supabase
    .from("profiles")
    .select("user_id, role, full_name, email, instagram_handle, avatar_url, joined_at")
    .in("user_id", senderIds);

  return new Map((data || []).map((row) => [String(row.user_id), mapProfileRow(row)]));
}

export async function getMemberDashboardData(
  viewer: PortalViewer,
): Promise<MemberDashboardData> {
  const runtime = getPortalRuntime();

  if (!runtime.supabaseConfigured || viewer.mode === "demo") {
    return demoMemberDashboard;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      assignments: [],
      documents: [],
      billing: null,
      conversation: null,
      messages: [],
    };
  }

  const [{ data: assignmentRows }, { data: accessRows }, { data: billingRow }, { data: threadRow }] =
    await Promise.all([
      supabase
        .from("plan_assignments")
        .select(
          "id, member_id, status, starts_on, notes, plan:plans(id, title, summary, cadence, body, created_at, updated_at)",
        )
        .eq("member_id", viewer.profile.id)
        .order("starts_on", { ascending: false }),
      supabase
        .from("document_access")
        .select(
          "document:documents(id, title, description, file_name, mime_type, size_bytes, bucket, path, created_at, updated_at)",
        )
        .eq("member_id", viewer.profile.id),
      supabase
        .from("billing_accounts")
        .select(
          "id, member_id, stripe_customer_id, stripe_subscription_id, status, plan_name, current_period_end, cancel_at_period_end, updated_at",
        )
        .eq("member_id", viewer.profile.id)
        .maybeSingle(),
      supabase
        .from("conversations")
        .select("id, member_id, coach_id, created_at, updated_at")
        .eq("member_id", viewer.profile.id)
        .maybeSingle(),
    ]);

  const conversation = threadRow ? mapConversationRow(threadRow) : null;
  let messages: ConversationMessage[] = [];

  if (conversation) {
    const { data: messageRows } = await supabase
      .from("messages")
      .select("id, body, created_at, read_at, sender_id, conversation_id")
      .eq("conversation_id", conversation.id)
      .order("created_at");

    const senderMap = await getSenderMap(
      supabase,
      [...new Set((messageRows || []).map((row) => String(row.sender_id)))],
    );
    messages = (messageRows || []).map((row) => mapMessageRow(row, senderMap));
  }

  return {
    assignments: (assignmentRows || []).map((row) => mapAssignmentRow(row)),
    documents: (accessRows || [])
      .map(
        (row) => row.document as unknown as Record<string, unknown> | null,
      )
      .filter(Boolean)
      .map((row) => mapDocumentRow(row!)),
    billing: billingRow ? mapBillingRow(billingRow) : null,
    conversation,
    messages,
  };
}

export async function getAdminDashboardData(
  viewer: PortalViewer,
): Promise<AdminDashboardData> {
  const runtime = getPortalRuntime();

  if (!runtime.supabaseConfigured || viewer.mode === "demo") {
    return demoAdminDashboard;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      members: [],
      plans: [],
      assignments: [],
      documents: [],
      recentMessages: [],
      conversations: [],
      billingAccounts: [],
    };
  }

  const [
    { data: memberRows },
    { data: planRows },
    { data: assignmentRows },
    { data: documentRows },
    { data: billingRows },
    { data: threadRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id, role, full_name, email, instagram_handle, avatar_url, joined_at")
      .eq("role", "member")
      .order("joined_at", { ascending: false }),
    supabase
      .from("plans")
      .select("id, title, summary, cadence, body, created_at, updated_at")
      .order("updated_at", { ascending: false }),
    supabase
      .from("plan_assignments")
      .select(
        "id, member_id, status, starts_on, notes, plan:plans(id, title, summary, cadence, body, created_at, updated_at)",
      )
      .order("starts_on", { ascending: false }),
    supabase
      .from("documents")
      .select("id, title, description, file_name, mime_type, size_bytes, bucket, path, created_at, updated_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("billing_accounts")
      .select(
        "id, member_id, stripe_customer_id, stripe_subscription_id, status, plan_name, current_period_end, cancel_at_period_end, updated_at",
      )
      .order("updated_at", { ascending: false }),
    supabase
      .from("conversations")
      .select("id, member_id, coach_id, created_at, updated_at")
      .order("updated_at", { ascending: false }),
  ]);

  const members = (memberRows || []).map((row) => mapProfileRow(row));
  const threads = (threadRows || []).map((row) => mapConversationRow(row));
  const threadIds = threads.map((thread) => thread.id);
  const { data: messageRows } = threadIds.length
    ? await supabase
        .from("messages")
        .select("id, body, created_at, read_at, sender_id, conversation_id")
        .in("conversation_id", threadIds)
        .order("created_at")
    : { data: [] };
  const senderMap = await getSenderMap(
    supabase,
    [...new Set((messageRows || []).map((row) => String(row.sender_id)))],
  );
  const mappedMessages = (messageRows || []).map((row) => mapMessageRow(row, senderMap));
  const messagesByConversation = new Map<string, ConversationMessage[]>();

  mappedMessages.forEach((message) => {
    const group = messagesByConversation.get(message.conversationId) || [];
    group.push(message);
    messagesByConversation.set(message.conversationId, group);
  });

  const memberMap = new Map(members.map((member) => [member.id, member]));
  const conversations: AdminConversation[] = threads
    .map((thread) => {
      const member = memberMap.get(thread.memberId);

      if (!member) {
        return null;
      }

      return {
        member,
        thread,
        messages: messagesByConversation.get(thread.id) || [],
      };
    })
    .filter((item): item is AdminConversation => Boolean(item));

  return {
    members,
    plans: (planRows || []).map((row) => mapPlanRow(row)),
    assignments: (assignmentRows || []).map((row) => mapAssignmentRow(row)),
    documents: (documentRows || []).map((row) => mapDocumentRow(row)),
    recentMessages: [...mappedMessages].reverse().slice(0, 8),
    conversations,
    billingAccounts: (billingRows || []).map((row) => mapBillingRow(row)),
  };
}
