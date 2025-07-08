export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  dueDate?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CustomStatus {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface UserSettings {
  id: string;
  userId: string;
  customStatuses?: CustomStatus[];
  defaultView: 'kanban' | 'calendar';
  showCompletedTodos: boolean;
  enableNotifications: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  status?: string;
  priority?: number;
  dueDate?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: number;
  dueDate?: string;
  isCompleted?: boolean;
}

export interface BulkActionDto {
  todoIds: string[];
  action: 'delete' | 'complete' | 'incomplete' | 'changeStatus';
  newStatus?: string;
}

export interface UpdateSettingsDto {
  customStatuses?: CustomStatus[];
  defaultView?: 'kanban' | 'calendar';
  showCompletedTodos?: boolean;
  enableNotifications?: boolean;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  csrfToken: string;
  message?: string;
}

export interface TodosResponse {
  data: Todo[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BulkActionResponse {
  affected: number;
}

export interface MessageResponse {
  message: string;
}

export interface TodoQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface SubscriptionStatus {
  id?: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  plan: 'free' | 'premium';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface CreateSubscriptionDto {
  priceId: string;
}

export interface StatusLimits {
  count: number;
  canCreate: boolean;
  limit: number;
  message: string;
}