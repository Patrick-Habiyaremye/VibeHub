import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

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
        emailRedirectTo:
          `${window.location.origin}/signup-success`,
      },
    });
  };

  // -----------------------------
  // Sign In
  // -----------------------------
  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
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
  // Initialize auth
  // -----------------------------
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setAuthLoading(true);
      setProfileLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(user ?? null);

      if (user) {
        const profileData = await fetchProfile(user.id);

        if (mounted) {
          setProfile(profileData);
        }
      } else {
        setProfile(null);
      }

      if (mounted) {
        setProfileLoading(false);
        setAuthLoading(false);
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;

        setUser(currentUser);

        setProfileLoading(true);

        if (currentUser) {
          const profileData =
            await fetchProfile(currentUser.id);

          if (mounted) {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }

        if (mounted) {
          setProfileLoading(false);
        }
      }
    );

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