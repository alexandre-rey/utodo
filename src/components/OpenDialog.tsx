import { statuses } from "../data/status";
import type { Todo } from "../interfaces/todo.interface";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";



interface OpenDialogProps {
    todo: Todo | null;
    closeDialog: () => void;
    deleteTodo: (id: string) => void;
    saveTodo: (todo: Todo) => void;
}

export default function OpenDialog({ todo, closeDialog, deleteTodo, saveTodo }: OpenDialogProps) {

    return (
        <Dialog open={todo !== null} onOpenChange={(open) => {
            if (!open) {
                closeDialog();
            }
        }}>
            <form>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{todo?.title}</DialogTitle>
                        <DialogDescription>
                            <Label>{todo?.description || "No description provided."}</Label>
                        </DialogDescription>
                    </DialogHeader>
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                statuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => {
                            if (todo) {
                                deleteTodo(todo.id);
                            }
                        }}>
                            Delete
                        </Button>
                        <Button variant="default" onClick={() => {
                            if (todo) {
                                saveTodo(todo);
                            }
                        }}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}