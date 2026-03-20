import supabase from '../lib/supabase';

// sign up
export async function signUp(email: string, password: string, name: string, avatar: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        avatar,
      },
    },
  });

  if (error) throw error;

  return data;
}

// sign in
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

// get session check if logged in
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  return data.session;
}

// sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

// react on any change if login, logout, session changes
export function onAuthStateChange(callback: () => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    callback();
  });

  return () => {
    subscription.unsubscribe();
  };
}
