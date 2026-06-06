import { useState, useEffect, useCallback, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  AuthContext,
  toAuthUser,
  signInWithGoogle,
  signOut,
  upsertUserProfile,
  type AuthUser,
} from "@/lib/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(toAuthUser(session.user));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          const authUser = toAuthUser(session.user);
          setUser(authUser);
          if (event === "SIGNED_IN") {
            upsertUserProfile(authUser);
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
