import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Menu, 
  Settings, 
  User, 
  LogOut, 
  Eye, 
  EyeOff,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
type TransformedUser = {
  email: string;
  name: string;
} | null;

interface MobileHeaderProps {
  user: TransformedUser;
  completedCount: number;
  showCompleted: boolean;
  onToggleCompleted: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenSearch?: () => void;
}

export default function MobileHeader({
  user,
  completedCount,
  showCompleted,
  onToggleCompleted,
  onOpenSettings,
  onOpenAuth,
  onSignOut,
  onOpenSearch
}: MobileHeaderProps) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action: () => void) => {
    action();
    setShowMenu(false);
  };

  return (
    <div className="sticky top-0 z-[100] bg-white border-b border-gray-200 shadow-sm relative">
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-gray-900">{t('app.title')}</h1>
          {user && (
            <Badge variant="outline" className="text-xs">
              {t('app.syncedAccount')}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Search Button */}
          {onOpenSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSearch}
              className="h-9 w-9 p-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Completed Count */}
          {completedCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {completedCount} {t('dashboard.completed')}
            </Badge>
          )}

          {/* Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMenuToggle}
            className="h-9 w-9 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dropdown Menu - Rendered in Portal */}
      {showMenu && createPortal(
        <div className="fixed inset-0 z-[1000]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu Panel - positioned from top-right */}
          <div className="absolute top-16 right-4 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="py-2">
              {/* User Info */}
              {user ? (
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm text-gray-600">{t('app.workingLocally')}</p>
                </div>
              )}

              {/* Menu Items */}
              <div className="py-1">
                {/* Toggle Completed */}
                <button
                  onClick={() => handleMenuAction(onToggleCompleted)}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                >
                  {showCompleted ? (
                    <EyeOff className="h-4 w-4 mr-3" />
                  ) : (
                    <Eye className="h-4 w-4 mr-3" />
                  )}
                  {showCompleted ? t('navigation.hideCompleted') : t('navigation.showCompleted')}
                </button>

                {/* Settings */}
                <button
                  onClick={() => handleMenuAction(onOpenSettings)}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  {t('navigation.settings')}
                </button>

                {/* Auth Actions */}
                {user ? (
                  <button
                    onClick={() => handleMenuAction(onSignOut)}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 active:bg-red-100"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    {t('auth.signOut')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleMenuAction(onOpenAuth)}
                    className="w-full flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 active:bg-blue-100"
                  >
                    <User className="h-4 w-4 mr-3" />
                    {t('auth.signIn')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}