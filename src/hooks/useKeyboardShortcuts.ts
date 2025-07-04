import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'kanban' | 'calendar';
  setViewMode: (mode: 'kanban' | 'calendar') => void;
  showCompleted: boolean;
  setShowCompleted: (show: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  isSelectionMode: boolean;
  setIsSelectionMode: (mode: boolean) => void;
  clearSelection: () => void;
  handleSelectAll: () => void;
  handleBulkDelete: () => void;
  selectedTodosSize: number;
}

export function useKeyboardShortcuts({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  showCompleted,
  setShowCompleted,
  setIsSettingsOpen,
  isSelectionMode,
  setIsSelectionMode,
  clearSelection,
  handleSelectAll,
  handleBulkDelete,
  selectedTodosSize
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search todos"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      
      // Ctrl+N or Cmd+N to focus new todo
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const addInput = document.querySelector('input[placeholder*="What needs to be done"]') as HTMLInputElement;
        if (addInput) {
          addInput.focus();
        }
      }
      
      // Ctrl+Shift+V or Cmd+Shift+V to toggle view mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        setViewMode(viewMode === 'kanban' ? 'calendar' : 'kanban');
      }
      
      // Ctrl+Shift+C or Cmd+Shift+C to toggle completed todos
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setShowCompleted(!showCompleted);
      }
      
      // Ctrl+, or Cmd+, to open settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
      
      // Escape to clear search or exit selection mode
      if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
        } else if (isSelectionMode) {
          clearSelection();
        }
      }
      
      // Ctrl+A or Cmd+A to select all visible todos
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setIsSelectionMode(true);
        handleSelectAll();
      }
      
      // Delete key to delete selected todos
      if (e.key === 'Delete' && selectedTodosSize > 0) {
        e.preventDefault();
        handleBulkDelete();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    showCompleted,
    setShowCompleted,
    setIsSettingsOpen,
    isSelectionMode,
    setIsSelectionMode,
    clearSelection,
    handleSelectAll,
    handleBulkDelete,
    selectedTodosSize
  ]);
}