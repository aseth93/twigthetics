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
} from "@/types/portal";

export const demoCoachProfile: PortalProfile = {
  id: "demo-coach-abe",
  role: "coach_admin",
  fullName: "Abe Seth",
  email: "coach@twigthetics.com",
  instagramHandle: "@twigthetics",
  avatarUrl: "/images/coach/coach-window-selfie.jpg",
  joinedAt: "2026-01-05T12:00:00.000Z",
};

export const demoMemberProfile: PortalProfile = {
  id: "demo-member-ethan",
  role: "member",
  fullName: "Ethan Cole",
  email: "ethan@example.com",
  instagramHandle: "@ethan.cuts",
  joinedAt: "2026-03-11T09:30:00.000Z",
};

export const demoPlans: PortalPlan[] = [
  {
    id: "plan-lean-reset",
    title: "Lean Reset Phase",
    summary: "Eight weeks focused on tightening body composition without crashing output.",
    cadence: "4 lifts, 10k steps, 2 low-stress cardio blocks",
    body:
      "Day 1 upper bias, Day 2 lower bias, Day 3 rest, Day 4 upper volume, Day 5 lower posterior. Protein minimum every day. Calorie targets rotate higher on hard training days and tighter on rest days.",
    createdAt: "2026-03-10T10:00:00.000Z",
    updatedAt: "2026-05-20T16:20:00.000Z",
  },
  {
    id: "plan-maintenance-lane",
    title: "Maintenance Lane",
    summary: "Keep the look sharp once the cut is done and life gets busy again.",
    cadence: "4 lifts, steps floor, one athletic session",
    body:
      "Hold body weight within a narrow range, prioritize performance anchors, and use a single weekly adjustment rule instead of random clean-up days.",
    createdAt: "2026-04-01T12:30:00.000Z",
    updatedAt: "2026-05-22T14:10:00.000Z",
  },
];

export const demoAssignments: PlanAssignment[] = [
  {
    id: "assignment-ethan-active",
    memberId: demoMemberProfile.id,
    status: "active",
    startsOn: "2026-05-19",
    notes: "Keep hunger calm by pulling fats down before touching carbs.",
    plan: demoPlans[0],
  },
];

export const demoDocuments: PortalDocument[] = [
  {
    id: "document-photo-checklist",
    title: "Check-in photo checklist",
    description: "Angles, lighting, and timing standards for weekly progress photos.",
    fileName: "checkin-photo-checklist.pdf",
    mimeType: "application/pdf",
    sizeBytes: 212004,
    bucket: "member-documents",
    path: "demo/checkin-photo-checklist.pdf",
    createdAt: "2026-05-01T08:20:00.000Z",
    updatedAt: "2026-05-01T08:20:00.000Z",
    assignedMemberIds: [demoMemberProfile.id],
  },
  {
    id: "document-maintenance-guide",
    title: "Weekend maintenance rules",
    description: "Guardrails for eating out, drinks, and social meals without rebound.",
    fileName: "weekend-maintenance-rules.pdf",
    mimeType: "application/pdf",
    sizeBytes: 178220,
    bucket: "member-documents",
    path: "demo/weekend-maintenance-rules.pdf",
    createdAt: "2026-05-12T11:05:00.000Z",
    updatedAt: "2026-05-12T11:05:00.000Z",
    assignedMemberIds: [demoMemberProfile.id],
  },
];

export const demoConversation: ConversationThread = {
  id: "conversation-ethan",
  memberId: demoMemberProfile.id,
  coachId: demoCoachProfile.id,
  createdAt: "2026-05-04T14:00:00.000Z",
  updatedAt: "2026-05-24T18:15:00.000Z",
};

export const demoMessages: ConversationMessage[] = [
  {
    id: "message-1",
    body: "Weight is flat, waist is down a touch, and pumps are still good. Hold another week.",
    createdAt: "2026-05-23T16:10:00.000Z",
    readAt: "2026-05-23T16:14:00.000Z",
    sender: demoCoachProfile,
    conversationId: demoConversation.id,
  },
  {
    id: "message-2",
    body: "Understood. Travel dinner on Friday, so I’ll keep breakfast and lunch tighter and hit steps early.",
    createdAt: "2026-05-23T16:22:00.000Z",
    readAt: "2026-05-23T16:25:00.000Z",
    sender: demoMemberProfile,
    conversationId: demoConversation.id,
  },
  {
    id: "message-3",
    body: "Perfect. That is the exact trade-off instead of trying to compensate with random extra cardio.",
    createdAt: "2026-05-24T09:05:00.000Z",
    readAt: null,
    sender: demoCoachProfile,
    conversationId: demoConversation.id,
  },
];

export const demoBillingAccount: BillingAccount = {
  id: "billing-ethan",
  memberId: demoMemberProfile.id,
  stripeCustomerId: "cus_demo_ethan",
  stripeSubscriptionId: "sub_demo_ethan",
  status: "active",
  planName: "Twigthetics Online Coaching",
  currentPeriodEnd: "2026-06-19T00:00:00.000Z",
  cancelAtPeriodEnd: false,
  updatedAt: "2026-05-20T09:00:00.000Z",
};

const demoAdminConversation: AdminConversation = {
  member: demoMemberProfile,
  thread: demoConversation,
  messages: demoMessages,
};

export const demoMemberDashboard: MemberDashboardData = {
  assignments: demoAssignments,
  documents: demoDocuments.filter((document) =>
    document.assignedMemberIds?.includes(demoMemberProfile.id),
  ),
  billing: demoBillingAccount,
  conversation: demoConversation,
  messages: demoMessages,
};

export const demoAdminDashboard: AdminDashboardData = {
  members: [demoMemberProfile],
  plans: demoPlans,
  assignments: demoAssignments,
  documents: demoDocuments,
  recentMessages: [...demoMessages].reverse(),
  conversations: [demoAdminConversation],
  billingAccounts: [demoBillingAccount],
};
