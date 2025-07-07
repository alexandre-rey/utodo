
export interface Todo {
    id: string;
    title: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    completed: boolean;
    dueDate?: Date;
    priority?: number; // API compatibility
    userId?: string; // API compatibility
}