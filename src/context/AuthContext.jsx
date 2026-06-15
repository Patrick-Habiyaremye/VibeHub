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
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function getUser() {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       setUser(user);
//       setLoading(false);
//     }

//     getUser();

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(
//       (_, session) => {
//         setUser(session?.user ?? null);
//       }
//     );

//     return () => subscription.unsubscribe();
//   }, []);

// async function signUp(email, password){
//   return await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       emailRedirectTo: "http://localhost:5173/confirm",
//     },
//   });
// };

//   async function signIn(email, password) {
//     return await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//   }

//   async function signOut() {
//     return await supabase.auth.signOut();
//   }

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

// export function useAuth() {
//   return useContext(AuthContext);
// }

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Make sure the logged-in user has a matching profiles row so their
  // posts show an author instead of "Unknown User".
  const ensureProfile = async (currentUser) => {
    if (!currentUser) return;

    const username =
      currentUser.user_metadata?.username ||
      currentUser.email?.split("@")[0] ||
      "User";

    const { error } = await supabase.from("profiles").upsert(
      { id: currentUser.id, username },
      { onConflict: "id", ignoreDuplicates: true }
    );

    if (error) console.error("ensureProfile failed:", error.message);
  };

  // Get current session
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      ensureProfile(data?.user);
      setLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        ensureProfile(session?.user);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // SIGN UP
  const signUp = (email, password, username) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    });
  };

  // SIGN IN
  const signIn = (email, password) => {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  // SIGN OUT
  const signOut = () => {
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);