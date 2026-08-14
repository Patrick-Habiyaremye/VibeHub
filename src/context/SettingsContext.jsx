import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { getProfile, updateProfile } from "../api/settingsApi";

const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
  theme: "dark",
  is_private: false,
  hide_activity: false,
  notify_likes: true,
  notify_comments: true,
  notify_messages: true,
};

export function SettingsProvider({ children }) {
  const { user } = useAuth();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedPulse, setSavedPulse] = useState(0); // increments on each successful save

  const debounceRef = useRef(null);
  const pendingUpdatesRef = useRef({});
  const preSaveSnapshotRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProfile(user.id);
        if (!cancelled) setSettings({ ...DEFAULT_SETTINGS, ...data });
      } catch (err) {
        console.error("Settings load error:", err);
        if (!cancelled) setError("Couldn't load your settings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!settings?.theme) return;
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings?.theme]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const flushUpdates = useCallback(async () => {
    if (!user) return;
    const updates = pendingUpdatesRef.current;
    pendingUpdatesRef.current = {};
    if (Object.keys(updates).length === 0) return;

    try {
      setSaving(true);
      setError(null);
      await updateProfile(user.id, updates);
      preSaveSnapshotRef.current = null;
      setSavedPulse((n) => n + 1);
    } catch (err) {
      console.error("Settings save error:", err);
      setError("Couldn't save your changes. Please try again.");
      if (preSaveSnapshotRef.current) {
        setSettings(preSaveSnapshotRef.current);
        preSaveSnapshotRef.current = null;
      }
    } finally {
      setSaving(false);
    }
  }, [user]);

  const updateSettings = useCallback(
    (updates, options = {}) => {
      if (!user) return;

      if (!preSaveSnapshotRef.current) {
        preSaveSnapshotRef.current = settings;
      }

      setSettings((prev) => ({ ...prev, ...updates }));
      pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...updates };

      if (debounceRef.current) clearTimeout(debounceRef.current);
      const delay = options.debounce ? 500 : 0;
      debounceRef.current = setTimeout(flushUpdates, delay);
    },
    [user, settings, flushUpdates]
  );

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, loading, saving, error, savedPulse }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}