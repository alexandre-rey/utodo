// import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Check, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  MoreHorizontal,
  CheckCircle,
  Circle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Todo } from '../interfaces/todo.interface';
import type { StatusConfig } from '../services/save';

interface MobileTodoListProps {
  todos: Todo[];
  status: StatusConfig;
  onTodoClick: (todo: Todo) => void;
  onTodoStatusChange?: (todoId: string, newStatus: string) => void;
  onTodoCompletionToggle: (todoId: string) => void;
  showCompleted: boolean;
  isSelectionMode: boolean;
  selectedTodos: Set<string>;
  onTodoSelection: (todoId: string, isSelected: boolean) => void;
  onEnterSelectionMode: () => void;
}

export default function MobileTodoList({
  todos,
  status,
  onTodoClick,
  onTodoCompletionToggle,
  showCompleted,
  isSelectionMode,
  selectedTodos,
  onTodoSelection,
  onEnterSelectionMode
}: MobileTodoListProps) {
  const { t } = useTranslation();
  // const [swipedTodo, setSwipedTodo] = useState<string | null>(null);

  // Filter todos for this status
  const filteredTodos = todos.filter(todo => {
    if (!showCompleted && todo.completed) return false;
    return todo.status === status.id;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todoDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = todoDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('dates.today');
    if (diffDays === 1) return t('dates.tomorrow');
    if (diffDays === -1) return t('dates.yesterday');
    if (diffDays < 0) return `${Math.abs(diffDays)} ${t('dates.daysOverdue')}`;
    return `${diffDays} ${t('dates.days')}`;
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return t('todo.high');
      case 2: return t('todo.medium');
      case 3: return t('todo.low');
      default: return t('todo.normal');
    }
  };

  // Handle swipe actions
  // const handleSwipeStart = (_e: React.TouchEvent, _todoId: string) => {
  //   // Implementation for swipe actions will be added later
  // };

  const handleLongPress = (todoId: string) => {
    if (!isSelectionMode) {
      onEnterSelectionMode();
    }
    onTodoSelection(todoId, !selectedTodos.has(todoId));
  };

  if (filteredTodos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div 
          className="w-16 h-16 rounded-full mb-4 flex items-center justify-center"
          style={{ backgroundColor: `${status.color}20` }}
        >
          <Clock className="w-8 h-8" style={{ color: status.color }} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('messages.noTodos')}
        </h3>
        <p className="text-gray-600 text-sm">
          {t('dashboard.noTodosInStatus', { status: status.label })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <h3 className="text-lg font-semibold">{status.label}</h3>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredTodos.length}
        </Badge>
      </div>

      {/* Todo list */}
      <div className="space-y-3">
        {filteredTodos.map((todo) => {
          const isSelected = selectedTodos.has(todo.id);
          const isOverdue = Boolean(todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed);

          return (
            <Card
              key={todo.id}
              className={`p-4 cursor-pointer transition-all duration-200 active:scale-95 ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              } ${isOverdue ? 'border-red-200' : ''}`}
              onClick={() => {
                if (isSelectionMode) {
                  onTodoSelection(todo.id, !isSelected);
                } else {
                  onTodoClick(todo);
                }
              }}
              // onTouchStart={(e) => handleSwipeStart(e, todo.id)}
            >
              <div className="flex items-start space-x-3">
                {/* Selection/Completion indicator */}
                <div className="pt-0.5">
                  {isSelectionMode ? (
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTodoCompletionToggle(todo.id);
                      }}
                    >
                      {todo.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Todo content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-gray-900 leading-5 ${
                        todo.completed ? 'line-through text-gray-500' : ''
                      }`}>
                        {todo.title}
                      </h4>
                      
                      {todo.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {todo.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 ml-2 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLongPress(todo.id);
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center space-x-2 mt-3">
                    {/* Priority */}
                    {(todo.priority && todo.priority > 0) ? (
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-0.5 ${getPriorityColor(todo.priority)}`}
                      >
                        {getPriorityLabel(todo.priority)}
                      </Badge>
                    ) : null}

                    {/* Due date */}
                    {todo.dueDate && (
                      <div className={`flex items-center space-x-1 text-xs ${
                        isOverdue ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(todo.dueDate.toISOString())}</span>
                        {isOverdue && <AlertTriangle className="w-3 h-3" />}
                      </div>
                    )}

                    {/* Updated date */}
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(todo.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}