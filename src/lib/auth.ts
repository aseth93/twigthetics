import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDbReady } from "@/db";
import { users } from "@/db/schema";
import { ensureBootstrapAdmin, normalizeEmail } from "@/lib/portal/users";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await ensureBootstrapAdmin();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const db = await getDbReady();

        if (!db) {
          throw new Error("Portal auth is not configured yet.");
        }

        const email = normalizeEmail(credentials.email);
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) {
          throw new Error("No account found with that email.");
        }

        const isValid = await compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Invalid password.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "member";
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id = token.id as string;
        (session.user as { id?: string; role?: string }).role =
          (token.role as string) || "member";
        session.user.name = token.name;
        session.user.email = token.email;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}
