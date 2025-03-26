import { clerkMiddleware } from '@clerk/nextjs/server'

// This example show how to use clerkMiddleware to protect routes
export default clerkMiddleware(async (auth, req, evt) => {
  // Check if the request is for the dashboard route
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    // If not signed in, redirect to sign-in page
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/sign-up', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return Response.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
} 