"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

export default function Nav() {
  const { count } = useCart();
  const pathname = usePathname();
  const onShop = pathname?.startsWith("/shop");

  return (
    <header className="glass hairline-b fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex h-12 max-w-5xl items-center justify-between px-5">
        <Link
          href="/"
          className="text-[17px] font-semibold tracking-tight text-foreground"
        >
          adepa<span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/shop"
            className={`text-[13px] transition-colors ${
              onShop ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            Shop
          </Link>
          <Link
            href="/#how"
            className="hidden text-[13px] text-muted transition-colors hover:text-foreground sm:block"
          >
            How it works
          </Link>
          <Link
            href="/#distributors"
            className="hidden text-[13px] text-muted transition-colors hover:text-foreground sm:block"
          >
            For distributors
          </Link>
          <Link
            href="/shop?cart=1"
            aria-label={`Cart, ${count} items`}
            className="relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && (
              <span
                key={count}
                className="pop absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white"
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
