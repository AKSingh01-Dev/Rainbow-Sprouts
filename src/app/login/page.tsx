"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enter" | "password" | "verify">("enter");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function requestOtp() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not send code.");
      return;
    }
    setStep("verify");
  }

  async function loginWithPassword() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Invalid password.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  function continueWithIdentifier() {
    if (identifier.trim().toLowerCase() === "ankit7779845484@gmail.com") {
      setStep("password");
      return;
    }
    requestOtp();
  }

  async function verifyOtp() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, code }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Invalid code.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl mb-6">Log in</h1>
      <div className="card space-y-4">
        {step === "enter" ? (
          <>
            <div>
              <label className="block text-sm text-subtle mb-1">Phone number or email</label>
              <input
                className="input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or +91XXXXXXXXXX"
              />
            </div>
            {error && <p className="text-rust text-sm">{error}</p>}
            <button className="btn-primary w-full" disabled={loading || !identifier} onClick={continueWithIdentifier}>
              {loading ? "Continuing…" : "Continue"}
            </button>
          </>
        ) : step === "password" ? (
          <>
            <p className="text-sm text-subtle">Enter the admin password to continue.</p>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
            />
            {error && <p className="text-rust text-sm">{error}</p>}
            <button className="btn-primary w-full" disabled={loading || !password} onClick={loginWithPassword}>
              {loading ? "Logging in…" : "Log in"}
            </button>
            <button className="text-sm text-subtle underline" onClick={() => setStep("enter")}>
              Use a different phone or email
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-subtle">We sent a 6-digit code to {identifier}.</p>
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />
            {error && <p className="text-rust text-sm">{error}</p>}
            <button className="btn-primary w-full" disabled={loading || code.length !== 6} onClick={verifyOtp}>
              {loading ? "Verifying…" : "Verify & log in"}
            </button>
            <button className="text-sm text-subtle underline" onClick={() => setStep("enter")}>
              Use a different phone or email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
