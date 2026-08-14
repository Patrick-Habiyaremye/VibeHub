import { useState, useRef, useEffect } from "react";
import { User, Bell, Lock, Palette, AlertTriangle } from "lucide-react";

import ProfileSettings from "../components/settings/ProfileSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import DangerZone from "../components/settings/DangerZone";
import SaveToast from "../components/settings/SaveToast";

import { useSettings } from "../context/SettingsContext";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User, Component: ProfileSettings },
  { id: "notifications", label: "Notifications", icon: Bell, Component: NotificationSettings },
  { id: "privacy", label: "Privacy", icon: Lock, Component: PrivacySettings },
  { id: "appearance", label: "Appearance", icon: Palette, Component: AppearanceSettings },
  { id: "danger", label: "Danger zone", icon: AlertTriangle, Component: DangerZone, danger: true },
];

export default function Settings() {
  const { loading, error } = useSettings();
  const [activeSection, setActiveSection] = useState("profile");
  const navRefs = useRef({});
  const [indicator, setIndicator] = useState({ top: 0, height: 0 });

  useEffect(() => {
    const el = navRefs.current[activeSection];
    if (el) setIndicator({ top: el.offsetTop, height: el.offsetHeight });
  }, [activeSection, loading]);

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading settings…</p>
        </div>
      </div>
    );
  }

  const ActiveComponent = SECTIONS.find((s) => s.id === activeSection)?.Component;

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row">

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:block w-60 shrink-0 border-r border-slate-800/80 p-6 sticky top-0 h-screen">
          <h1 className="text-lg font-semibold mb-6 tracking-tight">Settings</h1>

          <nav className="relative space-y-1 text-sm">
            <div
              className="absolute left-0 w-0.5 bg-purple-500 rounded-full transition-all duration-200 ease-out"
              style={{ top: indicator.top, height: indicator.height }}
            />
            {SECTIONS.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  ref={(el) => (navRefs.current[item.id] = el)}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-lg transition-colors ${
                    active
                      ? item.danger
                        ? "bg-red-950/40 text-red-300"
                        : "bg-slate-800 text-white"
                      : item.danger
                        ? "text-red-400/70 hover:text-red-300 hover:bg-red-950/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight md:hidden">Settings</h1>
          </div>

          {/* MOBILE TABS */}
          <div className="md:hidden mb-5 overflow-x-auto -mx-4 px-4">
            <div className="flex gap-2 w-max">
              {SECTIONS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? item.danger
                          ? "bg-red-950/50 text-red-300"
                          : "bg-slate-800 text-white"
                        : "bg-slate-900 text-slate-500"
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-900/60 text-red-300 text-sm rounded-xl px-4 py-2.5 mb-4">
              {error}
            </div>
          )}

          <div key={activeSection} className="animate-[fadeIn_0.15s_ease-out]">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </main>
      </div>

      <SaveToast />
    </div>
  );
}