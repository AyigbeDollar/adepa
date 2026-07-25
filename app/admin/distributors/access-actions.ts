"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase";

export interface InviteState {
  error?: string;
  ok?: string;
}

export async function inviteDistributorLogin(
  _prev: InviteState,
  formData: FormData
): Promise<InviteState> {
  const me = await getSessionProfile();
  if (me?.role !== "admin") return { error: "Not authorized." };

  const distributorId = String(formData.get("distributor_id") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim() || null;

  if (!distributorId) return { error: "Missing store." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { error: "Enter a valid email address." };

  const admin = getSupabaseAdmin();

  // Create the login (email pre-confirmed; they sign in via magic link at /login).
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (cErr || !created?.user) {
    return {
      error: /registered|exists/i.test(cErr?.message ?? "")
        ? "That email already has an account."
        : cErr?.message ?? "Could not create the login.",
    };
  }

  // The on-signup trigger already made a profile row; link it to this store.
  const { error: pErr } = await admin
    .from("profiles")
    .update({ distributor_id: distributorId, role: "distributor", full_name: fullName })
    .eq("id", created.user.id);
  if (pErr) return { error: pErr.message };

  revalidatePath(`/admin/distributors/${distributorId}`);
  return { ok: `Invited ${email}. They can sign in at adepa.store/login.` };
}

export async function revokeDistributorLogin(
  userId: string,
  distributorId: string
) {
  const me = await getSessionProfile();
  if (me?.role !== "admin") return;
  const admin = getSupabaseAdmin();
  await admin.auth.admin.deleteUser(userId); // cascades the profile row
  revalidatePath(`/admin/distributors/${distributorId}`);
}
