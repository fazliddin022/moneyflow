"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
} from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Tranzaksiyalar", icon: ArrowLeftRight },
  { href: "/dashboard/analytics", label: "Tahlil", icon: PieChart },
  { href: "/dashboard/budgets", label: "Budjetlar", icon: Target },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.625rem 0.875rem",
              borderRadius: "0.75rem",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: active ? 600 : 400,
              background: active ? "#f0fdf4" : "transparent",
              color: active ? "#10b981" : "#64748b",
              border: active ? "1px solid #bbf7d0" : "1px solid transparent",
              transition: "all 0.2s",
            }}
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}