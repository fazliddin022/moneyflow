"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.625rem 0.875rem",
        borderRadius: "0.75rem",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "0.875rem",
        color: "#ef4444",
        fontWeight: 500,
      }}
    >
      <LogOut size={18} />
      Chiqish
    </button>
  );
}