import { useState, useEffect } from "react";
import type { Todo } from "../interfaces/todo.interface";
import { loadTodos, saveTodos, type AppSettings } from "../services/save";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  const handleAddTodo = (values: { title: string, description: string }, settings?: AppSettings) => {
    const defaultStatus = settings?.statuses[0]?.id || "low";
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: values.title,
      description: values.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: defaultStatus,
      completed: false
    };
    
    const updatedTodos = [...todos, newTodo];
    saveTodos(updatedTodos);
    setTodos(updatedTodos);
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    saveTodos(updatedTodos);
    setTodos(updatedTodos);
  };

  const saveTodo = (todo: Todo) => {
    const updatedTodos = todos.map(t => t.id === todo.id ? { ...t, ...todo, updatedAt: new Date() } : t);
    saveTodos(updatedTodos);
    setTodos(updatedTodos);
  };

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

  const completedCount = todos.filter(todo => todo.completed).length;

  const updateTodos = (newTodos: Todo[]) => {
    saveTodos(newTodos);
    setTodos(newTodos);
  };

  return {
    todos,
    setTodos: updateTodos,
    handleAddTodo,
    deleteTodo,
    saveTodo,
    handleTodoStatusChange,
    handleTodoCompletionToggle,
    completedCount
  };
}