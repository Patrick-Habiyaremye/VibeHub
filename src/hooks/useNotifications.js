// import { useEffect, useState, useCallback } from "react";
// import { supabase } from "../supabaseClient";

// export default function useNotifications(user) {
//   const [notifications, setNotifications] = useState([]);

//   const load = useCallback(async () => {
//     if (!user?.id) return;

//     const { data } = await supabase
//       .from("notifications")
//       .select("*")
//       .eq("user_id", user.id)
//       .order("created_at", { ascending: false });

//     setNotifications(data || []);
//   }, [user?.id]);

//   useEffect(() => {
//     load();

//     if (!user?.id) return;

//     const channel = supabase
//       .channel(`notifications-${user.id}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "notifications",
//           filter: `user_id=eq.${user.id}`,
//         },
//         (payload) => {
//           setNotifications((prev) => [payload.new, ...prev]);
//         }
//       )
//       .subscribe();

//     return () => supabase.removeChannel(channel);
//   }, [load, user?.id]);

//   const unreadCount = notifications.filter((n) => !n.read).length;

//   const handleRead = async (id) => {
//     await supabase
//       .from("notifications")
//       .update({ read: true })
//       .eq("id", id);

//     load();
//   };

//   const handleReadAll = async () => {
//     await supabase
//       .from("notifications")
//       .update({ read: true })
//       .eq("user_id", user.id);

//     load();
//   };

//   const handleDelete = async (id) => {
//     await supabase.from("notifications").delete().eq("id", id);
//     setNotifications((prev) => prev.filter((n) => n.id !== id));
//   };

//   return {
//     notifications,
//     unreadCount,
//     handleRead,
//     handleDelete,
//     handleReadAll,
//     refreshNotifications: load,
//   };
// }

// hooks/useNotifications.js
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../api/notifications";

export default function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📥 LOAD
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const data = await getNotifications(user.id);
      setNotifications(data || []);
    } catch (err) {
      console.error("loadNotifications error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ⚡ INITIAL + REALTIME
  useEffect(() => {
    loadNotifications();

    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === payload.new.id ? payload.new : n
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id, loadNotifications]);

  // 📊 derived state
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ✅ MARK ONE
  const handleRead = async (id) => {
    try {
      await markAsRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ MARK ALL
  const handleReadAll = async () => {
    try {
      await markAllAsRead(user.id);

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);

      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    handleRead,
    handleDelete,
    handleReadAll,
    refreshNotifications: loadNotifications,
  };
}