import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AccountShell } from "@/components/account/account-shell";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AccountLayout({ children, params }: LayoutProps<"/[locale]/account">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AccountShell>{children}</AccountShell>;
}
