export type ApplicationRole = "member" | "coach_admin";

export type PortalMode = "live";

export type PortalProfile = {
  id: string;
  role: ApplicationRole;
  fullName: string;
  email: string;
  instagramHandle?: string | null;
  avatarUrl?: string | null;
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
  createdAt: string;
  updatedAt: string;
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

export type PortalDocument = {
  id: string;
  title: string;
  description?: string | null;
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

export type MemberDashboardData = {
  assignments: PlanAssignment[];
  documents: PortalDocument[];
  billing: BillingAccount | null;
  conversation: ConversationThread | null;
  messages: ConversationMessage[];
};

export type AdminDashboardData = {
  members: PortalProfile[];
  plans: PortalPlan[];
  assignments: PlanAssignment[];
  documents: PortalDocument[];
  recentMessages: ConversationMessage[];
  conversations: AdminConversation[];
  billingAccounts: BillingAccount[];
};

export type PortalRuntime = {
  databaseConfigured: boolean;
  authConfigured: boolean;
  stripeConfigured: boolean;
  stripePriceConfigured: boolean;
  emailConfigured: boolean;
  bootstrapAdminConfigured: boolean;
};
