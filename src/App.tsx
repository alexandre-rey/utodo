import { useEffect, useState } from "react";
import AddDialog from "./components/AddDialog";
import type { Todo } from "./interfaces/todo.interface";
import { Toaster } from "./components/ui/sonner";
import OpenDialog from "./components/OpenDialog";
import DisplayTodos from "./components/DisplayTodos";
import { loadTodos, saveTodos } from "./services/save";


export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const handleAddTodo = (values: { title: string, description: string }) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: values.title,
      description: values.description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    saveTodos([...todos, newTodo]);
    setTodos([...todos, newTodo]);
  }

  const handleCloseDialog = () => {
    setSelectedTodo(null);
  }

  useEffect(() => {
    const initialTodos = loadTodos();
    setTodos(initialTodos);
  }, []);

  return (
    <>
      <Toaster />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Todo App</h1>
        <AddDialog onAddTodo={handleAddTodo} />
        <OpenDialog todo={selectedTodo} closeDialog={handleCloseDialog} />
        <DisplayTodos todos={todos} setSelectedTodo={setSelectedTodo} />
      </div>
    </>
  )
}

