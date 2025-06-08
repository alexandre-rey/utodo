import type { Todo } from "../interfaces/todo.interface";
import { Card } from "./ui/card";


interface DisplayTodosProps {
    todos: Todo[];
    setSelectedTodo: (todo: Todo | null) => void;
}

export default function DisplayTodos({ todos, setSelectedTodo }: DisplayTodosProps) {

    return (
        <div className="w-full max-w-2xl mx-auto p-4 flex flex-row flex-wrap gap-4 justify-center overflow-scroll max-h-200">
            {todos.map((todo) => (
                <Card key={todo.id} className="mb-4 p-4 cursor-pointer hover:bg-gray-100 w-64" onClick={() => setSelectedTodo(todo)}>
                    <h2 className="text-lg font-semibold">{todo.title}</h2>
                    <p className="text-sm text-gray-600 max-w-4/5 h-20 overflow-clip">{todo.description || "No description provided."}</p>
                    <p className="text-xs text-gray-400">Status: {todo.completed ? "Completed" : "Pending"}</p>
                </Card>
            ))}
        </div>
    )

}