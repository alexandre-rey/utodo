import type { Todo } from "../interfaces/todo.interface";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import type { StatusConfig } from "../services/save";
import { useState } from "react";
import { Check, Calendar, AlertTriangle, Square, CheckSquare } from "lucide-react";

interface DisplayTodosProps {
    todos: Todo[];
    setSelectedTodo: (todo: Todo | null) => void;
    statuses: StatusConfig[];
    onTodoStatusChange: (todoId: string, newStatus: string) => void;
    onTodoCompletionToggle: (todoId: string) => void;
    showCompleted: boolean;
    searchQuery: string;
    isSelectionMode: boolean;
    selectedTodos: Set<string>;
    onTodoSelection: (todoId: string, isSelected: boolean) => void;
    onEnterSelectionMode: () => void;
}

export default function DisplayTodos({ 
    todos, 
    setSelectedTodo, 
    statuses, 
    onTodoStatusChange, 
    onTodoCompletionToggle, 
    showCompleted, 
    searchQuery, 
    isSelectionMode, 
    selectedTodos, 
    onTodoSelection, 
    onEnterSelectionMode 
}: DisplayTodosProps) {
    const [draggedTodo, setDraggedTodo] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    // Helper function to get due date status
    const getDueDateStatus = (dueDate?: Date) => {
        if (!dueDate) return null;
        
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 1) return 'due-soon';
        if (diffDays <= 3) return 'due-upcoming';
        return 'due-later';
    };

    // Helper function to format due date display
    const formatDueDate = (dueDate: Date) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        if (diffDays === -1) return "Yesterday";
        if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
        if (diffDays < 7) return `${diffDays} days`;
        
        return due.toLocaleDateString();
    };

    const handleDragStart = (e: React.DragEvent, todoId: string) => {
        setDraggedTodo(todoId);
        e.dataTransfer.setData("text/plain", todoId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = () => {
        setDraggedTodo(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragEnter = (statusId: string) => {
        setDragOverColumn(statusId);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only reset if we're leaving the column entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverColumn(null);
        }
    };

    const handleDrop = (e: React.DragEvent, newStatusId: string) => {
        e.preventDefault();
        const todoId = e.dataTransfer.getData("text/plain");
        
        if (todoId && todoId !== draggedTodo) return; // Safety check
        
        const todo = todos.find(t => t.id === todoId);
        if (todo && todo.status !== newStatusId) {
            onTodoStatusChange(todoId, newStatusId);
        }
        
        setDraggedTodo(null);
        setDragOverColumn(null);
    };

    const renderColumn = (status: StatusConfig) => {
        // Filter todos by status, completion state, and search query
        const statusTodos = todos.filter(todo => {
            const matchesStatus = todo.status === status.id;
            const shouldShow = showCompleted || !todo.completed;
            const matchesSearch = searchQuery === "" || 
                todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesStatus && shouldShow && matchesSearch;
        });
        
        const isDropTarget = dragOverColumn === status.id;
        
        return (
            <div 
                key={status.id} 
                className="flex-1 min-w-80 flex-shrink-0"
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(status.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status.id)}
            >
                <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border-0 overflow-hidden">
                    <h3 className="text-lg font-semibold mb-0 text-center p-4 text-white shadow-sm" style={{backgroundColor: status.color}}>
                        {status.label}
                        <span className="ml-2 text-sm font-normal opacity-80">({statusTodos.length})</span>
                    </h3>
                    <div className={`flex flex-col gap-3 min-h-96 p-4 transition-all duration-200 ${
                        isDropTarget ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : 'bg-transparent'
                    }`}>
                    {statusTodos.map((todo) => {
                        const dueDateStatus = getDueDateStatus(todo.dueDate);
                        const isOverdue = dueDateStatus === 'overdue';
                        const isDueSoon = dueDateStatus === 'due-soon';
                        
                        return (
                            <Card 
                                key={todo.id} 
                                className={`p-4 transition-all duration-200 relative bg-white border-0 shadow-sm ${
                                    isSelectionMode 
                                        ? `cursor-pointer ${selectedTodos.has(todo.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`
                                        : `cursor-grab hover:shadow-md hover:scale-[1.02] ${draggedTodo === todo.id ? 'opacity-50 cursor-grabbing scale-95' : ''}`
                                } ${todo.completed ? 'opacity-70 bg-gradient-to-r from-green-50 to-emerald-50' : ''} ${
                                    isOverdue && !todo.completed ? 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-pink-50' : ''
                                } ${isDueSoon && !todo.completed ? 'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-amber-50' : ''}`}
                                draggable={!isSelectionMode}
                                onDragStart={!isSelectionMode ? (e) => handleDragStart(e, todo.id) : undefined}
                                onDragEnd={!isSelectionMode ? handleDragEnd : undefined}
                                onClick={() => {
                                    if (isSelectionMode) {
                                        onTodoSelection(todo.id, !selectedTodos.has(todo.id));
                                    } else if (!draggedTodo) {
                                        setSelectedTodo(todo);
                                    }
                                }}
                                onContextMenu={(e) => {
                                    if (!isSelectionMode) {
                                        e.preventDefault();
                                        onEnterSelectionMode();
                                        onTodoSelection(todo.id, true);
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    {/* Selection Checkbox */}
                                    {isSelectionMode && (
                                        <div className="mt-1">
                                            {selectedTodos.has(todo.id) ? (
                                                <CheckSquare className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <Square className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className={`text-lg font-semibold truncate ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                                                {todo.title}
                                            </h2>
                                            {isOverdue && !todo.completed && (
                                                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className={`text-sm text-gray-600 h-16 overflow-hidden text-ellipsis mb-2 leading-relaxed ${todo.completed ? 'line-through' : ''}`}>
                                            {todo.description || "No description provided."}
                                        </p>
                                        {todo.dueDate && (
                                            <div className={`flex items-center gap-1 text-xs ${
                                                isOverdue && !todo.completed ? 'text-red-600 font-medium' :
                                                isDueSoon && !todo.completed ? 'text-orange-600 font-medium' :
                                                'text-gray-500'
                                            }`}>
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDueDate(todo.dueDate)}</span>
                                            </div>
                                        )}
                                    </div>
                                    {!isSelectionMode && (
                                        <Button
                                            variant={todo.completed ? "default" : "outline"}
                                            size="sm"
                                            className={`flex-shrink-0 transition-all duration-200 border-0 shadow-sm hover:shadow-md ${
                                                todo.completed ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'hover:bg-slate-100'
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onTodoCompletionToggle(todo.id);
                                            }}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                        {statusTodos.length === 0 && isDropTarget && (
                            <div className="text-center text-slate-400 py-8 text-sm">
                                Drop todo here
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Filter statuses - we always show all statuses now since completion is separate
    const visibleStatuses = statuses;

    return (
        <div className="w-full mx-auto px-6 pb-8" style={{ maxWidth: `${visibleStatuses.length * 22}rem` }}>
            <div className="flex gap-6 overflow-x-auto pb-4">
                {visibleStatuses.map(status => renderColumn(status))}
            </div>
        </div>
    );
}