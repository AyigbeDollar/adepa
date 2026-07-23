import Link from "next/link";
import { CATEGORIES, DEMO_PRODUCTS } from "@/lib/demo-data";

const CATEGORY_EMOJI: Record<string, string> = {
  "Staples & Grains": "🍚",
  Beverages: "🧃",
  "Cooking Essentials": "🍅",
  "Snacks & Biscuits": "🍪",
  "Home & Cleaning": "🧺",
  "Personal Care": "🧴",
};

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pb-20 pt-20 text-center sm:pt-28">
        <p className="fade-up text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
          Accra · Tema · Kumasi · Takoradi
        </p>
        <h1 className="fade-up fade-up-1 mx-auto mt-4 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          Everyday goods.
          <br />
          <span className="text-muted">Straight from the source.</span>
        </h1>
        <p className="fade-up fade-up-2 mx-auto mt-6 max-w-xl text-[19px] leading-7 text-muted">
          Adepa connects Ghana&apos;s FMCG distributors directly to your door.
          Distributor prices, same-day in-house delivery, and payment with the
          mobile money you already use.
        </p>
        <div className="fade-up fade-up-3 mt-9 flex items-center justify-center gap-4">
          <Link
            href="/shop"
            className="rounded-full bg-accent px-7 py-3 text-[15px] font-medium text-white shadow-sm transition-all hover:bg-accent-dark hover:shadow-md active:scale-[0.98]"
          >
            Start shopping
          </Link>
          <a
            href="#how"
            className="text-[15px] font-medium text-accent transition-opacity hover:opacity-70"
          >
            How it works ›
          </a>
        </div>
      </section>

      {/* Category strip */}
      <section className="border-y border-hairline bg-surface py-12">
        <div className="no-scrollbar mx-auto flex max-w-5xl gap-3 overflow-x-auto px-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href="/shop"
              className="flex min-w-36 flex-1 flex-col items-center gap-2 rounded-2xl bg-background px-4 py-6 transition-transform hover:-translate-y-0.5"
            >
              <span className="text-3xl">{CATEGORY_EMOJI[c]}</span>
              <span className="whitespace-nowrap text-[13px] font-medium">
                {c}
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-center text-[13px] text-muted">
          {DEMO_PRODUCTS.length}+ trusted brands — Gino, Frytol, Milo, Indomie,
          Voltic and more.
        </p>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-5xl scroll-mt-16 px-5 py-24">
        <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
          Three taps. Done.
        </h2>
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {[
            {
              n: "01",
              t: "Share your location",
              d: "One tap. Adepa instantly matches you to the licensed distributor covering your neighbourhood.",
              e: "📍",
            },
            {
              n: "02",
              t: "Fill your basket",
              d: "Shop the full FMCG catalogue at distributor-honest prices — no market mark-ups, no middlemen.",
              e: "🛒",
            },
            {
              n: "03",
              t: "Pay & relax",
              d: "Pay with MoMo or card. Our in-house riders bring it to your door, and your distributor is paid instantly.",
              e: "🛵",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-3xl bg-surface p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="text-4xl">{s.e}</div>
              <p className="mt-5 text-[12px] font-semibold tracking-[0.15em] text-accent">
                {s.n}
              </p>
              <h3 className="mt-2 text-[19px] font-semibold tracking-tight">
                {s.t}
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Distributor pitch */}
      <section
        id="distributors"
        className="border-t border-hairline bg-foreground py-24 text-white"
      >
        <div className="mx-auto max-w-5xl px-5 text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-gold">
            For distributors
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Sell direct. Get paid the moment they do.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-7 text-white/70">
            Every order in your zone routes to you automatically. Paystack
            split settlement sends your share straight to your account the
            instant a customer pays — no invoicing, no chasing, no waiting.
          </p>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
            {[
              ["Instant settlement", "Your payout leaves the platform the moment payment clears."],
              ["Zero storefront cost", "No shop rent, no sales team. We bring the demand to you."],
              ["Own your zone", "Exclusive routing for every home order inside your radius."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white/5 p-6">
                <h3 className="text-[15px] font-semibold">{t}</h3>
                <p className="mt-1.5 text-[13px] leading-5 text-white/60">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-[14px] text-white/60">
            Want a zone?{" "}
            <a
              href="mailto:partners@adepa.store"
              className="font-medium text-white underline-offset-4 hover:underline"
            >
              partners@adepa.store
            </a>
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-5xl px-5 py-24 text-center">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Your market run,{" "}
          <span className="text-accent">without the run.</span>
        </h2>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-accent px-7 py-3 text-[15px] font-medium text-white shadow-sm transition-all hover:bg-accent-dark hover:shadow-md active:scale-[0.98]"
        >
          Start shopping
        </Link>
      </section>
    </div>
  );
}
