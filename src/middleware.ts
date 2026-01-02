import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        console.log("[Middleware] Processing:", req.nextUrl.pathname);
        
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard") ||
            req.nextUrl.pathname.startsWith("/admin");

        // Ne pas intercepter les API routes
        if (req.nextUrl.pathname.startsWith("/api/")) {
            console.log("[Middleware] Skipping API route");
            return NextResponse.next();
        }

        if (isProtectedRoute && !isAuth) {
            console.log("[Middleware] Redirecting to login - no auth");
            return NextResponse.redirect(new URL("/login", req.url));
        }

        if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
            console.log("[Middleware] Redirecting to login - not admin");
            return NextResponse.redirect(new URL("/login", req.url));
        }

        if (req.nextUrl.pathname.startsWith("/dashboard") && token?.role !== "STORE") {
            console.log("[Middleware] Redirecting to login - not store");
            return NextResponse.redirect(new URL("/login", req.url));
        }

        console.log("[Middleware] Allowing request");
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
