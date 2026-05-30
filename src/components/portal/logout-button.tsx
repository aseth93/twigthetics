"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    try {
      setIsPending(true);
      const result = await signOut({
        redirect: false,
        callbackUrl: "/",
      });
      const nextUrl = result?.url || "/";
      router.replace(nextUrl);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="btn-secondary min-h-11 text-sm"
      disabled={isPending}
    >
      {isPending ? "Signing out..." : "Log out"}
    </button>
  );
}
