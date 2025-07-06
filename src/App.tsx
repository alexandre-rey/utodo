import { useState } from "react";
import QuickAdd from "./components/QuickAdd";
import { Toaster } from "./components/ui/sonner";
import OpenDialog from "./components/OpenDialog";
import DisplayTodos from "./components/DisplayTodos";
import CalendarView from "./components/CalendarView";
import SettingsPanel from "./components/SettingsPanel";
import AuthPanel from "./components/AuthPanel";
import BulkActionsToolbar from "./components/BulkActionsToolbar";
import AppHeader from "./components/AppHeader";
import SearchBar from "./components/SearchBar";
import { useTodos } from "./hooks/useTodos";
import { useBulkActions } from "./hooks/useBulkActions";
import { useSettings } from "./hooks/useSettings";
import { useAuth } from "./hooks/useAuth";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useTodoFilters } from "./hooks/useTodoFilters";
import type { Todo } from "./interfaces/todo.interface";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');


export default function App() {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');

  // Custom hooks
  const { todos, setTodos, handleAddTodo, deleteTodo, saveTodo, handleTodoStatusChange, handleTodoCompletionToggle, completedCount } = useTodos();
  const { settings, handleSettingsChange } = useSettings();
  const { user, handleSignOut } = useAuth();
  const { visibleTodos, allVisibleSelected } = useTodoFilters(todos, showCompleted, searchQuery);
  
  // For bulk actions, we need to pass a callback that triggers a re-render
  // In a real app, you'd use a state management library
  const { 
    selectedTodos, 
    isSelectionMode, 
    setIsSelectionMode,
    handleTodoSelection, 
    handleSelectAll, 
    handleBulkDelete, 
    handleBulkComplete, 
    handleBulkStatusChange,
    clearSelection 
  } = useBulkActions(todos, setTodos);

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
      <Elements stripe={stripePromise}>
        <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-x-auto">
        <AppHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          showCompleted={showCompleted}
          setShowCompleted={setShowCompleted}
          completedCount={completedCount}
          user={user}
          handleSignOut={handleSignOut}
          setIsAuthOpen={setIsAuthOpen}
          setIsSettingsOpen={setIsSettingsOpen}
        />
        
        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <QuickAdd onAddTodo={(values) => handleAddTodo(values, settings)} />
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
          onTodosUpdate={setTodos}
        />
        <AuthPanel
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
        {viewMode === 'kanban' ? (
          <DisplayTodos 
            todos={todos} 
            setSelectedTodo={setSelectedTodo}
            statuses={settings.statuses}
            onTodoStatusChange={handleTodoStatusChange}
            onTodoCompletionToggle={handleTodoCompletionToggle}
            showCompleted={showCompleted}
            searchQuery={searchQuery}
            isSelectionMode={isSelectionMode}
            selectedTodos={selectedTodos}
            onTodoSelection={handleTodoSelection}
            onEnterSelectionMode={() => setIsSelectionMode(true)}
          />
        ) : (
          <CalendarView
            todos={todos}
            setSelectedTodo={setSelectedTodo}
            onTodoCompletionToggle={handleTodoCompletionToggle}
            showCompleted={showCompleted}
            searchQuery={searchQuery}
            isSelectionMode={isSelectionMode}
            selectedTodos={selectedTodos}
            onTodoSelection={handleTodoSelection}
            onEnterSelectionMode={() => setIsSelectionMode(true)}
          />
        )}
        
        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedTodos.size}
          onSelectAll={() => handleSelectAll(visibleTodos)}
          onClearSelection={clearSelection}
          onBulkDelete={handleBulkDelete}
          onBulkComplete={handleBulkComplete}
          onBulkStatusChange={handleBulkStatusChange}
          statuses={settings.statuses}
          allSelected={allVisibleSelected(selectedTodos)}
        />
        </div>
      </Elements>
    </>
  )
}

