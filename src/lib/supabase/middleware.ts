import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/auth/callback",
  "/shared",
  "/checkout",
  "/free",
  "/plans",
  "/about",
  "/blog",
  "/contact",
  "/changelog",
  "/privacy",
  "/terms",
  "/cookies",
  "/support",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
  "/twitter-image",
  "/manifest.json",
];

export async function updateSession(request: NextRequest) {
  // Check public routes FIRST — before any Supabase calls
  const isPublicRoute =
    PUBLIC_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route)) ||
    request.nextUrl.pathname === "/";

  // Public routes never need auth — skip Supabase entirely
  if (isPublicRoute) {
    return NextResponse.next({ request });
  }

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value } of cookiesToSet) {
              request.cookies.set(name, value);
            }
            supabaseResponse = NextResponse.next({ request });
            for (const { name, value, options } of cookiesToSet) {
              supabaseResponse.cookies.set(name, value, options);
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect unauthenticated users to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from login
    if (user && request.nextUrl.pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    // If Supabase fails, let the request through
    return NextResponse.next({ request });
  }
}
