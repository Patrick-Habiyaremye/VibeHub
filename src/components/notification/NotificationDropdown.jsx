import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function NotificationDropdown() {

  const [notifications, setNotifications] =
    useState([]);

  const loadNotifications =
    async () => {

      const {
        data: { user },
      } =
      await supabase.auth.getUser();

      if (!user) return;

      const { data } =
        await supabase
          .from("notifications")
          .select(`
            *,
            actor:profiles!notifications_actor_id_fkey(
              username,
              avatar_url
            )
          `)
          .eq("user_id", user.id)
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      setNotifications(
        data || []
      );
    };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getMessage = (n) => {

    const actor =
      n.actor?.username ||
      "Someone";

    switch (n.type) {

      case "love":
        return `${actor} loved your post 💛`;

      case "laugh":
        return `${actor} laughed at your post 😂`;

      case "fire":
        return `${actor} reacted 🔥`;

      case "respect":
        return `${actor} respected your post 🙌`;

      case "comment":
        return `${actor} commented on your post 😊`;

      default:
        return "New notification";
    }
  };

  return (
    <div
      className="
      absolute
      right-0
      mt-2
      w-80
      bg-slate-800
      rounded-xl
      border
      border-slate-700
      shadow-lg
      z-50
    "
    >

      <div className="p-4">

        <h3 className="text-white font-bold mb-4">
          Notifications
        </h3>

        {notifications.length === 0 ? (

          <p className="text-slate-400">
            No notifications yet
          </p>

        ) : (

          notifications.map((n) => (

            <div
              key={n.id}
              className="
                py-3
                border-b
                border-slate-700
              "
            >

              <p className="text-white text-sm">
                {getMessage(n)}
              </p>

            </div>

          ))

        )}

      </div>

    </div>
  );
}