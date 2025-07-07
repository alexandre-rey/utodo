import React, { createContext, useContext, type ReactNode } from 'react';
import { useTodos } from '../hooks/useTodos';
import { useBulkActions } from '../hooks/useBulkActions';
import { useTodoFilters } from '../hooks/useTodoFilters';
import type { Todo } from '../interfaces/todo.interface';

interface TodosContextType {
  // Core todo data
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  visibleTodos: Todo[];
  completedCount: number;
  
  // Todo operations
  handleAddTodo: (values: { title: string; description: string }, settings: any) => void;
  deleteTodo: (todoId: string) => void;
  saveTodo: (todo: Todo) => void;
  handleTodoStatusChange: (todoId: string, newStatus: string) => void;
  handleTodoCompletionToggle: (todoId: string) => void;
  
  // Bulk operations
  selectedTodos: Set<string>;
  isSelectionMode: boolean;
  setIsSelectionMode: React.Dispatch<React.SetStateAction<boolean>>;
  handleTodoSelection: (todoId: string, isSelected: boolean) => void;
  handleSelectAll: (todos: Todo[]) => void;
  handleBulkDelete: () => void;
  handleBulkComplete: () => void;
  handleBulkStatusChange: (statusId: string) => void;
  clearSelection: () => void;
  allVisibleSelected: (selectedTodos: Set<string>) => boolean;
  
  // Filters
  showCompleted: boolean;
  setShowCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const TodosContext = createContext<TodosContextType | undefined>(undefined);

interface TodosProviderProps {
  children: ReactNode;
}

export function TodosProvider({ children }: TodosProviderProps) {
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Use existing hooks
  const todoHook = useTodos();
  const { visibleTodos, allVisibleSelected } = useTodoFilters(
    todoHook.todos, 
    showCompleted, 
    searchQuery
  );
  const bulkActions = useBulkActions(todoHook.todos, todoHook.setTodos);

  const value: TodosContextType = {
    // Core data
    todos: todoHook.todos,
    setTodos: (todos: Todo[]) => todoHook.setTodos(todos),
    visibleTodos,
    completedCount: todoHook.completedCount,
    
    // Todo operations
    handleAddTodo: todoHook.handleAddTodo,
    deleteTodo: todoHook.deleteTodo,
    saveTodo: todoHook.saveTodo,
    handleTodoStatusChange: todoHook.handleTodoStatusChange,
    handleTodoCompletionToggle: todoHook.handleTodoCompletionToggle,
    
    // Bulk operations
    selectedTodos: bulkActions.selectedTodos,
    isSelectionMode: bulkActions.isSelectionMode,
    setIsSelectionMode: bulkActions.setIsSelectionMode,
    handleTodoSelection: bulkActions.handleTodoSelection,
    handleSelectAll: bulkActions.handleSelectAll,
    handleBulkDelete: bulkActions.handleBulkDelete,
    handleBulkComplete: bulkActions.handleBulkComplete,
    handleBulkStatusChange: bulkActions.handleBulkStatusChange,
    clearSelection: bulkActions.clearSelection,
    allVisibleSelected,
    
    // Filters
    showCompleted,
    setShowCompleted,
    searchQuery,
    setSearchQuery,
  };

  return (
    <TodosContext.Provider value={value}>
      {children}
    </TodosContext.Provider>
  );
}

export function useTodosContext() {
  const context = useContext(TodosContext);
  if (context === undefined) {
    throw new Error('useTodosContext must be used within a TodosProvider');
  }
  return context;
}