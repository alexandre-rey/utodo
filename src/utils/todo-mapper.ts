import { type Todo as AppTodo } from '../interfaces/todo.interface';
import { type Todo as ApiTodo, type CreateTodoDto, type UpdateTodoDto } from '../types/api';

export function mapApiTodoToAppTodo(apiTodo: ApiTodo): AppTodo {
  return {
    id: apiTodo.id,
    title: apiTodo.title,
    description: apiTodo.description,
    status: apiTodo.status,
    completed: apiTodo.isCompleted,
    createdAt: new Date(apiTodo.createdAt),
    updatedAt: new Date(apiTodo.updatedAt),
    dueDate: apiTodo.dueDate ? new Date(apiTodo.dueDate) : undefined,
  };
}

export function mapAppTodoToUpdateDto(appTodo: AppTodo): UpdateTodoDto {
  return {
    title: appTodo.title,
    description: appTodo.description,
    status: appTodo.status,
    isCompleted: appTodo.completed,
    dueDate: appTodo.dueDate?.toISOString(),
  };
}

export function mapAppTodoToCreateDto(appTodo: Omit<AppTodo, 'id' | 'createdAt' | 'updatedAt'>): CreateTodoDto {
  return {
    title: appTodo.title,
    description: appTodo.description,
    status: appTodo.status,
    priority: 0,
    dueDate: appTodo.dueDate?.toISOString(),
  };
}