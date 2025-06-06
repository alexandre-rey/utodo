import type { Todo } from "../interfaces/todo.interface";


export const TODOS_KEY = "todos";

export const saveTodos = (todos: Todo[]) => {
    try {
        localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
    } catch (error) {
        console.error("Failed to save todos to localStorage:", error);
    }
}

export const loadTodos = (): Todo[] => {
    try {
        return JSON.parse(localStorage.getItem(TODOS_KEY) || "[]");
    } catch (error) {
        console.error("Failed to load todos from localStorage:", error);
        return [];
    }
}