import { useState, useEffect } from "react";
import type { Todo } from "../interfaces/todo.interface";
import { todoService } from "../services/todo.service";
import type { AppSettings } from "../services/save";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { isAuthenticated, isLoading } = useAuthContext();

  const loadTodos = async () => {
    try {
      // Use appropriate method based on auth state
      const getTodosMethod = isAuthenticated ? 
        todoService.getTodosFromServer.bind(todoService) : 
        todoService.getTodos.bind(todoService);
      
      // First, get the first page to know the total count
      const firstPage = await getTodosMethod({ page: 1, limit: 100 });
      
      let allTodos = [...firstPage.data];
      
      // If there are more pages, fetch them all
      if (firstPage.meta.totalPages > 1) {
        const remainingPages = [];
        for (let page = 2; page <= firstPage.meta.totalPages; page++) {
          remainingPages.push(getTodosMethod({ page, limit: 100 }));
        }
        
        const remainingResponses = await Promise.all(remainingPages);
        allTodos = allTodos.concat(...remainingResponses.map(response => response.data));
      }
      
      // Transform the todos to match the frontend interface
      const transformedTodos = allTodos.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        completed: todo.isCompleted || false
      }));
      
      setTodos(transformedTodos);
    } catch (error) {
      console.error('Failed to load todos:', error);
      // If loading fails and user should be authenticated, clear todos to prevent stale data
      if (isAuthenticated) {
        setTodos([]);
      }
    }
  };

  useEffect(() => {
    // Don't load todos while auth is still loading
    if (isLoading) return;
    
    if (isAuthenticated) {
      loadTodos();
    } else {
      // Clear todos when user is not authenticated
      setTodos([]);
    }
  }, [isAuthenticated, isLoading]); // Reload when auth state changes

  const handleAddTodo = async (values: { title: string, description: string }, settings?: AppSettings) => {
    const defaultStatus = settings?.statuses[0]?.id || "pending";
    
    try {
      const createMethod = isAuthenticated ? 
        todoService.createTodoOnServer.bind(todoService) : 
        todoService.createTodo.bind(todoService);
        
      const apiTodo = await createMethod({
        title: values.title,
        description: values.description,
        status: defaultStatus
      });
      
      const newTodo: Todo = {
        ...apiTodo,
        createdAt: new Date(apiTodo.createdAt),
        updatedAt: new Date(apiTodo.updatedAt),
        dueDate: apiTodo.dueDate ? new Date(apiTodo.dueDate) : undefined,
        completed: apiTodo.isCompleted || false
      };
      
      setTodos(prev => [...prev, newTodo]);
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const deleteMethod = isAuthenticated ? 
        todoService.deleteTodoOnServer.bind(todoService) : 
        todoService.deleteTodo.bind(todoService);
        
      await deleteMethod(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const saveTodo = async (todo: Todo) => {
    try {
      const updateData = {
        title: todo.title,
        description: todo.description,
        status: todo.status,
        priority: todo.priority,
        dueDate: todo.dueDate?.toISOString(),
        isCompleted: todo.completed
      };
      
      const updateMethod = isAuthenticated ? 
        todoService.updateTodoOnServer.bind(todoService) : 
        todoService.updateTodo.bind(todoService);
      
      const apiTodo = await updateMethod(todo.id, updateData);
      
      const updatedTodo: Todo = {
        ...apiTodo,
        createdAt: new Date(apiTodo.createdAt),
        updatedAt: new Date(apiTodo.updatedAt),
        dueDate: apiTodo.dueDate ? new Date(apiTodo.dueDate) : undefined,
        completed: apiTodo.isCompleted || false
      };
      
      setTodos(prev => prev.map(t => t.id === todo.id ? updatedTodo : t));
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleTodoStatusChange = async (todoId: string, newStatus: string) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;
      
      await saveTodo({ ...todo, status: newStatus });
    } catch (error) {
      console.error('Failed to update todo status:', error);
    }
  };

  const handleTodoCompletionToggle = async (todoId: string) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;
      
      await saveTodo({ ...todo, completed: !todo.completed });
    } catch (error) {
      console.error('Failed to toggle todo completion:', error);
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;

  const updateTodos = (newTodos: Todo[]) => {
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