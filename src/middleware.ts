import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Define paths that are considered public (accessible without a token)
    const isPublicPath = path === '/login' || path === '/signup' || path === '/verifyemail'

    // Get the token and loginTime from the cookies
    const token = request.cookies.get('token')?.value || ''
    const loginTime = request.cookies.get('loginTime')?.value || ''

    if (loginTime) {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - Number(loginTime);

        if (elapsedTime > 3600000) {  // Check if more than 1 hour has passed
            // Clear cookies if session expired
            const response = NextResponse.redirect(new URL('/login', request.nextUrl));
            response.cookies.set('token', '', { maxAge: 0, path: '/' });  // Clear the token cookie
            response.cookies.set('loginTime', '', { maxAge: 0, path: '/' });  // Clear the loginTime cookie
            return response;
        }
    }

    // Redirect logic based on the path and token presence
    if (isPublicPath && token) {
        // If trying to access a public path with a token, redirect to the dashboard
        return NextResponse.redirect(new URL('/', request.nextUrl))
    }

    // If trying to access a protected path without a token, redirect to the login page
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.nextUrl))
    }
}

// Specify the paths for which this middleware should be executed
export const config = {
    matcher: [
        '/',
        '/profile',
        '/login',
        '/signup',
        '/verifyemail'
    ]
}
