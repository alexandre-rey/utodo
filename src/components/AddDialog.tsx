import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

interface AddDialogProps {
    onAddTodo: (values: { title: string; description: string }) => void;
}

export default function AddDialog({ onAddTodo }: AddDialogProps) {

    const [title, setTitle] = useState("New task");
    const [description, setDescription] = useState("");

    const onSaveClick = (e: React.FormEvent) => {

        if (title.trim() === "") {
            e.preventDefault();
            toast.error("Title is required");
            return;
        }

        onAddTodo({ title, description });
        setTitle("New task");
        setDescription("");
    }

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button variant="outline">Add</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add task</DialogTitle>
                        <DialogDescription>
                            Add a new task to your todo list. You can edit or delete it later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">Title</Label>
                            <Input id="name-1" name="name" defaultValue={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="username-1">Description</Label>
                            <Input id="username-1" name="username" placeholder="What should be done" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogTrigger asChild>
                            <Button type="submit" onClick={e => onSaveClick(e)}>Save</Button>
                        </DialogTrigger>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}