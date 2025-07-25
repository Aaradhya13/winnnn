"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Settings {
  theme: string;
  notifications: boolean;
  language: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    theme: "dark",
    notifications: true,
    language: "en",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchSettings();
  }, [router]);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(settings.theme);
  }, [settings.theme]);

  const fetchSettings = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        console.error("Failed to fetch settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Settings saved successfully!");
        setSettings(data);
      } else {
        setMessage("Failed to save settings.");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#192132] rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="space-y-6">
            {/* Theme Settings */}
            <div className="bg-[#22304a] p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Appearance</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    id="theme"
                    value={settings.theme}
                    onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                    className="w-full px-3 py-2 bg-[#192132] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-[#22304a] p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-400">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Language Settings */}
            <div className="bg-[#22304a] p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Language</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    id="language"
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full px-3 py-2 bg-[#192132] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-[#22304a] p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Account</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile</h4>
                    <p className="text-sm text-gray-400">Manage your profile information</p>
                  </div>
                  <button
                    onClick={() => router.push("/profile")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {message && (
              <div className={`text-sm ${message.includes("successfully") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 