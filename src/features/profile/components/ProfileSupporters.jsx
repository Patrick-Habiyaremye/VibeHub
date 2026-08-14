// src/features/profile/components/ProfileSupporters.jsx

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

import { supabase } from "../../../supabaseClient";

export default function ProfileSupporters({
  profileId,
  onClose,
}) {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSupporters = useCallback(async () => {
    if (!profileId) {
      setSupporters([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("supporters")
        .select(`
          supporter_id,
          created_at,
          supporter:supporter_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq("supported_user_id", profileId)
        .order("created_at", {
          ascending: false,
        });

      if (queryError) {
        throw queryError;
      }

      setSupporters(data ?? []);
    } catch (err) {
      console.error(
        "[ProfileSupporters] Failed to load supporters:",
        err
      );

      setError(
        err.message || "Failed to load supporters."
      );
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadSupporters();
  }, [loadSupporters]);

  /*
   * -------------------------------------------------------
   * REALTIME
   * -------------------------------------------------------
   *
   * INSERT:
   * somebody started supporting this profile.
   *
   * DELETE:
   * somebody stopped supporting this profile.
   */

  useEffect(() => {
    if (!profileId) {
      return undefined;
    }

    const channel = supabase
      .channel(`profile-supporters:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "supporters",
          filter: `supported_user_id=eq.${profileId}`,
        },
        (payload) => {
          const newSupport = payload.new;

          /*
           * The realtime payload only contains IDs.
           * Reloading gives us the complete profile data.
           *
           * This is intentionally simple and reliable.
           */
          loadSupporters();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "supporters",
          filter: `supported_user_id=eq.${profileId}`,
        },
        () => {
          loadSupporters();
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error(
            "[ProfileSupporters] Realtime channel error"
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, loadSupporters]);

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/60
        flex
        items-center
        justify-center
        p-4
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="supporters-title"
    >
      <div
        className="
          bg-white
          rounded-2xl
          shadow-xl
          w-full
          max-w-md
          max-h-[80vh]
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2
            id="supporters-title"
            className="text-lg font-semibold"
          >
            Supporters
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close supporters"
            className="
              p-2
              rounded-full
              hover:bg-gray-100
              transition
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[65vh]">
          {loading && (
            <div className="p-6 text-center text-gray-500">
              Loading supporters...
            </div>
          )}

          {!loading && error && (
            <div className="p-6 text-center text-red-500">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            supporters.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No supporters yet.
              </div>
            )}

          {!loading &&
            !error &&
            supporters.length > 0 && (
              <div className="divide-y">
                {supporters.map((item) => {
                  const supporter = item.supporter;

                  if (!supporter) {
                    return null;
                  }

                  return (
                    <div
                      key={item.supporter_id}
                      className="
                        flex
                        items-center
                        gap-3
                        p-4
                      "
                    >
                      <img
                        src={
                          supporter.avatar_url ||
                          "/default-avatar.png"
                        }
                        alt=""
                        className="
                          w-10
                          h-10
                          rounded-full
                          object-cover
                        "
                      />

                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {supporter.username}
                        </p>

                        <p className="text-sm text-gray-500">
                          Supporter
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}