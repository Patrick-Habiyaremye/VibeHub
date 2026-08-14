import { useEffect } from "react";
import { supabase } from "../../../supabaseClient";

export function useProfileSupportRealtime({
  profileUserId,
  onChanged,
}) {
  useEffect(() => {
    if (!profileUserId) {
      return undefined;
    }

    const channel = supabase
      .channel(
        `profile-support-${profileUserId}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "supporters",
          filter: `supported_user_id=eq.${profileUserId}`,
        },
        () => {
          onChanged?.();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "supporters",
          filter: `supporter_id=eq.${profileUserId}`,
        },
        () => {
          onChanged?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    profileUserId,
    onChanged,
  ]);
}