import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "redirect" is in param, use it as the redirect URL
    const redirectPath = searchParams.get('redirect') ?? '/';

    if (code) {
        const supabase = await createClient();
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && session) {
            const email = session.user.email;
            if (!email.endsWith('@uw.edu')) {
                // Sign out immediately and redirect with domain_restricted error
                await supabase.auth.signOut();
                return NextResponse.redirect(`${origin}/login?error=domain_restricted`);
            }

            // Ensure profile exists for the user after Google sign-in
            await supabase.from('profiles').upsert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || '',
            });

            const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development';

            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${redirectPath}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
            } else {
                return NextResponse.redirect(`${origin}${redirectPath}`);
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
