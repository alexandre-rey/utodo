import { Button } from "./ui/button";
import { Settings, Eye, EyeOff, Calendar, Columns, User, LogOut } from "lucide-react";

interface AppHeaderProps {
  viewMode: 'kanban' | 'calendar';
  setViewMode: (mode: 'kanban' | 'calendar') => void;
  showCompleted: boolean;
  setShowCompleted: (show: boolean) => void;
  completedCount: number;
  user: { email: string; name: string } | null;
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
  handleSignOut,
  setIsAuthOpen,
  setIsSettingsOpen
}: AppHeaderProps) {
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
          <span className="hidden sm:inline">{viewMode === 'kanban' ? 'Calendar' : 'Kanban'}</span>
        </Button>
        
        {/* Show/Hide Completed Button */}
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border-0"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
          <span className="hidden md:inline">{showCompleted ? "Hide" : "Show"} Completed </span>
          <span>({completedCount})</span>
        </Button>

        {/* User Menu */}
        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-slate-600">
              Hello, {user.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border-0 hover:bg-white/70"
              onClick={handleSignOut}
              title="Sign Out"
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
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        )}
        
        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border-0 hover:bg-white/70"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Header Section */}
      <div className="w-full max-w-4xl px-6 pt-20 md:pt-8 pb-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
            ✨ µTodo
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            A simple way to manage todos
            {user && <span className="hidden sm:inline"> • Synced to your account</span>}
            {!user && <span className="hidden sm:inline"> • Working locally</span>}
          </p>
        </div>
      </div>
    </>
  );
}