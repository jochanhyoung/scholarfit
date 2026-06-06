import { createContext, useContext } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string | undefined;
  name: string | undefined;
  profileImage: string | undefined;
}

export interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function toAuthUser(supabaseUser: User): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name,
    profileImage: supabaseUser.user_metadata?.avatar_url ?? supabaseUser.user_metadata?.picture,
  };
}

export async function signInWithGoogle() {
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function deleteAccount(accessToken: string): Promise<void> {
  const res = await fetch("/api/auth/delete-account", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || "계정 삭제에 실패했습니다.");
  }
}

export async function upsertUserProfile(user: AuthUser) {
  const { error } = await supabase.from("users").upsert(
    {
      auth_user_id: user.id,
      email: user.email,
      name: user.name,
      profile_image: user.profileImage,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "auth_user_id" }
  );
  if (error) console.error("프로필 upsert 실패:", error.message);
}
