import type { Todo } from "../interfaces/todo.interface";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Calendar, Square, CheckSquare } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useTodosContext } from '../contexts/TodosContext';
import { useAppUIContext } from '../contexts/AppContext';

export default function CalendarView() {
    const { 
        todos, 
        handleTodoCompletionToggle, 
        showCompleted, 
        searchQuery,
        isSelectionMode,
        selectedTodos,
        handleTodoSelection,
        setIsSelectionMode
    } = useTodosContext();
    const { setSelectedTodo } = useAppUIContext();
    const { t } = useTranslation();
    // Filter todos based on search and completion
    const filteredTodos = todos.filter(todo => {
        const shouldShow = showCompleted || !todo.completed;
        const matchesSearch = searchQuery === "" || 
            todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return shouldShow && matchesSearch;
    });

    // Group todos by due date
    const todosByDate = filteredTodos.reduce((acc, todo) => {
        if (!todo.dueDate) {
            if (!acc['no-date']) acc['no-date'] = [];
            acc['no-date'].push(todo);
        } else {
            const dateKey = new Date(todo.dueDate).toDateString();
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(todo);
        }
        return acc;
    }, {} as Record<string, Todo[]>);

    // Sort dates
    const sortedDates = Object.keys(todosByDate)
        .filter(key => key !== 'no-date')
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Helper function to format date display
    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return t('dates.today');
        if (date.toDateString() === tomorrow.toDateString()) return t('dates.tomorrow');
        if (date.toDateString() === yesterday.toDateString()) return t('dates.yesterday');
        
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const isOverdue = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-6 pb-8">
            <div className="space-y-8">
                {/* Overdue Section */}
                {sortedDates.some(date => isOverdue(date) && todosByDate[date].some(todo => !todo.completed)) && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-red-600 flex items-center gap-2">
                            {t('dates.overdue')}
                        </h3>
                        <div className="space-y-2">
                            {sortedDates
                                .filter(date => isOverdue(date))
                                .map(date => todosByDate[date].filter(todo => !todo.completed))
                                .flat()
                                .map(todo => (
                                    <Card 
                                        key={todo.id} 
                                        className={`p-4 transition-all duration-200 border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-pink-50 border-0 shadow-sm ${
                                            isSelectionMode 
                                                ? `cursor-pointer ${selectedTodos.has(todo.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`
                                                : 'cursor-pointer hover:shadow-md hover:scale-[1.01]'
                                        }`}
                                        onClick={() => {
                                            if (isSelectionMode) {
                                                handleTodoSelection(todo.id, !selectedTodos.has(todo.id));
                                            } else {
                                                setSelectedTodo(todo);
                                            }
                                        }}
                                        onContextMenu={(e) => {
                                            if (!isSelectionMode) {
                                                e.preventDefault();
                                                setIsSelectionMode(true);
                                                handleTodoSelection(todo.id, true);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            {/* Selection Checkbox */}
                                            {isSelectionMode && (
                                                <div>
                                                    {selectedTodos.has(todo.id) ? (
                                                        <CheckSquare className="h-5 w-5 text-blue-600" />
                                                    ) : (
                                                        <Square className="h-5 w-5 text-slate-400" />
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate">{todo.title}</h4>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {todo.description || t('todo.noDescription')}
                                                </p>
                                                <p className="text-xs text-red-600 mt-1">
                                                    {t('dates.due')}{new Date(todo.dueDate!).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!isSelectionMode && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-shrink-0 transition-all duration-200 border-0 shadow-sm hover:shadow-md hover:bg-slate-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTodoCompletionToggle(todo.id);
                                                    }}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                        </div>
                    </div>
                )}

                {/* Today and Future Dates */}
                {sortedDates
                    .filter(date => !isOverdue(date))
                    .map(date => (
                        <div key={date}>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                {formatDateHeader(date)}
                            </h3>
                            <div className="space-y-2">
                                {todosByDate[date].map(todo => (
                                    <Card 
                                        key={todo.id} 
                                        className={`p-4 transition-all duration-200 border-0 shadow-sm ${
                                            isSelectionMode 
                                                ? `cursor-pointer ${selectedTodos.has(todo.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`
                                                : 'cursor-pointer hover:shadow-md hover:scale-[1.01]'
                                        } ${todo.completed ? 'opacity-70 bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-white'}`}
                                        onClick={() => {
                                            if (isSelectionMode) {
                                                handleTodoSelection(todo.id, !selectedTodos.has(todo.id));
                                            } else {
                                                setSelectedTodo(todo);
                                            }
                                        }}
                                        onContextMenu={(e) => {
                                            if (!isSelectionMode) {
                                                e.preventDefault();
                                                setIsSelectionMode(true);
                                                handleTodoSelection(todo.id, true);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            {/* Selection Checkbox */}
                                            {isSelectionMode && (
                                                <div>
                                                    {selectedTodos.has(todo.id) ? (
                                                        <CheckSquare className="h-5 w-5 text-blue-600" />
                                                    ) : (
                                                        <Square className="h-5 w-5 text-slate-400" />
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-medium truncate ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                                                    {todo.title}
                                                </h4>
                                                <p className={`text-sm text-gray-600 truncate ${todo.completed ? 'line-through' : ''}`}>
                                                    {todo.description || t('todo.noDescription')}
                                                </p>
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
                                                        handleTodoCompletionToggle(todo.id);
                                                    }}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}

                {/* No Due Date Section */}
                {todosByDate['no-date'] && todosByDate['no-date'].length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-600 flex items-center gap-2">
                            {t('dates.noDueDate')}
                        </h3>
                        <div className="space-y-2">
                            {todosByDate['no-date'].map(todo => (
                                <Card 
                                    key={todo.id} 
                                    className={`p-4 transition-all duration-200 border-0 shadow-sm ${
                                        isSelectionMode 
                                            ? `cursor-pointer ${selectedTodos.has(todo.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`
                                            : 'cursor-pointer hover:shadow-md hover:scale-[1.01]'
                                    } ${todo.completed ? 'opacity-70 bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-white'}`}
                                    onClick={() => {
                                        if (isSelectionMode) {
                                            handleTodoSelection(todo.id, !selectedTodos.has(todo.id));
                                        } else {
                                            setSelectedTodo(todo);
                                        }
                                    }}
                                    onContextMenu={(e) => {
                                        if (!isSelectionMode) {
                                            e.preventDefault();
                                            setIsSelectionMode(true);
                                            handleTodoSelection(todo.id, true);
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        {/* Selection Checkbox */}
                                        {isSelectionMode && (
                                            <div>
                                                {selectedTodos.has(todo.id) ? (
                                                    <CheckSquare className="h-5 w-5 text-blue-600" />
                                                ) : (
                                                    <Square className="h-5 w-5 text-slate-400" />
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-medium truncate ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                                                {todo.title}
                                            </h4>
                                            <p className={`text-sm text-gray-600 truncate ${todo.completed ? 'line-through' : ''}`}>
                                                {todo.description || t('todo.noDescription')}
                                            </p>
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
                                                    handleTodoCompletionToggle(todo.id);
                                                }}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {Object.keys(todosByDate).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{t('messages.noTodos')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}