
import { requireSupabase } from "./supabase";

export async function signUp(email: string, password: string) {
  return requireSupabase().auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return requireSupabase().auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return requireSupabase().auth.signOut();
}

export async function resetPassword(email: string) {
  return requireSupabase().auth.resetPasswordForEmail(email);
}

export async function getCurrentUser() {
  const { data, error } = await requireSupabase().auth.getUser();
  if (error) throw error;
  return data.user;
}
