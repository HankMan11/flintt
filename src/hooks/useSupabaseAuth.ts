
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

// Use this hook in your App/provider for session management
export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state change FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sessionNew) => {
      setSession(sessionNew);
      setUser(sessionNew?.user ?? null);
      setLoading(false);
    });
    // Then check current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Sign up with username, email, password, avatar_url, name (optional)
  const signUp = useCallback(async ({
    email,
    password,
    username,
    avatar_url,
    name,
  }: { email: string; password: string; username: string; avatar_url?: string; name?: string }) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, avatar_url, name },
      },
    });
  }, []);
  
  // Log in
  const signIn = useCallback(async ({
    email, password
  }: { email: string; password: string }) => {
    return await supabase.auth.signInWithPassword({ email, password });
  }, []);
  
  // Log out
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  return { session, user, loading, signUp, signIn, signOut };
}
