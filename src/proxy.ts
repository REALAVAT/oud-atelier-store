import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const demo = !(supabaseUrl && supabaseKey);

const ADMIN_PATH = /^\/(en|ar)\/admin(\/|$)/;
const ACCOUNT_PATH = /^\/(en|ar)\/account(\/|$)/;

export default async function proxy(request: NextRequest) {
  const response = intl(request);
  const { pathname } = request.nextUrl;
  const isAdmin = ADMIN_PATH.test(pathname);
  const isAccount = ACCOUNT_PATH.test(pathname);

  if (demo) {
    if (isAdmin && request.cookies.get("oa_demo_role")?.value !== "admin") {
      return redirectToLogin(request, pathname);
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if ((isAdmin || isAccount) && !user) return redirectToLogin(request, pathname);
  if (isAdmin && user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (data?.role !== "admin") return redirectToLogin(request, pathname);
  }
  return response;
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const locale = pathname.split("/")[1] || routing.defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}/login`;
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|apple-icon|.*\\..*).*)"],
};
