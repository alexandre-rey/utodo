import type { Todo } from "../interfaces/todo.interface";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState, useEffect } from "react";
import type { StatusConfig } from "../services/save";



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
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label className="font-semibold">Description</Label>
                                <p className="text-sm text-gray-600">{todo?.description || "No description provided."}</p>
                            </div>
                            <div className="grid gap-2">
                                <Label className="font-semibold">Status</Label>
                                <p className="text-sm">{getStatusDisplay(todo?.status || "")}</p>
                            </div>
                            <div className="grid gap-2">
                                <Label className="font-semibold">Created</Label>
                                <p className="text-sm text-gray-500">{todo?.createdAt ? new Date(todo.createdAt).toLocaleDateString() : ""}</p>
                            </div>
                            <div className="grid gap-2">
                                <Label className="font-semibold">Last Updated</Label>
                                <p className="text-sm text-gray-500">{todo?.updatedAt ? new Date(todo.updatedAt).toLocaleDateString() : ""}</p>
                            </div>
                            {todo?.dueDate && (
                                <div className="grid gap-2">
                                    <Label className="font-semibold">Due Date</Label>
                                    <p className="text-sm text-gray-600">{new Date(todo.dueDate).toLocaleDateString()}</p>
                                </div>
                            )}
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
                                <Button variant="destructive" onClick={() => {
                                    if (todo) {
                                        deleteTodo(todo.id);
                                    }
                                }}>
                                    Delete
                                </Button>
                                <Button variant="default" onClick={() => setIsEditing(true)}>Edit</Button>
                            </>
                        ) : (
                            // Edit Mode Buttons
                            <>
                                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                <Button variant="default" onClick={handleSave}>Save</Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}