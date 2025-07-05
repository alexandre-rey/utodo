import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { PlusCircle } from "lucide-react";
import { sanitizeTodoContent } from "@/utils/sanitize";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface QuickAddProps {
    onAddTodo: (values: { title: string; description: string }) => void;
}

export default function QuickAdd({ onAddTodo }: QuickAddProps) {
    const { t } = useTranslation();
    const [title, setTitle] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const sanitizedTitle = sanitizeTodoContent(title);
            const sanitizedDescription = sanitizeTodoContent(description);
            
            if (sanitizedTitle) {
                onAddTodo({ title: sanitizedTitle, description: sanitizedDescription });
                setTitle("");
                setDescription("");
                setIsExpanded(false);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : t('errors.invalidInput');
            toast.error(message);
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (title.trim()) {
                handleSubmit(e);
            }
        } else if (e.key === "Escape") {
            setTitle("");
            setDescription("");
            setIsExpanded(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mb-8 px-6">
            <Card className="p-6 shadow-sm bg-white/70 backdrop-blur-sm border-0 hover:shadow-md transition-all duration-200">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-3">
                        <Input
                            type="text"
                            placeholder={t('placeholders.whatNeedsDone')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleTitleKeyDown}
                            onFocus={() => setIsExpanded(true)}
                            className="flex-1 text-base border-0 bg-transparent focus:bg-white rounded-lg shadow-none focus:shadow-sm transition-all duration-200 py-3"
                        />
                        <Button 
                            type="submit" 
                            disabled={!title.trim()}
                            className="px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg border-0"
                        >
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    {isExpanded && (
                        <div className="animate-in slide-in-from-top-2 duration-200 flex gap-3">
                            <Input
                                type="text"
                                placeholder={t('placeholders.addDescriptionOptional')}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        if (title.trim()) {
                                            handleSubmit(e);
                                        }
                                    } else if (e.key === "Escape") {
                                        setDescription("");
                                        setIsExpanded(false);
                                    }
                                }}
                                className="flex-1 text-sm border-0 bg-transparent focus:bg-white rounded-lg shadow-none focus:shadow-sm transition-all duration-200 py-2"
                            />
                            <Button 
                                type="button" 
                                variant="ghost"
                                onClick={() => {
                                    setDescription("");
                                    setIsExpanded(false);
                                }}
                                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
                            >
                                {t('actions.cancel')}
                            </Button>
                        </div>
                    )}
                </form>
            </Card>
        </div>
    );
}