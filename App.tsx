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
            setSession(session);
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
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
            <button 
                onClick={async () => {
                    await supabase.auth.signOut();
                }}
                style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}
            >
                Logout
            </button>
        </div>
    );
};

export default App;
