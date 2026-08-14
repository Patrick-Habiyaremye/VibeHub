import { useEffect } from "react";
import { supabase } from "../../../supabaseClient";

export default function useRealtimeSupportStats({
  profileId,
  onChange,
}) {
  useEffect(() => {
    if (!profileId || !onChange) {
      return undefined;
    }

    const channel = supabase
      .channel(`profile-support-stats:${profileId}`)

      /*
       * Somebody started/stopped supporting THIS profile.
       *
       * This affects:
       *
       * profile.supportersCount
       */

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "supporters",
          filter: `supported_user_id=eq.${profileId}`,
        },
        () => {
          onChange();
        }
      )

      /*
       * This profile started/stopped supporting somebody.
       *
       * This affects:
       *
       * profile.supportingCount
       */

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "supporters",
          filter: `supporter_id=eq.${profileId}`,
        },
        () => {
          onChange();
        }
      )

      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error(
            "[useRealtimeSupportStats] Channel error"
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, onChange]);
}