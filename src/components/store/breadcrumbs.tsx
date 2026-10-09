import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { localeUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Crumb = { name: string; href: string };

export function Breadcrumbs({ items, locale, className }: { items: Crumb[]; locale: string; className?: string }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items.map((i) => ({ name: i.name, url: localeUrl(locale, i.href === "/" ? "" : i.href) })))} />
      <nav aria-label="Breadcrumb" className={cn("text-xs text-muted-foreground", className)}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-1.5">
              {i < items.length - 1 ? (
                <>
                  <Link href={item.href} className="hover:text-foreground">
                    {item.name}
                  </Link>
                  <ChevronRight className="size-3 rtl:rotate-180" aria-hidden />
                </>
              ) : (
                <span aria-current="page" className="text-foreground">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
