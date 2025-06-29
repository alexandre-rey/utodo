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



interface OpenDialogProps {
    todo: Todo | null;
    closeDialog: () => void;
    deleteTodo: (id: string) => void;
    saveTodo: (todo: Todo) => void;
    statuses: StatusConfig[];
}

export default function OpenDialog({ todo, closeDialog, deleteTodo, saveTodo, statuses }: OpenDialogProps) {
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
            const updatedTodo = {
                ...todo,
                title,
                description,
                status,
                dueDate: dueDate ? new Date(dueDate) : undefined
            };
            saveTodo(updatedTodo);
            setIsEditing(false); // Return to view mode after saving
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
        
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        if (diffDays === -1) return "Yesterday";
        if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
        if (diffDays < 7) return `${diffDays} days`;
        
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
                        <DialogTitle>{isEditing ? "Edit Todo" : todo?.title}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Make changes to your todo item below." : "Todo details"}
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
                                            {todo?.completed ? "Completed" : "In Progress"}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {todo?.completed ? "This task has been completed" : "This task is still pending"}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Description */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                                    📝 Description
                                </Label>
                                <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-sm">
                                    <p className="text-slate-700 leading-relaxed">
                                        {todo?.description || "No description provided."}
                                    </p>
                                </Card>
                            </div>

                            {/* Status */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                                    🏷️ Priority Status
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
                                        📅 Due Date
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
                                        Created
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
                                        Last Updated
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
                                <Label htmlFor="title">Title</Label>
                                <Input 
                                    id="title" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="description">Description</Label>
                                <Input 
                                    id="description" 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What should be done"
                                />
                            </div>
                            <div className="flex flex-row gap-2">
                                <Label>Status:</Label>
                                <Select onValueChange={(value) => setStatus(value)} value={status}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Update status" />
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
                                <Label htmlFor="due-date">Due Date (optional)</Label>
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
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                                <Button 
                                    variant="default" 
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit
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
                                    Cancel
                                </Button>
                                <Button 
                                    variant="default" 
                                    className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 transition-all duration-200 hover:scale-105"
                                    onClick={handleSave}
                                >
                                    Save
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}