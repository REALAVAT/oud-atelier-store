"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { usePrefs } from "@/stores/prefs";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const t = useTranslations("product");
  const hydrated = useHydrated();
  const wishlist = usePrefs((s) => s.wishlist);
  const toggle = usePrefs((s) => s.toggleWishlist);
  const active = hydrated && wishlist.includes(productId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? t("wishlistRemove") : t("wishlistAdd")}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(productId);
        toast(added ? t("wishlistAdded") : t("wishlistRemoved"));
      }}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full bg-background/85 backdrop-blur transition-colors hover:bg-background",
        className,
      )}
    >
      <Heart
        className={cn("size-[18px] transition-all duration-300", active ? "fill-gold text-gold scale-110" : "text-foreground")}
        strokeWidth={1.4}
        aria-hidden
      />
    </button>
  );
}
