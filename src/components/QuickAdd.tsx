import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { PlusCircle } from "lucide-react";

interface QuickAddProps {
    onAddTodo: (values: { title: string; description: string }) => void;
}

export default function QuickAdd({ onAddTodo }: QuickAddProps) {
    const [title, setTitle] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAddTodo({ title: title.trim(), description: description.trim() });
            setTitle("");
            setDescription("");
            setIsExpanded(false);
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
                            placeholder="What needs to be done?"
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
                                placeholder="Add description (optional)..."
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
                                Cancel
                            </Button>
                        </div>
                    )}
                </form>
            </Card>
        </div>
    );
}