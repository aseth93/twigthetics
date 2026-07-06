import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { getDbReady } from "@/db";
import {
  billingAccounts,
  coachingApplicationAttachments,
  coachingApplications,
  conversations,
  dailyCheckins,
  documentAccess,
  documents,
  memberPlanUpdates,
  memberWorkoutScheduleEntries,
  messages,
  planAssignments,
  plans,
  users,
} from "@/db/schema";
import {
  computeWeeklyWeightAverages,
  getCurrentWeekAverageWeight,
} from "@/lib/portal/checkin-stats";
import { parsePlanSections } from "@/lib/portal/plan-sections";
import type {
  AdminApplicationDetailData,
  AdminConversation,
  AdminDashboardData,
  AdminMemberDetailData,
  BillingAccount,
  CoachingApplication,
  CoachingApplicationAttachment,
  ConversationMessage,
  ConversationThread,
  DailyCheckinEntry,
  MemberDashboardData,
  MemberPlanUpdate,
  PlanAssignment,
  PortalDocument,
  PortalPlan,
  PortalProfile,
  PortalWorkoutScheduleEntry,
  PortalViewer,
} from "@/types/portal";

function toIsoDate(input?: Date | null) {
  return input ? input.toISOString() : null;
}

function toIsoCalendarDate(input?: Date | string | null) {
  if (!input) {
    return null;
  }

  if (typeof input === "string") {
    return input.slice(0, 10);
  }

  return input.toISOString().slice(0, 10);
}

function mapProfileRow(row: typeof users.$inferSelect): PortalProfile {
  return {
    id: row.id,
    role: row.role === "coach_admin" ? "coach_admin" : "member",
    fullName: row.fullName,
    email: row.email,
    instagramHandle: row.instagramHandle,
    avatarUrl: row.avatarUrl,
    memberOnboardingSeenAt: toIsoDate(row.memberOnboardingSeenAt),
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
    startsOn: toIsoCalendarDate(row.assignment.startsOn),
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
    section: row.section as PortalDocument["section"],
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

function mapDailyCheckinRow(row: typeof dailyCheckins.$inferSelect): DailyCheckinEntry {
  return {
    id: row.id,
    memberId: row.memberId,
    checkinDate: toIsoCalendarDate(row.checkinDate) || "",
    weightPounds:
      typeof row.weightTenths === "number" ? row.weightTenths / 10 : null,
    hydrationOunces: row.hydrationOunces,
    sleepHours:
      typeof row.sleepTenths === "number" ? row.sleepTenths / 10 : null,
    workoutNotes: row.workoutNotes,
    createdAt: toIsoDate(row.createdAt) || new Date().toISOString(),
    updatedAt: toIsoDate(row.updatedAt) || new Date().toISOString(),
  };
}

function mapMemberPlanUpdateRow(
  row: typeof memberPlanUpdates.$inferSelect,
): MemberPlanUpdate {
  return {
    id: row.id,
    memberId: row.memberId,
    planAssignmentId: row.planAssignmentId,
    title: row.title,
    summary: row.summary,
    items: Array.isArray(row.items) ? row.items : [],
    seenAt: toIsoDate(row.seenAt),
    createdAt: toIsoDate(row.createdAt) || new Date().toISOString(),
    updatedAt: toIsoDate(row.updatedAt) || new Date().toISOString(),
  };
}

function mapScheduledWorkoutRow(
  row: typeof memberWorkoutScheduleEntries.$inferSelect,
): PortalWorkoutScheduleEntry {
  return {
    id: row.id,
    memberId: row.memberId,
    scheduledDate: toIsoCalendarDate(row.scheduledDate) || "",
    title: row.title,
    dayType: row.dayType,
    summary: row.summary,
    details: row.details,
    createdAt: toIsoDate(row.createdAt) || new Date().toISOString(),
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
      dailyCheckins: [],
      scheduledWorkouts: [],
      unseenPlanUpdates: [],
      weeklyWeightAverages: [],
      latestCheckin: null,
      currentWeekAverageWeightPounds: null,
    };
  }

  const [
    assignmentRows,
    documentRows,
    billingRow,
    threadRow,
    dailyCheckinRows,
    scheduledWorkoutRows,
    unseenPlanUpdateRows,
  ] =
    await Promise.all([
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
    db
      .select()
      .from(dailyCheckins)
      .where(eq(dailyCheckins.memberId, viewer.profile.id))
      .orderBy(desc(dailyCheckins.checkinDate), desc(dailyCheckins.updatedAt)),
    db
      .select()
      .from(memberWorkoutScheduleEntries)
      .where(eq(memberWorkoutScheduleEntries.memberId, viewer.profile.id))
      .orderBy(desc(memberWorkoutScheduleEntries.scheduledDate)),
    db
      .select()
      .from(memberPlanUpdates)
      .where(
        and(
          eq(memberPlanUpdates.memberId, viewer.profile.id),
          isNull(memberPlanUpdates.seenAt),
        ),
      )
      .orderBy(desc(memberPlanUpdates.createdAt))
      .limit(5),
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
  const mappedDailyCheckins = dailyCheckinRows.map((row) => mapDailyCheckinRow(row));
  const weeklyWeightAverages = computeWeeklyWeightAverages(mappedDailyCheckins);

  return {
    assignments: assignmentRows.map((row) => mapAssignmentRow(row)),
    documents: documentRows.map((row) => mapDocumentRow(row.document)),
    billing: billingRow[0] ? mapBillingRow(billingRow[0]) : null,
    conversation,
    messages: messageRows.map((row) => mapMessageRow(row)),
    dailyCheckins: mappedDailyCheckins,
    scheduledWorkouts: scheduledWorkoutRows.map((row) => mapScheduledWorkoutRow(row)),
    unseenPlanUpdates: unseenPlanUpdateRows.map((row) => mapMemberPlanUpdateRow(row)),
    weeklyWeightAverages,
    latestCheckin: mappedDailyCheckins[0] || null,
    currentWeekAverageWeightPounds: getCurrentWeekAverageWeight(weeklyWeightAverages),
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

export async function getUnseenMemberPlanUpdates(options: {
  memberId: string;
}): Promise<MemberPlanUpdate[]> {
  const db = await getDbReady();

  if (!db) {
    return [];
  }

  const rows = await db
    .select()
    .from(memberPlanUpdates)
    .where(
      and(
        eq(memberPlanUpdates.memberId, options.memberId),
        isNull(memberPlanUpdates.seenAt),
      ),
    )
    .orderBy(desc(memberPlanUpdates.createdAt))
    .limit(5);

  return rows.map((row) => mapMemberPlanUpdateRow(row));
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

export async function getAdminApplicationDetailData(options: {
  applicationId: string;
}): Promise<AdminApplicationDetailData | null> {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const [applicationRow] = await db
    .select()
    .from(coachingApplications)
    .where(eq(coachingApplications.id, options.applicationId))
    .limit(1);

  if (!applicationRow) {
    return null;
  }

  const [attachmentRows, matchingMemberRows] = await Promise.all([
    db
      .select()
      .from(coachingApplicationAttachments)
      .where(eq(coachingApplicationAttachments.applicationId, applicationRow.id))
      .orderBy(asc(coachingApplicationAttachments.createdAt)),
    applicationRow.email
      ? db
          .select()
          .from(users)
          .where(eq(users.email, applicationRow.email))
          .limit(1)
      : Promise.resolve([]),
  ]);

  return {
    application: mapApplicationRow(
      applicationRow,
      attachmentRows.map((row) => mapApplicationAttachmentRow(row)),
    ),
    matchingMember:
      matchingMemberRows[0] && matchingMemberRows[0].role === "member"
        ? mapProfileRow(matchingMemberRows[0])
        : null,
  };
}
