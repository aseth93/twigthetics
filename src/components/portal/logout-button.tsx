"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    try {
      setIsPending(true);
      await signOut({
        callbackUrl: "/login",
      });
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
