// context/NotificationContext.jsx

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Single shared "is the notifications panel open" state.
  // Any trigger in the app (navbar bell, right-panel card, etc.) reads/writes
  // this instead of keeping its own local `open` state, so there can only
  // ever be one dropdown/modal on screen at a time.
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  const togglePanel = useCallback(() => setIsPanelOpen((prev) => !prev), []);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Notifications error:", error);
      setError(error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();

    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => setNotifications((prev) => [payload.new, ...prev])
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => setNotifications((prev) => prev.map((n) => (n.id === payload.new.id ? payload.new : n)))
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id))
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id, loadNotifications]);

  // Close the panel automatically if the signed-in user changes/logs out,
  // so it can't be left open pointing at a stale/empty list.
  useEffect(() => {
    setIsPanelOpen(false);
  }, [user?.id]);

  const handleRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    if (error) console.error("Failed to mark as read:", error);
  }, []);

  const handleReadAll = useCallback(async () => {
    if (!user?.id) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    if (error) console.error("Failed to mark all as read:", error);
  }, [user?.id]);

  const handleDelete = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) console.error("Failed to delete notification:", error);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        unreadCount,
        reload: loadNotifications,
        handleRead,
        handleReadAll,
        handleDelete,
        isPanelOpen,
        openPanel,
        closePanel,
        togglePanel,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
}