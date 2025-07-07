import { apiClient } from '@/lib/api-client';
import { loadFromStorage, saveToStorage } from '@/services/save';
import { 
  type Todo, 
  type CreateTodoDto, 
  type UpdateTodoDto, 
  type BulkActionDto, 
  type TodosResponse, 
  type BulkActionResponse,
  type TodoQueryParams,
  type MessageResponse
} from '@/types/api';

class TodoService {
  private readonly STORAGE_KEY = 'todos';
  private readonly SYNC_FLAG_KEY = 'todos_synced';
  private hasSynced = false;

  public async getTodos(params?: TodoQueryParams): Promise<TodosResponse> {
    if (!apiClient.isAuthenticated()) {
      return this.getLocalTodos(params);
    }

    try {
      return await apiClient.get<TodosResponse>('/todos', params as Record<string, unknown>);
    } catch (error) {
      console.warn('API call failed, falling back to local storage:', error);
      return this.getLocalTodos(params);
    }
  }

  public async getTodo(id: string): Promise<Todo> {
    if (!apiClient.isAuthenticated()) {
      const todos = this.getLocalTodosData();
      const todo = todos.find(t => t.id === id);
      if (!todo) {
        throw new Error('Todo not found');
      }
      return todo;
    }

    return apiClient.get<Todo>(`/todos/${id}`);
  }

  public async createTodo(data: CreateTodoDto): Promise<Todo> {
    if (!apiClient.isAuthenticated()) {
      return this.createLocalTodo(data);
    }

    try {
      return await apiClient.post<Todo>('/todos', data);
    } catch (error) {
      console.warn('API call failed, falling back to local storage:', error);
      return this.createLocalTodo(data);
    }
  }

  public async updateTodo(id: string, data: UpdateTodoDto): Promise<Todo> {
    if (!apiClient.isAuthenticated()) {
      return this.updateLocalTodo(id, data);
    }

    try {
      return await apiClient.patch<Todo>(`/todos/${id}`, data);
    } catch (error) {
      console.warn('API call failed, falling back to local storage:', error);
      return this.updateLocalTodo(id, data);
    }
  }

  public async deleteTodo(id: string): Promise<void> {
    if (!apiClient.isAuthenticated()) {
      this.deleteLocalTodo(id);
      return;
    }

    try {
      await apiClient.delete<MessageResponse>(`/todos/${id}`);
    } catch (error) {
      console.warn('API call failed, falling back to local storage:', error);
      this.deleteLocalTodo(id);
    }
  }

  public async bulkAction(data: BulkActionDto): Promise<BulkActionResponse> {
    if (!apiClient.isAuthenticated()) {
      return this.bulkActionLocal(data);
    }

    try {
      return await apiClient.post<BulkActionResponse>('/todos/bulk-action', data);
    } catch (error) {
      console.warn('API call failed, falling back to local storage:', error);
      return this.bulkActionLocal(data);
    }
  }

  private getLocalTodosData(): Todo[] {
    const todos = loadFromStorage<Todo[]>(this.STORAGE_KEY);
    return todos || [];
  }

  private getLocalTodos(params?: TodoQueryParams): TodosResponse {
    let todos = this.getLocalTodosData();

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      todos = todos.filter(todo => 
        todo.title.toLowerCase().includes(searchLower) ||
        todo.description?.toLowerCase().includes(searchLower)
      );
    }

    if (params?.status) {
      todos = todos.filter(todo => todo.status === params.status);
    }

    const total = todos.length;
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: todos.slice(startIndex, endIndex),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  private createLocalTodo(data: CreateTodoDto): Todo {
    const todos = this.getLocalTodosData();
    const now = new Date().toISOString();
    
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      priority: data.priority || 0,
      dueDate: data.dueDate,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
      userId: 'local-user',
    };

    todos.push(newTodo);
    saveToStorage(this.STORAGE_KEY, todos);
    
    return newTodo;
  }

  private updateLocalTodo(id: string, data: UpdateTodoDto): Todo {
    const todos = this.getLocalTodosData();
    const todoIndex = todos.findIndex(t => t.id === id);
    
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }

    const updatedTodo = {
      ...todos[todoIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    todos[todoIndex] = updatedTodo;
    saveToStorage(this.STORAGE_KEY, todos);
    
    return updatedTodo;
  }

  private deleteLocalTodo(id: string): void {
    const todos = this.getLocalTodosData();
    const filteredTodos = todos.filter(t => t.id !== id);
    saveToStorage(this.STORAGE_KEY, filteredTodos);
  }

  private bulkActionLocal(data: BulkActionDto): BulkActionResponse {
    const todos = this.getLocalTodosData();
    let affected = 0;

    const updatedTodos = todos.filter(todo => {
      if (data.todoIds.includes(todo.id)) {
        affected++;
        
        switch (data.action) {
          case 'delete':
            return false;
          case 'complete':
            todo.isCompleted = true;
            todo.updatedAt = new Date().toISOString();
            break;
          case 'incomplete':
            todo.isCompleted = false;
            todo.updatedAt = new Date().toISOString();
            break;
          case 'changeStatus':
            if (data.newStatus) {
              todo.status = data.newStatus;
              todo.updatedAt = new Date().toISOString();
            }
            break;
        }
      }
      return true;
    });

    saveToStorage(this.STORAGE_KEY, updatedTodos);
    
    return { affected };
  }

  public async syncLocalTodosToServer(): Promise<void> {
    
    if (!apiClient.isAuthenticated()) {
      return;
    }

    // Check if we've already synced this session
    if (this.hasSynced) {
      return;
    }

    // Check if sync was already completed in a previous session
    const syncFlag = localStorage.getItem(this.SYNC_FLAG_KEY);
    if (syncFlag === 'true') {
      this.hasSynced = true;
      return;
    }

    const localTodos = this.getLocalTodosData();
    
    if (localTodos.length === 0) {
      // Mark as synced even if no todos to avoid future checks
      this.markAsSynced();
      return;
    }

    try {
      
      for (const todo of localTodos) {
        await this.createTodo({
          title: todo.title,
          description: todo.description,
          status: todo.status,
          priority: todo.priority,
          dueDate: todo.dueDate,
        });
      }
      
      saveToStorage(this.STORAGE_KEY, []);
      this.markAsSynced();
    } catch (error) {
      console.error('Failed to sync local todos to server:', error);
      throw error;
    }
  }

  private markAsSynced(): void {
    this.hasSynced = true;
    localStorage.setItem(this.SYNC_FLAG_KEY, 'true');
  }

  public resetSyncFlag(): void {
    this.hasSynced = false;
    localStorage.removeItem(this.SYNC_FLAG_KEY);
  }

  public async forceSyncToServer(): Promise<void> {
    this.resetSyncFlag();
    await this.syncLocalTodosToServer();
  }
}

export const todoService = new TodoService();