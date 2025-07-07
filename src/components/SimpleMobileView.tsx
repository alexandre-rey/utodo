import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import MobileHeader from './MobileHeader';
import AddDialog from './AddDialog';
import OpenDialog from './OpenDialog';
import type { Todo } from '../interfaces/todo.interface';
import type { StatusConfig } from '../services/save';

type TransformedUser = {
  email: string;
  name: string;
} | null;

interface SimpleMobileViewProps {
  todos: Todo[];
  statuses: StatusConfig[];
  onTodoCompletionToggle: (todoId: string) => void;
  onAddTodo: (values: { title: string; description: string }) => void;
  deleteTodo: (todoId: string) => void;
  saveTodo: (todo: Todo) => void;
  showCompleted: boolean;
  onToggleCompleted: () => void;
  user: TransformedUser;
  completedCount: number;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

type ViewMode = 'dashboard' | 'todo-list';

export default function SimpleMobileView({
  todos,
  statuses,
  onTodoCompletionToggle,
  onAddTodo,
  deleteTodo,
  saveTodo,
  showCompleted,
  onToggleCompleted,
  user,
  completedCount,
  onOpenSettings,
  onOpenAuth,
  onSignOut
}: SimpleMobileViewProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedStatus, setSelectedStatus] = useState<StatusConfig | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  // Calculate stats
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.isCompleted).length;
  const todayCompletedCount = todos.filter(todo => {
    const today = new Date().toDateString();
    const updatedDate = new Date(todo.updatedAt).toDateString();
    return todo.isCompleted && updatedDate === today;
  }).length;

  // Get todos by status
  const getTodosByStatus = (statusId: string) => {
    return todos.filter(todo => {
      if (!showCompleted && todo.isCompleted) return false;
      return todo.status === statusId;
    });
  };

  // Handle status card click
  const handleStatusClick = (status: StatusConfig) => {
    setSelectedStatus(status);
    setViewMode('todo-list');
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedStatus(null);
  };

  // Handle todo click
  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
  };

  // Handle close todo dialog
  const handleCloseTodoDialog = () => {
    setSelectedTodo(null);
  };

  const getProgressPercentage = () => {
    if (totalTodos === 0) return 0;
    return Math.round((completedTodos / totalTodos) * 100);
  };

  // Dashboard View
  if (viewMode === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader
          user={user}
          completedCount={completedCount}
          showCompleted={showCompleted}
          onToggleCompleted={onToggleCompleted}
          onOpenSettings={onOpenSettings}
          onOpenAuth={onOpenAuth}
          onSignOut={onSignOut}
        />

        <div className="p-4 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalTodos}</div>
                <div className="text-sm text-gray-600">{t('dashboard.totalTodos')}</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{todayCompletedCount}</div>
                <div className="text-sm text-gray-600">{t('dashboard.completedToday')}</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{getProgressPercentage()}%</div>
                <div className="text-sm text-gray-600">{t('dashboard.progress')}</div>
              </div>
            </Card>
          </div>

          {/* Status Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('dashboard.statusOverview')}</h2>
              <AddDialog onAddTodo={onAddTodo} />
            </div>

            {statuses.map((status) => {
              const statusTodos = getTodosByStatus(status.id);
              const count = statusTodos.length;

              return (
                <Card 
                  key={status.id}
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200 active:scale-95 transform transition-transform"
                  onClick={() => handleStatusClick(status)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: status.color }}
                        />
                        <CardTitle className="text-lg">{status.label}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="h-6 min-w-[2rem] justify-center">
                        {count}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Todo Dialog */}
        <OpenDialog 
          todo={selectedTodo} 
          closeDialog={handleCloseTodoDialog} 
          deleteTodo={deleteTodo} 
          saveTodo={saveTodo}
          statuses={statuses}
        />
      </div>
    );
  }

  // Todo List View
  if (viewMode === 'todo-list' && selectedStatus) {
    const statusTodos = getTodosByStatus(selectedStatus.id);

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Simple Header with Back Button */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 flex-1">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedStatus.color }}
            />
            <h1 className="text-lg font-semibold">{selectedStatus.label}</h1>
            <Badge variant="secondary">{statusTodos.length}</Badge>
          </div>
        </div>

        {/* Todo List */}
        <div className="p-4 space-y-3">
          {statusTodos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('dashboard.noTodos')}
            </div>
          ) : (
            statusTodos.map((todo) => (
              <Card 
                key={todo.id}
                className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => handleTodoClick(todo)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={todo.isCompleted}
                      onChange={(e) => {
                        e.stopPropagation();
                        onTodoCompletionToggle(todo.id);
                      }}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium ${todo.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {todo.description}
                        </p>
                      )}
                      {todo.dueDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t('dates.due')} {new Date(todo.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Floating Add Button */}
        <div className="fixed bottom-6 right-6">
          <AddDialog onAddTodo={onAddTodo} />
        </div>

        {/* Todo Dialog */}
        <OpenDialog 
          todo={selectedTodo} 
          closeDialog={handleCloseTodoDialog} 
          deleteTodo={deleteTodo} 
          saveTodo={saveTodo}
          statuses={statuses}
        />
      </div>
    );
  }

  return null;
}