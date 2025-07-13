import { Toaster } from "./components/ui/sonner";
import OpenDialog from "./components/OpenDialog";
import DisplayTodos from "./components/DisplayTodos";
import CalendarView from "./components/CalendarView";
import SettingsPanel from "./components/SettingsPanel";
import AuthPanel from "./components/AuthPanel";
import BulkActionsToolbar from "./components/BulkActionsToolbar";
import AppHeader from "./components/AppHeader";
import SearchBar from "./components/SearchBar";
import Footer from "./components/Footer";
import QuickAdd from "./components/QuickAdd";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useIsMobile } from "./hooks/useMediaQuery";
import { useSEO } from "./hooks/useSEO";
import { useAnalytics, useSessionAnalytics } from "./hooks/useAnalytics";
import SimpleMobileView from "./components/SimpleMobileView";
import DesktopDashboard from "./components/DesktopDashboard";
import { useTodosContext } from "./contexts/TodosContext";
import { useSettingsContext } from "./contexts/SettingsContext";
import { useAuth } from "./contexts/AuthContext";
import { useAppUIContext } from "./contexts/AppContext";
import { GoogleAnalyticsService } from "./services/analytics.service";
import { useEffect } from "react";

export default function App() {
  // Initialize Google Analytics
  useEffect(() => {
    GoogleAnalyticsService.initialize();
  }, []);

  // SEO setup for the main application
  useSEO();

  // Analytics setup
  const analytics = useAnalytics();
  useSessionAnalytics();

  // Get data from contexts instead of local state
  const {
    todos,
    visibleTodos,
    searchQuery,
    setSearchQuery,
    showCompleted,
    setShowCompleted,
    completedCount,
    setTodos,
    handleAddTodo,
    deleteTodo,
    saveTodo,
    isSelectionMode,
    setIsSelectionMode,
    selectedTodos,
    handleSelectAll,
    handleBulkDelete,
    clearSelection
  } = useTodosContext();

  const { settings, handleSettingsChange } = useSettingsContext();
  const { user, logout, isLoading } = useAuth();
  const {
    selectedTodo,
    setSelectedTodo,
    isSettingsOpen,
    setIsSettingsOpen,
    isAuthOpen,
    setIsAuthOpen,
    viewMode,
    setViewMode
  } = useAppUIContext();

  const isMobile = useIsMobile();

  const handleCloseDialog = () => {
    setSelectedTodo(null);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    showCompleted,
    setShowCompleted,
    setIsSettingsOpen,
    isSelectionMode,
    setIsSelectionMode,
    clearSelection,
    handleSelectAll: () => handleSelectAll(visibleTodos),
    handleBulkDelete,
    selectedTodosSize: selectedTodos.size
  });

  // Wrap functions with analytics tracking
  const handleAddTodoWithAnalytics = (values: any) => {
    const result = handleAddTodo(values, settings);
    analytics.trackTodoAction('todo_created', {
      hasDueDate: !!values.dueDate,
      hasDescription: !!values.description,
      status: values.status || 'pending'
    });
    return result;
  };

  const deleteTodoWithAnalytics = (id: string) => {
    const todo = todos.find(t => t.id === id);
    deleteTodo(id);
    analytics.trackTodoAction('todo_deleted', {
      todoId: id,
      status: todo?.status,
      hasDueDate: !!todo?.dueDate
    });
  };

  const saveTodoWithAnalytics = (updatedTodo: any) => {
    saveTodo(updatedTodo);
    analytics.trackTodoAction('todo_updated', {
      todoId: updatedTodo.id,
      status: updatedTodo.status,
      hasDueDate: !!updatedTodo.dueDate
    });
  };

  const handleSearchWithAnalytics = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const resultsCount = todos.filter(todo => 
        todo.title.toLowerCase().includes(query.toLowerCase()) ||
        todo.description?.toLowerCase().includes(query.toLowerCase())
      ).length;
      analytics.trackSearch(query, resultsCount);
    }
  };

  const handleViewModeChange = (newViewMode: any) => {
    setViewMode(newViewMode);
    analytics.trackUsageAction('view_mode_changed', {
      viewMode: newViewMode,
      todosCount: todos.length
    });
  };

  // Track user authentication
  useEffect(() => {
    if (user) {
      analytics.setUserId(user.id);
      analytics.setUserProperties({
        user_type: 'authenticated',
        has_premium: false // Update based on actual subscription status
      });
      analytics.trackAuthAction('user_authenticated');
    }
  }, [user, analytics]);

  return (
    <>
      <Toaster />
      <div className={`flex flex-col justify-start min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-x-auto ${!isMobile ? 'items-center' : ''}`}>
        {!isMobile && (
          <>
            <AppHeader
              viewMode={viewMode}
              setViewMode={handleViewModeChange}
              showCompleted={showCompleted}
              setShowCompleted={setShowCompleted}
              completedCount={completedCount}
              user={user}
              isLoading={isLoading}
              handleSignOut={logout}
              setIsAuthOpen={setIsAuthOpen}
              setIsSettingsOpen={setIsSettingsOpen}
            />
            
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={handleSearchWithAnalytics}
            />
            
            <QuickAdd onAddTodo={(values) => handleAddTodoWithAnalytics(values)} />
            
            <DesktopDashboard />
          </>
        )}
        
        <OpenDialog 
          todo={selectedTodo} 
          closeDialog={handleCloseDialog} 
          deleteTodo={deleteTodoWithAnalytics}
          saveTodo={saveTodoWithAnalytics}
          statuses={settings.statuses}
        />
        
        <SettingsPanel 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          setSettings={async (newSettings) => handleSettingsChange(newSettings)}
          todos={todos}
          onTodosUpdate={(newTodos) => setTodos(newTodos)}
        />
        
        <AuthPanel
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
        
        {isMobile ? (
          <SimpleMobileView />
        ) : (
          viewMode === 'kanban' ? (
            <DisplayTodos />
          ) : (
            <CalendarView />
          )
        )}
        
        {/* Bulk Actions Toolbar - Desktop only */}
        {!isMobile && (
          <BulkActionsToolbar />
        )}
        
        {!isMobile && <Footer />}
      </div>
    </>
  )
}