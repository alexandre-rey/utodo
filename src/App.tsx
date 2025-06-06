import { useState } from "react";
import AddDialog from "./components/AddDialog";
import type { Todo } from "./interfaces/todo.interface";
import { Toaster } from "./components/ui/sonner";


export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const handleAddTodo = (values: { title: string, description: string }) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: values.title,
      description: values.description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTodos([...todos, newTodo]);
  }

  return (
    <>
      <Toaster />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Todo App</h1>
        <AddDialog onAddTodo={handleAddTodo} />
        <table className="mt-4 w-full max-w-md bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {todos.map(todo => (
              <tr key={todo.id} className="border-b">
                <td className="px-4 py-2">{todo.title}</td>
                <td className="px-4 py-2">{todo.description}</td>
                <td className="px-4 py-2">
                  {/* Actions like Edit/Delete can be added here */}
                  <button className="text-blue-500 hover:underline">Edit</button>
                  <button className="text-red-500 hover:underline ml-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

