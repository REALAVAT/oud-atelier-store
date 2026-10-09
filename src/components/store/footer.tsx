import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const home = await getTranslations("home");
  const year = 2026;

  const columns = [
    {
      title: t("shop"),
      links: [
        { href: "/shop", label: nav("allProducts") },
        { href: "/collections/oud", label: nav("oud") },
        { href: "/collections/floral", label: nav("floral") },
        { href: "/collections/fresh", label: nav("fresh") },
        { href: "/collections/gift-sets", label: nav("gift-sets") },
      ],
    },
    {
      title: t("help"),
      links: [
        { href: "/account", label: nav("account") },
        { href: "/account/orders", label: t("delivery") },
        { href: "/quiz", label: nav("quiz") },
        { href: "/search", label: nav("search") },
      ],
    },
    {
      title: t("house"),
      links: [
        { href: "/#story", label: nav("story") },
        { href: "/shop?sort=rating", label: nav("bestsellers") },
        { href: "/shop?sort=newest", label: nav("newArrivals") },
      ],
    },
  ];

  return (
    <footer className="bg-foreground text-background" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        {t("heading")}
      </h2>
      <div className="container-luxe grid grid-cols-1 gap-14 py-16 lg:grid-cols-[1.3fr_2fr] lg:py-24">
        <div className="max-w-md">
          <Logo light className="items-start" />
          <p className="mt-6 text-sm leading-relaxed text-background/70">{t("tagline")}</p>
          <div className="mt-10">
            <p className="eyebrow !text-gold-light">{home("newsletterEyebrow")}</p>
            <p className="mt-3 font-display text-2xl">{home("newsletterTitle")}</p>
            <NewsletterForm tone="dark" className="mt-5" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 [&>*]:min-w-0">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow !text-gold-light">{col.title}</h3>
              <ul className="mt-5 space-y-3 text-sm text-background/75">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="link-underline hover:text-background">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="eyebrow !text-gold-light">{t("boutique")}</h3>
            <address className="mt-5 space-y-3 text-sm not-italic text-background/75">
              <p>{t("address")}</p>
              <p>{t("hours")}</p>
              <p>
                <a href="mailto:concierge@oudatelier.ae" className="link-underline [overflow-wrap:anywhere] hover:text-background">
                  concierge@oudatelier.ae
                </a>
              </p>
            </address>
          </div>
        </div>
      </div>
      <div className="border-t border-background/15">
        <div className="container-luxe flex flex-col gap-4 py-6 text-xs text-background/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} Oud Atelier. {t("rights")}
          </p>
          <p className="text-background/80">
            {t("demoNote")}
            <a
              href="https://ahmadkhajeh.com"
              target="_blank"
              rel="noopener"
              className="text-gold-light underline-offset-4 hover:underline"
            >
              ahmadkhajeh.com
            </a>
          </p>
          <p className="flex items-center gap-2" aria-label={t("payments")}>
            {["VISA", "Mastercard", "Apple Pay", "Tabby"].map((p) => (
              <span key={p} className="border border-background/25 px-2 py-1 text-[0.65rem] tracking-wider">
                {p}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
