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
import SimpleMobileView from "./components/SimpleMobileView";
import { useTodosContext } from "./contexts/TodosContext";
import { useSettingsContext } from "./contexts/SettingsContext";
import { useAuth } from "./contexts/AuthContext";
import { useAppUIContext } from "./contexts/AppContext";

export default function App() {
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
  const { user, logout } = useAuth();
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

  return (
    <>
      <Toaster />
      <div className={`flex flex-col justify-start min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-x-auto ${!isMobile ? 'items-center' : ''}`}>
        {!isMobile && (
          <>
            <AppHeader
              viewMode={viewMode}
              setViewMode={setViewMode}
              showCompleted={showCompleted}
              setShowCompleted={setShowCompleted}
              completedCount={completedCount}
              user={user}
              handleSignOut={logout}
              setIsAuthOpen={setIsAuthOpen}
              setIsSettingsOpen={setIsSettingsOpen}
            />
            
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            
            <QuickAdd onAddTodo={(values) => handleAddTodo(values, settings)} />
          </>
        )}
        
        <OpenDialog 
          todo={selectedTodo} 
          closeDialog={handleCloseDialog} 
          deleteTodo={deleteTodo}
          saveTodo={saveTodo}
          statuses={settings.statuses}
        />
        
        <SettingsPanel 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          setSettings={handleSettingsChange}
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