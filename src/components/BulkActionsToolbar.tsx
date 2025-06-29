import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { CheckSquare, Trash2, X, Tag } from "lucide-react";
import type { StatusConfig } from "../services/save";

interface BulkActionsToolbarProps {
    selectedCount: number;
    onSelectAll: () => void;
    onClearSelection: () => void;
    onBulkDelete: () => void;
    onBulkComplete: () => void;
    onBulkStatusChange: (status: string) => void;
    statuses: StatusConfig[];
    allSelected: boolean;
}

export default function BulkActionsToolbar({
    selectedCount,
    onSelectAll,
    onClearSelection,
    onBulkDelete,
    onBulkComplete,
    onBulkStatusChange,
    statuses,
    allSelected
}: BulkActionsToolbarProps) {
    if (selectedCount === 0) return null;

    return (
        <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-4 p-4">
                {/* Selection Info */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">
                        {selectedCount} selected
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={allSelected ? onClearSelection : onSelectAll}
                        className="text-xs h-6 px-2"
                    >
                        {allSelected ? "Deselect All" : "Select All"}
                    </Button>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-slate-300" />

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Complete Selected */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBulkComplete}
                        className="flex items-center gap-2 text-green-700 hover:bg-green-50"
                    >
                        <CheckSquare className="h-4 w-4" />
                        Complete
                    </Button>

                    {/* Change Status */}
                    <Select onValueChange={onBulkStatusChange}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                            <div className="flex items-center gap-2">
                                <Tag className="h-3 w-3" />
                                <SelectValue placeholder="Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {statuses.map(status => (
                                <SelectItem key={status.id} value={status.id}>
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: status.color }}
                                        />
                                        {status.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Delete Selected */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBulkDelete}
                        className="flex items-center gap-2 text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                </div>

                {/* Close */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClearSelection}
                    className="h-6 w-6 ml-2"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        </Card>
    );
}