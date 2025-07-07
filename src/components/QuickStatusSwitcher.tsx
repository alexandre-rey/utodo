import { useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StatusConfig } from '../services/save';

interface QuickStatusSwitcherProps {
  statuses: StatusConfig[];
  currentStatus: string;
  onStatusChange: (statusId: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function QuickStatusSwitcher({
  statuses,
  currentStatus,
  onStatusChange,
  disabled = false,
  className = ''
}: QuickStatusSwitcherProps) {
  const { t } = useTranslation();
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const handleStatusChange = (statusId: string) => {
    if (disabled || statusId === currentStatus) return;

    onStatusChange(statusId);
    
    // Show feedback animation
    setShowFeedback(statusId);
    setTimeout(() => setShowFeedback(null), 1000);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700">
        {t('todo.quickStatusChange')}
      </h4>
      
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => {
          const isActive = currentStatus === status.id;
          const isChanging = showFeedback === status.id;

          return (
            <button
              key={status.id}
              onClick={() => handleStatusChange(status.id)}
              disabled={disabled}
              className={`
                relative flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 min-h-[48px] min-w-[100px]
                ${disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer active:scale-95'
                }
                ${isActive
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300 shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                }
                ${isChanging ? 'scale-105 shadow-lg' : ''}
              `}
            >
              {/* Status color indicator */}
              <div 
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  isActive ? 'ring-2 ring-blue-300' : ''
                }`}
                style={{ backgroundColor: status.color }}
              />
              
              {/* Status label */}
              <span className="truncate flex-1 text-center">
                {status.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
              
              {/* Change feedback */}
              {isChanging && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-100 rounded-xl">
                  <div className="flex items-center space-x-1 text-green-700">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-medium">{t('actions.changed')}</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Undo option (appears briefly after change) */}
      {showFeedback && showFeedback !== currentStatus && (
        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              const previousStatus = statuses.find(s => s.id === currentStatus);
              if (previousStatus) {
                onStatusChange(currentStatus);
                setShowFeedback(null);
              }
            }}
            className="text-xs text-blue-600 hover:text-blue-800 underline py-1 px-2 rounded"
          >
            {t('actions.undo')}
          </button>
        </div>
      )}
    </div>
  );
}