"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setError((await res.json()).error || "Login failed"); return; }
      router.push("/admin");
      router.refresh();
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-xs">
      <div className="border border-border p-6">
        <div className="text-sm text-primary font-medium mb-6">admin login</div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs text-muted-foreground mb-1">username</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className="md-field" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs text-muted-foreground mb-1">password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="md-field" required />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button type="submit" disabled={loading}
            className="md-btn md-btn-filled w-full">
            {loading ? "..." : "login"}
          </button>
        </form>
      </div>
    </div>
  );
}
