import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    console.log('Middleware: Protecting route:', req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('Middleware: Checking authorization for:', req.nextUrl.pathname, 'Token exists:', !!token);
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/events/create',
    '/admin/:path*',
    '/staff/:path*',
  ],
};