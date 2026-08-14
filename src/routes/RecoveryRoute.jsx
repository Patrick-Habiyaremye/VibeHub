import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function RecoveryRoute({ children }) {
  const [status, setStatus] = useState("checking"); // "checking" | "allowed" | "denied"

  useEffect(() => {
    let isMounted = true;

    // Supabase fires PASSWORD_RECOVERY when the user lands here via a
    // valid reset-password email link, and it sets a temporary session.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        if (event === "PASSWORD_RECOVERY" && session) {
          setStatus("allowed");
        }
      }
    );

    // Fallback: if the listener already fired before this component
    // mounted (can happen depending on redirect timing), check the
    // current session directly.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setStatus((prev) => (prev === "allowed" ? prev : session ? "allowed" : "denied"));
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <p className="text-slate-400">Verifying reset link...</p>
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/login" replace />;
  }

  return children;
}