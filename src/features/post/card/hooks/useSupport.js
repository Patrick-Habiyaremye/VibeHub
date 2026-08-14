// src/components/card/hooks/useSupport.js

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../../../supabaseClient";
import { useAuth } from "../../../../context/AuthContext";

export default function useSupport(supportedUserId) {
  const { user } = useAuth();

  const [isSupporting, setIsSupporting] = useState(false);
  const [loading, setLoading] = useState(false);

  /*
   * -------------------------------------------------------
   * LOAD CURRENT SUPPORT STATE
   * -------------------------------------------------------
   */

  const loadSupportState = useCallback(async () => {
    if (!user?.id || !supportedUserId) {
      setIsSupporting(false);
      return;
    }

    if (user.id === supportedUserId) {
      setIsSupporting(false);
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("supporters")
      .select("supporter_id")
      .eq("supporter_id", user.id)
      .eq("supported_user_id", supportedUserId)
      .maybeSingle();

    if (error) {
      console.error(
        "[useSupport] Failed to load support state:",
        error
      );

      return;
    }

    setIsSupporting(Boolean(data));
  }, [user?.id, supportedUserId]);

  useEffect(() => {
    loadSupportState();
  }, [loadSupportState]);


  /*
   * -------------------------------------------------------
   * TOGGLE SUPPORT
   * -------------------------------------------------------
   */

  const toggle = useCallback(async () => {
    if (loading) {
      return;
    }

    if (!user?.id) {
      throw new Error("You must be signed in to support someone.");
    }

    if (!supportedUserId) {
      throw new Error("Creator ID is required.");
    }

    if (user.id === supportedUserId) {
      return;
    }

    const previous = isSupporting;

    setLoading(true);

    // optimistic update
    setIsSupporting(!previous);

    try {
      /*
       * -----------------------------------------------
       * REMOVE SUPPORT
       * -----------------------------------------------
       */

      if (previous) {
        const {
          error,
        } = await supabase
          .from("supporters")
          .delete()
          .eq("supporter_id", user.id)
          .eq("supported_user_id", supportedUserId);

        if (error) {
          throw error;
        }

        return {
          action: "removed",
          supportedUserId,
        };
      }


      /*
       * -----------------------------------------------
       * ADD SUPPORT
       * -----------------------------------------------
       */

      const {
        error,
      } = await supabase
        .from("supporters")
        .insert({
          supporter_id: user.id,
          supported_user_id: supportedUserId,
        });

      if (error) {
        throw error;
      }

      return {
        action: "added",
        supportedUserId,
      };

    } catch (error) {

      console.error(
        "[useSupport] Support update failed:",
        error
      );

      // rollback optimistic state
      setIsSupporting(previous);

      throw error;

    } finally {
      setLoading(false);
    }

  }, [
    user?.id,
    supportedUserId,
    isSupporting,
    loading,
  ]);


  return {
    isSupporting,
    loading,
    toggle,
    refresh: loadSupportState,
  };
}