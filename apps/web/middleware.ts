import { NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const isProtected = pathname.startsWith("/app") || pathname.startsWith("/admin");

  if (isProtected && !request.auth?.user) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (pathname.startsWith("/admin") && request.auth?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/app", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"]
};
