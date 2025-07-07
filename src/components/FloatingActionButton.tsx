import { useState } from 'react';
import { Button } from './ui/button';
import { 
  Plus, 
  Check, 
  Trash2, 
  Move,
  X,
  ArrowUp,
  CheckCircle,
  Circle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FloatingActionButtonProps {
  mode: 'add' | 'selection' | 'todo-detail';
  selectedCount?: number;
  onAddTodo?: () => void;
  onBulkComplete?: () => void;
  onBulkDelete?: () => void;
  onBulkMove?: () => void;
  onExitSelection?: () => void;
  onToggleComplete?: () => void;
  onMoveTodo?: () => void;
  isCompleted?: boolean;
  className?: string;
}

export default function FloatingActionButton({
  mode,
  selectedCount = 0,
  onAddTodo,
  onBulkComplete,
  onBulkDelete,
  onBulkMove,
  onExitSelection,
  onToggleComplete,
  onMoveTodo,
  isCompleted = false,
  className = ''
}: FloatingActionButtonProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Add mode - single FAB for adding todos
  if (mode === 'add') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={onAddTodo}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  // Selection mode - bulk action FAB
  if (mode === 'selection') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="flex flex-col-reverse items-end space-y-reverse space-y-3">
          {/* Main FAB - Exit selection */}
          <Button
            onClick={onExitSelection}
            size="lg"
            variant="outline"
            className="h-14 w-14 rounded-full shadow-lg bg-white border-2 active:scale-95 transition-transform"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Action buttons when items are selected */}
          {selectedCount > 0 && (
            <>
              {/* Bulk complete */}
              <Button
                onClick={onBulkComplete}
                size="lg"
                className="h-12 w-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700 active:scale-95 transition-transform"
                title={t('actions.markComplete')}
              >
                <Check className="h-5 w-5" />
              </Button>

              {/* Bulk move */}
              <Button
                onClick={onBulkMove}
                size="lg"
                className="h-12 w-12 rounded-full shadow-lg bg-orange-600 hover:bg-orange-700 active:scale-95 transition-transform"
                title={t('actions.move')}
              >
                <Move className="h-5 w-5" />
              </Button>

              {/* Bulk delete */}
              <Button
                onClick={onBulkDelete}
                size="lg"
                className="h-12 w-12 rounded-full shadow-lg bg-red-600 hover:bg-red-700 active:scale-95 transition-transform"
                title={t('actions.delete')}
              >
                <Trash2 className="h-5 w-5" />
              </Button>

              {/* Selection count indicator */}
              <div className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                {selectedCount} {t('messages.selected')}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Todo detail mode - expandable FAB with actions
  if (mode === 'todo-detail') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="flex flex-col-reverse items-end space-y-reverse space-y-3">
          {/* Main FAB */}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform"
          >
            {isExpanded ? (
              <X className="h-6 w-6" />
            ) : (
              <ArrowUp className="h-6 w-6" />
            )}
          </Button>

          {/* Expanded actions */}
          {isExpanded && (
            <>
              {/* Toggle completion */}
              <Button
                onClick={onToggleComplete}
                size="lg"
                className={`h-12 w-12 rounded-full shadow-lg active:scale-95 transition-transform ${
                  isCompleted
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                title={isCompleted ? t('actions.markIncomplete') : t('actions.markComplete')}
              >
                {isCompleted ? (
                  <Circle className="h-5 w-5" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
              </Button>

              {/* Move todo */}
              <Button
                onClick={onMoveTodo}
                size="lg"
                className="h-12 w-12 rounded-full shadow-lg bg-orange-600 hover:bg-orange-700 active:scale-95 transition-transform"
                title={t('actions.move')}
              >
                <Move className="h-5 w-5" />
              </Button>

              {/* Add new todo */}
              <Button
                onClick={onAddTodo}
                size="lg"
                className="h-12 w-12 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 active:scale-95 transition-transform"
                title={t('actions.addNew')}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}