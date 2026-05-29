import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDbReady } from "@/db";
import {
  billingAccounts,
  coachingApplicationAttachments,
  coachingApplications,
  conversations,
  documentAccess,
  documents,
  messages,
  planAssignments,
  plans,
  users,
} from "@/db/schema";
import { parsePlanSections } from "@/lib/portal/plan-sections";
import type {
  AdminConversation,
  AdminDashboardData,
  AdminMemberDetailData,
  BillingAccount,
  CoachingApplication,
  CoachingApplicationAttachment,
  ConversationMessage,
  ConversationThread,
  MemberDashboardData,
  PlanAssignment,
  PortalDocument,
  PortalPlan,
  PortalProfile,
  PortalViewer,
} from "@/types/portal";

function toIsoDate(input?: Date | null) {
  return input ? input.toISOString() : null;
}

function mapProfileRow(row: typeof users.$inferSelect): PortalProfile {
  return {
    id: row.id,
    role: row.role === "coach_admin" ? "coach_admin" : "member",
    fullName: row.fullName,
    email: row.email,
    instagramHandle: row.instagramHandle,
    avatarUrl: row.avatarUrl,
    joinedAt: toIsoDate(row.joinedAt),
  };
}

function mapPlanRow(row: typeof plans.$inferSelect): PortalPlan {
  const parsedPlan = parsePlanSections(row.body);

  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    cadence: row.cadence,
    body: row.body,
    sections: parsedPlan.sections,
    isStructured: parsedPlan.isStructured,
    createdAt: toIsoDate(row.createdAt) || new Date().toISOString(),
    updatedAt: toIsoDate(row.updatedAt) || new Date().toISOString(),
  };
}

function mapAssignmentRow(row: {
  assignment: typeof planAssignments.$inferSelect;
  plan: typeof plans.$inferSelect;
}): PlanAssignment {
  return {
    id: row.assignment.id,
    memberId: row.assignment.memberId,
    status: row.assignment.status === "archived" ? "archived" : "active",
    startsOn: row.assignment.startsOn,
    notes: row.assignment.notes,
    plan: mapPlanRow(row.plan),
  };
}

function mapDocumentRow(
  row: typeof documents.$inferSelect,
  assignedMemberIds?: string[],
): PortalDocument {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    bucket: "database",
    path: row.id,
    createdAt: toIsoDate(row.createdAt) || new Date().toISOString(),
    updatedAt: toIsoDate(row.updatedAt),
    assignedMemberIds,
  };
}

function mapConversationRow(row: typeof conversations.$inferSelect): ConversationThread {
  return {
    id: row.id,
    memberId: row.memberId,
    coachId: row.coachId,
    createdAt: toIsoDate(row.createdAt) || new Date().toISOString(),
    updatedAt: toIsoDate(row.updatedAt) || new Date().toISOString(),
  };
}

function mapMessageRow(row: {
  message: typeof messages.$inferSelect;
  sender: typeof users.$inferSelect;
}): ConversationMessage {
  return {
    id: row.message.id,
    body: row.message.body,
    createdAt: toIsoDate(row.message.createdAt) || new Date().toISOString(),
    readAt: toIsoDate(row.message.readAt),
    sender: mapProfileRow(row.sender),
    conversationId: row.message.conversationId,
  };
}

function mapBillingRow(row: typeof billingAccounts.$inferSelect): BillingAccount {
  return {
    id: row.id,
    memberId: row.memberId,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    status: row.status,
    planName: row.planName,
    currentPeriodEnd: toIsoDate(row.currentPeriodEnd),
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    updatedAt: toIsoDate(row.updatedAt) || new Date().toISOString(),
  };
}

function mapApplicationAttachmentRow(
  row: typeof coachingApplicationAttachments.$inferSelect,
): CoachingApplicationAttachment {
  return {
    id: row.id,
    fieldName: row.fieldName,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    createdAt: toIsoDate(row.createdAt) || new Date().toISOString(),
    downloadUrl: `/api/admin/applications/${row.applicationId}/attachments/${row.id}`,
  };
}

function mapApplicationRow(
  row: typeof coachingApplications.$inferSelect,
  attachments: CoachingApplicationAttachment[],
): CoachingApplication {
  return {
    id: row.id,
    fullName: row.fullName || "Unnamed applicant",
    email: row.email || "No email provided",
    instagramHandle: row.instagramHandle,
    status: row.status,
    submittedAt: toIsoDate(row.submittedAt) || new Date().toISOString(),
    payload: row.payload || {},
    attachments,
  };
}

export async function getMemberDashboardData(
  viewer: PortalViewer,
): Promise<MemberDashboardData> {
  const db = await getDbReady();

  if (!db) {
    return {
      assignments: [],
      documents: [],
      billing: null,
      conversation: null,
      messages: [],
    };
  }

  const [assignmentRows, documentRows, billingRow, threadRow] = await Promise.all([
    db
      .select({
        assignment: planAssignments,
        plan: plans,
      })
      .from(planAssignments)
      .innerJoin(plans, eq(planAssignments.planId, plans.id))
      .where(eq(planAssignments.memberId, viewer.profile.id))
      .orderBy(desc(planAssignments.startsOn), desc(planAssignments.createdAt)),
    db
      .select({
        document: documents,
      })
      .from(documentAccess)
      .innerJoin(documents, eq(documentAccess.documentId, documents.id))
      .where(eq(documentAccess.memberId, viewer.profile.id))
      .orderBy(desc(documents.createdAt)),
    db
      .select()
      .from(billingAccounts)
      .where(eq(billingAccounts.memberId, viewer.profile.id))
      .limit(1),
    db
      .select()
      .from(conversations)
      .where(eq(conversations.memberId, viewer.profile.id))
      .limit(1),
  ]);

  const conversation = threadRow[0] ? mapConversationRow(threadRow[0]) : null;
  const messageRows = conversation
    ? await db
        .select({
          message: messages,
          sender: users,
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(asc(messages.createdAt))
    : [];

  return {
    assignments: assignmentRows.map((row) => mapAssignmentRow(row)),
    documents: documentRows.map((row) => mapDocumentRow(row.document)),
    billing: billingRow[0] ? mapBillingRow(billingRow[0]) : null,
    conversation,
    messages: messageRows.map((row) => mapMessageRow(row)),
  };
}

export async function getAdminDashboardData(
  viewer: PortalViewer,
): Promise<AdminDashboardData> {
  void viewer;
  const db = await getDbReady();

  if (!db) {
    return {
      members: [],
      plans: [],
      assignments: [],
      documents: [],
      recentMessages: [],
      conversations: [],
      billingAccounts: [],
      applications: [],
    };
  }

  const [
    memberRows,
    planRows,
    assignmentRows,
    documentRows,
    accessRows,
    billingRows,
    threadRows,
    applicationRows,
    applicationAttachmentRows,
  ] =
    await Promise.all([
      db
        .select()
        .from(users)
        .where(eq(users.role, "member"))
        .orderBy(desc(users.joinedAt)),
      db.select().from(plans).orderBy(desc(plans.updatedAt)),
      db
        .select({
          assignment: planAssignments,
          plan: plans,
        })
        .from(planAssignments)
        .innerJoin(plans, eq(planAssignments.planId, plans.id))
        .orderBy(desc(planAssignments.createdAt)),
      db.select().from(documents).orderBy(desc(documents.createdAt)),
      db.select().from(documentAccess),
      db.select().from(billingAccounts).orderBy(desc(billingAccounts.updatedAt)),
      db.select().from(conversations).orderBy(desc(conversations.updatedAt)),
      db.select().from(coachingApplications).orderBy(desc(coachingApplications.submittedAt)),
      db
        .select()
        .from(coachingApplicationAttachments)
        .orderBy(asc(coachingApplicationAttachments.createdAt)),
    ]);

  const members = memberRows.map((row) => mapProfileRow(row));
  const threads = threadRows.map((row) => mapConversationRow(row));
  const threadIds = threads.map((thread) => thread.id);
  const messageRows = threadIds.length
    ? await db
        .select({
          message: messages,
          sender: users,
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(inArray(messages.conversationId, threadIds))
        .orderBy(asc(messages.createdAt))
    : [];

  const mappedMessages = messageRows.map((row) => mapMessageRow(row));
  const messagesByConversation = new Map<string, ConversationMessage[]>();
  const assignedMembersByDocument = new Map<string, string[]>();
  const attachmentsByApplication = new Map<string, CoachingApplicationAttachment[]>();

  accessRows.forEach((row) => {
    const group = assignedMembersByDocument.get(row.documentId) || [];
    group.push(row.memberId);
    assignedMembersByDocument.set(row.documentId, group);
  });

  mappedMessages.forEach((message) => {
    const group = messagesByConversation.get(message.conversationId) || [];
    group.push(message);
    messagesByConversation.set(message.conversationId, group);
  });

  applicationAttachmentRows.forEach((row) => {
    const group = attachmentsByApplication.get(row.applicationId) || [];
    group.push(mapApplicationAttachmentRow(row));
    attachmentsByApplication.set(row.applicationId, group);
  });

  const memberMap = new Map(members.map((member) => [member.id, member]));
  const conversationsData: AdminConversation[] = threads
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
    plans: planRows.map((row) => mapPlanRow(row)),
    assignments: assignmentRows.map((row) => mapAssignmentRow(row)),
    documents: documentRows.map((row) =>
      mapDocumentRow(row, assignedMembersByDocument.get(row.id) || []),
    ),
    recentMessages: [...mappedMessages].reverse().slice(0, 8),
    conversations: conversationsData,
    billingAccounts: billingRows.map((row) => mapBillingRow(row)),
    applications: applicationRows.map((row) =>
      mapApplicationRow(row, attachmentsByApplication.get(row.id) || []),
    ),
  };
}

export async function getConversationMessages(options: {
  conversationId: string;
}) {
  const db = await getDbReady();

  if (!db) {
    return [];
  }

  const messageRows = await db
    .select({
      message: messages,
      sender: users,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, options.conversationId))
    .orderBy(asc(messages.createdAt));

  return messageRows.map((row) => mapMessageRow(row));
}

export async function getAdminMemberDetailData(options: {
  memberId: string;
}): Promise<AdminMemberDetailData | null> {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const [memberRow] = await db
    .select()
    .from(users)
    .where(eq(users.id, options.memberId))
    .limit(1);

  if (!memberRow || memberRow.role !== "member") {
    return null;
  }

  const [assignmentRows, documentRows, billingRows, conversationRows, applicationRows] =
    await Promise.all([
      db
        .select({
          assignment: planAssignments,
          plan: plans,
        })
        .from(planAssignments)
        .innerJoin(plans, eq(planAssignments.planId, plans.id))
        .where(eq(planAssignments.memberId, memberRow.id))
        .orderBy(desc(planAssignments.startsOn), desc(planAssignments.createdAt)),
      db
        .select({
          document: documents,
        })
        .from(documentAccess)
        .innerJoin(documents, eq(documentAccess.documentId, documents.id))
        .where(eq(documentAccess.memberId, memberRow.id))
        .orderBy(desc(documents.createdAt)),
      db
        .select()
        .from(billingAccounts)
        .where(eq(billingAccounts.memberId, memberRow.id))
        .limit(1),
      db
        .select()
        .from(conversations)
        .where(eq(conversations.memberId, memberRow.id))
        .limit(1),
      db
        .select()
        .from(coachingApplications)
        .where(eq(coachingApplications.email, memberRow.email))
        .orderBy(desc(coachingApplications.submittedAt)),
    ]);

  const applicationIds = applicationRows.map((row) => row.id);
  const [messageRows, attachmentRows] = await Promise.all([
    conversationRows[0]
      ? db
          .select({
            message: messages,
            sender: users,
          })
          .from(messages)
          .innerJoin(users, eq(messages.senderId, users.id))
          .where(eq(messages.conversationId, conversationRows[0].id))
          .orderBy(asc(messages.createdAt))
      : Promise.resolve([]),
    applicationIds.length
      ? db
          .select()
          .from(coachingApplicationAttachments)
          .where(inArray(coachingApplicationAttachments.applicationId, applicationIds))
          .orderBy(asc(coachingApplicationAttachments.createdAt))
      : Promise.resolve([]),
  ]);

  const attachmentsByApplication = new Map<string, CoachingApplicationAttachment[]>();

  attachmentRows.forEach((row) => {
    const group = attachmentsByApplication.get(row.applicationId) || [];
    group.push(mapApplicationAttachmentRow(row));
    attachmentsByApplication.set(row.applicationId, group);
  });

  return {
    member: mapProfileRow(memberRow),
    billing: billingRows[0] ? mapBillingRow(billingRows[0]) : null,
    assignments: assignmentRows.map((row) => mapAssignmentRow(row)),
    documents: documentRows.map((row) => mapDocumentRow(row.document, [memberRow.id])),
    conversation: conversationRows[0] ? mapConversationRow(conversationRows[0]) : null,
    messages: messageRows.map((row) => mapMessageRow(row)),
    applications: applicationRows.map((row) =>
      mapApplicationRow(row, attachmentsByApplication.get(row.id) || []),
    ),
  };
}
