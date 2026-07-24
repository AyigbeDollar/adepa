import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Nav from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "adepa — your provisions, straight to your door",
  description:
    "Adepa brings your favourite provisions straight to your door at the best prices on the market. Same-day delivery, pay with mobile money.",
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Nav />
          <main className="flex-1 pt-12">{children}</main>
          <footer className="border-t border-hairline bg-surface">
            <div className="mx-auto max-w-5xl px-5 py-8 text-[12px] leading-5 text-muted">
              <p className="font-medium text-foreground">
                adepa<span className="text-accent">.</span>
              </p>
              <p className="mt-1">
                Your provisions, straight to your door. Accra · Tema ·
                Kumasi · Takoradi.
              </p>
              <p className="mt-3">
                Payments secured by Paystack — MTN MoMo, Telecel Cash,
                AT Money and cards. © {new Date().getFullYear()} Adepa.
              </p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
