import { useState } from "react";
import type { Todo } from "../interfaces/todo.interface";
import { todoService } from "../services/todo.service";

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

  const handleBulkDelete = async () => {
    try {
      const todoIds = Array.from(selectedTodos);
      await todoService.bulkAction({
        todoIds,
        action: 'delete'
      });
      
      // Update local state after successful API call
      const updatedTodos = todos.filter(todo => !selectedTodos.has(todo.id));
      setTodos(updatedTodos);
      setSelectedTodos(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Failed to bulk delete todos:', error);
    }
  };

  const handleBulkComplete = async () => {
    try {
      const todoIds = Array.from(selectedTodos);
      await todoService.bulkAction({
        todoIds,
        action: 'complete'
      });
      
      // Update local state after successful API call
      const updatedTodos = todos.map(todo => 
        selectedTodos.has(todo.id) 
          ? { ...todo, completed: true, updatedAt: new Date() }
          : todo
      );
      setTodos(updatedTodos);
      setSelectedTodos(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Failed to bulk complete todos:', error);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      const todoIds = Array.from(selectedTodos);
      await todoService.bulkAction({
        todoIds,
        action: 'changeStatus',
        newStatus
      });
      
      // Update local state after successful API call
      const updatedTodos = todos.map(todo => 
        selectedTodos.has(todo.id) 
          ? { ...todo, status: newStatus, updatedAt: new Date() }
          : todo
      );
      setTodos(updatedTodos);
      setSelectedTodos(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Failed to bulk change status:', error);
    }
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