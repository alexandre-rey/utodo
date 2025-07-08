import { createContext, useContext, type ReactNode } from 'react';
import { useSettings } from '../hooks/useSettings';
import type { StatusConfig, AppSettings } from '../services/save';

interface SettingsContextType {
  settings: AppSettings;
  handleSettingsChange: (newSettings: AppSettings) => void;
  statuses: StatusConfig[];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { settings, handleSettingsChange } = useSettings();

  const value: SettingsContextType = {
    settings,
    handleSettingsChange,
    statuses: settings.statuses,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}