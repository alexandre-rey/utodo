import type { Todo } from "../interfaces/todo.interface";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { useState, useEffect } from "react";
import type { StatusConfig } from "../services/save";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { sanitizeTodoContent } from "@/utils/sanitize";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';



interface OpenDialogProps {
    todo: Todo | null;
    closeDialog: () => void;
    deleteTodo: (id: string) => void;
    saveTodo: (todo: Todo) => void;
    statuses: StatusConfig[];
}

export default function OpenDialog({ todo, closeDialog, deleteTodo, saveTodo, statuses }: OpenDialogProps) {
    const { t } = useTranslation();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (todo) {
            setTitle(todo.title);
            setDescription(todo.description || "");
            setStatus(todo.status);
            setDueDate(todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : "");
            setIsEditing(false); // Reset to view mode when opening a new todo
        }
    }, [todo]);

    const handleSave = () => {
        if (todo) {
            try {
                const sanitizedTitle = sanitizeTodoContent(title);
                const sanitizedDescription = sanitizeTodoContent(description);
                
                if (!sanitizedTitle) {
                    toast.error(t('errors.titleRequired'));
                    return;
                }
                
                const updatedTodo = {
                    ...todo,
                    title: sanitizedTitle,
                    description: sanitizedDescription,
                    status,
                    dueDate: dueDate ? new Date(dueDate) : undefined
                };
                saveTodo(updatedTodo);
                setIsEditing(false); // Return to view mode after saving
            } catch (error) {
                const message = error instanceof Error ? error.message : t('errors.invalidInput');
                toast.error(message);
            }
        }
    };

    const handleCancel = () => {
        if (todo) {
            // Reset to original values
            setTitle(todo.title);
            setDescription(todo.description || "");
            setStatus(todo.status);
            setDueDate(todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : "");
            setIsEditing(false);
        }
    };

    const getStatusDisplay = (statusId: string) => {
        const statusConfig = statuses.find(s => s.id === statusId);
        return statusConfig ? statusConfig.label : statusId;
    };

    const getStatusColor = (statusId: string) => {
        const statusConfig = statuses.find(s => s.id === statusId);
        return statusConfig ? statusConfig.color : "#e5e7eb";
    };

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

    const formatDueDate = (dueDate: Date) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return t('dates.today');
        if (diffDays === 1) return t('dates.tomorrow');
        if (diffDays === -1) return t('dates.yesterday');
        if (diffDays < -1) return `${Math.abs(diffDays)} ${t('dates.daysOverdue')}`;
        if (diffDays < 7) return `${diffDays} ${t('dates.days')}`;
        
        return due.toLocaleDateString();
    };

    return (
        <Dialog open={todo !== null} onOpenChange={(open) => {
            if (!open) {
                closeDialog();
            }
        }}>
            <form>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? t('dialogs.editTodo') : todo?.title}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? t('dialogs.editTodoDesc') : t('dialogs.todoDetails')}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {!isEditing ? (
                        // View Mode
                        <div className="space-y-6 py-6">
                            {/* Completion Status */}
                            <Card className="p-4 border-0 bg-gradient-to-r from-slate-50 to-blue-50">
                                <div className="flex items-center gap-3">
                                    {todo?.completed ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-slate-400" />
                                    )}
                                    <div>
                                        <p className="font-medium text-slate-800">
                                            {todo?.completed ? t('todo.completed') : t('todo.inProgress')}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {todo?.completed ? t('todo.taskCompleted') : t('todo.taskPending')}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Description */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                                    {t('sections.description')}
                                </Label>
                                <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-sm">
                                    <p className="text-slate-700 leading-relaxed">
                                        {todo?.description || t('todo.noDescription')}
                                    </p>
                                </Card>
                            </div>

                            {/* Status */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                                    {t('sections.priority')}
                                </Label>
                                <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-4 h-4 rounded-full shadow-sm"
                                            style={{ backgroundColor: getStatusColor(todo?.status || "") }}
                                        />
                                        <span className="font-medium text-slate-800">
                                            {getStatusDisplay(todo?.status || "")}
                                        </span>
                                    </div>
                                </Card>
                            </div>

                            {/* Due Date */}
                            {todo?.dueDate && (
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                                        {t('sections.dueDate')}
                                    </Label>
                                    <Card className={`p-4 border-0 shadow-sm ${
                                        getDueDateStatus(todo.dueDate) === 'overdue' && !todo.completed ? 'bg-gradient-to-r from-red-50 to-pink-50' :
                                        getDueDateStatus(todo.dueDate) === 'due-soon' && !todo.completed ? 'bg-gradient-to-r from-orange-50 to-amber-50' :
                                        'bg-white/60 backdrop-blur-sm'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            {getDueDateStatus(todo.dueDate) === 'overdue' && !todo.completed ? (
                                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                            ) : (
                                                <Calendar className="h-5 w-5 text-slate-600" />
                                            )}
                                            <div>
                                                <p className={`font-medium ${
                                                    getDueDateStatus(todo.dueDate) === 'overdue' && !todo.completed ? 'text-red-700' :
                                                    getDueDateStatus(todo.dueDate) === 'due-soon' && !todo.completed ? 'text-orange-700' :
                                                    'text-slate-800'
                                                }`}>
                                                    {formatDueDate(todo.dueDate)}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    {new Date(todo.dueDate).toLocaleDateString('en-US', { 
                                                        weekday: 'long', 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {t('todo.createdAt')}
                                    </Label>
                                    <Card className="p-3 bg-white/40 backdrop-blur-sm border-0 shadow-sm">
                                        <p className="text-sm text-slate-700">
                                            {todo?.createdAt ? new Date(todo.createdAt).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric', 
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : ""}
                                        </p>
                                    </Card>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {t('todo.lastUpdated')}
                                    </Label>
                                    <Card className="p-3 bg-white/40 backdrop-blur-sm border-0 shadow-sm">
                                        <p className="text-sm text-slate-700">
                                            {todo?.updatedAt ? new Date(todo.updatedAt).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric', 
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : ""}
                                        </p>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Edit Mode
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="title">{t('todo.title')}</Label>
                                <Input 
                                    id="title" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="description">{t('todo.description')}</Label>
                                <Input 
                                    id="description" 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('placeholders.whatShouldBeDone')}
                                />
                            </div>
                            <div className="flex flex-row gap-2">
                                <Label>{t('actions.statusColon')}</Label>
                                <Select onValueChange={(value) => setStatus(value)} value={status}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={t('placeholders.updateStatus')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map(statusConfig => (
                                            <SelectItem key={statusConfig.id} value={statusConfig.id}>
                                                {statusConfig.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="due-date">{t('todo.dueDate')}</Label>
                                <Input
                                    id="due-date"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        {!isEditing ? (
                            // View Mode Buttons
                            <>
                                <Button 
                                    variant="destructive" 
                                    className="transition-all duration-200 hover:scale-105"
                                    onClick={() => {
                                        if (todo) {
                                            deleteTodo(todo.id);
                                            closeDialog();
                                        }
                                    }}
                                >
                                    {t('actions.delete')}
                                </Button>
                                <Button 
                                    variant="default" 
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105"
                                    onClick={() => setIsEditing(true)}
                                >
                                    {t('actions.edit')}
                                </Button>
                            </>
                        ) : (
                            // Edit Mode Buttons
                            <>
                                <Button 
                                    variant="outline" 
                                    className="transition-all duration-200 hover:scale-105"
                                    onClick={handleCancel}
                                >
                                    {t('actions.cancel')}
                                </Button>
                                <Button 
                                    variant="default" 
                                    className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 transition-all duration-200 hover:scale-105"
                                    onClick={handleSave}
                                >
                                    {t('actions.save')}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}