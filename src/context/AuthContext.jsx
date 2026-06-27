// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Make sure the logged-in user has a matching profiles row so their
//   // posts show an author instead of "Unknown User".
//   const ensureProfile = async (currentUser) => {
//     if (!currentUser) return;

//     const username =
//       currentUser.user_metadata?.username ||
//       currentUser.email?.split("@")[0] ||
//       "User";

//     const { error } = await supabase.from("profiles").upsert(
//       { id: currentUser.id, username }
//     );

//     if (error) console.error("ensureProfile failed:", error.message);
//   };

//   // Get current session
//   useEffect(() => {
//     const getUser = async () => {
//       const { data } = await supabase.auth.getUser();
//       setUser(data?.user || null);
//       ensureProfile(data?.user);
//       setLoading(false);
//     };

//     getUser();

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         setUser(session?.user || null);
//         ensureProfile(session?.user);
//       }
//     );

//     return () => listener.subscription.unsubscribe();
//   }, []);

//   // SIGN UP
//   const signUp = (email, password, username) => {
//     return supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: { username },
//         emailRedirectTo: `${window.location.origin}/confirm`,
//       },
//     });
//   };

//   // SIGN IN
//   const signIn = (email, password) => {
//     return supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//   };

//   // SIGN OUT
//   const signOut = () => {
//     return supabase.auth.signOut();
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, loading, signUp, signIn, signOut }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// import { supabase } from "../supabaseClient";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] =
//     useState(true);

//   const ensureProfile = async (
//     currentUser
//   ) => {
//     if (!currentUser) return;

//     const username =
//       currentUser.user_metadata
//         ?.username ||
//       currentUser.email?.split("@")[0] ||
//       "user";

//     const { error } =
//       await supabase
//         .from("profiles")
//         .upsert({
//           id: currentUser.id,
//           username,
//         });

//     if (error) {
//       console.error(
//         "ensureProfile:",
//         error
//       );
//     }
//   };

//   useEffect(() => {
//     const getCurrentUser =
//       async () => {
//         const { data } =
//           await supabase.auth.getUser();

//         setUser(
//           data?.user || null
//         );

//         if (data?.user) {
//           await ensureProfile(
//             data.user
//           );
//         }

//         setLoading(false);
//       };

//     getCurrentUser();

//     const {
//       data: listener,
//     } =
//       supabase.auth.onAuthStateChange(
//         async (
//           _event,
//           session
//         ) => {
//           const currentUser =
//             session?.user || null;

//           setUser(currentUser);

//           if (currentUser) {
//             await ensureProfile(
//               currentUser
//             );
//           }
//         }
//       );

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   const signUp = (
//     email,
//     password,
//     username
//   ) => {
//     return supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: { username },
//         emailRedirectTo:
//           `${window.location.origin}/confirm`,
//       },
//     });
//   };

//   const signIn = (
//     email,
//     password
//   ) => {
//     return supabase.auth.signInWithPassword(
//       {
//         email,
//         password,
//       }
//     );
//   };

//   const signOut = () => {
//     return supabase.auth.signOut();
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         signUp,
//         signIn,
//         signOut,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () =>
//   useContext(AuthContext);

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
// } from "react";
// import { supabase } from "../supabaseClient";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 🔥 Fetch profile safely
//   async function fetchProfile(userId) {
//     const { data, error } = await supabase
//       .from("profiles")
//       .select("*")
//       .eq("id", userId)
//       .maybeSingle(); // ✅ safer than single()

//     if (error) {
//       console.error("fetchProfile error:", error);
//       return null;
//     }

//     return data;
//   }

//   // 🔥 Ensure minimal profile exists
//   async function ensureProfile(currentUser) {
//     if (!currentUser) return;

//     const username =
//       currentUser.user_metadata?.username ||
//       currentUser.email?.split("@")[0] ||
//       "user";

//     await supabase.from("profiles").upsert({
//       id: currentUser.id,
//       username,
//       full_name: "",
//       bio: "",
//       avatar_url: "",
//     });
//   }

//   useEffect(() => {
//     async function init() {
//       try {
//         const {
//           data: { user },
//         } = await supabase.auth.getUser();

//         setUser(user);

//         if (user) {
//           await ensureProfile(user);
//           const profileData = await fetchProfile(user.id);
//           setProfile(profileData);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     init();

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(
//       async (_event, session) => {
//         const currentUser = session?.user || null;

//         setUser(currentUser);

//         if (currentUser) {
//           await ensureProfile(currentUser);
//           const profileData = await fetchProfile(currentUser.id);
//           setProfile(profileData);
//         } else {
//           setProfile(null);
//         }
//       }
//     );

//     return () => subscription.unsubscribe();
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{ user, profile, loading, setProfile }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);

// 


// i

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 🔥 FETCH PROFILE (INCLUDING ROLE)
  const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error(error.message);
    return null;
  }

  return data;
};
  // const fetchProfile = async (userId) => {
  //   const { data, error } = await supabase
  //     .from("profiles")
  //     .select("*")
  //     .eq("id", userId)
  //     .single();

  //   if (error) {
  //     console.error("Profile fetch error:", error.message);
  //     return null;
  //   }

  //   return data;
  // };

const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/signup-success`,
    },
  });

  return { data, error };
};

  // 🔥 INIT AUTH
  useEffect(() => {
    const init = async () => {
      setAuthLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user ?? null);

      if (user) {
        const profileData = await fetchProfile(user.id);
        setProfile(profileData);
      }

      setAuthLoading(false);
    };

    init();

    // realtime auth changes
const {
  data: { subscription },
} = supabase.auth.onAuthStateChange(
  async (_event, session) => {
    const currentUser = session?.user ?? null;

    setUser(currentUser);

    if (currentUser) {
      const profile = await fetchProfile(currentUser.id);
      setProfile(profile);
    } else {
      setProfile(null);
    }

    setAuthLoading(false);
  }
);

return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  return { data, error };
};

  // 🔥 SIGN OUT
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
<AuthContext.Provider
  value={{
    user,
    profile,
    authLoading,
    signUp,
    signIn,
    signOut,
  }}
>
  {children}
</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);