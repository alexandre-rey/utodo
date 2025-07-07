import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import MobileHeader from './MobileHeader';
import AddDialog from './AddDialog';
import OpenDialog from './OpenDialog';
import { useTodosContext } from '../contexts/TodosContext';
import { useSettingsContext } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppUIContext } from '../contexts/AppContext';
import type { Todo } from '../interfaces/todo.interface';
import type { StatusConfig } from '../services/save';

type ViewMode = 'dashboard' | 'todo-list';

export default function SimpleMobileView() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedStatus, setSelectedStatus] = useState<StatusConfig | null>(null);
  
  // Use contexts instead of props
  const {
    visibleTodos,
    completedCount,
    handleAddTodo,
    handleTodoCompletionToggle,
    deleteTodo,
    saveTodo,
    showCompleted,
    setShowCompleted
  } = useTodosContext();
  
  const { statuses, settings } = useSettingsContext();
  const { user, logout } = useAuth();
  const { 
    selectedTodo, 
    setSelectedTodo, 
    setIsSettingsOpen, 
    setIsAuthOpen 
  } = useAppUIContext();

  // Calculate stats
  const totalTodos = visibleTodos.length;
  const completedTodos = visibleTodos.filter(todo => todo.isCompleted).length;
  const todayCompletedCount = visibleTodos.filter(todo => {
    const today = new Date().toDateString();
    const updatedDate = new Date(todo.updatedAt).toDateString();
    return todo.isCompleted && updatedDate === today;
  }).length;

  // Get todos by status
  const getTodosByStatus = (statusId: string) => {
    return visibleTodos.filter(todo => {
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
      <div className="min-h-screen w-screen bg-gray-50 overflow-x-hidden">
        <MobileHeader
          user={user}
          completedCount={completedCount}
          showCompleted={showCompleted}
          onToggleCompleted={() => setShowCompleted(!showCompleted)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onSignOut={logout}
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
              <AddDialog onAddTodo={(values) => handleAddTodo(values, settings)} />
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
      <div className="min-h-screen w-screen bg-gray-50 overflow-x-hidden">
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
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTodoCompletionToggle(todo.id);
                      }}
                      className="cursor-pointer p-1 -m-1"
                    >
                      <input
                        type="checkbox"
                        checked={todo.isCompleted}
                        readOnly
                        className="mt-1 mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                      />
                    </div>
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
          <AddDialog onAddTodo={(values) => handleAddTodo(values, settings)} />
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