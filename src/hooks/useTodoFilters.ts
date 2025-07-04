import { useMemo } from "react";
import type { Todo } from "../interfaces/todo.interface";

export function useTodoFilters(todos: Todo[], showCompleted: boolean, searchQuery: string) {
  const visibleTodos = useMemo(() => {
    return todos.filter(todo => {
      const shouldShow = showCompleted || !todo.completed;
      const matchesSearch = searchQuery === "" || 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return shouldShow && matchesSearch;
    });
  }, [todos, showCompleted, searchQuery]);

  const allVisibleSelected = (selectedTodos: Set<string>) => {
    return visibleTodos.length > 0 && visibleTodos.every(todo => selectedTodos.has(todo.id));
  };

  return {
    visibleTodos,
    allVisibleSelected
  };
}