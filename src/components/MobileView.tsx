import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MobileDashboard from './MobileDashboard';
import MobileTabNavigation from './MobileTabNavigation';
import MobileHeader from './MobileHeader';
import BottomSheet from './BottomSheet';
import MobileTodoList from './MobileTodoList';
import FloatingActionButton from './FloatingActionButton';
import QuickStatusSwitcher from './QuickStatusSwitcher';
import type { Todo } from '../interfaces/todo.interface';
import type { StatusConfig } from '../services/save';
type TransformedUser = {
  email: string;
  name: string;
} | null;

interface MobileViewProps {
  todos: Todo[];
  statuses: StatusConfig[];
  onTodoStatusChange: (todoId: string, newStatus: string) => void;
  onTodoCompletionToggle: (todoId: string) => void;
  onTodoClick: (todo: Todo) => void;
  onAddTodo: () => void;
  showCompleted: boolean;
  onToggleCompleted: () => void;
  isSelectionMode: boolean;
  selectedTodos: Set<string>;
  onTodoSelection: (todoId: string, isSelected: boolean) => void;
  onEnterSelectionMode: () => void;
  onExitSelectionMode: () => void;
  onBulkComplete: () => void;
  onBulkDelete: () => void;
  onBulkStatusChange: (statusId: string) => void;
  user: TransformedUser;
  completedCount: number;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

type ViewMode = 'dashboard' | 'status-detail' | 'todo-detail';

export default function MobileView({
  todos,
  statuses,
  onTodoStatusChange,
  onTodoCompletionToggle,
  onTodoClick,
  onAddTodo,
  showCompleted,
  onToggleCompleted,
  isSelectionMode,
  selectedTodos,
  onTodoSelection,
  onEnterSelectionMode,
  onExitSelectionMode,
  onBulkComplete,
  onBulkDelete,
  onBulkStatusChange,
  user,
  completedCount,
  onOpenSettings,
  onOpenAuth,
  onSignOut
}: MobileViewProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [activeStatusId, setActiveStatusId] = useState<string>('');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Set first status as default active tab
  useEffect(() => {
    if (statuses.length > 0 && !activeStatusId) {
      setActiveStatusId(statuses[0].id);
    }
  }, [statuses, activeStatusId]);

  // Sync selectedTodo with updated todos
  useEffect(() => {
    if (selectedTodo) {
      const updatedTodo = todos.find(todo => todo.id === selectedTodo.id);
      if (updatedTodo && updatedTodo.status !== selectedTodo.status) {
        setSelectedTodo(updatedTodo);
        setActiveStatusId(updatedTodo.status);
      }
    }
  }, [todos, selectedTodo]);

  // Handle status card click from dashboard
  const handleStatusClick = (statusId: string) => {
    setActiveStatusId(statusId);
    setViewMode('status-detail');
    setIsBottomSheetOpen(true);
  };

  // Handle tab change
  const handleTabChange = (statusId: string) => {
    setActiveStatusId(statusId);
    if (viewMode === 'dashboard') {
      setViewMode('status-detail');
      setIsBottomSheetOpen(true);
    }
  };

  // Handle todo click
  const handleTodoClick = (todo: Todo) => {
    onTodoClick(todo); // Call the original handler
    setSelectedTodo(todo);
    setViewMode('todo-detail');
    // Keep bottom sheet open and show todo details
  };

  // Handle bottom sheet close
  const handleBottomSheetClose = () => {
    setIsBottomSheetOpen(false);
    setSelectedTodo(null);
    setViewMode('dashboard');
    if (isSelectionMode) {
      onExitSelectionMode();
    }
  };

  // Handle todo status change with visual feedback
  const handleTodoStatusChangeWithFeedback = (todoId: string, newStatus: string) => {
    onTodoStatusChange(todoId, newStatus);
    
    // If changing selected todo's status, update activeStatusId and selectedTodo
    if (selectedTodo?.id === todoId) {
      setActiveStatusId(newStatus);
      // Update the selected todo with new status
      setSelectedTodo(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Get current status
  const currentStatus = statuses.find(s => s.id === activeStatusId);

  // Get selected todo's current status for status switcher
  const selectedTodoStatus = selectedTodo?.status || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <MobileHeader
        user={user}
        completedCount={completedCount}
        showCompleted={showCompleted}
        onToggleCompleted={onToggleCompleted}
        onOpenSettings={onOpenSettings}
        onOpenAuth={onOpenAuth}
        onSignOut={onSignOut}
      />

      {/* Dashboard View */}
      {viewMode === 'dashboard' && (
        <>
          <MobileDashboard
            todos={todos}
            statuses={statuses}
            onStatusClick={handleStatusClick}
            onAddTodo={onAddTodo}
            showCompleted={showCompleted}
          />
          
          {/* Dashboard FAB */}
          <FloatingActionButton
            mode="add"
            onAddTodo={onAddTodo}
          />
        </>
      )}

      {/* Tab Navigation (shown when not in dashboard) */}
      {viewMode !== 'dashboard' && (
        <MobileTabNavigation
          statuses={statuses}
          todos={todos}
          activeTab={activeStatusId}
          onTabChange={handleTabChange}
          showCompleted={showCompleted}
        />
      )}

      {/* Bottom Sheet for Status Detail and Todo Detail */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={handleBottomSheetClose}
        title={
          viewMode === 'todo-detail' 
            ? selectedTodo?.title 
            : currentStatus?.label
        }
        snapPoints={[60, 95]}
        defaultSnapPoint={0}
      >
        {viewMode === 'status-detail' && currentStatus && (
          <>
            <MobileTodoList
              todos={todos}
              status={currentStatus}
              onTodoClick={handleTodoClick}
              onTodoCompletionToggle={onTodoCompletionToggle}
              showCompleted={showCompleted}
              isSelectionMode={isSelectionMode}
              selectedTodos={selectedTodos}
              onTodoSelection={onTodoSelection}
              onEnterSelectionMode={onEnterSelectionMode}
            />

            {/* Selection Mode FAB */}
            {isSelectionMode ? (
              <FloatingActionButton
                mode="selection"
                selectedCount={selectedTodos.size}
                onBulkComplete={onBulkComplete}
                onBulkDelete={onBulkDelete}
                onBulkMove={() => {
                  // Move all selected todos to next status
                  const nextStatusIndex = (statuses.findIndex(s => s.id === activeStatusId) + 1) % statuses.length;
                  const nextStatus = statuses[nextStatusIndex];
                  if (nextStatus) {
                    onBulkStatusChange(nextStatus.id);
                  }
                }}
                onExitSelection={onExitSelectionMode}
              />
            ) : (
              <FloatingActionButton
                mode="add"
                onAddTodo={onAddTodo}
              />
            )}
          </>
        )}

        {viewMode === 'todo-detail' && selectedTodo && (
          <>
            {/* Todo Details */}
            <div className="space-y-6">
              {/* Todo Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedTodo.title}
                  </h3>
                  {selectedTodo.description && (
                    <p className="mt-2 text-gray-600">
                      {selectedTodo.description}
                    </p>
                  )}
                </div>

                {/* Todo Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">{t('todo.status')}:</span>
                    <p className="font-medium">{currentStatus?.label}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('todo.completed')}:</span>
                    <p className="font-medium">
                      {selectedTodo.isCompleted ? t('common.yes') : t('common.no')}
                    </p>
                  </div>
                  {selectedTodo.dueDate && (
                    <div>
                      <span className="text-gray-500">{t('todo.dueDate')}:</span>
                      <p className="font-medium">
                        {new Date(selectedTodo.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">{t('todo.lastUpdated')}:</span>
                    <p className="font-medium">
                      {new Date(selectedTodo.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Status Switcher */}
              <QuickStatusSwitcher
                statuses={statuses}
                currentStatus={selectedTodoStatus}
                onStatusChange={(statusId) => 
                  handleTodoStatusChangeWithFeedback(selectedTodo.id, statusId)
                }
              />
            </div>

            {/* Todo Detail FAB */}
            <FloatingActionButton
              mode="todo-detail"
              onAddTodo={onAddTodo}
              onToggleComplete={() => onTodoCompletionToggle(selectedTodo.id)}
              onMoveTodo={() => {
                // Could show status switcher or move to next status
                const currentIndex = statuses.findIndex(s => s.id === selectedTodoStatus);
                const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                if (nextStatus) {
                  handleTodoStatusChangeWithFeedback(selectedTodo.id, nextStatus.id);
                }
              }}
              isCompleted={selectedTodo.isCompleted}
            />
          </>
        )}
      </BottomSheet>
    </div>
  );
}