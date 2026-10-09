"use client";

import { useTranslations } from "next-intl";
import { useCatalog } from "@/components/providers/catalog-provider";

export function WhatsAppButton() {
  const t = useTranslations("common");
  const { settings } = useCatalog();
  const number = settings.whatsapp.replace(/\D/g, "");
  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent("Hello Oud Atelier, I would like some help choosing a fragrance.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp")}
      className="fixed bottom-5 end-5 z-30 flex size-14 items-center justify-center rounded-full bg-[#1f7a4d] text-white shadow-[0_12px_30px_-10px_rgba(14,13,11,0.5)] transition-transform duration-300 hover:scale-105 wa-btn"
    >
      <svg viewBox="0 0 32 32" className="size-7" fill="currentColor" aria-hidden>
        <path d="M16.004 3C9.38 3 4 8.38 4 15c0 2.34.68 4.6 1.96 6.55L4 29l7.66-1.93A11.95 11.95 0 0 0 16 28c6.62 0 12-5.38 12-12S22.63 3 16.004 3Zm0 21.8c-1.8 0-3.56-.48-5.1-1.4l-.37-.22-4.55 1.15 1.21-4.43-.24-.38A9.76 9.76 0 0 1 6.2 15c0-5.4 4.4-9.8 9.8-9.8 5.4 0 9.8 4.4 9.8 9.8 0 5.4-4.4 9.8-9.8 9.8Zm5.38-7.34c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.71.23 1.36.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
