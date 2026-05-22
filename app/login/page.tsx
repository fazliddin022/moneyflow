"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TrendingUp, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        if (res?.error) {
          setError("Email yoki parol noto'g'ri!");
          return;
        }
        router.push("/dashboard");
      } else {
        if (!form.name.trim()) {
          setError("Ismingizni kiriting.");
          return;
        }
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Xato yuz berdi.");
          return;
        }
        await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        router.push("/dashboard");
      }
    } catch {
      setError("Xato yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const INPUT_STYLE: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 2.75rem",
    border: "1px solid #e2e8f0",
    borderRadius: "0.75rem",
    fontSize: "0.875rem",
    outline: "none",
    background: "white",
    color: "#0f172a",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #eff6ff 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #10b981, #3b82f6)",
            borderRadius: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
          }}>
            <TrendingUp size={30} color="white" />
          </div>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #10b981, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          }}>
            MoneyFlow
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.375rem" }}>
            {isLogin ? "Hisobingizga kiring" : "Yangi hisob yarating"}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "white",
          borderRadius: "1.5rem",
          padding: "2rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "1px solid #f1f5f9",
        }}>
          {/* Tabs */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "#f8fafc",
            borderRadius: "0.75rem",
            padding: "0.25rem",
            marginBottom: "1.5rem",
          }}>
            {["Kirish", "Ro'yxatdan o'tish"].map((tab, i) => {
              const active = (i === 0 && isLogin) || (i === 1 && !isLogin);
              return (
                <button
                  key={tab}
                  onClick={() => { setIsLogin(i === 0); setError(""); }}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "0.625rem",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    background: active ? "white" : "transparent",
                    color: active ? "#0f172a" : "#94a3b8",
                    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Ism — faqat ro'yxatdan o'tishda */}
            {!isLogin && (
              <div style={{ position: "relative" }}>
                <User size={16} style={{
                  position: "absolute", left: "0.875rem", top: "50%",
                  transform: "translateY(-50%)", color: "#94a3b8",
                }} />
                <input
                  name="name"
                  placeholder="To'liq ismingiz"
                  value={form.name}
                  onChange={handleChange}
                  style={INPUT_STYLE}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{
                position: "absolute", left: "0.875rem", top: "50%",
                transform: "translateY(-50%)", color: "#94a3b8",
              }} />
              <input
                name="email"
                type="email"
                placeholder="Email manzilingiz"
                value={form.email}
                onChange={handleChange}
                style={INPUT_STYLE}
              />
            </div>

            {/* Parol */}
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{
                position: "absolute", left: "0.875rem", top: "50%",
                transform: "translateY(-50%)", color: "#94a3b8",
              }} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Parolingiz"
                value={form.password}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{ ...INPUT_STYLE, paddingRight: "3rem" }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "0.875rem", top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer", color: "#94a3b8", display: "flex",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Xato */}
            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: "0.75rem", padding: "0.75rem 1rem",
                fontSize: "0.875rem", color: "#dc2626",
              }}>
                {error}
              </div>
            )}

            {/* Tugma */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.875rem",
                background: loading
                  ? "#86efac"
                  : "linear-gradient(135deg, #10b981, #3b82f6)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.875rem",
                borderRadius: "0.75rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 12px rgba(16,185,129,0.3)",
                transition: "all 0.2s",
                marginTop: "0.5rem",
              }}
            >
              {loading ? "Yuklanmoqda..." : isLogin ? "Kirish" : "Hisob yaratish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}