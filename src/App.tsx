import { useEffect, useState } from "react";
import QuickAdd from "./components/QuickAdd";
import type { Todo } from "./interfaces/todo.interface";
import { Toaster } from "./components/ui/sonner";
import OpenDialog from "./components/OpenDialog";
import DisplayTodos from "./components/DisplayTodos";
import CalendarView from "./components/CalendarView";
import SettingsPanel from "./components/SettingsPanel";
import AuthPanel from "./components/AuthPanel";
import BulkActionsToolbar from "./components/BulkActionsToolbar";
import { loadTodos, saveTodos, loadSettings, saveSettings, type AppSettings } from "./services/save";
import { Settings, Eye, EyeOff, Search, Calendar, Columns, User, LogOut } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";


export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    statuses: [
      { id: "low", label: "Low Priority", color: "#e5e7eb" },
      { id: "medium", label: "Medium Priority", color: "#fef3c7" },
      { id: "high", label: "High Priority", color: "#fed7aa" },
      { id: "urgent", label: "Urgent", color: "#fecaca" }
    ]
  });

  const handleAddTodo = (values: { title: string, description: string }) => {
    const defaultStatus = settings.statuses[0]?.id || "low";
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: values.title,
      description: values.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: defaultStatus,
      completed: false
    };
    
    saveTodos([...todos, newTodo]);
    setTodos([...todos, newTodo]);
  }

  const handleCloseDialog = () => {
    setSelectedTodo(null);
  }

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    saveTodos(updatedTodos);
    setTodos(updatedTodos);
    setSelectedTodo(null);
  }

  const saveTodo = (todo: Todo) => {
    const updatedTodos = todos.map(t => t.id === todo.id ? { ...t, ...todo, updatedAt: new Date() } : t);
    saveTodos(updatedTodos);
    setTodos(updatedTodos);
    setSelectedTodo(null);
  }

  const handleTodoStatusChange = (todoId: string, newStatus: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === todoId 
        ? { ...todo, status: newStatus, updatedAt: new Date() }
        : todo
    );
    saveTodos(updatedTodos);
    setTodos(updatedTodos);
  };

  const handleTodoCompletionToggle = (todoId: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === todoId 
        ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
        : todo
    );
    saveTodos(updatedTodos);
    setTodos(updatedTodos);
  };

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleAuthSuccess = (userData: { email: string; name: string }) => {
    setUser(userData);
    // TODO: In the future, sync todos from server when user signs in
  };

  const handleSignOut = () => {
    setUser(null);
    // TODO: In the future, clear synced data and keep only local data
  };

  const handleTodoSelection = (todoId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedTodos);
    if (isSelected) {
      newSelected.add(todoId);
    } else {
      newSelected.delete(todoId);
    }
    setSelectedTodos(newSelected);
    
    // Exit selection mode if no todos are selected
    if (newSelected.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const handleSelectAll = () => {
    const visibleTodos = todos.filter(todo => {
      const shouldShow = showCompleted || !todo.completed;
      const matchesSearch = searchQuery === "" || 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return shouldShow && matchesSearch;
    });
    
    const allSelected = visibleTodos.every(todo => selectedTodos.has(todo.id));
    
    if (allSelected) {
      setSelectedTodos(new Set());
      setIsSelectionMode(false);
    } else {
      setSelectedTodos(new Set(visibleTodos.map(todo => todo.id)));
      setIsSelectionMode(true);
    }
  };

  const handleBulkDelete = () => {
    const updatedTodos = todos.filter(todo => !selectedTodos.has(todo.id));
    saveTodos(updatedTodos);
    setTodos(updatedTodos);
    setSelectedTodos(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkComplete = () => {
    const updatedTodos = todos.map(todo => 
      selectedTodos.has(todo.id) 
        ? { ...todo, completed: true, updatedAt: new Date() }
        : todo
    );
    saveTodos(updatedTodos);
    setTodos(updatedTodos);
    setSelectedTodos(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkStatusChange = (newStatus: string) => {
    const updatedTodos = todos.map(todo => 
      selectedTodos.has(todo.id) 
        ? { ...todo, status: newStatus, updatedAt: new Date() }
        : todo
    );
    saveTodos(updatedTodos);
    setTodos(updatedTodos);
    setSelectedTodos(new Set());
    setIsSelectionMode(false);
  };

  // Count completed todos for display
  const completedCount = todos.filter(todo => todo.completed).length;

  // Calculate bulk selection state
  const visibleTodos = todos.filter(todo => {
    const shouldShow = showCompleted || !todo.completed;
    const matchesSearch = searchQuery === "" || 
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return shouldShow && matchesSearch;
  });
  const allVisibleSelected = visibleTodos.length > 0 && visibleTodos.every(todo => selectedTodos.has(todo.id));

  useEffect(() => {
    setTodos(loadTodos());
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search todos"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      
      // Ctrl+N or Cmd+N to focus new todo
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const addInput = document.querySelector('input[placeholder*="What needs to be done"]') as HTMLInputElement;
        if (addInput) {
          addInput.focus();
        }
      }
      
      // Ctrl+Shift+V or Cmd+Shift+V to toggle view mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        setViewMode(viewMode === 'kanban' ? 'calendar' : 'kanban');
      }
      
      // Ctrl+Shift+C or Cmd+Shift+C to toggle completed todos
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setShowCompleted(!showCompleted);
      }
      
      // Ctrl+, or Cmd+, to open settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
      
      // Escape to clear search or exit selection mode
      if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
        } else if (isSelectionMode) {
          setSelectedTodos(new Set());
          setIsSelectionMode(false);
        }
      }
      
      // Ctrl+A or Cmd+A to select all visible todos
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setIsSelectionMode(true);
        handleSelectAll();
      }
      
      // Delete key to delete selected todos
      if (e.key === 'Delete' && selectedTodos.size > 0) {
        e.preventDefault();
        handleBulkDelete();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, viewMode, showCompleted, isSelectionMode, selectedTodos]);

  return (
    <>
      <Toaster />
      <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-x-auto">
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
              ✨ Todo
            </h1>
            <p className="text-slate-600 text-base md:text-lg">
              Stay organized, stay productive
              {user && <span className="hidden sm:inline"> • Synced to your account</span>}
              {!user && <span className="hidden sm:inline"> • Working locally</span>}
            </p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="w-full max-w-md mb-8 px-6 relative">
          <Search className="absolute left-9 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search todos... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 py-3 text-base rounded-xl border-0 shadow-sm bg-white/70 backdrop-blur-sm focus:shadow-md transition-all duration-200 focus:bg-white"
          />
          {searchQuery && (
            <div className="absolute right-9 top-1/2 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                onClick={() => setSearchQuery("")}
              >
                ×
              </Button>
            </div>
          )}
        </div>
        
        <QuickAdd onAddTodo={handleAddTodo} />
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
        />
        <AuthPanel
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
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
          onSelectAll={handleSelectAll}
          onClearSelection={() => {
            setSelectedTodos(new Set());
            setIsSelectionMode(false);
          }}
          onBulkDelete={handleBulkDelete}
          onBulkComplete={handleBulkComplete}
          onBulkStatusChange={handleBulkStatusChange}
          statuses={settings.statuses}
          allSelected={allVisibleSelected}
        />
      </div>
    </>
  )
}

