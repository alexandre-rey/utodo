
export interface Todo {
    id: string;
    title: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    completed: boolean;
    dueDate?: Date;
}