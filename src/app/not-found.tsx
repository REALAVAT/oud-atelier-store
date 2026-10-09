import Link from "next/link";
import { inter, cormorant } from "@/lib/fonts";

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="flex min-h-dvh items-center justify-center bg-background p-8 text-center font-sans">
        <main>
          <p className="eyebrow">404</p>
          <h1 className="mt-4 font-display text-5xl">This page has evaporated</h1>
          <p className="mt-4 text-muted-foreground">The page you are looking for is no longer here.</p>
          <Link href="/en" className="mt-8 inline-block border border-foreground px-7 py-3 text-xs uppercase tracking-[0.2em]">
            Return home
          </Link>
        </main>
      </body>
    </html>
  );
}
