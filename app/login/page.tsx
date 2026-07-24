"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") ? "That sign-in link expired — request a new one." : null
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirect },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5">
      <h1 className="text-3xl font-semibold tracking-tight">
        adepa<span className="text-accent">.</span> team
      </h1>
      <p className="mt-2 text-[14px] text-muted">
        Admin &amp; distributor sign-in. We&apos;ll email you a secure link — no
        password needed.
      </p>

      {sent ? (
        <div className="mt-8 rounded-2xl bg-surface p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="text-4xl">📬</div>
          <p className="mt-3 text-[15px] font-medium">Check your email</p>
          <p className="mt-1 text-[13px] text-muted">
            We sent a sign-in link to <span className="font-medium">{email}</span>.
            Open it on this device to continue.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <label className="block">
            <span className="text-[12px] font-medium text-muted">Email</span>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-black/25 focus:ring-2 focus:ring-accent/40"
            />
          </label>
          {error && <p className="text-[13px] text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-accent py-3.5 text-[15px] font-medium text-white transition-all hover:bg-accent-dark active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Sending link…" : "Email me a sign-in link"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
