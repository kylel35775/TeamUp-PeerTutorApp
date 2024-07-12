import { handleAuth, handleLogin, handleLogout, handleCallback } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse, NextRequest } from 'next/server';

const dynamicHandleLogin = (req: NextApiRequest, res: NextApiResponse) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const returnTo = url.searchParams.get('next') || '/dashboard';
    return handleLogin({
        returnTo,
    })(req, res);
};

export const GET = handleAuth({
    login: dynamicHandleLogin,
    signup: handleLogin({
        authorizationParams: {
            screen_hint: "signup",
        },
        returnTo: "/register",
    }),
    logout: handleLogout({
        returnTo: "/",
    }),
    onError(request: NextRequest) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    },
});

