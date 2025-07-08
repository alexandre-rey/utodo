import type { Todo } from "../interfaces/todo.interface";
import { setSecureItem, getSecureItem, setItem, getItem } from "../utils/secureStorage";

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
        // Use encrypted storage for potentially sensitive todo data
        setSecureItem(TODOS_KEY, todos);
    } catch (error) {
        console.error("Failed to save todos to secure storage:", error);
    }
}

export const loadTodos = (): Todo[] => {
    try {
        // Try to load from encrypted storage first
        let todos = getSecureItem<Todo[]>(TODOS_KEY);
        
        // If no encrypted data, try to migrate from old localStorage
        if (!todos) {
            const oldData = localStorage.getItem(TODOS_KEY);
            if (oldData) {
                console.warn("Migrating todos to encrypted storage...");
                todos = JSON.parse(oldData);
                if (todos && todos.length > 0) {
                    // Save to encrypted storage and remove old data
                    setSecureItem(TODOS_KEY, todos);
                    localStorage.removeItem(TODOS_KEY);
                }
            }
        }
        
        if (!todos) return [];
        
        // Convert date strings back to Date objects
        return todos.map((todo: Todo) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
        }));
    } catch (error) {
        console.error("Failed to load todos from secure storage:", error);
        return [];
    }
}

export const saveSettings = (settings: AppSettings) => {
    try {
        // Settings are less sensitive, use regular storage
        setItem(SETTINGS_KEY, settings);
    } catch (error) {
        console.error("Failed to save settings to storage:", error);
    }
}

export const loadSettings = (): AppSettings => {
    try {
        const stored = getItem<AppSettings>(SETTINGS_KEY);
        if (stored) {
            return {
                statuses: stored.statuses || DEFAULT_SETTINGS.statuses
            };
        }
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error("Failed to load settings from storage:", error);
        return DEFAULT_SETTINGS;
    }
}

// Generic storage functions for compatibility
export const loadFromStorage = <T>(key: string): T | null => {
    try {
        // Use secure storage for sensitive data
        if (key.includes('todos') || key.includes('user') || key.includes('auth')) {
            return getSecureItem<T>(key);
        }
        // Use regular storage for non-sensitive data
        return getItem<T>(key);
    } catch (error) {
        console.error(`Failed to load ${key} from storage:`, error);
        return null;
    }
}

export const saveToStorage = <T>(key: string, data: T): void => {
    try {
        // Use secure storage for sensitive data
        if (key.includes('todos') || key.includes('user') || key.includes('auth')) {
            setSecureItem(key, data);
        } else {
            // Use regular storage for non-sensitive data
            setItem(key, data);
        }
    } catch (error) {
        console.error(`Failed to save ${key} to storage:`, error);
    }
}

