import { useState } from "react";
import type { Todo } from "../interfaces/todo.interface";

export function useBulkActions(todos: Todo[], setTodos: (todos: Todo[]) => void) {
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handleTodoSelection = (todoId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedTodos);
    if (isSelected) {
      newSelected.add(todoId);
    } else {
      newSelected.delete(todoId);
    }
    setSelectedTodos(newSelected);
    
    if (newSelected.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const handleSelectAll = (visibleTodos: Todo[]) => {
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
    setTodos(updatedTodos);
    setSelectedTodos(new Set());
    setIsSelectionMode(false);
  };

  const clearSelection = () => {
    setSelectedTodos(new Set());
    setIsSelectionMode(false);
  };

  return {
    selectedTodos,
    isSelectionMode,
    setIsSelectionMode,
    handleTodoSelection,
    handleSelectAll,
    handleBulkDelete,
    handleBulkComplete,
    handleBulkStatusChange,
    clearSelection
  };
}