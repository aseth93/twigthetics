import type { PlanSectionKey, PlanSections } from "@/lib/portal/plan-sections";

export type ApplicationRole = "member" | "coach_admin";

export type PortalMode = "live";

export type PortalProfile = {
  id: string;
  role: ApplicationRole;
  fullName: string;
  email: string;
  instagramHandle?: string | null;
  avatarUrl?: string | null;
  memberOnboardingSeenAt?: string | null;
  joinedAt?: string | null;
};

export type PortalViewer = {
  mode: PortalMode;
  profile: PortalProfile;
};

export type PortalPlan = {
  id: string;
  title: string;
  summary: string;
  cadence: string;
  body: string;
  sections: PlanSections;
  isStructured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlanSectionDefinition = {
  key: PlanSectionKey;
  label: string;
  value: string;
};

export type PlanAssignmentStatus = "active" | "archived";

export type PlanAssignment = {
  id: string;
  memberId: string;
  status: PlanAssignmentStatus;
  startsOn?: string | null;
  notes?: string | null;
  plan: PortalPlan;
};

export type MemberPlanUpdate = {
  id: string;
  memberId: string;
  planAssignmentId?: string | null;
  title: string;
  summary: string;
  items: string[];
  seenAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalDocument = {
  id: string;
  title: string;
  description?: string | null;
  section?: PlanSectionKey | null;
  fileName: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  bucket: string;
  path: string;
  createdAt: string;
  updatedAt?: string | null;
  assignedMemberIds?: string[];
};

export type ConversationThread = {
  id: string;
  memberId: string;
  coachId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConversationMessage = {
  id: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
  sender: PortalProfile;
  conversationId: string;
};

export type AdminConversation = {
  member: PortalProfile;
  thread: ConversationThread;
  messages: ConversationMessage[];
};

export type BillingAccount = {
  id: string;
  memberId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status: string;
  planName: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: string;
};

export type CoachingApplicationAttachment = {
  id: string;
  fieldName: string;
  fileName: string;
  mimeType?: string | null;
  sizeBytes: number;
  createdAt: string;
  downloadUrl: string;
};

export type CoachingApplication = {
  id: string;
  fullName: string;
  email: string;
  instagramHandle?: string | null;
  status: string;
  submittedAt: string;
  payload: Record<string, string>;
  attachments: CoachingApplicationAttachment[];
};

export type MemberDashboardData = {
  assignments: PlanAssignment[];
  documents: PortalDocument[];
  billing: BillingAccount | null;
  conversation: ConversationThread | null;
  messages: ConversationMessage[];
  dailyCheckins: DailyCheckinEntry[];
  scheduledWorkouts: PortalWorkoutScheduleEntry[];
  unseenPlanUpdates: MemberPlanUpdate[];
  weeklyWeightAverages: WeeklyWeightAverage[];
  latestCheckin: DailyCheckinEntry | null;
  currentWeekAverageWeightPounds: number | null;
};

export type AdminDashboardData = {
  members: PortalProfile[];
  plans: PortalPlan[];
  assignments: PlanAssignment[];
  documents: PortalDocument[];
  recentMessages: ConversationMessage[];
  conversations: AdminConversation[];
  billingAccounts: BillingAccount[];
  applications: CoachingApplication[];
};

export type AdminMemberDetailData = {
  member: PortalProfile;
  billing: BillingAccount | null;
  assignments: PlanAssignment[];
  documents: PortalDocument[];
  conversation: ConversationThread | null;
  messages: ConversationMessage[];
  applications: CoachingApplication[];
};

export type AdminApplicationDetailData = {
  application: CoachingApplication;
  matchingMember: PortalProfile | null;
};

export type PortalRuntime = {
  databaseConfigured: boolean;
  authConfigured: boolean;
  stripeConfigured: boolean;
  stripePriceConfigured: boolean;
  emailConfigured: boolean;
  bootstrapAdminConfigured: boolean;
};

export type DailyCheckinEntry = {
  id: string;
  memberId: string;
  checkinDate: string;
  weightPounds?: number | null;
  hydrationOunces?: number | null;
  sleepHours?: number | null;
  workoutNotes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalWorkoutScheduleEntry = {
  id: string;
  memberId: string;
  scheduledDate: string;
  title: string;
  dayType: string;
  summary?: string | null;
  details?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WeeklyWeightAverage = {
  weekStart: string;
  weekEnd: string;
  averageWeightPounds: number;
  entryCount: number;
};
