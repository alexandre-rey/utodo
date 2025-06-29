import type { Todo } from "../interfaces/todo.interface";

export const TODOS_KEY = "todos";
export const SETTINGS_KEY = "settings";

export interface StatusConfig {
    id: string;
    label: string;
    color: string;
}

export interface AppSettings {
    statuses: StatusConfig[];
}

const DEFAULT_SETTINGS: AppSettings = {
    statuses: [
        { id: "low", label: "Low Priority", color: "#e5e7eb" },
        { id: "medium", label: "Medium Priority", color: "#fef3c7" },
        { id: "high", label: "High Priority", color: "#fed7aa" },
        { id: "urgent", label: "Urgent", color: "#fecaca" }
    ]
};


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

export const saveSettings = (settings: AppSettings) => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage:", error);
    }
}

export const loadSettings = (): AppSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                statuses: parsed.statuses || DEFAULT_SETTINGS.statuses
            };
        }
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error("Failed to load settings from localStorage:", error);
        return DEFAULT_SETTINGS;
    }
}

