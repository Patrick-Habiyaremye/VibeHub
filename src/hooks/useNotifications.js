// // hooks/useNotifications.js
// import { useEffect, useState, useCallback } from "react";
// import { supabase } from "../supabaseClient";

// import {
//   getNotifications,
//   markAsRead,
//   markAllAsRead,
//   deleteNotification,
// } from "../api/notifications";

// export default function useNotifications(user) {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 📥 LOAD
//   const loadNotifications = useCallback(async () => {
//     if (!user?.id) return;

//     try {
//       setLoading(true);

//       const data = await getNotifications(user.id);
//       setNotifications(data || []);
//     } catch (err) {
//       console.error("loadNotifications error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [user?.id]);

//   // ⚡ INITIAL + REALTIME
//   useEffect(() => {
//     loadNotifications();

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
//       .on(
//         "postgres_changes",
//         {
//           event: "UPDATE",
//           schema: "public",
//           table: "notifications",
//           filter: `user_id=eq.${user.id}`,
//         },
//         (payload) => {
//           setNotifications((prev) =>
//             prev.map((n) =>
//               n.id === payload.new.id ? payload.new : n
//             )
//           );
//         }
//       )
//       .on(
//         "postgres_changes",
//         {
//           event: "DELETE",
//           schema: "public",
//           table: "notifications",
//           filter: `user_id=eq.${user.id}`,
//         },
//         (payload) => {
//           setNotifications((prev) =>
//             prev.filter((n) => n.id !== payload.old.id)
//           );
//         }
//       )
//       .subscribe();

//     return () => supabase.removeChannel(channel);
//   }, [user?.id, loadNotifications]);

//   // 📊 derived state
//   const unreadCount = notifications.filter((n) => !n.is_read).length;

//   // ✅ MARK ONE
//   const handleRead = async (id) => {
//     try {
//       await markAsRead(id);

//       setNotifications((prev) =>
//         prev.map((n) =>
//           n.id === id ? { ...n, is_read: true } : n
//         )
//       );
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ✅ MARK ALL
//   const handleReadAll = async () => {
//     try {
//       await markAllAsRead(user.id);

//       setNotifications((prev) =>
//         prev.map((n) => ({ ...n, is_read: true }))
//       );
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ❌ DELETE
//   const handleDelete = async (id) => {
//     try {
//       await deleteNotification(id);

//       setNotifications((prev) =>
//         prev.filter((n) => n.id !== id)
//       );
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return {
//     notifications,
//     unreadCount,
//     loading,
//     handleRead,
//     handleDelete,
//     handleReadAll,
//     refreshNotifications: loadNotifications,
//   };
// }

// 

// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";

// export default function useNotifications(userId) {
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     if (!userId) return;

//     let channel;

//     const fetchNotifications = async () => {
//       const { data, error } = await supabase
//         .from("notifications")
//         .select("*")
//         .eq("user_id", userId)
//         .order("created_at", { ascending: false });

//       if (!error) setNotifications(data);
//     };

//     fetchNotifications();

//     // ✅ CORRECT ORDER: on() → subscribe()
//     channel = supabase
//       .channel(`notifications-${userId}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "notifications",
//           filter: `user_id=eq.${userId}`,
//         },
//         (payload) => {
//           setNotifications((prev) => [payload.new, ...prev]);
//         }
//       )
//       .subscribe();

//     return () => {
//       if (channel) supabase.removeChannel(channel);
//     };
//   }, [userId]);

//   return notifications;
// }

import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId || typeof userId !== "string") return;

    let isMounted = true;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Notifications error:", error);
        return;
      }

      if (isMounted) setNotifications(data || []);
    };

    fetchNotifications();

    // ✅ ALWAYS create fresh unique channel
    const channel = supabase
      .channel(`notifications-${userId}-${Date.now()}`) // 💥 prevent duplicates
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return notifications;
}