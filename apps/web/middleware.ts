import { NextResponse, type NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = pathname.startsWith("/app") || pathname.startsWith("/admin");
  const hasSession = Boolean(request.cookies.get("speakloop_user_id")?.value);

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"]
};
