import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/distributors", label: "Distributors" },
  { href: "/admin/products", label: "Catalogue" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/admin");
  if (profile.role !== "admin") redirect("/portal");

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            adepa admin
          </p>
          <p className="text-[13px] text-muted">{profile.email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="rounded-full bg-surface px-4 py-2 text-[12px] font-medium text-muted shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:text-foreground">
            Sign out
          </button>
        </form>
      </header>

      <nav className="no-scrollbar mt-4 flex gap-1 overflow-x-auto">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <main className="mt-6">{children}</main>
    </div>
  );
}
