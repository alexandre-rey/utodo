// import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AddDialog from './AddDialog';
import type { Todo } from '../interfaces/todo.interface';
import type { StatusConfig } from '../services/save';

interface MobileDashboardProps {
  todos: Todo[];
  statuses: StatusConfig[];
  onStatusClick: (statusId: string) => void;
  onAddTodo: (values: { title: string; description: string }) => void;
  showCompleted: boolean;
}

export default function MobileDashboard({ 
  todos, 
  statuses, 
  onStatusClick, 
  onAddTodo,
  showCompleted 
}: MobileDashboardProps) {
  const { t } = useTranslation();

  // Calculate stats
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const todayCompletedCount = todos.filter(todo => {
    const today = new Date().toDateString();
    const updatedDate = new Date(todo.updatedAt).toDateString();
    return todo.completed && updatedDate === today;
  }).length;

  // Get todos by status
  const getTodosByStatus = (statusId: string) => {
    return todos.filter(todo => {
      if (!showCompleted && todo.completed) return false;
      return todo.status === statusId;
    });
  };

  // Get preview todos (first 2 non-completed)
  const getPreviewTodos = (statusId: string) => {
    return getTodosByStatus(statusId)
      .filter(todo => !todo.completed)
      .slice(0, 2);
  };

  const getStatusIcon = (statusId: string, count: number) => {
    if (count === 0) return <Clock className="h-5 w-5 text-gray-400" />;
    
    switch (statusId) {
      case 'done':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inProgress':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getProgressPercentage = () => {
    if (totalTodos === 0) return 0;
    return Math.round((completedTodos / totalTodos) * 100);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Quick Stats Bar */}
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

      {/* Overall Progress */}
      {totalTodos > 0 && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t('dashboard.overallProgress')}</span>
              <span className="text-sm text-gray-600">
                {completedTodos} / {totalTodos} {t('dashboard.completed')}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </Card>
      )}

      {/* Status Summary Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('dashboard.statusOverview')}</h2>
          <AddDialog onAddTodo={onAddTodo} />
        </div>

        {statuses.map((status) => {
          const statusTodos = getTodosByStatus(status.id);
          const previewTodos = getPreviewTodos(status.id);
          const count = statusTodos.length;

          return (
            <Card 
              key={status.id}
              className="cursor-pointer hover:shadow-md transition-shadow duration-200 active:scale-95 transform transition-transform"
              onClick={() => onStatusClick(status.id)}
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
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status.id, count)}
                    <Badge 
                      variant="secondary" 
                      className="h-6 min-w-[2rem] justify-center"
                    >
                      {count}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              {previewTodos.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {previewTodos.map((todo) => (
                      <div 
                        key={todo.id}
                        className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {todo.title}
                          </p>
                          {todo.description && (
                            <p className="text-xs text-gray-600 truncate">
                              {todo.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {count > 2 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        {t('dashboard.andMore', { count: count - 2 })}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
              
              {count === 0 && (
                <CardContent className="pt-0">
                  <div className="text-sm text-gray-500 text-center py-2">
                    {t('dashboard.noTodos')}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}