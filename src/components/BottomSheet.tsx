import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus } from 'lucide-react';
import { Button } from './ui/button';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[]; // Percentage heights [50, 90] for example
  defaultSnapPoint?: number; // Index of default snap point
}

export default function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children,
  snapPoints = [50, 90],
  defaultSnapPoint = 0
}: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSnapPoint, setCurrentSnapPoint] = useState(defaultSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ y: number; height: number } | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentHeight = snapPoints[currentSnapPoint];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle touch events for dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      y: touch.clientY,
      height: currentHeight
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStart || !sheetRef.current) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStart.y;
    const viewportHeight = window.innerHeight;
    
    // Calculate new height percentage
    const deltaPercentage = (deltaY / viewportHeight) * 100;
    const newHeight = Math.max(10, Math.min(95, dragStart.height - deltaPercentage));
    
    // Apply the new height directly during drag
    sheetRef.current.style.height = `${newHeight}vh`;
  };

  const handleTouchEnd = () => {
    if (!isDragging || !sheetRef.current) return;

    setIsDragging(false);
    setDragStart(null);

    const currentHeightVh = parseFloat(sheetRef.current.style.height || '0');
    
    // Find the closest snap point
    let closestSnapIndex = 0;
    let closestDistance = Math.abs(snapPoints[0] - currentHeightVh);
    
    snapPoints.forEach((snapPoint, index) => {
      const distance = Math.abs(snapPoint - currentHeightVh);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSnapIndex = index;
      }
    });

    // If dragged down significantly from the lowest snap point, close
    if (currentHeightVh < snapPoints[0] - 10) {
      onClose();
      return;
    }

    // Snap to the closest point
    setCurrentSnapPoint(closestSnapIndex);
    sheetRef.current.style.height = `${snapPoints[closestSnapIndex]}vh`;
  };

  // Handle mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      y: e.clientY,
      height: currentHeight
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart || !sheetRef.current) return;

    const deltaY = e.clientY - dragStart.y;
    const viewportHeight = window.innerHeight;
    const deltaPercentage = (deltaY / viewportHeight) * 100;
    const newHeight = Math.max(10, Math.min(95, dragStart.height - deltaPercentage));
    
    sheetRef.current.style.height = `${newHeight}vh`;
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !sheetRef.current) return;

    setIsDragging(false);
    setDragStart(null);

    const currentHeightVh = parseFloat(sheetRef.current.style.height || '0');
    
    let closestSnapIndex = 0;
    let closestDistance = Math.abs(snapPoints[0] - currentHeightVh);
    
    snapPoints.forEach((snapPoint, index) => {
      const distance = Math.abs(snapPoint - currentHeightVh);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSnapIndex = index;
      }
    });

    if (currentHeightVh < snapPoints[0] - 10) {
      onClose();
      return;
    }

    setCurrentSnapPoint(closestSnapIndex);
    sheetRef.current.style.height = `${snapPoints[closestSnapIndex]}vh`;
  }, [isDragging, snapPoints, onClose]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleOverlayClick}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          height: `${currentHeight}vh`,
          maxHeight: '95vh',
          minHeight: '200px'
        }}
      >
        {/* Drag Handle Area */}
        <div
          className="sticky top-0 z-10 bg-white rounded-t-3xl border-b border-gray-100"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          {/* Visual drag handle */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-4">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            <div className="flex items-center space-x-2">
              {/* Snap point indicator */}
              {snapPoints.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const nextSnapPoint = (currentSnapPoint + 1) % snapPoints.length;
                    setCurrentSnapPoint(nextSnapPoint);
                    if (sheetRef.current) {
                      sheetRef.current.style.height = `${snapPoints[nextSnapPoint]}vh`;
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}