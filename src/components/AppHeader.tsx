import { Button } from "./ui/button";
import { Settings, Eye, EyeOff, Calendar, Columns, User, LogOut } from "lucide-react";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import type { User as UserType } from '../types/api';

interface AppHeaderProps {
  viewMode: 'kanban' | 'calendar';
  setViewMode: (mode: 'kanban' | 'calendar') => void;
  showCompleted: boolean;
  setShowCompleted: (show: boolean) => void;
  completedCount: number;
  user: UserType | null;
  isLoading: boolean;
  handleSignOut: () => void;
  setIsAuthOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

export default function AppHeader({
  viewMode,
  setViewMode,
  showCompleted,
  setShowCompleted,
  completedCount,
  user,
  isLoading,
  handleSignOut,
  setIsAuthOpen,
  setIsSettingsOpen
}: AppHeaderProps) {
  const { t } = useTranslation();
  return (
    <>
      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 flex gap-2 z-10">
        {/* View Mode Toggle */}
        <Button
          variant={viewMode === 'calendar' ? "default" : "ghost"}
          size="sm"
          className="cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border-0"
          onClick={() => setViewMode(viewMode === 'kanban' ? 'calendar' : 'kanban')}
        >
          {viewMode === 'kanban' ? <Calendar className="h-4 w-4 mr-2" /> : <Columns className="h-4 w-4 mr-2" />}
          <span className="hidden sm:inline">{viewMode === 'kanban' ? t('navigation.calendar') : t('navigation.kanban')}</span>
        </Button>
        
        {/* Show/Hide Completed Button */}
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border-0"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
          <span className="hidden md:inline">{showCompleted ? t('navigation.hideCompleted') : t('navigation.showCompleted')} </span>
          <span>({completedCount})</span>
        </Button>

        {/* User Menu */}
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-slate-600">
              {t('auth.hello', { name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border-0 hover:bg-white/70"
              onClick={handleSignOut}
              title={t('auth.signOut')}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border-0"
            onClick={() => setIsAuthOpen(true)}
          >
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('auth.signIn')}</span>
          </Button>
        )}
        
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border-0 hover:bg-white/70"
          onClick={() => setIsSettingsOpen(true)}
          title={t('navigation.settings')}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Header Section */}
      <div className="w-full max-w-4xl px-6 pt-20 md:pt-8 pb-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
            ✨ {t('app.title')}
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            {t('app.tagline')}
            {user && <span className="hidden sm:inline"> • {t('app.syncedAccount')}</span>}
            {!user && <span className="hidden sm:inline"> • {t('app.workingLocally')}</span>}
          </p>
        </div>
      </div>
    </>
  );
}