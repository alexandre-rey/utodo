import { useEffect, useState } from "react";
import QuickAdd from "./components/QuickAdd";
import type { Todo } from "./interfaces/todo.interface";
import { Toaster } from "./components/ui/sonner";
import OpenDialog from "./components/OpenDialog";
import DisplayTodos from "./components/DisplayTodos";
import CalendarView from "./components/CalendarView";
import SettingsPanel from "./components/SettingsPanel";
import { loadTodos, saveTodos, loadSettings, saveSettings, type AppSettings } from "./services/save";
import { Settings, Eye, EyeOff, Search, Calendar, Columns } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";


export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');
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

  // Count completed todos for display
  const completedCount = todos.filter(todo => todo.completed).length;

  useEffect(() => {
    setTodos(loadTodos());
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search todos..."]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Toaster />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative">
        {/* Settings Button - Top Right */}
        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          {/* View Mode Toggle */}
          <Button
            variant={viewMode === 'calendar' ? "default" : "ghost"}
            size="sm"
            className="cursor-pointer"
            onClick={() => setViewMode(viewMode === 'kanban' ? 'calendar' : 'kanban')}
          >
            {viewMode === 'kanban' ? <Calendar className="h-4 w-4 mr-2" /> : <Columns className="h-4 w-4 mr-2" />}
            {viewMode === 'kanban' ? 'Calendar' : 'Kanban'}
          </Button>
          
          {/* Show/Hide Completed Button */}
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showCompleted ? "Hide" : "Show"} Completed ({completedCount})
          </Button>
          
          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-6">Todo App</h1>
        
        {/* Search Bar */}
        <div className="w-full max-w-md mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search todos... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
          {searchQuery && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
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
        {viewMode === 'kanban' ? (
          <DisplayTodos 
            todos={todos} 
            setSelectedTodo={setSelectedTodo}
            statuses={settings.statuses}
            onTodoStatusChange={handleTodoStatusChange}
            onTodoCompletionToggle={handleTodoCompletionToggle}
            showCompleted={showCompleted}
            searchQuery={searchQuery}
          />
        ) : (
          <CalendarView
            todos={todos}
            setSelectedTodo={setSelectedTodo}
            onTodoCompletionToggle={handleTodoCompletionToggle}
            showCompleted={showCompleted}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </>
  )
}

