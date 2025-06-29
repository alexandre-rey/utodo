import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

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
        <div className="w-full max-w-2xl mb-6">
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Add a todo..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        onFocus={() => setIsExpanded(true)}
                        className="flex-1"
                    />
                    <Button 
                        type="submit" 
                        disabled={!title.trim()}
                        className="px-3"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                
                {isExpanded && (
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Description (optional)..."
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
                            className="flex-1"
                        />
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                                setDescription("");
                                setIsExpanded(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}