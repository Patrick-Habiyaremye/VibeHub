//C:\code\KeshApp\VibeHub\src\components\moments\MomentsRoot.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { MomentsProvider } from "./MomentsProvider";

// ---------------------------------------------------------------------------
// Resolves the current Supabase user independently and hands it to
// MomentsProvider. Kept separate from MomentsProvider on purpose: this is
// the one piece that talks to your auth system, and auth systems vary
// project to project (context, hook, prop-drilled from AppLayout, etc).
// By resolving it here via supabase.auth directly, MomentsProvider stays a
// pure "user in, moments state out" component that doesn't care how you
// wired auth — and this file is the only one you'd ever need to touch if
// that changes.
//
// Sits ONE level above AppLayout in App.jsx:
//   <ProtectedRoute>
//     <MomentsRoot>
//       <AppLayout />
//     </MomentsRoot>
//   </ProtectedRoute>
// ---------------------------------------------------------------------------

export default function MomentsRoot({ children }) {
  // undefined = auth not resolved yet, null = resolved and signed out,
  // object = resolved and signed in. We only distinguish undefined vs.
  // the rest internally; MomentsProvider just gets null | user either way,
  // so it never renders "your vibe" against a still-loading auth state.
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.error("MomentsRoot: failed to resolve user", error);
        setUser(null);
        return;
      }
      setUser(data?.user ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  return <MomentsProvider user={user ?? null}>{children}</MomentsProvider>;
}