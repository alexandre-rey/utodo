import type { Todo } from "../interfaces/todo.interface";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";



interface OpenDialogProps {
    todo: Todo | null;
    closeDialog: () => void;
    deleteTodo: (id: string) => void;
}

export default function OpenDialog({ todo, closeDialog, deleteTodo }: OpenDialogProps) {

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
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                        </div>
                        <div className="grid gap-3">
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => {
                            if (todo) {
                                deleteTodo(todo.id);
                            }
                        }}>
                            Delete
                        </Button>
                         <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}