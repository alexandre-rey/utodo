import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface AddDialogProps {
    onAddTodo: (values: { title: string; description: string }) => void;
}

export default function AddDialog({ onAddTodo }: AddDialogProps) {
    const { t } = useTranslation();
    const [title, setTitle] = useState(t('todo.newTask'));
    const [description, setDescription] = useState("");

    const onSaveClick = (e: React.FormEvent) => {

        if (title.trim() === "") {
            e.preventDefault();
            toast.error(t('errors.titleRequired'));
            return;
        }

        onAddTodo({ title, description });
        setTitle(t('todo.newTask'));
        setDescription("");
    }

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button variant="outline">{t('actions.add')}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('dialogs.addTask')}</DialogTitle>
                        <DialogDescription>
                            {t('dialogs.addTaskDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">{t('todo.title')}</Label>
                            <Input id="name-1" name="name" defaultValue={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="username-1">{t('todo.description')}</Label>
                            <Input id="username-1" name="username" placeholder={t('placeholders.whatShouldBeDone')} value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('actions.cancel')}</Button>
                        </DialogClose>
                        <DialogTrigger asChild>
                            <Button type="submit" onClick={e => onSaveClick(e)}>{t('actions.save')}</Button>
                        </DialogTrigger>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}