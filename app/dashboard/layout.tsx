import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import NavLinks from "@/components/NavLinks";
import SignOutButton from "@/components/SignOutButton";
import { TrendingUp } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar */}
      <aside style={{
        width: "240px",
        background: "white",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{
          padding: "1.5rem",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            background: "linear-gradient(135deg, #10b981, #3b82f6)",
            borderRadius: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
          }}>
            <TrendingUp size={18} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
              MoneyFlow
            </p>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
              {session.user?.name}
            </p>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
          <NavLinks />
        </div>

        {/* Sign out */}
        <div style={{ padding: "1rem", borderTop: "1px solid #e2e8f0" }}>
          <SignOutButton />
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: "240px" }}>
        <main style={{ padding: "2rem" }}>
          {children}
        </main>
      </div>
    </div>
  );
}