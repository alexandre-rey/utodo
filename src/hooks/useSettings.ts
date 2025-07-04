import { useState, useEffect } from "react";
import { settingsService } from "../services/settings.service";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import type { UserSettings } from "@/types/api";

// Transform UserSettings to AppSettings format for compatibility
interface AppSettings {
  statuses: Array<{
    id: string;
    label: string;
    color: string;
  }>;
}

const transformToAppSettings = (userSettings: UserSettings): AppSettings => {
  return {
    statuses: (userSettings.customStatuses || []).map(status => ({
      id: status.id,
      label: status.name,
      color: status.color
    }))
  };
};

const transformToUserSettings = (appSettings: AppSettings): Partial<UserSettings> => {
  return {
    customStatuses: appSettings.statuses.map((status, index) => ({
      id: status.id,
      name: status.label,
      color: status.color,
      order: index
    }))
  };
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    statuses: [
      { id: "pending", label: "Pending", color: "#6b7280" },
      { id: "inProgress", label: "In Progress", color: "#3b82f6" },
      { id: "done", label: "Done", color: "#10b981" }
    ]
  });
  
  const { isAuthenticated, isLoading } = useAuthContext();

  const loadSettings = async () => {
    try {
      const userSettings = await settingsService.getSettings();
      const appSettings = transformToAppSettings(userSettings);
      setSettings(appSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  useEffect(() => {
    // Don't load settings while auth is still loading
    if (isLoading) return;
    
    loadSettings();
  }, [isAuthenticated, isLoading]); // Reload when auth state changes

  const handleSettingsChange = async (newSettings: AppSettings) => {
    try {
      const userSettingsUpdate = transformToUserSettings(newSettings);
      await settingsService.updateSettings(userSettingsUpdate);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  return {
    settings,
    handleSettingsChange
  };
}