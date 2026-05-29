import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    const token = request.nextauth.token;
    const path = request.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role !== "coach_admin") {
      return NextResponse.redirect(new URL("/member", request.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: ["/member/:path*", "/admin/:path*"],
};
