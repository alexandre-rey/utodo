import { useState, useRef, useEffect, useCallback } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
import type { StatusConfig } from '../services/save';
import type { Todo } from '../interfaces/todo.interface';

interface MobileTabNavigationProps {
  statuses: StatusConfig[];
  todos: Todo[];
  activeTab: string;
  onTabChange: (statusId: string) => void;
  showCompleted: boolean;
}

export default function MobileTabNavigation({ 
  statuses, 
  todos, 
  activeTab, 
  onTabChange,
  showCompleted 
}: MobileTabNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Calculate todo count for each status
  const getTodoCount = (statusId: string) => {
    return todos.filter(todo => {
      if (!showCompleted && todo.completed) return false;
      return todo.status === statusId;
    }).length;
  };

  // Handle scroll to check arrow visibility
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Scroll to specific direction
  const scrollTabs = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 120; // Approximate tab width
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  // Scroll active tab into view
  const scrollToActiveTab = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const activeTabElement = container.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
    if (!activeTabElement) return;

    const containerRect = container.getBoundingClientRect();
    const tabRect = activeTabElement.getBoundingClientRect();

    if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
      activeTabElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeTab]);

  useEffect(() => {
    handleScroll();
    scrollToActiveTab();
  }, [activeTab, scrollToActiveTab]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle touch/swipe gestures
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = statuses.findIndex(status => status.id === activeTab);
      
      if (isLeftSwipe && currentIndex < statuses.length - 1) {
        onTabChange(statuses[currentIndex + 1].id);
      } else if (isRightSwipe && currentIndex > 0) {
        onTabChange(statuses[currentIndex - 1].id);
      }
    }
  };

  return (
    <div className="relative bg-white border-b border-gray-200 sticky top-0 z-40">
      {/* Left scroll arrow */}
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-50 h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-md"
          onClick={() => scrollTabs('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Tab container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide px-4 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex space-x-1 min-w-max">
          {statuses.map((status) => {
            const count = getTodoCount(status.id);
            const isActive = activeTab === status.id;

            return (
              <button
                key={status.id}
                data-tab-id={status.id}
                onClick={() => onTabChange(status.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200 whitespace-nowrap min-h-[44px] min-w-[80px]
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }
                `}
              >
                {/* Status color indicator */}
                <div 
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? 'ring-2 ring-blue-300' : ''}`}
                  style={{ backgroundColor: status.color }}
                />
                
                {/* Status label */}
                <span className="truncate max-w-[100px]">
                  {status.label}
                </span>
                
                {/* Todo count badge */}
                {count > 0 && (
                  <Badge 
                    variant={isActive ? "default" : "secondary"}
                    className={`h-5 min-w-[20px] text-xs px-1.5 ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right scroll arrow */}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-50 h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-md"
          onClick={() => scrollTabs('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Swipe indicator (subtle) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gray-300 rounded-full opacity-30" />
    </div>
  );
}