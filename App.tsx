import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { type Session } from '@supabase/supabase-js';

// No other component imports

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
        const initAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
            if (window.location.hash) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        };

        getSession();
        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session && window.location.hash) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Show a loading indicator while the session is being fetched
    if (loading) {
        return <div>Loading...</div>;
    }

    // If there is no session, show the login page
    if (!session) {
        return (
            <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
                <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google']} />
            </div>
        );
    }

    // If there IS a session, show this hyper-simplified welcome page
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Welcome!</h1>
            <p>You are successfully logged in.</p>
            <p>Your email: {session.user.email}</p>
supabase/config.toml
+2
-2

@@ -95,53 +95,53 @@ port = 54324
# smtp_port = 54325
# pop3_port = 54326
# admin_email = "admin@email.com"
# sender_name = "Admin"

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

# Image transformation API is available to Supabase Pro plan.
# [storage.image_transformation]
# enabled = true

# Uncomment to configure local storage buckets
# [storage.buckets.images]
# public = false
# file_size_limit = "50MiB"
# allowed_mime_types = ["image/png", "image/jpeg"]
# objects_path = "./images"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
site_url = "http://localhost:5173"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
additional_redirect_urls = ["http://localhost:5173"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# Path to JWT signing key. DO NOT commit your signing keys file to git.
# signing_keys_path = "./signing_keys.json"
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = false
# Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
minimum_password_length = 6
# Passwords that do not meet the following requirements will be rejected as weak. Supported values
# are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
password_requirements = ""

[auth.rate_limit]
# Number of emails that can be sent per hour. Requires auth.email.smtp to be enabled.
email_sent = 2
# Number of SMS messages that can be sent per hour. Requires auth.sms to be enabled.
