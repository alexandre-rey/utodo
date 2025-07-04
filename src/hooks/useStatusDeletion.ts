import { useState } from "react";
import type { Todo } from "../interfaces/todo.interface";

export function useStatusDeletion(todos: Todo[], setTodos: (todos: Todo[]) => void) {
  const [pendingDeletion, setPendingDeletion] = useState<{
    statusId: string;
    statusLabel: string;
    affectedTodos: Todo[];
  } | null>(null);

  const checkStatusDeletion = (statusId: string, statusLabel: string) => {
    const affectedTodos = todos.filter(todo => todo.status === statusId);
    
    if (affectedTodos.length > 0) {
      setPendingDeletion({
        statusId,
        statusLabel,
        affectedTodos
      });
      return false; // Don't delete yet, show confirmation
    }
    
    return true; // Safe to delete
  };

  const confirmDeletion = (action: 'delete' | 'reassign', firstStatusId?: string) => {
    if (!pendingDeletion) return;

    const { statusId } = pendingDeletion;

    if (action === 'delete') {
      // Delete all todos with this status
      const updatedTodos = todos.filter(todo => todo.status !== statusId);
      setTodos(updatedTodos);
    } else if (action === 'reassign' && firstStatusId) {
      // Reassign todos to the first status
      const updatedTodos = todos.map(todo => 
        todo.status === statusId 
          ? { ...todo, status: firstStatusId, updatedAt: new Date() }
          : todo
      );
      setTodos(updatedTodos);
    }

    setPendingDeletion(null);
  };

  const cancelDeletion = () => {
    setPendingDeletion(null);
  };

  return {
    pendingDeletion,
    checkStatusDeletion,
    confirmDeletion,
    cancelDeletion
  };
}