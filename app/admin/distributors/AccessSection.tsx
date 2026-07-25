"use client";

import { useActionState, useTransition } from "react";
import {
  inviteDistributorLogin,
  revokeDistributorLogin,
  type InviteState,
} from "./access-actions";

export interface Login {
  id: string;
  email: string | null;
  fullName: string | null;
}

export default function AccessSection({
  distributorId,
  logins,
}: {
  distributorId: string;
  logins: Login[];
}) {
  const [state, action, pending] = useActionState<InviteState, FormData>(
    inviteDistributorLogin,
    {}
  );
  const [revoking, startRevoke] = useTransition();

  return (
    <section className="mt-10 max-w-xl border-t border-hairline pt-6">
      <h2 className="text-[16px] font-semibold tracking-tight">Store logins</h2>
      <p className="mt-1 text-[13px] text-muted">
        People who can sign in to the distributor portal and work this store’s
        orders. They sign in with a magic link — no password.
      </p>

      {logins.length > 0 && (
        <ul className="mt-4 divide-y divide-hairline rounded-2xl bg-surface">
          {logins.map((l) => (
            <li key={l.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium">{l.email ?? l.id}</p>
                {l.fullName && (
                  <p className="text-[12px] text-muted">{l.fullName}</p>
                )}
              </div>
              <button
                disabled={revoking}
                onClick={() => {
                  if (confirm(`Revoke access for ${l.email}?`))
                    startRevoke(() => revokeDistributorLogin(l.id, distributorId));
                }}
                className="text-[12px] font-medium text-red-600 hover:opacity-70 disabled:opacity-50"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}

      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="distributor_id" value={distributorId} />
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[12px] font-medium text-muted">Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="store-owner@example.com"
              className="mt-1 w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-accent/40"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-muted">Name (optional)</span>
            <input
              name="full_name"
              placeholder="Kwame Owusu"
              className="mt-1 w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-accent/40"
            />
          </label>
        </div>
        {state.error && <p className="text-[13px] text-red-600">{state.error}</p>}
        {state.ok && <p className="text-[13px] text-green-700">{state.ok}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-foreground px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Inviting…" : "Invite login"}
        </button>
      </form>
    </section>
  );
}
