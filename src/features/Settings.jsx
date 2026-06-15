import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import ProfileSettings from "../components/settings/ProfileSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import DangerZone from "../components/settings/DangerZone";

export default function Settings() {
  return (
    <div className="bg-slate-950 min-h-screen">

      <Navbar />

      <div className="max-w-7xl mx-auto flex">

        <Sidebar />

        <main className="flex-1 p-6">

          <h1 className="text-3xl font-bold text-white mb-6">
            Settings ⚙️
          </h1>

          <ProfileSettings />

          <NotificationSettings />

          <PrivacySettings />

          <AppearanceSettings />

          <DangerZone />

        </main>

      </div>

    </div>
  );
}