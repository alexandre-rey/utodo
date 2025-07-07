import React, { createContext, useContext, type ReactNode, useState } from 'react';
import { TodosProvider } from './TodosContext';
import { SettingsProvider } from './SettingsContext';
import { AuthProvider } from './AuthContext';
import type { Todo } from '../interfaces/todo.interface';

interface AppUIContextType {
  // UI state
  selectedTodo: Todo | null;
  setSelectedTodo: React.Dispatch<React.SetStateAction<Todo | null>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAuthOpen: boolean;
  setIsAuthOpen: React.Dispatch<React.SetStateAction<boolean>>;
  viewMode: 'kanban' | 'calendar';
  setViewMode: React.Dispatch<React.SetStateAction<'kanban' | 'calendar'>>;
}

const AppUIContext = createContext<AppUIContextType | undefined>(undefined);

interface AppUIProviderProps {
  children: ReactNode;
}

function AppUIProvider({ children }: AppUIProviderProps) {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');

  const value: AppUIContextType = {
    selectedTodo,
    setSelectedTodo,
    isSettingsOpen,
    setIsSettingsOpen,
    isAuthOpen,
    setIsAuthOpen,
    viewMode,
    setViewMode,
  };

  return (
    <AppUIContext.Provider value={value}>
      {children}
    </AppUIContext.Provider>
  );
}

export function useAppUIContext() {
  const context = useContext(AppUIContext);
  if (context === undefined) {
    throw new Error('useAppUIContext must be used within an AppUIProvider');
  }
  return context;
}

// Combined provider that wraps all contexts
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <TodosProvider>
          <AppUIProvider>
            {children}
          </AppUIProvider>
        </TodosProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}