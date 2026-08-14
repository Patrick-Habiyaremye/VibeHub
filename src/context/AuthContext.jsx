import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // Tracks whether the very first auth check has completed, so authLoading
  // only ever flips false once — it does not get re-triggered by every
  // subsequent auth event (token refresh, tab refocus, etc).
  const hasInitialized = useRef(false);

  // -----------------------------
  // Fetch profile
  // -----------------------------
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error.message);
      return null;
    }

    if (!data) {
      console.warn(
        `No profile row found for user ${userId}. Check that a profiles row exists with this id, and that RLS allows the user to select it.`
      );
    }

    return data;
  };

  // -----------------------------
  // Reload profile manually
  // -----------------------------
  const reloadProfile = async () => {
    if (!user) return;

    setProfileLoading(true);
    const data = await fetchProfile(user.id);
    setProfile(data);
    setProfileLoading(false);
  };

  // -----------------------------
  // Sign Up
  // -----------------------------
  const signUp = async (email, password) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/signup-success`,
      },
    });
  };

  // -----------------------------
  // Sign In
  // -----------------------------
  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  // -----------------------------
  // Sign Out
  // -----------------------------
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // -----------------------------
  // Reset Password (send email link)
  // -----------------------------
  // Sends a recovery email containing a link to `redirectTo`. When the user
  // clicks it, Supabase redirects them back with a session already
  // established (via the onAuthStateChange PASSWORD_RECOVERY event), so
  // your /update-password route can call updatePassword() directly.
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { error };
  };

  // -----------------------------
  // Update Password (while authenticated / mid-recovery)
  // -----------------------------
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  // -----------------------------
  // Initialize auth
  // -----------------------------
  // IMPORTANT: this relies solely on onAuthStateChange, not a separate
  // getUser() call, because supabase-js v2 fires an INITIAL_SESSION event
  // through onAuthStateChange on mount. Calling getUser() separately AND
  // listening to onAuthStateChange caused two concurrent, independent
  // profile fetches racing to setProfile() — the source of the
  // intermittent "role not recognized" bug.
  //
  // Also note: when a user clicks the reset-password email link, Supabase
  // fires a PASSWORD_RECOVERY event here with a valid session attached.
  // We don't special-case it — user/profile get set normally like any
  // other sign-in, which is what lets a "protected" /update-password
  // route work without extra logic.
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;

      if (!mounted) return;

      setUser(currentUser);
      setProfileLoading(true);

      if (currentUser) {
        const profileData = await fetchProfile(currentUser.id);
        if (mounted) setProfile(profileData);
      } else {
        setProfile(null);
      }

      if (mounted) {
        setProfileLoading(false);

        if (!hasInitialized.current) {
          hasInitialized.current = true;
          setAuthLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authLoading,
        profileLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        reloadProfile,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}