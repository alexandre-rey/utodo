import type { Todo } from "../interfaces/todo.interface";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import type { StatusConfig } from "../services/save";
import { useState } from "react";
import { Check, Calendar, AlertTriangle } from "lucide-react";

interface DisplayTodosProps {
    todos: Todo[];
    setSelectedTodo: (todo: Todo | null) => void;
    statuses: StatusConfig[];
    onTodoStatusChange: (todoId: string, newStatus: string) => void;
    onTodoCompletionToggle: (todoId: string) => void;
    showCompleted: boolean;
    searchQuery: string;
}

export default function DisplayTodos({ todos, setSelectedTodo, statuses, onTodoStatusChange, onTodoCompletionToggle, showCompleted, searchQuery }: DisplayTodosProps) {
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
                className="flex-1 min-w-80"
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(status.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status.id)}
            >
                <h3 className="text-lg font-semibold mb-4 text-center p-2 rounded-t-lg" style={{backgroundColor: status.color}}>
                    {status.label}
                </h3>
                <div className={`flex flex-col gap-4 min-h-96 p-2 rounded-b-lg transition-colors ${
                    isDropTarget ? 'bg-blue-100 border-2 border-blue-300 border-dashed' : 'bg-gray-50'
                }`}>
                    {statusTodos.map((todo) => {
                        const dueDateStatus = getDueDateStatus(todo.dueDate);
                        const isOverdue = dueDateStatus === 'overdue';
                        const isDueSoon = dueDateStatus === 'due-soon';
                        
                        return (
                            <Card 
                                key={todo.id} 
                                className={`p-4 cursor-grab hover:bg-gray-100 transition-opacity relative ${
                                    draggedTodo === todo.id ? 'opacity-50 cursor-grabbing' : ''
                                } ${todo.completed ? 'opacity-60 bg-green-50' : ''} ${
                                    isOverdue && !todo.completed ? 'border-l-4 border-l-red-500 bg-red-50' : ''
                                } ${isDueSoon && !todo.completed ? 'border-l-4 border-l-orange-500 bg-orange-50' : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, todo.id)}
                                onDragEnd={handleDragEnd}
                                onClick={() => {
                                    // Only open dialog if not dragging
                                    if (!draggedTodo) {
                                        setSelectedTodo(todo);
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className={`text-lg font-semibold ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                                                {todo.title}
                                            </h2>
                                            {isOverdue && !todo.completed && (
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                        <p className={`text-sm text-gray-600 h-16 overflow-clip mb-2 ${todo.completed ? 'line-through' : ''}`}>
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
                                    <Button
                                        variant={todo.completed ? "default" : "outline"}
                                        size="sm"
                                        className={`ml-2 ${todo.completed ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTodoCompletionToggle(todo.id);
                                        }}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                    {statusTodos.length === 0 && isDropTarget && (
                        <div className="text-center text-gray-400 py-8">
                            Drop todo here
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Filter statuses - we always show all statuses now since completion is separate
    const visibleStatuses = statuses;

    return (
        <div className="w-full mx-auto p-4" style={{ maxWidth: `${visibleStatuses.length * 22}rem` }}>
            <div className="flex gap-6 overflow-x-auto">
                {visibleStatuses.map(status => renderColumn(status))}
            </div>
        </div>
    )

}