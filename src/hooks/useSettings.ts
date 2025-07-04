import { useState, useEffect } from "react";
import { loadSettings, saveSettings, type AppSettings } from "../services/save";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    statuses: [
      { id: "low", label: "Low Priority", color: "#e5e7eb" },
      { id: "medium", label: "Medium Priority", color: "#fef3c7" },
      { id: "high", label: "High Priority", color: "#fed7aa" },
      { id: "urgent", label: "Urgent", color: "#fecaca" }
    ]
  });

  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
  }, []);

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return {
    settings,
    handleSettingsChange
  };
}