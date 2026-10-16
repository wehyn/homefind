"use client";
import { useState } from "react";

export default function SignOutButton({ className, children }: { className: string; children: string }) {
  const [error, setError] = useState("");
  return <><button className={className} onClick={async () => {
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!response.ok) throw new Error();
      location.href = "/login";
    } catch { setError("Could not sign out. Please try again."); }
  }}>{children}</button>{error && <span className="error" role="alert">{error}</span>}</>;
}
